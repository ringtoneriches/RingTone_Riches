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


export default function Wallet() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth() as { isAuthenticated: boolean; isLoading: boolean; user: User | null };
  const [location] = useLocation(); 
  const [topUpAmount, setTopUpAmount] = useState<string>("10");
  const [filterType, setFilterType] = useState<string>("all");
 
  
 
  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ["/api/user/transactions"],
    enabled: isAuthenticated,
  });

  

 

  const filteredTransactions = filterType === "all"
    ? transactions
    : transactions.filter(t => t.type === filterType);


  



 

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

            {/* WALLET TAB */}
            <TabsContent value="wallet" className="space-y-6 pt-12 relative z-0" data-testid="content-wallet">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Wallet Balance Card */}
                <Card className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 border-yellow-500/30 shadow-xl shadow-yellow-500/10">
                  <CardHeader className="border-b border-yellow-500/20">
                    <CardTitle className="text-2xl text-yellow-400 flex items-center gap-2">
                      <WalletIcon className="h-6 w-6" />
                      Wallet Balance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="text-center space-y-6">
                      <div>
                        <p className="text-gray-400 text-sm mb-2">Available Balance</p>
                        <p className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent" data-testid="text-balance">
                          £{parseFloat(user?.balance || '0').toFixed(2)}
                        </p>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="space-y-3">
                          <label className="text-sm text-gray-400">Quick Top-Up</label>
                          <div className="grid grid-cols-4 gap-2">
                            {[10, 25, 50, 100].map((amount) => (
                              <button
                                key={amount}
                                onClick={() => setTopUpAmount(String(amount))}
                                className={`py-3 rounded-lg font-semibold transition-all transform hover:scale-105 ${
                                  topUpAmount === String(amount)
                                    ? 'bg-gradient-to-r from-yellow-600 to-yellow-500 text-black shadow-lg shadow-yellow-500/50'
                                    : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700 border border-yellow-500/20'
                                }`}
                                data-testid={`button-amount-${amount}`}
                              >
                                £{amount}
                              </button>
                            ))}
                          </div>
                          <input
                            type="number"
                            min="5"
                            max="1000"
                            value={topUpAmount}
                            onChange={(e) => setTopUpAmount(e.target.value)}
                            className="w-full bg-black/50 border border-yellow-500/30 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                            placeholder="Custom amount"
                            data-testid="input-custom-amount"
                          />
                        </div>
                        <button 
                          onClick={handleTopUp}
                          disabled={topUpMutation.isPending}
                          className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 text-black font-bold py-4 rounded-lg hover:from-yellow-500 hover:to-yellow-400 transition-all transform hover:scale-105 shadow-lg shadow-yellow-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                          data-testid="button-topup"
                        >
                          {topUpMutation.isPending ? "Redirecting..." : "TOP UP NOW"}
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Transaction History */}
                <Card className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 border-yellow-500/30 shadow-xl shadow-yellow-500/10">
                  <CardHeader className="border-b border-yellow-500/20">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl text-yellow-400">Transaction History</CardTitle>
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-gray-400" />
                        <Select value={filterType} onValueChange={setFilterType}>
                          <SelectTrigger className="w-32 bg-black/50 border-yellow-500/30" data-testid="select-transaction-filter">
                            <SelectValue placeholder="Filter" />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-900 border-yellow-500/20">
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="deposit">Deposits</SelectItem>
                            <SelectItem value="withdrawal">Withdrawals</SelectItem>
                            <SelectItem value="purchase">Purchases</SelectItem>
                            <SelectItem value="prize">Prizes</SelectItem>
                            <SelectItem value="referral">Referrals</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {filteredTransactions.length === 0 ? (
                        <p className="text-gray-400 text-center py-8" data-testid="text-no-transactions">
                          {filterType === "all" ? "No transactions yet" : `No ${filterType} transactions`}
                        </p>
                      ) : (
                        filteredTransactions.slice(0, 10).map((transaction) => (
                          <div 
                            key={transaction.id} 
                            className="flex items-start justify-between gap-3 p-4 bg-black/30 rounded-lg border border-yellow-500/10 hover:border-yellow-500/30 transition-colors"
                            data-testid={`transaction-${transaction.id}`}
                          >
                            <div className="flex items-start gap-3 flex-1">
                              <div className="mt-1">
                                {getTransactionIcon(transaction.type)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  {getTransactionTypeBadge(transaction.type)}
                                </div>
                                <p className="font-medium text-sm text-white">
                                  {transaction.description}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {format(new Date(transaction.createdAt!), "dd MMM yyyy 'at' HH:mm")}
                                </p>
                              </div>
                            </div>
                            <div className={`font-bold text-lg whitespace-nowrap ${
                              transaction.type === 'deposit' || transaction.type === 'prize' || transaction.type === 'referral'
                                ? 'text-green-400' 
                                : 'text-red-400'
                            }`}>
                              {transaction.type === 'deposit' || transaction.type === 'prize' || transaction.type === 'referral' ? '+' : '-'}
                              £{Math.abs(parseFloat(transaction.amount)).toFixed(2)}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>


      <Footer />
    </div>
  );
}
