/**
 * Demo 调度中心 - 配置驱动的多场景演示系统
 *
 * 核心理念：
 * - Fast-Track 模式：假上传，真回显（拉取本地预先准备好的数据）
 * - 多行业切换：通过 ACTIVE_DEMO_KEY 一键切换场景
 * - 配置驱动：所有路径、数据从配置表读取，新增 Demo 只需加一行配置
 */

export interface DemoConfig {
  id: string;
  name: string;
  videoPath: string;          // 视频文件路径 (public/videos/xxx.mp4)
  dataPath: string;            // 数据路径：单文件 (test1.json) 或文件夹 (汤家凤鬼畜)
  dataType: 'single' | 'distributed';  // 数据类型：single=单文件, distributed=分散式文件夹
  thumbnail?: string;          // 缩略图路径（可选）
  description: string;         // Demo 描述
  category: 'medicine' | 'finance' | 'history' | 'tech' | 'entertainment';
}

/**
 * Demo 配置表 - 所有可用的演示场景
 */
export const DEMO_REGISTRY: Record<string, DemoConfig> = {
  medicine: {
    id: 'medicine',
    name: '医药价格分析',
    videoPath: '/videos/medicine.mp4',
    dataPath: '/data/test1.json',
    dataType: 'single',  // 单文件格式
    description: '分析医院、药店、互联网三种渠道的药价差异',
    category: 'medicine',
  },

  tangjiafeng: {
    id: 'tangjiafeng',
    name: '汤家凤鬼畜',
    videoPath: '/videos/汤家凤鬼畜.mp4',
    dataPath: '/data/汤家凤鬼畜',  // 文件夹路径
    dataType: 'distributed',  // 分散式格式
    description: '鬼畜调教视频 - 你怎么睡得着的',
    category: 'entertainment',
  },

  // 预留：金融场景
  finance: {
    id: 'finance',
    name: '金融市场分析',
    videoPath: '/videos/finance.mp4',
    dataPath: '/data/finance.json',
    dataType: 'single',
    description: '2025年全球经济与关税新格局',
    category: 'finance',
  },

  // 预留：历史场景
  history: {
    id: 'history',
    name: '明朝历史讲解',
    videoPath: '/videos/history.mp4',
    dataPath: '/data/history.json',
    dataType: 'single',
    description: '从朱元璋到永乐大帝的明朝开国史',
    category: 'history',
  },

  // 罗翔老师
  luoxiang: {
    id: 'luoxiang',
    name: '罗翔',
    videoPath: '/videos/罗翔.mp4',
    dataPath: '/data/罗翔',
    dataType: 'distributed',
    description: '法律知识科普',
    category: 'entertainment',
  },

  // 生活大爆炸
  bigbang: {
    id: 'bigbang',
    name: '生活大爆炸',
    videoPath: '/videos/生活大爆炸 .mp4',
    dataPath: '/data/生活大爆炸',
    dataType: 'distributed',
    description: '经典美剧片段',
    category: 'entertainment',
  },

  // Web3
  web3: {
    id: 'web3',
    name: 'Web3 Simple',
    videoPath: '/videos/web3.mp4',
    dataPath: '/data/web3 simple',
    dataType: 'distributed',
    description: 'Web3 简明教程',
    category: 'tech',
  },

  // Dora
  dora: {
    id: 'dora',
    name: 'Dora 长金句',
    videoPath: '/videos/DORA 长金句.mp4',
    dataPath: '/data/Dora',
    dataType: 'distributed',
    description: 'Dora 精彩片段',
    category: 'entertainment',
  },
};

/**
 * 当前激活的 Demo Key
 * 修改这个值即可切换整个系统的演示场景
 */
export const ACTIVE_DEMO_KEY: keyof typeof DEMO_REGISTRY = 'medicine';

/**
 * 获取当前激活的 Demo 配置
 */
export function getActiveDemo(): DemoConfig {
  return DEMO_REGISTRY[ACTIVE_DEMO_KEY];
}

/**
 * 获取指定 Demo 的配置
 */
export function getDemoById(id: string): DemoConfig | undefined {
  return DEMO_REGISTRY[id];
}

/**
 * 获取所有可用的 Demo 列表
 */
export function getAllDemos(): DemoConfig[] {
  return Object.values(DEMO_REGISTRY);
}

/**
 * 根据文件名匹配对应的 Demo 配置
 * @param filename - 视频文件名（如 "汤家凤鬼畜.mp4"）
 * @returns 匹配的 Demo 配置，如果没有匹配则返回默认配置
 */
export function matchDemoByFilename(filename: string): DemoConfig {
  // 去掉扩展名
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  
  // 遍历所有 demo，找到 videoPath 中文件名匹配的
  for (const demo of Object.values(DEMO_REGISTRY)) {
    const demoVideoName = demo.videoPath.split('/').pop()?.replace(/\.[^/.]+$/, '') || '';
    if (demoVideoName === nameWithoutExt) {
      console.log(`✅ Matched demo "${demo.name}" for file "${filename}"`);
      return demo;
    }
  }
  
  // 如果没有匹配，返回默认配置
  console.log(`⚠️ No demo matched for "${filename}", using default: ${ACTIVE_DEMO_KEY}`);
  return DEMO_REGISTRY[ACTIVE_DEMO_KEY];
}

/**
 * Fast-Track 模式配置
 */
export const FAST_TRACK_CONFIG = {
  enabled: true,                    // 是否启用 Fast-Track 模式
  simulateDelay: true,             // 是否模拟上传延迟
  stageDelays: {                   // 各阶段模拟延迟时间（毫秒）
    slicing: 800,
    asr: 1200,
    llm_summary: 1500,
    llm_keywords: 1000,
    finalize: 500,
  },
  totalDuration: 5000,             // 总模拟时长（毫秒）- 用于快速演示
} as const;
