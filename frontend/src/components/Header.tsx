import { Sparkles, RefreshCw } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { motion } from 'framer-motion';

export function Header() {
  const { isFetching, fetchPapers } = useStore();

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-pink-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff2442] to-[#ff6b81] flex items-center justify-center shadow-lg shadow-red-200">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-[#ff2442] to-[#ff6b81] bg-clip-text text-transparent">
                AI 论文搬运工
              </h1>
              <p className="text-xs text-gray-400">Twitter → 小红书风格转换器</p>
            </div>
          </motion.div>

          {/* 操作按钮 */}
          <motion.div 
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <button
              onClick={() => fetchPapers()}
              disabled={isFetching}
              className="xhs-btn flex items-center gap-2 text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
              {isFetching ? '抓取中...' : '抓取论文'}
            </button>
          </motion.div>
        </div>
      </div>
    </header>
  );
}
