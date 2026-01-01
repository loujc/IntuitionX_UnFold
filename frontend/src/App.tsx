import { useEffect } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
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
import { UploadPopover } from './components/UploadPopover';
import { AIAnalyzingIndicator, AIAnalysisCompleted, AIAnalysisFailed } from './components/AIAnalyzingIndicator';
import { useVideoStore } from './store/useVideoStore';
import { apiService } from './services/api';
import { sseManager, cleanupSSE } from './services/sse';
import type { AnalysisMode, VideoStyle, VideoTask } from './types';

type VideoSection = 'reading' | 'later' | 'recent';

const videoData = [
  { id: 1, title: "一口气了解2025年全球经济 | 关税新格局", image: imgRectangle34, progress: 20, section: 'reading' },
  { id: 2, title: "一口气了解2025年全球经济 | 关税新格局", image: imgRectangle35, progress: 20, section: 'reading' },
  { id: 3, title: "一口气了解2025年全球经济 | 关税新格局", image: imgRectangle36, progress: 20, section: 'reading' },
  { id: 4, title: "一口气了解2025年全球经济 | 关税新格局", image: imgRectangle37, progress: 0, section: 'later' },
  { id: 5, title: "一口气了解2025年全球经济 | 关税新格局", image: imgRectangle38, progress: 0, section: 'later' },
  { id: 6, title: "一口气了解2025年全球经济 | 关税新格局", image: imgRectangle39, progress: 0, section: 'later' },
];

export default function App() {
  // 组件卸载时清理所有 SSE 连接
  useEffect(() => {
    return () => {
      cleanupSSE();
    };
  }, []);

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#f9f9f9]">
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/me" element={<MePage />} />
        <Route path="/video/:id" element={<VideoPlayerPage />} />
      </Routes>
    </div>
  );
}

function WelcomePage() {
  const navigate = useNavigate();

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
        onClick={() => navigate('/home')}
        className="absolute bg-white h-[60px] left-1/2 rounded-[26.5px] top-[calc(50%+76px)] translate-x-[-50%] translate-y-[-50%] w-[133px] cursor-pointer hover:scale-105 transition-transform"
      >
        <p className="font-['Helvetica:Bold',sans-serif] leading-[normal] text-[#e0130b] text-[28px] text-center">Start</p>
      </button>
      <p className="absolute font-['Avenir:Roman',sans-serif] leading-[normal] left-1/2 not-italic text-[15px] text-nowrap text-white bottom-[40px] -translate-x-1/2">Design by : Jingcheng ,Liliana,Yaxuan,Ziyi</p>
    </div>
  );
}

function HomePage() {
  const navigate = useNavigate();
  // 从 Zustand Store 读取视频列表
  const videoTasks = useVideoStore((state) => state.videoTasks);

  // 如果没有上传的视频，使用 mock 数据
  const displayVideos = videoTasks.length > 0
    ? videoTasks.map(task => ({
        id: parseInt(task.id.replace('task_', '')),
        title: task.title,
        image: task.thumbnail || imgRectangle34, // TODO: 生成缩略图
        progress: task.playProgress,
        section: task.section,
      }))
    : videoData;

  const handleVideoClick = (videoId: number) => {
    navigate(`/video/${videoId}`);
  };

  return (
    <div className="relative w-full h-full bg-[#f9f9f9] overflow-clip">
      <Sidebar currentPage="home" />
      <SearchBar />
      <div className="absolute content-stretch flex flex-col gap-[12px] items-start left-[calc(16.67%+19.67px)] top-[126px] w-[603px]">
        <VideoSection title="Reading" videos={displayVideos.filter(v => v.section === 'reading')} onVideoClick={handleVideoClick} />
        <VideoSection title="Later" videos={displayVideos.filter(v => v.section === 'later')} onVideoClick={handleVideoClick} />
        <RecentSection onVideoClick={handleVideoClick} />
      </div>
      <StatsPanel />
      <CalendarWidget />
    </div>
  );
}

function LibraryPage() {
  const navigate = useNavigate();
  // 从 Zustand Store 读取视频列表（优先显示新上传的视频）
  const videoTasks = useVideoStore((state) => state.videoTasks);

  const displayVideos = videoTasks.length > 0
    ? videoTasks.map(task => ({
        id: parseInt(task.id.replace('task_', '')),
        title: task.title,
        image: task.thumbnail || imgRectangle34,
        progress: task.playProgress,
        section: task.section,
      }))
    : videoData;

  const handleVideoClick = (videoId: number) => {
    navigate(`/video/${videoId}`);
  };

  return (
    <div className="relative w-full h-full bg-[#f9f9f9] overflow-clip">
      <Sidebar currentPage="library" />
      <SearchBar />
      <div className="absolute left-[calc(16.67%+19.67px)] top-[144px]">
        <div className="flex gap-[38px] items-center mb-6">
          <TabButton icon={<BookIcon color="#E0130B" />} label="Reading" active={true} />
          <TabButton icon={<TagIcon />} label="Later" active={false} />
          <TabButton icon={<CopyIcon />} label="Finish" active={false} />
        </div>
      </div>
      <div className="absolute left-[calc(16.67%+19.67px)] top-[193px] w-[604px]">
        {/* 显示前3个视频，新上传的在最前面 */}
        {displayVideos.slice(0, 3).map((video, index) => (
          <div
            key={video.id}
            className="mb-4 cursor-pointer hover:scale-[1.02] transition-transform"
            onClick={() => handleVideoClick(video.id)}
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

function MePage() {
  return (
    <div className="relative w-full h-full bg-[#f9f9f9] overflow-clip">
      <Sidebar currentPage="me" />
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

function VideoPlayerPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const videoId = parseInt(id || '0');

  const videoTasks = useVideoStore((state) => state.videoTasks);
  const currentVideo = useVideoStore((state) => state.currentVideo);
  const setCurrentVideo = useVideoStore((state) => state.setCurrentVideo);

  // 查找对应的视频任务
  const taskId = `task_${videoId}`;
  const videoTask = videoTasks.find(task => task.id === taskId);

  // 如果找不到 task，使用 mock 数据
  const video = videoTask
    ? {
        id: videoId,
        title: videoTask.title,
        image: videoTask.thumbnail || imgRectangle34,
        progress: videoTask.playProgress,
        videoSrc: videoTask.videoSrc,
      }
    : videoData.find(v => v.id === videoId) || videoData[0];

  // 设置当前视频（如果有 Blob URL 且不是当前正在播放的视频）
  if (videoTask && videoTask.videoSrc && currentVideo?.blobUrl !== videoTask.videoSrc) {
    setCurrentVideo({
      blobUrl: videoTask.videoSrc,
      metadata: {
        title: videoTask.title,
        duration: videoTask.endTime || 0,
        thumbnail: videoTask.thumbnail,
      },
      currentTime: 0,
      isPlaying: false,
    });
  }

  return (
    <div className="relative w-full h-full bg-[#f9f9f9] overflow-clip">
      <Sidebar currentPage="library" />
      <SearchBar />

      <div className="absolute left-[calc(16.67%+19.67px)] top-[144px]">
        <button
          onClick={() => navigate('/library')}
          className="text-[#e0130b] hover:underline mb-4"
        >
          ← 返回
        </button>
        <div className="flex gap-[38px] items-center mb-6">
          <TabButton icon={<BookIcon color="#E0130B" />} label="Reading" active={true} />
          <TabButton icon={<TagIcon />} label="Later" active={false} />
          <TabButton icon={<CopyIcon />} label="Finish" active={false} />
        </div>
      </div>

      <div className="absolute left-[calc(16.67%+19.67px)] top-[206px] w-[604px]">
        {/* 视频信息卡片 */}
        <div className="bg-white rounded-[20px] p-6 mb-4">
          <div className="flex gap-4">
            {/* 视频播放器或缩略图 */}
            <div className="w-[288px] h-[200px] rounded-[10px] overflow-hidden bg-black">
              {videoTask && videoTask.videoSrc ? (
                <video
                  src={videoTask.videoSrc}
                  controls
                  className="w-full h-full object-contain"
                  poster={videoTask.thumbnail}
                >
                  您的浏览器不支持视频播放。
                </video>
              ) : (
                <img src={video.image} alt="" className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-[20px] mb-2">{video.title}</h2>
              <p className="text-[14px] text-[#b8b5b5] mb-4">本文主要讲了2025 年全球经济的发展，对中美贸易战做了清晰的梳理</p>
              <div className="flex gap-2 text-[12px] text-[#b8b5b5]">
                <span>昨天</span>
                <span>Video</span>
                <span>{video.progress}%</span>
              </div>
              {/* 显示任务状态 */}
              {videoTask && (
                <div className="mt-4">
                  {/* 等待分析 */}
                  {videoTask.status === 'queued' && (
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] text-[#e0130b]">⏳ 等待分析...</span>
                    </div>
                  )}

                  {/* AI 分析中 - 使用详细模式显示完整阶段 */}
                  {videoTask.status === 'processing' && (
                    <AIAnalyzingIndicator
                      stage={videoTask.stage || 'transcribing'}
                      progress={videoTask.progress}
                      detailed={true}
                    />
                  )}

                  {/* 分析完成 */}
                  {videoTask.status === 'completed' && <AIAnalysisCompleted />}

                  {/* 分析失败 */}
                  {videoTask.status === 'failed' && (
                    <AIAnalysisFailed error={videoTask.result?.error || '未知错误'} />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 注释卡片（TODO: 显示真实的注释数据） */}
        <div className="bg-[rgba(255,255,255,0.7)] border-[#e0130b] border-2 rounded-[7px] p-4 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-3 h-3" fill="#E0130B" viewBox="0 0 12 12">
              <path d={svgPaths.pe3e3e00} />
            </svg>
            <span className="text-[10px] text-[#e0130b]">美股泡沫</span>
            <div className="ml-auto flex items-center gap-2 text-[8px]">
              <span className="text-[#b8b5b5]">小白</span>
              <div className="bg-[#ef3e23] rounded-full w-8 h-4 flex items-center justify-end px-1">
                <div className="w-3 h-3 bg-white rounded-full" />
              </div>
              <span className="text-[#e0130b]">大师</span>
            </div>
          </div>
          <p className="text-[8px] text-[#e0130b] leading-relaxed">
            2025 年美股泡沫核心是AI 狂热叠加宽松流动性驱动的高估值失衡，集中体现为科技巨头估值与基本面脱节、巴菲特指标创历史新高，本质是市场对 AI 长期盈利的过度乐观与资金 "自我强化" 推升的非理性繁荣。估值极度偏高·······
          </p>
          <button className="text-[8px] text-white underline mt-2">more</button>
        </div>
      </div>

      <ChatWidget />
    </div>
  );
}

function Sidebar({ currentPage }: { currentPage: string }) {
  const navigate = useNavigate();

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
          onClick={() => navigate('/home')}
        />
        <NavItem
          icon={<BookIcon />}
          label="Library"
          active={currentPage === 'library'}
          onClick={() => navigate('/library')}
        />
        <NavItem
          icon={<StickerIcon />}
          label="Me"
          active={currentPage === 'me'}
          onClick={() => navigate('/me')}
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

function SearchBar() {
  const addVideoTask = useVideoStore((state) => state.addVideoTask);
  const updateTaskProgress = useVideoStore((state) => state.updateTaskProgress);

  const handleUpload = async (file: File, mode: AnalysisMode, style: VideoStyle) => {
    // 生成本地 Blob URL（核心功能：秒开本地视频）
    const videoSrc = URL.createObjectURL(file);

    // 生成任务 ID
    const taskId = `task_${Date.now()}`;

    // 创建视频任务对象
    const newTask: VideoTask = {
      id: taskId,
      title: file.name.replace(/\.[^/.]+$/, ''), // 去掉文件扩展名
      videoSrc,
      videoFile: file,
      status: 'queued',
      progress: 0,
      mode,
      style,
      language: 'auto',
      section: 'reading', // 新上传的视频默认放在 reading 分类
      playProgress: 0,
      startTime: 0,
      endTime: 0, // 将在获取视频时长后更新
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // 添加到 Store（会自动保存到 localStorage）
    addVideoTask(newTask);

    console.log('✅ 视频任务已创建:', newTask);

    // 调用后端 API 创建任务
    try {
      // 方法1：使用本地路径模式（Demo 推荐）
      const response = await apiService.createTask({
        source_type: 'path',
        source_path: file.name, // 实际应用中这里应该是服务器上的路径
        title: newTask.title,
        mode,
        style,
        language: 'auto',
        return_formats: ['srt', 'vtt', 'json'],
      });

      console.log('🚀 后端任务已创建:', response);

      // 更新任务状态为 processing
      updateTaskProgress(taskId, 0, 'transcribing');

      // 开始监听 SSE 事件
      sseManager.startListening(response.task_id || taskId);
    } catch (error) {
      console.error('❌ 调用后端 API 失败:', error);

      // API 调用失败时，使用 Mock 数据模拟进度（Demo 模式）
      console.log('⚠️ 进入 Mock 模式：模拟 AI 分析进度');
      simulateMockProgress(taskId);
    }
  };

  /**
   * Mock 模式：模拟进度更新（当后端不可用时）
   */
  const simulateMockProgress = (taskId: string) => {
    const stages = [
      { stage: 'transcribing', duration: 2000 },
      { stage: 'summarizing', duration: 1500 },
      { stage: 'keywording', duration: 1500 },
      { stage: 'linking', duration: 1000 },
    ];

    let currentProgress = 0;
    let stageIndex = 0;

    const interval = setInterval(() => {
      currentProgress += 0.05;

      if (currentProgress >= 1) {
        clearInterval(interval);
        updateTaskProgress(taskId, 1, 'linking');
        console.log('✅ Mock 任务完成');
        return;
      }

      // 更新阶段
      const progressPerStage = 1 / stages.length;
      stageIndex = Math.floor(currentProgress / progressPerStage);
      if (stageIndex >= stages.length) stageIndex = stages.length - 1;

      updateTaskProgress(taskId, currentProgress, stages[stageIndex].stage as any);
    }, 200);
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

      {/* 上传 Popover - 包装右侧菜单图标 */}
      <UploadPopover
        trigger={
          <button className="cursor-pointer hover:scale-110 transition-transform">
            <svg className="w-6 h-6" fill="black" viewBox="0 0 24 24">
              <path d={svgPaths.p60b280} />
              <path d={svgPaths.pd820400} />
              <path d={svgPaths.pa185f00} />
              <path d={svgPaths.p1d844e00} />
            </svg>
          </button>
        }
        onUpload={handleUpload}
      />
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