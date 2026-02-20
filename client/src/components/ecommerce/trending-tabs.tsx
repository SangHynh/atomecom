'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductCard } from './product-card';
import { cn } from '@/lib/utils';

const TABS = [
  { id: 'trending', label: 'XU HƯỚNG' },
  { id: 'best-seller', label: 'BÁN CHẠY' },
  { id: 'new-arrivals', label: 'MỚI VỀ' },
];

const MOCK_DATA: Record<string, any[]> = {
  trending: [
    {
      id: 't1',
      name: 'Atomecom Pro Watch',
      price: 15000000,
      category: 'Watch',
      image: '/luxury_watch_product_1771597650327.png',
      rating: 4.9,
    },
    {
      id: 't2',
      name: 'Nebula Headphone X',
      price: 8000000,
      category: 'Audio',
      image:
        'https://images.unsplash.com/photo-1546435770-a3e426da4717?q=80&w=1000&auto=format&fit=crop',
      rating: 4.8,
    },
    {
      id: 't3',
      name: 'Titan Phone 15',
      price: 32000000,
      category: 'Mobile',
      image:
        'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?q=80&w=1000&auto=format&fit=crop',
      rating: 5.0,
    },
    {
      id: 't4',
      name: 'Cyber Laptop G',
      price: 55000000,
      category: 'Laptop',
      image:
        'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?q=80&w=1000&auto=format&fit=crop',
      rating: 4.7,
    },
  ],
  'best-seller': [
    {
      id: 'b1',
      name: 'Iconic Sneakers',
      price: 5000000,
      category: 'Shoes',
      image:
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop',
      rating: 4.9,
    },
    {
      id: 'b2',
      name: 'Classic Sunglasses',
      price: 3000000,
      category: 'Fashion',
      image:
        'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=1000&auto=format&fit=crop',
      rating: 4.8,
    },
  ],
  'new-arrivals': [
    {
      id: 'n1',
      name: 'Future Car Keys',
      price: 1200000,
      category: 'Keys',
      image:
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop',
      rating: 4.6,
      isNew: true,
    },
  ],
};

export function TrendingTabs() {
  const [activeTab, setActiveTab] = useState('trending');

  return (
    <section className="py-24 container mx-auto px-4">
      <div className="flex flex-col items-center mb-16 space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic leading-none">
            Khám phá <span className="text-primary italic">Thế giới</span>
          </h2>
          <p className="text-muted-foreground font-medium max-w-lg mx-auto italic">
            Dễ dàng tìm thấy những gì bạn đang tìm kiếm thông qua các tiêu chí
            lựa chọn thông minh.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1.5 bg-muted/60 backdrop-blur-md rounded-2xl border border-border/50 shadow-inner">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-8 py-3 rounded-xl text-[10px] font-black tracking-[0.2em] transition-all duration-300 uppercase italic whitespace-nowrap',
                activeTab === tab.id
                  ? 'bg-background text-primary shadow-lg shadow-black/5 scale-100'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5 scale-95',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {MOCK_DATA[activeTab]?.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
