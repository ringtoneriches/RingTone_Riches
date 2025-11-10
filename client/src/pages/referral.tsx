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

export default function Referral() {
 const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth() as { isAuthenticated: boolean; isLoading: boolean; user: User | null };
  const [location] = useLocation(); 

  const { data: referralCodeData } = useQuery<{ referralCode: string }>({
    queryKey: ["/api/user/referral-code"],
    enabled: isAuthenticated,
  });

  const { data: referralStats } = useQuery<ReferralStats>({
    queryKey: ["/api/user/referral-stats"],
    enabled: isAuthenticated,
  });

  const referralLink = referralCodeData?.referralCode
    ? `${window.location.origin}/register?ref=${referralCodeData.referralCode}`
    : "";

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


  const copyReferralLink = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      toast({
        title: "Copied!",
        description: "Referral link copied to clipboard",
      });
    }
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

          

           

            {/* REFERRAL TAB */}
            <TabsContent value="referral" className="space-y-6 pt-12 relative z-0" data-testid="content-referral">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 border-yellow-500/30 hover:border-yellow-500/50 transition-all shadow-xl shadow-yellow-500/10">
                  <CardHeader className="border-b border-yellow-500/20">
                    <CardTitle className="flex items-center gap-2 text-xl text-yellow-400">
                      <Users className="h-6 w-6" />
                      Total Referrals
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent" data-testid="text-total-referrals">
                      {referralStats?.totalReferrals || 0}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 border-yellow-500/30 hover:border-yellow-500/50 transition-all shadow-xl shadow-yellow-500/10">
                  <CardHeader className="border-b border-yellow-500/20">
                    <CardTitle className="flex items-center gap-2 text-xl text-yellow-400">
                      <DollarSign className="h-6 w-6" />
                      Total Earned
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="text-5xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent" data-testid="text-total-earned">
                      £{referralStats?.totalEarned || "0.00"}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-gradient-to-br from-yellow-900/20 via-zinc-900 to-zinc-900 border-yellow-500/40 shadow-xl shadow-yellow-500/20">
                <CardHeader className="border-b border-yellow-500/30">
                  <CardTitle className="flex items-center gap-2 text-2xl text-yellow-400">
                    <Gift className="h-6 w-6" />
                    Your Referral Link
                  </CardTitle>
                  <CardDescription className="text-gray-400">Share this link with friends to earn rewards</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={referralLink}
                      readOnly
                      className="flex-1 px-4 py-3 bg-black/50 border border-yellow-500/30 rounded-lg text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      data-testid="input-referral-link"
                    />
                    <Button
                      onClick={copyReferralLink}
                      className="bg-gradient-to-r from-yellow-600 to-yellow-500 text-black hover:from-yellow-500 hover:to-yellow-400 shadow-lg shadow-yellow-500/50"
                      data-testid="button-copy-referral"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>

                  <div className="bg-black/50 rounded-lg p-6 border border-yellow-500/20">
                    <h3 className="font-semibold text-yellow-400 mb-4 text-lg">How it works:</h3>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-500">•</span>
                        <span>Share your unique referral link with friends</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-500">•</span>
                        <span>They sign up using your link and make their first entry</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-500">•</span>
                        <span>You earn £5 bonus credit when they complete their first competition entry</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-500">•</span>
                        <span>Your friend gets 100 Ringtune Points as a welcome bonus</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-500">•</span>
                        <span>Unlimited referrals - the more friends, the more you earn!</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-yellow-500/30 shadow-xl shadow-yellow-500/10">
                <CardHeader className="border-b border-yellow-500/20">
                  <CardTitle className="text-2xl text-yellow-400">Your Referrals</CardTitle>
                  <CardDescription className="text-gray-400">
                    {referralStats?.totalReferrals === 0
                      ? "You haven't referred anyone yet"
                      : `${referralStats?.totalReferrals} friend${referralStats?.totalReferrals === 1 ? "" : "s"} joined through your link`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {referralStats?.referrals && referralStats.referrals.length > 0 ? (
                    <div className="space-y-3">
                      {referralStats.referrals.map((referral) => (
                        <div
                          key={referral.id}
                          className="flex items-center justify-between p-4 bg-black/30 rounded-lg border border-yellow-500/10 hover:border-yellow-500/30 transition-colors"
                        >
                          <div>
                            <p className="font-medium text-white">
                              {referral.firstName} {referral.lastName}
                            </p>
                            <p className="text-sm text-gray-400">{referral.email}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-400">
                              Joined {format(new Date(referral.createdAt), "dd MMM yyyy")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400 mb-2">No referrals yet</p>
                      <p className="text-sm text-gray-500">
                        Start sharing your link to earn rewards!
                      </p>
                    </div>
                  )}
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
