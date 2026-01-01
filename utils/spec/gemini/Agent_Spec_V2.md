# IntuitionX Agent Spec V4 (Final Simplified)

## 1. 核心规范与配置 (Configuration)

### 1.1 基础配置
所有敏感信息走 `.env`，业务参数走 `config.yaml`。
```yaml
runtime:
  max_llm_concurrency: 10
  
system:
  video_types: ["History", "Anime", "Finance", "Course"]
  default_mode: "simple"

processing:
  chunk_duration: 300   # 切片时长即 5分钟
  enable_chunking: true

asr:
  backend: "auto"       # faster-whisper / mlx-whisper
  model_size: "medium"  # Adjustable

llm:
  base_url: "http://127.0.0.1:8045/v1" # Example
  model_name: "gemini-3-flash"
  api_key: "${LLM_API_KEY}"
```

## 2. LLM 调用规范 (LLM Client)

**Standard Implementation Requirement**:
所有 Agent 必须使用 `openai` 官方库进行调用，禁止使用非标准 HTTP 请求，以便未来无缝切换供应商。

```python
from openai import OpenAI
import os

# Client Initialization (Singleton recommended)
client = OpenAI(
    base_url=config.llm.base_url,
    api_key=os.getenv("LLM_API_KEY") 
)

def call_llm(prompt: str, system_prompt: str = "You are a helpful assistant."):
    try:
        response = client.chat.completions.create(
            model=config.llm.model_name,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3
        )
        return response.choices[0].message.content
    except Exception as e:
        # 必须做好错误捕获，配合 tenacity 重试
        logger.error(f"LLM Call Failed: {e}")
        raise e
```

## 3. Agent 业务流程 (Agent Flows)

### 3.1 视频处理 (Chunked Parallel Flow)
1.  **Split (Slicing)**: 
    *   使用 `ffmpeg` 将 Input Hash 切割为多个音频片段 (e.g. `chunk_0.wav`, `chunk_1.wav`...)。
    *   Command: `ffmpeg -i input.mp4 -f segment -segment_time 300 -c copy audio_%03d.wav` (或类似逻辑).
2.  **Parallel ASR**: 
    *   JobManager 调度 Worker 对每个 Chunk 进行 Transcribe。
    *   Worker 限制: `MAX_ASR_WORKERS` (默认 1，防止 OOM).
3.  **Merge**:
    *   按照 Chunk 顺序合并所有 Segments，修正 timestamp 偏移量 (Offset = chunk_index * 300s)。
4.  **Parallel Analysis**:
    *   **Prompt Injection**: 必须将 `video_type` 和 `mode` 注入 Prompt。
    *   **Task A (Summary)**: Chunk text -> Summarize -> Reduce.
    *   **Task B (Terms)**: Full text -> Extract Candidates (Mode dependent) -> Verify.

### 3.2 术语挖掘详解
1.  **Extraction Prompt**: 
    *   "Context is a video about `{{ video_type }}`."
    *   "Extraction Mode: `{{ mode }}`."
        *   If `mode == 'simple'`: "Extract only highly obscure terms, brief definition."
        *   If `mode == 'deep'`: "Extract technical terms, detailed definition."
2.  **External Search (Optional)**: 
    *   如果配置了并且能联网，调用 Google/Bing Search API。
    *   如果不能联网或 demo 简化，直接让 LLM 解释："Explain these terms."
3.  **Synthesis**: 生成最终注释卡片数据。

## 4. 异常处理
*   **API Error**: 当 LLM 服务挂了，Worker 应该捕获异常，Mark Task as `FAILED`，并记录 Error Log。
*   **OOM (Out of Memory)**: 即使切片，ASR 依然耗内存，严格遵守 Worker 数量限制。
