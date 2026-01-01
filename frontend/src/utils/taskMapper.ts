/**
 * 后端 TaskResult 到前端组件格式的映射工具
 */

import type { TaskResult, TranscriptSegment, KeywordItem, SummarySlice } from '../types/task';
import type { VideoSegmentData, KnowledgeCardData } from '../data/videoTimelineData';

/**
 * 将后端 summary.by_slice 映射为前端 videoSegments（推荐使用）
 * 这是语义层面的大段落划分，比逐句转录更适合作为章节
 */
export function mapSummaryToVideoSegments(summarySlices: SummarySlice[]): VideoSegmentData[] {
  return summarySlices.map((slice) => ({
    id: `slice_${slice.slice_id}`,
    startTime: slice.start,
    endTime: slice.end,
    title: `第 ${slice.slice_id + 1} 章节`, // 可以后续用 AI 生成更好的标题
    description: slice.summary,
    content: slice.summary,
  }));
}

/**
 * 将后端 transcript.segments 映射为前端 videoSegments（备用方案）
 * 用于逐句转录的细粒度段落，不推荐作为主要章节显示
 */
export function mapTranscriptToVideoSegments(segments: TranscriptSegment[]): VideoSegmentData[] {
  return segments.map((segment) => ({
    id: segment.segment_id,
    startTime: segment.start,
    endTime: segment.end,
    title: segment.text.substring(0, 30) + (segment.text.length > 30 ? '...' : ''),
    description: segment.text,
    content: segment.text,
  }));
}

/**
 * 将后端 keywords.items 映射为前端 knowledgeCards
 * 通过 segment_id 精准定位知识卡片触发时间
 */
export function mapKeywordsToKnowledgeCards(
  keywords: KeywordItem[],
  segments: TranscriptSegment[]
): KnowledgeCardData[] {
  console.log('🎴 mapKeywordsToKnowledgeCards called:', {
    keywordsCount: keywords.length,
    segmentsCount: segments.length,
  });

  const cards = keywords.map((keyword, index) => {
    // 从 mentions 中提取第一个 segment_id，找到对应的 start 时间
    const firstMention = keyword.mentions[0];
    const matchedSegment = segments.find((seg) => seg.segment_id === firstMention?.segment_id);
    const time = matchedSegment ? matchedSegment.start : 0;

    console.log(`  Card ${index + 1}: "${keyword.term}"`, {
      segment_id: firstMention?.segment_id,
      matched: !!matchedSegment,
      time: time,
    });

    return {
      word: keyword.term,
      simple: keyword.definition,
      deep: keyword.definition, // 如果后端没有区分简单和深度解释，暂时使用相同内容
      time,
    };
  });

  console.log('✅ Generated knowledge cards:', cards);
  return cards;
}

/**
 * 完整映射 TaskResult
 * 优先使用 summary.by_slice 作为章节数据
 */
export function mapTaskResult(taskResult: TaskResult) {
  console.log('🔄 mapTaskResult called with:', {
    hasSummary: !!taskResult.summary,
    bySliceLength: taskResult.summary?.by_slice?.length,
    transcriptLength: taskResult.transcript?.segments?.length,
    keywordsLength: taskResult.keywords?.items?.length,
  });

  // 优先使用语义段落，如果没有则降级到转录段落
  const videoSegments = taskResult.summary?.by_slice && taskResult.summary.by_slice.length > 0
    ? mapSummaryToVideoSegments(taskResult.summary.by_slice)
    : mapTranscriptToVideoSegments(taskResult.transcript.segments);

  console.log('📋 Generated videoSegments:', videoSegments);

  const knowledgeCards = mapKeywordsToKnowledgeCards(
    taskResult.keywords.items,
    taskResult.transcript.segments
  );

  console.log('🎴 Generated knowledgeCards:', knowledgeCards.length, 'cards');

  // 获取金句数据（已经是正确格式，直接返回）
  const quotes = taskResult.quotes?.items || [];
  console.log('💎 Generated quotes:', quotes.length, 'quotes');

  return {
    videoSegments,
    knowledgeCards,
    quotes,
  };
}
