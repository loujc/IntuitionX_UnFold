import React from 'react';
import type { TaskStage } from '../types';

interface AIAnalyzingIndicatorProps {
  /** 当前阶段 */
  stage?: TaskStage;
  /** 进度 0-100 */
  progress: number;
  /** 是否显示详细信息 */
  detailed?: boolean;
}

/**
 * 阶段配置
 */
const stageConfig: Record<TaskStage, { label: string; icon: string; color: string }> = {
  downloading: {
    label: '下载视频',
    icon: '⬇️',
    color: '#3B82F6',
  },
  transcribing: {
    label: 'AI 语音转文字',
    icon: '🎤',
    color: '#8B5CF6',
  },
  summarizing: {
    label: 'AI 生成摘要',
    icon: '📝',
    color: '#EC4899',
  },
  keywording: {
    label: 'AI 提取关键词',
    icon: '🔍',
    color: '#F59E0B',
  },
  linking: {
    label: 'AI 关联知识',
    icon: '🔗',
    color: '#10B981',
  },
};

/**
 * AI 分析中指示器组件
 * 用于显示"AI 正在分析..."的视觉反馈
 */
export function AIAnalyzingIndicator({
  stage = 'transcribing',
  progress,
  detailed = false,
}: AIAnalyzingIndicatorProps) {
  const config = stageConfig[stage];

  if (!detailed) {
    // 简洁模式：只显示旋转图标 + 进度
    return (
      <div className="flex items-center gap-2">
        <div className="relative">
          <div className="w-4 h-4 rounded-full border-2 border-[#E0130B] border-t-transparent animate-spin" />
        </div>
        <span className="text-xs text-[#E0130B] font-medium">{progress}%</span>
      </div>
    );
  }

  // 详细模式：完整的 AI 分析界面
  return (
    <div className="w-full">
      {/* 顶部：当前阶段 */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="text-2xl animate-bounce"
          style={{ animationDuration: '1.5s' }}
        >
          {config.icon}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-black">{config.label}</p>
          <p className="text-xs text-gray-500">AI 正在努力工作中...</p>
        </div>
        <span className="text-lg font-bold" style={{ color: config.color }}>
          {progress}%
        </span>
      </div>

      {/* 进度条 */}
      <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full rounded-full transition-all duration-300 ease-out"
          style={{
            width: `${progress}%`,
            backgroundColor: config.color,
            boxShadow: `0 0 10px ${config.color}80`,
          }}
        >
          {/* 进度条光效 */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer" />
        </div>
      </div>

      {/* 阶段列表 */}
      <div className="mt-4 flex justify-between items-center">
        {Object.entries(stageConfig).map(([key, value]) => {
          const isActive = key === stage;
          const stageIndex = Object.keys(stageConfig).indexOf(key);
          const currentStageIndex = Object.keys(stageConfig).indexOf(stage);
          const isCompleted = stageIndex < currentStageIndex;

          return (
            <div key={key} className="flex flex-col items-center gap-1">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all
                  ${
                    isActive
                      ? 'bg-[#E0130B] scale-110 shadow-lg'
                      : isCompleted
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                  }
                `}
              >
                {isCompleted ? '✓' : value.icon}
              </div>
              <span
                className={`text-xs ${
                  isActive ? 'text-[#E0130B] font-semibold' : 'text-gray-500'
                }`}
              >
                {value.label.split(' ')[1]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * AI 分析完成提示组件
 */
export function AIAnalysisCompleted() {
  return (
    <div className="flex items-center gap-2 text-green-600">
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
      <span className="text-sm font-semibold">✅ AI 分析完成！</span>
    </div>
  );
}

/**
 * AI 分析失败提示组件
 */
export function AIAnalysisFailed({ error }: { error?: string }) {
  return (
    <div className="flex items-center gap-2 text-red-600">
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clipRule="evenodd"
        />
      </svg>
      <div>
        <span className="text-sm font-semibold">❌ 分析失败</span>
        {error && <p className="text-xs mt-1">{error}</p>}
      </div>
    </div>
  );
}
