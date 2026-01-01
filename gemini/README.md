# IntuitionX 后端（黑客松 Demo）

基于 spec 驱动的 AI 字幕注释产品后端。系统接收视频，产出带时间戳字幕（SRT/VTT），
识别视频类型，生成摘要，并提取带解释的关键词气泡。整体采用单进程 FastAPI + 内存
任务队列 + SQLite 持久化。

## 目标
- 20-30s 端到端时延目标（尽力而为），使用切片并行。
- LLM 调用仅使用 OpenAI Python SDK（不使用 raw HTTP，不用 LangChain）。
- 结构化 JSON 输出；所有 raw 输出与耗时统计落库。

## 功能（目标）
- 使用 ffmpeg 切片 + 并行 ASR（Faster-Whisper 或 MLX-Whisper）。
- 视频类型识别与摘要（chunk + reduce）。
- 关键词提取（simple/deep 模式）并附带 segment 级 mentions。
- SSE 进度流用于前端实时更新。
- SQLite 存储字幕与关键词，可全文检索（优先 FTS5）。

## 架构（单进程）
- FastAPI 处理 HTTP + SSE。
- JobManager 单例：asyncio.Queue + 内存任务状态。
- ASR 运行在 ThreadPoolExecutor，worker 数量可配置。
- LLM 调用为异步 IO，OpenAI SDK + 重试。
- SQLite + SQLAlchemy 持久化任务与结果。

## 处理流程
1. 按时长切分输入视频（可配置）。
2. 对每个切片并行执行 ASR。
3. 合并字幕并生成 SRT/VTT，修正时间偏移。
4. LLM 任务并行执行：
   - 视频类型识别
   - 摘要（chunk + reduce）
   - 关键词提取（simple/deep 模式）

## API（Base: /api/v1）
- POST /tasks
  - multipart/form-data: file + mode (simple|deep) + 可选 video_type
  - response: { "task_id": "...", "status": "queued" }
- GET /tasks/{task_id}
  - status + stage
- GET /tasks/{task_id}/result
  - clean JSON 结果（不含 raw/timing）
- GET /tasks/{task_id}/events (SSE)
- 读取接口：
  - GET /tasks/{task_id}/segments
  - GET /tasks/{task_id}/segments/{segment_id}
  - GET /tasks/{task_id}/raw
  - GET /tasks/{task_id}/timing

前端对齐的数据结构与事件格式详见 `spec/Frontend_Data_Contract.md`。

### SSE 事件
event: task_status | task_progress | task_result | ping
data: JSON with task_id, status, stage, progress, message, ts

## 任务状态
status: queued | running | finished | failed
stage: slicing -> asr -> merge -> llm_summary -> llm_keywords -> finalize

## 结果 JSON（clean）
对前端返回的结果不包含 raw 输出与 timing 统计。
示例结构：
```json
{
  "task_id": "...",
  "status": "finished",
  "mode": "simple",
  "video_type": { "label": "history", "confidence": 0.82 },
  "transcript": {
    "segments": [
      { "segment_id": 123, "index": 0, "start": 0.0, "end": 2.4, "text": "..." }
    ],
    "srt_path": "temp/xxx.srt",
    "vtt_path": "temp/xxx.vtt"
  },
  "summary": {
    "overall": "...",
    "by_slice": [
      { "slice_id": 0, "start": 0, "end": 300, "summary": "..." }
    ]
  },
  "keywords": {
    "items": [
      {
        "keyword_id": 9,
        "term": "Saber",
        "definition": "...",
        "mentions": [ { "segment_id": 123 } ],
        "links": [ { "title": "...", "url": "...", "source": "llm" } ]
      }
    ]
  },
  "error": null
}
```

## 存储
- temp/ 保存上传文件与生成的 SRT/VTT（暂不清理）。
- SQLite 存储任务记录、字幕片段、关键词与日志。
- 全文检索优先使用 SQLite FTS5（不可用则回退到 LIKE）。
- Raw 的 LLM/ASR 输出与耗时统计与 clean 结果分表存储。

## 配置
敏感信息放 .env，运行参数放 config.yaml。

示例 config.yaml:
```yaml
runtime:
  max_llm_concurrency: 10

system:
  video_types: ["History", "Anime", "Finance", "Course"]
  default_mode: "simple"

processing:
  enable_chunking: true
  chunk_duration: 300
  max_asr_workers: 1
  llm_concurrency: 5

asr:
  backend: "auto"
  model_size: "medium"

llm:
  base_url: "http://127.0.0.1:8045/v1"
  model_name: "gemini-3-flash"
  api_key: "${LLM_API_KEY}"

db:
  url: "sqlite:///./data/intuitionx.db"

storage:
  temp_dir: "./temp"
  max_upload_size_mb: 500
```

## 性能与调参
- 目标：20-30s 端到端（Best Effort，取决于模型与视频时长）。
- 关键调参：
  - `processing.chunk_duration`：切片时长，越短并行度越高但开销增大。
  - `processing.max_asr_workers`：ASR 并发数，受显存限制，默认 1。
  - `processing.llm_concurrency` / `runtime.max_llm_concurrency`：LLM 并发度上限。
  - `asr.model_size`：ASR 模型大小（速度/准确率权衡）。
  - `llm.model_name` 与 `llm.base_url`：LLM 模型与服务端点。

## 依赖清单（最小）
- Python 3.10+
- FFmpeg
- Python 依赖见 requirements.txt（fastapi、uvicorn、openai、sqlalchemy、pyyaml、tenacity、pytest、httpx）
- ASR 后端：faster-whisper 或 mlx-whisper

## 最小运行命令
```bash
# 安装依赖
pip install -r requirements.txt
# 启动（单进程）
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 1
```

## 运行测试
```bash
pytest
```

## 备注
- 仅单进程运行（uvicorn workers=1），重启后内存任务状态会丢失。
- 黑客松 demo 禁用外部搜索，由 LLM 生成解释。
- 关键词 mentions 指向 transcript 的 segment_id（index 为 0-based）。
