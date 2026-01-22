import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from './hooks/useStore';
import { 
  Header, 
  TabNav, 
  PaperList, 
  XHSPreview, 
  PublishedList,
  ToastProvider 
} from './components';
import toast from 'react-hot-toast';

function App() {
  const { activeTab, loadPapers, error, clearError } = useStore();

  // 加载初始数据
  useEffect(() => {
    loadPapers();
  }, [loadPapers]);

  // 错误提示
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  return (
    <div className="min-h-screen">
      <ToastProvider />
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 导航标签 */}
        <div className="flex justify-center mb-8">
          <TabNav />
        </div>

        {/* 内容区域 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'papers' && <PaperList />}
            {activeTab === 'preview' && <XHSPreview />}
            {activeTab === 'published' && <PublishedList />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 底部说明 */}
      <footer className="text-center py-8 text-gray-400 text-sm">
        <p>AI 论文搬运工 - 自动将 Twitter 热门 AI 论文转换为小红书风格</p>
        <p className="mt-1">
          <span className="text-pink-400">♥</span> Built with React + Supabase
        </p>
      </footer>
    </div>
  );
}

export default App;
