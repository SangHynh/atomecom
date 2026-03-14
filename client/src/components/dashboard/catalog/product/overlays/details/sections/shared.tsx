import React from 'react';
import { Info, Package, FileText, Search } from 'lucide-react';

export const SECTION_ICON = {
  basic: Info,
  inventory: Package,
  details: FileText,
  seo: Search,
};

export function DetailSection({
  icon: Icon,
  title,
  children,
}: {
  icon: any;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 text-primary">
        <Icon className="h-4 w-4" />
        <h3 className="text-sm font-bold uppercase tracking-wider">{title}</h3>
      </div>
      <div className="pl-6.5 space-y-4">{children}</div>
    </section>
  );
}



