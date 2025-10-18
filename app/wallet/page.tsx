"use client";

import { Button } from "@/components/ui/button";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance } from 'wagmi';
import { formatEther } from 'viem';
import { Wallet, ExternalLink, Copy, ArrowLeft, CheckCircle2, Coins, Send } from 'lucide-react';
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { blockchainService } from "@/lib/api/blockchainService";
import { useTokenBalances } from "@/lib/hooks/useTokenBalances";

interface Token {
  symbol: string;
  address: string;
}

export default function WalletPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({
    address: address,
  });
  const [copied, setCopied] = useState(false);
  const [availableTokens, setAvailableTokens] = useState<Token[]>([]);
  const [isLoadingTokens, setIsLoadingTokens] = useState(true);

  // Fetch available tokens from backend
  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const response = await blockchainService.getTokens();
        if (response.success && response.data) {
          const mappedTokens: Token[] = Object.entries(response.data.tokens).map(([symbol, address]) => ({
            symbol: symbol.toUpperCase(),
            address: address as string,
          }));
          setAvailableTokens(mappedTokens);
        }
      } catch (err) {
        console.error("Failed to fetch tokens:", err);
      } finally {
        setIsLoadingTokens(false);
      }
    };

    fetchTokens();
  }, []);

  // Fetch token balances
  const { balances, isLoading: isLoadingBalances } = useTokenBalances(availableTokens);

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
              {/* Portfolio Overview */}
              <div className="glass-dark p-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold gradient-text-purple">Your Portfolio</h3>
                  <div className="px-4 py-2 glass rounded-full">
                    <p className="text-sm text-silver">Base Sepolia</p>
                  </div>
                </div>

                {/* ETH Balance - Prominent Display */}
                <div className="glass p-8 mb-6 border-2 border-light-blue/30 relative overflow-hidden group hover:border-light-blue/60 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-light-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full glass flex items-center justify-center glow-blue">
                        <Wallet className="w-8 h-8 text-ice-blue" />
                      </div>
                      <div>
                        <p className="text-silver text-sm mb-1">Native Balance</p>
                        <p className="text-2xl font-bold text-ice-blue">Ethereum (ETH)</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-5xl font-bold gradient-text-purple mb-2 tracking-tight">
                        {balance ? `${parseFloat(formatEther(balance.value)).toFixed(4)}` : '0.0000'}
                      </p>
                      <p className="text-silver text-sm">ETH</p>
                    </div>
                  </div>
                </div>

                {/* Token Balances Header */}
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-ice-blue">Token Assets</h4>
                  {!isLoadingTokens && !isLoadingBalances && (
                    <p className="text-sm text-silver">{balances.length} tokens</p>
                  )}
                </div>

                {/* Token Balances */}
                {isLoadingTokens || isLoadingBalances ? (
                  <div className="glass p-8 text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full glass flex items-center justify-center animate-pulse">
                      <Coins className="w-6 h-6 text-light-blue" />
                    </div>
                    <p className="text-silver">Loading your assets...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {balances.map((token, index) => {
                      const hasBalance = parseFloat(token.balanceFormatted) > 0;
                      return (
                        <div
                          key={token.address}
                          className={`glass p-6 hover:border-light-blue/50 transition-all duration-300 cursor-pointer group ${hasBalance ? 'border-2 border-light-blue/20' : ''}`}
                          style={{ animationDelay: `${0.3 + index * 0.05}s` }}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-12 h-12 rounded-full glass flex items-center justify-center ${hasBalance ? 'glow-cyan' : ''} group-hover:scale-110 transition-transform duration-300`}>
                                <Coins className="w-6 h-6 text-light-blue" />
                              </div>
                              <div>
                                <p className="font-bold text-lg text-ice-blue group-hover:text-glow transition-colors">
                                  {token.symbol}
                                </p>
                                <p className="text-xs text-silver font-mono">
                                  {token.address.slice(0, 6)}...{token.address.slice(-4)}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="mt-3">
                            <p className={`text-3xl font-bold ${hasBalance ? 'gradient-text-purple' : 'text-silver'} mb-1`}>
                              {parseFloat(token.balanceFormatted).toFixed(token.decimals === 18 ? 2 : 4)}
                            </p>
                            <p className="text-xs text-silver uppercase tracking-wide">{token.symbol}</p>
                          </div>
                          {hasBalance && (
                            <div className="mt-4 pt-4 border-t border-light-blue/20">
                              <p className="text-xs text-green-400">✓ Available for transfer</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Empty State */}
                {!isLoadingTokens && !isLoadingBalances && balances.length === 0 && (
                  <div className="glass p-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full glass flex items-center justify-center">
                      <Coins className="w-8 h-8 text-silver" />
                    </div>
                    <h4 className="text-xl font-semibold text-ice-blue mb-2">No Tokens Found</h4>
                    <p className="text-silver mb-6">Get started by receiving some tokens</p>
                    <Button
                      onClick={() => router.push("/transfer")}
                      className="btn-space glow-effect"
                    >
                      Start a Transfer
                    </Button>
                  </div>
                )}
              </div>

              {/* Wallet Address Card */}
              <div className="glass-dark p-8 animate-fade-in" style={{ animationDelay: "0.25s" }}>
                <h3 className="text-xl font-semibold text-ice-blue mb-4">Wallet Address</h3>
                <div className="glass p-6 border-2 border-light-blue/20 hover:border-light-blue/40 transition-all duration-300">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-silver mb-2">Your connected wallet</p>
                      <p className="text-ice-blue font-mono text-base break-all md:truncate">
                        {address}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={handleCopyAddress}
                        className="glass glow-effect h-12 w-12 hover:scale-110 transition-transform"
                        title={copied ? "Copied!" : "Copy address"}
                      >
                        {copied ? (
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                        ) : (
                          <Copy className="w-5 h-5 text-ice-blue" />
                        )}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        asChild
                        className="glass glow-effect h-12 w-12 hover:scale-110 transition-transform"
                        title="View on BaseScan"
                      >
                        <a
                          href={`https://sepolia.basescan.org/address/${address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-5 h-5 text-ice-blue" />
                        </a>
                      </Button>
                    </div>
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
              <div className="glass-dark p-8 animate-fade-in" style={{ animationDelay: "0.4s" }}>
                <h3 className="text-2xl font-bold gradient-text-purple mb-6">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => router.push("/transfer")}
                    className="glass p-6 border-2 border-light-blue/30 hover:border-light-blue/60 transition-all duration-300 group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-light-blue/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative z-10">
                      <div className="w-14 h-14 mx-auto mb-4 rounded-full glass flex items-center justify-center glow-blue group-hover:scale-110 transition-transform duration-300">
                        <Send className="w-7 h-7 text-ice-blue" />
                      </div>
                      <h4 className="text-lg font-bold text-ice-blue group-hover:text-glow transition-colors mb-2">Send Money</h4>
                      <p className="text-sm text-silver">Transfer to anyone, anywhere</p>
                    </div>
                  </button>

                  <button
                    onClick={() => router.push("/history")}
                    className="glass p-6 border-2 border-light-blue/30 hover:border-light-blue/60 transition-all duration-300 group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative z-10">
                      <div className="w-14 h-14 mx-auto mb-4 rounded-full glass flex items-center justify-center glow-purple group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-7 h-7 text-ice-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-bold text-ice-blue group-hover:text-glow transition-colors mb-2">Transaction History</h4>
                      <p className="text-sm text-silver">View all your transfers</p>
                    </div>
                  </button>
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
