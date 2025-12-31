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

## 测试状态

| 时间 | 测试结果 |
|------|----------|
| 2026-01-01 Review 后 | 4 passed, 0 warnings |
| 2026-01-01 (Step 3) | 5 passed, 0 warnings |
| 2026-01-01 Step 3 Review 后 | 5 passed, 0 warnings |
