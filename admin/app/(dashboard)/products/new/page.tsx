'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { productsApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function NewProductPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', category: '', description: '', price: 0, image: '', stock: 0, status: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await productsApi.create(form);
      toast({ title: 'Success', description: 'Product created successfully' });
      router.push('/products');
    } catch {
      toast({ title: 'Error', description: 'Failed to create product', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild><Link href="/products"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <div>
          <h1 className="text-3xl font-bold">New Product</h1>
          <p className="text-muted-foreground">Add a new product to the catalog</p>
        </div>
      </div>
      <Card>
        <CardHeader><CardTitle>Product Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="name">Name</Label><Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              <div className="space-y-2"><Label htmlFor="category">Category</Label><Input id="category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required /></div>
              <div className="space-y-2"><Label htmlFor="price">Price ($)</Label><Input id="price" type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} required /></div>
              <div className="space-y-2"><Label htmlFor="stock">Stock</Label><Input id="stock" type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })} required /></div>
              <div className="space-y-2 md:col-span-2"><Label htmlFor="image">Image URL</Label><Input id="image" type="url" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} /></div>
              <div className="space-y-2 md:col-span-2"><Label htmlFor="description">Description</Label><textarea id="description" className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /></div>
              <div className="flex items-center space-x-2"><Switch id="status" checked={form.status} onCheckedChange={(checked) => setForm({ ...form, status: checked })} /><Label htmlFor="status">Active</Label></div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isSaving}>{isSaving ? 'Creating...' : 'Create Product'}</Button>
              <Button type="button" variant="outline" asChild><Link href="/products">Cancel</Link></Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
