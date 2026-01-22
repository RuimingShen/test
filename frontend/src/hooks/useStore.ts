import { create } from 'zustand';
import type { PaperCard, XHSContent, PublishRecord } from '../types';
import { getPapers, fetchNewPapers, rewritePaper, publishContent } from '../services/api';

interface Store {
  // 状态
  papers: PaperCard[];
  selectedPaper: PaperCard | null;
  isLoading: boolean;
  isFetching: boolean;
  isRewriting: boolean;
  isPublishing: boolean;
  error: string | null;
  activeTab: 'papers' | 'preview' | 'published';

  // 动作
  setActiveTab: (tab: 'papers' | 'preview' | 'published') => void;
  selectPaper: (paper: PaperCard | null) => void;
  loadPapers: () => Promise<void>;
  fetchPapers: () => Promise<void>;
  rewriteSelectedPaper: () => Promise<void>;
  publishSelectedPaper: () => Promise<void>;
  updateXHSContent: (updates: Partial<XHSContent>) => void;
  clearError: () => void;
}

export const useStore = create<Store>((set, get) => ({
  // 初始状态
  papers: [],
  selectedPaper: null,
  isLoading: false,
  isFetching: false,
  isRewriting: false,
  isPublishing: false,
  error: null,
  activeTab: 'papers',

  // 动作实现
  setActiveTab: (tab) => set({ activeTab: tab }),

  selectPaper: (paper) => set({ selectedPaper: paper }),

  loadPapers: async () => {
    set({ isLoading: true, error: null });
    const result = await getPapers();
    if (result.success && result.data) {
      set({ papers: result.data, isLoading: false });
    } else {
      set({ error: result.error || '加载失败', isLoading: false });
    }
  },

  fetchPapers: async () => {
    set({ isFetching: true, error: null });
    const result = await fetchNewPapers({
      minLikes: 100,
      keywords: ['arxiv', 'paper', 'AI', 'LLM', 'GPT', 'machine learning'],
      maxResults: 20,
    });
    if (result.success) {
      // 重新加载论文列表
      await get().loadPapers();
    } else {
      set({ error: result.error || '抓取失败' });
    }
    set({ isFetching: false });
  },

  rewriteSelectedPaper: async () => {
    const { selectedPaper } = get();
    if (!selectedPaper) return;

    set({ isRewriting: true, error: null });
    const result = await rewritePaper({
      paperId: selectedPaper.raw.id,
      style: 'casual',
      targetAudience: '科技爱好者',
    });

    if (result.success && result.data) {
      // 更新选中的论文的 XHS 内容
      const updatedPaper = { ...selectedPaper, xhs: result.data };
      set({ 
        selectedPaper: updatedPaper,
        papers: get().papers.map(p => 
          p.raw.id === selectedPaper.raw.id ? updatedPaper : p
        ),
        isRewriting: false,
      });
    } else {
      set({ error: result.error || '改写失败', isRewriting: false });
    }
  },

  publishSelectedPaper: async () => {
    const { selectedPaper } = get();
    if (!selectedPaper?.xhs) return;

    set({ isPublishing: true, error: null });
    const result = await publishContent(selectedPaper.xhs.id);

    if (result.success && result.data) {
      // 更新发布状态
      const updatedPaper: PaperCard = { 
        ...selectedPaper, 
        publish: result.data as PublishRecord 
      };
      set({ 
        selectedPaper: updatedPaper,
        papers: get().papers.map(p => 
          p.raw.id === selectedPaper.raw.id ? updatedPaper : p
        ),
        isPublishing: false,
      });
    } else {
      set({ error: result.error || '发布失败', isPublishing: false });
    }
  },

  updateXHSContent: (updates) => {
    const { selectedPaper } = get();
    if (!selectedPaper?.xhs) return;

    const updatedXHS = { ...selectedPaper.xhs, ...updates };
    const updatedPaper = { ...selectedPaper, xhs: updatedXHS };
    
    set({ 
      selectedPaper: updatedPaper,
      papers: get().papers.map(p => 
        p.raw.id === selectedPaper.raw.id ? updatedPaper : p
      ),
    });
  },

  clearError: () => set({ error: null }),
}));
