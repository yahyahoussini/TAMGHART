import { useParams } from "react-router-dom";
import { useCustomer } from "@/hooks/useCustomers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const { customer, loading, error } = useCustomer(id || '');

  if (loading) return <div>Loading...</div>;
  if (error || !customer) return <div className="text-red-500">Error: {error || "Customer not found"}</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{customer.full_name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Email:</strong> {customer.email}</p>
          <p><strong>Phone:</strong> {customer.phone}</p>
          <p><strong>Joined:</strong> {new Date(customer.created_at).toLocaleDateString()}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customer.orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    No orders found for this customer.
                  </TableCell>
                </TableRow>
              ) : (
                customer.orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>#{order.code}</TableCell>
                    <TableCell><Badge>{order.status}</Badge></TableCell>
                    <TableCell>{order.total.toFixed(2)} MAD</TableCell>
                    <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
