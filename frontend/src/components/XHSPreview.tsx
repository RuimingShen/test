import { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { 
  Wand2,
  Send,
  Edit3,
  Save,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PhonePreview } from './PhonePreview';

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
        <PhonePreview xhs={xhs} />
      </div>
    </div>
  );
}
