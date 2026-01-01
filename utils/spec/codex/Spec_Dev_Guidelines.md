# 开发规范与技术栈

## 1. 技术栈推荐（新手友好 + Demo 快速）
- 语言/框架：Python 3.10+ + FastAPI（异步友好，自动 OpenAPI）
- 任务队列：Demo 用 BackgroundTasks；稳定版用 Celery + Redis
- 数据库：SQLite（Demo），可平滑升级 PostgreSQL
- 音视频：FFmpeg（抽音、转码、切片）
- ASR：Faster-Whisper（本地 GPU 优先）/ Whisper API 作为备选
- LLM：OpenAI 兼容协议（base_url 可配置），仅允许中国境内或自建服务
- 搜索：Serper/Bing/其他 Web Search API（可插拔）

## 2. 开发规范
1. API First：所有功能先定义接口与数据结构，再实现。
2. 配置化：模型名、base_url、并发、重试、超时、切片参数必须配置化。
3. 结构化输出：LLM 返回 JSON，严格校验字段与类型。
4. 重试机制：LLM/搜索 API 使用指数退避重试，失败要记录状态。
5. 幂等与恢复：任务可重复提交（基于 hash 去重），支持 retry。
6. 日志与可观测：每阶段耗时、失败原因、关键指标必须记录。
7. Git 规范：建议 `feat:`/`fix:`/`docs:` 前缀。
8. 文件处理：大文件上传容易失败，Demo 优先使用 URL 或本地路径模式。

## 3. 安全与约束
- 禁止调用中国境外 LLM API；仅允许中国境内或自建 OpenAI 兼容接口。
- 仅保存必要数据，设置 TTL（建议 7 天），支持删除任务与清理。
- 不输出裸日志给前端，所有结果写入数据库后再提供查询。

## 4. 目标性能
- 40 分钟以内视频支持并行处理。
- 快速总结（fast）应在 10-20 秒内返回粗略版本（以 Demo 可接受为准）。
- 关键词与外链生成支持并行与降级（搜索失败时可返回无链接）。
