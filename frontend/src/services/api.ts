import type {
  CreateTaskRequest,
  CreateTaskResponse,
  Task,
  TaskResult,
  SSEEvent,
} from '../types';

/**
 * API 基础 URL
 */
const API_BASE_URL = '/api/v1';

/**
 * API 服务类
 * 封装所有后端 API 调用
 */
class ApiService {
  /**
   * 创建视频分析任务
   * @param request 任务请求参数
   */
  async createTask(request: CreateTaskRequest): Promise<CreateTaskResponse> {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`创建任务失败: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * 查询任务状态
   * @param taskId 任务ID
   */
  async getTaskStatus(taskId: string): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/status`);

    if (!response.ok) {
      throw new Error(`查询任务状态失败: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * 获取任务结果
   * @param taskId 任务ID
   */
  async getTaskResult(taskId: string): Promise<TaskResult> {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/result`);

    if (!response.ok) {
      throw new Error(`获取任务结果失败: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * 创建 SSE 连接
   * @param taskId 任务ID
   * @param onMessage SSE 消息回调
   * @param onError 错误回调
   */
  createSSEConnection(
    taskId: string,
    onMessage: (event: SSEEvent) => void,
    onError?: (error: Event) => void
  ): EventSource {
    const eventSource = new EventSource(`${API_BASE_URL}/tasks/${taskId}/events`);

    eventSource.onmessage = (event) => {
      try {
        const data: SSEEvent = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error('SSE 消息解析失败:', error);
      }
    };

    if (onError) {
      eventSource.onerror = onError;
    }

    return eventSource;
  }

  /**
   * 上传视频文件（multipart/form-data）
   * 注意：Demo 推荐使用本地路径模式，此方法仅供参考
   */
  async uploadVideo(
    file: File,
    mode: string,
    style: string,
    language: string = 'auto'
  ): Promise<CreateTaskResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mode', mode);
    formData.append('style', style);
    formData.append('language', language);
    formData.append('return_formats', JSON.stringify(['srt', 'vtt', 'json']));

    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`上传视频失败: ${response.statusText}`);
    }

    return response.json();
  }
}

/**
 * 导出 API 服务单例
 */
export const apiService = new ApiService();
