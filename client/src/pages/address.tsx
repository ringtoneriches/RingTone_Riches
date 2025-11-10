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


export default function Address() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth() as { isAuthenticated: boolean; isLoading: boolean; user: User | null };
     const [location] = useLocation();
  
  const queryClient = useQueryClient();
  const [topUpAmount, setTopUpAmount] = useState<string>("10");
  const [filterType, setFilterType] = useState<string>("all");
  const [addressForm, setAddressForm] = useState({
    street: "",
    city: "",
    postcode: "",
    country: "United Kingdom",
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

            {/* ADDRESS TAB */}
            <TabsContent value="address" className="space-y-6 pt-12 relative z-0" data-testid="content-address">
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-400 font-medium">
                  ⚠️ Address management is coming soon. For now, prize winners will be contacted directly to arrange delivery.
                </p>
              </div>
              <Card className="bg-zinc-900 border-yellow-500/30 shadow-xl shadow-yellow-500/10">
                <CardHeader className="border-b border-yellow-500/20">
                  <CardTitle className="flex items-center gap-2 text-2xl text-yellow-400">
                    <MapPin className="h-6 w-6" />
                    Delivery Address (Preview)
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    This feature will allow you to manage your delivery address for prize shipments
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="street" className="text-gray-300">Street Address *</Label>
                    <Input
                      id="street"
                      placeholder="123 Main Street"
                      value={addressForm.street}
                      onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                      className="bg-black/50 border-yellow-500/30 text-white"
                      data-testid="input-street"
                      disabled
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-gray-300">City *</Label>
                      <Input
                        id="city"
                        placeholder="London"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        className="bg-black/50 border-yellow-500/30 text-white"
                        data-testid="input-city"
                        disabled
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="postcode" className="text-gray-300">Postcode *</Label>
                      <Input
                        id="postcode"
                        placeholder="SW1A 1AA"
                        value={addressForm.postcode}
                        onChange={(e) => setAddressForm({ ...addressForm, postcode: e.target.value })}
                        className="bg-black/50 border-yellow-500/30 text-white"
                        data-testid="input-postcode"
                        disabled
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-gray-300">Country</Label>
                    <Select 
                      value={addressForm.country} 
                      onValueChange={(value) => setAddressForm({ ...addressForm, country: value })}
                      disabled
                    >
                      <SelectTrigger className="bg-black/50 border-yellow-500/30" data-testid="select-country">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-yellow-500/20">
                        <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                        <SelectItem value="Ireland">Ireland</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="pt-4">
                    <Button 
                      onClick={handleSaveAddress}
                      className="w-full md:w-auto"
                      variant="outline"
                      disabled
                      data-testid="button-save-address"
                    >
                      Save Address (Coming Soon)
                    </Button>
                  </div>

                  <div className="bg-black/50 rounded-lg p-4 mt-6 border border-yellow-500/20">
                    <h4 className="font-semibold mb-2 flex items-center gap-2 text-yellow-400">
                      <Gift className="h-4 w-4" />
                      Important Information
                    </h4>
                    <ul className="space-y-1 text-sm text-gray-400">
                      <li>• Your delivery address is used for shipping physical prizes</li>
                      <li>• Ensure your address is accurate to avoid delivery issues</li>
                      <li>• We only ship to UK and Ireland addresses</li>
                      <li>• You can update your address at any time</li>
                    </ul>
                  </div>
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
