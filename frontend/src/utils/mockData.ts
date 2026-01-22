import type { RawPaper, XHSContent, PaperCard } from '../types';

// 模拟的论文数据
export const mockPapers: PaperCard[] = [
  {
    raw: {
      id: 'paper_1',
      tweet_id: '1234567890',
      tweet_text: '🚀 New paper: "Attention Is All You Need" - Introducing Transformer, a new architecture based solely on attention mechanisms. Achieves SOTA on WMT translation! https://arxiv.org/abs/1706.03762',
      tweet_url: 'https://twitter.com/_akhaliq/status/1234567890',
      author_name: 'AK',
      author_username: '_akhaliq',
      like_count: 2850,
      retweet_count: 892,
      reply_count: 156,
      paper_title: 'Attention Is All You Need',
      paper_url: 'https://arxiv.org/abs/1706.03762',
      paper_abstract: 'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.',
      created_at: '2024-01-15T10:30:00Z',
      fetched_at: '2024-01-15T12:00:00Z',
    },
  },
  {
    raw: {
      id: 'paper_2',
      tweet_id: '1234567891',
      tweet_text: '🔥 GPT-4 Technical Report is out! Multi-modal model that accepts image and text inputs, produces text outputs. Exhibits human-level performance on many professional benchmarks. https://arxiv.org/abs/2303.08774',
      tweet_url: 'https://twitter.com/_akhaliq/status/1234567891',
      author_name: 'AK',
      author_username: '_akhaliq',
      like_count: 5420,
      retweet_count: 2100,
      reply_count: 380,
      paper_title: 'GPT-4 Technical Report',
      paper_url: 'https://arxiv.org/abs/2303.08774',
      paper_abstract: 'We report the development of GPT-4, a large-scale, multimodal model which can accept image and text inputs and produce text outputs. While less capable than humans in many real-world scenarios, GPT-4 exhibits human-level performance on various professional and academic benchmarks.',
      created_at: '2024-01-14T08:00:00Z',
      fetched_at: '2024-01-14T10:00:00Z',
    },
  },
  {
    raw: {
      id: 'paper_3',
      tweet_id: '1234567892',
      tweet_text: '✨ Introducing Llama 2: Open Foundation and Fine-Tuned Chat Models. Free for research and commercial use. 7B to 70B parameters! https://arxiv.org/abs/2307.09288',
      tweet_url: 'https://twitter.com/MetaAI/status/1234567892',
      author_name: 'Meta AI',
      author_username: 'MetaAI',
      like_count: 3200,
      retweet_count: 1500,
      reply_count: 220,
      paper_title: 'Llama 2: Open Foundation and Fine-Tuned Chat Models',
      paper_url: 'https://arxiv.org/abs/2307.09288',
      paper_abstract: 'In this work, we develop and release Llama 2, a collection of pretrained and fine-tuned large language models (LLMs) ranging in scale from 7 billion to 70 billion parameters. Our fine-tuned LLMs, called Llama 2-Chat, are optimized for dialogue use cases.',
      created_at: '2024-01-13T14:00:00Z',
      fetched_at: '2024-01-13T16:00:00Z',
    },
  },
  {
    raw: {
      id: 'paper_4',
      tweet_id: '1234567893',
      tweet_text: '📚 "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding" - Google AI Language. Sets new SOTA on 11 NLP tasks! https://arxiv.org/abs/1810.04805',
      tweet_url: 'https://twitter.com/GoogleAI/status/1234567893',
      author_name: 'Google AI',
      author_username: 'GoogleAI',
      like_count: 1850,
      retweet_count: 720,
      reply_count: 95,
      paper_title: 'BERT: Pre-training of Deep Bidirectional Transformers',
      paper_url: 'https://arxiv.org/abs/1810.04805',
      paper_abstract: 'We introduce a new language representation model called BERT, which stands for Bidirectional Encoder Representations from Transformers. Unlike recent language representation models, BERT is designed to pre-train deep bidirectional representations from unlabeled text.',
      created_at: '2024-01-12T09:00:00Z',
      fetched_at: '2024-01-12T11:00:00Z',
    },
  },
  {
    raw: {
      id: 'paper_5',
      tweet_id: '1234567894',
      tweet_text: '🎨 Stable Diffusion 3 paper dropped! Multi-modal diffusion transformer (MMDiT) architecture achieves incredible image quality. https://arxiv.org/abs/2403.03206',
      tweet_url: 'https://twitter.com/StabilityAI/status/1234567894',
      author_name: 'Stability AI',
      author_username: 'StabilityAI',
      like_count: 4100,
      retweet_count: 1800,
      reply_count: 310,
      paper_title: 'Scaling Rectified Flow Transformers for High-Resolution Image Synthesis',
      paper_url: 'https://arxiv.org/abs/2403.03206',
      paper_abstract: 'We present Stable Diffusion 3, a new family of models using a novel Multimodal Diffusion Transformer (MMDiT) architecture with improved rectified flow formulation. SD3 outperforms state-of-the-art text-to-image generation systems.',
      created_at: '2024-01-11T16:00:00Z',
      fetched_at: '2024-01-11T18:00:00Z',
    },
  },
];

// 小红书风格模板
const xhsTemplates = {
  titles: [
    '🔥 震惊！{topic}竟然能做到这样！',
    '💥 谷歌/Meta最新研究，{topic}要变天了！',
    '✨ 姐妹们！这个{topic}太绝了！',
    '📢 重磅！{topic}领域的里程碑之作！',
    '🚀 AI圈都在疯传的{topic}，终于搞懂了！',
  ],
  intros: [
    '姐妹们！今天必须给你们分享一个超级重磅的消息 💥',
    '家人们！这篇论文真的太顶了，不看后悔系列 🔥',
    'AI 圈最近都在讨论这个，我来给大家翻译翻译 👀',
    '码住！这可能是今年最重要的 AI 研究之一 📚',
    '终于等到了！这篇论文我追了好久 ✨',
  ],
  endings: [
    '📍 重点来了',
    '💡 划重点',
    '⭐ 核心要点',
    '🎯 一句话总结',
    '💪 实用建议',
  ],
  tags: [
    'AI论文', '人工智能', '深度学习', '机器学习', 'ChatGPT',
    '大模型', 'LLM', '科技前沿', 'AI干货', '技术分享',
  ],
};

// 生成模拟的小红书内容
export function generateMockXHSContent(paper: RawPaper): XHSContent {
  const topic = paper.paper_title?.split(':')[0] || 'AI';
  
  // 随机选择模板
  const titleTemplate = xhsTemplates.titles[Math.floor(Math.random() * xhsTemplates.titles.length)];
  const intro = xhsTemplates.intros[Math.floor(Math.random() * xhsTemplates.intros.length)];
  const ending = xhsTemplates.endings[Math.floor(Math.random() * xhsTemplates.endings.length)];
  
  const title = titleTemplate.replace('{topic}', topic);
  
  const content = `${intro}

今天要聊的是「${paper.paper_title}」这篇论文 📄

简单来说，这篇论文做了什么呢？

${paper.paper_abstract?.slice(0, 200)}...

${ending}：
✅ 技术创新点：提出了全新的架构/方法
✅ 效果：在多个基准测试上达到SOTA
✅ 影响：可能改变整个行业的方向

这篇论文的点赞数已经超过 ${paper.like_count} 了，说明确实很有价值 🔥

想深入了解的宝子可以去看原文哦~
论文链接我放评论区啦 👇

#AI论文 #人工智能 #深度学习 #科技前沿 #干货分享`;

  // 随机选择 3-5 个标签
  const shuffledTags = [...xhsTemplates.tags].sort(() => Math.random() - 0.5);
  const selectedTags = shuffledTags.slice(0, 3 + Math.floor(Math.random() * 3));

  return {
    id: `xhs_${paper.id}`,
    paper_id: paper.id,
    title,
    content,
    tags: selectedTags,
    cover_text: [topic, '深度解读', '建议收藏', '📚'],
    emoji_list: ['🔥', '💥', '✨', '📚', '👀', '💡', '✅'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}
