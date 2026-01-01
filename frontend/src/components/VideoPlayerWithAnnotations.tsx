import React, { useRef, useState, useEffect } from 'react';
import { ArcTimeline } from './ArcTimeline';
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
 * 视频播放器组件 + 弧形时间轴同步注释
 * 核心功能：实时联动视频播放时间和弧形轴上的注释卡片高亮
 */
export function VideoPlayerWithAnnotations({
  videoSrc,
  poster,
  annotations = [],
  className = '',
}: VideoPlayerWithAnnotationsProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0); // 当前播放时间（毫秒）
  const [duration, setDuration] = useState(0); // 视频总时长（毫秒）
  const [activeAnnotationIndex, setActiveAnnotationIndex] = useState<number | null>(null);

  /**
   * 监听视频元数据加载，获取视频总时长
   */
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration * 1000); // 转换为毫秒
    }
  };

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

    // 如果找到新的活跃注释，更新高亮
    if (currentAnnotationIndex !== -1 && currentAnnotationIndex !== activeAnnotationIndex) {
      setActiveAnnotationIndex(currentAnnotationIndex);
    } else if (currentAnnotationIndex === -1 && activeAnnotationIndex !== null) {
      // 当前时间不在任何注释范围内，清除高亮
      setActiveAnnotationIndex(null);
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
    <div className={`flex gap-6 ${className}`}>
      {/* 左侧：视频播放器 */}
      <div className="flex-1">
        <video
          ref={videoRef}
          src={videoSrc}
          poster={poster}
          controls
          className="w-full rounded-lg bg-black"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          style={{
            maxHeight: '70vh',
          }}
        >
          您的浏览器不支持视频播放。
        </video>

        {/* 自定义进度条（细长红色条） */}
        <div className="mt-4 relative">
          <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--brand-red)] transition-all duration-150"
              style={{
                width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%',
              }}
            />
          </div>
          {/* 时间显示 */}
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {/* 右侧：弧形时间轴 */}
      <div className="w-[400px]">
        <ArcTimeline
          annotations={annotations}
          activeIndex={activeAnnotationIndex}
          duration={duration}
          onAnnotationClick={handleAnnotationClick}
        />
      </div>
    </div>
  );
}

/**
 * 格式化时间显示（毫秒 → MM:SS）
 */
function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}
