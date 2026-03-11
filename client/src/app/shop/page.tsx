'use client';

import { useState } from 'react';
import { EcommerceNavbar } from '@/components/ecommerce/navbar';
import { ProductCard } from '@/components/ecommerce/product-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  LayoutGrid,
  List,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useProducts } from '@/hooks/use-products';
import { useCategories } from '@/hooks/use-categories';
import { Loader2 } from 'lucide-react';

// CATEGORIES dummy data removed
const SORT_OPTIONS = [
  'Mới nhất',
  'Giá: Thấp đến Cao',
  'Giá: Cao đến Thấp',
  'Bán chạy nhất',
];

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const { products, isLoading } = useProducts({
    keyword: searchQuery || undefined,
    limit: 20,
    status: 'PUBLISHED',
  });

  const { categories: apiCategories } = useCategories({ limit: 100 });
  const categoriesList = [
    'Tất cả',
    ...(apiCategories?.map((c) => c.name) || []),
  ];

  const filteredProducts = products;

  return (
    <div className="min-h-screen bg-background selection:bg-primary/10">
      <EcommerceNavbar />

      <main className="pt-32 pb-24 container mx-auto px-4">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b border-border/40 pb-12">
          <div className="space-y-4">
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic">
              Khám phá bộ sưu tập
            </p>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase italic leading-none">
              Cửa hàng <br />
              <span className="text-primary italic">Atomecom</span>
            </h1>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Tìm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 pl-12 rounded-2xl bg-muted/50 border-transparent focus:bg-background transition-all"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-2xl border-border/50 bg-muted/20"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 space-y-12 shrink-0">
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-widest italic text-foreground">
                Danh mục
              </h3>
              <div className="flex flex-col gap-2">
                {categoriesList.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                      'text-sm font-bold flex items-center justify-between p-3 rounded-xl transition-all duration-300',
                      activeCategory === cat
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                        : 'text-muted-foreground hover:bg-muted',
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-widest italic text-foreground">
                Khoảng giá
              </h3>
              <div className="space-y-4">
                <div className="h-2 w-full bg-muted rounded-full relative">
                  <div className="absolute left-0 right-1/4 h-full bg-primary rounded-full" />
                </div>
                <div className="flex justify-between text-[10px] font-black uppercase text-muted-foreground italic">
                  <span>0đ</span>
                  <span>100.000.000đ</span>
                </div>
              </div>
            </div>

            <div className="pt-8 flex flex-col gap-4">
              <div className="rounded-3xl bg-zinc-950 p-8 space-y-4 text-white relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary/20 blur-3xl" />
                <p className="text-[10px] font-black uppercase tracking-widest text-primary italic">
                  Thành viên
                </p>
                <p className="text-sm font-bold">
                  Giảm giá 15% cho đơn hàng đầu tiên.
                </p>
                <Button className="w-full h-10 rounded-xl text-[10px] font-black uppercase tracking-widest">
                  Đăng ký ngay
                </Button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 space-y-8">
            {/* Toolbar */}
            <div className="flex items-center justify-between border-b border-border/40 pb-6">
              <p className="text-xs font-bold text-muted-foreground italic uppercase">
                Hiển thị {filteredProducts.length} kết quả
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-muted/40 p-1 rounded-xl border border-border/40">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg bg-background shadow-sm"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  className="text-xs font-black uppercase tracking-widest gap-2"
                >
                  {SORT_OPTIONS[0]}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((p, idx) => (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                  >
                    <ProductCard
                      id={p.id}
                      name={p.name}
                      price={(p as any).skus?.[0]?.price?.basePrice || 0}
                      category={(p as any).category?.name || 'Sản phẩm'}
                      image={p.thumbnail || '/placeholder.png'}
                      isNew={idx < 2}
                      rating={4.5 + (idx % 1) * 0.5}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Empty State */}
            {filteredProducts.length === 0 && (
              <div className="py-24 text-center space-y-4">
                <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold italic uppercase tracking-tight">
                  Không tìm thấy sản phẩm
                </h3>
                <p className="text-muted-foreground font-medium max-w-sm mx-auto">
                  Vui lòng thử lại với từ khóa hoặc danh mục khác.
                </p>
                <Button
                  variant="outline"
                  className="rounded-xl font-bold"
                  onClick={() => {
                    setActiveCategory('Tất cả');
                    setSearchQuery('');
                  }}
                >
                  Xóa tất cả bộ lọc
                </Button>
              </div>
            )}

            {/* Pagination */}
            {filteredProducts.length > 0 && (
              <div className="pt-12 flex justify-center gap-2">
                {[1, 2, 3].map((i) => (
                  <Button
                    key={i}
                    variant={i === 1 ? 'default' : 'ghost'}
                    className={cn(
                      'w-10 h-10 rounded-xl font-black italic',
                      i === 1 && 'shadow-lg shadow-primary/20',
                    )}
                  >
                    {i}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="py-12 border-t border-border/40">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] italic">
            © 2026 Atomecom Boutique. Built with Premium Standards.
          </p>
        </div>
      </footer>
    </div>
  );
}
