'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { productsApi, uploadApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function NewProductPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [form, setForm] = useState({
    name: '', category: '', description: '', price: 0, image: '', imageUrl: '', stock: 0, status: true,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageInputType, setImageInputType] = useState<'upload' | 'url'>('upload');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsUploading(true);

    try {
      const uploadResult = await uploadApi.uploadImage(file);
      setForm({ ...form, image: uploadResult.url, imageUrl: '' });
      toast({ title: 'Success', description: 'Image uploaded successfully' });
    } catch {
      toast({ title: 'Error', description: 'Failed to upload image', variant: 'destructive' });
      setSelectedFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, imageUrl: e.target.value, image: e.target.value });
    setSelectedFile(null);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setForm({ ...form, image: '', imageUrl: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { imageUrl, image, ...data } = form;
      const productData: any = { ...data };
      if (image) {
        productData.image = image;
      }
      await productsApi.create(productData);
      toast({ title: 'Success', description: 'Product created successfully' });
      router.push('/products');
    } catch (error: any) {
      console.error('Error creating product:', error);
      let errorMessage = 'Failed to create product';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data) {
        if (Array.isArray(error.response.data.message)) {
          errorMessage = error.response.data.message.join(', ');
        } else {
          errorMessage = JSON.stringify(error.response.data);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
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
              <div className="space-y-2 md:col-span-2">
                <Label>Image (Optional)</Label>
                <div className="flex gap-2 mb-2">
                  <Button
                    type="button"
                    variant={imageInputType === 'upload' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setImageInputType('upload')}
                  >
                    Upload File
                  </Button>
                  <Button
                    type="button"
                    variant={imageInputType === 'url' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setImageInputType('url')}
                  >
                    Image URL
                  </Button>
                </div>
                {imageInputType === 'upload' ? (
                  <div className="flex gap-2">
                    <Input type="file" accept="image/*" onChange={handleFileSelect} disabled={isUploading} />
                    {form.image && (
                      <Button type="button" variant="outline" size="icon" onClick={handleRemoveImage}><X className="h-4 w-4" /></Button>
                    )}
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input type="url" placeholder="https://example.com/image.jpg" value={form.imageUrl} onChange={handleUrlChange} />
                    {form.imageUrl && (
                      <Button type="button" variant="outline" size="icon" onClick={handleRemoveImage}><X className="h-4 w-4" /></Button>
                    )}
                  </div>
                )}
                {isUploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
                {form.image && (
                  <div className="mt-2">
                    <img src={form.image.startsWith('http') ? form.image : `http://localhost:3001${form.image}`} alt="Preview" className="max-h-40 rounded-md border" />
                  </div>
                )}
              </div>
              <div className="space-y-2 md:col-span-2"><Label htmlFor="description">Description</Label><textarea id="description" className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /></div>
              <div className="flex items-center space-x-2"><Switch id="status" checked={form.status} onCheckedChange={(checked) => setForm({ ...form, status: checked })} /><Label htmlFor="status">Active</Label></div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isSaving || isUploading}>{isSaving ? 'Creating...' : 'Create Product'}</Button>
              <Button type="button" variant="outline" asChild><Link href="/products">Cancel</Link></Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
