import type { XHSContent } from '../types';
import { Heart, MessageCircle, Star, Bookmark, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function PhonePreview({ xhs }: { xhs: XHSContent }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative"
    >
      {/* 手机外框 */}
      <div className="w-[300px] h-[620px] bg-gray-900 rounded-[40px] p-3 shadow-2xl">
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
