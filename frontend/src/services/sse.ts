import { apiService } from './api';
import { useVideoStore } from '../store/useVideoStore';
import type { SSEEvent } from '../types';

/**
 * SSE 连接管理器
 * 管理多个任务的 Server-Sent Events 连接
 */
class SSEManager {
  private connections: Map<string, EventSource> = new Map();

  /**
   * 为任务创建 SSE 连接
   * @param taskId 任务ID
   */
  startListening(taskId: string): void {
    // 如果已存在连接，先关闭
    if (this.connections.has(taskId)) {
      this.stopListening(taskId);
    }

    console.log(`🔔 开始监听任务 ${taskId} 的 SSE 事件`);

    const eventSource = apiService.createSSEConnection(
      taskId,
      (event: SSEEvent) => this.handleSSEMessage(taskId, event),
      (error) => this.handleSSEError(taskId, error)
    );

    this.connections.set(taskId, eventSource);
  }

  /**
   * 停止监听任务
   * @param taskId 任务ID
   */
  stopListening(taskId: string): void {
    const eventSource = this.connections.get(taskId);
    if (eventSource) {
      eventSource.close();
      this.connections.delete(taskId);
      console.log(`🔕 停止监听任务 ${taskId}`);
    }
  }

  /**
   * 停止所有连接
   */
  stopAll(): void {
    this.connections.forEach((eventSource, taskId) => {
      eventSource.close();
      console.log(`🔕 停止监听任务 ${taskId}`);
    });
    this.connections.clear();
  }

  /**
   * 处理 SSE 消息
   */
  private handleSSEMessage(taskId: string, event: SSEEvent): void {
    console.log(`📨 SSE 消息 [${taskId}]:`, event);

    const { updateTaskProgress, setTaskResult, setTaskError } = useVideoStore.getState();

    switch (event.status) {
      case 'processing':
        // 更新进度
        if (event.progress !== undefined) {
          updateTaskProgress(taskId, event.progress, event.stage);
        }
        break;

      case 'completed':
        // 任务完成，获取结果
        this.fetchTaskResult(taskId);
        // 关闭 SSE 连接
        this.stopListening(taskId);
        break;

      case 'failed':
        // 任务失败
        setTaskError(taskId, event.message || '任务处理失败');
        this.stopListening(taskId);
        break;

      default:
        console.log(`未处理的状态: ${event.status}`);
    }
  }

  /**
   * 处理 SSE 错误
   */
  private handleSSEError(taskId: string, error: Event): void {
    console.error(`❌ SSE 连接错误 [${taskId}]:`, error);

    // 连接错误时，停止监听
    this.stopListening(taskId);

    // 可以选择重试或标记任务为失败
    const { setTaskError } = useVideoStore.getState();
    setTaskError(taskId, 'SSE 连接中断');
  }

  /**
   * 获取任务结果
   */
  private async fetchTaskResult(taskId: string): Promise<void> {
    try {
      console.log(`📥 获取任务结果 [${taskId}]`);
      const result = await apiService.getTaskResult(taskId);

      const { setTaskResult } = useVideoStore.getState();
      setTaskResult(taskId, result);

      console.log(`✅ 任务完成 [${taskId}]`, result);
    } catch (error) {
      console.error(`获取任务结果失败 [${taskId}]:`, error);
      const { setTaskError } = useVideoStore.getState();
      setTaskError(taskId, '获取分析结果失败');
    }
  }
}

/**
 * 导出 SSE 管理器单例
 */
export const sseManager = new SSEManager();

/**
 * 清理函数 - 在组件卸载时调用
 */
export const cleanupSSE = (): void => {
  sseManager.stopAll();
};
