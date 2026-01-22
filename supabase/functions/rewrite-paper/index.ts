// AI 改写论文为小红书风格
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// API 配置
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RewriteParams {
  paperId: string;
  style?: "casual" | "professional" | "humorous";
  targetAudience?: string;
}

// 小红书风格的系统提示词
const XHS_SYSTEM_PROMPT = `你是一个专业的小红书内容创作者，擅长将复杂的AI论文转化为通俗易懂、吸引眼球的小红书风格文章。

你的写作特点：
1. 标题要吸引眼球，使用emoji，带有悬念或惊叹感
2. 开头要有亲切的称呼（如"姐妹们！"、"家人们！"、"宝子们！"）
3. 正文口语化，短句为主，多用emoji点缀
4. 重点内容用emoji标记（✅、📍、💡、⭐等）
5. 结尾要有互动引导（码住、收藏等）
6. 适当使用流行语和网络热词
7. 专业术语要用大白话解释

请严格按照以下JSON格式输出：
{
  "title": "小红书标题（带emoji，20字以内）",
  "content": "正文内容（300-500字）",
  "tags": ["标签1", "标签2", "标签3", "标签4", "标签5"],
  "cover_text": ["封面文案1", "封面文案2", "封面文案3"]
}`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!ANTHROPIC_API_KEY) {
      throw new Error("Anthropic API key not configured");
    }

    const params: RewriteParams = await req.json();
    const { paperId, style = "casual", targetAudience = "科技爱好者" } = params;

    // 获取论文信息
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: paper, error: fetchError } = await supabase
      .from("raw_papers")
      .select("*")
      .eq("id", paperId)
      .single();

    if (fetchError || !paper) {
      throw new Error("Paper not found");
    }

    // 构建用户提示
    const userPrompt = `请将以下AI论文信息改写为小红书爆款文章：

论文标题：${paper.paper_title || "未知标题"}
论文摘要：${paper.paper_abstract || paper.tweet_text}
原始推文：${paper.tweet_text}
点赞数：${paper.like_count}

目标受众：${targetAudience}
风格偏好：${style === "casual" ? "轻松活泼" : style === "professional" ? "专业但易懂" : "幽默有趣"}

请生成一篇能引起共鸣的小红书文章。`;

    // 调用 Claude API
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 1024,
        system: XHS_SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: userPrompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Claude API error:", errorText);
      throw new Error(`Claude API error: ${response.status}`);
    }

    const result = await response.json();
    const contentText = result.content[0]?.text || "";

    // 解析 JSON 响应
    let xhsContent;
    try {
      // 尝试提取 JSON
      const jsonMatch = contentText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        xhsContent = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      // 如果解析失败，使用默认格式
      xhsContent = {
        title: `🔥 ${paper.paper_title || "重磅AI论文"}`,
        content: contentText,
        tags: ["AI论文", "人工智能", "科技前沿", "干货分享", "学习笔记"],
        cover_text: ["AI前沿", "深度解读", "建议收藏"],
      };
    }

    // 存储到数据库
    const { data: savedContent, error: saveError } = await supabase
      .from("xhs_contents")
      .insert({
        paper_id: paperId,
        title: xhsContent.title,
        content: xhsContent.content,
        tags: xhsContent.tags,
        cover_text: xhsContent.cover_text,
        emoji_list: ["🔥", "💡", "✅", "📚", "⭐"],
      })
      .select()
      .single();

    if (saveError) {
      console.error("Save error:", saveError);
      throw new Error("Failed to save content");
    }

    return new Response(
      JSON.stringify({
        success: true,
        content: savedContent,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
