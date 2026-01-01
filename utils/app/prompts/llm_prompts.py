from __future__ import annotations

from typing import Iterable


# 通用 system prompt（向后兼容）
SYSTEM_PROMPT = "You are a helpful assistant. Return only valid JSON."

# 分类任务
SYSTEM_PROMPT_CLASSIFY = (
    "你是一个视频内容分类专家。"
    "根据字幕内容判断视频的主题类型。"
    "返回有效的 JSON 格式，不要包含任何额外文字。"
)

# 摘要任务
SYSTEM_PROMPT_SUMMARIZE = (
    "你是一个专业的内容摘要专家，擅长提炼视频的核心信息。"
    "任务：为观众生成简洁、信息密集的摘要，帮助他们快速了解视频内容。"
    "规则：返回有效的 JSON 格式，使用中文输出，摘要应覆盖主要内容。"
)

# 结构化提取任务
SYSTEM_PROMPT_EXTRACT = (
    "你是一个内容结构化专家，擅长从视频字幕中提取关键信息。"
    "返回有效的 JSON 格式，不要包含任何额外文字。"
)


def _truncate(text: str, max_chars: int = 4000) -> str:
    if len(text) <= max_chars:
        return text
    return text[: max_chars - 3] + "..."


def build_video_type_prompt(transcript_text: str, hint: str | None = None) -> list[dict]:
    hint_text = f"用户提示：{hint}\n" if hint else ""
    user_prompt = (
        "分析以下视频字幕，识别视频的主题类型。\n\n"
        "要求：\n"
        "- 返回 1-10 个类型标签\n"
        "- 每个标签为 2-6 个中文字的短语（如：历史、科技、美食、动漫、游戏、体育、音乐、电影、电视剧、综艺等）\n"
        "- 按相关度从高到低排序\n"
        "- 如果无法判断，返回空列表\n\n"
        f"{hint_text}"
        '返回格式：{"types": ["类型1", "类型2"]}\n\n'
        f"字幕内容：\n{transcript_text}"
    )
    return [
        {"role": "system", "content": SYSTEM_PROMPT_CLASSIFY},
        {"role": "user", "content": user_prompt},
    ]


def build_summary_prompt(video_type: str | None, slices: list[dict]) -> list[dict]:
    """已废弃，保留供参考。摘要生成已移至 build_chapter_summary_prompt。"""
    label = video_type or "未知"
    slice_blocks = []
    for item in slices:
        slice_blocks.append(
            f"[切片 {item['slice_id']}] ({item['start']}-{item['end']}s)\n{item['text']}"
        )
    slices_text = "\n\n".join(slice_blocks)
    user_prompt = (
        "为视频生成整体摘要和各切片摘要（中文）。\n\n"
        f"视频类型：{label}\n\n"
        '返回格式：{"overall": "整体摘要", "by_slice": [{"slice_id": 0, "start": 0, "end": 300, "summary": "切片摘要"}]}\n\n'
        f"各切片内容：\n{slices_text}"
    )
    return [
        {"role": "system", "content": SYSTEM_PROMPT_SUMMARIZE},
        {"role": "user", "content": user_prompt},
    ]


def build_keyword_prompt(
    video_types: list[str] | None,
    mode: str,
    default_mode: str,
    chapters: list[dict],
) -> list[dict]:
    types_text = "、".join(video_types or []) or "未知"
    mode = mode.lower().strip()
    default_mode = default_mode.lower().strip()

    if mode == "deep":
        mode_rule = (
            "专业模式：\n"
            "- 提取与视频主题相关的专业术语、概念、人名、事件等你觉得 15 岁青少年可能不懂的词或短语\n"
            "- 解释需专业准确，用于给领域专家讲解（50-100字）\n"
            "- 可适当延伸相关知识"
        )
    else:
        mode_rule = (
            "简洁模式：\n"
            "- 提取与视频主题相关的专业术语、概念、人名、事件等你觉得 15 岁青少年可能不懂的词或短语\n"
            "- 解释要通俗易懂，像给高中生讲解（20-40字）\n"
            "- 避免过于专业的延伸，偏科普"
        )

    chapter_blocks = [
        f"[章节 {item['chapter_id']}] {item['text']}"
        for item in chapters
    ]
    chapters_text = "\n\n".join(chapter_blocks)

    user_prompt = (
        "从视频字幕中提取需要解释的关键词。\n\n"
        f"视频类型：{types_text}\n"
        f"默认模式：{default_mode}\n"
        f"当前模式：{mode}\n\n"
        f"{mode_rule}\n\n"
        "要求：\n"
        "- 每个关键词需要有清晰的定义/解释\n"
        "- 按重要性排序\n"
        "- 不要提取常见词汇\n\n"
        '返回格式：{"items":[{"term":"关键词","definition":"解释"}]}\n\n'
        f"字幕内容：\n{chapters_text}"
    )
    return [
        {"role": "system", "content": SYSTEM_PROMPT_EXTRACT},
        {"role": "user", "content": user_prompt},
    ]


def build_chapter_split_prompt(video_types: list[str] | None, segments: list[dict]) -> list[dict]:
    label = "、".join(video_types or []) or "未知"
    segment_lines = [
        f"[{item['segment_id']}] ({item['start']:.1f}-{item['end']:.1f}s) {item['text']}"
        for item in segments
    ]
    transcript_text = "\n".join(segment_lines)
    user_prompt = (
        "将视频字幕按语义主题划分为若干章节。\n\n"
        "划分原则：\n"
        "- 每个章节应有独立的主题或话题\n"
        "- 在话题转换、场景切换、或明显的段落过渡处分割\n"
        "- 优先选择 2-6 个章节；短视频可以只有 1 个章节\n"
        "- 章节必须连续、不重叠、完整覆盖所有 segment\n\n"
        "示例：\n"
        "- 视频前半段讲历史背景，后半段讲当代影响 → 分为 2 个章节\n"
        "- 一个 10 分钟的教程视频，全程讲同一个主题 → 1 个章节即可\n"
        "- 30 分钟的访谈，包含开场、3 个主要话题、总结 → 分为 5 个章节\n\n"
        f"视频类型：{label}\n\n"
        '返回格式：{"chapters":[{"chapter_id":0,"start_segment_id":"seg_000001","end_segment_id":"seg_000050"}]}\n\n'
        f"字幕内容：\n{transcript_text}"
    )
    return [
        {"role": "system", "content": SYSTEM_PROMPT_EXTRACT},
        {"role": "user", "content": user_prompt},
    ]


def build_chapter_summary_prompt(video_types: list[str] | None, chapters: list[dict]) -> list[dict]:
    label = "、".join(video_types or []) or "未知"
    blocks = [
        f"[章节 {item['chapter_id']}] ({item['start_segment_id']} -> {item['end_segment_id']})\n{item['text']}"
        for item in chapters
    ]
    chapters_text = "\n\n".join(blocks)
    user_prompt = (
        "为视频生成整体摘要和各章节摘要。\n\n"
        "要求：\n"
        "- 整体摘要：概括视频主题和核心内容（300-500 字）\n"
        "- 章节摘要：概括该章节的主要内容（20-50 字）\n"
        "- 使用陈述句，避免套话\n"
        "- 提炼关键信息，不要罗列细节\n\n"
        f"视频类型：{label}\n\n"
        '返回格式：{"overall":"整体摘要","chapters":[{"chapter_id":0,"summary":"章节摘要"}]}\n\n'
        f"各章节内容：\n{chapters_text}"
    )
    return [
        {"role": "system", "content": SYSTEM_PROMPT_SUMMARIZE},
        {"role": "user", "content": user_prompt},
    ]


def build_quotes_prompt(video_types: list[str] | None, segments: list[dict]) -> list[dict]:
    label = "、".join(video_types or []) or "未知"
    segment_lines = [
        f"[{item['segment_id']}] ({item['start']:.1f}-{item['end']:.1f}s) {item['text']}"
        for item in segments
    ]
    transcript_text = "\n".join(segment_lines)
    user_prompt = (
        "从视频字幕中挑选金句（1-5句）。\n\n"
        "金句标准：\n"
        "- 表达作者核心观点或独到见解\n"
        "- 措辞精炼、有感染力或有记忆点\n"
        "- 适合分享传播\n\n"
        "要求：\n"
        "- 必须是原文，不要改写或增删词\n"
        "- 每句是完整句子，可以跨多个 segment\n"
        "- text 必须来自连续字幕拼接（不要跳段）\n"
        "- 返回起始 segment_id（句子从该段开始）\n"
        "- 如果视频没有符合标准的金句（如纯教程、操作演示等），返回空列表\n\n"
        f"视频类型：{label}\n\n"
        '返回格式：{"quotes":[{"segment_id":"seg_000001","text":"金句原文"}]}\n\n'
        f"字幕内容：\n{transcript_text}"
    )
    return [
        {"role": "system", "content": SYSTEM_PROMPT_EXTRACT},
        {"role": "user", "content": user_prompt},
    ]
