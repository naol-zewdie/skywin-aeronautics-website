'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Upload, X, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { postsApi, uploadApi } from '@/lib/api';
import type { Post } from '@/types';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    content: '',
    excerpt: '',
    type: 'blog' as 'news' | 'blog' | 'event',
    author: '',
    coverImage: '',
    imageUrl: '',
    tags: '',
    eventDate: '',
    eventLocation: '',
    status: true,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageInputType, setImageInputType] = useState<'upload' | 'url'>('upload');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await postsApi.getById(params.id as string);
        setPost(data);
        setForm({
          title: data.title,
          content: data.content,
          excerpt: data.excerpt || '',
          type: data.type,
          author: data.author,
          coverImage: data.coverImage || '',
          imageUrl: data.coverImage || '',
          tags: data.tags?.join(', ') || '',
          eventDate: data.eventDate ? data.eventDate.split('T')[0] : '',
          eventLocation: data.eventLocation || '',
          status: data.status,
        });
      } catch {
        toast({ title: 'Error', description: 'Failed to load post', variant: 'destructive' });
        router.push('/posts');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPost();
  }, [params.id, router, toast]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsUploading(true);

    try {
      const uploadResult = await uploadApi.uploadImage(file);
      setForm({ ...form, coverImage: uploadResult.url, imageUrl: '' });
      toast({ title: 'Success', description: 'Image uploaded successfully' });
    } catch {
      toast({ title: 'Error', description: 'Failed to upload image', variant: 'destructive' });
      setSelectedFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, imageUrl: e.target.value, coverImage: e.target.value });
    setSelectedFile(null);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setForm({ ...form, coverImage: '', imageUrl: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { imageUrl, ...postData } = form;
      
      // Build clean data object, only include non-empty optional fields
      const finalData: any = {
        title: postData.title,
        content: postData.content,
        type: postData.type,
        author: postData.author,
      };
      
      if (postData.excerpt) finalData.excerpt = postData.excerpt;
      if (postData.coverImage) finalData.coverImage = postData.coverImage;
      if (postData.tags) finalData.tags = postData.tags.split(',').map((t: string) => t.trim()).filter(t => t);
      if (postData.eventDate && postData.type === 'event') finalData.eventDate = new Date(postData.eventDate).toISOString();
      if (postData.eventLocation && postData.type === 'event') finalData.eventLocation = postData.eventLocation;
      if (postData.status !== undefined) finalData.status = postData.status;
      
      await postsApi.update(params.id as string, finalData);
      toast({ title: 'Success', description: 'Post updated successfully' });
      router.push('/posts');
    } catch (error: any) {
      console.error('Error updating post:', error);
      let errorMessage = 'Failed to update post';
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/posts">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Post</h1>
          <p className="text-muted-foreground">{post?.title}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Post Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
                <p className="text-xs text-muted-foreground">2-200 characters</p>
              </div>

              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(value: 'news' | 'blog' | 'event') => setForm({ ...form, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="news">News</SelectItem>
                    <SelectItem value="blog">Blog</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                  required
                />
                <p className="text-xs text-muted-foreground">Required</p>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  rows={2}
                />
                <p className="text-xs text-muted-foreground">Optional, max 500 characters</p>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={8}
                  required
                />
                <p className="text-xs text-muted-foreground">Minimum 10 characters</p>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Cover Image (Optional)</Label>
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
                    {form.coverImage && (
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
                {form.coverImage && (
                  <div className="mt-2">
                    <img src={form.coverImage.startsWith('http') ? form.coverImage : `http://localhost:3001${form.coverImage}`} alt="Preview" className="max-h-40 rounded-md border" />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="e.g. technology, aviation, news"
                />
                <p className="text-xs text-muted-foreground">Optional</p>
              </div>

              {form.type === 'event' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="eventDate">Event Date</Label>
                    <Input
                      id="eventDate"
                      type="date"
                      value={form.eventDate}
                      onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eventLocation">Event Location</Label>
                    <Input
                      id="eventLocation"
                      value={form.eventLocation}
                      onChange={(e) => setForm({ ...form, eventLocation: e.target.value })}
                    />
                  </div>
                </>
              )}

              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  id="status"
                  checked={form.status}
                  onCheckedChange={(checked) => setForm({ ...form, status: checked })}
                />
                <Label htmlFor="status">Published</Label>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isSaving || isUploading}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/posts">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <footer className="mt-8 border-t border-border bg-muted/30 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold text-foreground">Skywin Aeronautics</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
              <Link href="/products" className="hover:text-primary transition-colors">Products</Link>
              <Link href="/services" className="hover:text-primary transition-colors">Services</Link>
              <Link href="/careers" className="hover:text-primary transition-colors">Careers</Link>
            </div>
            <p className="text-xs text-muted-foreground">© 2026 Skywin Aeronautics. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
