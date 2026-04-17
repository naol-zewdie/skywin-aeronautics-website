'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { usersApi } from '@/lib/api';
import type { User } from '@/types';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({ fullName: '', email: '', role: 'viewer' as 'admin' | 'it' | 'hr' | 'viewer', status: true });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await usersApi.getById(params.id as string);
        setUser(data);
        setForm({ fullName: data.fullName, email: data.email, role: data.role, status: data.status });
      } catch {
        toast({ title: 'Error', description: 'Failed to load user', variant: 'destructive' });
        router.push('/users');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [params.id, router, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await usersApi.update(params.id as string, form);
      toast({ title: 'Success', description: 'User updated successfully' });
      router.push('/users');
    } catch {
      toast({ title: 'Error', description: 'Failed to update user', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="space-y-6"><Skeleton className="h-8 w-48" /><Skeleton className="h-96 w-full" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild><Link href="/users"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <div><h1 className="text-3xl font-bold">Edit User</h1><p className="text-muted-foreground">{user?.fullName}</p></div>
      </div>
      <Card>
        <CardHeader><CardTitle>User Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="fullName">Full Name</Label><Input id="fullName" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required /></div>
              <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={form.role} onValueChange={(value: any) => setForm({ ...form, role: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="it">IT</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2 pt-6"><Switch id="status" checked={form.status} onCheckedChange={(checked) => setForm({ ...form, status: checked })} /><Label htmlFor="status">Active</Label></div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
              <Button type="button" variant="outline" asChild><Link href="/users">Cancel</Link></Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
