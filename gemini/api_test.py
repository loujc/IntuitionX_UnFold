# from openai import OpenAI
 
# client = OpenAI(
#     base_url="http://127.0.0.1:8045/v1",
#     api_key="sk-9186032f910744db84253ae288232161"
# )
 
# response = client.chat.completions.create(
#      model="gemini-3-flash",
#      messages=[{"role": "user", "content": "你好啊"}]
# )
 
# print(response.choices[0].message.content) 

import os
from google import genai

api_key = os.getenv("GEMINI_API_KEY") or os.getenv("LLM_API_KEY")
if not api_key:
    raise SystemExit("Missing GEMINI_API_KEY/LLM_API_KEY")

model = os.getenv("LLM_MODEL") or "gemini-1.5-flash"
client = genai.Client(api_key=api_key)
resp = client.models.generate_content(model=model, contents="Hello")
print(resp.text)