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
import { servicesApi } from '@/lib/api';
import type { Service } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { truncateText } from '@/lib/utils';

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteService, setDeleteService] = useState<Service | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const { hasRole } = useAuth();
  const canManage = hasRole(['admin', 'operator']);
  const isAdmin = hasRole(['admin']);

  const fetchServices = async () => {
    try {
      const data = await servicesApi.getAll();
      // Filter to show only active items for non-admins
      const filteredData = isAdmin ? data : data.filter(s => s.status);
      setServices(filteredData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load services',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleDelete = async () => {
    if (!deleteService) return;

    setIsDeleting(true);
    try {
      await servicesApi.delete(deleteService.id);
      toast({
        title: 'Success',
        description: 'Service deleted successfully',
      });
      fetchServices();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete service',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setDeleteService(null);
    }
  };

  const handleExport = async (type: 'csv' | 'pdf') => {
    try {
      const blob = type === 'csv' ? await servicesApi.exportCsv() : await servicesApi.exportPdf();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `services.${type}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({
        title: 'Success',
        description: `Services exported as ${type.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to export as ${type.toUpperCase()}`,
        variant: 'destructive',
      });
    }
  };

  const handleToggleStatus = async (service: Service) => {
    try {
      await servicesApi.toggleStatus(service.id);
      toast({
        title: 'Success',
        description: `Service status toggled successfully`,
      });
      fetchServices();
    } catch (error: any) {
      console.error('Error toggling service status:', error);
      let errorMessage = 'Failed to toggle service status';
      
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
    { key: 'name', header: 'Name' },
    {
      key: 'description',
      header: 'Description',
      cell: (service: Service) => truncateText(service.description, 60),
    },
    { key: 'status', header: 'Status' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Services</h1>
          <p className="text-muted-foreground">
            Manage your service offerings
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
              <Link href="/services/new">
                <Plus className="mr-2 h-4 w-4" />
                New Service
              </Link>
            </Button>
          )}
        </div>
      </div>

      <DataTable
        data={services}
        columns={columns}
        isLoading={isLoading}
        basePath="/services"
        onDelete={canManage ? setDeleteService : undefined}
        onToggleStatus={isAdmin ? handleToggleStatus : undefined}
        canEdit={canManage}
        canDelete={canManage}
        canToggle={isAdmin}
        idKey="id"
        statusKey="status"
        emptyMessage="No services found. Create your first service to get started."
      />

      <AlertDialog open={!!deleteService} onOpenChange={() => setDeleteService(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the service &quot;{deleteService?.name}&quot;.
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
