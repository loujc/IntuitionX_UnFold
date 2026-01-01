// ============================================================================
// 核心类型定义 - 基于后端 API 规范
// ============================================================================

/**
 * 任务状态
 */
export type TaskStatus = 'queued' | 'processing' | 'completed' | 'failed';

/**
 * 任务处理阶段
 */
export type TaskStage =
  | 'downloading'
  | 'transcribing'
  | 'summarizing'
  | 'keywording'
  | 'linking';

/**
 * 分析模式
 */
export type AnalysisMode = 'brief' | 'deep';

/**
 * 视频风格
 */
export type VideoStyle = 'popular_science' | 'academic' | 'casual';

/**
 * 视频类型（后端识别结果）
 */
export type VideoType = 'History' | 'Anime' | 'Finance' | 'Course' | 'Technology' | string;

/**
 * 视频元数据
 */
export interface VideoMeta {
  duration_sec: number;
  format: string;
  video_type: VideoType;
}

/**
 * 视频播放元数据（用于 Store currentVideo）
 */
export interface VideoMetadata {
  title: string;
  duration: number;  // 毫秒
  thumbnail?: string;
  videoType?: VideoType;
}

/**
 * 摘要片段（带时间戳）
 */
export interface SummarySegment {
  start_ms: number;
  end_ms: number;
  summary: string;
}

/**
 * 视频摘要
 */
export interface VideoSummary {
  fast: string;
  full: string;
  segments: SummarySegment[];
}

/**
 * 字幕条目
 */
export interface Subtitle {
  index: number;
  start: string; // SRT 格式时间戳 "00:00:01,000"
  end: string;
  text: string;
}

/**
 * 注释/关键词（核心功能 - 时间戳联动）
 */
export interface Annotation {
  term: string;
  segment_id: string;
  start_ms: number;  // 毫秒时间戳
  end_ms: number;    // 毫秒时间戳
  importance: number; // 0-1
  explanation_short: string;
  explanation_long: string;
  sources?: Array<{
    title: string;
    url: string;
  }>;
  context_blob?: string;
}

/**
 * 任务结果（后端返回）
 */
export interface TaskResult {
  video_meta: VideoMeta;
  summary: VideoSummary;
  subtitles: Subtitle[];
  annotations: Annotation[];
}

/**
 * 任务信息
 */
export interface Task {
  task_id: string;
  status: TaskStatus;
  stage?: TaskStage;
  progress?: number; // 0-1
  eta_sec?: number;
  error?: string | null;
  created_at?: string;
}

/**
 * SSE 事件数据
 */
export interface SSEEvent {
  task_id: string;
  status: TaskStatus;
  stage?: TaskStage;
  progress?: number;
  message?: string;
  ts: number;
}

/**
 * 视频任务（前端状态管理 - 必须包含 startTime/endTime）
 */
export interface VideoTask {
  // 基础信息
  id: string;              // 对应 task_id
  title: string;           // 用户输入或默认标题
  thumbnail?: string;      // 缩略图 URL 或 base64

  // 本地视频播放（核心）
  videoSrc: string;        // Blob URL 或本地路径
  videoFile?: File;        // 原始文件对象

  // 任务状态
  status: TaskStatus;
  stage?: TaskStage;
  progress: number;        // 0-100

  // 分析参数
  mode: AnalysisMode;
  style: VideoStyle;
  language: string;

  // 分类管理
  section: 'reading' | 'later' | 'finish';

  // 播放进度（用户观看进度）
  playProgress: number;    // 0-100

  // 时间戳（必须字段 - 用于时间联动）
  startTime: number;       // 毫秒
  endTime: number;         // 毫秒

  // 分析结果
  result?: TaskResult;

  // 时间戳
  createdAt: number;
  updatedAt: number;
}

/**
 * 创建任务请求（本地路径模式 - Demo推荐）
 */
export interface CreateTaskRequest {
  source_type: 'path' | 'url' | 'upload';
  source_path?: string;
  source_url?: string;
  title?: string;
  mode: AnalysisMode;
  style: VideoStyle;
  language: string;
  return_formats: string[];
}

/**
 * 创建任务响应
 */
export interface CreateTaskResponse {
  task_id: string;
  status: TaskStatus;
  message: string;
}
