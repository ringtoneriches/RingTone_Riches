import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription 
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowDownCircle, CheckCircle, XCircle, Clock } from "lucide-react";

export default function AdminWithdrawals() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"approved" | "rejected" | "processed" | null>(null);
  const [adminNotes, setAdminNotes] = useState("");

  const { data: withdrawalRequests = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/withdrawal-requests"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes: string }) => {
      const response = await apiRequest(`/api/admin/withdrawal-requests/${id}`, "PATCH", {
        status,
        adminNotes: notes,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Withdrawal request status updated successfully",
      });
      setActionDialogOpen(false);
      setSelectedRequest(null);
      setAdminNotes("");
      setActionType(null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/withdrawal-requests"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update withdrawal request",
        variant: "destructive",
      });
    },
  });

  const handleAction = (request: any, action: "approved" | "rejected" | "processed") => {
    setSelectedRequest(request);
    setActionType(action);
    setActionDialogOpen(true);
  };

  const confirmAction = () => {
    if (selectedRequest && actionType) {
      updateStatusMutation.mutate({
        id: selectedRequest.id,
        status: actionType,
        notes: adminNotes,
      });
    }
  };

  const statusBadge = (status: string) => {
    const colors = {
      pending: { bg: "bg-yellow-500/10", text: "text-yellow-500", border: "border-yellow-500/20", icon: Clock },
      approved: { bg: "bg-green-500/10", text: "text-green-500", border: "border-green-500/20", icon: CheckCircle },
      rejected: { bg: "bg-red-500/10", text: "text-red-500", border: "border-red-500/20", icon: XCircle },
      processed: { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/20", icon: CheckCircle },
    };
    const config = colors[status as keyof typeof colors] || colors.pending;
    const Icon = config.icon;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${config.bg} ${config.text} ${config.border}`}>
        <Icon className="h-3 w-3" />
        {status.toUpperCase()}
      </span>
    );
  };

  const pendingRequests = withdrawalRequests.filter((r) => r.status === "pending");
  const processedRequests = withdrawalRequests.filter((r) => r.status !== "pending");

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-yellow-400">Withdrawal Requests</h1>
            <p className="text-gray-400 mt-1">Manage user withdrawal requests</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-400">Pending Requests</p>
              <p className="text-2xl font-bold text-yellow-400">{pendingRequests.length}</p>
            </div>
          </div>
        </div>

        {/* Pending Requests */}
        <Card className="bg-zinc-900 border-yellow-500/30">
          <CardHeader className="border-b border-yellow-500/20">
            <CardTitle className="text-xl text-yellow-400 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pending Requests ({pendingRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <p className="text-gray-400 text-center py-8">Loading...</p>
            ) : pendingRequests.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No pending withdrawal requests</p>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div 
                    key={request.id}
                    className="bg-black/50 rounded-lg p-4 border border-yellow-500/20"
                    data-testid={`admin-withdrawal-${request.id}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          {statusBadge(request.status)}
                          <span className="text-2xl font-bold text-yellow-400">
                            £{parseFloat(request.amount).toFixed(2)}
                          </span>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">User ID</p>
                            <p className="text-white font-mono">{request.userId}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Requested</p>
                            <p className="text-white">{format(new Date(request.createdAt), "dd MMM yyyy 'at' HH:mm")}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Account Name</p>
                            <p className="text-white">{request.accountName}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Bank Details</p>
                            <p className="text-white font-mono">
                              Sort: {request.sortCode} | Acc: {request.accountNumber}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAction(request, "processed")}
                          className="bg-blue-600 hover:bg-blue-500"
                          data-testid={`button-process-${request.id}`}
                        >
                          Mark Processed
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleAction(request, "approved")}
                          className="bg-green-600 hover:bg-green-500"
                          data-testid={`button-approve-${request.id}`}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleAction(request, "rejected")}
                          data-testid={`button-reject-${request.id}`}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Processed Requests */}
        <Card className="bg-zinc-900 border-yellow-500/30">
          <CardHeader className="border-b border-yellow-500/20">
            <CardTitle className="text-xl text-yellow-400 flex items-center gap-2">
              <ArrowDownCircle className="h-5 w-5" />
              Processed Requests ({processedRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {processedRequests.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No processed withdrawal requests</p>
            ) : (
              <div className="space-y-4">
                {processedRequests.map((request) => (
                  <div 
                    key={request.id}
                    className="bg-black/50 rounded-lg p-4 border border-yellow-500/10"
                    data-testid={`processed-withdrawal-${request.id}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          {statusBadge(request.status)}
                          <span className="text-xl font-bold text-yellow-400">
                            £{parseFloat(request.amount).toFixed(2)}
                          </span>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">User ID</p>
                            <p className="text-white font-mono text-xs">{request.userId}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Account Name</p>
                            <p className="text-white">{request.accountName}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Requested</p>
                            <p className="text-white">{format(new Date(request.createdAt), "dd MMM yyyy 'at' HH:mm")}</p>
                          </div>
                          {request.processedAt && (
                            <div>
                              <p className="text-gray-500">Processed</p>
                              <p className="text-white">{format(new Date(request.processedAt), "dd MMM yyyy 'at' HH:mm")}</p>
                            </div>
                          )}
                        </div>

                        {request.adminNotes && (
                          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded p-2 mt-2">
                            <p className="text-xs text-gray-500">Admin Notes:</p>
                            <p className="text-sm text-yellow-400">{request.adminNotes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Confirmation Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent className="bg-zinc-900 border-yellow-500/30">
          <DialogHeader>
            <DialogTitle className="text-yellow-400">
              {actionType === "processed" && "Mark as Processed"}
              {actionType === "approved" && "Approve Withdrawal"}
              {actionType === "rejected" && "Reject Withdrawal"}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {actionType === "processed" && "Confirm that you have manually processed this withdrawal."}
              {actionType === "approved" && "Confirm that you want to approve this withdrawal request."}
              {actionType === "rejected" && "Confirm that you want to reject this withdrawal request."}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              <div className="bg-black/50 rounded-lg p-4 border border-yellow-500/20">
                <p className="text-sm text-gray-400">Amount</p>
                <p className="text-2xl font-bold text-yellow-400">£{parseFloat(selectedRequest.amount).toFixed(2)}</p>
                <p className="text-sm text-gray-400 mt-2">Account: {selectedRequest.accountName}</p>
                <p className="text-sm text-gray-400">Bank: {selectedRequest.sortCode} - {selectedRequest.accountNumber}</p>
              </div>

              <div className="space-y-2">
                <Label>Admin Notes (Optional)</Label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add any notes about this decision..."
                  className="bg-black/50 border-yellow-500/30 text-white"
                  rows={3}
                  data-testid="textarea-admin-notes"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setActionDialogOpen(false);
                setAdminNotes("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmAction}
              disabled={updateStatusMutation.isPending}
              className={`
                ${actionType === "processed" ? "bg-blue-600 hover:bg-blue-500" : ""}
                ${actionType === "approved" ? "bg-green-600 hover:bg-green-500" : ""}
                ${actionType === "rejected" ? "bg-red-600 hover:bg-red-500" : ""}
              `}
              data-testid="button-confirm-action"
            >
              {updateStatusMutation.isPending ? "Processing..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}