# TODO

## Decisions captured
- Specs in scope: Agent_Spec_V2.md, Architecture_and_API_Spec.md, Agent_Spec_gemini.md.
- Single ASR worker for now; slicing still enabled for future parallelism.
- No external search; LLM generates explanations and links.
- Uploads stored under temp/ with no cleanup for now.
- Task status values: queued, running, finished, failed; add a stage field for sub-steps.
- SSE schema accepted: events task_status/task_progress/task_result/ping with JSON data fields.
- POST /api/v1/tasks uses multipart/form-data; mode is a form field.
- Client-facing result excludes raw output and timings; raw and timings stored separately.
- Transcript and keyword data must be searchable in DB.
- Segment addressing includes both segment_id and index; keyword mentions reference segment_id.
- Segment index is 0-based; keyword bubbles are separate (no in-text highlight offsets).
- Prefer SQLite FTS5 for search indexing; fall back to LIKE if FTS5 unavailable.
- Git commits deferred for now per user request.

## Open questions
- None.

## 1. Scaffold and configuration
Tasks:
- Create app/ structure: api/, core/, services/, workers/, db/, schemas/, utils/, prompts/.
- Add config.yaml with commented defaults; load .env and config.yaml into a typed config object.
- Add logging setup; include run_id and task_id in log context.
- Add requirements list and a minimal README with run commands.
Tests:
- Unit test config loader with env overrides.
- Smoke test: import app and run a no-op FastAPI app instance.

## 2. Database schema and persistence
Tasks:
- Define SQLAlchemy models for Task, TaskResult (clean), TaskRaw, TaskTiming, TaskLog.
- Add Segment, Keyword, KeywordMention, KeywordLink models for indexing and fast lookup.
- Store transcript segments and keywords in DB for indexing and retrieval by key/id.
- Add DB init and session management utilities.
Tests:
- Create a temp SQLite DB, insert a task, read it back, update status.
- Verify TaskResult and TaskRaw are stored separately.

## 3. Search indexing (DB)
Tasks:
- Add FTS5 tables for transcript and keyword text; fall back to LIKE if unavailable.
- Map search index rows back to task_id and segment/keyword references.
Tests:
- Insert sample transcript and keyword text, run FTS query, verify hits.

## 4. JobManager and task lifecycle
Tasks:
- Implement JobManager singleton with in-memory task cache, job_queue, and event_queues.
- Implement worker loop and a stage state machine: slicing -> asr -> merge -> llm_summary -> llm_keywords -> finalize.
- Add retry logic for LLM calls with tenacity and a retry counter saved to DB.
Tests:
- Unit test: enqueue task_id, simulate worker processing with mock handlers.
- Verify stage transitions and failure path update status and logs.

## 5. File upload and slicing
Tasks:
- Implement POST /api/v1/tasks to accept multipart upload and mode field.
- Save to temp/ with a stable naming scheme; persist input metadata.
- Implement ffmpeg slicing by duration from config.yaml.
Tests:
- API test: upload a small file and verify task queued.
- Slice test with a short sample video to ensure N segments output.

## 6. ASR transcription and merge
Tasks:
- Implement ASR transcription per slice using Faster-Whisper or MLX-Whisper.
- Run ASR in ThreadPoolExecutor with MAX_ASR_WORKERS=1.
- Merge segments into full transcript with segment_id + index; generate SRT and VTT.
Tests:
- Transcribe a short audio clip and verify segment output shape.
- Generate SRT/VTT and validate format with a simple parser.

## 7. LLM pipelines (video type, summary, keywords)
Tasks:
- Implement OpenAI SDK client singleton with configurable base_url/model.
- Add prompts for video type, summary, keywords with JSON output.
- Support mode simple/deep for keyword extraction.
- Map keyword mentions to segment_id for fast jump-to-subtitle.
Tests:
- Mock LLM client to return JSON and verify schema parsing.
- Validate mode affects prompt content.

## 8. Result assembly and storage
Tasks:
- Build clean result JSON (no raw/timing) with segments array and keywords + mentions.
- Store raw LLM/ASR outputs in TaskRaw; store timings in TaskTiming.
Tests:
- Verify /result excludes raw/timing fields.
- Verify raw/timing stored and retrievable via a debug endpoint.

## 9. SSE event streaming
Tasks:
- Implement /api/v1/tasks/{task_id}/events with text/event-stream.
- Emit events on status/stage changes, progress updates, and completion.
- Use event types task_status/task_progress/task_result/ping with JSON data payloads.
- Add keepalive ping events at fixed interval.
Tests:
- Use httpx or curl to connect and verify event ordering.
- Ensure disconnects clean up event queues.

## 10. API read endpoints
Tasks:
- Implement GET /api/v1/tasks/{task_id} (status and stage).
- Implement GET /api/v1/tasks/{task_id}/result (clean JSON).
- Implement GET /api/v1/tasks/{task_id}/segments and /segments/{segment_id}.
- Implement GET /api/v1/tasks/{task_id}/raw and /timing for debug.
Tests:
- FastAPI TestClient coverage for all endpoints.
- Error cases: invalid task_id, missing result, failed task.

## 11. Observability and performance
Tasks:
- Add timing metrics per stage and store in TaskTiming.
- Log key events and LLM errors with task context.
- Document best-effort 20-30s target and tuning knobs.
Tests:
- Unit test timing capture with a mocked clock.
- Manual smoke run to collect timings for a short video.

## 12. Commit hygiene (deferred)
Tasks:
- Resume commit discipline when requested.
Tests:
- None.
