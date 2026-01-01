# Agent 功能与实现路径

## 1. Agent 架构
- Router/Orchestrator：创建任务，拆分阶段，调度 worker
- VideoProcessor：抽音、切片、时长校验
- ASRWorker：并行转写 + 语言识别
- Summarizer：分段总结 + 汇总
- KeywordAgent：关键词抽取 + 解释
- SearchAgent：外链检索与引用

## 2. 视频转写与总结
### 2.1 输入/输出
- 输入：视频文件（本地路径/URL/上传）
- 输出：SRT/VTT/JSON 字幕、分段总结、全量总结、视频类型

### 2.2 处理步骤
1. 校验：格式、时长（<=40min）、hash 去重（本地路径或 URL 优先）
2. 抽音：FFmpeg 转 16kHz mono wav
3. 语言识别：ASR 内置检测或轻量检测模型
4. 切片：45s 窗口 + 2s overlap，并行 ASR
5. 合并：按时间偏移合并字幕，输出 JSON/SRT/VTT
6. 轻量纠错（可选）：LLM 只修正文案，不改时间戳
7. 分段总结：Map 阶段将 `video_meta.title`/话题提示注入 Prompt，避免缺失上下文
8. 全量总结：Reducer 按时间顺序合并 summary_segments，生成连贯的 summary_full（补齐过渡）
9. 分类：基于全量字幕输出 video_type（风格由用户选择，不由 Orchestrator 推断）

### 2.3 视频类型集合（建议）
Technology / Education / Gaming / Music / News / Finance / Sports / Lifestyle / Vlog / Entertainment / Film / Animation

## 3. 关键词抽取与解释
### 3.1 输入/输出
- 输入：视频类型 + 风格 + 带时间戳字幕
- 输出：关键词 + 解释 + 外链 + context_blob

### 3.2 处理策略（Two-Pass）
1. 粗筛候选：规则/词典/TF-IDF + LLM 识别“生僻/梗”
2. 解释生成：短解释 + 长解释并存
3. 风格控制：style 选项固定（popular_science / academic / casual）
4. 外链检索：Search API 获取 1-2 条来源，失败则降级
5. 去重合并：跨切片全局去重，同一术语仅保留最早或最高 importance 的一条记录

### 3.3 模式控制
- brief：少量关键词 + 简短解释
- deep：更多关键词 + 详细解释

## 4. 并行与重试
- ASR/关键词处理并行，使用可配置并发
- LLM/搜索 API 必须指数退避重试
- 降级策略：搜索失败返回空链接，LLM 失败返回空数组

## 5. 处理流程图（Pipeline）
```mermaid
flowchart LR
  A[Frontend Upload/URL] --> B[API: Create Task]
  B --> C[Download or Save Video]
  C --> D[FFmpeg Extract Audio]
  D --> E[Chunk + Language Detect]
  E --> F[ASR Workers (Parallel)]
  F --> G[Merge Transcript]
  G --> H[Segment Summaries (Parallel)]
  H --> I[Full Summary + Video Type]
  G --> J[Keyword Extract + Explain]
  J --> K[Search Links]
  I --> L[Persist Results]
  K --> L
  L --> M[API: Result/Status]
```

## 6. 数据流图（DFD）
```mermaid
flowchart TB
  FE[Frontend] --> API[FastAPI]
  API --> DB[(Database)]
  API --> OS[(Object Storage)]
  API --> Q[Task Queue]
  Q --> VP[Video Processor]
  VP --> ASR[ASR Engine]
  ASR --> DB
  VP --> LLM[LLM API (OpenAI Compatible, China-only)]
  VP --> SEARCH[Search API]
  LLM --> DB
  SEARCH --> DB
  DB --> API
  OS --> API
```
