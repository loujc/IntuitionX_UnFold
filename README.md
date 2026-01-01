# UnFold.AI

![UnFold.AI](./front.png)

**UnFold.AI** 是一款 AI 驱动的视频智能注释系统。上传视频后，系统自动生成：

- 📝 **带时间戳的字幕** - 精准的语音转文字
- 📊 **视频类型分类** - 自动识别内容类型
- 📖 **章节划分** - 智能分段，清晰导航
- 💡 **摘要与关键词** - 核心内容一目了然
- ✨ **金句提取** - 高亮精彩瞬间
- 🔍 **关键词解释** - 深入理解专业术语

系统采用 **切片并行 + ASR + LLM** 管线架构，通过 SSE 实时推送处理进度，结果入库可检索。

---

## 📁 项目结构

```
IntuitionX/
├── front.png              # 产品 Logo
├── README.md              # 本文件
│
├── gemini/                # 后端服务 (FastAPI + Python)
│   ├── main.py            # FastAPI 入口
│   ├── app/
│   │   ├── api/           # API 路由
│   │   ├── core/          # 配置与常量
│   │   ├── db/            # 数据库与搜索
│   │   ├── models/        # 数据模型
│   │   ├── prompts/       # LLM Prompt 模板
│   │   └── services/      # 核心服务 (切片/ASR/LLM)
│   ├── spec/              # 技术文档
│   ├── tests/             # 单元测试
│   └── requirements.txt   # Python 依赖
│
└── front_ljc/             # 前端应用 (React + Vite)
    ├── src/
    │   ├── components/    # UI 组件
    │   ├── pages/         # 页面组件
    │   └── lib/           # 工具函数
    ├── package.json       # Node.js 依赖
    └── vite.config.ts     # Vite 配置
```

---

## 🚀 快速开始

### 环境要求

- Python 3.10+
- Node.js 18+
- FFmpeg（用于视频切片）

### 1. 克隆项目

```bash
git clone <repository-url>
cd IntuitionX
```

### 2. 后端安装与配置

```bash
cd utils

# 创建虚拟环境（推荐）
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt
```

**配置环境变量**（创建 `gemini/.env` 文件）：

```env
# Gemini API（用于 ASR 语音转写）
GEMINI_API_KEY=your_gemini_api_key

# LLM API（用于摘要/章节/关键词等）
LLM_API_KEY=your_llm_api_key
LLM_BASE_URL=https://api.openai.com/v1  # 或其他兼容端点
LLM_MODEL=gpt-4o                         # 或其他模型名称
```

> 💡 **提示**: LLM 配置支持 OpenAI API、Azure OpenAI、以及任何兼容 OpenAI API 格式的本地模型（如 Ollama、vLLM）。

**启动后端**：

```bash
uvicorn main:app --reload --port 8000
```

后端服务将运行在 `http://localhost:8000`

### 3. 前端安装与启动

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端将运行在 `http://localhost:3000`

> ⚠️ **说明**: 由于黑客松时间限制，当前前端为静态展示版本，使用真实后端处理结果的 JSON 数据。未来版本将集成完整的后端 API 调用。

**部署前端（生产环境）**：

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

构建后的静态文件位于 `front_ljc/dist/` 目录，可部署到任何静态托管服务（Vercel、Netlify、GitHub Pages 等）。

---

## 📡 API 使用

### 上传视频

```bash
curl -X POST http://localhost:8000/api/jobs \
  -F "file=@your_video.mp4"
```

### 查询任务状态（SSE 实时推送）

```bash
curl -N http://localhost:8000/api/jobs/{job_id}/events
```

### 获取处理结果

```bash
curl http://localhost:8000/api/jobs/{job_id}
```

详细 API 文档请参阅 `gemini/spec/Architecture_and_API_Spec.md`

---

## 🎬 视频规格

| 参数 | 规格 |
|------|------|
| 时长限制 | 1 小时以内 |
| 文件大小 | 无硬限制（受限于服务器内存） |
| 推荐格式 | MP4 |
| 支持格式 | MP4, MOV, AVI, MKV 等常见格式 |

---

## 🔧 处理管线

系统采用 8 阶段处理管线：

```
slicing → asr → merge → llm_summary → llm_chapters → llm_quotes → llm_keywords → finalize
   │       │      │          │             │             │             │            │
   ↓       ↓      ↓          ↓             ↓             ↓             ↓            ↓
 切片    语音    合并       摘要          章节          金句         关键词        完成
        转写    字幕       生成          划分          提取          解释
```

每个阶段完成后通过 SSE 实时推送进度和结果。

---

## 🛠️ 常见问题

### FFmpeg 未安装

```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt install ffmpeg

# Windows
# 下载: https://ffmpeg.org/download.html
```

### API Key 配置问题

确保 `.env` 文件中的 API Key 格式正确：
- Gemini API Key: 在 [Google AI Studio](https://aistudio.google.com/) 获取
- OpenAI API Key: 在 [OpenAI Platform](https://platform.openai.com/) 获取

### 端口冲突

如需更改端口：
- 后端: `uvicorn main:app --port 8001`
- 前端: 修改 `front_ljc/vite.config.ts` 中的 `server.port`

---

## 📄 许可证

本项目采用商业许可证。如需商业使用或合作，请联系：

📧 **jinchenglou@stu.pku.edu.cn**

---

## 🤝 贡献与反馈

欢迎提交 Issue 和 Pull Request！

如有问题或建议，请联系：**jinchenglou@stu.pku.edu.cn**
