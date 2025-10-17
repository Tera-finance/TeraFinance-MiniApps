"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, ArrowUpRight, Clock, CheckCircle2, XCircle, Loader2, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { transferService } from "@/lib/api/transferService";
import { InvoiceDownload } from "@/components/history/InvoiceDownload";
import { config } from "@/lib/config";
import type { TransferHistoryItem } from "@/lib/types";

type TransactionStatus = "completed" | "pending" | "processing" | "failed" | "paid" | "cancelled";

export default function HistoryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [transactions, setTransactions] = useState<TransferHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  // Fetch transfer history
  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) {
        router.push("/login");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await transferService.getTransferHistory(limit, offset);
        if (response.success && response.data) {
          setTransactions(response.data.transfers);
          setHasMore(response.data.transfers.length >= limit);
        } else {
          setError(response.error || "Failed to fetch history");
        }
      } catch {
        setError("Failed to fetch transaction history");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [user, router, offset]);

  const loadMore = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await transferService.getTransferHistory(limit, offset + limit);
      if (response.success && response.data) {
        setTransactions([...transactions, ...response.data.transfers]);
        setOffset(offset + limit);
        setHasMore(response.data.transfers.length >= limit);
      }
    } catch {
      console.error("Failed to load more");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTransactions = transactions.filter((txn) => {
    const matchesSearch =
      searchQuery === "" ||
      txn.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.recipientBank.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === "all" || txn.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: TransactionStatus) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case "pending":
      case "processing":
      case "paid":
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case "failed":
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-400" />;
    }
  };

  const getStatusBadge = (status: TransactionStatus) => {
    const styles = {
      completed: "bg-green-500/20 text-green-400 border-green-500/30",
      pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      processing: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      paid: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
      failed: "bg-red-500/20 text-red-400 border-red-500/30",
      cancelled: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    };

    return (
      <Badge variant="outline" className={`${styles[status]} flex items-center gap-1`}>
        {getStatusIcon(status)}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/")}
              className="glass glow-effect"
            >
              <ArrowLeft className="w-5 h-5 text-ice-blue" />
            </Button>
            <h1 className="text-3xl font-bold gradient-text-purple">Transaction History</h1>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 glass-dark border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Filters */}
        <div className="glass-dark p-6 mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver" />
              <Input
                placeholder="Search by name, bank, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass pl-10 border-light-blue/30 text-ice-blue"
              />
            </div>

            {/* Status Filter */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-40 glass border-light-blue/30">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Transaction List */}
        {isLoading && transactions.length === 0 ? (
          <div className="glass-dark p-12 text-center">
            <Loader2 className="w-12 h-12 mx-auto mb-4 text-light-blue animate-spin" />
            <p className="text-silver">Loading transactions...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.length === 0 ? (
              <div className="glass-dark p-12 text-center animate-fade-in">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full glass flex items-center justify-center">
                  <Search className="w-8 h-8 text-silver" />
                </div>
                <h3 className="text-xl font-semibold text-ice-blue mb-2">No transactions found</h3>
                <p className="text-silver mb-6">Start sending money to see your transaction history</p>
                <Button
                  onClick={() => router.push("/transfer")}
                  className="btn-space"
                >
                  Send Money
                </Button>
              </div>
            ) : (
              filteredTransactions.map((txn, index) => (
                <motion.div
                  key={txn.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass hover-lift p-6 glow-effect"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    {/* Left Side */}
                    <div className="flex items-start gap-4 flex-1">
                      {/* Icon */}
                      <div className="w-12 h-12 rounded-full flex items-center justify-center bg-red-500/20 glow-purple">
                        <ArrowUpRight className="w-6 h-6 text-red-400" />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-ice-blue truncate">
                            To {txn.recipientName}
                          </h3>
                        </div>
                        <p className="text-sm text-silver mb-1">{txn.recipientBank} • {txn.recipientAccount}</p>
                        <p className="text-sm text-silver mb-2">{formatDate(txn.createdAt)}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {getStatusBadge(txn.status as TransactionStatus)}
                          <span className="text-xs text-silver">ID: {txn.id.slice(0, 8)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Side - Amount */}
                    <div className="text-right">
                      <p className="text-2xl font-bold text-red-400">
                        -{txn.senderAmount} {txn.senderCurrency}
                      </p>
                      <p className="text-sm text-silver mt-1">
                        ≈ {txn.recipientExpectedAmount} {txn.recipientCurrency}
                      </p>
                      {txn.feeAmount > 0 && (
                        <p className="text-xs text-silver mt-1">Fee: {txn.feeAmount} {txn.senderCurrency}</p>
                      )}
                    </div>
                  </div>

                  {/* Transaction Details Row */}
                  <div className="flex items-center justify-between gap-4 pt-4 border-t border-light-blue/20">
                    <div className="flex items-center gap-4">
                      {txn.txHash && (
                        <a
                          href={`${config.explorerUrl}/tx/${txn.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-light-blue hover:text-ice-blue flex items-center gap-1"
                        >
                          View on Basescan
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    {(txn.status === "completed" || txn.status === "processing" || txn.status === "paid") && (
                      <InvoiceDownload transferId={txn.id} recipientName={txn.recipientName} />
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Load More Button */}
        {hasMore && filteredTransactions.length > 0 && (
          <div className="mt-8 text-center">
            <Button
              variant="outline"
              className="glass border-light-blue/30 px-8 h-12 glow-effect"
              onClick={loadMore}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                "Load more transactions"
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
