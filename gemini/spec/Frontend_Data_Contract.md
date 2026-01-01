# Frontend Data Contract (Gemini backend)

This document defines the payloads and data structures the frontend should
expect from the Gemini backend agent. It is derived from the Gemini specs and
the current codebase models.

## 1) State model

### Task status
`queued` | `running` | `finished` | `failed`

### Task stage (sub-steps)
`""` | `slicing` | `asr` | `merge` | `llm_summary` | `llm_chapters` | `llm_quotes` | `llm_keywords` | `finalize`

### Stage flow
`queued -> slicing -> asr -> merge -> llm_summary -> llm_chapters -> llm_quotes -> llm_keywords -> finalize -> finished`

If any stage fails, status becomes `failed` and `error` is set.

## 2) API payloads (base: `/api/v1`)

### POST `/tasks` (multipart/form-data)
Fields:
- `file` (required): video file
- `mode` (optional): `simple` | `deep` (default `simple`)
- `video_type` (optional): string hint, e.g. `History` (as input hint only)

Response: `TaskCreateResponse`

### GET `/tasks/{task_id}`
Response: `TaskStatusResponse`

### GET `/tasks/{task_id}/result`
Response: `TaskResult` (clean result, no raw or timing)

### GET `/tasks/{task_id}/events` (SSE)
Event types: `task_status` | `task_progress` | `task_result` | `ping`

## 3) SSE event payloads

`task_status`:
```
{
  "task_id": "uuid",
  "status": "queued|running|finished|failed",
  "stage": "slicing|asr|merge|llm_summary|llm_chapters|llm_quotes|llm_keywords|finalize|",
  "message": "optional human-readable note",
  "ts": "2025-01-01T12:00:00Z"
}
```

`task_progress`:
```
{
  "task_id": "uuid",
  "progress": 0.0,
  "message": "optional human-readable note",
  "ts": "2025-01-01T12:00:00Z"
}
```

`task_result`:
```
<TaskResult JSON>
```

`ping`:
```
{ "ts": "2025-01-01T12:00:00Z" }
```

## 4) Core data structures

Type aliases:
```
type TaskStatus = "queued" | "running" | "finished" | "failed";
type TaskStage =
  | ""
  | "slicing"
  | "asr"
  | "merge"
  | "llm_summary"
  | "llm_chapters"
  | "llm_quotes"
  | "llm_keywords"
  | "finalize";
type Mode = "simple" | "deep";
```

### TaskCreateResponse
```
{
  "task_id": "uuid",
  "status": "queued"
}
```

### TaskStatusResponse
```
{
  "task_id": "uuid",
  "status": "queued|running|finished|failed",
  "stage": "slicing|asr|merge|llm_summary|llm_chapters|llm_quotes|llm_keywords|finalize|",
  "error": null
}
```

### TaskResult (clean)
```
{
  "task_id": "uuid",
  "status": "finished|failed",
  "mode": "simple|deep",
  "video_type": ["History", "Finance"],
  "transcript": {
    "segments": [<TranscriptSegment>],
    "srt_path": "temp/xxx.srt",
    "vtt_path": "temp/xxx.vtt"
  },
  "summary": {
    "overall": "string",
    "by_slice": [],
    "chapters": [<SummaryChapter>]
  },
  "quotes": {
    "items": [<QuoteItem>]
  },
  "keywords": {
    "items": [<KeywordItem>]
  },
  "error": null
}
```

### TranscriptSegment
```
{
  "segment_id": "seg_000123",
  "index": 0,
  "start": 0.0,
  "end": 2.4,
  "text": "..."
}
```

### SummarySlice (disabled)
```
{
  "slice_id": 0,
  "start": 0,
  "end": 300,
  "summary": "..."
}
```

### SummaryChapter
```
{
  "chapter_id": 0,
  "segment_start_id": "seg_000001",
  "segment_end_id": "seg_000120",
  "start": 0.0,
  "end": 600.0,
  "summary": "..."
}
```

### QuoteItem
```
{
  "segment_id": "seg_000123",
  "index": 0,
  "start": 0.0,
  "end": 2.4,
  "text": "..."
}
```

### KeywordItem
```
{
  "keyword_id": 9,
  "term": "Saber",
  "definition": "...",
  "mentions": [<KeywordMention>],
  "links": [<KeywordLink>]
}
```

### KeywordMention
```
{ "segment_id": "seg_000123" }
```

### KeywordLink
```
{
  "title": "...",
  "url": "https://example.com",
  "source": "llm"
}
```

## 5) Conventions and notes

- Time fields (`start`, `end`) are seconds, float.
- `index` is 0-based; `segment_id` is the stable key for mentions.
- `video_type` 为 LLM 自动生成的多标签列表。
- `progress` is overall progress (0..1) for the whole task; no per-stage progress.
- `links` may be empty; external search is disabled in the demo, so `source` is usually `llm`.
- `srt_path` and `vtt_path` are local filesystem paths (demo runs locally), not HTTP URLs.
- Transcript segments are persisted in SQLite (`segments`) and indexed for search (FTS5 when available).
- `TaskResult` excludes raw LLM/ASR outputs and timing data by design.
