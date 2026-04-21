'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import { cn } from '@/lib/utils';

interface Column<T> {
  key: keyof T | string;
  header: string;
  cell?: (item: T) => React.ReactNode;
  width?: string;
}

interface DataTableProps<T extends object> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  canEdit?: boolean;
  canDelete?: boolean;
  basePath?: string;
  idKey?: keyof T;
  statusKey?: keyof T;
  emptyMessage?: string;
}

export function DataTable<T extends object>({
  data,
  columns,
  isLoading,
  onEdit,
  onDelete,
  canEdit = true,
  canDelete = true,
  basePath,
  idKey = 'id' as keyof T,
  statusKey = 'status' as keyof T,
  emptyMessage = 'No data found',
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-md border border-dashed">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-x-auto midnight-border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={String(column.key)} style={{ width: column.width }}>
                {column.header}
              </TableHead>
            ))}
            {(canEdit || canDelete) && (
              <TableHead className="w-[100px]">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={String(item[idKey]) || index}>
              {columns.map((column) => (
                <TableCell key={`${String(item[idKey])}-${String(column.key)}`}>
                  {column.cell ? (
                    column.cell(item)
                  ) : column.key === statusKey ? (
                    <Badge
                      variant={(item as Record<string, unknown>)[column.key as string] ? 'default' : 'secondary'}
                      className={
                        (item as Record<string, unknown>)[column.key as string]
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }
                    >
                      {(item as Record<string, unknown>)[column.key as string] ? 'Active' : 'Inactive'}
                    </Badge>
                  ) : (
                    String((item as Record<string, unknown>)[column.key as string] ?? '-')
                  )}
                </TableCell>
              ))}
              {(canEdit || canDelete) && (
                <TableCell>
                  <div className="flex items-center gap-2">
                    {canEdit && (
                      basePath ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                        >
                          <Link href={`${basePath}/${String(item[idKey])}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit?.(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )
                    )}
                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete?.(item)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
