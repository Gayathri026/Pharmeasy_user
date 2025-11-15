// src/pages/Orders.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { orderService } from '@/firebase/services';
import { Order, OrderStatus } from '@/firebase/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Header from '@/components/Header';
import { Package, Clock, CheckCircle, Truck, XCircle, Search, Download, ChevronRight, MapPin, Calendar } from 'lucide-react';
import { cartStore } from '@/lib/cartStore';
import { useToast } from '@/hooks/use-toast';

const Orders = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

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
    if (!authLoading && !user) {
      toast({
        title: 'Login Required',
        description: 'Please login to view your orders',
        variant: 'destructive',
      });
      navigate('/auth');
    }
  }, [user, authLoading, navigate, toast]);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  useEffect(() => {
    filterOrders();
  }, [searchQuery, orders]);

  const fetchOrders = async () => {
    if (!user) return;

    try {
      const data = await orderService.getUserOrders(user.uid);
      setOrders(data);
      setFilteredOrders(data);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to load orders',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    if (!searchQuery) {
      setFilteredOrders(orders);
      return;
    }

    const filtered = orders.filter(order =>
      order.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.delivery_address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredOrders(filtered);
  };

  const filterByStatus = (status: string) => {
    if (status === 'all') return orders;
    return orders.filter(order => order.status === status);
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, any> = {
      pending: Clock,
      confirmed: CheckCircle,
      processing: Package,
      shipped: Truck,
      delivered: CheckCircle,
      cancelled: XCircle,
    };
    return icons[status] || Clock;
  };

  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      pending: 'secondary',
      confirmed: 'default',
      processing: 'default',
      shipped: 'default',
      delivered: 'default',
      cancelled: 'destructive',
    };
    return variants[status] || 'secondary';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
      processing: 'bg-purple-100 text-purple-800 border-purple-300',
      shipped: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      delivered: 'bg-green-100 text-green-800 border-green-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const downloadInvoice = (order: Order) => {
    const invoiceContent = `
INVOICE
========================================
Order ID: ${order.id}
Date: ${order.created_at?.toDate ? order.created_at.toDate().toLocaleDateString() : 'N/A'}
Location: ${order.location || 'N/A'}

Items:
${order.items.map(item => `${item.name} x ${item.quantity} - ₹${item.price * item.quantity}`).join('\n')}

Total: ₹${order.total_amount}
Status: ${order.status}

Delivery Address:
${order.delivery_address}

Phone: ${order.phone || 'N/A'}
========================================
    `;

    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${order.id}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your orders...</p>
        </div>
      </div>
    );
  }

  const OrderCard = ({ order }: { order: Order }) => {
    const StatusIcon = getStatusIcon(order.status);

    return (
      <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => openOrderDetails(order)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order #{order.id?.slice(0, 8).toUpperCase()}
              </CardTitle>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-sm text-muted-foreground">
                  {order.created_at?.toDate ? order.created_at.toDate().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'N/A'}
                </p>
                {order.location && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-primary" />
                      <span className="text-sm font-medium text-primary">{order.location}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            <Badge variant={getStatusVariant(order.status)} className="gap-1">
              <StatusIcon className="h-3 w-3" />
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Order Items Preview */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Items ({order.items?.length || 0}):</p>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {order.items?.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="flex-shrink-0 bg-secondary/20 rounded-lg p-2 min-w-[120px]">
                    {item.image && (
                      <img src={item.image} alt={item.name} className="w-full h-16 object-cover rounded mb-1" />
                    )}
                    <p className="text-xs font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                ))}
                {(order.items?.length || 0) > 3 && (
                  <div className="flex-shrink-0 bg-secondary/10 rounded-lg p-2 min-w-[120px] flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">+{(order.items?.length || 0) - 3} more</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold text-primary">₹{order.total_amount?.toFixed(2)}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadInvoice(order);
                  }}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Invoice
                </Button>
                <Button size="sm" variant="default">
                  View Details
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>

            {order.trackingNumber && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm font-medium text-blue-900">Tracking Number:</p>
                <p className="text-sm text-blue-700 font-mono">{order.trackingNumber}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header cartItemCount={cartItemCount} />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Orders</h1>
          <p className="text-muted-foreground">Track and manage your orders</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by order ID, address, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">All ({orders.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({filterByStatus('pending').length})</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed ({filterByStatus('confirmed').length})</TabsTrigger>
            <TabsTrigger value="shipped">Shipped ({filterByStatus('shipped').length})</TabsTrigger>
            <TabsTrigger value="delivered">Delivered ({filterByStatus('delivered').length})</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled ({filterByStatus('cancelled').length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {filteredOrders.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg text-muted-foreground">No orders found</p>
                  {searchQuery && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Try adjusting your search query
                    </p>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </TabsContent>

          {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((status) => (
            <TabsContent key={status} value={status} className="mt-6">
              {filterByStatus(status).length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg text-muted-foreground">
                      No {status} orders
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {filterByStatus(status).map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order #{selectedOrder.id?.slice(0, 8).toUpperCase()}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Status and Location Badge */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={getStatusVariant(selectedOrder.status)}
                      className={`text-base px-4 py-2 ${getStatusColor(selectedOrder.status)}`}
                    >
                      {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    </Badge>
                    {selectedOrder.location && (
                      <Badge variant="outline" className="text-base px-4 py-2">
                        <MapPin className="h-3 w-3 mr-1" />
                        {selectedOrder.location}
                      </Badge>
                    )}
                  </div>
                  <Button onClick={() => downloadInvoice(selectedOrder)} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download Invoice
                  </Button>
                </div>

                {/* Order Timeline */}
                {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Order Timeline</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="relative">
                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                        <div className="space-y-6">
                          {selectedOrder.statusHistory
                            .sort((a, b) => {
                              const timeA = a.timestamp?.toDate ? a.timestamp.toDate().getTime() : 0;
                              const timeB = b.timestamp?.toDate ? b.timestamp.toDate().getTime() : 0;
                              return timeB - timeA;
                            })
                            .map((entry, idx) => {
                              const StatusIcon = getStatusIcon(entry.status);
                              return (
                                <div key={idx} className="relative flex gap-4">
                                  <div className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full ${getStatusColor(entry.status)} border-2`}>
                                    <StatusIcon className="h-4 w-4" />
                                  </div>
                                  <div className="flex-1 pt-0.5">
                                    <p className="font-medium">{entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}</p>
                                    <p className="text-sm text-muted-foreground">{entry.note}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {entry.timestamp?.toDate ? entry.timestamp.toDate().toLocaleString() : 'N/A'}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Items */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Order Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedOrder.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-3 bg-secondary/20 rounded-lg">
                          {item.image && (
                            <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                          )}
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                          </div>
                          <p className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      ))}
                      <div className="flex justify-between items-center pt-3 border-t">
                        <p className="font-semibold">Total</p>
                        <p className="text-2xl font-bold text-primary">₹{selectedOrder.total_amount?.toFixed(2)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Delivery Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Delivery Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedOrder.location && (
                      <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
                        <MapPin className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium text-primary">Delivery Location</p>
                          <p className="text-sm text-muted-foreground">{selectedOrder.location}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Delivery Address</p>
                        <p className="text-sm text-muted-foreground">{selectedOrder.delivery_address}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Estimated Delivery</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedOrder.estimatedDelivery?.toDate
                            ? selectedOrder.estimatedDelivery.toDate().toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                            : 'Not available'}
                        </p>
                      </div>
                    </div>
                    {selectedOrder.trackingNumber && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="font-medium text-blue-900">Tracking Number</p>
                        <p className="text-sm text-blue-700 font-mono mt-1">{selectedOrder.trackingNumber}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;