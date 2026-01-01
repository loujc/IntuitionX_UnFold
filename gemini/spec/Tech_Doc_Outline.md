# IntuitionX: The Insight Engine
> **Making Video Knowledge "Clickable"**

IntuitionX 不是一个简单的转写工具，它是视频内容的“高亮笔”和“索引卡”。我们的目标是把 **2 小时的视频** 压缩进 **30 秒的直觉**，让那些沉睡在进度条里的知识变得 **可搜索、可引用、可交互**。

---

## The Tech Stack (Under the Hood)
> "Light on weight, heavy on capability."

我们选用了一套 **Modern Python + Async Native** 的技术栈，既保证了黑客松需要的开发速度，也为生产环境预留了高性能扩展能力。

*   **Core**: Python 3.10+ & **FastAPI** (High-perf Async Framework)
*   **Orchestration**: **Asyncio Native Event Loop** (Non-blocking I/O)
*   **Hearing**: **Faster-Whisper** & **MLX-Whisper** (Auto-switching / Apple Silicon Accelerated)
*   **Vision**: **FFmpeg** (Battle-tested Media Processing)
*   **Brain**: **OpenAI Python SDK** (Prompt Engineering & Structured Output)
*   **Memory**: **SQLite + SQLAlchemy** (Zero-conf, ACID Compliant, Full-Text Search Ready)

---

## The Journey: From Pixels to Insights

### 1. The Portal (入园与接引)
**“一切从这里开始。”**

*   **Product Thinking**: 上传不只是传输，它是用户意图的投射。在这里，系统不仅接收文件，更在瞬间完成格式探测与指纹生成。用户按下开始的那一刻，我们就已经为其分配了专属的“游园向导”（Task Worker）。
*   **Tech Highlight**: 利用 **FastAPI** 的异步流式上传能力，配合 UUID 生成唯一任务空间，确保高并发下的请求隔离与快速响应。

### 2. Divide & Conquer (化整为零)
**“把巨石切成好搬运的砖块。”**

*   **Product Thinking**: 长视频的处理痛点永远是“慢”和“不稳定”。我们的策略是并行的艺术——将长视频切分为独立处理的原子单元，既能跑满多核 CPU，又能让任何一段的失败不影响整体。
*   **Tech Highlight**: **FFmpeg** 精确切片，音频转码为 16kHz 单声道（ASR 最佳拍档）。通过 **ThreadPoolExecutor** 实现 CPU 密集型任务的并发调度，榨干每一滴算力。

### 3. Voice to Verbatim (听见真相)
**“不仅要听得快，还要听得准。”**

*   **Product Thinking**: 文本是理解的基石。在这一层，我们追求极致的转写速度。系统会自动感知运行环境，如果是 Mac 环境则自动切换至 MLX 引擎加速，仿佛给车换上了火箭推进器。
*   **Tech Highlight**: **Dynamic ASR Backend**。根据硬件环境自动路由至 **Faster-Whisper** (CTranslate2) 或 **MLX-Whisper**，实现跨平台的最优推理性能。

### 4. The Alignment (时间线编织)
**“把碎片拼回完整的拼图。”**

*   **Product Thinking**: 仅仅有文字是不够的，用户需要的是“带时间轴的剧本”。我们将碎片化的识别结果重新校准，修补切口处的断句，生成标准 SRT/VTT 字幕，让每一句话都能精准回溯到视频的某一帧。
*   **Tech Highlight**: **Timestamp Reconstruction Algorithm**。处理分片 Offset，自动修正边缘时间戳，确保合并后的字幕流丝般顺滑，直接兼容 HTML5 `<track>` 标签。

### 5. Semantic Understanding (大脑时刻)
**“从‘说了什么’到‘讲了什么’。”**

*   **Product Thinking**: 这是 Agent 的核心魔法。模型首先像鉴赏家一样识别视频类型（播客？教程？会议？），然后以此为上下文，生成“分段摘要”和“全篇总结”。这不只是概括，这是在为用户画重点。
*   **Tech Highlight**: **LLM Chain of Thought**。利用 LLM 的 Context Window，配合精心设计的 Prompt Template，一次性输出结构化 JSON，包含 Summary, Chapters 以及 Type Classification。

### 6. Knowledge Linking (构建超链接)
**“让视频像维基百科一样可点击。”**

*   **Product Thinking**: 我们最酷的功能。Deep Mode 下，Agent 会挖掘视频中的行话、术语和关键概念，并把它们变成可点击的“注释气泡”。点击一个关键词，不仅看到解释，还能直接跳转到视频里提到它的那一秒。
*   **Tech Highlight**: **Keyword Extraction & Grounding**。让 LLM 提取实体（Entities），并基于 Fuzzy Matching 或 Embedding 搜索，将其锚定（Ground）回具体的 Transcript Segment。

### 7. Asset Crystallization (落袋为安)
**“交付价值。”**

*   **Product Thinking**: 所有计算的终点，是用户手中的资产。我们不仅返回前端可渲染的数据，更将结构化信息持久化。这些数据是未来的宝藏——它们让视频变得可以被 SQL 查询、被向量检索。
*   **Tech Highlight**: **Structured Data Lake**. 所有的 Log, Raw Output, Clean Metadata 全部存入 **SQLite**，并建立关联索引，为后续的 FTS5 全文检索和 RAG（检索增强生成）做好准备。

---

## 8. The Frontend (The Last Mile / 占位)
**“交互的画布。”**

(Coming Soon: 这里将描述我们如何用流畅的 UI component 把上述数据编织成一个沉浸式的播放体验。Timeline Scrubbing, Keyword Popovers, Sidebar Summaries...)
