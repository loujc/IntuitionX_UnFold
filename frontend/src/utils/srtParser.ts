/**
 * SRT 字幕文件解析器
 * 将 .srt 格式转换为 TranscriptSegment[]
 */

import type { TranscriptSegment } from '../types/task';

/**
 * 时间戳转换为秒数
 * 格式：00:00:11,520 -> 11.52
 */
function parseTimestamp(timestamp: string): number {
  const [time, ms] = timestamp.split(',');
  const [hours, minutes, seconds] = time.split(':').map(Number);
  return hours * 3600 + minutes * 60 + seconds + Number(ms) / 1000;
}

/**
 * 解析 SRT 字幕文件内容
 */
export function parseSRT(srtContent: string): TranscriptSegment[] {
  const segments: TranscriptSegment[] = [];
  
  // 按空行分割字幕块
  const blocks = srtContent.trim().split(/\n\s*\n/);
  
  for (const block of blocks) {
    const lines = block.trim().split('\n');
    
    if (lines.length < 3) continue; // 至少需要：序号、时间戳、文本
    
    // 第1行：序号 (可能没有，所以需要检测)
    let indexLine = 0;
    const firstLine = lines[0].trim();
    
    // 如果第一行是纯数字，那它就是序号
    if (/^\d+$/.test(firstLine)) {
      indexLine = 1;
    }
    
    // 时间戳行
    const timestampLine = lines[indexLine];
    const timestampMatch = timestampLine.match(/(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/);
    
    if (!timestampMatch) continue;
    
    const start = parseTimestamp(timestampMatch[1]);
    const end = parseTimestamp(timestampMatch[2]);
    
    // 文本内容（可能多行）
    const text = lines.slice(indexLine + 1).join(' ').trim();
    
    segments.push({
      segment_id: `seg_${String(segments.length).padStart(6, '0')}`,
      index: segments.length,
      start,
      end,
      text,
    });
  }
  
  return segments;
}

/**
 * 加载并解析远程 SRT 文件
 */
export async function loadSRT(url: string): Promise<TranscriptSegment[]> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load SRT file: ${url}`);
  }
  const srtContent = await response.text();
  return parseSRT(srtContent);
}
