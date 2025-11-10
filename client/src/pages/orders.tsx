import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Link, useLocation } from "wouter";
import { Transaction, User, Ticket, Competition } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { 
  DollarSign, ShoppingCart, Gift, Users, ArrowUpCircle, ArrowDownCircle, 
  ExternalLink, Filter, Copy, MapPin, CheckCircle, Wallet as WalletIcon,
  FileText, Award, UserCircle, Home, Sparkles
} from "lucide-react";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OrderDetailsDialog } from "@/components/order-details-dialog";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const getTransactionIcon = (type: string) => {
  switch (type) {
    case "deposit":
      return <ArrowUpCircle className="h-4 w-4 text-green-500" />;
    case "withdrawal":
      return <ArrowDownCircle className="h-4 w-4 text-red-500" />;
    case "purchase":
      return <ShoppingCart className="h-4 w-4 text-blue-500" />;
    case "prize":
      return <Gift className="h-4 w-4 text-yellow-500" />;
    case "referral":
      return <Users className="h-4 w-4 text-purple-500" />;
    default:
      return <DollarSign className="h-4 w-4 text-gray-500" />;
  }
};

const getTransactionTypeBadge = (type: string) => {
  const colors: Record<string, string> = {
    deposit: "bg-green-500/10 text-green-500 border-green-500/20",
    withdrawal: "bg-red-500/10 text-red-500 border-red-500/20",
    purchase: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    prize: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    referral: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${colors[type] || "bg-gray-500/10 text-gray-500 border-gray-500/20"}`}>
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  );
};

interface ReferralStats {
  totalReferrals: number;
  totalEarned: string;
  referrals: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    createdAt: Date;
  }>;
}

interface GroupedEntry {
  competition: Competition;
  tickets: Ticket[];
}

interface OrderWithCompetition {
  competitions: {
    title: string;
    imageUrl: string;
    ticketPrice: string;
    type: string;
  };
  orders: {
    id: string;
    competitionId: string;
    quantity: number;
    totalAmount: string;
    paymentMethod: string;
    walletAmount: string;
    pointsAmount: string;
    cashflowsAmount: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
  tickets?: Ticket[];
  remainingPlays?: number;
}

export default function Orders() {
   const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth() as { isAuthenticated: boolean; isLoading: boolean; user: User | null };
    const [location] = useLocation();

  const [addressForm, setAddressForm] = useState({
    street: "",
    city: "",
    postcode: "",
    country: "United Kingdom",
  });
  const [selectedOrder, setSelectedOrder] = useState<OrderWithCompetition | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 15;

  
  const { data: orders = [] } = useQuery<OrderWithCompetition[]>({
    queryKey: ["/api/user/orders"],
    enabled: isAuthenticated,
  });

 



  // Orders pagination
  const incompleteGames = orders.filter(
    (order) => 
      (order.competitions?.type === 'spin' || order.competitions?.type === 'scratch') &&
      order.orders.status === 'completed' &&
      (order.remainingPlays || 0) > 0
  );

  const completedOrders = orders.filter(
    (order) => 
      !((order.competitions?.type === 'spin' || order.competitions?.type === 'scratch') &&
        order.orders.status === 'completed' &&
        (order.remainingPlays || 0) > 0)
  );

  const totalPages = Math.ceil(completedOrders.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const currentOrders = completedOrders.slice(startIndex, startIndex + ordersPerPage);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

 

  const handleSaveAddress = () => {
    if (!addressForm.street || !addressForm.city || !addressForm.postcode) {
      toast({
        title: "Invalid Address",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Address Management Coming Soon",
      description: "This feature will be available in a future update",
      variant: "default",
    });
  };



  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const routeToTab: Record<string, string> = {
  "/wallet": "wallet",
  "/orders": "orders",
  "/entries": "entries",
  "/ringtone-points": "points",
  "/referral": "referral",
  "/account": "account",
  "/address": "address",
};

const activeTab = routeToTab[location] ; 

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Premium Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 bg-clip-text text-transparent" data-testid="heading-account">
              MY ACCOUNT
            </h1>
            <div className="flex items-center justify-center gap-3 text-gray-400">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              <p className="text-sm">Manage your competitions, rewards & settings</p>
              <Sparkles className="h-4 w-4 text-yellow-500" />
            </div>
          </div>

          {/* Premium Tabbed Interface */}
          <Tabs value={activeTab} className="w-full">
            <TabsList className="grid w-full h-full grid-cols-4 md:grid-cols-7 gap-2 bg-zinc-900/50 border border-yellow-500/20 p-2 rounded-xl mb-12 relative z-10" data-testid="tabs-account">
              <Link href="/wallet" className="contents">
                <TabsTrigger 
                  value="wallet" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-600 data-[state=active]:to-yellow-500 data-[state=active]:text-black data-[state=active]:shadow-lg data-[state=active]:shadow-yellow-500/50 transition-all text-xs sm:text-sm flex-col sm:flex-row gap-1 py-3"
                  data-testid="tab-wallet"
                >
                  <WalletIcon className="h-4 w-4" />
                  <span>Wallet</span>
                </TabsTrigger>
              </Link>
              
              <Link href="/orders" className="contents">
                <TabsTrigger 
                  value="orders"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-600 data-[state=active]:to-yellow-500 data-[state=active]:text-black data-[state=active]:shadow-lg data-[state=active]:shadow-yellow-500/50 transition-all text-xs sm:text-sm flex-col sm:flex-row gap-1 py-3"
                  data-testid="tab-orders"
                >
                  <FileText className="h-4 w-4" />
                  <span>Orders</span>
                </TabsTrigger>
              </Link>
              
              <Link href="/entries" className="contents">
                <TabsTrigger 
                  value="entries"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-600 data-[state=active]:to-yellow-500 data-[state=active]:text-black data-[state=active]:shadow-lg data-[state=active]:shadow-yellow-500/50 transition-all text-xs sm:text-sm flex-col sm:flex-row gap-1 py-3"
                  data-testid="tab-entries"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>Entries</span>
                </TabsTrigger>
              </Link>
              
              <Link href="/ringtone-points" className="contents">
                <TabsTrigger 
                  value="points"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-600 data-[state=active]:to-yellow-500 data-[state=active]:text-black data-[state=active]:shadow-lg data-[state=active]:shadow-yellow-500/50 transition-all text-xs sm:text-sm flex-col sm:flex-row gap-1 py-3"
                  data-testid="tab-points"
                >
                  <Award className="h-4 w-4" />
                  <span>Points</span>
                </TabsTrigger>
              </Link>
              
              <Link href="/referral" className="contents">
                <TabsTrigger 
                  value="referral"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-600 data-[state=active]:to-yellow-500 data-[state=active]:text-black data-[state=active]:shadow-lg data-[state=active]:shadow-yellow-500/50 transition-all text-xs sm:text-sm flex-col sm:flex-row gap-1 py-3"
                  data-testid="tab-referral"
                >
                  <Users className="h-4 w-4" />
                  <span>Referral</span>
                </TabsTrigger>
              </Link>
              
              <Link href="/account" className="contents">
                <TabsTrigger 
                  value="account"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-600 data-[state=active]:to-yellow-500 data-[state=active]:text-black data-[state=active]:shadow-lg data-[state=active]:shadow-yellow-500/50 transition-all text-xs sm:text-sm flex-col sm:flex-row gap-1 py-3"
                  data-testid="tab-account"
                >
                  <UserCircle className="h-4 w-4" />
                  <span>Account</span>
                </TabsTrigger>
              </Link>
              
              <Link href="/address" className="contents">
                <TabsTrigger 
                  value="address"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-600 data-[state=active]:to-yellow-500 data-[state=active]:text-black data-[state=active]:shadow-lg data-[state=active]:shadow-yellow-500/50 transition-all text-xs sm:text-sm flex-col sm:flex-row gap-1 py-3"
                  data-testid="tab-address"
                >
                  <Home className="h-4 w-4" />
                  <span>Address</span>
                </TabsTrigger>
              </Link>
            </TabsList>


            {/* ORDERS TAB */}
            <TabsContent value="orders" className="space-y-6 pt-12 relative z-0" data-testid="content-orders">
              {/* Incomplete Games */}
              {incompleteGames.length > 0 && (
                <Card className="bg-gradient-to-br from-yellow-900/20 via-zinc-900 to-zinc-900 border-yellow-500/40 shadow-xl shadow-yellow-500/20">
                  <CardHeader className="border-b border-yellow-500/30">
                    <CardTitle className="text-2xl text-yellow-400 flex items-center gap-2">
                      <span>🎮</span> GAMES IN PROGRESS
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {incompleteGames.map((order) => (
                        <div
                          key={order.orders.id}
                          className="bg-black/50 rounded-lg border border-yellow-500/20 p-4 hover:border-yellow-500/40 transition-all transform hover:scale-105"
                        >
                          <div className="flex items-center space-x-3 mb-3">
                            {order.competitions?.imageUrl && (
                              <img
                                src={order.competitions.imageUrl}
                                alt={order.competitions?.title || "Competition"}
                                className="w-16 h-16 rounded-lg object-cover shadow-lg"
                              />
                            )}
                            <div className="flex-1">
                              <h3 className="font-semibold text-sm text-white line-clamp-2">
                                {order.competitions?.title || "Unknown Competition"}
                              </h3>
                              <p className="text-xs text-gray-400">
                                {order.competitions?.type === 'spin' ? 'Spin Wheel' : 'Scratch Card'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="bg-yellow-500/10 rounded-lg p-3 mb-3 border border-yellow-500/20">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs text-gray-400">Remaining:</span>
                              <span className="text-xl font-bold text-yellow-400">
                                {order.remainingPlays}/{order.orders.quantity}
                              </span>
                            </div>
                            <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-yellow-600 to-yellow-400 h-full transition-all shadow-lg shadow-yellow-500/50"
                                style={{
                                  width: `${((order.remainingPlays || 0) / order.orders.quantity) * 100}%`,
                                }}
                              />
                            </div>
                          </div>

                          <Link
                            href={
                              order.competitions?.type === 'spin'
                                ? `/spin/${order.orders.competitionId}/${order.orders.id}`
                                : `/scratch/${order.orders.competitionId}/${order.orders.id}`
                            }
                            className="block"
                          >
                            <button
                              className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-yellow-500/50"
                              data-testid={`button-resume-${order.orders.id}`}
                            >
                              Resume Game
                            </button>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Past Orders */}
              <Card className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 border-yellow-500/30 shadow-xl shadow-yellow-500/10">
                <CardHeader className="border-b border-yellow-500/20">
                  <CardTitle className="text-2xl text-yellow-400">Past Orders</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {orders.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-400 text-lg mb-4" data-testid="text-no-orders">
                        No orders yet
                      </p>
                      <Link href="/">
                        <button className="bg-gradient-to-r from-yellow-600 to-yellow-500 text-black px-6 py-3 rounded-lg font-bold hover:from-yellow-500 hover:to-yellow-400 transition-all transform hover:scale-105 shadow-lg shadow-yellow-500/50">
                          Browse Competitions
                        </button>
                      </Link>
                    </div>
                  ) : (
                    <>
                      {/* Desktop Table View */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-yellow-500/20">
                              <th className="text-left py-4 px-4 font-semibold text-yellow-400">Order</th>
                              <th className="text-left py-4 px-4 font-semibold text-yellow-400">Date</th>
                              <th className="text-left py-4 px-4 font-semibold text-yellow-400">Status</th>
                              <th className="text-left py-4 px-4 font-semibold text-yellow-400">Total</th>
                              <th className="text-left py-4 px-4 font-semibold text-yellow-400">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentOrders.map((order) => (
                              <tr key={order.orders.id} className="border-b border-yellow-500/10 hover:bg-yellow-500/5 transition-colors">
                                <td className="py-4 px-4">
                                  <div className="flex items-center space-x-3">
                                    {order.competitions?.imageUrl && (
                                      <img 
                                        src={order.competitions.imageUrl} 
                                        alt={order.competitions.title}
                                        className="w-12 h-12 rounded-lg object-cover shadow-md"
                                      />
                                    )}
                                    <div>
                                      <p className="font-medium text-white">
                                        #{order.orders.id.slice(-8).toUpperCase()}
                                      </p>
                                      <p className="text-sm text-gray-400 line-clamp-1">
                                        {order.competitions?.title || 'Competition'}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-4 px-4 text-sm text-gray-400">
                                  {new Date(order.orders.createdAt).toLocaleDateString()}
                                </td>
                                <td className="py-4 px-4">
                                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                                    order.orders.status === 'completed' 
                                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                      : order.orders.status === 'pending'
                                      ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                  }`}>
                                    {order.orders.status.charAt(0).toUpperCase() + order.orders.status.slice(1)}
                                  </span>
                                </td>
                                <td className="py-4 px-4 font-bold text-yellow-400">
                                  £{parseFloat(order.orders.totalAmount).toFixed(2)}
                                </td>
                                <td className="py-4 px-4">
                                  <button 
                                    onClick={() => {
                                      setSelectedOrder(order);
                                      setDialogOpen(true);
                                    }}
                                    className="bg-gradient-to-r from-yellow-600 to-yellow-500 text-black px-4 py-2 rounded-lg text-sm font-bold hover:from-yellow-500 hover:to-yellow-400 transition-all"
                                    data-testid={`button-view-order-${order.orders.id}`}
                                  >
                                    VIEW
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Card View */}
                      <div className="md:hidden space-y-4">
                        {currentOrders.map((order) => (
                          <div
                            key={order.orders.id}
                            className="bg-black/30 rounded-lg border border-yellow-500/20 p-4 space-y-3"
                          >
                            <div className="flex items-start gap-3">
                              {order.competitions?.imageUrl && (
                                <img 
                                  src={order.competitions.imageUrl} 
                                  alt={order.competitions.title}
                                  className="w-16 h-16 rounded-lg object-cover shadow-md flex-shrink-0"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-white text-sm">
                                  #{order.orders.id.slice(-8).toUpperCase()}
                                </p>
                                <p className="text-sm text-gray-400 line-clamp-2">
                                  {order.competitions?.title || 'Competition'}
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-400 text-xs mb-1">Date</p>
                                <p className="text-white font-medium">
                                  {new Date(order.orders.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-400 text-xs mb-1">Total</p>
                                <p className="text-yellow-400 font-bold">
                                  £{parseFloat(order.orders.totalAmount).toFixed(2)}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between gap-3">
                              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                                order.orders.status === 'completed' 
                                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                  : order.orders.status === 'pending'
                                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
                              }`}>
                                {order.orders.status.charAt(0).toUpperCase() + order.orders.status.slice(1)}
                              </span>
                              <button 
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setDialogOpen(true);
                                }}
                                className="bg-gradient-to-r from-yellow-600 to-yellow-500 text-black px-4 py-2 rounded-lg text-sm font-bold hover:from-yellow-500 hover:to-yellow-400 transition-all flex-shrink-0"
                                data-testid={`button-view-order-${order.orders.id}`}
                              >
                                VIEW
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {orders.length > ordersPerPage && (
                        <div className="flex justify-center items-center gap-4 mt-6">
                          <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 rounded-lg border border-yellow-500/30 hover:bg-yellow-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
                          >
                            Previous
                          </button>
                          <span className="text-sm text-gray-400">
                            Page {currentPage} of {totalPages}
                          </span>
                          <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 rounded-lg border border-yellow-500/30 hover:bg-yellow-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
           
          </Tabs>
        </div>
      </div>

      <OrderDetailsDialog 
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        order={selectedOrder}
      />

      <Footer />
    </div>
  );
}
