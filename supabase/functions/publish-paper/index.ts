// 模拟发布到小红书
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PublishParams {
  xhsContentId: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const params: PublishParams = await req.json();
    const { xhsContentId } = params;

    if (!xhsContentId) {
      throw new Error("xhsContentId is required");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 检查内容是否存在
    const { data: content, error: contentError } = await supabase
      .from("xhs_contents")
      .select("*")
      .eq("id", xhsContentId)
      .single();

    if (contentError || !content) {
      throw new Error("Content not found");
    }

    // 检查是否已发布
    const { data: existingRecord } = await supabase
      .from("publish_records")
      .select("*")
      .eq("xhs_content_id", xhsContentId)
      .eq("status", "published")
      .single();

    if (existingRecord) {
      throw new Error("Content already published");
    }

    // 模拟发布过程（实际集成小红书 API 时在这里实现）
    // 这里只是创建发布记录
    console.log("Publishing content:", {
      title: content.title,
      content: content.content.substring(0, 100) + "...",
      tags: content.tags,
    });

    // 模拟一些延迟（像真实的 API 调用）
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 创建发布记录
    const { data: record, error: recordError } = await supabase
      .from("publish_records")
      .insert({
        xhs_content_id: xhsContentId,
        status: "published",
        published_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (recordError) {
      console.error("Record error:", recordError);
      throw new Error("Failed to create publish record");
    }

    return new Response(
      JSON.stringify({
        success: true,
        record,
        message: "Content published successfully (simulated)",
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
