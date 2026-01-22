import { supabase, isSupabaseConfigured } from './supabase';
import type { 
  RawPaper, 
  XHSContent, 
  PublishRecord, 
  PaperCard, 
  ApiResponse,
  FetchParams,
  RewriteParams 
} from '../types';
import { mockPapers, generateMockXHSContent } from '../utils/mockData';

// ============ 论文相关 API ============

// 获取所有论文
export async function getPapers(): Promise<ApiResponse<PaperCard[]>> {
  if (!isSupabaseConfigured()) {
    // Mock 模式
    return { success: true, data: mockPapers };
  }

  try {
    const { data: papers, error: papersError } = await supabase
      .from('raw_papers')
      .select('*')
      .order('like_count', { ascending: false });

    if (papersError) throw papersError;

    const { data: xhsContents, error: xhsError } = await supabase
      .from('xhs_contents')
      .select('*');

    if (xhsError) throw xhsError;

    const { data: publishRecords, error: publishError } = await supabase
      .from('publish_records')
      .select('*');

    if (publishError) throw publishError;

    // 组装数据
    const paperCards: PaperCard[] = (papers || []).map((paper: RawPaper) => {
      const xhs = xhsContents?.find((x: XHSContent) => x.paper_id === paper.id);
      const publish = xhs 
        ? publishRecords?.find((p: PublishRecord) => p.xhs_content_id === xhs.id)
        : undefined;
      return { raw: paper, xhs, publish };
    });

    return { success: true, data: paperCards };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// 触发抓取新论文
export async function fetchNewPapers(params: FetchParams): Promise<ApiResponse<RawPaper[]>> {
  if (!isSupabaseConfigured()) {
    // Mock 模式：返回模拟数据
    await new Promise(resolve => setTimeout(resolve, 2000)); // 模拟延迟
    return { 
      success: true, 
      data: mockPapers.map(p => p.raw) 
    };
  }

  try {
    const { data, error } = await supabase.functions.invoke('fetch-papers', {
      body: params
    });

    if (error) throw error;
    return { success: true, data: data.papers };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// ============ AI 改写相关 API ============

// 改写论文为小红书风格
export async function rewritePaper(params: RewriteParams): Promise<ApiResponse<XHSContent>> {
  if (!isSupabaseConfigured()) {
    // Mock 模式：生成模拟的小红书内容
    await new Promise(resolve => setTimeout(resolve, 3000)); // 模拟 AI 处理时间
    const paper = mockPapers.find(p => p.raw.id === params.paperId);
    if (!paper) {
      return { success: false, error: '论文不存在' };
    }
    const xhsContent = generateMockXHSContent(paper.raw);
    return { success: true, data: xhsContent };
  }

  try {
    const { data, error } = await supabase.functions.invoke('rewrite-paper', {
      body: params
    });

    if (error) throw error;
    return { success: true, data: data.content };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// 更新改写内容
export async function updateXHSContent(
  contentId: string, 
  updates: Partial<XHSContent>
): Promise<ApiResponse<XHSContent>> {
  if (!isSupabaseConfigured()) {
    return { success: true, data: { ...updates, id: contentId } as XHSContent };
  }

  try {
    const { data, error } = await supabase
      .from('xhs_contents')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', contentId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// ============ 发布相关 API ============

// 模拟发布
export async function publishContent(xhsContentId: string): Promise<ApiResponse<PublishRecord>> {
  if (!isSupabaseConfigured()) {
    // Mock 模式
    await new Promise(resolve => setTimeout(resolve, 1000));
    const record: PublishRecord = {
      id: `pub_${Date.now()}`,
      xhs_content_id: xhsContentId,
      status: 'published',
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
    return { success: true, data: record };
  }

  try {
    const { data, error } = await supabase.functions.invoke('publish-paper', {
      body: { xhsContentId }
    });

    if (error) throw error;
    return { success: true, data: data.record };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// 获取发布历史
export async function getPublishHistory(): Promise<ApiResponse<PublishRecord[]>> {
  if (!isSupabaseConfigured()) {
    return { success: true, data: [] };
  }

  try {
    const { data, error } = await supabase
      .from('publish_records')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
