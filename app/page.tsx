"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Send, History, Wallet } from "lucide-react";
import Link from "next/link";
import { sdk } from "@farcaster/miniapp-sdk";

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Initialize Farcaster SDK
  useEffect(() => {
    sdk.actions.ready();
  }, []);

  if (!isAuthenticated) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-2 gradient-text-purple">
            Welcome to Tera Finance
          </h1>
          <p className="text-ice-blue">
            {user?.whatsappNumber || "User"}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Link href="/transfer" className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="glass hover-lift cursor-pointer p-6 glow-effect">
              <div className="w-12 h-12 bg-light-blue/20 rounded-full flex items-center justify-center mb-4 glow-blue">
                <Send className="w-6 h-6 text-ice-blue" />
              </div>
              <h3 className="text-xl font-bold text-glow mb-2">Send Money</h3>
              <p className="text-sm text-silver">Transfer funds globally</p>
            </div>
          </Link>

          <Link href="/history" className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="glass hover-lift cursor-pointer p-6 glow-effect">
              <div className="w-12 h-12 bg-light-blue/20 rounded-full flex items-center justify-center mb-4 glow-cyan">
                <History className="w-6 h-6 text-ice-blue" />
              </div>
              <h3 className="text-xl font-bold text-glow mb-2">History</h3>
              <p className="text-sm text-silver">View transactions</p>
            </div>
          </Link>

          <Link href="/wallet" className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="glass hover-lift cursor-pointer p-6 glow-effect">
              <div className="w-12 h-12 bg-light-blue/20 rounded-full flex items-center justify-center mb-4 glow-purple">
                <Wallet className="w-6 h-6 text-ice-blue" />
              </div>
              <h3 className="text-xl font-bold text-glow mb-2">Wallet</h3>
              <p className="text-sm text-silver">Manage your wallet</p>
            </div>
          </Link>
        </div>

        {/* Info Section */}
        <div className="glass-dark p-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <h2 className="text-2xl font-bold mb-6 gradient-text">Why Choose Tera Finance?</h2>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-3 h-3 bg-light-blue rounded-full mt-2 glow-blue animate-pulse-blue" />
              <div>
                <h3 className="font-semibold text-ice-blue text-lg mb-1">Low Fees</h3>
                <p className="text-sm text-silver">
                  Pay less than 2% in fees, compared to 6-8% with traditional services
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-3 h-3 bg-light-blue rounded-full mt-2 glow-blue animate-pulse-blue" />
              <div>
                <h3 className="font-semibold text-ice-blue text-lg mb-1">Fast Transfers</h3>
                <p className="text-sm text-silver">
                  Complete transfers in 5-10 minutes instead of days
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-3 h-3 bg-light-blue rounded-full mt-2 glow-blue animate-pulse-blue" />
              <div>
                <h3 className="font-semibold text-ice-blue text-lg mb-1">Blockchain Powered</h3>
                <p className="text-sm text-silver">
                  Secure, transparent, and verifiable on Base blockchain
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
