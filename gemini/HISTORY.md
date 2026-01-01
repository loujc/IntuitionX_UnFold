# HISTORY - 修改记录

## 修改日志

| 时间 | 模型/Agent | 修改文件 | 修改内容 |
|------|------------|----------|----------|
| 2026-01-01 (Step 1-2) | Codex | `app/` 目录结构 | 创建工程骨架：api/、core/、services/、workers/、db/、schemas/、utils/、prompts/ |
| 2026-01-01 (Step 1-2) | Codex | `app/core/config.py` | 实现配置加载：.env + config.yaml + 环境变量覆盖 |
| 2026-01-01 (Step 1-2) | Codex | `app/core/logging.py` | 实现日志系统，支持 run_id/task_id 上下文 |
| 2026-01-01 (Step 1-2) | Codex | `app/main.py` | FastAPI 应用入口 + health 接口 |
| 2026-01-01 (Step 1-2) | Codex | `app/db/models.py` | 定义 SQLAlchemy 模型：Task、TaskResult、TaskRaw、TaskTiming、TaskLog、Segment、Keyword、KeywordMention、KeywordLink |
| 2026-01-01 (Step 1-2) | Codex | `app/db/session.py` | 数据库 engine 和 session 管理 |
| 2026-01-01 (Step 1-2) | Codex | `app/db/init_db.py` | 数据库初始化，自动创建表 |
| 2026-01-01 (Step 1-2) | Codex | `app/db/repository.py` | 基础 CRUD 方法 |
| 2026-01-01 (Step 1-2) | Codex | `config.yaml` | 默认配置文件 |
| 2026-01-01 (Step 1-2) | Codex | `requirements.txt` | 依赖清单 |
| 2026-01-01 (Step 1-2) | Codex | `README.md` | 项目说明文档 |
| 2026-01-01 (Step 1-2) | Codex | `tests/test_*.py` | 配置、数据库、应用烟测 |
| 2026-01-01 Review | Claude Opus 4.5 | `app/core/config.py` | 修复 Pydantic `model_` 命名空间冲突警告 |
| 2026-01-01 Review | Claude Opus 4.5 | `app/main.py` | 修复 FastAPI `on_event` 弃用警告，改用 `lifespan` |
| 2026-01-01 Review | Claude Opus 4.5 | `app/db/repository.py` | 新增 8 个查询方法：`get_segment_by_id`、`get_keywords_by_task`、`get_keyword_mentions`、`get_mentions_by_segment`、`get_keyword_links`、`get_task_raw`、`get_task_timings`、`get_task_logs` |
| 2026-01-01 Review | Claude Opus 4.5 | `app/core/logging.py` | 新增 `get_logger()` 便捷函数 |
| 2026-01-01 Review | Claude Opus 4.5 | `tests/test_db_basic.py` | 补充按 index 查询和 KeywordMention 跳转测试 |
| 2026-01-01 Review | Claude Opus 4.5 | `requirements.txt` | 添加 `pydantic>=2.0` 显式依赖 |
| 2026-01-01 Review | Claude Opus 4.5 | `HISTORY.md` | 新建修改记录文件 |
| 2026-01-01 (Step 3) | Codex | `app/db/search.py` | 增加 FTS5/LIKE 搜索索引与查询逻辑 |
| 2026-01-01 (Step 3) | Codex | `app/db/init_db.py` | 初始化时创建 FTS5 虚拟表（可用时） |
| 2026-01-01 (Step 3) | Codex | `tests/test_search_index.py` | 索引与检索回归测试 |
| 2026-01-01 Step 3 Review | Claude Opus 4.5 | `app/db/search.py` | 修复 FTS5 MATCH 语法错误（移除别名前缀） |
| 2026-01-01 Step 3 Review | Claude Opus 4.5 | `app/db/search.py` | 移除 `index_segments/index_keywords` 中的 `db.commit()`，由调用方控制事务 |
| 2026-01-01 Step 3 Review | Claude Opus 4.5 | `app/db/search.py` | 添加 FTS5 检测结果缓存（`_FTS5_CACHE`），优化性能 |
| 2026-01-01 Step 3 Review | Claude Opus 4.5 | `app/db/search.py` | `_keyword_rows` 中添加 keyword_id 验证，跳过无效数据 |
| 2026-01-01 Step 3 Review | Claude Opus 4.5 | `tests/test_search_index.py` | 补充边界测试：空查询、不存在的 task、无效 keyword_id |
| 2026-01-01 Step 3 Review | Claude Opus 4.5 | `tests/test_search_index.py` | 添加 `session.commit()` 以适配事务控制修改 |
| 2026-01-01 (Spec) | Codex | `spec/Frontend_Data_Contract.md` | 新增前端接口数据契约文档 |
| 2026-01-01 (Step 4) | Codex | `app/core/job_manager.py` | 新增 JobManager：任务队列、阶段状态机、事件队列、失败处理与计时 |
| 2026-01-01 (Step 4) | Codex | `app/services/llm_retry.py` | LLM 调用重试封装（tenacity）并写入重试计数 |
| 2026-01-01 (Step 4) | Codex | `app/db/models.py` | Task 增加 `llm_retry_count` 字段 |
| 2026-01-01 (Step 4) | Codex | `app/db/repository.py` | 增加 `increment_task_retry` |
| 2026-01-01 (Step 4) | Codex | `app/main.py` | 注册 JobManager 并在 lifespan 启停 |
| 2026-01-01 (Step 4) | Codex | `tests/test_job_manager.py` | JobManager 状态流转与失败路径测试 |
| 2026-01-01 (Step 4) | Codex | `tests/test_llm_retry.py` | LLM 重试计数测试 |
| 2026-01-01 (Step 4) | Claude Opus 4.5 | `pytest.ini` / `tests/conftest.py` | 固定 anyio 后端为 asyncio |
| 2026-01-01 Step 4 Review | Claude Opus 4.5 | `app/core/job_manager.py` | 修复 worker_loop 阻塞问题（添加 timeout 检查 stop_event） |
| 2026-01-01 Step 4 Review | Claude Opus 4.5 | `app/services/llm_retry.py` | 修复 LLM 重试 rollback 导致数据丢失问题（使用独立 session） |
| 2026-01-01 Step 4 Review | Claude Opus 4.5 | `app/core/job_manager.py` | 为 `_update_db_status` 和 `_record_timing` 添加异常日志 |
| 2026-01-01 Step 4 Review | Claude Opus 4.5 | `tests/test_job_manager.py` | 修复测试只使用 asyncio backend（添加 `backends=["asyncio"]`） |
| 2026-01-01 Step 4 Review | Claude Opus 4.5 | `tests/conftest.py` | 新增 pytest fixture 覆盖 anyio_backend 为仅 asyncio |
| 2026-01-01 Step 4 Review | Claude Opus 4.5 | `app/core/job_manager.py` | 为事件队列添加大小限制（maxsize=100）防止内存泄漏 |
| 2026-01-01 Step 4 Review | Claude Opus 4.5 | `app/core/job_manager.py` | 修复 progress 计算（当前阶段为 0.5 进度更准确） |
| 2026-01-01 Step 4 Review | Claude Opus 4.5 | `tests/test_llm_retry.py` | 更新测试以适配新的 `call_llm_with_retry` 签名 |
| 2026-01-01 Step 4 Review | Claude Opus 4.5 | `pytest.ini` | 新增 pytest 配置文件 |
| 2026-01-01 (Step 5) | Codex | `config.yaml` | 新增 storage.temp_dir 配置 |
| 2026-01-01 (Step 5) | Codex | `app/core/config.py` | 增加 StorageConfig |
| 2026-01-01 (Step 5) | Codex | `app/services/storage.py` | 上传文件保存与目录组织 |
| 2026-01-01 (Step 5) | Codex | `app/services/video_splitter.py` | FFmpeg 切片实现 |
| 2026-01-01 (Step 5) | Codex | `app/workers/stage_handlers.py` | 切片阶段处理与 noop 其他阶段 |
| 2026-01-01 (Step 5) | Codex | `app/api/tasks.py` | 上传接口 POST /api/v1/tasks |
| 2026-01-01 (Step 5) | Codex | `app/main.py` | 注册 API 路由与阶段处理器 |
| 2026-01-01 (Step 5) | Codex | `app/db/repository.py` | 新增 update_task_input_meta |
| 2026-01-01 (Step 5) | Codex | `requirements.txt` | 增加 python-multipart |
| 2026-01-01 (Step 5) | Codex | `tests/test_api_upload.py` | 上传接口测试 |
| 2026-01-01 (Step 5) | Codex | `tests/test_video_splitter.py` | 切片功能测试（ffmpeg 可用时） |
| 2026-01-01 (Step 6) | Codex | `app/services/asr.py` | 新增 ASR 后端封装与 stub 转写 |
| 2026-01-01 (Step 6) | Codex | `app/services/transcript.py` | 合并切片字幕为全量 segments |
| 2026-01-01 (Step 6) | Codex | `app/services/subtitles.py` | 生成 SRT/VTT 字幕文本 |
| 2026-01-01 (Step 6) | Codex | `app/workers/stage_handlers.py` | 补充 ASR/merge 阶段处理与持久化 |
| 2026-01-01 (Step 6) | Codex | `requirements.txt` | 增加 faster-whisper 依赖 |
| 2026-01-01 (Step 6) | Codex | `tests/test_asr_merge.py` | ASR 与 SRT/VTT 生成测试 |
| 2026-01-01 Step 6 Review | Codex | `app/workers/stage_handlers.py` | 保存 ASR raw 输出到 TaskRaw |
| 2026-01-01 (Step 7) | Codex | `app/services/llm_client.py` | OpenAI SDK 调用与 JSON 解析 |
| 2026-01-01 (Step 7) | Codex | `app/prompts/llm_prompts.py` | 视频类型/摘要/关键词提示词模板 |
| 2026-01-01 (Step 7) | Codex | `app/services/llm_pipeline.py` | Transcript/关键词规范化与切片汇总 |
| 2026-01-01 (Step 7) | Codex | `app/db/repository.py` | 增加 upsert_task_raw 与 update_task_video_type |
| 2026-01-01 (Step 7) | Codex | `app/workers/stage_handlers.py` | LLM summary/keywords 阶段与持久化 |
| 2026-01-01 (Step 7) | Codex | `tests/test_llm_pipeline.py` | LLM 解析与 prompt 规则测试 |
| 2026-01-01 (Step 8) | Codex | `app/services/result_builder.py` | Clean result 组装工具 |
| 2026-01-01 (Step 8) | Codex | `app/db/repository.py` | 增加 upsert_task_result |
| 2026-01-01 (Step 8) | Codex | `app/workers/stage_handlers.py` | finalize 阶段生成 TaskResult |
| 2026-01-01 (Step 8) | Codex | `app/api/tasks.py` | 增加 result/raw/timing 读取接口 |
| 2026-01-01 (Step 8) | Codex | `tests/test_result_endpoints.py` | result/raw/timing 接口测试 |
| 2026-01-01 (Step 9) | Codex | `app/api/tasks.py` | SSE 事件流接口与 keepalive ping |
| 2026-01-01 (Step 9) | Codex | `tests/test_sse_events.py` | SSE 事件顺序与断开清理测试 |
| 2026-01-01 (Step 10) | Codex | `app/api/tasks.py` | 状态/segments 读取接口 |
| 2026-01-01 (Step 10) | Codex | `tests/test_read_endpoints.py` | 读取接口与错误场景测试 |
| 2026-01-01 (Step 10) | Codex | `README.md` | 更新读取接口说明 |
| 2026-01-01 (Step 11) | Codex | `app/core/job_manager.py` | 增加任务阶段日志与失败日志 |
| 2026-01-01 (Step 11) | Codex | `app/workers/stage_handlers.py` | LLM 错误日志输出 |
| 2026-01-01 (Step 11) | Codex | `tests/test_job_manager.py` | 阶段耗时记录测试（mock clock） |
| 2026-01-01 (Step 11) | Codex | `README.md` | 增加性能调参与目标说明 |
| 2026-01-01 (Step 12) | Codex | `HISTORY.md` | 恢复提交规范（流程记录，无代码变更） |
| 2026-01-01 Step 8-9 Review | Claude Opus 4.5 | `app/api/tasks.py` | 添加 GET /tasks/{task_id} 状态查询端点 |
| 2026-01-01 Step 8-9 Review | Claude Opus 4.5 | `app/core/job_manager.py` | 所有 SSE 事件添加时间戳字段 (ts) |
| 2026-01-01 Step 8-9 Review | Claude Opus 4.5 | `app/core/job_manager.py` | 事件队列满时记录警告日志 |
| 2026-01-01 Step 8-9 Review | Claude Opus 4.5 | `app/api/tasks.py` | 优化 SSE 断线检测超时 (1.0s -> 0.5s) |
| 2026-01-01 Step 8-9 Review | Claude Opus 4.5 | `app/api/tasks.py` | SSE 连接时推送初始任务状态 |
| 2026-01-01 Step 8-9 Review | Claude Opus 4.5 | `app/services/result_builder.py` | 增强 video_type 空值校验 |
| 2026-01-01 Step 10-12 Review | Claude Opus 4.5 | `app/api/tasks.py` | 修复重复的 GET /tasks/{task_id} 端点定义 |
| 2026-01-01 (LLM Provider) | Codex | `app/services/llm_client.py` | 支持 Gemini 官方 API（google-genai）provider 分支 |
| 2026-01-01 (LLM Provider) | Codex | `app/core/config.py` / `config.yaml` / `requirements.txt` / `README.md` | 增加 provider 配置与依赖、补充 Gemini 配置示例 |
| 2026-01-01 (LLM Output) | Codex | `app/workers/stage_handlers.py` / `tests/test_llm_output_files.py` / `README.md` / `spec/Architecture_and_API_Spec.md` | LLM 输出写入 temp 并记录路径，补充文档与测试 |
| 2026-01-01 (Chapters & Keywords) | Codex | `app/prompts/llm_prompts.py` / `app/services/llm_pipeline.py` / `app/workers/stage_handlers.py` / `app/services/result_builder.py` | 语义分章 + 章节摘要（中文），关键词抽取按章节输入并映射 segment_id，video_types 多标签输出 |
| 2026-01-01 (Artifacts) | Codex | `app/workers/stage_handlers.py` / `README.md` / `spec/*` | 合并字幕输出 transcript.txt，新增 LLM 文本输出文件与文档更新 |
| 2026-01-01 (Docs/Tests) | Codex | `spec/Frontend_Data_Contract.md` / `spec/Architecture_and_API_Spec.md` / `tests/test_llm_pipeline.py` / `tests/test_llm_output_files.py` | 更新前端契约与测试以适配新结构 |
| 2026-01-01 Chapters Review | Claude Opus 4.5 | `app/workers/stage_handlers.py` | 复用 `_truncate` 函数、LLM 调用添加 try/except 日志、章节回退时添加警告日志 |
| 2026-01-01 Chapters Review | Claude Opus 4.5 | `tests/test_job_manager.py` | 更新 timing 测试以适配 7 阶段（新增 llm_chapters） |
| 2026-01-02 Chapters Review | Claude Opus 4.5 | `app/workers/stage_handlers.py` | 为 llm_summary/llm_chapters/llm_keywords 添加 docstring 说明职责变更 |
| 2026-01-02 Prompts Review | Claude Opus 4.5 | `app/prompts/llm_prompts.py` | 优化所有 prompts：分类化 system prompt、全中文指令、明确输出格式、具体化规则 |
| 2026-01-02 Prompts Review | Claude Opus 4.5 | `tests/test_llm_pipeline.py` | 更新测试以匹配中文 prompt |

## 测试状态

| 时间 | 测试结果 |
|------|----------|
| 2026-01-01 Review 后 | 4 passed, 0 warnings |
| 2026-01-01 (Step 3) | 5 passed, 0 warnings |
| 2026-01-01 Step 3 Review 后 | 6 passed, 0 warnings |
| 2026-01-01 (Step 4) | 9 passed, 0 warnings (含 trio 失败) |
| 2026-01-01 Step 4 Review 后 | 9 passed, 0 warnings |
| 2026-01-01 (Step 5) | 10 passed, 1 skipped |
| 2026-01-01 (Step 6) | 12 passed, 1 skipped |
| 2026-01-01 Step 6 Review 后 | 4 passed (subset: asr_merge, job_manager) |
| 2026-01-01 (Step 7) | 16 passed |
| 2026-01-01 (Step 8) | 17 passed |
| 2026-01-01 (Step 9) | 18 passed |
| 2026-01-01 (Step 10) | 20 passed |
| 2026-01-01 (Step 11) | 21 passed |
| 2026-01-01 Step 8-9 Review 后 | 9 passed (核心测试) |
| 2026-01-01 (Step 12) | N/A |
