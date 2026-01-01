/**
 * 视频笔记组件
 * - 显示视频类型标签
 * - Markdown 格式的可编辑笔记
 * - 编辑/预览模式切换
 * - 工具栏（加粗、斜体、标题等）
 * - localStorage 保存
 */

import { useState, useEffect } from 'react';
import type { TaskResult } from '../types/task';

interface VideoNotesProps {
  taskResult: TaskResult | null;
  videoId?: number | null;
}

/**
 * 根据 taskResult 生成初始 Markdown 内容
 */
function generateInitialMarkdown(taskResult: TaskResult | null): string {
  if (!taskResult) return '# 视频笔记\n\n暂无内容';

  const { summary } = taskResult;
  if (!summary) return '# 视频笔记\n\n暂无总结数据';

  let markdown = `# 视频总结\n\n${summary.overall || '暂无总结'}\n\n`;

  if (summary.by_slice && summary.by_slice.length > 0) {
    summary.by_slice.forEach((chapter, index) => {
      const startMin = Math.floor((chapter.start || 0) / 60);
      const startSec = Math.floor((chapter.start || 0) % 60);
      const endMin = Math.floor((chapter.end || 0) / 60);
      const endSec = Math.floor((chapter.end || 0) % 60);

      markdown += `## 第${index + 1}章节 (${startMin}:${String(startSec).padStart(2, '0')} - ${endMin}:${String(endSec).padStart(2, '0')})\n\n${chapter.summary || '暂无描述'}\n\n`;
    });
  }

  return markdown;
}

/**
 * 简单的 Markdown 渲染（支持基本格式）
 */
function renderMarkdown(markdown: string): string {
  return markdown
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(.+)$/gim, '<p>$1</p>')
    .replace(/<p><h/g, '<h')
    .replace(/<\/h([1-3])><\/p>/g, '</h$1>');
}

export function VideoNotes({ taskResult, videoId }: VideoNotesProps) {
  const [mode, setMode] = useState<'edit' | 'preview'>('preview');
  const [content, setContent] = useState('');

  // 生成 localStorage key
  const storageKey = taskResult?.task_id 
    ? `video_notes_${taskResult.task_id}`
    : videoId 
    ? `video_notes_video_${videoId}`
    : 'video_notes_default';

  // 初始化内容
  useEffect(() => {
    // 优先从 localStorage 读取
    const savedContent = localStorage.getItem(storageKey);
    
    if (savedContent) {
      setContent(savedContent);
    } else {
      // 如果没有保存的内容，生成初始内容
      const initialContent = generateInitialMarkdown(taskResult);
      setContent(initialContent);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskResult?.task_id, videoId]);

  // 保存到 localStorage
  const handleSave = () => {
    localStorage.setItem(storageKey, content);
    alert('笔记已保存');
  };

  // 插入 Markdown 格式
  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = document.getElementById('markdown-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end);
    setContent(newText);

    // 恢复光标位置
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  // 获取视频类型标签（优先使用 types 数组）
  const videoTypes = taskResult?.video_type?.types && taskResult.video_type.types.length > 0
    ? taskResult.video_type.types
    : taskResult?.video_type?.label 
    ? [taskResult.video_type.label]
    : [];

  return (
    <div className="absolute left-[calc(16.67%+34.67px)] top-[590px] w-[583px]">
      {/* Tag 标签 */}
      {videoTypes.length > 0 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {videoTypes.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-[#e5e5e5] text-[#666] text-[12px] rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* 编辑/预览切换 + 工具栏 */}
      <div className="bg-white rounded-t-lg border border-[#e0e0e0] border-b-0">
        {/* 顶部工具栏 */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-[#e0e0e0]">
          {/* 左侧：Markdown 工具 */}
          <div className="flex gap-2">
            <button
              onClick={() => insertMarkdown('**', '**')}
              className="px-2 py-1 hover:bg-gray-100 rounded text-[14px] font-bold"
              title="加粗"
            >
              B
            </button>
            <button
              onClick={() => insertMarkdown('*', '*')}
              className="px-2 py-1 hover:bg-gray-100 rounded text-[14px] italic"
              title="斜体"
            >
              I
            </button>
            <button
              onClick={() => insertMarkdown('## ', '')}
              className="px-2 py-1 hover:bg-gray-100 rounded text-[14px]"
              title="标题"
            >
              H
            </button>
          </div>

          {/* 右侧：模式切换 + 保存 */}
          <div className="flex gap-2 items-center">
            <button
              onClick={() => setMode('edit')}
              className={`px-3 py-1 rounded text-[12px] ${
                mode === 'edit' ? 'bg-[#e0130b] text-white' : 'text-[#666] hover:bg-gray-100'
              }`}
            >
              编辑
            </button>
            <button
              onClick={() => setMode('preview')}
              className={`px-3 py-1 rounded text-[12px] ${
                mode === 'preview' ? 'bg-[#e0130b] text-white' : 'text-[#666] hover:bg-gray-100'
              }`}
            >
              预览
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1 bg-[#e0130b] text-white rounded text-[12px] hover:bg-[#c01008]"
            >
              保存
            </button>
          </div>
        </div>
      </div>

      {/* 笔记内容区域 */}
      <div className="bg-white rounded-b-lg border border-[#e0e0e0] min-h-[300px] max-h-[400px] overflow-auto">
        {mode === 'edit' ? (
          <textarea
            id="markdown-editor"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full min-h-[300px] p-4 text-[14px] leading-[1.6] resize-none outline-none font-mono"
            placeholder="在这里编写笔记..."
          />
        ) : (
          <div
            className="p-4 text-[14px] leading-[1.8] prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
            style={{
              wordBreak: 'break-word',
            }}
          />
        )}
      </div>
    </div>
  );
}
