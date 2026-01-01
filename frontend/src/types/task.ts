/**
 * 后端任务相关的类型定义
 */

// 转录段落
export interface TranscriptSegment {
  segment_id: string;
  index: number;
  start: number; // 秒
  end: number; // 秒
  text: string;
}

// 总结切片
export interface SummarySlice {
  slice_id: number;
  start: number; // 秒
  end: number; // 秒
  summary: string;
}

// 关键词提及
export interface KeywordMention {
  segment_id: string;
}

// 关键词链接
export interface KeywordLink {
  title: string;
  url: string;
  source: 'llm' | 'web';
}

// 关键词项
export interface KeywordItem {
  keyword_id: number;
  term: string;
  definition: string;
  mentions: KeywordMention[];
  links?: KeywordLink[];
}

// 金句/精华信息项
export interface QuoteItem {
  segment_id: string;
  index: number;
  start: number; // 秒
  end: number; // 秒
  text: string;
}

// 任务结果
export interface TaskResult {
  task_id: string;
  status: 'queued' | 'running' | 'finished' | 'failed';
  mode?: 'simple' | 'deep';
  video_type?: {
    label: string;          // 主标签（兼容旧格式）
    types?: string[];       // 多标签（新格式，来自 llm_video_type.json）
    confidence: number;
  };
  video_url?: string; // 上传视频的 URL（可选）
  title?: string; // 视频标题（从文件名提取）
  transcript: {
    segments: TranscriptSegment[];
    srt_path?: string;
    vtt_path?: string;
  };
  summary: {
    overall: string;
    by_slice: SummarySlice[];
  };
  keywords: {
    items: KeywordItem[];
  };
  quotes?: {
    items: QuoteItem[];
  };
  error?: string | null;
}

// SSE 事件数据
export interface TaskEvent {
  stage?: 'slicing' | 'asr' | 'llm_summary' | 'finalize';
  status?: 'pending' | 'processing' | 'finished' | 'failed';
  progress?: number;
  message?: string;
}
