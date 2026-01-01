# TODO（中文版）

## 已确认的决策
- 参考规范：Agent_Spec_V2.md、Architecture_and_API_Spec.md、Agent_Spec_gemini.md。
- ASR 先用单 worker；切片仍保留，便于后续并行优化。
- 不接外部搜索；由 LLM 生成解释和链接。
- 上传文件存放在 temp/，暂不清理。
- 任务状态：queued/running/finished/failed；额外加 stage 表示子阶段。
- SSE 协议确认：事件类型 task_status/task_progress/task_result/ping，data 为 JSON。
- POST /api/v1/tasks 使用 multipart/form-data，mode 放表单字段。
- 给前端的结果不包含 raw/timing；raw 与 timing 独立存储。
- 字幕与关键词需要可索引。
- 字幕同时包含 segment_id 与 index；关键词的提及（mentions）指向 segment_id。
- index 使用 0-based；关键词以气泡显示，不需要文内高亮。
- 优先用 SQLite FTS5 做全文检索；不可用时降级 LIKE。

## 开放问题
- 无。

## 1. 工程骨架与配置
任务：
- 创建 app/ 结构：api/、core/、services/、workers/、db/、schemas/、utils/、prompts/。
- 增加 config.yaml（带注释默认值）；加载 .env + config.yaml 并做类型校验。
- 日志系统：包含 run_id 和 task_id 的上下文。
- 依赖清单 + 最小 README（运行命令）。
测试：
- 配置加载单元测试（覆盖 env 覆盖）。
- FastAPI 空实例烟测（能启动）。

## 2. 数据库模型与持久化
任务：
- 定义 SQLAlchemy 模型：Task、TaskResult（clean）、TaskRaw、TaskTiming、TaskLog。
- 增加 Segment、Keyword、KeywordMention、KeywordLink 模型，支持索引与快速查询。
- 字幕和关键词写入 DB，支持按 key/id 查询。
- DB 初始化与 session 管理工具。
测试：
- 临时 SQLite：插入任务、读取、更新状态。
- 校验 TaskResult 与 TaskRaw 分离存储。

## 3. 搜索索引（DB）
任务：
- 增加 FTS5 索引表（字幕/关键词）；不可用则降级 LIKE。
- 建立索引表与 task_id、segment/keyword 的映射。
测试：
- 插入样本文本后执行检索，验证命中。

## 4. JobManager 与任务生命周期
任务：
- 实现 JobManager 单例：内存任务缓存、job_queue、event_queues。
- worker 循环与阶段状态机：slicing -> asr -> merge -> llm_summary -> llm_keywords -> finalize。
- LLM 调用加入 tenacity 重试，失败次数入库。
测试：
- 单元测试：入队 task_id，模拟 worker 处理。
- 验证阶段流转与失败路径（状态更新 + 日志记录）。

## 5. 文件上传与切片
任务：
- 实现 POST /api/v1/tasks，接收文件与 mode。
- 保存至 temp/，稳定命名；写入输入元数据。
- ffmpeg 按 config.yaml 的切片时长切分。
测试：
- API 上传小文件，验证入队。
- 短视频切片，验证输出数量。

## 6. ASR 转写与合并
任务：
- 切片后调用 Faster-Whisper/MLX-Whisper 做 ASR。
- ASR 放入 ThreadPoolExecutor，MAX_ASR_WORKERS=1。
- 合并为全量字幕，生成 SRT/VTT；含 segment_id + index。
测试：
- 短音频转写，验证段落结构。
- SRT/VTT 生成并用简单解析器校验格式。

## 7. LLM 流水线（类型/总结/关键词）
任务：
- OpenAI SDK 客户端单例（base_url/model 可配）。
- 视频类型、摘要、关键词 prompt，输出 JSON。
- 支持 simple/deep 模式影响关键词提取。
- 关键词提及映射到 segment_id，便于跳转。
测试：
- Mock LLM 返回 JSON，校验解析与字段结构。
- 验证 mode 会影响 prompt 内容。

## 8. 结果组装与存储
任务：
- 组装 clean result（不含 raw/timing），包含 segments 与 keywords/mentions。
- raw 与 timing 分表存储。
测试：
- /result 不包含 raw/timing。
- raw/timing 可经 debug 接口取回。

## 9. SSE 事件流
任务：
- 实现 /api/v1/tasks/{task_id}/events（text/event-stream）。
- 状态变化、进度更新、完成事件推送。
- 事件类型固定为 task_status/task_progress/task_result/ping。
- 设定 keepalive ping。
测试：
- httpx/curl 连接并校验事件顺序。
- 断开连接时清理 event queue。

## 10. 读取型 API
任务：
- GET /api/v1/tasks/{task_id}（状态+stage）。
- GET /api/v1/tasks/{task_id}/result（clean JSON）。
- GET /api/v1/tasks/{task_id}/segments 和 /segments/{segment_id}。
- GET /api/v1/tasks/{task_id}/raw 和 /timing（debug）。
测试：
- FastAPI TestClient 覆盖所有接口。
- 错误场景：task_id 不存在、结果未生成、任务失败。

## 11. 可观测性与性能
任务：
- 记录各阶段耗时到 TaskTiming。
- 关键事件与 LLM 异常日志带 task 上下文。
- 文档注明 20-30s 目标与可调参数。
测试：
- Mock clock 测试耗时采集。
- 手工跑短视频并记录时间。

## 12. 提交规范（暂缓）
任务：
- 需要时再恢复按步提交。
测试：
- 无。
