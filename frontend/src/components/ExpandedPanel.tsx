import { useState } from 'react';
import svgPaths from "../imports/svg-s4e0ijz15u";
import { formatTime, type VideoSegmentData, type KnowledgeCardData } from "../data/videoTimelineData";
import type { QuoteItem } from '../types/task';

interface ExpandedPanelProps {
  segments: VideoSegmentData[];
  knowledgeCards: KnowledgeCardData[];
  quotes: QuoteItem[];
  currentTime: number;
  onSeekTo: (time: number) => void;
}

type TabType = 'segments' | 'subtitles' | 'highlights';

export function ExpandedPanel({ segments, knowledgeCards, quotes, currentTime, onSeekTo }: ExpandedPanelProps) {
  // Tab 切换状态
  const [activeTab, setActiveTab] = useState<TabType>('segments');
  // 面板收起/展开状态
  const [isCollapsed, setIsCollapsed] = useState(false);

  // 判断段落是否处于播放状态
  const isSegmentActive = (segment: VideoSegmentData) => {
    return currentTime >= segment.startTime && currentTime < segment.endTime;
  };

  // 判断知识卡片是否即将触发（在触发点前后 2 秒范围内）
  const isCardNearby = (card: KnowledgeCardData) => {
    return Math.abs(currentTime - card.time) < 2;
  };

  // 按时间排序知识卡片
  const sortedKnowledgeCards = [...knowledgeCards].sort((a, b) => a.time - b.time);

  return (
    <div className="absolute contents left-[calc(16.67%+19.67px)] top-[207px]">
      {/* 收起状态的"拉环" - 独立渲染，始终可见可点击 */}
      {isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          className="absolute left-[calc(16.67%+12.67px)] top-[227px] z-[9999] w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[8px] border-l-[#E0130B] cursor-pointer hover:opacity-80 transition-opacity"
          aria-label="展开面板"
        />
      )}

      {/* 主面板内容 - 仅在展开时显示 */}
      {!isCollapsed && (
        <>
          {/* Background Gradient */}
          <div className="absolute bg-gradient-to-b from-[#ffffff] h-[248px] left-[calc(16.67%+19.67px)] opacity-[0.55] rounded-[6px] shadow-[0px_4px_4px_4px_rgba(255,120,120,0.2)] to-[#ff7878] top-[207px] w-[143px]" />

          {/* Collapse Arrow - 收起按钮 */}
          <button
            onClick={() => setIsCollapsed(true)}
            className="absolute flex h-[22px] items-center justify-center left-[calc(25%+43px)] top-[227px] w-[17px] cursor-pointer hover:scale-110 transition-transform z-10"
            style={{ "--transform-inner-width": "0", "--transform-inner-height": "0" } as React.CSSProperties}
            aria-label="收起面板"
          >
            <div className="flex-none rotate-[270deg]">
              <div className="h-[17px] relative w-[22px]">
                <div className="absolute bottom-1/4 left-[11.22%] right-[11.22%] top-[3.95%]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.0653 12.0793">
                    <path d={svgPaths.pf6682f2} fill="#E32C25" />
                  </svg>
                </div>
              </div>
            </div>
          </button>

      {/* Content */}
      <div className="absolute content-stretch flex flex-col gap-[6px] items-start left-[calc(16.67%+23.67px)] top-[214px] w-[131px]">
        {/* Tabs */}
        <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
          {/* 视频段落 Tab */}
          <button
            onClick={() => setActiveTab('segments')}
            className={`${activeTab === 'segments' ? 'bg-[#e0130b]' : 'bg-white'} content-stretch flex h-[12px] items-center justify-center px-[4px] py-[2px] relative rounded-[2px] shrink-0 w-[34px] cursor-pointer hover:opacity-80 transition-opacity`}
          >
            <p className={`font-['Alibaba_PuHuiTi_3.0:55_Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[6px] text-nowrap ${activeTab === 'segments' ? 'text-white' : 'text-[#e0130b]'}`}>
              视频段落
            </p>
          </button>

          {/* 字幕帧 Tab */}
          <button
            onClick={() => setActiveTab('subtitles')}
            className={`${activeTab === 'subtitles' ? 'bg-[#e0130b]' : 'bg-white'} content-stretch flex h-[12px] items-center justify-center px-[7px] py-[2px] relative rounded-[2px] shrink-0 w-[34px] cursor-pointer hover:opacity-80 transition-opacity`}
          >
            <p className={`font-['Alibaba_PuHuiTi_3.0:55_Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[6px] text-nowrap ${activeTab === 'subtitles' ? 'text-white' : 'text-[#e0130b]'}`}>
              字幕帧
            </p>
          </button>

          {/* 精华信息 Tab */}
          <button
            onClick={() => setActiveTab('highlights')}
            className={`${activeTab === 'highlights' ? 'bg-[#e0130b]' : 'bg-white'} content-stretch flex h-[12px] items-center justify-center px-[4px] py-[2px] relative rounded-[2px] shrink-0 w-[34px] cursor-pointer hover:opacity-80 transition-opacity`}
          >
            <p className={`font-['Alibaba_PuHuiTi_3.0:55_Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[6px] text-nowrap ${activeTab === 'highlights' ? 'text-white' : 'text-[#e0130b]'}`}>
              精华信息
            </p>
          </button>
        </div>

        {/* Segment List Items - 仅在 activeTab === 'segments' 时显示 */}
        {activeTab === 'segments' && (
          <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full">
            {segments.map((segment, index) => {
              const isActive = isSegmentActive(segment);

              return (
                <div
                  key={index}
                  className={`content-stretch flex gap-[2px] items-start relative shrink-0 w-full cursor-pointer hover:scale-[1.02] transition-transform ${isActive ? 'opacity-100' : 'opacity-80'}`}
                  onClick={() => onSeekTo(segment.startTime)}
                >
                  {/* 红色三角形指示器 - 仅在激活时显示 */}
                  {isActive && (
                    <div
                      className="absolute left-[-12px] top-[4px] z-[999] w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] border-l-[#E0130B] cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsCollapsed(true);
                      }}
                    />
                  )}

                  {/* Active Indicator Dot */}
                  <div className="relative shrink-0 size-[6px] mt-[2px]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
                      <circle
                        cx="3"
                        cy="3"
                        fill={isActive ? "#E0130B" : "white"}
                        r="3"
                      />
                    </svg>
                  </div>

                  {/* Segment Content */}
                  <div className="content-stretch flex flex-col items-start leading-[normal] not-italic relative shrink-0 flex-1">
                    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
                      <p className={`font-['Alibaba_PuHuiTi_3.0:65_Medium',sans-serif] h-[10px] relative shrink-0 text-[8px] ${isActive ? 'text-[#E0130B] font-bold' : 'text-black'} w-full transition-colors`}>
                        {segment.title}
                      </p>
                      <p className="[text-underline-position:from-font] decoration-solid font-['Alibaba_PuHuiTi_3.0:55_Regular',sans-serif] relative shrink-0 text-[6px] text-white underline w-full">
                        {formatTime(segment.startTime)}-{formatTime(segment.endTime)}
                      </p>
                    </div>
                    <p className="font-['Alibaba_PuHuiTi_3.0:55_Regular',sans-serif] min-w-full relative shrink-0 text-[6px] text-white w-[min-content] line-clamp-3">
                      {segment.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Knowledge Cards List - 字幕帧 Tab */}
        {activeTab === 'subtitles' && (
          <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full">
            {sortedKnowledgeCards.map((card, index) => {
              const isNearby = isCardNearby(card);

              return (
                <div
                  key={index}
                  className={`content-stretch flex gap-[2px] items-start relative shrink-0 w-full cursor-pointer hover:scale-[1.02] transition-transform ${isNearby ? 'opacity-100' : 'opacity-80'}`}
                  onClick={() => onSeekTo(card.time)}
                  title={`点击跳转到 ${formatTime(card.time)}`}
                >
                  {/* 红色三角形指示器 - 仅在即将触发时显示 */}
                  {isNearby && (
                    <div
                      className="absolute left-[-12px] top-[4px] z-[999] w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] border-l-[#E0130B]"
                    />
                  )}

                  {/* Active Indicator Dot */}
                  <div className="relative shrink-0 size-[6px] mt-[2px]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
                      <circle
                        cx="3"
                        cy="3"
                        fill={isNearby ? "#E0130B" : "#FFD580"}
                        r="3"
                      />
                    </svg>
                  </div>

                  {/* Knowledge Card Content */}
                  <div className="content-stretch flex flex-col items-start leading-[normal] not-italic relative shrink-0 flex-1">
                    <div className="content-stretch flex items-center gap-[4px] relative shrink-0 w-full">
                      <p className={`font-['Alibaba_PuHuiTi_3.0:65_Medium',sans-serif] relative shrink-0 text-[8px] ${isNearby ? 'text-[#E0130B] font-bold' : 'text-[#FFD580]'} transition-colors`}>
                        {card.word}
                      </p>
                      <p className="[text-underline-position:from-font] decoration-solid font-['Alibaba_PuHuiTi_3.0:55_Regular',sans-serif] relative shrink-0 text-[6px] text-white underline">
                        {formatTime(card.time)}
                      </p>
                    </div>
                    <p className="font-['Alibaba_PuHuiTi_3.0:55_Regular',sans-serif] min-w-full relative shrink-0 text-[6px] text-white w-[min-content] line-clamp-2">
                      {card.simple}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Highlights - 精华信息 Tab */}
        {activeTab === 'highlights' && (
          <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full">
            {quotes && quotes.length > 0 ? (
              quotes.map((quote, index) => {
                const isNearby = Math.abs(currentTime - quote.start) < 2;
                
                return (
                  <div
                    key={index}
                    className={`content-stretch flex gap-[2px] items-start relative shrink-0 w-full cursor-pointer hover:scale-[1.02] transition-transform ${isNearby ? 'opacity-100' : 'opacity-80'}`}
                    onClick={() => onSeekTo(quote.start)}
                    title={`点击跳转到 ${formatTime(quote.start)}`}
                  >
                    {/* 红色三角形指示器 - 仅在即将触发时显示 */}
                    {isNearby && (
                      <div
                        className="absolute left-[-12px] top-[4px] z-[999] w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] border-l-[#E0130B]"
                      />
                    )}

                    {/* Active Indicator Dot */}
                    <div className="relative shrink-0 size-[6px] mt-[2px]">
                      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
                        <circle
                          cx="3"
                          cy="3"
                          fill={isNearby ? "#E0130B" : "#FFD580"}
                          r="3"
                        />
                      </svg>
                    </div>

                    {/* Quote Content */}
                    <div className="content-stretch flex flex-col items-start leading-[normal] not-italic relative shrink-0 flex-1">
                      <div className="content-stretch flex items-center gap-[4px] relative shrink-0 w-full">
                        <p className={`font-['Alibaba_PuHuiTi_3.0:65_Medium',sans-serif] relative shrink-0 text-[8px] ${isNearby ? 'text-[#E0130B] font-bold' : 'text-[#FFD580]'} transition-colors`}>
                          金句 #{index + 1}
                        </p>
                        <p className="[text-underline-position:from-font] decoration-solid font-['Alibaba_PuHuiTi_3.0:55_Regular',sans-serif] relative shrink-0 text-[6px] text-white underline">
                          {formatTime(quote.start)}
                        </p>
                      </div>
                      <p className="font-['Alibaba_PuHuiTi_3.0:55_Regular',sans-serif] min-w-full relative shrink-0 text-[6px] text-white w-[min-content] line-clamp-2">
                        {quote.text}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="content-stretch flex flex-col gap-[4px] items-center justify-center relative shrink-0 w-full h-[100px]">
                <p className="font-['Alibaba_PuHuiTi_3.0:55_Regular',sans-serif] text-[8px] text-white/50 text-center">
                  暂无精华信息
                </p>
              </div>
            )}
          </div>
        )}
      </div>
        </>
      )}
    </div>
  );
}
