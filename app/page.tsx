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

  // Initialize Farcaster SDK
  useEffect(() => {
    sdk.actions.ready();
  }, []);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-4xl font-bold gradient-text-purple">
              Welcome to Tera Finance
            </h1>
            {!isAuthenticated && (
              <button
                onClick={() => router.push("/login")}
                className="btn-space px-6 py-2 text-sm glow-effect"
              >
                Login
              </button>
            )}
          </div>
          <p className="text-ice-blue">
            {isAuthenticated ? user?.whatsappNumber || "User" : "Fast, affordable cross-border payments"}
          </p>
        </div>

        {/* Quick Actions - Only show for authenticated users */}
        {isAuthenticated ? (
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
        ) : (
          <div className="glass-dark p-8 mb-8 text-center animate-fade-in">
            <h2 className="text-2xl font-bold mb-4 gradient-text">Get Started with Tera Finance</h2>
            <p className="text-silver mb-6">
              Join thousands of users sending money across borders with low fees and fast transfers
            </p>
            <button
              onClick={() => router.push("/login")}
              className="btn-space px-8 py-3 text-lg glow-effect"
            >
              Login to Get Started
            </button>
          </div>
        )}

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
