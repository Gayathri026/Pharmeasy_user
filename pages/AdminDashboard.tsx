import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import { FileText, Package, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import { cartStore } from '@/lib/cartStore';

interface Prescription {
  id: string;
  file_url: string;
  file_name: string;
  status: string;
  notes: string;
  delivery_address: string;
  created_at: string;
  profiles: {
    email: string;
    full_name: string;
    phone: string;
  };
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, isAdmin } = useAuth();
  const { toast } = useToast();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartItemCount, setCartItemCount] = useState(0);

  useEffect(() => {
    const unsubscribe = cartStore.subscribe((items) => {
      const count = items.reduce((sum, item) => sum + item.quantity, 0);
      setCartItemCount(count);
    });
    const initialCount = cartStore.getItemCount();
    setCartItemCount(initialCount);
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      toast({
        title: 'Access Denied',
        description: 'You need admin privileges to access this page',
        variant: 'destructive',
      });
      navigate('/');
    }
  }, [user, isAdmin, authLoading, navigate, toast]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchPrescriptions();
    }
  }, [user, isAdmin]);

  const fetchPrescriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('prescriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch profile data for each prescription
      const prescriptionsWithProfiles = await Promise.all(
        (data || []).map(async (prescription) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email, full_name, phone')
            .eq('id', prescription.user_id)
            .single();
          
          return {
            ...prescription,
            profiles: profile || { email: '', full_name: '', phone: '' },
          };
        })
      );
      
      setPrescriptions(prescriptionsWithProfiles);
    } catch (error: any) {
      console.error('Error fetching prescriptions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load prescriptions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('prescriptions')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Status Updated',
        description: `Prescription ${status}`,
      });

      fetchPrescriptions();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      pending: 'secondary',
      approved: 'default',
      rejected: 'destructive',
    };

    const icons: Record<string, any> = {
      pending: Clock,
      approved: CheckCircle,
      rejected: XCircle,
    };

    const Icon = icons[status] || Clock;

    return (
      <Badge variant={variants[status] || 'default'} className="gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const stats = {
    total: prescriptions.length,
    pending: prescriptions.filter((p) => p.status === 'pending').length,
    approved: prescriptions.filter((p) => p.status === 'approved').length,
    rejected: prescriptions.filter((p) => p.status === 'rejected').length,
  };

  return (
    <div className="min-h-screen bg-background">
      <Header cartItemCount={cartItemCount} />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Prescriptions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Approved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Rejected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            </CardContent>
          </Card>
        </div>

        {/* Prescriptions List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Prescription Submissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {prescriptions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No prescriptions submitted yet
              </p>
            ) : (
              <div className="space-y-4">
                {prescriptions.map((prescription) => (
                  <Card key={prescription.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">
                                {prescription.profiles.full_name || 'Unknown User'}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {prescription.profiles.email}
                              </p>
                              {prescription.profiles.phone && (
                                <p className="text-sm text-muted-foreground">
                                  {prescription.profiles.phone}
                                </p>
                              )}
                            </div>
                            {getStatusBadge(prescription.status)}
                          </div>

                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{prescription.file_name}</span>
                            </div>
                            <div>
                              <p className="font-medium">Delivery Address:</p>
                              <p className="text-muted-foreground">
                                {prescription.delivery_address}
                              </p>
                            </div>
                            {prescription.notes && (
                              <div>
                                <p className="font-medium">Notes:</p>
                                <p className="text-muted-foreground">{prescription.notes}</p>
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground">
                              Submitted: {new Date(prescription.created_at).toLocaleString()}
                            </p>
                          </div>

                          <div className="flex gap-2 pt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(prescription.file_url, '_blank')}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View File
                            </Button>
                            {prescription.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => updateStatus(prescription.id, 'approved')}
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => updateStatus(prescription.id, 'rejected')}
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
