'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';

export default function CareersPage() {
  const [careers, setCareers] = useState<CareerOpening[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteCareer, setDeleteCareer] = useState<CareerOpening | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const fetchCareers = async () => {
    try {
      const data = await careersApi.getAll();
      setCareers(data);
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
          <h1 className="text-3xl font-bold">Careers</h1>
          <p className="text-muted-foreground">
            Manage job openings and applications
          </p>
        </div>
        <Button asChild>
          <Link href="/careers/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Opening
          </Link>
        </Button>
      </div>

      <DataTable
        data={careers}
        columns={columns}
        isLoading={isLoading}
        basePath="/careers"
        onDelete={setDeleteCareer}
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
