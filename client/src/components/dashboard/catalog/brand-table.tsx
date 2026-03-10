'use client';

import React from 'react';
import {
  Edit,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Brand } from '@atomecom/shared';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface BrandTableProps {
  brands: Brand[];
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  onSort: (field: string) => void;
  onEdit: (brand: Brand) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
  pagination?: {
    totalElements: number;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
}

export function BrandTable({
  brands,
  sortField,
  sortOrder,
  onSort,
  onEdit,
  onDelete,
  isLoading,
  pagination,
}: BrandTableProps) {
  const { t } = useTranslation();

  const SortableHead = ({
    field,
    children,
  }: {
    field: string;
    children: React.ReactNode;
  }) => {
    const isActive = sortField === field;
    return (
      <TableHead
        className="cursor-pointer hover:bg-muted/50 transition-colors py-4 px-4 font-bold text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border/60"
        onClick={() => onSort(field)}
      >
        <div className="flex items-center gap-1.5">
          {children}
          {isActive &&
            (sortOrder === 'asc' ? (
              <ArrowUp className="h-3 w-3" />
            ) : (
              <ArrowDown className="h-3 w-3" />
            ))}
          {!isActive && (
            <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>
      </TableHead>
    );
  };

  return (
    <div className="flex flex-col rounded-2xl border border-border/40 bg-background/60 backdrop-blur-md overflow-hidden shadow-2xl shadow-black/5 ring-1 ring-border/20 flex-1 min-h-0">
      <div className="flex-1 min-h-0 overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-0">
              <SortableHead field="name">
                {t('catalog.brands.table.columns.brand')}
              </SortableHead>
              <SortableHead field="slug">
                {t('catalog.brands.table.columns.slug')}
              </SortableHead>
              <TableHead className="py-4 px-4 text-right font-bold text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border/60">
                {t('catalog.brands.table.columns.actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-border/40">
                  <TableCell className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-xl" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell className="py-3 px-4 text-right">
                    <Skeleton className="h-8 w-20 ml-auto rounded-lg" />
                  </TableCell>
                </TableRow>
              ))
            ) : brands.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {t('catalog.brands.empty.title')}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              brands.map((brand) => (
                <TableRow
                  key={brand.id}
                  className="group hover:bg-primary/5 border-border/30 transition-colors"
                >
                  <TableCell className="py-3.5 px-4">
                    <div className="flex items-center gap-3.5">
                      <Avatar className="h-10 w-10 rounded-xl border border-border/40 shadow-sm">
                        <AvatarImage
                          src={brand.logo}
                          alt={brand.name}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/5 text-primary font-black text-xs">
                          {brand.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-bold text-[14px] text-foreground">
                          {brand.name}
                        </span>
                        <span className="text-[11px] text-muted-foreground uppercase tracking-tight font-medium">
                          {format(new Date(brand.createdAt), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5 px-4 font-mono text-[12px] text-muted-foreground">
                    /{brand.slug}
                  </TableCell>
                  <TableCell className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                        onClick={() => onEdit(brand)}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg hover:bg-rose-600/10 hover:text-rose-600 transition-colors"
                        onClick={() => onDelete(brand.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
