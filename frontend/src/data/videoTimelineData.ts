/**
 * 明朝历史视频时间轴数据
 * 包含知识卡片触发点和视频段落标记
 */

export interface KnowledgeCardData {
  time: number; // 触发时间（秒）
  word: string; // 关键词
  simple: string; // simple 模式文案
  deep: string; // deep 模式文案
}

export interface VideoSegmentData {
  id?: string; // 段落 ID（可选，用于后端数据映射）
  startTime: number; // 段落开始时间（秒）
  endTime: number; // 段落结束时间（秒）
  title: string; // 段落标题
  description: string; // 段落描述
  content?: string; // 段落内容文本（可选，用于后端数据映射）
}

// 知识卡片触发数据（自动弹窗）
export const knowledgeCards: KnowledgeCardData[] = [
  {
    time: 5,
    word: "永乐大帝",
    simple: "明成祖朱棣，靖难之役后的铁血皇帝。",
    deep: "明成祖（1360－1424），开创永乐盛世，迁都北京，奠定明朝版图。"
  },
  {
    time: 11,
    word: "于谦",
    simple: "挽救大明的英雄，北京保卫战核心。",
    deep: "明代名臣，土木堡之变后拥立新帝，统领北京保卫战，社稷之臣。"
  },
  {
    time: 13,
    word: "瓦剌留学生",
    simple: "被瓦剌俘虏的皇帝朱祁镇。",
    deep: "指明英宗朱祁镇在土木堡之变中被俘，羁留北方一年的历史梗。"
  },
  {
    time: 81, // 1:21
    word: "胡惟庸案/废除丞相",
    simple: "朱元璋借机废除丞相制度，皇权进一步集中。",
    deep: "洪武十三年（1380），胡惟庸案爆发，朱元璋以谋反罪诛杀胡惟庸，并借此废除延续千年的丞相制度，标志着中国封建君主专制达到新高峰。"
  },
  {
    time: 100, // 1:40
    word: "锦衣卫",
    simple: "皇帝的私人特务组织，监视百官。",
    deep: "明代特务机构，直接受皇帝指挥，负责侦缉、抓捕、审问等事务，象征着君主集权的加强和恐怖政治的开端。"
  },
  {
    time: 127, // 2:07
    word: "洪武之治",
    simple: "朱元璋统治时期国家走向稳定繁荣的局面。",
    deep: "洪武年间（1368-1398），朱元璋通过强化中央集权、整顿吏治、发展农业等措施，使明朝从战乱中恢复元气，为后世繁荣奠定基础。"
  }
];

// 视频段落数据（侧边栏显示）- 明朝历史章节
export const videoSegments: VideoSegmentData[] = [
  {
    startTime: 0,
    endTime: 20,
    title: "大明群星：荣辱兴衰概览",
    description: "永乐大帝、于谦等关键人物串联，引出全篇。"
  },
  {
    startTime: 21,
    endTime: 72,
    title: "传奇开端：朱元璋逆袭史",
    description: "从乞丐到皇帝的开国征程，建立大明三百年基业。"
  },
  {
    startTime: 73,
    endTime: 106,
    title: "权力重构：废相与锦衣卫",
    description: "胡惟庸案爆发，废除丞相制度，建立特务机构。"
  },
  {
    startTime: 107,
    endTime: 129,
    title: "洪武之治：基业初定",
    description: "整肃吏治、恢复民生，开启大明初期欣欣向荣之治。"
  }
];

/**
 * 工具函数：将秒数转换为 MM:SS 格式
 */
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

/**
 * 工具函数：根据当前时间查找应该显示的知识卡片
 * @param currentTime 当前播放时间（秒）
 * @param tolerance 时间容差（秒），默认0.5秒
 */
export const findActiveKnowledgeCard = (
  currentTime: number,
  tolerance: number = 0.5
): KnowledgeCardData | null => {
  return knowledgeCards.find(
    card => Math.abs(currentTime - card.time) < tolerance
  ) || null;
};

/**
 * 工具函数：根据当前时间查找当前所在的视频段落
 */
export const findActiveSegment = (currentTime: number): VideoSegmentData | null => {
  return videoSegments.find(
    segment => currentTime >= segment.startTime && currentTime <= segment.endTime
  ) || null;
};
