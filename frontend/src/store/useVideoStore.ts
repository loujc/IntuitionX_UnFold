import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { VideoTask, Task, TaskResult, VideoMetadata } from '../types';

/**
 * 当前播放视频对象（深度状态控制）
 */
export interface CurrentVideo {
  /** 视频 Blob URL */
  blobUrl: string;
  /** 视频元数据（标题、时长等） */
  metadata: VideoMetadata;
  /** 当前播放时间（毫秒） */
  currentTime: number;
  /** 是否正在播放 */
  isPlaying: boolean;
}

/**
 * 视频状态管理 Store
 * 使用 Zustand 管理全局状态，防止页面切换时视频播放中断
 */
interface VideoStore {
  // ============================================================================
  // 状态
  // ============================================================================

  /** 所有视频任务列表 */
  videoTasks: VideoTask[];

  /** 当前播放的视频（深度状态控制 - 支持跨页面保持播放状态） */
  currentVideo: CurrentVideo | null;

  /** 当前任务信息 */
  currentTask: Task | null;

  // ============================================================================
  // Actions - 视频任务管理
  // ============================================================================

  /**
   * 添加新的视频任务
   * @param task 视频任务对象
   */
  addVideoTask: (task: VideoTask) => void;

  /**
   * 更新视频任务
   * @param id 任务ID
   * @param updates 更新的字段
   */
  updateVideoTask: (id: string, updates: Partial<VideoTask>) => void;

  /**
   * 删除视频任务
   * @param id 任务ID
   */
  removeVideoTask: (id: string) => void;

  /**
   * 获取单个视频任务
   * @param id 任务ID
   */
  getVideoTask: (id: string) => VideoTask | undefined;

  // ============================================================================
  // Actions - 当前视频控制
  // ============================================================================

  /**
   * 设置当前播放的视频（完整状态）
   * @param video 当前视频对象
   */
  setCurrentVideo: (video: CurrentVideo) => void;

  /**
   * 更新当前视频状态（部分更新）
   * @param updates 需要更新的字段
   */
  updateCurrentVideo: (updates: Partial<CurrentVideo>) => void;

  /**
   * 清除当前视频
   */
  clearCurrentVideo: () => void;

  /**
   * 更新当前播放时间
   * @param time 时间（毫秒）
   */
  setCurrentTime: (time: number) => void;

  /**
   * 设置播放/暂停状态
   * @param isPlaying 是否正在播放
   */
  setIsPlaying: (isPlaying: boolean) => void;

  // ============================================================================
  // Actions - 任务状态更新
  // ============================================================================

  /**
   * 更新任务进度（通过 SSE）
   * @param taskId 任务ID
   * @param progress 进度 0-1
   * @param stage 当前阶段
   */
  updateTaskProgress: (taskId: string, progress: number, stage?: string) => void;

  /**
   * 设置任务结果
   * @param taskId 任务ID
   * @param result 分析结果
   */
  setTaskResult: (taskId: string, result: TaskResult) => void;

  /**
   * 设置任务错误
   * @param taskId 任务ID
   * @param error 错误信息
   */
  setTaskError: (taskId: string, error: string) => void;

  // ============================================================================
  // Actions - 播放进度管理
  // ============================================================================

  /**
   * 更新播放进度
   * @param videoId 视频ID
   * @param progress 播放进度 0-100
   */
  updatePlayProgress: (videoId: string, progress: number) => void;

  // ============================================================================
  // Actions - 分类管理
  // ============================================================================

  /**
   * 移动视频到不同分类
   * @param videoId 视频ID
   * @param section 目标分类
   */
  moveToSection: (videoId: string, section: 'reading' | 'later' | 'finish') => void;

  // ============================================================================
  // Actions - 数据持久化
  // ============================================================================

  /**
   * 清除所有数据（重置）
   */
  reset: () => void;
}

/**
 * 初始状态
 */
const initialState = {
  videoTasks: [],
  currentVideo: null,
  currentTask: null,
};

/**
 * 创建 Zustand Store
 * 使用 persist 中间件自动同步 localStorage
 */
export const useVideoStore = create<VideoStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ========================================================================
      // 视频任务管理
      // ========================================================================

      addVideoTask: (task) =>
        set((state) => ({
          videoTasks: [task, ...state.videoTasks],
        })),

      updateVideoTask: (id, updates) =>
        set((state) => ({
          videoTasks: state.videoTasks.map((task) =>
            task.id === id ? { ...task, ...updates, updatedAt: Date.now() } : task
          ),
        })),

      removeVideoTask: (id) =>
        set((state) => ({
          videoTasks: state.videoTasks.filter((task) => task.id !== id),
          // 如果删除的是当前视频，清除当前视频状态
          currentVideo: state.currentVideo && state.currentVideo.metadata.title === id
            ? null
            : state.currentVideo,
        })),

      getVideoTask: (id) => {
        return get().videoTasks.find((task) => task.id === id);
      },

      // ========================================================================
      // 当前视频控制
      // ========================================================================

      setCurrentVideo: (video) =>
        set({
          currentVideo: video,
        }),

      updateCurrentVideo: (updates) =>
        set((state) => ({
          currentVideo: state.currentVideo
            ? { ...state.currentVideo, ...updates }
            : null,
        })),

      clearCurrentVideo: () =>
        set({
          currentVideo: null,
        }),

      setCurrentTime: (time) =>
        set((state) => ({
          currentVideo: state.currentVideo
            ? { ...state.currentVideo, currentTime: time }
            : null,
        })),

      setIsPlaying: (isPlaying) =>
        set((state) => ({
          currentVideo: state.currentVideo
            ? { ...state.currentVideo, isPlaying }
            : null,
        })),

      // ========================================================================
      // 任务状态更新
      // ========================================================================

      updateTaskProgress: (taskId, progress, stage) =>
        set((state) => ({
          videoTasks: state.videoTasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  progress: Math.round(progress * 100),
                  stage: stage as any,
                  status: progress >= 1 ? 'completed' : 'processing',
                  updatedAt: Date.now(),
                }
              : task
          ),
        })),

      setTaskResult: (taskId, result) =>
        set((state) => ({
          videoTasks: state.videoTasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  result,
                  status: 'completed',
                  progress: 100,
                  updatedAt: Date.now(),
                }
              : task
          ),
        })),

      setTaskError: (taskId, error) =>
        set((state) => ({
          videoTasks: state.videoTasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  status: 'failed',
                  updatedAt: Date.now(),
                }
              : task
          ),
        })),

      // ========================================================================
      // 播放进度管理
      // ========================================================================

      updatePlayProgress: (videoId, progress) =>
        set((state) => ({
          videoTasks: state.videoTasks.map((task) =>
            task.id === videoId
              ? {
                  ...task,
                  playProgress: progress,
                  updatedAt: Date.now(),
                }
              : task
          ),
        })),

      // ========================================================================
      // 分类管理
      // ========================================================================

      moveToSection: (videoId, section) =>
        set((state) => ({
          videoTasks: state.videoTasks.map((task) =>
            task.id === videoId
              ? {
                  ...task,
                  section,
                  updatedAt: Date.now(),
                }
              : task
          ),
        })),

      // ========================================================================
      // 数据持久化
      // ========================================================================

      reset: () => set(initialState),
    }),
    {
      name: 'video-storage', // localStorage key
      partialize: (state) => ({
        // 只持久化这些字段
        videoTasks: state.videoTasks,
        // 注意：currentVideo 不持久化，因为包含 Blob URL 刷新后失效
      }),
    }
  )
);
