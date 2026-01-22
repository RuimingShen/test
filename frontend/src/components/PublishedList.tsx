import { useStore } from '../hooks/useStore';
import { CheckCircle, Calendar, Eye, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { PhonePreview } from './PhonePreview';

export function PublishedList() {
  const { papers, selectPaper, selectedPaper } = useStore();
  
  const publishedPapers = papers.filter(p => p.publish?.status === 'published');

  if (publishedPapers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 mb-6 rounded-3xl bg-green-50 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-200" />
        </div>
        <h3 className="text-lg font-medium text-gray-600 mb-2">暂无发布记录</h3>
        <p className="text-gray-400 text-sm max-w-sm">
          完成内容改写后，点击"模拟发布"按钮即可在这里看到发布记录
        </p>
      </div>
    );
  }

  const selectedPreview = selectedPaper?.publish?.status === 'published' ? selectedPaper : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-gray-800">发布历史</h3>
        <span className="text-sm text-gray-500">
          共 {publishedPapers.length} 篇
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-4 md:grid-cols-2">
          {publishedPapers.map((paper, index) => (
            <motion.div
              key={paper.raw.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="xhs-card p-5"
            >
              {/* 顶部状态 */}
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1 text-green-600 text-sm font-medium">
                  <CheckCircle className="w-4 h-4" />
                  已发布
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {paper.publish?.published_at && format(
                    new Date(paper.publish.published_at),
                    'yyyy年MM月dd日 HH:mm',
                    { locale: zhCN }
                  )}
                </span>
              </div>

              {/* 小红书标题 */}
              <h4 className="font-bold text-base text-gray-800 mb-2 line-clamp-2">
                {paper.xhs?.title}
              </h4>

              {/* 原始论文标题 */}
              <p className="text-sm text-gray-500 mb-3 line-clamp-1">
                原文: {paper.raw.paper_title}
              </p>

              {/* 标签 */}
              <div className="flex flex-wrap gap-1 mb-4">
                {paper.xhs?.tags.slice(0, 3).map((tag, i) => (
                  <span key={i} className="xhs-tag text-xs">#{tag}</span>
                ))}
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-2">
                <button
                  onClick={() => selectPaper(paper)}
                  className="xhs-btn-secondary text-xs py-1.5 px-3 flex items-center gap-1 flex-1 justify-center"
                >
                  <Eye className="w-3 h-3" />
                  查看内容
                </button>
                {paper.raw.paper_url && (
                  <a
                    href={paper.raw.paper_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="xhs-btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    原文
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center">
          {selectedPreview?.xhs ? (
            <PhonePreview xhs={selectedPreview.xhs} />
          ) : (
            <div className="xhs-card p-6 w-full h-full flex items-center justify-center text-sm text-gray-400 text-center">
              选择一条发布记录查看内容展示
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
