import { useTableParams } from '@/hooks/use-table-params';
import { StudioSearchInput } from '@/components/dashboard/studio/studio-search-input';
import { SlidersHorizontal } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function InventoryFilters() {
  const { params, setParams } = useTableParams();

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8 sticky top-0 bg-background/80 backdrop-blur-md z-20 py-3 border-b border-border/10">
      <StudioSearchInput
        placeholder="Tìm theo tên sản phẩm, mã SKU định danh..."
        value={params.q || ''}
        onChange={(v) => setParams({ q: v })}
        containerClassName="sm:max-w-xl"
      />

      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
        <Select
          value={params.status || 'all'}
          onValueChange={(v) => setParams({ status: v })}
        >
          <SelectTrigger className="h-11 w-48 rounded-md border border-border/10 bg-transparent text-[10px] font-bold uppercase tracking-wide focus:ring-0 focus:border-primary/20 shadow-none px-4 group hover:border-border/20 shrink-0">
            <SlidersHorizontal className="h-3 w-3 mr-2 text-muted-foreground/30 group-hover:text-foreground/60 transition-colors" />
            <SelectValue placeholder="Tình trạng kho" />
          </SelectTrigger>
          <SelectContent className="rounded-sm border-[0.5px] border-border/40 shadow-2xl p-1 bg-background/95 backdrop-blur-xl">
            <SelectItem
              value="all"
              className="text-[10px] font-bold uppercase p-2.5 rounded-sm cursor-pointer"
            >
              Tất cả tình trạng
            </SelectItem>
            <SelectItem
              value="IN_STOCK"
              className="text-[10px] font-bold uppercase p-2.5 rounded-sm cursor-pointer"
            >
              Còn hàng
            </SelectItem>
            <SelectItem
              value="LOW_STOCK"
              className="text-[10px] font-bold uppercase p-2.5 rounded-sm cursor-pointer"
            >
              Sắp hết hàng
            </SelectItem>
            <SelectItem
              value="OUT_OF_STOCK"
              className="text-[10px] font-bold uppercase p-2.5 rounded-sm cursor-pointer"
            >
              Hết hàng
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
