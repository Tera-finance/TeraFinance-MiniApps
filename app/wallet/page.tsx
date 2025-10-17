"use client";

import { Button } from "@/components/ui/button";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance } from 'wagmi';
import { formatEther } from 'viem';
import { Wallet, ExternalLink, Copy, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function WalletPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({
    address: address,
  });
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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
            <h1 className="text-3xl font-bold gradient-text-purple">My Wallet</h1>
          </div>
        </div>

        <div className="space-y-6">
          {/* Connect Wallet Card */}
          <div className="glass-dark p-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full glass flex items-center justify-center glow-blue">
                <Wallet className="w-6 h-6 text-ice-blue" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-glow">Base Sepolia Wallet</h2>
                <p className="text-silver text-sm">Connect your Web3 wallet to interact with Tera Finance</p>
              </div>
            </div>

            <div className="flex justify-center py-4">
              <ConnectButton />
            </div>
          </div>

          {isConnected && address && (
            <>
              {/* Balance Card */}
              <div className="glass-dark p-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                <h3 className="text-xl font-semibold text-ice-blue mb-6">Balance</h3>

                <div className="glass p-6 mb-4">
                  <p className="text-sm text-silver mb-2">Available Balance</p>
                  <p className="text-4xl font-bold gradient-text-purple mb-1">
                    {balance ? `${parseFloat(formatEther(balance.value)).toFixed(4)}` : '0.0000'}
                  </p>
                  <p className="text-ice-blue text-lg">ETH</p>
                </div>

                <div className="glass p-4 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-silver mb-1">Wallet Address</p>
                    <p className="text-ice-blue font-mono text-sm truncate">
                      {address}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handleCopyAddress}
                      className="glass glow-effect h-10 w-10"
                    >
                      {copied ? (
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-ice-blue" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      asChild
                      className="glass glow-effect h-10 w-10"
                    >
                      <a
                        href={`https://sepolia.basescan.org/address/${address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-4 h-4 text-ice-blue" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Network Info Card */}
              <div className="glass-dark p-8 animate-fade-in" style={{ animationDelay: "0.3s" }}>
                <h3 className="text-xl font-semibold text-ice-blue mb-6">Network Information</h3>

                <div className="space-y-4">
                  <div className="glass p-4 flex justify-between items-center">
                    <span className="text-silver">Network</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse-blue" />
                      <span className="font-semibold text-ice-blue">Base Sepolia</span>
                    </div>
                  </div>

                  <div className="glass p-4 flex justify-between items-center">
                    <span className="text-silver">Chain ID</span>
                    <span className="font-mono text-ice-blue">84532</span>
                  </div>

                  <div className="glass p-4 flex justify-between items-center">
                    <span className="text-silver">Explorer</span>
                    <a
                      href="https://sepolia.basescan.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-light-blue hover:text-ice-blue transition-colors"
                    >
                      <span className="text-sm">BaseScan</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="glass p-4 flex justify-between items-center">
                    <span className="text-silver">RPC URL</span>
                    <span className="text-ice-blue text-sm font-mono truncate max-w-[200px]">
                      sepolia.base.org
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="glass-dark p-6 animate-fade-in" style={{ animationDelay: "0.4s" }}>
                <h3 className="text-xl font-semibold text-ice-blue mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={() => router.push("/transfer")}
                    className="btn-space h-12 glow-effect"
                  >
                    Send Money
                  </Button>
                  <Button
                    onClick={() => router.push("/history")}
                    variant="outline"
                    className="glass border-light-blue/30 h-12 glow-effect"
                  >
                    View History
                  </Button>
                </div>
              </div>
            </>
          )}

          {!isConnected && (
            <div className="glass p-8 text-center animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full glass flex items-center justify-center glow-purple">
                <Wallet className="w-8 h-8 text-silver" />
              </div>
              <h3 className="text-xl font-semibold text-ice-blue mb-2">No Wallet Connected</h3>
              <p className="text-silver">Connect your wallet to view balance and transaction details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
