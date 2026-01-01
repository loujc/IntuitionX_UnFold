import { motion, AnimatePresence } from 'framer-motion';
import svgPaths from "../imports/svg-svp3s9ofq0";

interface KnowledgeCardProps {
  visible: boolean;
  word: string;
  simple: string;
  deep: string;
  isExpertMode: boolean;
  onToggle: () => void;
  onClose?: () => void;
}

export function KnowledgeCard({
  visible,
  word,
  simple,
  deep,
  isExpertMode,
  onToggle,
  onClose
}: KnowledgeCardProps) {
  const displayText = isExpertMode ? deep : simple;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{
            duration: 0.3,
            ease: "easeOut"
          }}
          className="absolute contents left-[calc(41.67%-8.33px)] top-[407px]"
        >
          <div className="absolute bg-[rgba(255,255,255,0.7)] border-[#e0130b] border-[0px_0px_0px_2px] border-solid h-[62px] left-[calc(41.67%-8.33px)] rounded-[7px] shadow-[0px_4px_4px_4px_rgba(255,120,120,0.2)] top-[407px] w-[294px]" />

          <div className="absolute content-stretch flex flex-col gap-[8px] h-[54px] items-start left-[calc(41.67%+0.44px)] top-[412px] w-[279.739px]">
            <div className="content-stretch flex gap-[2px] items-center relative shrink-0">
              <svg className="w-[10px] h-[10px]" fill="#E0130B" viewBox="0 0 10 10">
                <path d={svgPaths.p21f8b180} />
                <path d={svgPaths.p7b51000} />
              </svg>
              <p className="font-['Alibaba_PuHuiTi_3.0:65_Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#e0130b] text-[10px] text-nowrap">
                {word}
              </p>
            </div>
            <p className="font-['Alibaba_PuHuiTi_3.0:45_Light',sans-serif] h-[32px] leading-[11px] not-italic relative shrink-0 text-[#e0130b] text-[8px] w-full overflow-hidden">
              {displayText}
            </p>
          </div>

          {/* Tag Icon */}
          <div className="absolute h-[12px] left-[46.5%] right-[52.47%] top-[414px]">
            <div className="absolute inset-[8.33%_10.3%_10.25%_8.33%]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.7106 9.77031">
                <path d={svgPaths.pe3e3e00} fill="#E0130B" />
                <path clipRule="evenodd" d={svgPaths.p1d72d780} fill="#E0130B" fillRule="evenodd" />
              </svg>
            </div>
          </div>

          {/* Level Switch - simple/deep */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className="absolute content-stretch flex gap-[2px] h-[15px] items-center left-[calc(58.33%-2.67px)] top-[411px] w-[70.209px] cursor-pointer hover:scale-105 transition-transform"
          >
            <div className={`flex flex-col font-['Alibaba_PuHuiTi_3.0:55_Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 ${!isExpertMode ? 'text-[#e0130b]' : 'text-[#b8b5b5]'} text-[8px] text-nowrap transition-colors`}>
              <p className="leading-[11px]">simple</p>
            </div>
            <div className={`bg-[#ef3e23] content-stretch flex items-center ${isExpertMode ? 'justify-end' : 'justify-start'} ${isExpertMode ? 'pl-[14px] pr-[2px]' : 'pl-[2px] pr-[14px]'} py-[2px] relative rounded-[16px] shrink-0 transition-all duration-300`}>
              <div className="overflow-clip relative rounded-[77px] shadow-[0px_2px_4px_0px_rgba(0,35,11,0.2)] shrink-0 size-[12px]">
                <div className="absolute bg-white inset-0 rounded-[16px]" />
              </div>
            </div>
            <div className={`flex flex-col font-['Alibaba_PuHuiTi_3.0:55_Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 ${isExpertMode ? 'text-[#e0130b]' : 'text-[#b8b5b5]'} text-[8px] text-nowrap transition-colors`}>
              <p className="leading-[11px]">deep</p>
            </div>
          </button>

          {/* Close Button - 点击卡片任意位置都可以关闭 */}
          {onClose && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="absolute right-[calc(58.33%-290px)] top-[410px] w-4 h-4 flex items-center justify-center text-[#e0130b] hover:scale-125 transition-transform cursor-pointer"
              aria-label="关闭"
            >
              ×
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
