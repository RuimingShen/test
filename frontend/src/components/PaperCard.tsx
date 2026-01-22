import { Heart, MessageCircle, Repeat2, ExternalLink, Wand2 } from 'lucide-react';
import { motion } from 'framer-motion';
import type { PaperCard } from '../types';
import { useStore } from '../hooks/useStore';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface Props {
  paper: PaperCard;
  index: number;
}

export function PaperCardItem({ paper, index }: Props) {
  const { selectPaper, setActiveTab, selectedPaper } = useStore();
  const { raw, xhs, publish } = paper;
  
  const isSelected = selectedPaper?.raw.id === raw.id;
  const hasXHS = !!xhs;
  const isPublished = publish?.status === 'published';

  const handleSelect = () => {
    selectPaper(paper);
    if (hasXHS) {
      setActiveTab('preview');
    }
  };

  const handleRewrite = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectPaper(paper);
    setActiveTab('preview');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={handleSelect}
      className={`xhs-card p-5 cursor-pointer ${
        isSelected ? 'ring-2 ring-[#ff2442] ring-offset-2' : ''
      }`}
    >
      {/* 顶部信息 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
            {raw.author_name.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-sm text-gray-800">{raw.author_name}</p>
            <p className="text-xs text-gray-400">@{raw.author_username}</p>
          </div>
        </div>
        
        {/* 状态标签 */}
        <div className="flex items-center gap-2">
          {isPublished ? (
            <span className="xhs-tag">
              <span className="status-dot published"></span>
              已发布
            </span>
          ) : hasXHS ? (
            <span className="xhs-tag">
              <span className="status-dot draft"></span>
              待发布
            </span>
          ) : null}
        </div>
      </div>

      {/* 论文标题 */}
      {raw.paper_title && (
        <h3 className="font-bold text-base text-gray-800 mb-2 line-clamp-2">
          📄 {raw.paper_title}
        </h3>
      )}

      {/* 推文内容 */}
      <p className="text-sm text-gray-600 mb-3 line-clamp-3">
        {raw.tweet_text}
      </p>

      {/* 链接 */}
      {raw.paper_url && (
        <a
          href={raw.paper_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 mb-3"
        >
          <ExternalLink className="w-3 h-3" />
          查看论文
        </a>
      )}

      {/* 底部统计 */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-4 text-gray-400 text-xs">
          <span className="flex items-center gap-1">
            <Heart className="w-4 h-4 text-red-400" />
            {raw.like_count.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <Repeat2 className="w-4 h-4" />
            {raw.retweet_count.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4" />
            {raw.reply_count.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">
            {formatDistanceToNow(new Date(raw.created_at), { 
              addSuffix: true,
              locale: zhCN 
            })}
          </span>
          
          {!hasXHS && (
            <button
              onClick={handleRewrite}
              className="xhs-btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"
            >
              <Wand2 className="w-3 h-3" />
              改写
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
