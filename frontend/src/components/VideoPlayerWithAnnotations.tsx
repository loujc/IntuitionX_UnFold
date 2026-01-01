import React, { useRef, useState, useEffect } from 'react';
import type { Annotation } from '../types';

interface VideoPlayerWithAnnotationsProps {
  /** 视频源（Blob URL） */
  videoSrc: string;
  /** 视频缩略图 */
  poster?: string;
  /** 注释列表 */
  annotations?: Annotation[];
  /** 视频容器类名 */
  className?: string;
}

/**
 * 视频播放器组件 + 时间戳同步注释列表
 * 核心功能：实时联动视频播放时间和注释卡片高亮
 */
export function VideoPlayerWithAnnotations({
  videoSrc,
  poster,
  annotations = [],
  className = '',
}: VideoPlayerWithAnnotationsProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const annotationsContainerRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(0); // 当前播放时间（毫秒）
  const [activeAnnotationIndex, setActiveAnnotationIndex] = useState<number | null>(null);

  /**
   * 监听视频时间更新（核心逻辑）
   */
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;

    const currentTimeMs = videoRef.current.currentTime * 1000; // 转换为毫秒
    setCurrentTime(currentTimeMs);

    // 查找当前时间对应的注释
    const currentAnnotationIndex = annotations.findIndex(
      (annotation) =>
        currentTimeMs >= annotation.start_ms && currentTimeMs <= annotation.end_ms
    );

    // 如果找到新的活跃注释，更新高亮并滚动
    if (currentAnnotationIndex !== -1 && currentAnnotationIndex !== activeAnnotationIndex) {
      setActiveAnnotationIndex(currentAnnotationIndex);
      scrollToAnnotation(currentAnnotationIndex);
    } else if (currentAnnotationIndex === -1 && activeAnnotationIndex !== null) {
      // 当前时间不在任何注释范围内，清除高亮
      setActiveAnnotationIndex(null);
    }
  };

  /**
   * 自动滚动到指定注释（确保在视口中心）
   */
  const scrollToAnnotation = (index: number) => {
    if (!annotationsContainerRef.current) return;

    const container = annotationsContainerRef.current;
    const annotationElement = container.children[index] as HTMLElement;

    if (annotationElement) {
      // 计算滚动位置，使注释卡片位于视口中心
      const containerHeight = container.clientHeight;
      const annotationTop = annotationElement.offsetTop;
      const annotationHeight = annotationElement.clientHeight;

      const scrollPosition =
        annotationTop - containerHeight / 2 + annotationHeight / 2;

      container.scrollTo({
        top: scrollPosition,
        behavior: 'smooth',
      });
    }
  };

  /**
   * 点击注释卡片，跳转到对应时间点
   */
  const handleAnnotationClick = (annotation: Annotation) => {
    if (!videoRef.current) return;

    // 跳转到注释的开始时间
    videoRef.current.currentTime = annotation.start_ms / 1000;

    // 播放视频（如果已暂停）
    if (videoRef.current.paused) {
      videoRef.current.play();
    }
  };

  return (
    <div className={`flex gap-4 ${className}`}>
      {/* 左侧：视频播放器 */}
      <div className="flex-1">
        <video
          ref={videoRef}
          src={videoSrc}
          poster={poster}
          controls
          className="w-full rounded-lg bg-black"
          onTimeUpdate={handleTimeUpdate}
        >
          您的浏览器不支持视频播放。
        </video>

        {/* 当前播放时间显示（调试用） */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-2 text-xs text-gray-500">
            当前时间: {(currentTime / 1000).toFixed(2)}s
          </div>
        )}
      </div>

      {/* 右侧：注释列表 */}
      <div className="w-[300px] flex flex-col">
        <h3 className="text-lg font-bold mb-3 text-black">智能注释</h3>

        <div
          ref={annotationsContainerRef}
          className="flex-1 overflow-y-auto max-h-[500px] space-y-3 pr-2"
        >
          {annotations.length === 0 ? (
            <p className="text-sm text-gray-500">暂无注释，等待 AI 分析...</p>
          ) : (
            annotations.map((annotation, index) => (
              <AnnotationCard
                key={index}
                annotation={annotation}
                isActive={index === activeAnnotationIndex}
                onClick={() => handleAnnotationClick(annotation)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * 注释卡片组件
 * 包含明显的高亮效果（红色边框 + 阴影呼吸灯）
 */
interface AnnotationCardProps {
  annotation: Annotation;
  isActive: boolean;
  onClick: () => void;
}

function AnnotationCard({ annotation, isActive, onClick }: AnnotationCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        cursor-pointer rounded-lg p-3 transition-all duration-300
        ${
          isActive
            ? 'bg-[rgba(255,120,120,0.2)] border-2 border-[#E0130B] shadow-lg animate-pulse-subtle'
            : 'bg-white border border-gray-200 hover:border-[#E0130B] hover:shadow-md'
        }
      `}
      style={
        isActive
          ? {
              boxShadow:
                '0 0 20px rgba(224, 19, 11, 0.3), 0 0 40px rgba(224, 19, 11, 0.2)',
            }
          : undefined
      }
    >
      {/* 标题和重要性 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <svg
            className="w-3 h-3"
            fill={isActive ? '#E0130B' : '#B8B5B5'}
            viewBox="0 0 12 12"
          >
            <circle cx="6" cy="6" r="6" />
          </svg>
          <span
            className={`text-sm font-semibold ${
              isActive ? 'text-[#E0130B]' : 'text-black'
            }`}
          >
            {annotation.term}
          </span>
        </div>
        <span className="text-xs text-gray-500">
          {(annotation.start_ms / 1000).toFixed(0)}s
        </span>
      </div>

      {/* 简要解释 */}
      <p
        className={`text-xs leading-relaxed ${
          isActive ? 'text-[#E0130B]' : 'text-gray-700'
        }`}
      >
        {annotation.explanation_short}
      </p>

      {/* 重要性指示器 */}
      {annotation.importance > 0.7 && (
        <div className="mt-2 flex items-center gap-1">
          <span className="text-xs text-[#E0130B]">⭐ 重要</span>
        </div>
      )}
    </div>
  );
}

// 添加呼吸灯动画到全局 CSS（如果尚未添加）
// @keyframes pulse-subtle {
//   0%, 100% { opacity: 1; }
//   50% { opacity: 0.8; }
// }
// .animate-pulse-subtle {
//   animation: pulse-subtle 2s ease-in-out infinite;
// }
