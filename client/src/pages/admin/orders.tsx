import AdminLayout from "@/components/admin/admin-layout";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Order {
  id: string;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  competition: string | null;
  quantity: number;
  totalAmount: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

export default function AdminOrders() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
  });

  const filteredOrders = orders?.filter(
    (order) =>
      order.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.competition?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </AdminLayout>
    );
  }

  const totalRevenue = orders?.reduce(
    (sum, order) => sum + parseFloat(order.totalAmount),
    0
  );

  return (
    <AdminLayout>
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground" data-testid="heading-orders">
              Orders & Transactions
            </h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1">View all platform orders</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-sm text-muted-foreground font-medium">Total Orders</p>
            <p className="text-3xl font-bold text-foreground mt-2">{orders?.length || 0}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-sm text-muted-foreground font-medium">Total Revenue</p>
            <p className="text-3xl font-bold text-primary mt-2">
              £{totalRevenue?.toFixed(2) || "0.00"}
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-sm text-muted-foreground font-medium">Completed Orders</p>
            <p className="text-3xl font-bold text-green-500 mt-2">
              {orders?.filter((o) => o.status === "completed").length || 0}
            </p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            placeholder="Search orders by user email or competition..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Order ID
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    User
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Competition
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Quantity
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Payment Method
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders?.map((order) => (
                  <tr key={order.id} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4 text-sm text-muted-foreground font-mono">
                      {order.id.slice(0, 8)}...
                    </td>
                    <td className="py-3 px-4 text-sm text-foreground">
                      {order.user.firstName} {order.user.lastName || order.user.email}
                    </td>
                    <td className="py-3 px-4 text-sm text-foreground">
                      {order.competition || "N/A"}
                    </td>
                    <td className="py-3 px-4 text-sm text-foreground">{order.quantity}</td>
                    <td className="py-3 px-4 text-sm text-primary font-medium">
                      £{parseFloat(order.totalAmount).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-sm text-foreground">
                      {order.paymentMethod}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === "completed"
                            ? "bg-green-500/20 text-green-500"
                            : order.status === "pending"
                            ? "bg-yellow-500/20 text-yellow-500"
                            : "bg-red-500/20 text-red-500"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
