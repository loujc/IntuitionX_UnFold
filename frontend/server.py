"""
AI 对话后端服务
使用 Flask + ZhipuAI SDK 实现基于上下文的 AI 对话
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from zhipuai import ZhipuAI

app = Flask(__name__)
CORS(app)  # 允许跨域请求

# 初始化 ZhipuAI Client
client = ZhipuAI(api_key="f58dcc1618214194920cc743099fcb15.eizs6pcF3tygd8Qa")

@app.route('/api/chat', methods=['POST'])
def chat():
    """
    AI 对话接口
    接收用户消息和上下文，返回 AI 回复
    """
    try:
        # 获取请求数据
        data = request.get_json()
        user_message = data.get('message', '')
        context = data.get('context', '')

        if not user_message:
            return jsonify({'error': '消息不能为空'}), 400

        # 构建系统提示词
        system_prompt = f"""你是一个专业的视频内容助手。用户正在观看一个视频，你需要基于以下背景信息回答用户的问题。

背景信息：
{context}

请注意：
1. 如果用户的问题与视频内容相关，请优先基于背景信息回答
2. 如果背景信息中没有相关内容，可以基于通用知识回答
3. 回答要简洁、准确、友好
4. 使用中文回答"""

        # 调用 ZhipuAI API
        response = client.chat.completions.create(
            model="glm-4-flash",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            temperature=0.7,
            max_tokens=1000
        )

        # 提取回复内容
        ai_reply = response.choices[0].message.content

        return jsonify({
            'reply': ai_reply,
            'status': 'success'
        })

    except Exception as e:
        print(f"错误: {str(e)}")
        return jsonify({
            'error': f'服务器错误: {str(e)}',
            'status': 'error'
        }), 500

@app.route('/health', methods=['GET'])
def health():
    """健康检查接口"""
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    print("🚀 AI 对话服务启动在 http://localhost:8000")
    print("📡 接口地址: POST http://localhost:8000/api/chat")
    app.run(host='0.0.0.0', port=8000, debug=True)
