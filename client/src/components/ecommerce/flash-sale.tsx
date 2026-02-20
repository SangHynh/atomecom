'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Timer, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export function FlashSale() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 2,
    minutes: 45,
    seconds: 30,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0)
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0)
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-24 container mx-auto px-4">
      <div className="relative rounded-[3rem] bg-gradient-to-br from-rose-600 via-pink-600 to-orange-600 overflow-hidden p-1 px-1">
        <div className="bg-zinc-950 rounded-[2.9rem] p-12 md:p-20 overflow-hidden relative">
          {/* Animated Background Blur */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/20 blur-[100px] rounded-full animate-pulse" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-600/20 blur-[100px] rounded-full animate-pulse delay-700" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500">
                <Zap className="w-4 h-4 fill-current" />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Flash Sale Đang diễn ra
                </span>
              </div>

              <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase italic leading-none">
                GIẢM GIÁ <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400">
                  SIÊU CẤP
                </span>{' '}
                <br />
                ĐẾN 50%
              </h2>

              {/* Countdown */}
              <div className="flex gap-4">
                {[
                  { label: 'Hours', value: timeLeft.hours },
                  { label: 'Min', value: timeLeft.minutes },
                  { label: 'Sec', value: timeLeft.seconds },
                ].map((unit) => (
                  <div key={unit.label} className="flex flex-col items-center">
                    <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl font-black text-white italic shadow-lg">
                      {unit.value.toString().padStart(2, '0')}
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase mt-2 tracking-widest">
                      {unit.label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  size="lg"
                  className="h-14 px-10 rounded-2xl bg-white text-black hover:bg-zinc-200 font-extrabold uppercase text-xs tracking-widest shadow-xl"
                >
                  Mua ngay bây giờ
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  className="h-14 px-6 rounded-2xl text-white font-bold gap-2 group"
                >
                  Xem thêm deal hot
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>

            {/* Product Feature */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              className="relative aspect-square max-w-md mx-auto"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500/40 to-orange-500/40 blur-[80px] rounded-full scale-75" />
              <Image
                src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop"
                alt="Sneaker Deal"
                fill
                className="object-contain drop-shadow-[0_20px_50px_rgba(225,29,72,0.4)]"
              />
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-rose-600 flex flex-col items-center justify-center text-white font-black shadow-2xl animate-bounce">
                <span className="text-xs uppercase">Chỉ còn</span>
                <span className="text-xl">990k</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
