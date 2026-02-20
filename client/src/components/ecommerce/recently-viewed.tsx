'use client';

import { ProductCard } from './product-card';
import { motion } from 'framer-motion';

const RECENT_PRODUCTS = [
  {
    id: 'r1',
    name: 'Minimal Wallet',
    price: 1500000,
    category: 'Leather',
    image:
      'https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=1000&auto=format&fit=crop',
    rating: 4.8,
  },
  {
    id: 'r2',
    name: 'Ocean Bottle',
    price: 900000,
    category: 'Home',
    image:
      'https://images.unsplash.com/photo-1602143393494-13e6180630ba?q=80&w=1000&auto=format&fit=crop',
    rating: 4.5,
  },
];

export function RecentlyViewed() {
  return (
    <section className="py-24 container mx-auto px-4 border-t border-border/40">
      <div className="flex flex-col mb-12 space-y-2">
        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic">
          Dành riêng cho bạn
        </p>
        <h2 className="text-2xl md:text-3xl font-black tracking-tighter uppercase italic italic">
          Xem gần đây
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {RECENT_PRODUCTS.map((p, idx) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
          >
            <ProductCard {...p} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
