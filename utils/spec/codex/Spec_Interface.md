# 模块接口与数据结构

## 1. 模块接口（Input/Output）
| 模块 | 输入 | 输出 | 备注 |
| --- | --- | --- | --- |
| Orchestrator | task_id, source_uri/source_path, user_style, config | stage 任务队列 | 生成任务与并行切分策略 |
| Video Processor | video_path | audio_path, chunks | FFmpeg 抽音与切片 |
| ASR Worker | audio_chunk, language | transcript_segment | 并行转写 |
| Summarizer | transcript_segments, video_meta | summary_segments, summary_full | Map-Reduce + 上下文 |
| Keyword Agent | transcript_segments, video_type, mode, style | keyword_annotations | 生僻词抽取 + 解释 |
| Search Agent | term, context | sources | 可失败降级 |

## 2. 数据结构（核心实体）
### Task
```json
{
  "id": "uuid",
  "status": "queued|processing|completed|failed",
  "stage": "downloading|transcribing|summarizing|keywording|linking",
  "source_type": "upload|url|path",
  "source_uri": "...",
  "source_path": "...",
  "title": "...",
  "language": "auto|zh|en|ja|...",
  "language_detected": "zh",
  "mode": "brief|deep",
  "style": "popular_science|academic|casual",
  "progress": 0.0,
  "error_message": null,
  "created_at": "...",
  "updated_at": "..."
}
```

### TranscriptSegment
```json
{
  "task_id": "uuid",
  "segment_id": "seg_04",
  "start_ms": 120000,
  "end_ms": 130000,
  "text": "..."
}
```
说明：`start_ms/end_ms` 为事实标准，`segment_id` 仅作顺序索引，不作为切片对齐依据。

### SummarySegment
```json
{
  "task_id": "uuid",
  "segment_id": "seg_04",
  "start_ms": 120000,
  "end_ms": 130000,
  "summary": "..."
}
```

### KeywordAnnotation
```json
{
  "task_id": "uuid",
  "segment_id": "seg_04",
  "term": "XGBoost",
  "importance": 0.82,
  "explanation_short": "...",
  "explanation_long": "...",
  "sources": [{"title": "...", "url": "..."}],
  "context_blob": "..."
}
```

### VideoMeta
```json
{
  "duration_sec": 1560,
  "format": "mp4",
  "hash": "sha256...",
  "title": "...",
  "video_type": "Technology"
}
```

## 3. 配置规范（config.yaml + .env）
```yaml
llm:
  base_url: "${LLM_BASE_URL}"
  api_key: "${LLM_API_KEY}"
  model: "${LLM_MODEL}"
  temperature: 0.2
  max_tokens: 2048
asr:
  provider: "faster-whisper" # or whisper-api
  model_size: "large-v3"
  device: "cuda" # cpu/cuda
pipeline:
  max_video_minutes: 40
  chunk_sec: 45
  chunk_overlap_sec: 2
  max_concurrency: 6
  retry:
    max_attempts: 4
    backoff_sec: 2
search:
  provider: "serper"
  max_links: 2
storage:
  object_root: "./data"
  ttl_days: 7
```

## 4. 数据库草案（Demo）
- tasks
  - id (PK), status, stage, source_type, source_uri
  - language, language_detected, mode, style
  - progress, error_message, created_at, updated_at
- transcripts
  - id, task_id (FK), segment_id, start_ms, end_ms, text
- summaries
  - id, task_id (FK), segment_id, start_ms, end_ms, summary
- keywords
  - id, task_id (FK), segment_id, term, importance
  - explanation_short, explanation_long, sources_json, context_blob
- videos
  - id, task_id (FK), duration_sec, format, hash, video_type
