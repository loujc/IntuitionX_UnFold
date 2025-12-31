# HTTP API 规范（v1）

基础路径：`/api/v1`

## 1. 创建任务（上传 / URL / 本地路径）
`POST /tasks`

### 1.1 URL 模式
请求：`application/json`
```json
{
  "source_type": "url",
  "source_url": "https://example.com/video.mp4",
  "title": "可选视频标题",
  "mode": "brief",
  "style": "popular_science",
  "language": "auto",
  "return_formats": ["srt", "vtt", "json"]
}
```

### 1.2 本地路径模式（推荐用于本地 Demo）
请求：`application/json`
```json
{
  "source_type": "path",
  "source_path": "/Users/yourname/Videos/demo.mp4",
  "title": "可选视频标题",
  "mode": "brief",
  "style": "popular_science",
  "language": "auto",
  "return_formats": ["srt", "vtt", "json"]
}
```

### 1.3 上传模式
请求：`multipart/form-data`
- `file`: 视频文件
- `title`: 可选视频标题
- `mode`: brief | deep
- `style`: popular_science | academic | casual
- `language`: auto | zh | en | ...
- `return_formats`: srt | vtt | json
说明：大文件上传容易超时或失败，建议优先使用 URL 或本地路径模式。

响应（统一）
```json
{
  "task_id": "uuid",
  "status": "queued",
  "message": "processing started"
}
```

## 2. 查询状态
`GET /tasks/{task_id}/status`
```json
{
  "task_id": "uuid",
  "status": "processing",
  "stage": "transcribing",
  "progress": 0.42,
  "eta_sec": 12,
  "error": null
}
```

## 3. 获取结果
`GET /tasks/{task_id}/result`
```json
{
  "video_meta": {
    "duration_sec": 1560,
    "format": "mp4",
    "video_type": "Technology"
  },
  "summary": {
    "fast": "...",
    "full": "...",
    "segments": [
      {"start_ms": 0, "end_ms": 60000, "summary": "..."}
    ]
  },
  "subtitles": [
    {"index": 1, "start": "00:00:01,000", "end": "00:00:04,000", "text": "..."}
  ],
  "annotations": [
    {
      "term": "XGBoost",
      "segment_id": "seg_04",
      "start_ms": 120000,
      "end_ms": 130000,
      "importance": 0.82,
      "explanation_short": "...",
      "explanation_long": "...",
      "sources": [{"title": "...", "url": "..."}],
      "context_blob": "..."
    }
  ]
}
```

## 4. 子资源
- `GET /tasks/{task_id}/subtitles?format=srt|vtt|json`
- `GET /tasks/{task_id}/summary?level=fast|full`
- `GET /tasks/{task_id}/keywords?mode=brief|deep&style=popular_science`

## 5. 任务管理
- `POST /tasks/{task_id}/retry`（可选 body: {"stage": "transcribing"}）
- `DELETE /tasks/{task_id}`（清理数据）

## 6. 可选事件流（预留）
- `GET /tasks/{task_id}/events`（SSE，推送阶段与中间结果）

## 7. 错误响应统一格式
```json
{
  "error": {
    "code": "INVALID_ARGUMENT",
    "message": "...",
    "details": null
  }
}
```
