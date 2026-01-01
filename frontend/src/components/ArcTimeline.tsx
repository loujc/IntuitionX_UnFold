import React, { useRef, useEffect } from 'react';
import type { Annotation } from '../types';

interface ArcTimelineProps {
  /** 注释列表 */
  annotations: Annotation[];
  /** 当前激活的注释索引 */
  activeIndex: number | null;
  /** 视频总时长（毫秒） */
  duration: number;
  /** 点击注释回调 */
  onAnnotationClick: (annotation: Annotation, index: number) => void;
}

/**
 * 弧形时间轴组件
 * 使用三角函数计算每个注释点在弧线上的位置
 */
export function ArcTimeline({
  annotations,
  activeIndex,
  duration,
  onAnnotationClick,
}: ArcTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLDivElement>(null);

  // 自动滚动到激活的注释
  useEffect(() => {
    if (activeIndex !== null && activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeIndex]);

  /**
   * 计算注释点在弧形轴上的位置
   * @param index 注释索引
   * @param total 总注释数
   * @returns { top, left, rotate } CSS 定位属性
   */
  const calculateArcPosition = (index: number, total: number) => {
    // 弧形参数
    const radius = 300; // 弧线半径（像素）
    const startAngle = -30; // 起始角度（度）
    const endAngle = 30; // 结束角度（度）
    const arcSpan = endAngle - startAngle; // 弧线跨度

    // 计算当前注释的角度
    const angleStep = arcSpan / (total - 1 || 1);
    const currentAngle = startAngle + angleStep * index;
    const radian = (currentAngle * Math.PI) / 180; // 转换为弧度

    // 使用三角函数计算坐标
    // x = radius * sin(angle)
    // y = radius * (1 - cos(angle))
    const x = radius * Math.sin(radian);
    const y = radius * (1 - Math.cos(radian));

    return {
      top: `${y}px`,
      left: `calc(50% + ${x}px)`,
      transform: `translateX(-50%) rotate(${currentAngle}deg)`,
    };
  };

  return (
    <div
      ref={containerRef}
      className="relative h-full overflow-y-auto scrollbar-thin"
      style={{ maxHeight: '80vh' }}
    >
      {/* 弧形轨道背景 */}
      <div className="absolute left-1/2 top-0 w-1 h-full bg-gray-200 -translate-x-1/2" />

      {/* 注释节点 */}
      {annotations.map((annotation, index) => {
        const isActive = index === activeIndex;
        const position = calculateArcPosition(index, annotations.length);

        return (
          <div
            key={annotation.segment_id}
            ref={isActive ? activeItemRef : null}
            className="absolute cursor-pointer transition-all duration-300"
            style={{
              ...position,
              zIndex: isActive ? 10 : 1,
            }}
            onClick={() => onAnnotationClick(annotation, index)}
          >
            {/* 时间轴圆点 */}
            <div
              className={`
                w-4 h-4 rounded-full border-2 transition-all
                ${isActive
                  ? 'bg-[var(--brand-red)] border-[var(--brand-red)] scale-150 shadow-lg'
                  : 'bg-white border-gray-300 hover:border-[var(--brand-red)]'
                }
              `}
              style={{
                boxShadow: isActive ? '0 0 20px rgba(230, 0, 18, 0.5)' : undefined,
              }}
            />

            {/* 注释卡片 */}
            <div
              className={`
                absolute left-6 top-1/2 -translate-y-1/2
                min-w-[280px] max-w-[320px] p-4 rounded-lg
                transition-all duration-300 transform
                ${isActive
                  ? 'bg-[rgba(230,0,18,0.1)] border-2 border-[var(--brand-red)] shadow-lg scale-105 animate-pulse-subtle'
                  : 'bg-white border border-gray-200 hover:border-[var(--brand-red)] hover:shadow-md'
                }
              `}
              style={{
                boxShadow: isActive
                  ? '0 0 30px rgba(230, 0, 18, 0.2), 0 0 60px rgba(230, 0, 18, 0.1)'
                  : undefined,
              }}
            >
              {/* 时间戳 */}
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-3 h-3" fill="var(--brand-red)" viewBox="0 0 12 12">
                  <circle cx="6" cy="6" r="6" />
                </svg>
                <span className="text-xs text-gray-500">
                  {formatTimestamp(annotation.start_ms)}
                </span>
              </div>

              {/* 术语标题 */}
              <h4
                className={`text-sm font-semibold mb-2 ${
                  isActive ? 'text-[var(--brand-red)]' : 'text-gray-800'
                }`}
              >
                {annotation.term}
              </h4>

              {/* 简短解释 */}
              <p className="text-xs text-gray-600 leading-relaxed">
                {annotation.explanation_short}
              </p>

              {/* 重要性指示器 */}
              <div className="mt-2 flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 h-3 rounded-full ${
                      i < annotation.importance
                        ? 'bg-[var(--brand-red)]'
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * 格式化时间戳（毫秒 → MM:SS）
 */
function formatTimestamp(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}
