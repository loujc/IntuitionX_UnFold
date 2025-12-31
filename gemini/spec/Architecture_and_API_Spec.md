# IntuitionX Backend Architecture & API Spec (V5 - Hackathon Simplified)

## 1. 技术栈选型 (Technology Stack)

*   **Language**: Python 3.10+
*   **Web Framework**: **FastAPI** (Single Process)
*   **LLM Client**: **OpenAI Python SDK** (`openai`)
    *   *配置*: 兼容任意 OpenAI-Correction 接口 (如 DeepSeek, Moonshot, Local LLM)。
*   **ASR**: **Faster-Whisper** / **MLX-Whisper**
*   **Video Processing**: **FFmpeg** (via `subprocess` or `ffmpeg-python`)
*   **Queue & Event Bus**: **Python Native (`asyncio`)**
    *   *变更*: 为了 Demo 极速启动，移除 Redis。使用内存队列 (`asyncio.Queue`) 和全局单例模式管理状态。
    *   *限制*: 只能单进程启动 (`python main.py` or `uvicorn workers=1`)，重启服务会丢失任务。Hackathon 场景可接受。
*   **Database**: **SQLite** + **SQLAlchemy** (用于持久化 Task 记录)

## 2. 系统架构设计 (Single-Process Monolith)

我们将所有组件打包在一个 Python 进程中，利用 `asyncio` 实现并发。

### 2.1 模块划分
1.  **FastAPI App**: 处理 HTTP 请求和 SSE 推送。
2.  **JobManager (Singleton)**:
    *   `tasks: Dict[str, TaskModel]`: 内存中存储所有任务状态。
    *   `event_queues: Dict[str, List[asyncio.Queue]]`: 为每个 SSE 连接维护一个消息队列，实现简单的 Pub/Sub。
    *   `worker_task`: 一个后台 `asyncio.Task`，不断从 `job_queue` 取任务执行。
3.  **VideoSplitter**: 
    *   负责调用 FFmpeg 将长视频切分为 `config.processing.chunk_duration` (默认 300s) 的音频段。
4.  **Executors**:
    *   **ASR Worker**: 调用 Whisper ASR，必须放入 `ThreadPoolExecutor` (或独立 ProcessPool，视 Mac 显存管理而定)，限制并发数。
    *   **LLM Worker**: 纯/IO Bound，直接 Async await。

## 3. 接口定义 (API Specification)

**Base Path**: `/api/v1`

### 3.1 任务管理
1.  **Upload**: `POST /api/v1/tasks`
    *   **Parameters** (Multipart):
        *   `file`: Video File (Required)
        *   `mode`: Enum["simple", "deep"] (Default: "simple")
        *   `video_type`: String (Optional, e.g., "History", "Anime")
    *   **Response**: `{"task_id": "...", "status": "queued"}`
    *   *Logic*: 存文件 -> 创建 Task 对象 (含 mode/type) -> `job_queue.put(task_id)`。
2.  **Get Status**: `GET /api/v1/tasks/{task_id}`
3.  **Get Result**: `GET /api/v1/tasks/{task_id}/result`

### 3.2 实时流 (SSE)
**Endpoint**: `GET /api/v1/tasks/{task_id}/events`
*   *Implementation*: 
    *   Client 连接时，后端创建一个 `asyncio.Queue` 并注册到 `JobManager`。
    *   Worker 产生进度/结果 (如 "Segment 1 processed") 时，推送消息。
    *   Endpoint 通过 `yield` 不断推送 Queue 中的消息。

## 4. 关键策略 & 配置 (Configuration)

配置项统一管理 (e.g., `config.yaml`)：

```yaml
system:
  video_types: ["History", "Anime", "Finance", "Course"] # 可扩展
  default_mode: "simple"

processing:
  enable_chunking: true
  chunk_duration: 300        # 切片时长 (秒)
  max_asr_workers: 1         # 显存保护，通常设为 1
  llm_concurrency: 5         # LLM 并发度
```

## 5. 数据库模型 (Schema)
*   保持 SQLite，用于持久化 Task 记录 (防止重启后连也就是查不到历史记录了，虽然内存状态丢了，但库里至少有记录)。
*   Task 表增加 `mode` 和 `video_type` 字段。
