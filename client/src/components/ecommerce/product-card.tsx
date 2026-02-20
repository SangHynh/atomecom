'use client';

import { Heart, ShoppingBag, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  rating?: number;
  isNew?: boolean;
}

export function ProductCard({
  name,
  price,
  image,
  category,
  rating = 5,
  isNew = false,
}: ProductCardProps) {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="group bg-muted/30 rounded-[2rem] border border-border/40 overflow-hidden backdrop-blur-sm transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden bg-black/5">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {isNew && (
            <span className="bg-primary text-primary-foreground text-[10px] font-black uppercase px-3 py-1.5 rounded-full tracking-widest shadow-lg shadow-primary/20">
              New
            </span>
          )}
          <span className="bg-background/80 backdrop-blur-md text-foreground text-[10px] font-black uppercase px-3 py-1.5 rounded-full tracking-widest border border-border/50">
            {category}
          </span>
        </div>

        {/* Favorite Button */}
        <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-background/50 backdrop-blur-md flex items-center justify-center text-muted-foreground hover:text-red-500 transition-all hover:bg-background">
          <Heart className="w-5 h-5" />
        </button>

        {/* Quick Add overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center translate-y-4 group-hover:translate-y-0 transition-transform">
          <Button className="rounded-xl font-bold gap-2">
            <ShoppingBag className="w-4 h-4" />
            Thêm vào giỏ
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-3">
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-base font-bold tracking-tight leading-tight group-hover:text-primary transition-colors">
            {name}
          </h3>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-[10px] font-bold text-muted-foreground">
              {rating}
            </span>
          </div>
        </div>

        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest italic">
              Starting at
            </p>
            <p className="text-xl font-black tracking-tighter text-foreground">
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
              }).format(price)}
            </p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl hover:bg-primary/10 hover:text-primary"
          >
            <Star className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
