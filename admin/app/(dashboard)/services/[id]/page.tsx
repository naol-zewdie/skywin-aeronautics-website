'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { servicesApi } from '@/lib/api';
import type { Service } from '@/types';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function EditServicePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [service, setService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', status: true });

  useEffect(() => {
    const fetchService = async () => {
      try {
        const data = await servicesApi.getById(params.id as string);
        setService(data);
        setForm({ name: data.name, description: data.description, status: data.status });
      } catch {
        toast({ title: 'Error', description: 'Failed to load service', variant: 'destructive' });
        router.push('/services');
      } finally {
        setIsLoading(false);
      }
    };
    fetchService();
  }, [params.id, router, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await servicesApi.update(params.id as string, form);
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
            <div className="space-y-2"><Label htmlFor="name">Name</Label><Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
            <div className="space-y-2"><Label htmlFor="description">Description</Label><textarea id="description" className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /></div>
            <div className="flex items-center space-x-2"><Switch id="status" checked={form.status} onCheckedChange={(checked) => setForm({ ...form, status: checked })} /><Label htmlFor="status">Active</Label></div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
              <Button type="button" variant="outline" asChild><Link href="/services">Cancel</Link></Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
