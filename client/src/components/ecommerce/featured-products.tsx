'use client';

import { ProductCard } from './product-card';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MOCK_PRODUCTS = [
  {
    id: '1',
    name: 'Atomecom Quantum Watch',
    price: 25000000,
    category: 'Watch',
    image: '/luxury_watch_product_1771597650327.png', // Placeholder - will need actual move if needed
    isNew: true,
    rating: 4.9,
  },
  {
    id: '2',
    name: 'Nebula Pro Audio',
    price: 12000000,
    category: 'Audio',
    image:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop',
    rating: 4.8,
  },
  {
    id: '3',
    name: 'Titanium X Smartphone',
    price: 45000000,
    category: 'Mobile',
    image:
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1000&auto=format&fit=crop',
    isNew: true,
    rating: 5.0,
  },
  {
    id: '4',
    name: 'Zenith Laptop Pro',
    price: 68000000,
    category: 'Laptop',
    image:
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1000&auto=format&fit=crop',
    rating: 4.7,
  },
];

export function FeaturedProducts() {
  return (
    <section className="py-24 container mx-auto px-4">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
        <div className="space-y-4 max-w-xl">
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic leading-none">
            Sản phẩm <br />
            <span className="text-primary">Tiêu biểu</span>
          </h2>
          <p className="text-muted-foreground font-medium">
            Tuyển tập những thiết bị công nghệ đỉnh cao, kết hợp giữa nghệ thuật
            chế tác và sức mạnh tương lai.
          </p>
        </div>

        <Button
          variant="ghost"
          className="group font-black uppercase text-[10px] tracking-widest gap-2 h-12 px-6 rounded-full border border-border/50"
        >
          Xem tất cả sản phẩm
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {MOCK_PRODUCTS.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <ProductCard {...product} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
