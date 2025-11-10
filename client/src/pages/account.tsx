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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";



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


export default function Account() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth() as { isAuthenticated: boolean; isLoading: boolean; user: User | null };


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
   
               
             
   
               {/* ACCOUNT TAB */}
               <TabsContent value="account" className="space-y-6 pt-12 relative z-0" data-testid="content-account">
                 <div className="grid md:grid-cols-3 gap-6">
                   <div className="md:col-span-2 space-y-6">
                     <Card className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 border-yellow-500/30 shadow-xl shadow-yellow-500/10">
                       <CardHeader className="border-b border-yellow-500/20">
                         <CardTitle className="text-2xl text-yellow-400">Account Information</CardTitle>
                       </CardHeader>
                       <CardContent className="pt-6">
                         <div className="space-y-6">
                           <div>
                             <label className="text-gray-400 text-sm font-medium">Email</label>
                             <p className="text-white text-lg mt-1" data-testid="text-email">
                               {user?.email || "Not provided"}
                             </p>
                           </div>
                           <div>
                             <label className="text-gray-400 text-sm font-medium">Name</label>
                             <p className="text-white text-lg mt-1" data-testid="text-name">
                               {user?.firstName || user?.lastName
                                 ? `${user?.firstName || ""} ${user?.lastName || ""}`.trim()
                                 : "Not provided"}
                             </p>
                           </div>
                           <div>
                             <label className="text-gray-400 text-sm font-medium">Member Since</label>
                             <p className="text-white text-lg mt-1" data-testid="text-member-since">
                               {user?.createdAt
                                 ? new Date(user.createdAt).toLocaleDateString()
                                 : "Unknown"}
                             </p>
                           </div>
                         </div>
                       </CardContent>
                     </Card>
   
                     <Card className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 border-yellow-500/30 shadow-xl shadow-yellow-500/10">
                       <CardHeader className="border-b border-yellow-500/20">
                         <CardTitle className="text-2xl text-yellow-400">Quick Actions</CardTitle>
                       </CardHeader>
                       <CardContent className="pt-6">
                         <div className="grid grid-cols-2 gap-4">
                           <Link href="/orders" className="contents">
                           <button
                             className="bg-gradient-to-r from-yellow-600 to-yellow-500 text-black py-3 rounded-lg font-bold hover:from-yellow-500 hover:to-yellow-400 transition-all transform hover:scale-105 shadow-lg shadow-yellow-500/50"
                             data-testid="button-view-orders"
                           >
                             View Orders
                           </button>
                           </Link>
                            <Link href="/wallet" className="contents">
                           <button
                             className="bg-zinc-800 text-white py-3 rounded-lg font-bold hover:bg-zinc-700 transition-all border border-yellow-500/30"
                             data-testid="button-manage-wallet"
                           >
                             Manage Wallet
                           </button>
                            </Link>
                         </div>
                       </CardContent>
                     </Card>
                   </div>
   
                   <div className="space-y-6">
                     <Card className="bg-gradient-to-br from-yellow-900/20 via-zinc-900 to-zinc-900 border-yellow-500/40 shadow-xl shadow-yellow-500/20">
                       <CardHeader className="border-b border-yellow-500/30">
                         <CardTitle className="text-xl text-yellow-400">Account Balance</CardTitle>
                       </CardHeader>
                       <CardContent className="pt-6">
                         <div className="text-center">
                           <p className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent" data-testid="text-balance">
                             £{parseFloat(user?.balance || "0").toFixed(2)}
                           </p>
                            <Link href="/wallet" className="contents">
                           <button
                             
                             className="mt-4 w-full bg-gradient-to-r from-yellow-600 to-yellow-500 text-black px-6 py-3 rounded-lg font-bold hover:from-yellow-500 hover:to-yellow-400 transition-all transform hover:scale-105 shadow-lg shadow-yellow-500/50"
                             data-testid="button-top-up"
                           >
                             TOP UP
                           </button>
                            </Link>
                         </div>
                       </CardContent>
                     </Card>
   
                     <Card className="bg-zinc-900 border-yellow-500/30 shadow-xl shadow-yellow-500/10">
                       <CardHeader className="border-b border-yellow-500/20">
                         <CardTitle className="text-xl text-yellow-400">Account Options</CardTitle>
                       </CardHeader>
                       <CardContent className="pt-4">
                         <div className="space-y-2">
                           <UpdateProfileModal user={user} />
                           <ChangePasswordModal />
                           <button 
                             onClick={handleLogout}
                             className="w-full text-left px-4 py-2 rounded-lg hover:bg-red-500/10 transition-colors text-sm text-red-400"
                             data-testid="button-logout"
                           >
                             Log out
                           </button>
                         </div>
                       </CardContent>
                     </Card>
                   </div>
                 </div>
               </TabsContent>
   
             </Tabs>
           </div>
         </div>
   
   
         <Footer />
       </div>
  );
}
