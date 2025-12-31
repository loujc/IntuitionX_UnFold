# IntuitionX

IntuitionX 是一个 AI 视频字幕注释产品：输入视频（上传/URL/本地路径），输出
带时间戳字幕、视频类型、摘要与关键词解释，并通过 API + SSE 提供实时进度。
系统采用“切片并行 + ASR + LLM”管线，结果入库可检索，便于前端以气泡形式展示关键词。

## 目录结构（规划）
- gemini/：AI Agent + 后端实现（FastAPI）
- frontend/：前端应用（待实现）
- codex/：规格文档与接口设计
- video/：本地测试素材（可选，不建议入库）

## 备注
- 后端实现与运行说明见 `gemini/README.md`。
