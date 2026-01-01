/**
 * 分散式数据加载器
 * 从文件夹加载多个 JSON + SRT 文件，合并为统一的 TaskResult 格式
 */

import type { TaskResult, SummarySlice, KeywordItem, QuoteItem } from '../types/task';
import { loadSRT } from './srtParser';

/**
 * 加载分散式数据结构并合并为 TaskResult
 * @param folderName - 文件夹名称（如 "汤家凤鬼畜"）
 */
export async function loadDistributedData(folderName: string): Promise<TaskResult> {
  const basePath = `/data/${folderName}`;
  
  console.log('📂 Loading distributed data from:', basePath);
  
  try {
    // 并行加载所有文件
    const [summary, keywords, videoType, quotes, transcriptSegments] = await Promise.all([
      fetch(`${basePath}/llm_summary.json`).then(r => r.json()),
      fetch(`${basePath}/llm_keywords.json`).then(r => r.json()),
      fetch(`${basePath}/llm_video_type.json`).then(r => r.json()),
      fetch(`${basePath}/llm_quotes.json`).then(r => r.json()),
      loadSRT(`${basePath}/transcript.srt`), // 解析 SRT 字幕
    ]);
    
    console.log('✅ Loaded files:', {
      summary: summary.normalized.chapters.length + ' chapters',
      keywords: keywords.normalized.items.length + ' keywords',
      quotes: quotes.normalized.items.length + ' quotes',
      transcript: transcriptSegments.length + ' segments',
    });
    
    // 构造符合 TaskResult 格式的数据
    const taskResult: TaskResult = {
      task_id: `distributed_${folderName}_${Date.now()}`,
      status: 'finished',
      mode: 'simple',
      
      video_type: {
        label: videoType.normalized.types[0] || 'Unknown',
        types: videoType.normalized.types || [],  // 多标签
        confidence: 0.9,
      },
      
      // ✅ 完整的字幕数据（从 SRT 解析）
      transcript: {
        segments: transcriptSegments,
      },
      
      // ✅ 章节总结数据
      summary: {
        overall: summary.normalized.overall,
        by_slice: summary.normalized.chapters.map((ch: any): SummarySlice => ({
          slice_id: ch.chapter_id,
          start: ch.start,
          end: ch.end,
          summary: ch.summary,
        })),
      },
      
      // ✅ 关键词数据
      keywords: {
        items: keywords.normalized.items.map((kw: any): KeywordItem => ({
          keyword_id: kw.term,
          term: kw.term,
          definition: kw.definition,
          mentions: kw.mentions || [],
          links: kw.links || [],
        })),
      },
      
      // ✅ 金句/精华信息数据
      quotes: {
        items: quotes.normalized.items || [],
      },
    };
    
    console.log('🎉 TaskResult constructed:', taskResult);
    return taskResult;
    
  } catch (error) {
    console.error('❌ Failed to load distributed data:', error);
    throw error;
  }
}
