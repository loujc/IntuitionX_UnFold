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

### 3.1 创建任务
**POST** `/tasks`（multipart/form-data）  
字段：
- `file`：视频文件（必填）
- `mode`：`simple | deep`（可选，默认 `simple`）
- `video_type`：字符串提示（可选，如 `History`）

响应示例：
```json
{ "task_id": "uuid", "status": "queued" }
```

### 3.2 任务状态
**GET** `/tasks/{task_id}`  
响应示例：
```json
{
  "task_id": "uuid",
  "status": "queued|running|finished|failed",
  "stage": "slicing|asr|merge|llm_summary|llm_keywords|finalize|",
  "error": null
}
```

### 3.3 结果与调试
**GET** `/tasks/{task_id}/result`  
返回 clean result（不含 raw/timing）。

**GET** `/tasks/{task_id}/raw`（调试）  
返回 LLM/ASR 原始输出的聚合 JSON（TaskRaw）。

**GET** `/tasks/{task_id}/timing`（调试）  
```json
{
  "items": [
    { "stage": "merge", "elapsed_ms": 1200 }
  ]
}
```

### 3.4 字幕读取
**GET** `/tasks/{task_id}/segments`  
```json
{
  "items": [
    { "segment_id": "seg_000001", "index": 0, "start": 0.0, "end": 2.4, "text": "..." }
  ]
}
```

**GET** `/tasks/{task_id}/segments/{segment_id}`  
```json
{ "segment_id": "seg_000001", "index": 0, "start": 0.0, "end": 2.4, "text": "..." }
```

### 3.5 实时流（SSE）
**GET** `/tasks/{task_id}/events`  
事件帧格式：
```
event: <event_type>
data: <json>
```

事件类型与 payload：
- `task_status`  
  ```json
  { "task_id": "uuid", "status": "queued|running|finished|failed", "stage": "merge", "error": null, "ts": 1735660000.123 }
  ```
- `task_progress`（阶段级进度）  
  ```json
  { "task_id": "uuid", "status": "running", "stage": "asr", "progress": 0.5, "ts": 1735660000.123 }
  ```
- `task_result`（任务完成提示，前端应再 GET /result 拉取完整结果）  
  ```json
  { "task_id": "uuid", "status": "finished", "stage": "finalize", "ts": 1735660000.123 }
  ```
- `ping`  
  ```json
  { "ts": 1735660000.123 }
  ```

前端连接示例（EventSource）：
```js
const es = new EventSource(`/api/v1/tasks/${taskId}/events`);
es.addEventListener("task_progress", (e) => console.log(JSON.parse(e.data)));
es.addEventListener("task_status", (e) => console.log(JSON.parse(e.data)));
es.addEventListener("task_result", async (e) => {
  const data = JSON.parse(e.data);
  const result = await fetch(`/api/v1/tasks/${data.task_id}/result`).then(r => r.json());
});
```

### 3.6 前端接入流程（推荐）
1) `POST /tasks` 创建任务并拿到 `task_id`  
2) 立刻订阅 `/events`，监听 `task_status`/`task_progress`  
3) 收到 `task_result` 后调用 `/result` 取得完整结果  
4) 需要字幕详情则调用 `/segments` 或 `/segments/{segment_id}`  
5) 仅调试时访问 `/raw` 与 `/timing`

### 3.7 数据结构（核心）
**TaskResult（clean）**
```json
{
  "task_id": "uuid",
  "status": "finished|failed",
  "mode": "simple|deep",
  "video_type": { "label": "History", "confidence": 0.82 },
  "transcript": {
    "segments": [<TranscriptSegment>],
    "srt_path": "temp/xxx.srt",
    "vtt_path": "temp/xxx.vtt"
  },
  "summary": {
    "overall": "string",
    "by_slice": [<SummarySlice>]
  },
  "keywords": {
    "items": [<KeywordItem>]
  },
  "error": null
}
```

**TranscriptSegment**
```json
{
  "segment_id": "seg_000123",
  "index": 0,
  "start": 0.0,
  "end": 2.4,
  "text": "..."
}
```

**SummarySlice**
```json
{ "slice_id": 0, "start": 0, "end": 300, "summary": "..." }
```

**KeywordItem / KeywordMention / KeywordLink**
```json
{
  "keyword_id": 9,
  "term": "Saber",
  "definition": "...",
  "mentions": [ { "segment_id": "seg_000123" } ],
  "links": [ { "title": "...", "url": "https://example.com", "source": "llm" } ]
}
```

说明：
- `segment_id` 为前端跳转的稳定主键，`index` 为 0-based。
- `srt_path` / `vtt_path` 为本地文件路径（Demo 场景）。
- `keywords.links` 可能为空；`source` 默认为 `llm`。
- SSE 的 `progress` 为阶段级（stage-level）进度，不代表精确百分比。

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
