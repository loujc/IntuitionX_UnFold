# IntuitionX Spec Index

本目录为后端/Agent spec 拆分版。核心约束：
- 仅允许使用中国境内或自建的 OpenAI 兼容 LLM API（禁止调用境外 API）。
- 支持本地上传与 URL 拉取，最长视频 40 分钟。
- 多语言与自动语言识别。

文档清单：
- `Spec_Dev_Guidelines.md`：开发规范与技术栈建议
- `Spec_Interface.md`：模块接口/数据结构/配置规范
- `Spec_API.md`：HTTP API 规范
- `Spec_Agent.md`：Agent 功能与实现路径
- `Mock_Examples_and_Flow.md`：前端联调 Mock JSON 与状态流转图

运行配置：
- `codex/.env`（LLM base_url、api_key 等）
