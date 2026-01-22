import { FileText, Eye, CheckCircle } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { motion } from 'framer-motion';

const tabs = [
  { id: 'papers' as const, label: '论文列表', icon: FileText },
  { id: 'preview' as const, label: '内容预览', icon: Eye },
  { id: 'published' as const, label: '已发布', icon: CheckCircle },
];

export function TabNav() {
  const { activeTab, setActiveTab, papers } = useStore();
  
  const publishedCount = papers.filter(p => p.publish?.status === 'published').length;
  const draftCount = papers.filter(p => p.xhs && !p.publish).length;

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-2 shadow-sm inline-flex gap-1">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        
        let badge = null;
        if (tab.id === 'papers') {
          badge = papers.length;
        } else if (tab.id === 'preview') {
          badge = draftCount;
        } else if (tab.id === 'published') {
          badge = publishedCount;
        }

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-5 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${
              isActive 
                ? 'text-white' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-gradient-to-r from-[#ff2442] to-[#ff6b81] rounded-xl shadow-lg"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative flex items-center gap-2">
              <Icon className="w-4 h-4" />
              {tab.label}
              {badge !== null && badge > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                  isActive 
                    ? 'bg-white/20 text-white' 
                    : 'bg-pink-100 text-pink-600'
                }`}>
                  {badge}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
