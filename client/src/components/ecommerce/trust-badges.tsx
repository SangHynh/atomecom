'use client';

import { ShieldCheck, Truck, RotateCcw, Headphones } from 'lucide-react';

const BADGES = [
  {
    icon: <Truck className="w-8 h-8" />,
    title: 'Giao hàng hỏa tốc',
    desc: 'Nhận hàng trong vòng 2h tại nội thành.',
  },
  {
    icon: <ShieldCheck className="w-8 h-8" />,
    title: 'Bảo hành chính hãng',
    desc: 'Cam kết 100% hàng chính hãng từ Apple, Samsung.',
  },
  {
    icon: <RotateCcw className="w-8 h-8" />,
    title: 'Đổi trả 30 ngày',
    desc: 'Yên tâm mua sắm với chính sách đổi trả linh hoạt.',
  },
  {
    icon: <Headphones className="w-8 h-8" />,
    title: 'Hỗ trợ 24/7',
    desc: 'Đội ngũ chuyên gia luôn sẵn sàng giải đáp thắc mắc.',
  },
];

export function TrustBadges() {
  return (
    <section className="py-20 border-y border-border/40 bg-muted/10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {BADGES.map((badge, idx) => (
            <div key={idx} className="flex gap-6 group">
              <div className="w-16 h-16 rounded-[1.5rem] bg-background border border-border/50 flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110 transition-all duration-500 shadow-sm group-hover:shadow-primary/20">
                {badge.icon}
              </div>
              <div className="space-y-1">
                <h4 className="font-black uppercase tracking-widest text-[13px] text-foreground italic">
                  {badge.title}
                </h4>
                <p className="text-xs text-muted-foreground font-medium italic leading-relaxed">
                  {badge.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
