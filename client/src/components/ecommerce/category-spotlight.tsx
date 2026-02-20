'use client';

import { motion } from 'framer-motion';
import {
  Smartphone,
  Watch,
  Laptop,
  Headphones,
  Tv,
  Gamepad2,
} from 'lucide-react';
import Link from 'next/link';

const CATEGORIES = [
  {
    name: 'Smartphone',
    icon: <Smartphone />,
    count: 120,
    color: 'from-blue-500/20 to-cyan-500/20',
  },
  {
    name: 'Smartwatch',
    icon: <Watch />,
    count: 85,
    color: 'from-purple-500/20 to-pink-500/20',
  },
  {
    name: 'Laptop',
    icon: <Laptop />,
    count: 45,
    color: 'from-orange-500/20 to-red-500/20',
  },
  {
    name: 'Audio',
    icon: <Headphones />,
    count: 210,
    color: 'from-emerald-500/20 to-teal-500/20',
  },
  {
    name: 'Accessories',
    icon: <Gamepad2 />,
    count: 320,
    color: 'from-indigo-500/20 to-blue-500/20',
  },
  {
    name: 'Monitors',
    icon: <Tv />,
    count: 30,
    color: 'from-rose-500/20 to-orange-500/20',
  },
];

export function CategorySpotlight() {
  return (
    <section className="py-20 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {CATEGORIES.map((cat, idx) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <Link
                href={`/shop?category=${cat.name.toLowerCase()}`}
                className="group relative flex flex-col items-center p-8 rounded-[2rem] bg-background border border-border/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 overflow-hidden"
              >
                {/* Background Glow */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />

                <div className="relative z-10 w-12 h-12 mb-4 text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all duration-500">
                  {cat.icon}
                </div>

                <h3 className="relative z-10 text-sm font-black uppercase tracking-widest text-foreground">
                  {cat.name}
                </h3>
                <p className="relative z-10 text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-tighter italic">
                  {cat.count} Sản phẩm
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
