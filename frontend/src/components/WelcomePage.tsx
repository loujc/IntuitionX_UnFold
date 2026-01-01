import svgPaths from "../imports/svg-rmeq856suy";

interface WelcomePageProps {
  onStart: () => void;
}

export function WelcomePage({ onStart }: WelcomePageProps) {
  return (
    <div className="relative w-full h-screen bg-white flex items-center justify-center overflow-hidden">
      {/* Red circle background */}
      <div className="absolute left-1/2 size-[1240px] top-[-233px] translate-x-[-50%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1240 1240">
          <circle cx="620" cy="620" fill="#E0130B" r="620" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo with play icon */}
        <div className="flex items-start mb-8">
          <h1 className="text-white text-[96px] tracking-[-4.8px] font-['Avenir',sans-serif]" style={{ fontWeight: 900 }}>
            VideO Reader
          </h1>
          <div className="flex h-[28.94px] items-center justify-center w-[24.806px] ml-2 mt-8">
            <div className="rotate-[90deg]">
              <div className="h-[24.806px] relative w-[28.94px]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 25.0627 18.6042">
                  <path d={svgPaths.p255f5a00} fill="#F5F5F5" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tagline */}
        <p className="text-white text-[24px] mb-24 font-['Avenir',sans-serif]" style={{ fontWeight: 300 }}>
          See More. Know More. Be More.
        </p>

        {/* Start Button */}
        <button
          onClick={onStart}
          className="bg-white rounded-[26.5px] px-[32px] py-[14px] hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <span className="text-[#e0130b] text-[28px] font-['Helvetica',sans-serif]" style={{ fontWeight: 700 }}>
            Start
          </span>
        </button>

        {/* Credits */}
        <p className="absolute bottom-10 text-white text-[15px] font-['Avenir',sans-serif]">
          Design by : Jingcheng ,Liliana,Yaxuan,Ziyi
        </p>
      </div>
    </div>
  );
}
