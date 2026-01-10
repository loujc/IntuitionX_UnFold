# 开发流程（Step-by-Step）

用于自动化执行 `gemini/spec/TODO.md` 中的每一步，保证过程一致、可复盘。

## 约定
- 规范来源：只以 `gemini/spec/` 为准。
- 所有开发工作在 branch `zhuyaxuan-dev` 上进行。
- 每完成一个 TODO 步骤，必须 **commit + push**。
- 每一步结束前，需调用 **当前对话 Agent** 做 review，并按建议修改。
- 修改与测试结果写入 `HISTORY.md` 与 `gemini/HISTORY.md`。

## 每一步标准流程
1. **规划**
   - 读取 `gemini/spec/TODO.md` 当前步骤。
   - 输出详细实施计划（文件清单、关键逻辑、测试）。
2. **执行**
   - 按计划完成代码、配置、文档与测试。
   - 运行测试并记录结果。
3. **Agent Review**
   - 请求 **当前对话 Agent** 进行 review，提示词示范：
     ```
     TODO.md 中的第X步已完成，spec 都在 spec 文件夹中, 请你帮忙 review 一下，所有的工程在 gemini 文件夹下,看看有没有什么建议和问题
     ```
   - 记录 Agent 的 review 输出，并给出自己的判断（采纳/不采纳/原因）。
4. **Agent 修改**
   - 将「review 输出 + 你的判断」一起发给当前对话 Agent，请其直接修改工程代码。
   - 必要时同步更新 HISTORY 记录。
5. **Agent 复核**
   - Agent 在当前会话中复核改动，确认无误。
6. **提交与推送**
   - `git add ...`
   - `git commit -m "<message>"`
   - 若远端有更新：`git pull --rebase origin zhuyaxuan-dev`
   - `git push origin zhuyaxuan-dev`
7. **进入下一步**
   - 重复上述流程直到 TODO 完成。
