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
import { careersApi } from '@/lib/api';
import type { CareerOpening } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';

export default function CareersPage() {
  const [careers, setCareers] = useState<CareerOpening[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteCareer, setDeleteCareer] = useState<CareerOpening | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const { hasRole } = useAuth();
  const canManage = hasRole(['admin', 'operator']);
  const isAdmin = hasRole(['admin']);

  const fetchCareers = async () => {
    try {
      const data = await careersApi.getAll();
      // Filter to show only active items for non-admins
      const filteredData = isAdmin ? data : data.filter(c => c.status);
      setCareers(filteredData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load job openings',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCareers();
  }, []);

  const handleDelete = async () => {
    if (!deleteCareer) return;

    setIsDeleting(true);
    try {
      await careersApi.delete(deleteCareer.id);
      toast({
        title: 'Success',
        description: 'Job opening deleted successfully',
      });
      fetchCareers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete job opening',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setDeleteCareer(null);
    }
  };

  const handleExport = async (type: 'csv' | 'pdf') => {
    try {
      const blob = type === 'csv' ? await careersApi.exportCsv() : await careersApi.exportPdf();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `careers.${type}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({
        title: 'Success',
        description: `Career openings exported as ${type.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to export as ${type.toUpperCase()}`,
        variant: 'destructive',
      });
    }
  };

  const handleToggleStatus = async (career: CareerOpening) => {
    try {
      await careersApi.toggleStatus(career.id);
      toast({
        title: 'Success',
        description: `Career status toggled successfully`,
      });
      fetchCareers();
    } catch (error: any) {
      console.error('Error toggling career status:', error);
      let errorMessage = 'Failed to toggle career status';
      
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
    { key: 'title', header: 'Title' },
    { key: 'location', header: 'Location' },
    {
      key: 'employmentType',
      header: 'Type',
      cell: (career: CareerOpening) => (
        <Badge variant="secondary">{career.employmentType}</Badge>
      ),
    },
    { key: 'status', header: 'Status' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Career Openings</h1>
          <p className="text-muted-foreground">
            Manage job postings and applications
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
              <Link href="/careers/new">
                <Plus className="mr-2 h-4 w-4" />
                New Opening
              </Link>
            </Button>
          )}
        </div>
      </div>

      <DataTable
        data={careers}
        columns={columns}
        isLoading={isLoading}
        basePath="/careers"
        onDelete={canManage ? setDeleteCareer : undefined}
        onToggleStatus={isAdmin ? handleToggleStatus : undefined}
        canEdit={canManage}
        canDelete={canManage}
        canToggle={isAdmin}
        idKey="id"
        statusKey="status"
        emptyMessage="No job openings found. Create your first opening to get started."
      />

      <AlertDialog open={!!deleteCareer} onOpenChange={() => setDeleteCareer(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the job opening &quot;{deleteCareer?.title}&quot;.
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
