/**
 * API 配置文件
 * 定义后端服务的基础 URL 和接口端点
 */

// 基础 URL - 可通过环境变量覆盖
export const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// API 端点
export const API_ENDPOINTS = {
  // 任务相关接口
  createTask: `${BASE_URL}/api/v1/tasks`,
  getTaskEvents: (taskId: string) => `${BASE_URL}/api/v1/tasks/${taskId}/events`,
  getTaskResult: (taskId: string) => `${BASE_URL}/api/v1/tasks/${taskId}/result`,
} as const;

// SSE 阶段到中文提示的映射
export const STAGE_MESSAGES: Record<string, string> = {
  slicing: '正在切片...',
  asr: '语音识别中...',
  llm_summary: 'AI 智能总结中...',
  llm_keywords: '提取关键词中...',
  finalize: '正在完成...',
} as const;
