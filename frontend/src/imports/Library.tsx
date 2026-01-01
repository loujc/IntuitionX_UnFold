import svgPaths from "./svg-lw3y93eai4";
import imgRectangle39 from "figma:asset/caa09756c2c0383d70e8b4aaf1f8867fbac59966.png";
import imgRectangle40 from "figma:asset/228f498b2fd0a9ddee568cd50bafbcab08188a1d.png";
import imgRectangle41 from "figma:asset/7e2d0ad511bfb28d652cdc6178082141ac38f2ec.png";
import imgRectangle42 from "figma:asset/d8171626aea5f73ce218807f19b43ec6e8695d44.png";
import imgRectangle43 from "figma:asset/ff402fbd8f833c106d51bdead08f65a61bb7ea50.png";

function Group() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
      <p className="[grid-area:1_/_1] font-['Avenir:Heavy',sans-serif] leading-[normal] ml-0 mt-0 not-italic relative text-[24.742px] text-nowrap text-white tracking-[-1.2371px]">VideO Reader</p>
      <div className="[grid-area:1_/_1] flex h-[7.459px] items-center justify-center ml-[55.15px] mt-[12.11px] relative w-[6.393px]" style={{ "--transform-inner-width": "0", "--transform-inner-height": "0" } as React.CSSProperties}>
        <div className="flex-none rotate-[90deg]">
          <div className="h-[6.393px] relative w-[7.459px]">
            <div className="absolute bottom-1/4 left-[6.7%] right-[6.7%] top-0">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6.45946 4.79491">
                <path d={svgPaths.p210a6e00} fill="var(--fill-0, #F5F5F5)" id="Polygon 2" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InterfaceEssentialHome() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Interface essential/Home">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Interface essential/Home">
          <path d={svgPaths.p3f91be80} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
      <InterfaceEssentialHome />
      <p className="font-['Helvetica:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[16px] text-nowrap text-white">Home</p>
    </div>
  );
}

function Frame3() {
  return (
    <div className="h-[39px] relative rounded-[10px] shrink-0 w-full">
      <div className="flex flex-col justify-center size-full">
        <div className="content-stretch flex flex-col items-start justify-center px-[9px] py-[4px] relative size-full">
          <Frame />
        </div>
      </div>
    </div>
  );
}

function InterfaceEssentialBook() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Interface essential/Book">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Interface essential/Book">
          <g id="Icon">
            <path d={svgPaths.p2e301c00} fill="var(--fill-0, white)" />
            <path d={svgPaths.p1d744d80} fill="var(--fill-0, white)" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
      <InterfaceEssentialBook />
      <p className="font-['Helvetica:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[16px] text-nowrap text-white">Library</p>
    </div>
  );
}

function Frame4() {
  return (
    <div className="bg-[#e0130b] h-[39px] relative rounded-[10px] shrink-0 w-full">
      <div className="flex flex-col justify-center size-full">
        <div className="content-stretch flex flex-col items-start justify-center px-[9px] py-[4px] relative size-full">
          <Frame1 />
        </div>
      </div>
    </div>
  );
}

function InterfaceEssentialSticker() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Interface essential/Sticker">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Interface essential/Sticker">
          <g id="Icon">
            <path d={svgPaths.p1ad07300} fill="var(--fill-0, white)" />
            <path d={svgPaths.pa40b100} fill="var(--fill-0, white)" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0 w-[94px]">
      <InterfaceEssentialSticker />
      <p className="font-['Helvetica:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[16px] text-nowrap text-white">Me</p>
    </div>
  );
}

function Frame5() {
  return (
    <div className="bg-[rgba(224,19,11,0)] h-[39px] relative rounded-[10px] shrink-0 w-full">
      <div className="flex flex-col justify-center size-full">
        <div className="content-stretch flex flex-col items-start justify-center px-[9px] py-[4px] relative size-full">
          <Frame2 />
        </div>
      </div>
    </div>
  );
}

function Frame6() {
  return (
    <div className="content-stretch flex flex-col gap-[11px] items-start relative shrink-0 w-[168px]">
      <Frame3 />
      <Frame4 />
      <Frame5 />
    </div>
  );
}

function Frame7() {
  return (
    <div className="absolute bg-[#ef3e23] content-stretch flex flex-col gap-[28px] h-[784px] items-center left-[24px] px-[8px] py-[32px] rounded-[20px] top-[24px] w-[185px]">
      <Group />
      <Frame6 />
    </div>
  );
}

function ComercialBoxSearch() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Comercial/Box-search">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Comercial/Box-search">
          <g id="Icon">
            <path clipRule="evenodd" d={svgPaths.p33fa9e80} fill="var(--fill-0, black)" fillRule="evenodd" />
            <path d={svgPaths.p26843900} fill="var(--fill-0, black)" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Frame8() {
  return (
    <div className="content-stretch flex gap-[19px] items-center relative shrink-0">
      <ComercialBoxSearch />
      <p className="font-['Helvetica:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[16px] text-black text-nowrap">search</p>
    </div>
  );
}

function Frame9() {
  return (
    <div className="bg-white content-stretch flex flex-col h-[46px] items-center justify-center px-[258px] py-[11px] relative rounded-[46.5px] shadow-[0px_4px_4px_4px_rgba(0,0,0,0.05)] shrink-0 w-[642px]">
      <Frame8 />
    </div>
  );
}

function InterfaceEssentialMenu() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Interface essential/Menu-4">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Interface essential/Menu-4">
          <g id="Icon">
            <path clipRule="evenodd" d={svgPaths.p60b280} fill="var(--fill-0, black)" fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.pd820400} fill="var(--fill-0, black)" fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.pa185f00} fill="var(--fill-0, black)" fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p1d844e00} fill="var(--fill-0, black)" fillRule="evenodd" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Frame10() {
  return (
    <div className="absolute content-stretch flex gap-[54px] items-center left-[calc(25%+65px)] top-[57px]">
      <Frame9 />
      <InterfaceEssentialMenu />
    </div>
  );
}

function InterfaceEssentialBook1() {
  return (
    <div className="relative shrink-0 size-[23px]" data-name="Interface essential/Book">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23 23">
        <g id="Interface essential/Book">
          <g id="Icon">
            <path clipRule="evenodd" d={svgPaths.pa95100} fill="var(--fill-0, #E0130B)" fillRule="evenodd" />
            <path d={svgPaths.p1bb6fa80} fill="var(--fill-0, #E0130B)" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Frame12() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
      <InterfaceEssentialBook1 />
      <p className="font-['Helvetica:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#e0130b] text-[20px] text-nowrap">Reading</p>
    </div>
  );
}

function InterfaceEssentialTag() {
  return (
    <div className="relative shrink-0 size-[23px]" data-name="Interface essential/Tag">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23 23">
        <g id="Interface essential/Tag">
          <g id="Icon">
            <path d={svgPaths.p34d4d270} fill="var(--fill-0, #B8B5B5)" />
            <path clipRule="evenodd" d={svgPaths.pd4e4b70} fill="var(--fill-0, #B8B5B5)" fillRule="evenodd" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Frame13() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
      <InterfaceEssentialTag />
      <p className="font-['Helvetica:Bold',sans-serif] h-[23px] leading-[normal] not-italic relative shrink-0 text-[#b8b5b5] text-[20px] w-[49px]">Later</p>
    </div>
  );
}

function InterfaceEssentialCopy() {
  return (
    <div className="relative shrink-0 size-[23px]" data-name="Interface essential/Copy">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23 23">
        <g id="Interface essential/Copy">
          <g id="Icon">
            <path clipRule="evenodd" d={svgPaths.p4d57440} fill="var(--fill-0, #B8B5B5)" fillRule="evenodd" />
            <path d={svgPaths.p1094c900} fill="var(--fill-0, #B8B5B5)" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Frame14() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0">
      <InterfaceEssentialCopy />
      <p className="font-['Helvetica:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#b8b5b5] text-[20px] text-nowrap">Finish</p>
    </div>
  );
}

function Frame15() {
  return (
    <div className="absolute content-stretch flex gap-[38px] items-center left-[calc(16.67%+19.67px)] top-[144px]">
      <Frame12 />
      <Frame13 />
      <Frame14 />
    </div>
  );
}

function Frame11() {
  return (
    <div className="content-stretch flex font-['Alibaba_PuHuiTi_3.0:65_Medium',sans-serif] gap-[9px] h-[11px] items-center leading-[normal] not-italic relative shrink-0 text-[#b8b5b5] text-[12px] text-nowrap">
      <p className="relative shrink-0">昨天</p>
      <p className="relative shrink-0">Video</p>
      <p className="relative shrink-0">20%</p>
    </div>
  );
}

function Frame20() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[2px] items-start left-[calc(41.67%+3.67px)] top-[206px] w-[270px]">
      <p className="font-['Alibaba_PuHuiTi_3.0:65_Medium',sans-serif] leading-[normal] min-w-full not-italic relative shrink-0 text-[16px] text-black w-[min-content]">一口气了解2025年全球经济 | 关税新格局</p>
      <p className="font-['Alibaba_PuHuiTi_3.0:55_Regular',sans-serif] leading-[normal] min-w-full not-italic relative shrink-0 text-[#b8b5b5] text-[10px] w-[min-content]">本文主要讲了2025 年全球经济的发展，对中美贸易战做了清晰的梳理本文主要讲了2025 年全球经济的发展，对中美······</p>
      <Frame11 />
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute contents left-[calc(16.67%+19.67px)] top-[193px]">
      <div className="absolute bg-white h-[113px] left-[calc(16.67%+19.67px)] rounded-[20px] top-[193px] w-[604px]" />
      <div className="absolute h-[113px] left-[calc(16.67%+19.67px)] rounded-[20px] top-[193px] w-[288px]">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-[20px] size-full" src={imgRectangle39} />
      </div>
      <Frame20 />
    </div>
  );
}

function Frame16() {
  return (
    <div className="content-stretch flex font-['Alibaba_PuHuiTi_3.0:65_Medium',sans-serif] gap-[9px] h-[11px] items-center leading-[normal] not-italic relative shrink-0 text-[#b8b5b5] text-[12px] text-nowrap">
      <p className="relative shrink-0">昨天</p>
      <p className="relative shrink-0">Video</p>
      <p className="relative shrink-0">20%</p>
    </div>
  );
}

function Frame22() {
  return (
    <div className="[grid-area:1_/_1] content-stretch flex flex-col gap-[2px] items-start ml-[304px] mt-[13px] relative w-[270px]">
      <p className="font-['Alibaba_PuHuiTi_3.0:65_Medium',sans-serif] leading-[normal] min-w-full not-italic relative shrink-0 text-[16px] text-black w-[min-content]">一口气了解2025年全球经济 | 关税新格局</p>
      <p className="font-['Alibaba_PuHuiTi_3.0:55_Regular',sans-serif] leading-[normal] min-w-full not-italic relative shrink-0 text-[#b8b5b5] text-[10px] w-[min-content]">本文主要讲了2025 年全球经济的发展，对中美贸易战做了清晰的梳理本文主要讲了2025 年全球经济的发展，对中美······</p>
      <Frame16 />
    </div>
  );
}

function Group2() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0">
      <div className="[grid-area:1_/_1] bg-white h-[113px] ml-0 mt-0 rounded-[20px] w-[604px]" />
      <div className="[grid-area:1_/_1] h-[113px] ml-0 mt-0 relative rounded-[20px] w-[288px]">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-[20px] size-full" src={imgRectangle39} />
      </div>
      <Frame22 />
    </div>
  );
}

function Frame17() {
  return (
    <div className="content-stretch flex font-['Alibaba_PuHuiTi_3.0:65_Medium',sans-serif] gap-[9px] h-[11px] items-center leading-[normal] not-italic relative shrink-0 text-[#b8b5b5] text-[12px] text-nowrap">
      <p className="relative shrink-0">昨天</p>
      <p className="relative shrink-0">Video</p>
      <p className="relative shrink-0">20%</p>
    </div>
  );
}

function Frame23() {
  return (
    <div className="[grid-area:1_/_1] content-stretch flex flex-col gap-[2px] items-start ml-[304px] mt-[13px] relative w-[270px]">
      <p className="font-['Alibaba_PuHuiTi_3.0:65_Medium',sans-serif] leading-[normal] min-w-full not-italic relative shrink-0 text-[16px] text-black w-[min-content]">一口气了解2025年全球经济 | 关税新格局</p>
      <p className="font-['Alibaba_PuHuiTi_3.0:55_Regular',sans-serif] leading-[normal] min-w-full not-italic relative shrink-0 text-[#b8b5b5] text-[10px] w-[min-content]">本文主要讲了2025 年全球经济的发展，对中美贸易战做了清晰的梳理本文主要讲了2025 年全球经济的发展，对中美······</p>
      <Frame17 />
    </div>
  );
}

function Group3() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0">
      <div className="[grid-area:1_/_1] bg-white h-[113px] ml-0 mt-0 relative rounded-[20px] w-[604px]">
        <div aria-hidden="true" className="absolute border-[#e0130b] border-[3px] border-solid inset-[-3px] pointer-events-none rounded-[23px]" />
      </div>
      <div className="[grid-area:1_/_1] h-[113px] ml-0 mt-0 relative rounded-[20px] w-[288px]">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[20px]">
          <img alt="" className="absolute max-w-none object-50%-50% object-cover rounded-[20px] size-full" src={imgRectangle39} />
          <img alt="" className="absolute max-w-none object-50%-50% object-cover rounded-[20px] size-full" src={imgRectangle40} />
        </div>
      </div>
      <Frame23 />
    </div>
  );
}

function Frame18() {
  return (
    <div className="content-stretch flex font-['Alibaba_PuHuiTi_3.0:65_Medium',sans-serif] gap-[9px] h-[11px] items-center leading-[normal] not-italic relative shrink-0 text-[#b8b5b5] text-[12px] text-nowrap">
      <p className="relative shrink-0">昨天</p>
      <p className="relative shrink-0">Video</p>
      <p className="relative shrink-0">20%</p>
    </div>
  );
}

function Frame24() {
  return (
    <div className="[grid-area:1_/_1] content-stretch flex flex-col gap-[2px] items-start ml-[304px] mt-[13px] relative w-[270px]">
      <p className="font-['Alibaba_PuHuiTi_3.0:65_Medium',sans-serif] leading-[normal] min-w-full not-italic relative shrink-0 text-[16px] text-black w-[min-content]">一口气了解2025年全球经济 | 关税新格局</p>
      <p className="font-['Alibaba_PuHuiTi_3.0:55_Regular',sans-serif] leading-[normal] min-w-full not-italic relative shrink-0 text-[#b8b5b5] text-[10px] w-[min-content]">本文主要讲了2025 年全球经济的发展，对中美贸易战做了清晰的梳理本文主要讲了2025 年全球经济的发展，对中美······</p>
      <Frame18 />
    </div>
  );
}

function Group4() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0">
      <div className="[grid-area:1_/_1] bg-white h-[113px] ml-0 mt-0 rounded-[20px] w-[604px]" />
      <div className="[grid-area:1_/_1] h-[113px] ml-0 mt-0 relative rounded-[20px] w-[288px]">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[20px]">
          <img alt="" className="absolute max-w-none object-50%-50% object-cover rounded-[20px] size-full" src={imgRectangle39} />
          <img alt="" className="absolute max-w-none object-50%-50% object-cover rounded-[20px] size-full" src={imgRectangle40} />
          <img alt="" className="absolute max-w-none object-50%-50% object-cover rounded-[20px] size-full" src={imgRectangle41} />
        </div>
      </div>
      <Frame24 />
    </div>
  );
}

function Frame19() {
  return (
    <div className="content-stretch flex font-['Alibaba_PuHuiTi_3.0:65_Medium',sans-serif] gap-[9px] h-[11px] items-center leading-[normal] not-italic relative shrink-0 text-[#b8b5b5] text-[12px] text-nowrap">
      <p className="relative shrink-0">昨天</p>
      <p className="relative shrink-0">Video</p>
      <p className="relative shrink-0">20%</p>
    </div>
  );
}

function Frame25() {
  return (
    <div className="[grid-area:1_/_1] content-stretch flex flex-col gap-[2px] items-start ml-[304px] mt-[13px] relative w-[270px]">
      <p className="font-['Alibaba_PuHuiTi_3.0:65_Medium',sans-serif] leading-[normal] min-w-full not-italic relative shrink-0 text-[16px] text-black w-[min-content]">一口气了解2025年全球经济 | 关税新格局</p>
      <p className="font-['Alibaba_PuHuiTi_3.0:55_Regular',sans-serif] leading-[normal] min-w-full not-italic relative shrink-0 text-[#b8b5b5] text-[10px] w-[min-content]">本文主要讲了2025 年全球经济的发展，对中美贸易战做了清晰的梳理本文主要讲了2025 年全球经济的发展，对中美······</p>
      <Frame19 />
    </div>
  );
}

function Group5() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0">
      <div className="[grid-area:1_/_1] bg-white h-[113px] ml-0 mt-0 rounded-[20px] w-[604px]" />
      <div className="[grid-area:1_/_1] h-[113px] ml-0 mt-0 relative rounded-[20px] w-[288px]">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[20px]">
          <img alt="" className="absolute max-w-none object-50%-50% object-cover rounded-[20px] size-full" src={imgRectangle39} />
          <img alt="" className="absolute max-w-none object-50%-50% object-cover rounded-[20px] size-full" src={imgRectangle40} />
          <img alt="" className="absolute max-w-none object-50%-50% object-cover rounded-[20px] size-full" src={imgRectangle41} />
          <img alt="" className="absolute max-w-none object-50%-50% object-cover rounded-[20px] size-full" src={imgRectangle42} />
        </div>
      </div>
      <Frame25 />
    </div>
  );
}

function Frame26() {
  return (
    <div className="content-stretch flex font-['Alibaba_PuHuiTi_3.0:65_Medium',sans-serif] gap-[9px] h-[11px] items-center leading-[normal] not-italic relative shrink-0 text-[#b8b5b5] text-[12px] text-nowrap">
      <p className="relative shrink-0">昨天</p>
      <p className="relative shrink-0">Video</p>
      <p className="relative shrink-0">20%</p>
    </div>
  );
}

function Frame27() {
  return (
    <div className="[grid-area:1_/_1] content-stretch flex flex-col gap-[2px] items-start ml-[304px] mt-[13px] relative w-[270px]">
      <p className="font-['Alibaba_PuHuiTi_3.0:65_Medium',sans-serif] leading-[normal] min-w-full not-italic relative shrink-0 text-[16px] text-black w-[min-content]">一口气了解2025年全球经济 | 关税新格局</p>
      <p className="font-['Alibaba_PuHuiTi_3.0:55_Regular',sans-serif] leading-[normal] min-w-full not-italic relative shrink-0 text-[#b8b5b5] text-[10px] w-[min-content]">本文主要讲了2025 年全球经济的发展，对中美贸易战做了清晰的梳理本文主要讲了2025 年全球经济的发展，对中美······</p>
      <Frame26 />
    </div>
  );
}

function Group6() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0">
      <div className="[grid-area:1_/_1] bg-white h-[113px] ml-0 mt-0 rounded-[20px] w-[604px]" />
      <div className="[grid-area:1_/_1] h-[113px] ml-0 mt-0 relative rounded-[20px] w-[288px]">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[20px]">
          <img alt="" className="absolute max-w-none object-50%-50% object-cover rounded-[20px] size-full" src={imgRectangle39} />
          <img alt="" className="absolute max-w-none object-50%-50% object-cover rounded-[20px] size-full" src={imgRectangle40} />
          <img alt="" className="absolute max-w-none object-50%-50% object-cover rounded-[20px] size-full" src={imgRectangle41} />
          <img alt="" className="absolute max-w-none object-50%-50% object-cover rounded-[20px] size-full" src={imgRectangle42} />
          <img alt="" className="absolute max-w-none object-50%-50% object-cover rounded-[20px] size-full" src={imgRectangle43} />
        </div>
      </div>
      <Frame27 />
    </div>
  );
}

function Frame21() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[14px] items-start leading-[0] left-[calc(16.67%+19.67px)] top-[193px] w-[604px]">
      <Group2 />
      <Group3 />
      <Group4 />
      <Group5 />
      <Group6 />
    </div>
  );
}

function Frame28() {
  return (
    <div className="absolute bg-[#f5f5f5] content-stretch flex h-[64px] items-center justify-center left-[calc(75%+84px)] p-[6px] rounded-[9px] top-[249px] w-[195px]">
      <p className="font-['Alibaba_PuHuiTi_3.0:55_Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#5e5e5e] text-[12px] w-[181px]">你好，请问你还好吗？我有几个关于 AI 的问题想要请教你，你是否可以解答？</p>
    </div>
  );
}

function Frame30() {
  return (
    <div className="absolute bg-[#f5f5f5] content-stretch flex h-[64px] items-center justify-center left-[calc(75%+84px)] p-[6px] rounded-[9px] top-[448px] w-[195px]">
      <p className="font-['Alibaba_PuHuiTi_3.0:55_Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#5e5e5e] text-[12px] w-[181px]">你好，请问你还好吗？我有几个关于 AI 的问题想要请教你，你是否可以解答？</p>
    </div>
  );
}

function Frame32() {
  return (
    <div className="absolute bg-[#f5f5f5] content-stretch flex h-[64px] items-center justify-center left-[calc(75%+84px)] p-[6px] rounded-[9px] top-[647px] w-[195px]">
      <p className="font-['Alibaba_PuHuiTi_3.0:55_Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#5e5e5e] text-[12px] w-[181px]">你好，请问你还好吗？我有几个关于 AI 的问题想要请教你，你是否可以解答？</p>
    </div>
  );
}

function Frame29() {
  return (
    <div className="absolute bg-[rgba(255,120,120,0.2)] content-stretch flex h-[119px] items-center justify-center left-[calc(66.67%+21.67px)] px-[9px] py-[11px] rounded-[9px] top-[321px] w-[230px]">
      <div className="font-['Alibaba_PuHuiTi_3.0:55_Regular',sans-serif] leading-[16px] not-italic relative shrink-0 text-[#5c5c5c] text-[12px] w-[211px]">
        <p className="mb-0">你好呀，我很好，随时可以帮你解答关于 AI 的问题～</p>
        <p>不管是 AI 技术原理、行业应用、发展趋势，还是和之前聊到的美股 AI 泡沫相关的内容，你都可以直接提出来，我会尽力给你详细的答复。</p>
      </div>
    </div>
  );
}

function Frame31() {
  return (
    <div className="absolute bg-[rgba(255,120,120,0.2)] content-stretch flex h-[119px] items-center justify-center left-[calc(66.67%+21.67px)] px-[9px] py-[11px] rounded-[9px] top-[520px] w-[230px]">
      <div className="font-['Alibaba_PuHuiTi_3.0:55_Regular',sans-serif] leading-[16px] not-italic relative shrink-0 text-[#5c5c5c] text-[12px] w-[211px]">
        <p className="mb-0">你好呀，我很好，随时可以帮你解答关于 AI 的问题～</p>
        <p>不管是 AI 技术原理、行业应用、发展趋势，还是和之前聊到的美股 AI 泡沫相关的内容，你都可以直接提出来，我会尽力给你详细的答复。</p>
      </div>
    </div>
  );
}

function Group9() {
  return (
    <div className="absolute contents left-[calc(66.67%+21.67px)] top-[249px]">
      <Frame28 />
      <Frame30 />
      <Frame32 />
      <Frame29 />
      <Frame31 />
    </div>
  );
}

function Group8() {
  return (
    <div className="absolute contents left-[calc(66.67%+21.67px)] top-[218px]">
      <p className="absolute font-['Alibaba_PuHuiTi_3.0:65_Medium',sans-serif] leading-[normal] left-[calc(91.67%+6.67px)] not-italic text-[14px] text-black text-nowrap top-[218px]">new</p>
      <p className="absolute font-['Alibaba_PuHuiTi_3.0:65_Medium',sans-serif] leading-[normal] left-[calc(66.67%+56.67px)] not-italic text-[14px] text-black text-nowrap top-[218px]">一口气了解2025年全球经济 | 关税新格局</p>
      <Group9 />
    </div>
  );
}

function Text() {
  return (
    <div className="basis-0 content-stretch flex grow h-full items-start min-h-px min-w-px px-0 py-[8px] relative shrink-0" data-name="Text">
      <p className="basis-0 font-['SF_Pro:Regular',sans-serif] font-normal grow h-full leading-[18px] min-h-px min-w-px overflow-ellipsis overflow-hidden relative shrink-0 text-[#5c5c5c] text-[13px] text-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        Describe your task or ask a question…
      </p>
    </div>
  );
}

function UtilityIconsSSend() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Utility Icons / S / send">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Utility Icons / S / send">
          <path clipRule="evenodd" d={svgPaths.p18c26800} fill="var(--fill-0, #C9C9C9)" fillRule="evenodd" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function SparkleIcon() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="Sparkle icon">
      <UtilityIconsSSend />
    </div>
  );
}

function SparkleIconContainer() {
  return (
    <div className="content-stretch flex h-full items-end justify-center pb-[8px] pt-0 px-0 relative shrink-0 w-[32px]" data-name="Sparkle icon container">
      <SparkleIcon />
    </div>
  );
}

function GenAiInputField() {
  return (
    <div className="basis-0 bg-white grow min-h-px min-w-px relative rounded-[8px] shrink-0 w-full" data-name="GenAI input field">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[8px] items-start pl-[8px] pr-0 py-0 relative size-full">
          <Text />
          <SparkleIconContainer />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#5c5c5c] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function InputGenAi() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[4px] h-[72px] items-start left-[calc(66.67%+23.67px)] top-[713px] w-[366px]" data-name="📝 Input - Gen AI">
      <GenAiInputField />
    </div>
  );
}

function Group7() {
  return (
    <div className="absolute contents left-[calc(66.67%+9.67px)] top-[659px]">
      <div className="absolute bg-gradient-to-b from-[11.074%] from-[rgba(255,255,255,0)] h-[149px] left-[calc(66.67%+9.67px)] rounded-bl-[20px] rounded-br-[20px] to-[#ffffff] to-[32.55%] top-[659px] w-[393px]" />
      <InputGenAi />
      <div className="absolute left-[calc(66.67%+26.67px)] rounded-[4px] size-[42px] top-[666px]">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[4px]">
          <div className="absolute bg-[#d9d9d9] inset-0 rounded-[4px]" />
          <img alt="" className="absolute max-w-none object-50%-50% object-cover rounded-[4px] size-full" src={imgRectangle43} />
        </div>
      </div>
    </div>
  );
}

function Group10() {
  return (
    <div className="absolute contents left-[calc(66.67%+9.67px)] top-[193px]">
      <div className="absolute bg-white h-[615px] left-[calc(66.67%+9.67px)] rounded-[20px] shadow-[0px_4px_20px_4px_rgba(0,0,0,0.1)] top-[193px] w-[393px]" />
      <Group8 />
      <Group7 />
    </div>
  );
}

export default function Library() {
  return (
    <div className="bg-[#f9f9f9] relative size-full" data-name="Library">
      <Frame7 />
      <div className="absolute h-[622px] left-[calc(16.67%+19.67px)] rounded-[17px] top-[186px] w-[604px]" />
      <Frame10 />
      <Frame15 />
      <Group1 />
      <Frame21 />
      <Group10 />
    </div>
  );
}