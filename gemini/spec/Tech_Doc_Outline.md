# 四、技术报告（Technical Realization Report）
> **Agent & Backend Implementation / 楼锦程 王子怡**
>
> "IntuitionX 的后端不仅仅是一个 API Server，它是一个协同了听觉（ASR）、视觉（FFmpeg/Vision）、认知（LLM）与记忆（DB）的智能生命体。我们将复杂的异步任务流封装在极简的接口之下，确保每一次‘理解’都快如直觉。"

---

## 4.1 技术栈 (The Stack)
> **"Lightweight, Async-Native, & Hardware-Aware"**

我们选用了一套专为高并发 I/O 和计算密集型混合场景设计的技术架构。

*   **Core Framework**: **Python 3.10+ & FastAPI**. 选择 FastAPI 是因為其原生支持 Python `asyncio`，能够完美处理文件上传、SSE 事件流推送等长连接场景，同时自动生成 OpenAPI 文档，极大降低前后端联调成本。
*   **Orchestration**: **Asyncio Native Event Loop**. 摒弃了 Celery 等重型队列，利用 Python 原生协程实现轻量级的任务编排。结合 `asyncio.Queue` 和内存状态管理，实现了零外部依赖的任务调度。
*   **Inference Engine (Hearing)**: **Dynamic Backend Strategy**.
    *   **Faster-Whisper (CTranslate2)**: 在标准 Linux/Intel 环境下提供 4x 推理加速。
    *   **MLX-Whisper**: 针对 Apple Silicon (M-series) 芯片进行专门优化，利用统一内存架构实现本地极速转写。
*   **Media Processing**: **FFmpeg**. 视频切片、音频提取、格式转码的瑞士军刀。
*   **Cognition**: **OpenAI Python SDK**. 统一的大模型调用接口，支持 Structured Outputs (JSON Mode)，确保 Agent 输出的数据严格符合前端 Schema。
*   **Data & Search**: **SQLite + SQLAlchemy + FTS5**. 单文件数据库实现 ACID 事务，内置的 FTS5 模块无需额外部署 ES 即可实现毫秒级的全文检索。

---

## 4.2 实现逻辑与架构 (The Flow)

我们的核心是一个 **多阶段流水线（Multi-Stage Pipeline）**。传统的串行处理会导致长视频的等待时间不可接受，因此我们采用了 **“分治策略（Divide & Conquer）”**。

**(附架构图说明)**:
`Client (Upload) -> Task Manager (Queue) -> Video Splitter -> [Parallel ASR Workers] -> Merger & aligner -> LLM Cognition -> Knowledge Linking -> DB`

### Phase 1: Ingestion & Splitting (吞吐与切分)
*   **逻辑**: 当视频上传时，系统通过流式写入减少内存占用。随即调用 `VideoSplitter` 将视频按固定步长（如 5 分钟）切分为独立音频段。
*   **技术点**: 利用 FFmpeg 的关键帧对其能力，确保切片处声音不被截断 (Audio Gap/Overlap Handling)。

### Phase 2: Parallel Perception (并行感知)
*   **逻辑**: 切分后的音频段进入 `ThreadPoolExecutor`。这里是计算最密集的环节。系统并行启动多个 Whisper 实例进行转写。
*   **技术点**: 实现了由 `MAX_WORKERS` 控制的信号量机制，防止过度并发导致显存/内存溢出。

### Phase 3: Alignment & Fusion (校准与融合)
*   **逻辑**: 拿到碎片的 Transcript 后，需要将其还原回原始视频的时间轴。
*   **技术点**: **Timestamp Reconstruction**. 我们设计了一个偏移量校准算法，将 `Segment[i]` 的相对时间戳加上 `Offset[i]`，无缝拼接成全局绝对时间戳，并重新生成符合 SRT 标准的字幕流。

### Phase 4: Cognitive Processing (认知加工)
*   **逻辑**: 这是 Agent 的“思考”时刻。我们将合并后的全量文本送入 LLM。
    *   **Step A: Classification**. 识别视频类型（教程/访谈/叙事），决定后续的摘要风格。
    *   **Step B: Summarization**. 生成带有时间戳的分段摘要（Chapters）。
    *   **Step C: Entity Extraction**. 提取关键词（Keywords）。
*   **技术点**: **Structured Prompting**. 通过 System Prompt 强制模型返回 JSON 格式，包含 `start_time`, `end_time`, `title`, `description` 等字段，直接对应前端组件。

### Phase 5: Grounding & Linking (锚定与链接)
*   **逻辑**: 仅仅有关键词是不够的，我们需要知道它们出现在哪里。Agent 会反向遍历字幕，模糊匹配实体出现的位置。
*   **技术点**: **Fuzzy Anchoring**. 解决 LLM 输出的词形可能与 ASR 转写不完全一致的问题，将抽象概念“钉”回具体的时间轴坐标。

---

## 4.3 数据流向 (Data Flow)

整个系统的数据流向遵循 **“从非结构化到结构化（Unstructured to Structured）”** 的熵减过程。

1.  **Input**: Raw Video File (`mp4/mov`) + User Intent (`simple/deep mode`)
2.  **Intermediate Layer (File System)**:
    *   `chunks/*.wav`: 切片后的音频中间态。
    *   `transcripts/*.json`: 原始 ASR 结果。
3.  **Persistence Layer (SQLite)**:
    *   `Tasks Table`: 任务状态机（Pending -> Processing -> Completed）。
    *   `Segments Table`: 每一句字幕文本及其时间戳。
    *   `Keywords Table`: 提取出的知识点及其解释。
4.  **Output Layer (API)**:
    *   SSE Stream: 实时推送进度百分比（Progress Bar）。
    *   Final Payload: 包含字幕下载链接、摘要卡片数据、关键词索引的完整 JSON 包。
