'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { servicesApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function NewServicePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', status: true });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await servicesApi.create(form);
      toast({ title: 'Success', description: 'Service created successfully' });
      router.push('/services');
    } catch {
      toast({ title: 'Error', description: 'Failed to create service', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild><Link href="/services"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <div><h1 className="text-3xl font-bold">New Service</h1><p className="text-muted-foreground">Add a new service offering</p></div>
      </div>
      <Card>
        <CardHeader><CardTitle>Service Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2"><Label htmlFor="name">Name</Label><Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /><p className="text-xs text-muted-foreground">2-100 characters</p></div>
            <div className="space-y-2"><Label htmlFor="description">Description</Label><textarea id="description" className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /><p className="text-xs text-muted-foreground">10-500 characters</p></div>
            <div className="flex items-center space-x-2"><Switch id="status" checked={form.status} onCheckedChange={(checked) => setForm({ ...form, status: checked })} /><Label htmlFor="status">Active</Label></div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isSaving}>{isSaving ? 'Creating...' : 'Create Service'}</Button>
              <Button type="button" variant="outline" asChild><Link href="/services">Cancel</Link></Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
