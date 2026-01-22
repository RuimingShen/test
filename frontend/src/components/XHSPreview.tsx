import { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { 
  Wand2,
  Send,
  Edit3,
  Save,
  X,
  Heart, 
  MessageCircle, 
  Star,
  Bookmark,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function XHSPreview() {
  const { 
    selectedPaper, 
    isRewriting, 
    isPublishing,
    rewriteSelectedPaper, 
    publishSelectedPaper,
    updateXHSContent 
  } = useStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const xhs = selectedPaper?.xhs;

  // 开始编辑
  const startEditing = () => {
    if (xhs) {
      setEditTitle(xhs.title);
      setEditContent(xhs.content);
      setIsEditing(true);
    }
  };

  // 保存编辑
  const saveEditing = () => {
    updateXHSContent({
      title: editTitle,
      content: editContent,
    });
    setIsEditing(false);
  };

  // 取消编辑
  const cancelEditing = () => {
    setIsEditing(false);
  };

  // 没有选中论文
  if (!selectedPaper) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 mb-6 rounded-3xl bg-gradient-to-br from-pink-100 to-pink-50 flex items-center justify-center">
          <Wand2 className="w-10 h-10 text-pink-300" />
        </div>
        <h3 className="text-lg font-medium text-gray-600 mb-2">选择一篇论文</h3>
        <p className="text-gray-400 text-sm max-w-sm">
          在左侧论文列表中选择一篇论文，然后点击"改写"按钮生成小红书风格内容
        </p>
      </div>
    );
  }

  // 还没有生成小红书内容
  if (!xhs) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="xhs-card p-8 max-w-md"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#ff2442] to-[#ff6b81] flex items-center justify-center">
            <Wand2 className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            {selectedPaper.raw.paper_title || '未命名论文'}
          </h3>
          <p className="text-gray-500 text-sm mb-6 line-clamp-3">
            {selectedPaper.raw.paper_abstract || selectedPaper.raw.tweet_text}
          </p>
          <button
            onClick={() => rewriteSelectedPaper()}
            disabled={isRewriting}
            className="xhs-btn w-full flex items-center justify-center gap-2"
          >
            {isRewriting ? (
              <>
                <div className="loading-spinner w-5 h-5"></div>
                AI 正在改写中...
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                一键改写为小红书风格
              </>
            )}
          </button>
        </motion.div>
      </div>
    );
  }

  // 显示预览
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* 左侧：编辑区 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-800">内容编辑</h3>
          {isEditing ? (
            <div className="flex gap-2">
              <button
                onClick={cancelEditing}
                className="xhs-btn-secondary text-sm py-1.5 px-3 flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                取消
              </button>
              <button
                onClick={saveEditing}
                className="xhs-btn text-sm py-1.5 px-3 flex items-center gap-1"
              >
                <Save className="w-4 h-4" />
                保存
              </button>
            </div>
          ) : (
            <button
              onClick={startEditing}
              className="xhs-btn-secondary text-sm py-1.5 px-3 flex items-center gap-1"
            >
              <Edit3 className="w-4 h-4" />
              编辑
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div
              key="editing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">标题</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="xhs-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">正文</label>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={15}
                  className="xhs-input resize-none"
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="xhs-card p-5 space-y-4"
            >
              <h4 className="font-bold text-lg text-gray-800">{xhs.title}</h4>
              <div className="preview-content text-sm">{xhs.content}</div>
              <div className="flex flex-wrap gap-2 pt-2">
                {xhs.tags.map((tag, i) => (
                  <span key={i} className="xhs-tag">#{tag}</span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 操作按钮 */}
        <div className="flex gap-3">
          <button
            onClick={() => rewriteSelectedPaper()}
            disabled={isRewriting}
            className="xhs-btn-secondary flex-1 flex items-center justify-center gap-2"
          >
            <Wand2 className="w-4 h-4" />
            重新改写
          </button>
          <button
            onClick={() => publishSelectedPaper()}
            disabled={isPublishing || selectedPaper.publish?.status === 'published'}
            className="xhs-btn flex-1 flex items-center justify-center gap-2"
          >
            {isPublishing ? (
              <>
                <div className="loading-spinner w-5 h-5"></div>
                发布中...
              </>
            ) : selectedPaper.publish?.status === 'published' ? (
              <>
                ✓ 已发布
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                模拟发布
              </>
            )}
          </button>
        </div>
      </div>

      {/* 右侧：手机预览 */}
      <div className="flex justify-center">
        <PhoneMockup xhs={xhs} />
      </div>
    </div>
  );
}

// 手机模拟器组件
function PhoneMockup({ xhs }: { xhs: XHSContent }) {
  if (!xhs) return null;
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative"
    >
      {/* 手机外框 */}
      <div className="w-[360px] h-[760px] bg-gray-900 rounded-[44px] p-3 shadow-2xl">
        {/* 刘海 */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-gray-900 rounded-b-2xl z-10"></div>
        
        {/* 屏幕 */}
        <div className="w-full h-full bg-white rounded-[32px] overflow-hidden">
          {/* 状态栏 */}
          <div className="h-12 bg-white flex items-center justify-between px-6 pt-2">
            <span className="text-xs font-medium">9:41</span>
            <div className="flex items-center gap-1">
              <div className="w-4 h-2 border border-gray-800 rounded-sm">
                <div className="w-3/4 h-full bg-gray-800 rounded-sm"></div>
              </div>
            </div>
          </div>

          {/* 内容区 */}
          <div className="px-4 pb-4 overflow-y-auto h-[calc(100%-48px)]">
            {/* 封面区域 */}
            <div className="aspect-[4/3] bg-gradient-to-br from-[#ff2442] to-[#ff6b81] rounded-lg mb-3 flex items-center justify-center p-4">
              <div className="text-center">
                {xhs.cover_text.map((text, i) => (
                  <p key={i} className="text-white font-bold text-lg mb-1">{text}</p>
                ))}
              </div>
            </div>

            {/* 标题 */}
            <h1 className="font-bold text-base mb-2 leading-tight">{xhs.title}</h1>

            {/* 正文 */}
            <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed mb-3">
              {xhs.content.slice(0, 300)}
              {xhs.content.length > 300 && '...'}
            </div>

            {/* 标签 */}
            <div className="flex flex-wrap gap-1 mb-4">
              {xhs.tags.slice(0, 4).map((tag, i) => (
                <span key={i} className="text-xs text-blue-500">#{tag}</span>
              ))}
            </div>

            {/* 互动栏 */}
            <div className="flex items-center justify-between py-3 border-t border-gray-100">
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-1 text-gray-500">
                  <Heart className="w-5 h-5" />
                  <span className="text-xs">1.2k</span>
                </button>
                <button className="flex items-center gap-1 text-gray-500">
                  <Star className="w-5 h-5" />
                  <span className="text-xs">886</span>
                </button>
                <button className="flex items-center gap-1 text-gray-500">
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-xs">52</span>
                </button>
              </div>
              <div className="flex items-center gap-3">
                <Bookmark className="w-5 h-5 text-gray-400" />
                <Share2 className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
