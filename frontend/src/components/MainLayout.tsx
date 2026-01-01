import React from 'react';
import { useNavigate } from 'react-router-dom';
import svgPaths from '../imports/svg-svp3s9ofq0';

interface MainLayoutProps {
  /** 当前页面标识 */
  currentPage: 'home' | 'library' | 'me';
  /** 页面内容 */
  children: React.ReactNode;
}

/**
 * 主布局组件
 * 固定侧边栏 + 响应式内容区域
 */
export function MainLayout({ currentPage, children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen bg-[#f9f9f9]">
      {/* 固定侧边栏 */}
      <Sidebar currentPage={currentPage} />

      {/* 内容区域 */}
      <main className="flex-1 ml-[280px] min-h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

/**
 * 侧边栏组件 - 固定定位
 */
function Sidebar({ currentPage }: { currentPage: string }) {
  const navigate = useNavigate();

  return (
    <aside className="fixed left-0 top-0 w-[280px] h-screen bg-[#ef3e23] flex flex-col items-center px-4 py-8 gap-7">
      {/* Logo */}
      <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start">
        <p className="[grid-area:1_/_1] font-['Avenir:Heavy',sans-serif] leading-[normal] ml-0 mt-0 not-italic text-[24.742px] text-nowrap text-white tracking-[-1.2371px]">
          VideO Reader
        </p>
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

      {/* 导航菜单 */}
      <nav className="flex flex-col gap-3 w-full">
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
      </nav>
    </aside>
  );
}

function NavItem({ icon, label, active, onClick }: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`${
        active ? 'bg-[#e0130b]' : 'bg-[rgba(224,19,11,0)]'
      } h-[39px] rounded-[10px] w-full flex items-center px-[9px] py-[4px] gap-[4px] hover:bg-[rgba(224,19,11,0.5)] transition-colors cursor-pointer`}
    >
      {icon}
      <p
        className={`${
          active ? "font-['Helvetica:Bold',sans-serif]" : "font-['Helvetica:Regular',sans-serif]"
        } text-[16px] text-nowrap text-white`}
      >
        {label}
      </p>
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

function BookIcon({ color = 'white' }: { color?: string }) {
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
