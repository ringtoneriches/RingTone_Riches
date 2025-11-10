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

// Modals for Account Tab
function UpdateProfileModal({ user }: { user: any }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    email: user?.email || "",
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    dateOfBirth: user?.dateOfBirth || "",
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("/api/auth/user", "PUT", form);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Profile updated successfully!" });
      setOpen(false);
    },
    onError: (err: any) => {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: err.message || "Something went wrong",
      });
    },
  });

  return (
    <>
      <button
        className="w-full text-left px-4 py-2 rounded-lg hover:bg-yellow-500/10 transition-colors text-sm"
        onClick={() => setOpen(true)}
        data-testid="button-update-profile"
      >
        Update Profile
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-zinc-900 border-yellow-500/20">
          <DialogHeader>
            <DialogTitle className="text-yellow-400">Update Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="bg-black/50 border-yellow-500/20"
              />
            </div>
            <div>
              <Label>First Name</Label>
              <Input
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="bg-black/50 border-yellow-500/20"
              />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="bg-black/50 border-yellow-500/20"
              />
            </div>
            <div>
              <Label>Date of Birth</Label>
              <Input
                type="date"
                value={form.dateOfBirth || ""}
                onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                className="bg-black/50 border-yellow-500/20"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
              className="bg-gradient-to-r from-yellow-600 to-yellow-500 text-black hover:from-yellow-500 hover:to-yellow-400"
            >
              {mutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ChangePasswordModal() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("/api/auth/user", "PUT", { password });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Password updated successfully!" });
      setPassword("");
      setOpen(false);
    },
    onError: (err: any) => {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: err.message || "Something went wrong",
      });
    },
  });

  return (
    <>
      <button
        className="w-full text-left px-4 py-2 rounded-lg hover:bg-yellow-500/10 transition-colors text-sm"
        onClick={() => setOpen(true)}
        data-testid="button-change-password"
      >
        Change Password
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-zinc-900 border-yellow-500/20">
          <DialogHeader>
            <DialogTitle className="text-yellow-400">Change Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>New Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-black/50 border-yellow-500/20"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending || !password}
              className="bg-gradient-to-r from-yellow-600 to-yellow-500 text-black hover:from-yellow-500 hover:to-yellow-400"
            >
              {mutation.isPending ? "Updating..." : "Update Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}



export default function RingtonePoints() {
  const { toast } = useToast();
   const { isAuthenticated, isLoading, user } = useAuth() as { isAuthenticated: boolean; isLoading: boolean; user: User | null };
   const queryClient = useQueryClient();
   const [topUpAmount, setTopUpAmount] = useState<string>("10");
   const [filterType, setFilterType] = useState<string>("all");
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
 
   const { data: transactions = [] } = useQuery<Transaction[]>({
     queryKey: ["/api/user/transactions"],
     enabled: isAuthenticated,
   });
 
   const { data: tickets = [] } = useQuery<Ticket[]>({
     queryKey: ["/api/user/tickets"],
     enabled: isAuthenticated,
   });
 
   const { data: competitions = [] } = useQuery<Competition[]>({
     queryKey: ["/api/competitions"],
     enabled: isAuthenticated,
   });
 
   const { data: referralCodeData } = useQuery<{ referralCode: string }>({
     queryKey: ["/api/user/referral-code"],
     enabled: isAuthenticated,
   });
 
   const { data: referralStats } = useQuery<ReferralStats>({
     queryKey: ["/api/user/referral-stats"],
     enabled: isAuthenticated,
   });
 
   const { data: orders = [] } = useQuery<OrderWithCompetition[]>({
     queryKey: ["/api/user/orders"],
     enabled: isAuthenticated,
   });
 
   const filteredTransactions = filterType === "all"
     ? transactions
     : transactions.filter(t => t.type === filterType);
 
   // RingTone Points transactions
   const pointsTransactions = transactions
     .filter((t) => 
       t.description?.toLowerCase().includes("ringtone") || 
       t.description?.toLowerCase().includes("points")
     )
     .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
 
   const ringtonePoints = user?.ringtonePoints || 0;
 
   // Group tickets by competition
   const competitionMap = new Map(competitions.map(c => [c.id, c]));
   const groupMap = new Map<string, GroupedEntry>();
 
   tickets.forEach(ticket => {
     const competition = competitionMap.get(ticket.competitionId);
     if (!competition) return;
 
     const existing = groupMap.get(competition.id);
     if (existing) {
       existing.tickets.push(ticket);
     } else {
       groupMap.set(competition.id, {
         competition,
         tickets: [ticket],
       });
     }
   });
 
   const groupedEntries = Array.from(groupMap.values()).map(entry => ({
     ...entry,
     tickets: entry.tickets.sort((a, b) => {
       const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
       const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
       return bTime - aTime;
     }),
   }));
 
   groupedEntries.sort((a, b) => {
     const aTime = a.tickets[0]?.createdAt ? new Date(a.tickets[0].createdAt).getTime() : 0;
     const bTime = b.tickets[0]?.createdAt ? new Date(b.tickets[0].createdAt).getTime() : 0;
     return bTime - aTime;
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
 
   const referralLink = referralCodeData?.referralCode
     ? `${window.location.origin}/register?ref=${referralCodeData.referralCode}`
     : "";
 
   const topUpMutation = useMutation({
     mutationFn: async (amount: number) => {
       const response = await apiRequest("/api/wallet/topup-checkout", "POST", { amount });
       return response.json();
     },
     onSuccess: (data) => {
       if (data.redirectUrl) {
         window.location.href = data.redirectUrl;
       } else {
         toast({
           title: "Error",
           description: "Failed to get Cashflows checkout URL",
           variant: "destructive",
         });
       }
     },
     onError: (error: any) => {
       toast({
         title: "Error",
         description: error.message || "Failed to start checkout session",
         variant: "destructive",
       });
     },
   });
 
   const LogoutMutation = useMutation({
     mutationFn: async () => {
       const res = await apiRequest("/api/auth/logout", "POST");
       return res.json();
     },
     onSuccess: () => {
       window.location.href = "/";
     },
     onError: (error: any) => {
       toast({
         variant: "destructive",
         title: "Logout Failed",
         description: error.message || "Something went wrong",
       });
     },
   });
 
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
 
   const handleTopUp = () => {
     const amountNum = Number(topUpAmount);
     if (amountNum < 5) {
       toast({
         title: "Invalid Amount",
         description: "Minimum top-up amount is £5",
         variant: "destructive",
       });
       return;
     }
     topUpMutation.mutate(amountNum);
   };
 
   const copyReferralLink = () => {
     if (referralLink) {
       navigator.clipboard.writeText(referralLink);
       toast({
         title: "Copied!",
         description: "Referral link copied to clipboard",
       });
     }
   };
 
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
 
   const handleLogout = (e: React.FormEvent) => {
     e.preventDefault();
     LogoutMutation.mutate();
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
   
   const [location] = useLocation();
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
 
           
 
             {/* RINGTONE POINTS TAB */}
             <TabsContent value="points" className="space-y-6 pt-12 relative z-0" data-testid="content-points">
               <Card className="bg-gradient-to-br from-yellow-900/20 via-zinc-900 to-zinc-900 border-yellow-500/40 shadow-xl shadow-yellow-500/20">
                 <CardContent className="p-8">
                   <div className="text-center space-y-4">
                     <h2 className="text-3xl font-bold text-yellow-400">Ringtone Points Balance</h2>
                     <div className="flex justify-center items-baseline gap-3">
                       <span className="text-7xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent" data-testid="text-points-balance">
                         {ringtonePoints.toLocaleString()}
                       </span>
                       <span className="text-2xl text-gray-400">points</span>
                     </div>
                     <div className="text-xl text-gray-300">
                       Equivalent Value: <span className="font-bold text-yellow-400">£{(ringtonePoints / 100).toFixed(2)}</span>
                     </div>
                     <p className="text-gray-400 max-w-2xl mx-auto">
                       100 points = £1.00 • Use your points to enter competitions or save them up for bigger prizes
                     </p>
                   </div>
                 </CardContent>
               </Card>
 
               <Card className="bg-zinc-900 border-yellow-500/30 shadow-xl shadow-yellow-500/10">
                 <CardHeader className="border-b border-yellow-500/20">
                   <CardTitle className="text-2xl text-yellow-400">Points Transaction History</CardTitle>
                 </CardHeader>
                 <CardContent className="pt-6">
                   {pointsTransactions.length === 0 ? (
                     <div className="text-center py-12">
                       <p className="text-gray-400">No points transactions yet</p>
                       <p className="text-sm text-gray-500 mt-2">Earn points by playing games and entering competitions!</p>
                     </div>
                   ) : (
                     <div className="space-y-3">
                       {pointsTransactions.map((transaction, index) => {
                         const pointsChange = parseFloat(transaction.amount);
                         const isPositive = pointsChange > 0;
 
                         return (
                           <div
                             key={transaction.id}
                             className="flex items-center justify-between p-4 rounded-lg bg-black/30 border border-yellow-500/10 hover:border-yellow-500/30 transition-colors"
                           >
                             <div className="flex-1">
                               <p className="font-medium text-white text-sm">
                                 {transaction.description}
                               </p>
                               <p className="text-xs text-gray-400 mt-1">
                                 {format(new Date(transaction.createdAt!), "dd/MM/yyyy HH:mm")}
                               </p>
                             </div>
                             <span
                               className={`text-xl font-bold ${
                                 isPositive ? "text-green-400" : "text-red-400"
                               }`}
                             >
                               {isPositive ? "+" : ""}{pointsChange.toLocaleString()} pts
                             </span>
                           </div>
                         );
                       })}
                     </div>
                   )}
                 </CardContent>
               </Card>
 
               <Card className="bg-zinc-900/50 border-yellow-500/20">
                 <CardContent className="p-6">
                   <h4 className="text-lg font-semibold text-yellow-400 mb-4">How to Earn Ringtone Points</h4>
                   <ul className="space-y-3 text-sm text-gray-300">
                     <li className="flex items-start gap-2">
                       <span className="text-yellow-500 text-lg">•</span>
                       <span>Win points by playing Spin Wheel and Scratch Card games</span>
                     </li>
                     <li className="flex items-start gap-2">
                       <span className="text-yellow-500 text-lg">•</span>
                       <span>Refer friends to earn bonus points</span>
                     </li>
                     <li className="flex items-start gap-2">
                       <span className="text-yellow-500 text-lg">•</span>
                       <span>Special promotions and bonuses</span>
                     </li>
                     <li className="flex items-start gap-2">
                       <span className="text-yellow-500 text-lg">•</span>
                       <span>100 points = £1.00 when used for competition entries</span>
                     </li>
                   </ul>
                 </CardContent>
               </Card>
             </TabsContent>
 
             
           </Tabs>
         </div>
       </div>
 
       
 
       <Footer />
     </div>
   );
}
