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
export default function Entries() {
   const { toast } = useToast();
   const { isAuthenticated, isLoading, user } = useAuth() as { isAuthenticated: boolean; isLoading: boolean; user: User | null };
   const queryClient = useQueryClient();
   const [location] = useLocation();
    
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
 
 
             {/* ENTRIES TAB */}
             <TabsContent value="entries" className="space-y-6 pt-12 relative z-0" data-testid="content-entries">
               <Card className="bg-gradient-to-br from-yellow-900/10 via-zinc-900 to-zinc-900 border-yellow-500/30 shadow-xl shadow-yellow-500/10">
                 <CardContent className="p-8">
                   <div className="text-center space-y-3">
                     <h2 className="text-3xl font-bold text-yellow-400">Your Competition Entries</h2>
                     <div className="flex justify-center items-baseline gap-3">
                       <span className="text-6xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent" data-testid="text-total-entries">
                         {tickets.length}
                       </span>
                       <span className="text-2xl text-gray-400">
                         {tickets.length === 1 ? 'entry' : 'entries'}
                       </span>
                     </div>
                     <p className="text-gray-400">
                       Across {groupedEntries.length} {groupedEntries.length === 1 ? 'competition' : 'competitions'}
                     </p>
                   </div>
                 </CardContent>
               </Card>
 
               <div className="space-y-6">
                 {groupedEntries.length === 0 ? (
                   <Card className="bg-zinc-900 border-yellow-500/30">
                     <CardContent className="p-12">
                       <div className="text-center space-y-4">
                         <p className="text-xl text-gray-400">No entries yet</p>
                         <p className="text-sm text-gray-500">
                           Start entering competitions to see your entries here!
                         </p>
                         <Link href="/">
                           <button className="mt-4 px-6 py-3 bg-gradient-to-r from-yellow-600 to-yellow-500 text-black rounded-lg font-bold hover:from-yellow-500 hover:to-yellow-400 transition-all transform hover:scale-105 shadow-lg shadow-yellow-500/50">
                             Browse Competitions
                           </button>
                         </Link>
                       </div>
                     </CardContent>
                   </Card>
                 ) : (
                   groupedEntries.map((entry, groupIndex) => (
                     <Card key={entry.competition.id} className="bg-zinc-900 border-yellow-500/30 overflow-hidden shadow-xl shadow-yellow-500/10">
                       <div className="bg-gradient-to-r from-yellow-900/20 to-zinc-900 p-4 border-b border-yellow-500/30">
                         <div className="flex items-start gap-4">
                           {entry.competition.imageUrl && (
                             <img
                               src={entry.competition.imageUrl}
                               alt={entry.competition.title}
                               className="w-20 h-20 object-cover rounded-lg shadow-lg"
                             />
                           )}
                           <div className="flex-1">
                             <h3 className="text-xl font-bold text-yellow-400 mb-2">
                               {entry.competition.title}
                             </h3>
                             <div className="flex flex-wrap gap-3 text-sm">
                               <span className="flex items-center gap-1">
                                 <span className="text-gray-400">Type:</span>
                                 <span className="capitalize bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded border border-yellow-500/30">
                                   {entry.competition.type}
                                 </span>
                               </span>
                               <span className="flex items-center gap-1">
                                 <span className="text-gray-400">Entries:</span>
                                 <span className="text-yellow-400 font-semibold">
                                   {entry.tickets.length}
                                 </span>
                               </span>
                             </div>
                           </div>
                         </div>
                       </div>
                       <CardContent className="p-4">
                         <h4 className="text-sm font-semibold text-gray-400 mb-3">
                           Your Entry Numbers:
                         </h4>
                         <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                           {entry.tickets.map((ticket) => (
                             <div
                               key={ticket.id}
                               className={`px-3 py-2 rounded-lg border text-center font-mono text-sm transition-all hover:scale-105 ${
                                 ticket.isWinner
                                   ? 'bg-green-500/20 border-green-500 text-green-400 font-bold shadow-lg shadow-green-500/50'
                                   : 'bg-black/50 border-yellow-500/20 text-white hover:border-yellow-500/50'
                               }`}
                             >
                               {ticket.ticketNumber}
                               {ticket.isWinner && (
                                 <div className="text-xs mt-1">🎉</div>
                               )}
                             </div>
                           ))}
                         </div>
                       </CardContent>
                     </Card>
                   ))
                 )}
               </div>
             </TabsContent>
 
 
           
 
           
           </Tabs>
         </div>
       </div>
       <Footer />
     </div>
   );
}
