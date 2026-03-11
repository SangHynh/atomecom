'use client';

import React from 'react';
import { RefreshCcw, ArrowUpDown, Box, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Sku } from '@atomecom/shared';
import { SortableHeader } from '@/components/dashboard/studio/sortable-header';
import { useTableParams } from '@/hooks/use-table-params';

interface InventoryTableProps {
  data: Sku[];
}

export function InventoryTable({ data }: InventoryTableProps) {
  const { params, setParams } = useTableParams();

  const handleSort = (field: string) => {
    const isDesc = params.sortField === field && params.sortOrder === 'desc';
    setParams({
      sortField: field,
      sortOrder: isDesc ? 'asc' : 'desc',
    });
  };

  return (
    <div className="flex-1 min-h-[500px] border border-border/40 bg-background rounded-md overflow-hidden relative shadow-sm">
      <Table>
        <TableHeader className="bg-muted/10">
          <TableRow className="hover:bg-transparent border-border/40">
            <TableHead className="w-[400px] h-14">
              <SortableHeader
                label="Sản phẩm & Phiên bản"
                field="name"
                currentField={params.sortField}
                currentOrder={params.sortOrder as 'asc' | 'desc'}
                onSort={handleSort}
              />
            </TableHead>
            <TableHead className="h-14">
              <SortableHeader
                label="Mã SKU"
                field="skuCode"
                currentField={params.sortField}
                currentOrder={params.sortOrder as 'asc' | 'desc'}
                onSort={handleSort}
              />
            </TableHead>
            <TableHead className="h-14">
              <SortableHeader
                label="Số lượng"
                field="stock"
                currentField={params.sortField}
                currentOrder={params.sortOrder as 'asc' | 'desc'}
                onSort={handleSort}
                className="justify-end"
              />
            </TableHead>
            <TableHead className="h-14">
              <SortableHeader
                label="Giá bán"
                field="price"
                currentField={params.sortField}
                currentOrder={params.sortOrder as 'asc' | 'desc'}
                onSort={handleSort}
                className="justify-end"
              />
            </TableHead>
            <TableHead className="h-14 text-[10px] font-bold uppercase text-muted-foreground/60 tracking-wider text-center">
              Tình trạng
            </TableHead>
            <TableHead className="h-14 text-[10px] font-bold uppercase text-muted-foreground/60 tracking-wider text-center w-[120px]">
              Thao tác
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="relative">
          <AnimatePresence mode="popLayout">
            {data.map((item, idx) => (
              <motion.tr
                key={item.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.03 }}
                className="border-border/20 hover:bg-muted/5 group transition-colors"
              >
                <TableCell className="py-5">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-foreground leading-none">
                      {item.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase opacity-50">
                      {item.attributes
                        .map((a) => `${a.label}: ${a.value}`)
                        .join(' · ') || 'Không có thuộc tính'}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <code className="px-2 py-1 rounded bg-muted/30 text-[10px] font-mono font-bold text-primary group-hover:bg-primary/10 transition-colors uppercase">
                    {item.skuCode}
                  </code>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-3 group/edit">
                    <span className="text-sm font-bold tabular-nums text-muted-foreground/50">
                      —
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-3 group/edit-p">
                    <span className="text-sm font-bold tabular-nums text-foreground">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(item.price.basePrice)}
                    </span>
                    {item.price.salePrice && (
                      <span className="text-[10px] text-rose-500 line-through font-medium">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        }).format(item.price.salePrice)}
                      </span>
                    )}
                    <button className="h-7 w-7 rounded bg-muted/20 opacity-0 group-hover/edit-p:opacity-100 flex items-center justify-center hover:bg-primary hover:text-white transition-all text-muted-foreground">
                      <Coins className="h-3 w-3" />
                    </button>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-center">
                    <Badge
                      className={cn(
                        'h-6 px-2 text-[9px] font-bold uppercase tracking-wider border border-border/10 rounded-md shadow-none',
                        item.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-destructive/5 text-destructive',
                      )}
                    >
                      {item.status === 'ACTIVE' ? 'Đang bán' : 'Ngừng bán'}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-primary hover:bg-primary/10"
                    >
                      <RefreshCcw className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:bg-muted/40"
                    >
                      <ArrowUpDown className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </motion.tr>
            ))}
          </AnimatePresence>
        </TableBody>
      </Table>

      {/* Empty State */}
      {data.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10">
          <div className="text-center space-y-4">
            <div className="h-16 w-16 bg-muted/10 rounded-full flex items-center justify-center mx-auto border border-border/20">
              <Box className="h-8 w-8 text-muted-foreground/20" />
            </div>
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
              Không tìm thấy mã SKU nào
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
