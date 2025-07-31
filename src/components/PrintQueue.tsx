"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Database } from "@/lib/database.types";
import { 
  Printer, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RotateCcw,
  Pause
} from "lucide-react";

type PrintJob = Database["public"]["Tables"]["print_jobs"]["Row"];
type Printer = Database["public"]["Tables"]["printers"]["Row"];

interface PrintJobWithDetails extends PrintJob {
  orders: {
    id: number;
    customer_name: string;
    table: { table_number: string } | null;
  } | null;
  printers: {
    name: string;
    type: string;
    status: string | null;
  } | null;
}

interface PrintQueueProps {
  restaurantId: string;
}

const STATUS_CONFIG = {
  pending: { 
    icon: Clock, 
    color: "text-yellow-600", 
    bgColor: "bg-yellow-50 border-yellow-200", 
    label: "Pendiente" 
  },
  printing: { 
    icon: Printer, 
    color: "text-blue-600", 
    bgColor: "bg-blue-50 border-blue-200", 
    label: "Imprimiendo" 
  },
  completed: { 
    icon: CheckCircle, 
    color: "text-green-600", 
    bgColor: "bg-green-50 border-green-200", 
    label: "Completado" 
  },
  failed: { 
    icon: XCircle, 
    color: "text-red-600", 
    bgColor: "bg-red-50 border-red-200", 
    label: "Falló" 
  },
  cancelled: { 
    icon: Pause, 
    color: "text-gray-600", 
    bgColor: "bg-gray-50 border-gray-200", 
    label: "Cancelado" 
  }
};

export default function PrintQueue({ restaurantId }: PrintQueueProps) {
  const supabase = createClient();
  const [printJobs, setPrintJobs] = useState<PrintJobWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'failed'>('all');

  useEffect(() => {
    fetchPrintJobs();
    setupRealtimeSubscription();
  }, [restaurantId]);

  const fetchPrintJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('print_jobs')
        .select(`
          *,
          orders!inner(id, customer_name, table:tables(table_number)),
          printers!inner(name, type, status, restaurant_id)
        `)
        .eq('printers.restaurant_id', restaurantId)
        .gte('requested_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
        .order('requested_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setPrintJobs(data as PrintJobWithDetails[]);
    } catch (error) {
      console.error('Error fetching print jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('print_jobs_changes')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'print_jobs' 
        },
        () => {
          fetchPrintJobs(); // Refresh data on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleRetryPrintJob = async (jobId: string) => {
    try {
      const { error } = await supabase
        .from('print_jobs')
        .update({ 
          status: 'pending',
          retry_count: supabase.raw('retry_count + 1'),
          error_message: null
        })
        .eq('id', jobId);

      if (error) throw error;
      
      // The realtime subscription will update the UI
    } catch (error) {
      console.error('Error retrying print job:', error);
      alert('Error al reintentar impresión');
    }
  };

  const handleCancelPrintJob = async (jobId: string) => {
    try {
      const { error } = await supabase
        .from('print_jobs')
        .update({ status: 'cancelled' })
        .eq('id', jobId);

      if (error) throw error;
    } catch (error) {
      console.error('Error cancelling print job:', error);
      alert('Error al cancelar impresión');
    }
  };

  const filteredJobs = printJobs.filter(job => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'pending') return job.status === 'pending' || job.status === 'printing';
    if (activeFilter === 'failed') return job.status === 'failed';
    return true;
  });

  const formatTimeAgo = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Cola de Impresión</h3>
          <div className="flex space-x-2">
            {(['all', 'pending', 'failed'] as const).map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  activeFilter === filter
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {filter === 'all' ? 'Todos' : filter === 'pending' ? 'Activos' : 'Fallidos'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {filteredJobs.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <Printer size={32} className="mx-auto mb-2 text-gray-400" />
            <p>No hay trabajos de impresión</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredJobs.map((job) => {
              const StatusIcon = STATUS_CONFIG[job.status as keyof typeof STATUS_CONFIG]?.icon || Clock;
              const statusConfig = STATUS_CONFIG[job.status as keyof typeof STATUS_CONFIG];
              
              return (
                <div key={job.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${statusConfig?.bgColor || 'bg-gray-50'}`}>
                        <StatusIcon size={16} className={statusConfig?.color || 'text-gray-600'} />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">
                            Orden #{job.orders?.id}
                          </span>
                          <span className="text-sm text-gray-500">
                            Mesa {job.orders?.table?.table_number}
                          </span>
                          <span className="text-sm text-gray-500">
                            • {job.orders?.customer_name}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-sm text-gray-600">
                            {job.printers?.name} ({job.print_type})
                          </span>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${statusConfig?.bgColor} ${statusConfig?.color}`}>
                            {statusConfig?.label}
                          </span>
                        </div>
                        {job.error_message && (
                          <p className="text-sm text-red-600 mt-1">
                            {job.error_message}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTimeAgo(job.requested_at)} • 
                          {job.retry_count > 0 && ` Reintentos: ${job.retry_count}`}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      {job.status === 'failed' && job.retry_count < job.max_retries && (
                        <button
                          onClick={() => handleRetryPrintJob(job.id)}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                          title="Reintentar"
                        >
                          <RotateCcw size={14} />
                        </button>
                      )}
                      {(job.status === 'pending' || job.status === 'printing') && (
                        <button
                          onClick={() => handleCancelPrintJob(job.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                          title="Cancelar"
                        >
                          <XCircle size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}