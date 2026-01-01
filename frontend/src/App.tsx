import { useState, useRef, useEffect, useMemo } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Paperclip, Loader2 } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import svgPaths from "./imports/svg-svp3s9ofq0";
import imgImage13 from "figma:asset/1b939f420685ed9c8938abc89cf30951f9bcaf97.png";
import imgRectangle34 from "figma:asset/caa09756c2c0383d70e8b4aaf1f8867fbac59966.png";
import imgRectangle35 from "figma:asset/6563664671bdb9c906c1438c612b9bd618b8697e.png";
import imgRectangle36 from "figma:asset/228f498b2fd0a9ddee568cd50bafbcab08188a1d.png";
import imgRectangle37 from "figma:asset/e5bf9baa7e09ee6d16b7c343777ad74ff3613b21.png";
import imgRectangle38 from "figma:asset/ff402fbd8f833c106d51bdead08f65a61bb7ea50.png";
import imgRectangle39 from "figma:asset/090e70978c57885db2d5bccd47c8efd05ad94044.png";
import imgRectangle40 from "figma:asset/7e2d0ad511bfb28d652cdc6178082141ac38f2ec.png";
import imgRectangle41 from "figma:asset/d8171626aea5f73ce218807f19b43ec6e8695d44.png";
import imgRectangle43 from "figma:asset/ff402fbd8f833c106d51bdead08f65a61bb7ea50.png";
import imgRectangle44 from "figma:asset/f37d5db6325420610e361115e5f6859812b1ee5d.png";
import imgMp4 from "figma:asset/f37d5db6325420610e361115e5f6859812b1ee5d.png";
import { ExpandedPanel } from './components/ExpandedPanel';
import { KnowledgeCard } from './components/KnowledgeCard';
import { VideoNotes } from './components/VideoNotes';
import {
  knowledgeCards,
  videoSegments,
  findActiveKnowledgeCard,
  findActiveSegment,
  type KnowledgeCardData
} from './data/videoTimelineData';
import type { TaskResult } from './types/task';
import { API_ENDPOINTS, STAGE_MESSAGES } from './config/api';
import { mapTaskResult } from './utils/taskMapper';
import { getActiveDemo, FAST_TRACK_CONFIG, matchDemoByFilename } from './config/demoRegistry';
import { loadDistributedData } from './utils/dataLoader';

type PageType = 'welcome' | 'home' | 'library' | 'me' | 'detail';
type VideoSection = 'reading' | 'later' | 'recent';

const videoData = [
  { id: 1, title: "一口气了解2025年全球经济 | 关税新格局", image: imgRectangle34, progress: 20, section: 'reading' },
  { id: 2, title: "一口气了解2025年全球经济 | 关税新格局", image: imgRectangle35, progress: 20, section: 'reading' },
  { id: 3, title: "一口气了解2025年全球经济 | 关税新格局", image: imgRectangle36, progress: 20, section: 'reading' },
  { id: 4, title: "一口气了解2025年全球经济 | 关税新格局", image: imgRectangle37, progress: 0, section: 'later' },
  { id: 5, title: "一口气了解2025年全球经济 | 关税新格局", image: imgRectangle38, progress: 0, section: 'later' },
  { id: 6, title: "一口气了解2025年全球经济 | 关税新格局", image: imgRectangle39, progress: 0, section: 'later' },
];

/**
 * 从文件名提取视频标题（去掉扩展名）
 */
const getVideoTitle = (filename: string): string => {
  return filename.replace(/\.[^/.]+$/, '');
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('welcome');
  const [selectedVideo, setSelectedVideo] = useState<number | null>(null);
  const [uploadedTaskResult, setUploadedTaskResult] = useState<TaskResult | null>(null);

  const handleStart = () => {
    setCurrentPage('home');
  };

  const handleNavigation = (page: PageType) => {
    setCurrentPage(page);
    setSelectedVideo(null);
    setUploadedTaskResult(null);
  };

  const handleVideoClick = (videoId: number) => {
    setSelectedVideo(videoId);
    setUploadedTaskResult(null);
    setCurrentPage('detail');
  };

  const handleUploadComplete = (taskResult: TaskResult) => {
    setUploadedTaskResult(taskResult);
    setSelectedVideo(null);
    setCurrentPage('detail');
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-white">
      <div className="max-w-[1280px] h-full mx-auto bg-[#f9f9f9] relative">
        {currentPage === 'welcome' && <WelcomePage onStart={handleStart} />}
        {currentPage === 'home' && <HomePage onNavigate={handleNavigation} onVideoClick={handleVideoClick} onUploadComplete={handleUploadComplete} />}
        {currentPage === 'library' && <LibraryPage onNavigate={handleNavigation} onVideoClick={handleVideoClick} onUploadComplete={handleUploadComplete} />}
        {currentPage === 'me' && <MePage onNavigate={handleNavigation} />}
        {currentPage === 'detail' && (selectedVideo || uploadedTaskResult) && (
          <DetailPage
            onNavigate={handleNavigation}
            videoId={selectedVideo}
            taskResult={uploadedTaskResult}
            onUploadComplete={handleUploadComplete}
          />
        )}
      </div>
      <Toaster position="top-center" richColors />
    </div>
  );
}

function WelcomePage({ onStart }: { onStart: () => void }) {
  return (
    <div className="relative w-full h-full bg-white overflow-clip">
      <div className="absolute left-1/2 size-[1240px] top-[-233px] translate-x-[-50%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1240 1240">
          <circle cx="620" cy="620" fill="#E0130B" r="620" />
        </svg>
      </div>
      <div className="absolute contents left-[calc(25%+29px)] top-[258px]">
        <p className="absolute font-['Avenir:Heavy',sans-serif] leading-[normal] left-1/2 not-italic text-[96px] text-nowrap text-white top-[258px] tracking-[-4.8px] -translate-x-1/2">VideO Reader</p>
        <div className="absolute flex h-[28.94px] items-center justify-center left-1/2 top-[305px] w-[24.806px] -translate-x-1/2" style={{ "--transform-inner-width": "0", "--transform-inner-height": "0" } as React.CSSProperties}>
          <div className="flex-none rotate-[90deg]">
            <div className="h-[24.806px] relative w-[28.94px]">
              <div className="absolute bottom-1/4 left-[6.7%] right-[6.7%] top-0">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 25.0627 18.6042">
                  <path d={svgPaths.p255f5a00} fill="#F5F5F5" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="absolute font-['Avenir:Light',sans-serif] leading-[normal] left-1/2 not-italic text-[24px] text-nowrap text-white top-[372px] -translate-x-1/2">See More. Know More. Be More.</p>
      <button 
        onClick={onStart}
        className="absolute bg-white h-[60px] left-1/2 rounded-[26.5px] top-[calc(50%+76px)] translate-x-[-50%] translate-y-[-50%] w-[133px] cursor-pointer hover:scale-105 transition-transform"
      >
        <p className="font-['Helvetica:Bold',sans-serif] leading-[normal] text-[#e0130b] text-[28px] text-center">Start</p>
      </button>
      <p className="absolute font-['Avenir:Roman',sans-serif] leading-[normal] left-1/2 not-italic text-[15px] text-nowrap text-white bottom-[40px] -translate-x-1/2">Design by : Jingcheng ,Liliana,Yaxuan,Ziyi</p>
    </div>
  );
}

function HomePage({ onNavigate, onVideoClick, onUploadComplete }: {
  onNavigate: (page: PageType) => void,
  onVideoClick: (id: number) => void,
  onUploadComplete: (taskResult: TaskResult) => void
}) {
  return (
    <div className="relative w-full h-full bg-[#f9f9f9] overflow-clip">
      <Sidebar currentPage="home" onNavigate={onNavigate} />
      <SearchBar onUploadComplete={onUploadComplete} />
      <div className="absolute content-stretch flex flex-col gap-[12px] items-start left-[calc(16.67%+19.67px)] top-[126px] w-[603px]">
        <VideoSection title="Reading" videos={videoData.filter(v => v.section === 'reading')} onVideoClick={onVideoClick} />
        <VideoSection title="Later" videos={videoData.filter(v => v.section === 'later')} onVideoClick={onVideoClick} />
        <RecentSection onVideoClick={onVideoClick} />
      </div>
      <StatsPanel />
      <CalendarWidget />
    </div>
  );
}

function LibraryPage({ onNavigate, onVideoClick, onUploadComplete }: {
  onNavigate: (page: PageType) => void,
  onVideoClick: (id: number) => void,
  onUploadComplete: (taskResult: TaskResult) => void
}) {
  return (
    <div className="relative w-full h-full bg-[#f9f9f9] overflow-clip">
      <Sidebar currentPage="library" onNavigate={onNavigate} />
      <SearchBar onUploadComplete={onUploadComplete} />
      <div className="absolute left-[calc(16.67%+19.67px)] top-[144px]">
        <div className="flex gap-[38px] items-center mb-6">
          <TabButton icon={<BookIcon color="#E0130B" />} label="Reading" active={true} />
          <TabButton icon={<TagIcon />} label="Later" active={false} />
          <TabButton icon={<CopyIcon />} label="Finish" active={false} />
        </div>
      </div>
      <div className="absolute left-[calc(16.67%+19.67px)] top-[193px] w-[604px]">
        {videoData.slice(0, 3).map((video, index) => (
          <div 
            key={video.id} 
            className="mb-4 cursor-pointer hover:scale-[1.02] transition-transform"
            onClick={() => onVideoClick(video.id)}
          >
            <LibraryVideoCard video={video} />
          </div>
        ))}
      </div>
      
      {/* Right Side Chat Panel */}
      <ChatPanel />
    </div>
  );
}

function MePage({ onNavigate }: { onNavigate: (page: PageType) => void }) {
  return (
    <div className="relative w-full h-full bg-[#f9f9f9] overflow-clip">
      <Sidebar currentPage="me" onNavigate={onNavigate} />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-32 h-32 rounded-full bg-[#ef3e23] flex items-center justify-center">
            <svg className="w-16 h-16" fill="white" viewBox="0 0 24 24">
              <path d={svgPaths.p1ad07300} />
            </svg>
          </div>
          <p className="text-[32px] text-black">个人中心</p>
          <p className="text-[16px] text-[#b8b5b5]">欢迎使用 VideO Reader</p>
        </div>
      </div>
    </div>
  );
}

function DetailPage({ onNavigate, videoId, taskResult, onUploadComplete }: {
  onNavigate: (page: PageType) => void,
  videoId: number | null,
  taskResult: TaskResult | null,
  onUploadComplete: (taskResult: TaskResult) => void
}) {
  const video = videoId ? videoData.find(v => v.id === videoId) : null;
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExpertMode, setIsExpertMode] = useState(false); // false = simple, true = deep
  const [isNotesExpanded, setIsNotesExpanded] = useState(false); // 控制视频笔记展开/收起

  // 映射后端数据到前端格式
  const mappedData = useMemo(() => {
    if (taskResult) {
      console.log('🔍 DetailPage received taskResult:', taskResult);
      const mapped = mapTaskResult(taskResult);
      console.log('✅ Mapped data:', mapped);
      return mapped;
    }
    console.log('⚠️ No taskResult, using default data');
    return null;
  }, [taskResult]);

  // 根据数据源决定使用哪个数据
  const displaySegments = mappedData?.videoSegments || videoSegments;
  const displayKnowledgeCards = mappedData?.knowledgeCards || knowledgeCards;
  const displayQuotes = mappedData?.quotes || [];

  console.log('📊 displaySegments:', displaySegments);
  console.log('💎 displayQuotes:', displayQuotes);

  // 视频源优先级：taskResult.video_url > demoRegistry.videoPath
  const activeDemo = getActiveDemo();
  const videoSrc = taskResult?.video_url || activeDemo.videoPath;

  // 视频相关状态
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeKnowledgeCard, setActiveKnowledgeCard] = useState<KnowledgeCardData | null>(null);
  const [showKnowledgeCard, setShowKnowledgeCard] = useState(false);
  const lastTriggeredCard = useRef<{ word: string; time: number } | null>(null);

  // 查找当前时间激活的知识卡片
  const findCurrentKnowledgeCard = (time: number): KnowledgeCardData | null => {
    const card = displayKnowledgeCards.find(card => Math.abs(card.time - time) < 0.5);
    if (card) {
      console.log('🎯 Found knowledge card at time', time, ':', card.word);
    }
    return card || null;
  };

  // 监听视频播放时间
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    console.log('🎬 Video player initialized. Knowledge cards:', displayKnowledgeCards.length);
    console.log('📍 Card trigger times:', displayKnowledgeCards.map(c => `${c.word}@${c.time}s`));

    const handleTimeUpdate = () => {
      const time = videoElement.currentTime;
      setCurrentTime(time);

      // 检查是否需要显示知识卡片
      const card = findCurrentKnowledgeCard(time);

      if (card) {
        // 检查是否需要重新触发（避免在同一时间段内重复触发）
        const shouldTrigger = !lastTriggeredCard.current ||
                             lastTriggeredCard.current.word !== card.word ||
                             Math.abs(lastTriggeredCard.current.time - time) > 2; // 2秒冷却时间

        if (shouldTrigger) {
          console.log('✨ Triggering knowledge card:', card.word, 'at', time);
          setActiveKnowledgeCard(card);
          setShowKnowledgeCard(true);
          lastTriggeredCard.current = { word: card.word, time };

          // 5秒后自动隐藏（防抖：解决段落太碎的问题）
          setTimeout(() => {
            setShowKnowledgeCard(false);
          }, 5000);
        }
      } else {
        // 离开所有卡片的触发区域，重置状态（允许重新触发）
        if (lastTriggeredCard.current &&
            !displayKnowledgeCards.some(c => Math.abs(c.time - time) < 2)) {
          lastTriggeredCard.current = null;
        }
      }
    };

    videoElement.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [activeKnowledgeCard, displayKnowledgeCards]);

  // 视频跳转函数
  const handleSeekTo = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  return (
    <div className="relative w-full h-full bg-[#f9f9f9] overflow-y-auto">
      <Sidebar currentPage="library" onNavigate={onNavigate} />
      <SearchBar onUploadComplete={onUploadComplete} />

      {/* Video Title and Info */}
      <p className="absolute font-['Alibaba_PuHuiTi_3.0:65_Medium',sans-serif] leading-[normal] left-[calc(16.67%+19.67px)] not-italic text-[22.135px] text-black top-[132px] w-[451px]">
        {taskResult?.title || video?.title || "一口气了解2025年全球经济 | 关税新格局"}
      </p>
      <p className="absolute font-['Alibaba_PuHuiTi_3.0:65_Medium',sans-serif] leading-[normal] left-[calc(16.67%+20.67px)] not-italic text-[#b8b5b5] text-[14px] text-nowrap top-[163px]">
        {taskResult ? 'AI 智能分析' : '@小 Lin 说'}
      </p>
      <p className="absolute font-['Alibaba_PuHuiTi_3.0:65_Medium',sans-serif] leading-[normal] left-[calc(25%-6px)] not-italic text-[#b8b5b5] text-[14px] text-nowrap top-[163px]">
        {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '/')}
      </p>
      <p className="absolute font-['Alibaba_PuHuiTi_3.0:65_Medium',sans-serif] leading-[normal] left-[calc(25%+87px)] not-italic text-[#b8b5b5] text-[14px] text-nowrap top-[163px]">
        Video
      </p>

      {/* Video Player Area */}
      <div className="absolute h-[340px] left-[calc(16.67%+19.67px)] rounded-[14px] top-[194px] w-[604.444px]">
        <video
          ref={videoRef}
          className="absolute inset-0 max-w-none object-cover rounded-[14px] size-full"
          src={videoSrc}
          controls
          poster={imgMp4}
        >
          您的浏览器不支持视频播放
        </video>
        <div aria-hidden="true" className="absolute border-[#e0130b] border-[0px_0px_0px_2px] border-solid inset-[0_0_0_-2px] rounded-[14px] pointer-events-none" />
      </div>

      {/* Expand/Collapse Triangle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute flex items-center justify-center left-[calc(16.67%+12.67px)] size-[22px] top-[232px] cursor-pointer hover:scale-110 transition-transform z-10"
        style={{ "--transform-inner-width": "0", "--transform-inner-height": "0" } as React.CSSProperties}
      >
        <div className={`flex-none ${isExpanded ? 'rotate-[270deg]' : 'rotate-[90deg]'} transition-transform`}>
          <div className="relative size-[22px]">
            <div className="absolute bottom-1/4 left-[10.02%] right-[10.02%] top-[4.55%]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.5914 15.5">
                <path d={svgPaths.p2db17900} fill="#E32C25" />
              </svg>
            </div>
          </div>
        </div>
      </button>
      
      {/* Right Arrow */}
      <div className="absolute flex h-[26px] items-center justify-center left-[calc(58.33%+72.33px)] top-[234px] w-[24px]" style={{ "--transform-inner-width": "0", "--transform-inner-height": "0" } as React.CSSProperties}>
        <div className="flex-none rotate-[270deg]">
          <div className="h-[24px] relative w-[26px]">
            <div className="absolute bottom-1/4 left-[6.7%] right-[6.7%] top-0">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22.5167 18">
                <path d={svgPaths.p1a00fc00} fill="#D9D9D9" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* Expanded Panel - Video Notes */}
      {isExpanded && (
        <ExpandedPanel
          segments={displaySegments}
          knowledgeCards={displayKnowledgeCards}
          quotes={displayQuotes}
          currentTime={currentTime}
          onSeekTo={handleSeekTo}
        />
      )}

      {/* Knowledge Card - 自动弹窗 */}
      {activeKnowledgeCard && (
        <KnowledgeCard
          visible={showKnowledgeCard}
          word={activeKnowledgeCard.word}
          simple={activeKnowledgeCard.simple}
          deep={activeKnowledgeCard.deep}
          isExpertMode={isExpertMode}
          onToggle={() => setIsExpertMode(!isExpertMode)}
          onClose={() => setShowKnowledgeCard(false)}
        />
      )}
      
      {/* Bottom Tabs - 视频笔记展开/收起按钮 */}
      <button
        onClick={() => setIsNotesExpanded(!isNotesExpanded)}
        className="absolute flex items-center gap-2 left-[calc(16.67%+34.67px)] top-[551px] cursor-pointer hover:opacity-80 transition-opacity"
      >
        <p className="font-['Alibaba_PuHuiTi_3.0:85_Bold',sans-serif] leading-[normal] not-italic text-[14.5px] text-black text-nowrap">
          视频笔记
        </p>
        <div className={`transition-transform ${isNotesExpanded ? 'rotate-180' : 'rotate-0'}`}>
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
            <path d="M1 1L6 6L11 1" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </button>
      
      {/* Divider Line */}
      <div className="absolute h-0 left-[calc(16.67%+34.67px)] top-[578px] w-[583px]">
        <div className="absolute inset-[-1px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 583 1">
            <line stroke="#B8B5B5" x2="583" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>

      {/* Video Notes Component - 只在展开时显示 */}
      {isNotesExpanded && <VideoNotes taskResult={taskResult} videoId={videoId} />}
      
      {/* Right Side Chat Panel - DetailChatPanel */}
      <DetailChatPanel />
      
      {/* Spacer to ensure enough height for scrolling - VideoNotes is at top-590px and needs ~400px height */}
      <div className="h-[1100px]" aria-hidden="true" />
    </div>
  );
}

function Sidebar({ currentPage, onNavigate }: { currentPage: string, onNavigate: (page: PageType) => void }) {
  return (
    <div className="absolute bg-[#ef3e23] flex flex-col gap-[28px] h-[calc(100%-48px)] items-center left-[24px] px-[8px] py-[32px] rounded-[20px] top-[24px] w-[185px]">
      <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start">
        <p className="[grid-area:1_/_1] font-['Avenir:Heavy',sans-serif] leading-[normal] ml-0 mt-0 not-italic text-[24.742px] text-nowrap text-white tracking-[-1.2371px]">VideO Reader</p>
        <div className="[grid-area:1_/_1] flex h-[7.459px] items-center justify-center ml-[55.15px] mt-[12.11px] w-[6.393px]">
          <div className="flex-none rotate-[90deg]">
            <div className="h-[6.393px] relative w-[7.459px]">
              <div className="absolute bottom-1/4 left-[6.7%] right-[6.7%] top-0">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6.45946 4.79491">
                  <path d={svgPaths.p210a6e00} fill="#F5F5F5" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col gap-[11px] w-full">
        <NavItem 
          icon={<HomeIcon />} 
          label="Home" 
          active={currentPage === 'home'} 
          onClick={() => onNavigate('home')}
        />
        <NavItem 
          icon={<BookIcon />} 
          label="Library" 
          active={currentPage === 'library'} 
          onClick={() => onNavigate('library')}
        />
        <NavItem 
          icon={<StickerIcon />} 
          label="Me" 
          active={currentPage === 'me'} 
          onClick={() => onNavigate('me')}
        />
      </div>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`${active ? 'bg-[#e0130b]' : 'bg-[rgba(224,19,11,0)]'} h-[39px] rounded-[10px] w-full flex items-center px-[9px] py-[4px] gap-[4px] hover:bg-[rgba(224,19,11,0.5)] transition-colors cursor-pointer`}
    >
      {icon}
      <p className={`${active ? "font-['Helvetica:Bold',sans-serif]" : "font-['Helvetica:Regular',sans-serif]"} text-[16px] text-nowrap text-white`}>{label}</p>
    </button>
  );
}

function HomeIcon() {
  return (
    <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
      <path d={svgPaths.p3f91be80} />
    </svg>
  );
}

function BookIcon({ color = "white" }: { color?: string }) {
  return (
    <svg className="w-6 h-6" fill={color} viewBox="0 0 24 24">
      <path d={svgPaths.p2e301c00} />
      <path d={svgPaths.p1d744d80} />
    </svg>
  );
}

function StickerIcon() {
  return (
    <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
      <path d={svgPaths.p1ad07300} />
      <path d={svgPaths.pa40b100} />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg className="w-6 h-6" fill="#B8B5B5" viewBox="0 0 23 23">
      <path d={svgPaths.p34d4d270} />
      <path d={svgPaths.pd4e4b70} />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg className="w-6 h-6" fill="#B8B5B5" viewBox="0 0 23 23">
      <path d={svgPaths.p4d57440} />
      <path d={svgPaths.p1094c900} />
    </svg>
  );
}

function SearchBar({ onUploadComplete }: { onUploadComplete: (taskResult: TaskResult) => void }) {
  const [isUploading, setIsUploading] = useState(false);
  const [currentStage, setCurrentStage] = useState<string>('');
  const [popoverOpen, setPopoverOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Fast-Track 模式：模拟 SSE 进度，直接加载本地数据
   */
  const handleFastTrackUpload = async (file: File) => {
    // 根据文件名自动匹配对应的 Demo 配置
    const activeDemo = matchDemoByFilename(file.name);
    const stages: Array<keyof typeof FAST_TRACK_CONFIG.stageDelays> = ['slicing', 'asr', 'llm_summary', 'llm_keywords', 'finalize'];

    setIsUploading(true);
    setPopoverOpen(true);

    // 模拟各阶段进度
    for (const stage of stages) {
      setCurrentStage(stage);
      await new Promise(resolve => setTimeout(resolve, FAST_TRACK_CONFIG.stageDelays[stage]));
    }

    try {
      let taskResult: TaskResult;

      // 根据数据类型选择加载方式
      if (activeDemo.dataType === 'single') {
        // 旧格式：单个 JSON 文件
        console.log('📄 Loading single file:', activeDemo.dataPath);
        const response = await fetch(activeDemo.dataPath);
        if (!response.ok) {
          throw new Error(`Failed to load demo data: ${activeDemo.dataPath}`);
        }
        taskResult = await response.json();
      } else {
        // 新格式：分散式文件夹
        console.log('📂 Loading distributed data from:', activeDemo.dataPath);
        const folderName = activeDemo.dataPath.replace('/data/', '');
        taskResult = await loadDistributedData(folderName);
      }

      console.log('🎯 Fast-Track loaded taskResult:', taskResult);
      console.log('📦 summary.by_slice:', taskResult.summary?.by_slice);

      // 注入视频 URL（从配置中读取）
      taskResult.video_url = activeDemo.videoPath;
      // 注入视频标题（从上传的文件名提取）
      taskResult.title = getVideoTitle(file.name);

      // 完成上传
      setIsUploading(false);
      setPopoverOpen(false);
      toast.success(`${activeDemo.name} - 分析完成`);
      console.log('✅ Calling onUploadComplete with taskResult');
      onUploadComplete(taskResult);
    } catch (error) {
      console.error('Fast-Track error:', error);
      toast.error('加载演示数据失败');
      setIsUploading(false);
      setPopoverOpen(false);
    }
  };

  /**
   * 真实上传模式（可选）- 调用后端 API
   */
  const handleRealUpload = async (file: File) => {
    setIsUploading(true);
    setCurrentStage('slicing');

    try {
      // 1. 创建任务
      const formData = new FormData();
      formData.append('video', file);
      formData.append('mode', 'simple');
      formData.append('video_type', 'History');

      const createResponse = await fetch(API_ENDPOINTS.createTask, {
        method: 'POST',
        body: formData,
      });

      if (!createResponse.ok) {
        throw new Error('Failed to create task');
      }

      const { task_id } = await createResponse.json();

      // 2. 监听 SSE 进度
      const eventSource = new EventSource(API_ENDPOINTS.getTaskEvents(task_id));

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.stage) {
          setCurrentStage(data.stage);
        }

        if (data.status === 'finished') {
          eventSource.close();

          // 3. 获取结果
          fetch(API_ENDPOINTS.getTaskResult(task_id))
            .then(res => res.json())
            .then((result: TaskResult) => {
              // 如果后端没有返回标题，使用文件名作为标题
              if (!result.title) {
                result.title = getVideoTitle(file.name);
              }
              setIsUploading(false);
              setPopoverOpen(false);
              toast.success('视频解析完成');
              onUploadComplete(result);
            })
            .catch(err => {
              console.error('Failed to fetch result:', err);
              toast.error('获取结果失败');
              setIsUploading(false);
            });
        } else if (data.status === 'failed') {
          eventSource.close();
          toast.error('视频处理失败');
          setIsUploading(false);
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        toast.error('连接失败');
        setIsUploading(false);
      };

    } catch (error) {
      console.error('Upload error:', error);
      toast.error('上传失败');
      setIsUploading(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 根据配置决定使用 Fast-Track 还是真实上传
    if (FAST_TRACK_CONFIG.enabled) {
      await handleFastTrackUpload(file);
    } else {
      await handleRealUpload(file);
    }

    // 清空 input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="absolute flex gap-[54px] items-center left-[calc(33.33%-2.67px)] top-[57px]">
      <div className="bg-white flex h-[46px] items-center justify-center px-[258px] py-[11px] rounded-[46.5px] shadow-[0px_4px_4px_4px_rgba(0,0,0,0.05)] w-[642px]">
        <div className="flex gap-[19px] items-center">
          <svg className="w-6 h-6" fill="black" viewBox="0 0 24 24">
            <path d={svgPaths.p33fa9e80} />
            <path d={svgPaths.p26843900} />
          </svg>
          <p className="text-[16px] text-black text-nowrap">search</p>
        </div>
      </div>

      {/* Upload Popover */}
      <Popover.Root open={popoverOpen} onOpenChange={setPopoverOpen}>
        <Popover.Trigger asChild>
          <button className="w-6 h-6 cursor-pointer hover:opacity-80 transition-opacity">
            <svg className="w-6 h-6" fill="black" viewBox="0 0 24 24">
              <path d={svgPaths.p60b280} />
              <path d={svgPaths.pd820400} />
              <path d={svgPaths.pa185f00} />
              <path d={svgPaths.p1d844e00} />
            </svg>
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            className="bg-white/90 backdrop-blur-md rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-6 w-[160px] flex flex-col items-center justify-center gap-4 animate-in fade-in zoom-in-95 duration-200"
            sideOffset={5}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-14 h-14 text-[#E0130B] animate-spin" />
                <p className="text-[10px] font-bold tracking-widest text-gray-400 text-center">
                  {STAGE_MESSAGES[currentStage] || '处理中...'}
                </p>
              </>
            ) : (
              <>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-3 cursor-pointer hover:scale-105 transition-transform"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-50/50 flex items-center justify-center">
                    <Paperclip className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-[8px] font-bold tracking-widest text-gray-400">上传视频</p>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  style={{ display: 'none' }}
                  aria-hidden="true"
                />
              </>
            )}
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}

function VideoSection({ title, videos, onVideoClick }: { title: string, videos: any[], onVideoClick: (id: number) => void }) {
  return (
    <div className="flex flex-col gap-[6px] w-full">
      <p className="font-['Helvetica:Bold',sans-serif] text-[20px] text-black">{title}</p>
      <div className="flex gap-[24px]">
        {videos.map(video => (
          <div 
            key={video.id} 
            className="flex flex-col gap-[6px] w-[185px] cursor-pointer hover:scale-105 transition-transform"
            onClick={() => onVideoClick(video.id)}
          >
            <div className="h-[185px] rounded-[10px] overflow-hidden">
              <img src={video.image} alt="" className="w-full h-full object-cover" />
            </div>
            <p className="text-[12px] text-black line-clamp-2">{video.title}</p>
            <div className="flex gap-[9px] text-[10px] text-[#b8b5b5]">
              <span>昨天</span>
              <span>Video</span>
              <span>{video.progress}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentSection({ onVideoClick }: { onVideoClick: (id: number) => void }) {
  return (
    <div className="flex flex-col gap-[6px] w-[185px]">
      <p className="font-['Helvetica:Bold',sans-serif] text-[20px] text-black">Recent</p>
      <div 
        className="flex flex-col gap-[6px] cursor-pointer hover:scale-105 transition-transform"
        onClick={() => onVideoClick(2)}
      >
        <div className="h-[185px] rounded-[10px] overflow-hidden">
          <img src={imgRectangle35} alt="" className="w-full h-full object-cover" />
        </div>
        <p className="text-[12px] text-black">一口气了解2025年全球经济 | 关税新格局</p>
      </div>
    </div>
  );
}

function LibraryVideoCard({ video }: { video: any }) {
  return (
    <div className="bg-white rounded-[20px] flex overflow-hidden">
      <div className="w-[288px] h-[113px] overflow-hidden">
        <img src={video.image} alt="" className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 p-4">
        <p className="text-[16px] mb-2">{video.title}</p>
        <p className="text-[10px] text-[#b8b5b5] mb-2">本文主要讲了2025 年全球经济的发展，对中美贸易战做了清晰的梳理本文主要讲了2025 年全球经济的发展，对中美······</p>
        <div className="flex gap-[9px] text-[12px] text-[#b8b5b5]">
          <span>昨天</span>
          <span>Video</span>
          <span>{video.progress}%</span>
        </div>
      </div>
    </div>
  );
}

function TabButton({ icon, label, active }: { icon: React.ReactNode, label: string, active: boolean }) {
  return (
    <div className="flex gap-[4px] items-center">
      {icon}
      <p className={`font-['Helvetica:Bold',sans-serif] text-[20px] ${active ? 'text-[#e0130b]' : 'text-[#b8b5b5]'}`}>{label}</p>
    </div>
  );
}

function StatsPanel() {
  return (
    <div className="absolute h-[641px] left-[calc(66.67%+7.67px)] top-[159px] w-[395px]">
      <div className="absolute bg-white h-[641px] left-0 rounded-[20px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] top-0 w-[395px]" />
      
      {/* Circle Chart */}
      <div className="absolute content-stretch flex flex-col gap-[10px] items-center justify-center left-0 px-[66px] py-[61px] size-[188.001px] top-0">
        <div className="absolute left-0 size-[188.001px] top-0">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 188.001 188.001">
            <path d={svgPaths.pb3587b0} fill="#FFD580" />
            <path d={svgPaths.p12290280} fill="#E32C25" />
          </svg>
        </div>
        <div className="content-stretch flex flex-col items-center justify-center leading-[normal] not-italic relative shrink-0 text-center w-[56px] z-10">
          <p className="font-['Helvetica:Bold',sans-serif] min-w-full relative shrink-0 text-[#e32c25] text-[32px] w-[min-content]">16</p>
          <p className="font-['Helvetica:Regular',sans-serif] relative shrink-0 text-[12px] text-black w-[80px]">Finished</p>
        </div>
      </div>
      
      {/* Aim */}
      <div className="absolute bg-[#f9f9f9] content-stretch flex font-['Alibaba_PuHuiTi_3.0:85_Bold',sans-serif] gap-[6px] h-[40px] items-end leading-[normal] left-[184px] not-italic px-[17px] py-[8px] rounded-[10px] text-center top-[25px] w-[189px]">
        <p className="h-[30px] relative shrink-0 text-[#ef3e23] text-[28px] w-[62px]">4/7</p>
        <p className="relative shrink-0 text-[14px] text-black text-nowrap">Aim</p>
      </div>
      
      {/* Reading */}
      <div className="absolute bg-[#f9f9f9] content-stretch flex font-['Alibaba_PuHuiTi_3.0:85_Bold',sans-serif] gap-[6px] h-[40px] items-end leading-[normal] left-[184px] not-italic px-[17px] py-[8px] rounded-[10px] text-center top-[74px] w-[189px]">
        <p className="h-[34px] relative shrink-0 text-[#e0130b] text-[32px] w-[13px]">4</p>
        <p className="relative shrink-0 text-[12px] text-black text-nowrap">Reading</p>
      </div>
      
      {/* Not Yet */}
      <div className="absolute bg-[#f9f9f9] content-stretch flex font-['Alibaba_PuHuiTi_3.0:85_Bold',sans-serif] gap-[6px] h-[40px] items-end leading-[normal] left-[184px] not-italic px-[17px] py-[8px] rounded-[10px] text-center top-[120px] w-[189px]">
        <p className="h-[34px] relative shrink-0 text-[#ef3e23] text-[32px] w-[13px]">4</p>
        <p className="relative shrink-0 text-[12px] text-black text-nowrap">Not Yet</p>
      </div>
      
      {/* Decorative Images */}
      <div className="absolute h-[14px] left-[188px] top-[469px] w-[16px]">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgImage13} />
      </div>
      <div className="absolute h-[14px] left-[239px] top-[410px] w-[16px]">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgImage13} />
      </div>
      <div className="absolute h-[14px] left-[239px] top-[348px] w-[16px]">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgImage13} />
      </div>
    </div>
  );
}

function CalendarWidget() {
  // 使用正确的日历数据结构 - 参考图片中的布局
  // 第1周: 1, 2, 3 (非活跃)
  // 第2周: 4 (非活跃), 5, 6, 7, 8, 9, 10 (非活跃)
  // 第3周: 11 (非活跃), 12, 13, 14, 15, 16, 17 (非活跃)
  // 第4周: 18 (非活跃), 19, 20, 21, 22, 23, 24 (非活跃)
  // 第5周: 25 (非活跃), 26, 27, 28, 29, 30, 31 (非活跃)
  
  const calendarData = [
    // Week 1
    [
      { num: 1, active: true },
      { num: 2, active: true },
      { num: 3, active: false },
      { num: 4, active: false },
      { num: 5, active: true },
      { num: 6, active: true },
      { num: 7, active: true }
    ],
    // Week 2
    [
      { num: 8, active: true },
      { num: 9, active: true },
      { num: 10, active: false },
      { num: 11, active: false },
      { num: 12, active: true },
      { num: 13, active: true },
      { num: 14, active: true }
    ],
    // Week 3
    [
      { num: 15, active: true },
      { num: 16, active: true },
      { num: 17, active: false },
      { num: 18, active: false },
      { num: 19, active: true },
      { num: 20, active: true },
      { num: 21, active: true }
    ],
    // Week 4
    [
      { num: 22, active: true },
      { num: 23, active: true },
      { num: 24, active: false },
      { num: 25, active: false },
      { num: 26, active: true },
      { num: 27, active: true },
      { num: 28, active: true }
    ],
    // Week 5
    [
      { num: 29, active: true },
      { num: 30, active: true },
      { num: 31, active: false },
      { num: null, active: false },
      { num: null, active: false },
      { num: null, active: false },
      { num: null, active: false }
    ]
  ];
  
  return (
    <div className="absolute contents left-[calc(66.67%+26.67px)] top-[340px]">
      <p className="absolute font-['Alibaba_PuHuiTi_3.0:55_Regular',sans-serif] leading-[normal] left-[calc(66.67%+26.67px)] not-italic text-[#212121] text-[24px] text-nowrap top-[340px]">Calendar</p>
      <p className="absolute font-['Alibaba_PuHuiTi_3.0:85_Bold',sans-serif] leading-[normal] left-[calc(66.67%+26.67px)] not-italic text-[#212121] text-[16px] text-nowrap top-[386px]">1,1 2026</p>
      
      {/* Week Days */}
      <div className="absolute content-stretch flex gap-[40px] items-start leading-[normal] left-[calc(66.67%+26.67px)] not-italic overflow-clip px-[20px] py-[12px] text-[#212121] text-[16px] text-nowrap top-[420px]">
        <p className="font-['Alibaba_PuHuiTi_3.0:65_Medium',sans-serif] relative shrink-0">S</p>
        <p className="font-['Alibaba_PuHuiTi_3.0:55_Regular',sans-serif] relative shrink-0">M</p>
        <p className="font-['Alibaba_PuHuiTi_3.0:55_Regular',sans-serif] relative shrink-0">T</p>
        <p className="font-['Alibaba_PuHuiTi_3.0:55_Regular',sans-serif] relative shrink-0">W</p>
        <p className="font-['Alibaba_PuHuiTi_3.0:65_Medium',sans-serif] relative shrink-0">T</p>
        <p className="font-['Alibaba_PuHuiTi_3.0:65_Medium',sans-serif] relative shrink-0">F</p>
        <p className="font-['Alibaba_PuHuiTi_3.0:55_Regular',sans-serif] relative shrink-0">S</p>
      </div>
      
      {/* Calendar Dates */}
      <div className="absolute content-stretch flex flex-col gap-[12px] items-end left-[calc(66.67%+26.67px)] top-[476px]">
        {calendarData.map((week, weekIdx) => (
          <div key={weekIdx} className="content-stretch flex gap-[3px] items-start relative shrink-0">
            {week.map((day, dayIdx) => (
              <div key={dayIdx} className="content-stretch flex gap-[8px] items-start relative shrink-0">
                {day.active && day.num && (
                  <div className="relative shrink-0 size-[48px]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 48 48">
                      <circle cx="24" cy="24" fill="#FF7878" fillOpacity="0.2" r="24" />
                    </svg>
                  </div>
                )}
                {day.num && (
                  <p className={`absolute font-['Pretendard:Bold',sans-serif] leading-[normal] left-[24px] not-italic ${day.active ? 'text-[#3f6262]' : 'opacity-40 text-[#212121]'} text-[16px] text-center text-nowrap top-[15px] translate-x-[-50%]`}>
                    {day.num}
                  </p>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function ChatWidget() {
  return (
    <div className="absolute right-[24px] bottom-[24px] w-[230px]">
      <div className="mb-4 bg-[#f5f5f5] rounded-[9px] p-3">
        <p className="text-[12px] text-[#5e5e5e]">你好，请问你还好吗？我有几个关于 AI 的问题想要请教你，你是否可以解答？</p>
      </div>
      <div className="bg-[rgba(255,120,120,0.2)] rounded-[9px] p-3 mb-4">
        <p className="text-[12px] text-[#5c5c5c] leading-relaxed">
          你好呀，我很好，随时可以帮你解答关于 AI 的问题～<br/>
          不管是 AI 技术原理、行业应用、发展趋势，还是和之前聊到的美股 AI 泡沫相关的内容，你都可以直接提出来，我会尽力给你详细的答复。
        </p>
      </div>
      <div className="bg-white rounded-[8px] p-2 flex items-center gap-2">
        <input 
          type="text" 
          placeholder="Describe your task or ask a question…" 
          className="flex-1 text-[13px] text-[#5c5c5c] outline-none"
        />
        <svg className="w-4 h-4" fill="#C9C9C9" viewBox="0 0 16 16">
          <path d={svgPaths.p18c26800} />
        </svg>
      </div>
    </div>
  );
}

function ChatPanel() {
  return (
    <div className="absolute contents left-[calc(66.67%+9.67px)] top-[193px]">
      {/* Main Chat Container - 615px height */}
      <div className="absolute bg-white h-[615px] left-[calc(66.67%+9.67px)] rounded-[20px] shadow-[0px_4px_20px_4px_rgba(0,0,0,0.1)] top-[193px] w-[393px]" />
      
      {/* Title Section */}
      <div className="absolute contents left-[calc(66.67%+21.67px)] top-[218px]">
        <p className="absolute font-['Alibaba_PuHuiTi_3.0:65_Medium',sans-serif] leading-[normal] left-[calc(91.67%+6.67px)] not-italic text-[14px] text-black text-nowrap top-[218px]">new</p>
        <p className="absolute font-['Alibaba_PuHuiTi_3.0:65_Medium',sans-serif] leading-[normal] left-[calc(66.67%+56.67px)] not-italic text-[14px] text-black text-nowrap top-[218px]">一口气了解2025年全球经济 | 关税新格局</p>
        
        {/* Chat Messages Group */}
        <div className="absolute contents left-[calc(66.67%+21.67px)] top-[249px]">
          {/* User Message 1 */}
          <div className="absolute bg-[#f5f5f5] content-stretch flex h-[64px] items-center justify-center left-[calc(75%+84px)] p-[6px] rounded-[9px] top-[249px] w-[195px]">
            <p className="font-['Alibaba_PuHuiTi_3.0:55_Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#5e5e5e] text-[12px] w-[181px]">你好，请问你还好吗？我有几个关于 AI 的问题想要请教你，你是否可以解答？</p>
          </div>
          
          {/* AI Response 1 */}
          <div className="absolute bg-[rgba(255,120,120,0.2)] content-stretch flex h-[119px] items-center justify-center left-[calc(66.67%+21.67px)] px-[9px] py-[11px] rounded-[9px] top-[321px] w-[230px]">
            <div className="font-['Alibaba_PuHuiTi_3.0:55_Regular',sans-serif] leading-[16px] not-italic relative shrink-0 text-[#5c5c5c] text-[12px] w-[211px]">
              <p className="mb-0">你好呀，我很好，随时可以帮你解答关于 AI 的问题～</p>
              <p>不管是 AI 技术原理、行业应用、发展趋势，还是和之前聊到的美股 AI 泡沫相关的内容，你都可以直接提出来，我会尽力给你详细的答复。</p>
            </div>
          </div>
          
          {/* User Message 2 */}
          <div className="absolute bg-[#f5f5f5] content-stretch flex h-[64px] items-center justify-center left-[calc(75%+84px)] p-[6px] rounded-[9px] top-[448px] w-[195px]">
            <p className="font-['Alibaba_PuHuiTi_3.0:55_Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#5e5e5e] text-[12px] w-[181px]">你好，请问你还好吗？我有几个关于 AI 的问题想要请教你，你是否可以解答？</p>
          </div>
          
          {/* AI Response 2 */}
          <div className="absolute bg-[rgba(255,120,120,0.2)] content-stretch flex h-[119px] items-center justify-center left-[calc(66.67%+21.67px)] px-[9px] py-[11px] rounded-[9px] top-[520px] w-[230px]">
            <div className="font-['Alibaba_PuHuiTi_3.0:55_Regular',sans-serif] leading-[16px] not-italic relative shrink-0 text-[#5c5c5c] text-[12px] w-[211px]">
              <p className="mb-0">你好呀，我很好，随时可以帮你解答关于 AI 的问题～</p>
              <p>不管是 AI 技术原理、行业应用、发展趋势，还是和之前聊到的美股 AI 泡沫相关的内容，你都可以直接提出来，我会尽力给你详细的答复。</p>
            </div>
          </div>
          
          {/* User Message 3 */}
          <div className="absolute bg-[#f5f5f5] content-stretch flex h-[64px] items-center justify-center left-[calc(75%+84px)] p-[6px] rounded-[9px] top-[647px] w-[195px]">
            <p className="font-['Alibaba_PuHuiTi_3.0:55_Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#5e5e5e] text-[12px] w-[181px]">你好，请问你还好吗？我有几个关于 AI 的问题想要请教你，你是否可以解答？</p>
          </div>
        </div>
      </div>
      
      {/* Bottom Section with Gradient and Input */}
      <div className="absolute contents left-[calc(66.67%+9.67px)] top-[659px]">
        {/* Bottom Gradient - starts at 659px, height 149px, ends at 808px (193+615=808) */}
        <div className="absolute bg-gradient-to-b from-[11.074%] from-[rgba(255,255,255,0)] h-[149px] left-[calc(66.67%+9.67px)] rounded-bl-[20px] rounded-br-[20px] to-[#ffffff] to-[32.55%] top-[659px] w-[393px]" />
        
        {/* Input Field Container - 72px height at 713px */}
        <div className="absolute content-stretch flex flex-col gap-[4px] h-[72px] items-start left-[calc(66.67%+23.67px)] top-[713px] w-[366px]">
          <div className="basis-0 bg-white grow min-h-px min-w-px relative rounded-[8px] shrink-0 w-full">
            <div className="overflow-clip rounded-[inherit] size-full">
              <div className="content-stretch flex gap-[8px] items-start pl-[8px] pr-0 py-0 relative size-full">
                <div className="basis-0 content-stretch flex grow h-full items-start min-h-px min-w-px px-0 py-[8px] relative shrink-0">
                  <p className="basis-0 font-['SF_Pro:Regular',sans-serif] font-normal grow h-full leading-[18px] min-h-px min-w-px overflow-ellipsis overflow-hidden relative shrink-0 text-[#5c5c5c] text-[13px] text-nowrap">
                    Describe your task or ask a question…
                  </p>
                </div>
                <div className="content-stretch flex h-full items-end justify-center pb-[8px] pt-0 px-0 relative shrink-0 w-[32px]">
                  <svg className="w-4 h-4" fill="#C9C9C9" viewBox="0 0 16 16">
                    <path d={svgPaths.p18c26800} />
                  </svg>
                </div>
              </div>
            </div>
            <div aria-hidden="true" className="absolute border border-[#5c5c5c] border-solid inset-0 pointer-events-none rounded-[8px]" />
          </div>
        </div>
        
        {/* Small Avatar - at 666px */}
        <div className="absolute left-[calc(66.67%+26.67px)] rounded-[4px] size-[42px] top-[666px]">
          <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[4px]">
            <div className="absolute bg-[#d9d9d9] inset-0 rounded-[4px]" />
            <img alt="" className="absolute max-w-none object-50%-50% object-cover rounded-[4px] size-full" src={imgRectangle43} />
          </div>
        </div>
      </div>
    </div>
  );
}

// AI 对话消息类型
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  displayContent?: string; // 用于打字机效果
  timestamp: number;
}

// 组件 Props
interface DetailChatPanelProps {
  currentTime?: number; // 当前视频播放时间（秒），可选
}

function DetailChatPanel({ currentTime = 150 }: DetailChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [videoData, setVideoData] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 加载视频数据 (test1.json)
  useEffect(() => {
    fetch('/data/test1.json')
      .then(res => res.json())
      .then(data => setVideoData(data))
      .catch(err => console.error('加载视频数据失败:', err));
  }, []);

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 定位当前章节总结
  const getCurrentChapterSummary = (): string => {
    if (!videoData?.summary?.by_slice) return '';
    const chapter = videoData.summary.by_slice.find(
      (slice: any) => currentTime >= slice.start && currentTime < slice.end
    );
    return chapter?.summary || '';
  };

  // 定位当前字幕及上下文（前后各10条）
  const getCurrentSubtitleContext = (): string => {
    if (!videoData?.transcript?.segments) return '';
    const segments = videoData.transcript.segments;

    // 找到当前时间对应的字幕索引
    const currentIndex = segments.findIndex(
      (seg: any) => currentTime >= seg.start && currentTime <= seg.end
    );

    if (currentIndex === -1) return '';

    // 提取前后各10条字幕
    const startIndex = Math.max(0, currentIndex - 10);
    const endIndex = Math.min(segments.length - 1, currentIndex + 10);

    return segments
      .slice(startIndex, endIndex + 1)
      .map((seg: any) => seg.text)
      .join('');
  };

  // 构建上下文
  const buildContext = (): string => {
    const chapterSummary = getCurrentChapterSummary();
    const subtitleContext = getCurrentSubtitleContext();

    return `当前章节总结：${chapterSummary}\n\n当前视频字幕片段：${subtitleContext}`;
  };

  // 打字机效果
  const typewriterEffect = (message: ChatMessage, fullText: string) => {
    let currentIndex = 0;

    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }

    typingIntervalRef.current = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === message.id
              ? { ...msg, displayContent: fullText.slice(0, currentIndex) }
              : msg
          )
        );
        currentIndex++;
      } else {
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
          typingIntervalRef.current = null;
        }
        setIsTyping(false);
      }
    }, 30); // 30ms 逐字显示
  };

  // 发送消息
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const context = buildContext();
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          context: context
        })
      });

      const data = await response.json();

      if (data.status === 'success') {
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.reply,
          displayContent: '',
          timestamp: Date.now()
        };

        setMessages(prev => [...prev, aiMessage]);
        typewriterEffect(aiMessage, data.reply);
      } else {
        throw new Error(data.error || '发送失败');
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      setIsTyping(false);
      toast.error('发送失败，请重试');
    }
  };

  // 处理回车发送
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="absolute contents left-[calc(66.67%+9.67px)] top-[193px]">
      {/* Main Chat Container - 615px height */}
      <div className="absolute bg-white h-[615px] left-[calc(66.67%+9.67px)] rounded-[20px] shadow-[0px_4px_20px_4px_rgba(0,0,0,0.1)] top-[193px] w-[393px]" />

      {/* Title Section */}
      <div className="absolute contents left-[calc(66.67%+21.67px)] top-[218px]">
        <p className="absolute font-['Alibaba_PuHuiTi_3.0:65_Medium',sans-serif] leading-[normal] left-[calc(91.67%+6.67px)] not-italic text-[14px] text-black text-nowrap top-[218px]">new</p>
        <p className="absolute font-['Alibaba_PuHuiTi_3.0:65_Medium',sans-serif] leading-[normal] left-[calc(66.67%+56.67px)] not-italic text-[14px] text-black text-nowrap top-[218px]">一口气了解2025年全球经济 | 关税新格局</p>

        {/* Chat Messages Group - 可滚动区域 */}
        <div className="absolute left-[calc(66.67%+21.67px)] top-[249px] w-[360px] min-w-[360px] max-w-[360px] h-[400px] flex-shrink-0 overflow-y-auto overflow-x-hidden">
          <div className="flex flex-col gap-[8px] min-w-0">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex min-w-0 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-center justify-center p-[6px] rounded-[9px] max-w-[330px] w-fit ${
                  msg.role === 'user' ? 'bg-[#f5f5f5]' : 'bg-[rgba(255,120,120,0.2)]'
                }`}>
                  <p className="font-['Alibaba_PuHuiTi_3.0:55_Regular',sans-serif] leading-[16px] not-italic text-[#5e5e5e] text-[12px] whitespace-pre-wrap break-words overflow-hidden">
                    {msg.role === 'assistant' && msg.displayContent !== undefined
                      ? msg.displayContent
                      : msg.content}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Bottom Section with Gradient and Input */}
      <div className="absolute contents left-[calc(66.67%+9.67px)] top-[659px]">
        {/* Bottom Gradient - starts at 659px, height 149px, ends at 808px (193+615=808) */}
        <div className="absolute bg-gradient-to-b from-[11.074%] from-[rgba(255,255,255,0)] h-[149px] left-[calc(66.67%+9.67px)] rounded-bl-[20px] rounded-br-[20px] to-[#ffffff] to-[32.55%] top-[659px] w-[393px] pointer-events-none" />

        {/* Input Field Container - 72px height at 713px */}
        <div className="absolute content-stretch flex flex-col gap-[4px] h-[72px] items-start left-[calc(66.67%+23.67px)] top-[713px] w-[366px]">
          <div className="basis-0 bg-white grow min-h-px min-w-px relative rounded-[8px] shrink-0 w-full">
            <div className="overflow-clip rounded-[inherit] size-full">
              <div className="content-stretch flex gap-[8px] items-start pl-[8px] pr-0 py-0 relative size-full">
                <div className="basis-0 content-stretch flex grow h-full items-start min-h-px min-w-px px-0 py-[8px] relative shrink-0">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Describe your task or ask a question…"
                    disabled={isTyping}
                    className="basis-0 font-['SF_Pro:Regular',sans-serif] font-normal grow h-full leading-[18px] min-h-px min-w-px relative shrink-0 text-[#5c5c5c] text-[13px] bg-transparent border-none outline-none placeholder:text-[#5c5c5c]"
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className="content-stretch flex h-full items-end justify-center pb-[8px] pt-0 px-0 relative shrink-0 w-[32px]"
                >
                  <svg className="w-4 h-4" fill={inputValue.trim() && !isTyping ? "#000" : "#C9C9C9"} viewBox="0 0 16 16">
                    <path d={svgPaths.p18c26800} />
                  </svg>
                </button>
              </div>
            </div>
            <div aria-hidden="true" className="absolute border border-[#5c5c5c] border-solid inset-0 pointer-events-none rounded-[8px]" />
          </div>
        </div>

        {/* Small Avatar - at 666px */}
        <div className="absolute left-[calc(66.67%+26.67px)] rounded-[4px] size-[42px] top-[666px]">
          <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[4px]">
            <div className="absolute bg-[#d9d9d9] inset-0 rounded-[4px]" />
            <img alt="" className="absolute max-w-none object-50%-50% object-cover rounded-[4px] size-full" src={imgRectangle43} />
          </div>
        </div>
      </div>
    </div>
  );
}