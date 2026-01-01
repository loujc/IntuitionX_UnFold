import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { AnalysisMode, VideoStyle } from '@/types';

interface UploadPopoverProps {
  /** 触发器元素（搜索栏右侧的图标） */
  trigger: React.ReactNode;
  /** 上传回调 */
  onUpload: (file: File, mode: AnalysisMode, style: VideoStyle) => void;
}

/**
 * 视频上传 Popover 组件
 * 在 Home 页面搜索栏右侧图标点击后弹出
 */
export function UploadPopover({ trigger, onUpload }: UploadPopoverProps) {
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mode, setMode] = useState<AnalysisMode>('brief');
  const [style, setStyle] = useState<VideoStyle>('popular_science');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 验证文件类型
      if (file.type.startsWith('video/')) {
        setSelectedFile(file);
      } else {
        alert('请选择视频文件');
      }
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      alert('请先选择视频文件');
      return;
    }

    setIsUploading(true);

    try {
      await onUpload(selectedFile, mode, style);

      // 重置状态
      setSelectedFile(null);
      setMode('brief');
      setStyle('popular_science');
      setOpen(false);
    } catch (error) {
      console.error('上传失败:', error);
      alert('上传失败，请重试');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger}
      </PopoverTrigger>

      <PopoverContent
        className="w-80 p-4 bg-white rounded-xl shadow-lg border border-gray-200"
        align="end"
        sideOffset={8}
      >
        <div className="flex flex-col gap-4">
          {/* 标题 */}
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-black">上传视频分析</h3>
          </div>

          {/* 文件选择器 */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="video-file" className="text-sm font-medium text-gray-700">
              选择视频文件
            </Label>
            <input
              id="video-file"
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              className="text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-[#E0130B] hover:file:bg-red-100 cursor-pointer"
            />
            {selectedFile && (
              <p className="text-xs text-gray-500 truncate">
                已选择: {selectedFile.name}
              </p>
            )}
          </div>

          {/* 分析模式选择 */}
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium text-gray-700">分析模式</Label>
            <div className="flex gap-2">
              <button
                onClick={() => setMode('brief')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  mode === 'brief'
                    ? 'bg-[#E0130B] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                简要
              </button>
              <button
                onClick={() => setMode('deep')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  mode === 'deep'
                    ? 'bg-[#E0130B] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                深度
              </button>
            </div>
          </div>

          {/* 风格选择 */}
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium text-gray-700">视频风格</Label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value as VideoStyle)}
              className="w-full py-2 px-3 rounded-lg border border-gray-300 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#E0130B] focus:border-transparent"
            >
              <option value="popular_science">科普</option>
              <option value="academic">学术</option>
              <option value="casual">休闲</option>
            </select>
          </div>

          {/* 开始分析按钮 */}
          <Button
            onClick={handleSubmit}
            disabled={!selectedFile || isUploading}
            className="w-full py-2 bg-[#E0130B] hover:bg-[#C01108] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>正在处理...</span>
              </div>
            ) : (
              '开始分析'
            )}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
