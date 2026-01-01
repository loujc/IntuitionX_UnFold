import svgPaths from "./svg-svp3s9ofq0";
import imgImage13 from "figma:asset/1b939f420685ed9c8938abc89cf30951f9bcaf97.png";
import imgRectangle34 from "figma:asset/caa09756c2c0383d70e8b4aaf1f8867fbac59966.png";
import imgRectangle35 from "figma:asset/6563664671bdb9c906c1438c612b9bd618b8697e.png";
import imgRectangle36 from "figma:asset/228f498b2fd0a9ddee568cd50bafbcab08188a1d.png";
import imgRectangle37 from "figma:asset/e5bf9baa7e09ee6d16b7c343777ad74ff3613b21.png";
import imgRectangle38 from "figma:asset/ff402fbd8f833c106d51bdead08f65a61bb7ea50.png";
import imgRectangle39 from "figma:asset/090e70978c57885db2d5bccd47c8efd05ad94044.png";

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

function Frame4() {
  return (
    <div className="bg-[#e0130b] h-[39px] relative rounded-[10px] shrink-0 w-full">
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

function Frame5() {
  return (
    <div className="bg-[rgba(224,19,11,0)] h-[39px] relative rounded-[10px] shrink-0 w-full">
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

function Frame3() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0 w-[94px]">
      <InterfaceEssentialSticker />
      <p className="font-['Helvetica:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[16px] text-nowrap text-white">Me</p>
    </div>
  );
}

function Frame7() {
  return (
    <div className="bg-[rgba(224,19,11,0)] h-[39px] relative rounded-[10px] shrink-0 w-full">
      <div className="flex flex-col justify-center size-full">
        <div className="content-stretch flex flex-col items-start justify-center px-[9px] py-[4px] relative size-full">
          <Frame3 />
        </div>
      </div>
    </div>
  );
}

function Frame11() {
  return (
    <div className="content-stretch flex flex-col gap-[11px] items-start relative shrink-0 w-[168px]">
      <Frame4 />
      <Frame5 />
      <Frame7 />
    </div>
  );
}

function Frame12() {
  return (
    <div className="absolute bg-[#ef3e23] content-stretch flex flex-col gap-[28px] h-[784px] items-center left-[24px] px-[8px] py-[32px] rounded-[20px] top-[24px] w-[185px]">
      <Group />
      <Frame11 />
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute left-0 size-[188.001px] top-0">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 188.001 188.001">
        <g id="Group 19">
          <path d={svgPaths.pb3587b0} fill="var(--fill-0, #FFD580)" id="Subtract" />
          <path d={svgPaths.p12290280} fill="var(--fill-0, #E32C25)" id="Subtract_2" />
        </g>
      </svg>
    </div>
  );
}

function Frame36() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center leading-[normal] not-italic relative shrink-0 text-center w-[56px]">
      <p className="font-['Helvetica:Bold',sans-serif] min-w-full relative shrink-0 text-[#e32c25] text-[32px] w-[min-content]">16</p>
      <p className="font-['Helvetica:Regular',sans-serif] relative shrink-0 text-[12px] text-black w-[80px]">Finished</p>
    </div>
  );
}

function Frame37() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[10px] items-center justify-center left-0 px-[66px] py-[61px] size-[188.001px] top-0">
      <Group1 />
      <Frame36 />
    </div>
  );
}

function Frame38() {
  return (
    <div className="absolute bg-[#f9f9f9] content-stretch flex font-['Alibaba_PuHuiTi_3.0:85_Bold',sans-serif] gap-[6px] h-[40px] items-end leading-[normal] left-[184px] not-italic px-[17px] py-[8px] rounded-[10px] text-center top-[25px] w-[189px]">
      <p className="h-[30px] relative shrink-0 text-[#ef3e23] text-[28px] w-[62px]">4/7</p>
      <p className="relative shrink-0 text-[14px] text-black text-nowrap">Aim</p>
    </div>
  );
}

function Frame39() {
  return (
    <div className="absolute bg-[#f9f9f9] content-stretch flex font-['Alibaba_PuHuiTi_3.0:85_Bold',sans-serif] gap-[6px] h-[40px] items-end leading-[normal] left-[184px] not-italic px-[17px] py-[8px] rounded-[10px] text-center top-[120px] w-[189px]">
      <p className="h-[34px] relative shrink-0 text-[#ef3e23] text-[32px] w-[13px]">4</p>
      <p className="relative shrink-0 text-[12px] text-black text-nowrap">Not Yet</p>
    </div>
  );
}

function Frame40() {
  return (
    <div className="absolute bg-[#f9f9f9] content-stretch flex font-['Alibaba_PuHuiTi_3.0:85_Bold',sans-serif] gap-[6px] h-[40px] items-end leading-[normal] left-[184px] not-italic px-[17px] py-[8px] rounded-[10px] text-center top-[74px] w-[189px]">
      <p className="h-[34px] relative shrink-0 text-[#e0130b] text-[32px] w-[13px]">4</p>
      <p className="relative shrink-0 text-[12px] text-black text-nowrap">Reading</p>
    </div>
  );
}

function Frame35() {
  return (
    <div className="absolute h-[641px] left-[calc(66.67%+7.67px)] top-[159px] w-[395px]">
      <div className="absolute bg-white h-[641px] left-0 rounded-[20px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] top-0 w-[395px]" />
      <Frame37 />
      <Frame38 />
      <Frame39 />
      <Frame40 />
      <div className="absolute h-[14px] left-[188px] top-[469px] w-[16px]" data-name="image 13">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgImage13} />
      </div>
      <div className="absolute h-[14px] left-[239px] top-[410px] w-[16px]" data-name="image 14">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgImage13} />
      </div>
      <div className="absolute h-[14px] left-[239px] top-[348px] w-[16px]" data-name="image 15">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgImage13} />
      </div>
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

function Frame13() {
  return (
    <div className="content-stretch flex gap-[19px] items-center relative shrink-0">
      <ComercialBoxSearch />
      <p className="font-['Helvetica:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[16px] text-black text-nowrap">search</p>
    </div>
  );
}

function Frame14() {
  return (
    <div className="bg-white content-stretch flex flex-col h-[46px] items-center justify-center px-[258px] py-[11px] relative rounded-[46.5px] shadow-[0px_4px_4px_4px_rgba(0,0,0,0.05)] shrink-0 w-[642px]">
      <Frame13 />
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

function Frame22() {
  return (
    <div className="absolute content-stretch flex gap-[54px] items-center left-[calc(33.33%-2.67px)] top-[57px]">
      <Frame14 />
      <InterfaceEssentialMenu />
    </div>
  );
}

function Frame24() {
  return (
    <div className="content-stretch flex font-['Alibaba_PuHuiTi_3.0:65_Medium',sans-serif] gap-[9px] items-center leading-[normal] not-italic relative shrink-0 text-[#b8b5b5] text-[10px] text-nowrap">
      <p className="relative shrink-0">昨天</p>
      <p className="relative shrink-0">Video</p>
      <p className="relative shrink-0">20%</p>
    </div>
  );
}

function Frame17() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-[185px]">
      <div className="h-[185px] relative rounded-[10px] shrink-0 w-full">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-[10px] size-full" src={imgRectangle34} />
      </div>
      <p className="font-['Alibaba_PuHuiTi_3.0:65_Medium',sans-serif] leading-[normal] min-w-full not-italic relative shrink-0 text-[12px] text-black w-[min-content]">一口气了解2025年全球经济 | 关税新格局</p>
      <Frame24 />
    </div>
  );
}

function Frame25() {
  return (
    <div className="content-stretch flex font-['Alibaba_PuHuiTi_3.0:65_Medium',sans-serif] gap-[9px] items-center leading-[normal] not-italic relative shrink-0 text-[#b8b5b5] text-[10px] text-nowrap">
      <p className="relative shrink-0">昨天</p>
      <p className="relative shrink-0">Video</p>
      <p className="relative shrink-0">20%</p>
    </div>
  );
}

function Frame16() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-[185px]">
      <div className="h-[185px] relative rounded-[10px] shrink-0 w-full">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-[10px] size-full" src={imgRectangle35} />
      </div>
      <p className="font-['Alibaba_PuHuiTi_3.0:65_Medium',sans-serif] leading-[normal] min-w-full not-italic relative shrink-0 text-[12px] text-black w-[min-content]">一口气了解2025年全球经济 | 关税新格局</p>
      <Frame25 />
    </div>
  );
}

function Frame26() {
  return (
    <div className="content-stretch flex font-['Alibaba_PuHuiTi_3.0:65_Medium',sans-serif] gap-[9px] items-center leading-[normal] not-italic relative shrink-0 text-[#b8b5b5] text-[10px] text-nowrap">
      <p className="relative shrink-0">昨天</p>
      <p className="relative shrink-0">Video</p>
      <p className="relative shrink-0">20%</p>
    </div>
  );
}

function Frame15() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-[185px]">
      <div className="h-[185px] relative rounded-[10px] shrink-0 w-full">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-[10px] size-full" src={imgRectangle36} />
      </div>
      <p className="font-['Alibaba_PuHuiTi_3.0:65_Medium',sans-serif] leading-[normal] min-w-full not-italic relative shrink-0 text-[12px] text-black w-[min-content]">一口气了解2025年全球经济 | 关税新格局</p>
      <Frame26 />
    </div>
  );
}

function Frame18() {
  return (
    <div className="content-stretch flex gap-[24px] items-center relative shrink-0 w-full">
      <Frame17 />
      <Frame16 />
      <Frame15 />
    </div>
  );
}

function Frame29() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full">
      <p className="font-['Helvetica:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[20px] text-black w-full">Reading</p>
      <Frame18 />
    </div>
  );
}

function Frame27() {
  return (
    <div className="content-stretch flex font-['Alibaba_PuHuiTi_3.0:65_Medium',sans-serif] gap-[9px] items-center leading-[normal] not-italic relative shrink-0 text-[#b8b5b5] text-[10px] text-nowrap">
      <p className="relative shrink-0">昨天</p>
      <p className="relative shrink-0">Video</p>
      <p className="relative shrink-0">0%</p>
    </div>
  );
}

function Frame28() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-[185px]">
      <div className="h-[185px] relative rounded-[10px] shrink-0 w-full">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-[10px] size-full" src={imgRectangle37} />
      </div>
      <p className="font-['Alibaba_PuHuiTi_3.0:65_Medium',sans-serif] leading-[normal] min-w-full not-italic relative shrink-0 text-[12px] text-black w-[min-content]">一口气了解2025年全球经济 | 关税新格局</p>
      <Frame27 />
    </div>
  );
}

function Frame33() {
  return (
    <div className="content-stretch flex font-['Alibaba_PuHuiTi_3.0:65_Medium',sans-serif] gap-[9px] items-center leading-[normal] not-italic relative shrink-0 text-[#b8b5b5] text-[10px] text-nowrap">
      <p className="relative shrink-0">昨天</p>
      <p className="relative shrink-0">Video</p>
      <p className="relative shrink-0">0%</p>
    </div>
  );
}

function Frame19() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-[185px]">
      <div className="h-[185px] relative rounded-[10px] shrink-0 w-full">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-[10px] size-full" src={imgRectangle38} />
      </div>
      <p className="font-['Alibaba_PuHuiTi_3.0:65_Medium',sans-serif] leading-[normal] min-w-full not-italic relative shrink-0 text-[12px] text-black w-[min-content]">一口气了解2025年全球经济 | 关税新格局</p>
      <Frame33 />
    </div>
  );
}

function Frame34() {
  return (
    <div className="content-stretch flex font-['Alibaba_PuHuiTi_3.0:65_Medium',sans-serif] gap-[9px] items-center leading-[normal] not-italic relative shrink-0 text-[#b8b5b5] text-[10px] text-nowrap">
      <p className="relative shrink-0">昨天</p>
      <p className="relative shrink-0">Video</p>
      <p className="relative shrink-0">0%</p>
    </div>
  );
}

function Frame20() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-[185px]">
      <div className="h-[185px] relative rounded-[10px] shrink-0 w-full">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-[10px] size-full" src={imgRectangle39} />
      </div>
      <p className="font-['Alibaba_PuHuiTi_3.0:65_Medium',sans-serif] leading-[normal] min-w-full not-italic relative shrink-0 text-[12px] text-black w-[min-content]">一口气了解2025年全球经济 | 关税新格局</p>
      <Frame34 />
    </div>
  );
}

function Frame23() {
  return (
    <div className="content-stretch flex gap-[25px] items-center relative shrink-0 w-full">
      <Frame28 />
      <Frame19 />
      <Frame20 />
    </div>
  );
}

function Frame30() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-[605px]">
      <p className="font-['Helvetica:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[20px] text-black w-full">Later</p>
      <Frame23 />
    </div>
  );
}

function Frame21() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full">
      <div className="h-[185px] relative rounded-[10px] shrink-0 w-full">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-[10px] size-full" src={imgRectangle35} />
      </div>
      <p className="font-['Alibaba_PuHuiTi_3.0:65_Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[12px] text-black w-full">一口气了解2025年全球经济 | 关税新格局</p>
    </div>
  );
}

function Frame31() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-[185px]">
      <p className="font-['Helvetica:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[20px] text-black w-full">Recent</p>
      <Frame21 />
    </div>
  );
}

function Frame32() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[12px] items-start left-[calc(16.67%+19.67px)] top-[126px] w-[603px]">
      <Frame29 />
      <Frame30 />
      <Frame31 />
    </div>
  );
}

function CalendarDate() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0" data-name="Calendar/date">
      <div className="relative shrink-0 size-[48px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 48 48">
          <circle cx="24" cy="24" fill="var(--fill-0, #FF7878)" fillOpacity="0.2" id="Ellipse 5" r="24" />
        </svg>
      </div>
      <p className="absolute font-['Pretendard:Bold',sans-serif] leading-[normal] left-[24px] not-italic text-[#3f6262] text-[16px] text-center text-nowrap top-[15px] translate-x-[-50%]">1</p>
    </div>
  );
}

function CalendarDate1() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0" data-name="Calendar/date">
      <div className="relative shrink-0 size-[48px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 48 48">
          <circle cx="24" cy="24" fill="var(--fill-0, #FF7878)" fillOpacity="0.2" id="Ellipse 5" r="24" />
        </svg>
      </div>
      <p className="absolute font-['Pretendard:Bold',sans-serif] leading-[normal] left-[24px] not-italic text-[#3f6262] text-[16px] text-center text-nowrap top-[15px] translate-x-[-50%]">2</p>
    </div>
  );
}

function CalendarDate2() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0" data-name="Calendar/date">
      <p className="absolute font-['Pretendard:Bold',sans-serif] leading-[normal] left-[24.5px] not-italic opacity-40 text-[#212121] text-[16px] text-center text-nowrap top-[15px] translate-x-[-50%]">3</p>
    </div>
  );
}

function Frame6() {
  return (
    <div className="content-stretch flex gap-[3px] items-start relative shrink-0">
      <CalendarDate />
      <CalendarDate1 />
      <CalendarDate2 />
    </div>
  );
}

function CalendarDate3() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0" data-name="Calendar/date">
      <p className="absolute font-['Pretendard:Bold',sans-serif] leading-[normal] left-[24.5px] not-italic opacity-40 text-[#212121] text-[16px] text-center text-nowrap top-[15px] translate-x-[-50%]">4</p>
    </div>
  );
}

function CalendarDate4() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0" data-name="Calendar/date">
      <div className="relative shrink-0 size-[48px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 48 48">
          <circle cx="24" cy="24" fill="var(--fill-0, #FF7878)" fillOpacity="0.2" id="Ellipse 5" r="24" />
        </svg>
      </div>
      <p className="absolute font-['Pretendard:Bold',sans-serif] leading-[normal] left-[24.5px] not-italic text-[#3f6262] text-[16px] text-center text-nowrap top-[15px] translate-x-[-50%]">5</p>
    </div>
  );
}

function CalendarDate5() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0" data-name="Calendar/date">
      <div className="relative shrink-0 size-[48px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 48 48">
          <circle cx="24" cy="24" fill="var(--fill-0, #FF7878)" fillOpacity="0.2" id="Ellipse 5" r="24" />
        </svg>
      </div>
      <p className="absolute font-['Pretendard:Bold',sans-serif] leading-[normal] left-[24.5px] not-italic text-[#3f6262] text-[16px] text-center text-nowrap top-[15px] translate-x-[-50%]">6</p>
    </div>
  );
}

function CalendarDate6() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0" data-name="Calendar/date">
      <div className="relative shrink-0 size-[48px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 48 48">
          <circle cx="24" cy="24" fill="var(--fill-0, #FF7878)" fillOpacity="0.2" id="Ellipse 5" r="24" />
        </svg>
      </div>
      <p className="absolute font-['Pretendard:Bold',sans-serif] leading-[normal] left-[24px] not-italic text-[#3f6262] text-[16px] text-center text-nowrap top-[15px] translate-x-[-50%]">7</p>
    </div>
  );
}

function CalendarDate7() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0" data-name="Calendar/date">
      <div className="relative shrink-0 size-[48px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 48 48">
          <circle cx="24" cy="24" fill="var(--fill-0, #FF7878)" fillOpacity="0.2" id="Ellipse 5" r="24" />
        </svg>
      </div>
      <p className="absolute font-['Pretendard:Bold',sans-serif] leading-[normal] left-[24.5px] not-italic text-[#3f6262] text-[16px] text-center text-nowrap top-[15px] translate-x-[-50%]">8</p>
    </div>
  );
}

function CalendarDate8() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0" data-name="Calendar/date">
      <div className="relative shrink-0 size-[48px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 48 48">
          <circle cx="24" cy="24" fill="var(--fill-0, #FF7878)" fillOpacity="0.2" id="Ellipse 5" r="24" />
        </svg>
      </div>
      <p className="absolute font-['Pretendard:Bold',sans-serif] leading-[normal] left-[24.5px] not-italic text-[#3f6262] text-[16px] text-center text-nowrap top-[15px] translate-x-[-50%]">9</p>
    </div>
  );
}

function CalendarDate9() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0" data-name="Calendar/date">
      <p className="absolute font-['Pretendard:Bold',sans-serif] leading-[normal] left-[24.5px] not-italic opacity-40 text-[#212121] text-[16px] text-center text-nowrap top-[15px] translate-x-[-50%]">10</p>
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex gap-[3px] items-start relative shrink-0">
      <CalendarDate3 />
      <CalendarDate4 />
      <CalendarDate5 />
      <CalendarDate6 />
      <CalendarDate7 />
      <CalendarDate8 />
      <CalendarDate9 />
    </div>
  );
}

function CalendarDate10() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0" data-name="Calendar/date">
      <p className="absolute font-['Pretendard:Bold',sans-serif] leading-[normal] left-[24.5px] not-italic opacity-40 text-[#212121] text-[16px] text-center text-nowrap top-[15px] translate-x-[-50%]">11</p>
    </div>
  );
}

function CalendarDate11() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0" data-name="Calendar/date">
      <div className="relative shrink-0 size-[48px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 48 48">
          <circle cx="24" cy="24" fill="var(--fill-0, #FF7878)" fillOpacity="0.2" id="Ellipse 5" r="24" />
        </svg>
      </div>
      <p className="absolute font-['Pretendard:Bold',sans-serif] leading-[normal] left-[24px] not-italic text-[#3f6262] text-[16px] text-center text-nowrap top-[15px] translate-x-[-50%]">12</p>
    </div>
  );
}

function CalendarDate12() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0" data-name="Calendar/date">
      <div className="relative shrink-0 size-[48px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 48 48">
          <circle cx="24" cy="24" fill="var(--fill-0, #FF7878)" fillOpacity="0.2" id="Ellipse 5" r="24" />
        </svg>
      </div>
      <p className="absolute font-['Pretendard:Bold',sans-serif] leading-[normal] left-[24px] not-italic text-[#3f6262] text-[16px] text-center text-nowrap top-[15px] translate-x-[-50%]">13</p>
    </div>
  );
}

function CalendarDate13() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0" data-name="Calendar/date">
      <div className="relative shrink-0 size-[48px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 48 48">
          <circle cx="24" cy="24" fill="var(--fill-0, #FF7878)" fillOpacity="0.2" id="Ellipse 5" r="24" />
        </svg>
      </div>
      <p className="absolute font-['Pretendard:Bold',sans-serif] leading-[normal] left-[24.5px] not-italic text-[#3f6262] text-[16px] text-center text-nowrap top-[15px] translate-x-[-50%]">14</p>
    </div>
  );
}

function CalendarDate14() {
  return (
    <div className="content-stretch flex gap-[8px] items-start justify-end relative shrink-0" data-name="Calendar/date">
      <div className="relative shrink-0 size-[48px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 48 48">
          <circle cx="24" cy="24" fill="var(--fill-0, #FF7878)" fillOpacity="0.2" id="Ellipse 5" r="24" />
        </svg>
      </div>
      <p className="absolute font-['Pretendard:Bold',sans-serif] leading-[normal] left-[24px] not-italic text-[#3f6262] text-[16px] text-center text-nowrap top-[15px] translate-x-[-50%]">15</p>
    </div>
  );
}

function CalendarDate15() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0" data-name="Calendar/date">
      <div className="relative shrink-0 size-[48px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 48 48">
          <circle cx="24" cy="24" fill="var(--fill-0, #FF7878)" fillOpacity="0.2" id="Ellipse 5" r="24" />
        </svg>
      </div>
      <p className="absolute font-['Pretendard:Bold',sans-serif] leading-[normal] left-[24px] not-italic text-[#3f6262] text-[16px] text-center text-nowrap top-[15px] translate-x-[-50%]">16</p>
    </div>
  );
}

function CalendarDate16() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0" data-name="Calendar/date">
      <p className="absolute font-['Pretendard:Bold',sans-serif] leading-[normal] left-[24.5px] not-italic opacity-40 text-[#212121] text-[16px] text-center text-nowrap top-[15px] translate-x-[-50%]">17</p>
    </div>
  );
}

function Frame8() {
  return (
    <div className="content-stretch flex gap-[3px] items-start relative shrink-0">
      <CalendarDate10 />
      <CalendarDate11 />
      <CalendarDate12 />
      <CalendarDate13 />
      <CalendarDate14 />
      <CalendarDate15 />
      <CalendarDate16 />
    </div>
  );
}

function CalendarDate17() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0" data-name="Calendar/date">
      <p className="absolute font-['Pretendard:Bold',sans-serif] leading-[normal] left-[24px] not-italic opacity-40 text-[#212121] text-[16px] text-center text-nowrap top-[15px] translate-x-[-50%]">18</p>
    </div>
  );
}

function CalendarDate18() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0" data-name="Calendar/date">
      <div className="relative shrink-0 size-[48px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 48 48">
          <circle cx="24" cy="24" fill="var(--fill-0, #FF7878)" fillOpacity="0.2" id="Ellipse 5" r="24" />
        </svg>
      </div>
      <p className="absolute font-['Pretendard:Bold',sans-serif] leading-[normal] left-[24px] not-italic text-[#3f6262] text-[16px] text-center text-nowrap top-[15px] translate-x-[-50%]">19</p>
    </div>
  );
}

function CalendarDate19() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0" data-name="Calendar/date">
      <div className="relative shrink-0 size-[48px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 48 48">
          <circle cx="24" cy="24" fill="var(--fill-0, #FF7878)" fillOpacity="0.2" id="Ellipse 5" r="24" />
        </svg>
      </div>
      <p className="absolute font-['Pretendard:Bold',sans-serif] leading-[normal] left-[24.5px] not-italic text-[#3f6262] text-[16px] text-center text-nowrap top-[15px] translate-x-[-50%]">20</p>
    </div>
  );
}

function CalendarDate20() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0" data-name="Calendar/date">
      <div className="relative shrink-0 size-[48px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 48 48">
          <circle cx="24" cy="24" fill="var(--fill-0, #FF7878)" fillOpacity="0.2" id="Ellipse 5" r="24" />
        </svg>
      </div>
      <p className="absolute font-['Pretendard:Bold',sans-serif] leading-[normal] left-[24px] not-italic text-[#3f6262] text-[16px] text-center text-nowrap top-[15px] translate-x-[-50%]">21</p>
    </div>
  );
}

function CalendarDate21() {
  return (
    <div className="content-stretch flex gap-[8px] items-start justify-end relative shrink-0" data-name="Calendar/date">
      <div className="relative shrink-0 size-[48px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 48 48">
          <circle cx="24" cy="24" fill="var(--fill-0, #FF7878)" fillOpacity="0.2" id="Ellipse 5" r="24" />
        </svg>
      </div>
      <p className="absolute font-['Pretendard:Bold',sans-serif] leading-[normal] left-[24px] not-italic text-[#3f6262] text-[16px] text-center text-nowrap top-[15px] translate-x-[-50%]">22</p>
    </div>
  );
}

function CalendarDate22() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0" data-name="Calendar/date">
      <div className="relative shrink-0 size-[48px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 48 48">
          <circle cx="24" cy="24" fill="var(--fill-0, #FF7878)" fillOpacity="0.2" id="Ellipse 5" r="24" />
        </svg>
      </div>
      <p className="absolute font-['Pretendard:Bold',sans-serif] leading-[normal] left-[24px] not-italic text-[#3f6262] text-[16px] text-center text-nowrap top-[15px] translate-x-[-50%]">23</p>
    </div>
  );
}

function CalendarDate23() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0" data-name="Calendar/date">
      <p className="absolute font-['Pretendard:Bold',sans-serif] leading-[normal] left-[24.5px] not-italic opacity-40 text-[#212121] text-[16px] text-center text-nowrap top-[15px] translate-x-[-50%]">24</p>
    </div>
  );
}

function Frame9() {
  return (
    <div className="content-stretch flex gap-[3px] items-start relative shrink-0">
      <CalendarDate17 />
      <CalendarDate18 />
      <CalendarDate19 />
      <CalendarDate20 />
      <CalendarDate21 />
      <CalendarDate22 />
      <CalendarDate23 />
    </div>
  );
}

function CalendarDate24() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0" data-name="Calendar/date">
      <p className="absolute font-['Pretendard:Bold',sans-serif] leading-[normal] left-[24px] not-italic opacity-40 text-[#212121] text-[16px] text-center text-nowrap top-[15px] translate-x-[-50%]">25</p>
    </div>
  );
}

function CalendarDate25() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0" data-name="Calendar/date">
      <div className="relative shrink-0 size-[48px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 48 48">
          <circle cx="24" cy="24" fill="var(--fill-0, #FF7878)" fillOpacity="0.2" id="Ellipse 5" r="24" />
        </svg>
      </div>
      <p className="absolute font-['Pretendard:Bold',sans-serif] leading-[normal] left-[24.5px] not-italic text-[#3f6262] text-[16px] text-center text-nowrap top-[15px] translate-x-[-50%]">26</p>
    </div>
  );
}

function CalendarDate26() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0" data-name="Calendar/date">
      <div className="relative shrink-0 size-[48px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 48 48">
          <circle cx="24" cy="24" fill="var(--fill-0, #FF7878)" fillOpacity="0.2" id="Ellipse 5" r="24" />
        </svg>
      </div>
      <p className="absolute font-['Pretendard:Bold',sans-serif] leading-[normal] left-[24.5px] not-italic text-[#3f6262] text-[16px] text-center text-nowrap top-[15px] translate-x-[-50%]">27</p>
    </div>
  );
}

function CalendarDate27() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0" data-name="Calendar/date">
      <div className="relative shrink-0 size-[48px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 48 48">
          <circle cx="24" cy="24" fill="var(--fill-0, #FF7878)" fillOpacity="0.2" id="Ellipse 5" r="24" />
        </svg>
      </div>
      <p className="absolute font-['Pretendard:Bold',sans-serif] leading-[normal] left-[24.5px] not-italic text-[#3f6262] text-[16px] text-center text-nowrap top-[15px] translate-x-[-50%]">28</p>
    </div>
  );
}

function CalendarDate28() {
  return (
    <div className="content-stretch flex gap-[8px] items-start justify-end relative shrink-0" data-name="Calendar/date">
      <div className="relative shrink-0 size-[48px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 48 48">
          <circle cx="24" cy="24" fill="var(--fill-0, #FF7878)" fillOpacity="0.2" id="Ellipse 5" r="24" />
        </svg>
      </div>
      <p className="absolute font-['Pretendard:Bold',sans-serif] leading-[normal] left-[24.5px] not-italic text-[#3f6262] text-[16px] text-center text-nowrap top-[15px] translate-x-[-50%]">29</p>
    </div>
  );
}

function CalendarDate29() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0" data-name="Calendar/date">
      <div className="relative shrink-0 size-[48px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 48 48">
          <circle cx="24" cy="24" fill="var(--fill-0, #FF7878)" fillOpacity="0.2" id="Ellipse 5" r="24" />
        </svg>
      </div>
      <p className="absolute font-['Pretendard:Bold',sans-serif] leading-[normal] left-[24.5px] not-italic text-[#3f6262] text-[16px] text-center text-nowrap top-[15px] translate-x-[-50%]">30</p>
    </div>
  );
}

function CalendarDate30() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0" data-name="Calendar/date">
      <p className="absolute font-['Pretendard:Bold',sans-serif] leading-[normal] left-[24px] not-italic opacity-[0.31] text-[#212121] text-[16px] text-center text-nowrap top-[15px] translate-x-[-50%]">31</p>
    </div>
  );
}

function Frame10() {
  return (
    <div className="content-stretch flex gap-[3px] items-start relative shrink-0">
      <CalendarDate24 />
      <CalendarDate25 />
      <CalendarDate26 />
      <CalendarDate27 />
      <CalendarDate28 />
      <CalendarDate29 />
      <CalendarDate30 />
    </div>
  );
}

function Component() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[12px] items-end left-[calc(66.67%+26.67px)] top-[476px]" data-name="달력">
      <Frame6 />
      <Frame2 />
      <Frame8 />
      <Frame9 />
      <Frame10 />
    </div>
  );
}

function Component1() {
  return (
    <div className="absolute content-stretch flex gap-[40px] items-start leading-[normal] left-[calc(66.67%+26.67px)] not-italic overflow-clip px-[20px] py-[12px] text-[#212121] text-[16px] text-nowrap top-[420px]" data-name="요일">
      <p className="font-['Alibaba_PuHuiTi_3.0:65_Medium',sans-serif] relative shrink-0">S</p>
      <p className="font-['Alibaba_PuHuiTi_3.0:55_Regular',sans-serif] relative shrink-0">{`M `}</p>
      <p className="font-['Alibaba_PuHuiTi_3.0:55_Regular',sans-serif] relative shrink-0">T</p>
      <p className="font-['Alibaba_PuHuiTi_3.0:55_Regular',sans-serif] relative shrink-0">{`W `}</p>
      <p className="font-['Alibaba_PuHuiTi_3.0:65_Medium',sans-serif] relative shrink-0">T</p>
      <p className="font-['Alibaba_PuHuiTi_3.0:65_Medium',sans-serif] relative shrink-0">F</p>
      <p className="font-['Alibaba_PuHuiTi_3.0:55_Regular',sans-serif] relative shrink-0">{`S `}</p>
    </div>
  );
}

function Component2() {
  return (
    <div className="absolute contents left-[calc(66.67%+26.67px)] top-[340px]" data-name="달력">
      <p className="absolute font-['Alibaba_PuHuiTi_3.0:55_Regular',sans-serif] leading-[normal] left-[calc(66.67%+26.67px)] not-italic text-[#212121] text-[24px] text-nowrap top-[340px]">Calendar</p>
      <p className="absolute font-['Alibaba_PuHuiTi_3.0:85_Bold',sans-serif] leading-[normal] left-[calc(66.67%+26.67px)] not-italic text-[#212121] text-[16px] text-nowrap top-[386px]">1,1 2026</p>
      <Component />
      <Component1 />
    </div>
  );
}

export default function Home() {
  return (
    <div className="bg-[#f9f9f9] relative size-full" data-name="home">
      <Frame12 />
      <Frame35 />
      <Frame22 />
      <Frame32 />
      <Component2 />
    </div>
  );
}