'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Download, FileText, Trash2, Edit, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { postsApi } from '@/lib/api';
import type { Post } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletePost, setDeletePost] = useState<Post | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const { hasRole } = useAuth();

  const canManage = hasRole(['admin', 'operator']);
  const isAdmin = hasRole(['admin']);

  const fetchPosts = async () => {
    try {
      const data = await postsApi.getAll();
      // Filter to show only active items for non-admins
      const filteredData = isAdmin ? data : data.filter(p => p.status);
      setPosts(filteredData);
    } catch (error: any) {
      console.error('Error loading posts:', error);
      let errorMessage = 'Failed to load posts';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async () => {
    if (!deletePost) return;

    setIsDeleting(true);
    try {
      await postsApi.delete(deletePost.id);
      toast({ title: 'Success', description: 'Post deleted successfully' });
      fetchPosts();
    } catch (error: any) {
      console.error('Error deleting post:', error);
      let errorMessage = 'Failed to delete post';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsDeleting(false);
      setDeletePost(null);
    }
  };

  const handleExportCsv = async () => {
    try {
      const blob = await postsApi.exportCsv();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'posts.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast({ title: 'Success', description: 'Posts exported to CSV' });
    } catch (error: any) {
      toast({ title: 'Error', description: 'Failed to export posts', variant: 'destructive' });
    }
  };

  const handleExportPdf = async () => {
    try {
      const blob = await postsApi.exportPdf();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'posts.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast({ title: 'Success', description: 'Posts exported to PDF' });
    } catch (error: any) {
      toast({ title: 'Error', description: 'Failed to export posts', variant: 'destructive' });
    }
  };

  const handleToggleStatus = async (post: Post) => {
    try {
      await postsApi.toggleStatus(post.id);
      toast({ title: 'Success', description: 'Post status toggled successfully' });
      fetchPosts();
    } catch (error: any) {
      console.error('Error toggling post status:', error);
      let errorMessage = 'Failed to toggle post status';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'news': return 'bg-blue-100 text-blue-800';
      case 'blog': return 'bg-green-100 text-green-800';
      case 'event': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const columns = [
    { key: 'title', header: 'Title' },
    { key: 'type', header: 'Type', cell: (post: Post) => (
      <Badge className={getTypeColor(post.type)}>{post.type.toUpperCase()}</Badge>
    )},
    { key: 'author', header: 'Author' },
    { key: 'status', header: 'Status' }, // DataTable handles status with badge automatically
    { key: 'views', header: 'Views' },
    { key: 'eventDate', header: 'Event Date', cell: (post: Post) => (
      post.eventDate ? new Date(post.eventDate).toLocaleDateString() : '-'
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Posts</h1>
          <p className="text-muted-foreground">Manage news, blog posts, and events</p>
        </div>
        <div className="flex gap-2">
          {canManage && (
            <>
              <Button variant="outline" onClick={handleExportCsv}>
                <Download className="mr-2 h-4 w-4" />
                CSV
              </Button>
              <Button variant="outline" onClick={handleExportPdf}>
                <FileText className="mr-2 h-4 w-4" />
                PDF
              </Button>
              <Button asChild>
                <Link href="/posts/new">
                  <Plus className="mr-2 h-4 w-4" />
                  New Post
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <DataTable
            columns={columns}
            data={filteredPosts}
            isLoading={isLoading}
            basePath="/posts"
            onDelete={canManage ? setDeletePost : undefined}
            onToggleStatus={isAdmin ? handleToggleStatus : undefined}
            canEdit={canManage}
            canDelete={canManage}
            canToggle={isAdmin}
            idKey="id"
            statusKey="status"
          />
        </CardContent>
      </Card>

      <AlertDialog open={!!deletePost} onOpenChange={() => setDeletePost(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deletePost?.title}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
