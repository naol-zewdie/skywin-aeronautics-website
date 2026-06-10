'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { productsApi } from '@/lib/api';
import type { Product } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const { hasRole } = useAuth();
  const canManage = hasRole(['admin', 'operator']);
  const isAdmin = hasRole(['admin']);

  const fetchProducts = async () => {
    try {
      const data = await productsApi.getAll();
      // Filter to show only active items for non-admins
      const filteredData = isAdmin ? data : data.filter(p => p.status);
      setProducts(filteredData);
    } catch (error: any) {
      console.error('Error loading products:', error);
      let errorMessage = 'Failed to load products';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async () => {
    if (!deleteProduct) return;

    setIsDeleting(true);
    try {
      await productsApi.delete(deleteProduct.id);
      toast({
        title: 'Success',
        description: 'Product deleted successfully',
      });
      fetchProducts();
    } catch (error: any) {
      console.error('Error deleting product:', error);
      let errorMessage = 'Failed to delete product';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setDeleteProduct(null);
    }
  };

  const handleExport = async (type: 'csv' | 'pdf') => {
    try {
      const blob = type === 'csv' ? await productsApi.exportCsv() : await productsApi.exportPdf();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `products.${type}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({
        title: 'Success',
        description: `Products exported as ${type.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to export as ${type.toUpperCase()}`,
        variant: 'destructive',
      });
    }
  };

  const handleToggleStatus = async (product: Product) => {
    try {
      await productsApi.toggleStatus(product.id);
      toast({
        title: 'Success',
        description: `Product status toggled successfully`,
      });
      fetchProducts();
    } catch (error: any) {
      console.error('Error toggling product status:', error);
      let errorMessage = 'Failed to toggle product status';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'category', header: 'Category' },
    {
      key: 'price',
      header: 'Price',
      cell: (product: Product) => formatCurrency(product.price),
    },
    {
      key: 'stock',
      header: 'Stock',
      cell: (product: Product) => (
        <span
          className={
            product.stock < 10 ? 'text-red-600 font-medium' : ''
          }
        >
          {product.stock}
        </span>
      ),
    },
    { key: 'status', header: 'Status' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">
            Manage your product catalog
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport('csv')}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => handleExport('pdf')}>
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          {canManage && (
            <Button asChild>
              <Link href="/products/new">
                <Plus className="mr-2 h-4 w-4" />
                New Product
              </Link>
            </Button>
          )}
        </div>
      </div>

      <DataTable
        data={products}
        columns={columns}
        isLoading={isLoading}
        basePath="/products"
        onDelete={canManage ? setDeleteProduct : undefined}
        onToggleStatus={isAdmin ? handleToggleStatus : undefined}
        canEdit={canManage}
        canDelete={canManage}
        canToggle={isAdmin}
        idKey="id"
        statusKey="status"
        emptyMessage="No products found. Create your first product to get started."
      />

      <AlertDialog open={!!deleteProduct} onOpenChange={() => setDeleteProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the product &quot;{deleteProduct?.name}&quot;.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
