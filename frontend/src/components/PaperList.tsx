import { useStore } from '../hooks/useStore';
import { PaperCardItem } from './PaperCard';
import { FileText, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

export function PaperList() {
  const { papers, isLoading } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'likes' | 'date'>('likes');

  // 筛选和排序
  const filteredPapers = papers
    .filter(p => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        p.raw.paper_title?.toLowerCase().includes(query) ||
        p.raw.tweet_text.toLowerCase().includes(query) ||
        p.raw.author_name.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'likes') {
        return b.raw.like_count - a.raw.like_count;
      }
      return new Date(b.raw.created_at).getTime() - new Date(a.raw.created_at).getTime();
    });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="loading-spinner mb-4"></div>
        <p className="text-gray-500">加载中...</p>
      </div>
    );
  }

  return (
    <div>
      {/* 搜索和筛选 */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索论文标题、内容..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="xhs-input pl-10"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'likes' | 'date')}
          className="xhs-input w-auto"
        >
          <option value="likes">按热度排序</option>
          <option value="date">按时间排序</option>
        </select>
      </div>

      {/* 论文列表 */}
      {filteredPapers.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPapers.map((paper, index) => (
            <PaperCardItem key={paper.raw.id} paper={paper} index={index} />
          ))}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-pink-50 flex items-center justify-center">
            <FileText className="w-8 h-8 text-pink-300" />
          </div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">暂无论文</h3>
          <p className="text-gray-400 text-sm">
            {searchQuery ? '没有找到匹配的论文，试试其他关键词' : '点击右上角"抓取论文"按钮开始'}
          </p>
        </motion.div>
      )}
    </div>
  );
}
