'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { servicesApi, uploadApi } from '@/lib/api';
import type { Service } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function EditServicePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [service, setService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', image: '', imageUrl: '', status: true });
  const [imageInputType, setImageInputType] = useState<'upload' | 'url'>('upload');
  const { user, hasRole } = useAuth();
  const isAdmin = hasRole(['admin']);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const uploadResult = await uploadApi.uploadImage(file);
      setForm({ ...form, image: uploadResult.url, imageUrl: '' });
      toast({ title: 'Success', description: 'Image uploaded successfully' });
    } catch {
      toast({ title: 'Error', description: 'Failed to upload image', variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, imageUrl: e.target.value, image: e.target.value });
  };

  const handleRemoveImage = () => {
    setForm({ ...form, image: '', imageUrl: '' });
  };

  useEffect(() => {
    const fetchService = async () => {
      try {
        const data = await servicesApi.getById(params.id as string);
        
        if (!isAdmin && data.audit?.createdBy !== user?.id) {
          toast({ title: 'Error', description: 'You can only modify your own resources', variant: 'destructive' });
          router.push('/services');
          return;
        }

        setService(data);
        setForm({ name: data.name, description: data.description, image: data.image || '', imageUrl: data.image || '', status: data.status });
      } catch {
        toast({ title: 'Error', description: 'Failed to load service', variant: 'destructive' });
        router.push('/services');
      } finally {
        setIsLoading(false);
      }
    };
    fetchService();
  }, [params.id, router, toast, isAdmin, user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { imageUrl: _ignored, ...data } = form;
      const serviceData = { ...data, image: form.image || null } as Partial<Service>;
      await servicesApi.update(params.id as string, serviceData);
      toast({ title: 'Success', description: 'Service updated successfully' });
      router.push('/services');
    } catch {
      toast({ title: 'Error', description: 'Failed to update service', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="space-y-6"><Skeleton className="h-8 w-48" /><Skeleton className="h-96 w-full" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild><Link href="/services"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <div><h1 className="text-3xl font-bold">Edit Service</h1><p className="text-muted-foreground">{service?.name}</p></div>
      </div>
      <Card>
        <CardHeader><CardTitle>Service Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2"><Label htmlFor="name">Name</Label><Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /><p className="text-xs text-muted-foreground">2-100 characters</p></div>
            <div className="space-y-2"><Label htmlFor="description">Description</Label><Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /><p className="text-xs text-muted-foreground">10-500 characters</p></div>
            <div className="space-y-2">
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
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.image.startsWith('http') ? form.image : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${form.image}`} alt="Preview" className="max-h-40 rounded-md border" />
                </div>
              )}
            </div>
            {isAdmin && (
              <div className="flex items-center space-x-2"><Switch id="status" checked={form.status} onCheckedChange={(checked) => setForm({ ...form, status: checked })} /><Label htmlFor="status">Active</Label></div>
            )}
            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isSaving || isUploading}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
              <Button type="button" variant="outline" asChild><Link href="/services">Cancel</Link></Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
