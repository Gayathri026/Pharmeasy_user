// src/components/AdminOrderManagement.tsx
import { useState } from 'react';
import { Order, OrderStatus } from '@/firebase/types';
import { orderService } from '@/firebase/services';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Package, Truck } from 'lucide-react';

interface AdminOrderManagementProps {
    order: Order;
    onUpdate: () => void;
}

const AdminOrderManagement = ({ order, onUpdate }: AdminOrderManagementProps) => {
    const { toast } = useToast();
    const [updating, setUpdating] = useState(false);
    const [status, setStatus] = useState<OrderStatus>(order.status);
    const [note, setNote] = useState('');
    const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || '');

    const statusOptions: { value: OrderStatus; label: string }[] = [
        { value: 'pending', label: 'Pending' },
        { value: 'confirmed', label: 'Confirmed' },
        { value: 'processing', label: 'Processing' },
        { value: 'shipped', label: 'Shipped' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'cancelled', label: 'Cancelled' },
    ];

    const handleUpdateStatus = async () => {
        setUpdating(true);

        try {
            const { error } = await orderService.updateStatus(
                order.id,
                status,
                note || undefined,
                'admin',
                trackingNumber || undefined
            );

            if (error) throw error;

            toast({
                title: 'Success!',
                description: 'Order status updated successfully',
            });

            onUpdate();
            setNote('');
        } catch (error: any) {
            console.error('Error updating order:', error);
            toast({
                title: 'Error',
                description: error.message || 'Failed to update order status',
                variant: 'destructive',
            });
        } finally {
            setUpdating(false);
        }
    };

    return (
        <Card className="border-2 border-primary/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Package className="h-5 w-5" />
                    Update Order Status (Admin)
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label>Order Status</Label>
                    <Select value={status} onValueChange={(value) => setStatus(value as OrderStatus)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            {statusOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {(status === 'shipped' || status === 'delivered') && (
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <Truck className="h-4 w-4" />
                            Tracking Number (Optional)
                        </Label>
                        <Input
                            placeholder="Enter tracking number"
                            value={trackingNumber}
                            onChange={(e) => setTrackingNumber(e.target.value)}
                        />
                    </div>
                )}

                <div className="space-y-2">
                    <Label>Status Update Note</Label>
                    <Textarea
                        placeholder="Add a note about this status change (optional)"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={3}
                    />
                </div>

                <Button
                    onClick={handleUpdateStatus}
                    disabled={updating || status === order.status}
                    className="w-full"
                >
                    {updating ? 'Updating...' : 'Update Order Status'}
                </Button>

                {status === order.status && (
                    <p className="text-sm text-muted-foreground text-center">
                        Select a different status to update
                    </p>
                )}
            </CardContent>
        </Card>
    );
};

export default AdminOrderManagement;