# AI 对话功能使用指南

## 📦 已完成的功能

### 1. 后端服务 (`server.py`)
- ✅ Flask API 服务（端口 8000）
- ✅ ZhipuAI SDK 集成（glm-4-flash 模型）
- ✅ 基于上下文的 AI 对话
- ✅ CORS 跨域支持

### 2. 前端组件 (`DetailChatPanel`)
- ✅ 完全保留 Figma 绝对定位布局
- ✅ 动态消息列表渲染
- ✅ 打字机效果（30ms 逐字显示）
- ✅ 自动滚动到底部
- ✅ 根据视频时间定位章节和字幕上下文
- ✅ 输入框交互（输入、发送、回车）

---

## 🚀 启动步骤

### 第 1 步：安装 Python 依赖

```bash
# 在项目根目录执行
pip install -r requirements.txt
```

### 第 2 步：启动后端服务

```bash
python server.py
```

看到以下输出表示启动成功：
```
🚀 AI 对话服务启动在 http://localhost:8000
📡 接口地址: POST http://localhost:8000/api/chat
```

### 第 3 步：启动前端开发服务器

```bash
npm run dev
# 或
yarn dev
```

### 第 4 步：测试功能

1. 访问前端页面，导航到详情页（有 DetailChatPanel 的页面）
2. 在聊天输入框输入问题，例如：
   - "为什么医院的药便宜？"
   - "视频主要讲了什么？"
   - "电商平台买药有什么优势？"
3. 观察打字机效果和 AI 回复

---

## 🎯 核心逻辑说明

### 上下文提取算法

组件根据 `currentTime`（当前视频时间，默认 150 秒）提取上下文：

```typescript
// 1. 定位章节总结
const chapter = videoData.summary.by_slice.find(
  slice => currentTime >= slice.start && currentTime < slice.end
);

// 2. 定位当前字幕（前后各 10 条）
const currentIndex = segments.findIndex(
  seg => currentTime >= seg.start && currentTime <= seg.end
);
const subtitles = segments.slice(
  Math.max(0, currentIndex - 10),
  Math.min(segments.length - 1, currentIndex + 10)
);

// 3. 拼接上下文
const context = `当前章节总结：${chapter.summary}\n\n当前视频字幕片段：${subtitles.join('')}`;
```

### 发送到后端的数据格式

```json
{
  "message": "用户问题",
  "context": "当前章节总结：...\n\n当前视频字幕片段：..."
}
```

### 后端处理流程

```python
# 1. 构建系统提示词，包含上下文
system_prompt = f"""你是一个专业的视频内容助手...
背景信息：{context}
"""

# 2. 调用 ZhipuAI API
response = client.chat.completions.create(
    model="glm-4-flash",
    messages=[
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_message}
    ]
)

# 3. 返回 AI 回复
return {"reply": ai_reply, "status": "success"}
```

---

## 🔧 配置说明

### currentTime 的传递

目前 `currentTime` 有默认值 150 秒。要传递真实的视频时间：

```tsx
// 在调用 DetailChatPanel 的地方
<DetailChatPanel currentTime={videoCurrentTime} />
```

### 修改 API 地址

如果后端不在 `localhost:8000`，修改 `src/App.tsx` 第 1171 行：

```typescript
const response = await fetch('http://YOUR_API_URL/api/chat', {
  // ...
});
```

### 修改打字机速度

修改 `src/App.tsx` 第 1151 行：

```typescript
}, 30); // 30ms 逐字显示，可改为 50、100 等
```

---

## 📁 文件结构

```
项目根目录/
├── server.py                    # 后端服务
├── requirements.txt             # Python 依赖
├── AI_CHAT_README.md           # 本文档
├── src/
│   └── App.tsx                 # 前端组件（包含 DetailChatPanel）
└── public/
    └── data/
        └── test1.json          # 视频数据（章节总结 + 字幕）
```

---

## ⚠️ 注意事项

1. **API Key 安全**：当前 API Key 硬编码在 `server.py` 中，生产环境请使用环境变量。

2. **CORS 配置**：如果前端和后端在不同域名，确保 CORS 配置正确。

3. **test1.json 路径**：前端通过 `/data/test1.json` 加载数据，确保文件在 `public/data/` 目录下。

4. **打字机效果的内存管理**：组件卸载时会自动清理 interval，无需担心内存泄漏。

---

## 🐛 常见问题

### Q1: 后端启动失败
```
ModuleNotFoundError: No module named 'flask'
```
**解决**：运行 `pip install -r requirements.txt`

### Q2: 前端无法连接后端
```
Failed to fetch
```
**解决**：
1. 确认后端已启动（`python server.py`）
2. 检查端口是否被占用
3. 查看浏览器控制台的 Network 标签，确认请求 URL

### Q3: 没有 AI 回复
**检查**：
1. 后端控制台是否有错误日志
2. API Key 是否有效（可在智谱 AI 官网查看）
3. 网络是否能访问智谱 AI API

### Q4: 打字机效果卡顿
**解决**：增大 interval 时间（如改为 50ms）

---

## 📞 联系方式

如有问题，请检查：
1. 浏览器控制台（F12）的 Console 和 Network 标签
2. 后端控制台的日志输出
