"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Check, Loader2, Send, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { exchangeService } from "@/lib/api/exchangeService";
import { transferService } from "@/lib/api/transferService";
import { blockchainService } from "@/lib/api/blockchainService";
import { SUPPORTED_CURRENCIES, config } from "@/lib/config";
import type { TransferQuote } from "@/lib/types";
import { InvoiceDownload } from "@/components/history/InvoiceDownload";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useTokenSwap } from "@/lib/hooks/useTokenSwap";

type TransferStep = "amount" | "recipient" | "confirm" | "processing" | "success";

interface TransferData {
  fromCurrency: string;
  toCurrency: string;
  amount: string;
  recipientName: string;
  recipientBank: string;
  recipientAccount: string;
  paymentMethod: "WALLET" | "MASTERCARD";
}

interface Token {
  symbol: string;
  address: string;
}

export default function TransferPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { address: walletAddress, isConnected } = useAccount();
  const { swapTokens, isApproving, isSwapping, error: swapError } = useTokenSwap();

  const [step, setStep] = useState<TransferStep>("amount");
  const [transferData, setTransferData] = useState<TransferData>({
    fromCurrency: "USDC",
    toCurrency: "IDR",
    amount: "",
    recipientName: "",
    recipientBank: "",
    recipientAccount: "",
    paymentMethod: "WALLET",
  });

  const [quote, setQuote] = useState<TransferQuote | null>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [transferId, setTransferId] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [availableTokens, setAvailableTokens] = useState<Token[]>([]);
  const [isLoadingTokens, setIsLoadingTokens] = useState(true);

  // Fetch available tokens from database
  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const response = await blockchainService.getTokens();
        if (response.success && response.data) {
          // Convert tokens object to array
          // { usdc: "0x...", idrx: "0x..." } => [{ symbol: "USDC", address: "0x..." }]
          const mappedTokens: Token[] = Object.entries(response.data.tokens).map(([symbol, address]) => ({
            symbol: symbol.toUpperCase(),
            address: address,
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

  // Map currency to token address
  const getTokenAddress = (currency: string): string | null => {
    const token = availableTokens.find(t => t.symbol === currency);
    return token?.address || null;
  };

  // Get available sender currencies based on payment method
  const getAvailableSenderCurrencies = () => {
    if (transferData.paymentMethod === "WALLET") {
      // For wallet: show crypto tokens from database
      return availableTokens.map(t => t.symbol);
    } else {
      // For Mastercard: show fiat currencies
      return SUPPORTED_CURRENCIES.FIAT;
    }
  };

  // Get available recipient currencies (always FIAT)
  const getAvailableRecipientCurrencies = () => {
    return SUPPORTED_CURRENCIES.FIAT;
  };

  // Fetch quote when amount changes
  useEffect(() => {
    const fetchQuote = async () => {
      const amount = parseFloat(transferData.amount);
      if (amount > 0 && transferData.fromCurrency && transferData.toCurrency) {
        setIsLoadingQuote(true);
        setError(null);
        try {
          const response = await exchangeService.getQuote(
            transferData.fromCurrency,
            transferData.toCurrency,
            amount
          );
          if (response.success && response.data) {
            setQuote(response.data);
          } else {
            setError(response.error || "Failed to fetch quote");
          }
        } catch {
          setError("Failed to fetch quote");
        } finally {
          setIsLoadingQuote(false);
        }
      } else {
        setQuote(null);
      }
    };

    const debounce = setTimeout(fetchQuote, 500);
    return () => clearTimeout(debounce);
  }, [transferData.amount, transferData.fromCurrency, transferData.toCurrency]);

  const handleNext = () => {
    if (step === "amount") setStep("recipient");
    else if (step === "recipient") setStep("confirm");
    else if (step === "confirm") handleConfirm();
  };

  const handleConfirm = async () => {
    if (!user) {
      setError("Please login first");
      router.push("/login");
      return;
    }

    // Check wallet connection for WALLET payment method
    if (transferData.paymentMethod === "WALLET" && !isConnected) {
      setError("Please connect your wallet first to use Crypto Wallet payment method");
      return;
    }

    setStep("processing");
    setError(null);

    try {
      if (transferData.paymentMethod === "WALLET") {
        // WALLET FLOW: User signs transaction
        await handleWalletTransfer();
      } else {
        // MASTERCARD FLOW: Backend mints and swaps
        await handleMastercardTransfer();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to process transfer";
      setError(errorMessage);
      setStep("confirm");
    }
  };

  // Map fiat currency to token symbol (e.g., IDR -> IDRX, USD -> USDC)
  const mapFiatToToken = (fiatCurrency: string): string => {
    const mapping: Record<string, string> = {
      USD: "USDC",
      IDR: "IDRX",
      CNH: "CNHT",
      EUR: "EUROC",
      JPY: "JPYC",
      MXN: "MXNT",
    };
    return mapping[fiatCurrency] || fiatCurrency;
  };

  const handleWalletTransfer = async () => {
    if (!user || !isConnected || !walletAddress) {
      throw new Error("Wallet not connected");
    }

    try {
      // Get token addresses (map fiat to token for recipient)
      const tokenInAddress = getTokenAddress(transferData.fromCurrency);
      const recipientToken = mapFiatToToken(transferData.toCurrency);
      const tokenOutAddress = getTokenAddress(recipientToken);

      if (!tokenInAddress || !tokenOutAddress) {
        throw new Error("Token addresses not found");
      }

      // Use standard 6 decimals for stablecoins
      const decimalsIn = 6;
      const decimalsOut = 6;

      // TEMPORARY FIX: Set minAmountOut to 1 to allow swap to complete
      // TODO: The MultiTokenSwap smart contract needs proper exchange rate configuration
      // Expected: 1 USDC should return ~16,000 IDRX (1:16000 ratio)
      // Current: Smart contract may be using 1:1 or different rate
      // Action needed: Update smart contract with correct price oracle/rates
      const minAmountOut = "1";

      // Execute swap via user's wallet
      const { swapTxHash } = await swapTokens({
        tokenInAddress,
        tokenOutAddress,
        amountIn: transferData.amount,
        recipientAddress: walletAddress, // User receives tokens
        minAmountOut,
        decimalsIn,
        decimalsOut,
      });

      // Submit transaction to backend for tracking
      const response = await transferService.submitWalletTransfer({
        whatsappNumber: user.whatsappNumber,
        senderCurrency: transferData.fromCurrency,
        senderAmount: parseFloat(transferData.amount),
        recipientName: transferData.recipientName,
        recipientCurrency: transferData.toCurrency,
        recipientBank: transferData.recipientBank,
        recipientAccount: transferData.recipientAccount,
        txHash: swapTxHash,
        tokenInAddress,
        tokenOutAddress,
      });

      if (response.success && response.data) {
        setTransferId(response.data.transferId);
        setTxHash(swapTxHash);
        // Poll for confirmation
        pollTransferStatus(response.data.transferId);
      } else {
        throw new Error(response.error || "Failed to submit transfer");
      }
    } catch (error) {
      console.error("Wallet transfer error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to execute wallet transfer";
      throw new Error(errorMessage);
    }
  };

  const handleMastercardTransfer = async () => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      const response = await transferService.initiateTransfer({
        whatsappNumber: user.whatsappNumber,
        paymentMethod: transferData.paymentMethod,
        senderCurrency: transferData.fromCurrency,
        senderAmount: parseFloat(transferData.amount),
        recipientName: transferData.recipientName,
        recipientCurrency: transferData.toCurrency,
        recipientBank: transferData.recipientBank,
        recipientAccount: transferData.recipientAccount,
      });

      if (response.success && response.data) {
        setTransferId(response.data.transferId);
        // Poll for status updates
        pollTransferStatus(response.data.transferId);
      } else {
        throw new Error(response.error || "Failed to initiate transfer");
      }
    } catch (error) {
      console.error("Mastercard transfer error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to process Mastercard transfer";
      throw new Error(errorMessage);
    }
  };

  const pollTransferStatus = async (id: string) => {
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes with 5 second intervals

    const poll = async () => {
      try {
        const response = await transferService.getTransferStatus(id);
        if (response.success && response.data) {
          const status = response.data.status;

          if (status === "completed" || status === "paid") {
            setTxHash(response.data.txHash || null);
            setStep("success");
            return;
          } else if (status === "failed" || status === "cancelled") {
            setError("Transfer failed. Please try again.");
            setStep("confirm");
            return;
          }

          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(poll, 5000); // Poll every 5 seconds
          } else {
            // Still processing after max attempts
            setStep("success");
          }
        }
      } catch (err) {
        console.error("Failed to poll transfer status:", err);
        // Continue polling even on error
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000);
        }
      }
    };

    poll();
  };

  const handleBack = () => {
    if (step === "recipient") setStep("amount");
    else if (step === "confirm") setStep("recipient");
  };

  const canProceed = () => {
    if (step === "amount") return parseFloat(transferData.amount) > 0 && quote && !isLoadingTokens;
    if (step === "recipient")
      return transferData.recipientName && transferData.recipientBank && transferData.recipientAccount;
    return true;
  };

  const availableSenderCurrencies = getAvailableSenderCurrencies();
  const availableRecipientCurrencies = getAvailableRecipientCurrencies();

  // Update swap error display
  useEffect(() => {
    if (swapError) {
      setError(swapError);
    }
  }, [swapError]);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-4 mb-4">
            {step !== "success" && step !== "processing" && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => step === "amount" ? router.push("/") : handleBack()}
                className="glass glow-effect"
              >
                <ArrowLeft className="w-5 h-5 text-ice-blue" />
              </Button>
            )}
            <h1 className="text-3xl font-bold gradient-text-purple">Send Money</h1>
          </div>

          {/* Progress Indicator */}
          {step !== "success" && step !== "processing" && (
            <div className="flex gap-2 mb-6">
              <div className={`h-1 flex-1 rounded-full transition-all ${step === "amount" || step === "recipient" || step === "confirm" ? "bg-light-blue glow-blue" : "bg-gray-700"}`} />
              <div className={`h-1 flex-1 rounded-full transition-all ${step === "recipient" || step === "confirm" ? "bg-light-blue glow-blue" : "bg-gray-700"}`} />
              <div className={`h-1 flex-1 rounded-full transition-all ${step === "confirm" ? "bg-light-blue glow-blue" : "bg-gray-700"}`} />
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 p-4 glass-dark border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* Step 1: Amount */}
          {step === "amount" && (
            <motion.div
              key="amount"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-dark p-8"
            >
              <h2 className="text-2xl font-bold text-glow mb-6">How much do you want to send?</h2>

              <div className="space-y-6">
                <div>
                  <Label className="text-ice-blue mb-2 block">Payment Method</Label>
                  <Select
                    value={transferData.paymentMethod}
                    onValueChange={(v: "WALLET" | "MASTERCARD") => setTransferData({ ...transferData, paymentMethod: v })}
                  >
                    <SelectTrigger className="glass h-12 border-light-blue/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WALLET">Crypto Wallet</SelectItem>
                      <SelectItem value="MASTERCARD">Mastercard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-ice-blue mb-2 block">You send</Label>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={transferData.amount}
                        onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })}
                        className="glass text-2xl h-14 text-ice-blue border-light-blue/30"
                      />
                    </div>
                    <Select value={transferData.fromCurrency} onValueChange={(v) => setTransferData({ ...transferData, fromCurrency: v })}>
                      <SelectTrigger className="w-32 glass h-14 border-light-blue/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingTokens ? (
                          <SelectItem value="loading" disabled>Loading...</SelectItem>
                        ) : (
                          availableSenderCurrencies.map((curr) => (
                            <SelectItem key={curr} value={curr}>{curr}</SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-center">
                  <div className="w-10 h-10 rounded-full glass flex items-center justify-center glow-effect">
                    <ArrowRight className="w-5 h-5 text-light-blue" />
                  </div>
                </div>

                <div>
                  <Label className="text-ice-blue mb-2 block">Recipient gets</Label>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <Input
                        type="text"
                        value={isLoadingQuote ? "Calculating..." : (quote?.recipient.amount.toFixed(2) || "0.00")}
                        disabled
                        className="glass text-2xl h-14 text-ice-blue border-light-blue/30"
                      />
                    </div>
                    <Select value={transferData.toCurrency} onValueChange={(v) => setTransferData({ ...transferData, toCurrency: v })}>
                      <SelectTrigger className="w-32 glass h-14 border-light-blue/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRecipientCurrencies.map((curr) => (
                          <SelectItem key={curr} value={curr}>{curr}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {quote && (
                  <div className="glass p-4 space-y-2 animate-fade-in">
                    <div className="flex justify-between text-sm">
                      <span className="text-silver">Exchange rate</span>
                      <span className="text-ice-blue">1 {transferData.fromCurrency} = {quote.exchangeRate.toFixed(4)} {transferData.toCurrency}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-silver">Fee ({quote.fee.percentage}%)</span>
                      <span className="text-ice-blue">{quote.fee.amount.toFixed(2)} {transferData.fromCurrency}</span>
                    </div>
                    <div className="h-px bg-light-blue/20 my-2" />
                    <div className="flex justify-between font-semibold">
                      <span className="text-ice-blue">Total amount</span>
                      <span className="text-glow">{quote.total.toFixed(2)} {transferData.fromCurrency}</span>
                    </div>
                  </div>
                )}
              </div>

              <Button
                onClick={handleNext}
                disabled={!canProceed() || isLoadingQuote}
                className="w-full mt-8 btn-space h-12 text-lg"
              >
                {isLoadingQuote ? "Loading..." : "Continue"}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          )}

          {/* Step 2: Recipient */}
          {step === "recipient" && (
            <motion.div
              key="recipient"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-dark p-8"
            >
              <h2 className="text-2xl font-bold text-glow mb-6">Who are you sending to?</h2>

              <div className="space-y-6">
                <div>
                  <Label className="text-ice-blue mb-2 block">Recipient name</Label>
                  <Input
                    placeholder="John Doe"
                    value={transferData.recipientName}
                    onChange={(e) => setTransferData({ ...transferData, recipientName: e.target.value })}
                    className="glass h-12 text-ice-blue border-light-blue/30"
                  />
                </div>

                <div>
                  <Label className="text-ice-blue mb-2 block">Bank name</Label>
                  <Input
                    placeholder="Bank of America"
                    value={transferData.recipientBank}
                    onChange={(e) => setTransferData({ ...transferData, recipientBank: e.target.value })}
                    className="glass h-12 text-ice-blue border-light-blue/30"
                  />
                </div>

                <div>
                  <Label className="text-ice-blue mb-2 block">Account number</Label>
                  <Input
                    placeholder="1234567890"
                    value={transferData.recipientAccount}
                    onChange={(e) => setTransferData({ ...transferData, recipientAccount: e.target.value })}
                    className="glass h-12 text-ice-blue border-light-blue/30"
                  />
                </div>
              </div>

              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="w-full mt-8 btn-space h-12 text-lg"
              >
                Continue
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          )}

          {/* Step 3: Confirm */}
          {step === "confirm" && quote && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-dark p-8"
            >
              <h2 className="text-2xl font-bold text-glow mb-6">Confirm transfer</h2>

              {transferData.paymentMethod === "WALLET" && !isConnected && (
                <div className="mb-6 p-4 glass border border-yellow-500/30 rounded-lg">
                  <p className="text-yellow-400 text-sm mb-3">Please connect your wallet to continue with Crypto Wallet payment</p>
                  <div className="flex justify-center">
                    <ConnectButton />
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <div className="glass p-6 space-y-4">
                  <div>
                    <p className="text-sm text-silver mb-1">You send</p>
                    <p className="text-3xl font-bold gradient-text-purple">{transferData.amount} {transferData.fromCurrency}</p>
                  </div>
                  <div className="h-px bg-light-blue/20" />
                  <div>
                    <p className="text-sm text-silver mb-1">Recipient gets</p>
                    <p className="text-2xl font-bold text-ice-blue">{quote.recipient.amount.toFixed(2)} {transferData.toCurrency}</p>
                  </div>
                </div>

                <div className="glass p-6 space-y-3">
                  <h3 className="font-semibold text-ice-blue mb-4">Recipient details</h3>
                  <div className="flex justify-between">
                    <span className="text-silver">Name</span>
                    <span className="text-ice-blue">{transferData.recipientName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-silver">Bank</span>
                    <span className="text-ice-blue">{transferData.recipientBank}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-silver">Account</span>
                    <span className="text-ice-blue">{transferData.recipientAccount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-silver">Payment Method</span>
                    <span className="text-ice-blue">{transferData.paymentMethod === "WALLET" ? "Crypto Wallet" : "Mastercard"}</span>
                  </div>
                </div>

                <div className="glass p-6 space-y-3">
                  <h3 className="font-semibold text-ice-blue mb-4">Fee breakdown</h3>
                  <div className="flex justify-between">
                    <span className="text-silver">Transfer amount</span>
                    <span className="text-ice-blue">{transferData.amount} {transferData.fromCurrency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-silver">Fee</span>
                    <span className="text-ice-blue">{quote.fee.amount.toFixed(2)} {transferData.fromCurrency}</span>
                  </div>
                  <div className="h-px bg-light-blue/20" />
                  <div className="flex justify-between font-semibold text-lg">
                    <span className="text-ice-blue">Total</span>
                    <span className="text-glow">{quote.total.toFixed(2)} {transferData.fromCurrency}</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleConfirm}
                className="w-full mt-8 btn-space h-12 text-lg glow-effect"
              >
                <Send className="w-5 h-5 mr-2" />
                Confirm & Send
              </Button>
            </motion.div>
          )}

          {/* Step 4: Processing */}
          {step === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-dark p-12 text-center"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full glass flex items-center justify-center glow-effect">
                <Loader2 className="w-10 h-10 text-light-blue animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-glow mb-4">
                {isApproving && "Approving token..."}
                {isSwapping && !isApproving && "Executing swap..."}
                {!isApproving && !isSwapping && "Processing your transfer"}
              </h2>
              <p className="text-silver">
                {transferData.paymentMethod === "WALLET"
                  ? "Please confirm the transaction in your wallet..."
                  : "Please wait while we process your transaction on the blockchain..."}
              </p>
              {isApproving && (
                <p className="text-yellow-400 mt-4 text-sm">Step 1 of 2: Approving tokens</p>
              )}
              {isSwapping && !isApproving && (
                <p className="text-light-blue mt-4 text-sm">Step 2 of 2: Swapping tokens</p>
              )}
            </motion.div>
          )}

          {/* Step 5: Success */}
          {step === "success" && quote && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-dark p-12 text-center"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center glow-cyan animate-pulse-blue">
                <Check className="w-10 h-10 text-green-400" />
              </div>
              <h2 className="text-3xl font-bold gradient-text-purple mb-4">Transfer successful!</h2>
              <p className="text-silver mb-8">Your money is on its way to {transferData.recipientName}</p>

              <div className="glass p-6 mb-8 text-left">
                <div className="flex justify-between mb-3">
                  <span className="text-silver">Payment Method</span>
                  <span className="text-ice-blue font-semibold">{transferData.paymentMethod === "WALLET" ? "Crypto Wallet" : "Mastercard"}</span>
                </div>
                <div className="flex justify-between mb-3">
                  <span className="text-silver">Amount sent</span>
                  <span className="text-ice-blue font-semibold">{transferData.amount} {transferData.fromCurrency}</span>
                </div>
                <div className="flex justify-between mb-3">
                  <span className="text-silver">Recipient gets</span>
                  <span className="text-ice-blue font-semibold">{quote.recipient.amount.toFixed(2)} {transferData.toCurrency}</span>
                </div>
                {transferId && (
                  <div className="flex justify-between mb-3">
                    <span className="text-silver">Transfer ID</span>
                    <span className="text-ice-blue font-mono text-xs">{transferId}</span>
                  </div>
                )}
                {txHash && (
                  <div className="flex justify-between items-center">
                    <span className="text-silver">Blockchain Transaction</span>
                    <a
                      href={`${config.explorerUrl}/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-light-blue hover:text-ice-blue flex items-center gap-1"
                    >
                      View on Basescan
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {transferId && (
                  <div className="flex justify-center">
                    <InvoiceDownload transferId={transferId} recipientName={transferData.recipientName} />
                  </div>
                )}
                <div className="flex gap-4">
                  <Button
                    onClick={() => router.push("/history")}
                    variant="outline"
                    className="flex-1 glass border-light-blue/30 h-12"
                  >
                    View history
                  </Button>
                  <Button
                    onClick={() => {
                      setStep("amount");
                      setTransferData({ ...transferData, amount: "", recipientName: "", recipientBank: "", recipientAccount: "" });
                      setQuote(null);
                      setTransferId(null);
                      setTxHash(null);
                    }}
                    className="flex-1 btn-space h-12"
                  >
                    Send again
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
