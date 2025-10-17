"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

type TransactionStatus = "completed" | "pending" | "failed";
type TransactionType = "sent" | "received";

interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  recipient?: string;
  sender?: string;
  status: TransactionStatus;
  date: string;
  fee: number;
}

// Mock data
const mockTransactions: Transaction[] = [
  {
    id: "txn_1",
    type: "sent",
    amount: 500,
    currency: "USD",
    recipient: "John Doe",
    status: "completed",
    date: "2025-10-17T10:30:00",
    fee: 7.5,
  },
  {
    id: "txn_2",
    type: "received",
    amount: 250,
    currency: "EUR",
    sender: "Alice Smith",
    status: "completed",
    date: "2025-10-16T14:20:00",
    fee: 0,
  },
  {
    id: "txn_3",
    type: "sent",
    amount: 1000,
    currency: "USD",
    recipient: "Bob Johnson",
    status: "pending",
    date: "2025-10-15T09:15:00",
    fee: 15,
  },
  {
    id: "txn_4",
    type: "sent",
    amount: 750,
    currency: "GBP",
    recipient: "Sarah Williams",
    status: "completed",
    date: "2025-10-14T16:45:00",
    fee: 11.25,
  },
  {
    id: "txn_5",
    type: "sent",
    amount: 300,
    currency: "USD",
    recipient: "Mike Davis",
    status: "failed",
    date: "2025-10-13T11:30:00",
    fee: 0,
  },
  {
    id: "txn_6",
    type: "received",
    amount: 450,
    currency: "EUR",
    sender: "Emma Brown",
    status: "completed",
    date: "2025-10-12T08:20:00",
    fee: 0,
  },
];

export default function HistoryPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");

  const filteredTransactions = mockTransactions.filter((txn) => {
    const matchesSearch =
      searchQuery === "" ||
      (txn.recipient?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (txn.sender?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      txn.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === "all" || txn.status === filterStatus;
    const matchesType = filterType === "all" || txn.type === filterType;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusIcon = (status: TransactionStatus) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-400" />;
    }
  };

  const getStatusBadge = (status: TransactionStatus) => {
    const styles = {
      completed: "bg-green-500/20 text-green-400 border-green-500/30",
      pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      failed: "bg-red-500/20 text-red-400 border-red-500/30",
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

        {/* Filters */}
        <div className="glass-dark p-6 mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver" />
              <Input
                placeholder="Search by name or ID..."
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-40 glass border-light-blue/30">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="received">Received</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Transaction List */}
        <div className="space-y-4">
          {filteredTransactions.length === 0 ? (
            <div className="glass-dark p-12 text-center animate-fade-in">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full glass flex items-center justify-center">
                <Search className="w-8 h-8 text-silver" />
              </div>
              <h3 className="text-xl font-semibold text-ice-blue mb-2">No transactions found</h3>
              <p className="text-silver">Try adjusting your filters or search query</p>
            </div>
          ) : (
            filteredTransactions.map((txn, index) => (
              <motion.div
                key={txn.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass hover-lift p-6 cursor-pointer glow-effect"
                onClick={() => {
                  // Could navigate to transaction details page
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left Side */}
                  <div className="flex items-start gap-4 flex-1">
                    {/* Icon */}
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        txn.type === "sent"
                          ? "bg-red-500/20 glow-purple"
                          : "bg-green-500/20 glow-cyan"
                      }`}
                    >
                      {txn.type === "sent" ? (
                        <ArrowUpRight className="w-6 h-6 text-red-400" />
                      ) : (
                        <ArrowDownLeft className="w-6 h-6 text-green-400" />
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-ice-blue truncate">
                          {txn.type === "sent" ? `To ${txn.recipient}` : `From ${txn.sender}`}
                        </h3>
                      </div>
                      <p className="text-sm text-silver mb-2">{formatDate(txn.date)}</p>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(txn.status)}
                        <span className="text-xs text-silver">ID: {txn.id}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Amount */}
                  <div className="text-right">
                    <p
                      className={`text-2xl font-bold ${
                        txn.type === "sent" ? "text-red-400" : "text-green-400"
                      }`}
                    >
                      {txn.type === "sent" ? "-" : "+"}
                      {txn.amount} {txn.currency}
                    </p>
                    {txn.fee > 0 && (
                      <p className="text-sm text-silver mt-1">Fee: {txn.fee} {txn.currency}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Load More Button (placeholder) */}
        {filteredTransactions.length > 0 && (
          <div className="mt-8 text-center">
            <Button
              variant="outline"
              className="glass border-light-blue/30 px-8 h-12 glow-effect"
              onClick={() => {
                // Load more functionality
              }}
            >
              Load more transactions
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
