"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Check, Loader2, Send, ExternalLink, Wallet } from "lucide-react";
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
import { useSwapQuote } from "@/lib/hooks/useSwapQuote";
import { formatUnits } from "viem";

type TransferStep = "amount" | "recipient" | "confirm" | "processing" | "success";

interface TransferData {
  fromCurrency: string;
  toCurrency: string;
  amount: string;
  recipientName: string;
  recipientBank: string;
  recipientAccount: string;
  paymentMethod: "WALLET" | "MASTERCARD";
  cardDetails?: {
    number: string;
    cvc: string;
    expiry: string;
  };
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
  const [onChainQuoteEnabled, setOnChainQuoteEnabled] = useState(false);
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

  // Map currency to token address
  const getTokenAddress = (currency: string): string | null => {
    const token = availableTokens.find(t => t.symbol === currency);
    return token?.address || null;
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

  // Token decimals configuration
  const tokenDecimals: Record<string, number> = {
    USDC: 6,
    IDRX: 18,
    CNHT: 6,
    EUROC: 6,
    JPYC: 18,
    MXNT: 6,
  };

  // Get on-chain quote for wallet transfers
  const tokenInAddress = getTokenAddress(transferData.fromCurrency);
  const recipientTokenSymbol = mapFiatToToken(transferData.toCurrency);
  const tokenOutAddress = getTokenAddress(recipientTokenSymbol);
  const decimalsIn = tokenDecimals[transferData.fromCurrency] || 6;
  const decimalsOut = tokenDecimals[recipientTokenSymbol] || 6;

  const { quote: swapQuote } = useSwapQuote(
    transferData.paymentMethod === "WALLET" && onChainQuoteEnabled ? tokenInAddress : null,
    transferData.paymentMethod === "WALLET" && onChainQuoteEnabled ? tokenOutAddress : null,
    transferData.amount,
    decimalsIn,
    0.02 // 2% slippage tolerance
  );

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

  // Enable on-chain quote when payment method is WALLET
  useEffect(() => {
    setOnChainQuoteEnabled(transferData.paymentMethod === "WALLET");
  }, [transferData.paymentMethod]);

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

  const handleWalletTransfer = async () => {
    if (!user || !isConnected || !walletAddress) {
      throw new Error("Wallet not connected");
    }

    try {
      if (!tokenInAddress || !tokenOutAddress) {
        throw new Error("Token addresses not found");
      }

      // Ensure we have an on-chain quote
      if (!swapQuote) {
        throw new Error("Unable to fetch on-chain quote. Please try again.");
      }

      // Use minAmountOut from the on-chain quote (already has slippage applied)
      const minAmountOut = formatUnits(swapQuote.minAmountOut, decimalsOut);

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
      const requestData: {
        whatsappNumber: string;
        paymentMethod: string;
        senderCurrency: string;
        senderAmount: number;
        recipientName: string;
        recipientCurrency: string;
        recipientBank: string;
        recipientAccount: string;
        cardDetails?: {
          number: string;
          cvc: string;
          expiry: string;
        };
      } = {
        whatsappNumber: user.whatsappNumber,
        paymentMethod: transferData.paymentMethod,
        senderCurrency: transferData.fromCurrency,
        senderAmount: parseFloat(transferData.amount),
        recipientName: transferData.recipientName,
        recipientCurrency: transferData.toCurrency,
        recipientBank: transferData.recipientBank,
        recipientAccount: transferData.recipientAccount,
      };

      // Add card details for Mastercard payments
      if (transferData.paymentMethod === "MASTERCARD" && transferData.cardDetails) {
        requestData.cardDetails = transferData.cardDetails;
      }

      const response = await transferService.initiateTransfer(requestData);

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
    if (step === "recipient") {
      const hasRecipientInfo = transferData.recipientName && transferData.recipientBank && transferData.recipientAccount;

      // For Mastercard, also validate card details
      if (transferData.paymentMethod === "MASTERCARD") {
        const cardNumber = transferData.cardDetails?.number || "";
        const cardCvc = transferData.cardDetails?.cvc || "";
        const cardExpiry = transferData.cardDetails?.expiry || "";

        const isCardNumberValid = /^\d{13,19}$/.test(cardNumber);
        const isCvcValid = /^\d{3,4}$/.test(cardCvc);
        const isExpiryValid = /^\d{2}\/\d{2}$/.test(cardExpiry);

        return hasRecipientInfo && isCardNumberValid && isCvcValid && isExpiryValid;
      }

      return hasRecipientInfo;
    }
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
              className="glass-dark p-8 md:p-10"
            >
              <div className="mb-8">
                <h2 className="text-3xl font-bold gradient-text-purple mb-2">Send Money</h2>
                <p className="text-silver">Fast, secure, and borderless transfers</p>
              </div>

              <div className="space-y-8">
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
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass p-6 border-2 border-light-blue/30 space-y-4"
                  >
                    <div className="flex items-center justify-between pb-4 border-b border-light-blue/20">
                      <div>
                        <p className="text-sm text-silver mb-1">Exchange Rate</p>
                        <p className="text-lg font-bold text-ice-blue">
                          1 {transferData.fromCurrency} = {quote.exchangeRate.toFixed(4)} {transferData.toCurrency}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-full glass flex items-center justify-center glow-cyan">
                        <svg className="w-5 h-5 text-light-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-silver">Platform Fee ({quote.fee.percentage}%)</span>
                        <span className="text-ice-blue font-semibold">{quote.fee.amount.toFixed(2)} {transferData.fromCurrency}</span>
                      </div>
                      <div className="h-px bg-light-blue/20" />
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-ice-blue font-semibold text-lg">Total Amount</span>
                        <span className="text-2xl font-bold gradient-text-purple">{quote.total.toFixed(2)} {transferData.fromCurrency}</span>
                      </div>
                    </div>
                  </motion.div>
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

                {/* Card Details - Only show for Mastercard */}
                {transferData.paymentMethod === "MASTERCARD" && (
                  <>
                    <div className="h-px bg-light-blue/20 my-4" />
                    <h3 className="text-lg font-semibold text-ice-blue mb-4">💳 Card Details</h3>

                    <div>
                      <Label className="text-ice-blue mb-2 block">Card Number</Label>
                      <Input
                        placeholder="1234 5678 9012 3456"
                        value={transferData.cardDetails?.number || ""}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\s/g, "");
                          setTransferData({
                            ...transferData,
                            cardDetails: {
                              number: value,
                              cvc: transferData.cardDetails?.cvc || "",
                              expiry: transferData.cardDetails?.expiry || "",
                            },
                          });
                        }}
                        maxLength={19}
                        className="glass h-12 text-ice-blue border-light-blue/30"
                      />
                      <p className="text-xs text-silver mt-1">Enter 13-19 digits</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-ice-blue mb-2 block">Expiry Date</Label>
                        <Input
                          placeholder="MM/YY"
                          value={transferData.cardDetails?.expiry || ""}
                          onChange={(e) => {
                            let value = e.target.value.replace(/\D/g, "");
                            if (value.length >= 2) {
                              value = value.slice(0, 2) + "/" + value.slice(2, 4);
                            }
                            setTransferData({
                              ...transferData,
                              cardDetails: {
                                number: transferData.cardDetails?.number || "",
                                cvc: transferData.cardDetails?.cvc || "",
                                expiry: value,
                              },
                            });
                          }}
                          maxLength={5}
                          className="glass h-12 text-ice-blue border-light-blue/30"
                        />
                      </div>

                      <div>
                        <Label className="text-ice-blue mb-2 block">CVC</Label>
                        <Input
                          type="password"
                          placeholder="123"
                          value={transferData.cardDetails?.cvc || ""}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "");
                            setTransferData({
                              ...transferData,
                              cardDetails: {
                                number: transferData.cardDetails?.number || "",
                                cvc: value,
                                expiry: transferData.cardDetails?.expiry || "",
                              },
                            });
                          }}
                          maxLength={4}
                          className="glass h-12 text-ice-blue border-light-blue/30"
                        />
                      </div>
                    </div>
                  </>
                )}
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
              className="glass-dark p-12 text-center relative overflow-hidden"
            >
              {/* Animated background effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-light-blue/5 animate-pulse" />

              <div className="relative z-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500/30 to-green-400/30 flex items-center justify-center glow-cyan border-4 border-green-400/50"
                >
                  <Check className="w-12 h-12 text-green-400" />
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl font-bold gradient-text-purple mb-3"
                >
                  Transfer Successful! 🎉
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-lg text-ice-blue mb-8"
                >
                  Your money is on its way to <span className="font-semibold text-glow">{transferData.recipientName}</span>
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="glass p-8 mb-8 text-left border-2 border-light-blue/30 space-y-4"
                >
                  <div className="pb-4 border-b border-light-blue/20">
                    <h3 className="text-xl font-bold text-ice-blue mb-4">Transaction Summary</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 glass rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full glass flex items-center justify-center">
                          {transferData.paymentMethod === "WALLET" ? (
                            <Wallet className="w-5 h-5 text-light-blue" />
                          ) : (
                            <svg className="w-5 h-5 text-light-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-silver">Payment Method</p>
                          <p className="font-semibold text-ice-blue">{transferData.paymentMethod === "WALLET" ? "Crypto Wallet" : "Mastercard"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 glass rounded-lg">
                        <p className="text-sm text-silver mb-1">You Sent</p>
                        <p className="text-2xl font-bold gradient-text-purple">{transferData.amount}</p>
                        <p className="text-sm text-ice-blue">{transferData.fromCurrency}</p>
                      </div>
                      <div className="p-4 glass rounded-lg">
                        <p className="text-sm text-silver mb-1">They Receive</p>
                        <p className="text-2xl font-bold text-glow">{quote.recipient.amount.toFixed(2)}</p>
                        <p className="text-sm text-ice-blue">{transferData.toCurrency}</p>
                      </div>
                    </div>

                    {transferId && (
                      <div className="p-4 glass rounded-lg">
                        <p className="text-sm text-silver mb-2">Transfer ID</p>
                        <p className="text-ice-blue font-mono text-sm break-all">{transferId}</p>
                      </div>
                    )}

                    {txHash && (
                      <a
                        href={`${config.explorerUrl}/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 glass rounded-lg hover:border-light-blue/50 border-2 border-transparent transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full glass flex items-center justify-center glow-cyan">
                            <ExternalLink className="w-5 h-5 text-light-blue" />
                          </div>
                          <div>
                            <p className="text-sm text-silver">Blockchain Transaction</p>
                            <p className="text-ice-blue font-semibold group-hover:text-glow transition-colors">View on BaseScan</p>
                          </div>
                        </div>
                        <svg className="w-5 h-5 text-silver group-hover:text-ice-blue transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </a>
                    )}
                  </div>
                </motion.div>

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
                        setTransferData({
                          ...transferData,
                          amount: "",
                          recipientName: "",
                          recipientBank: "",
                          recipientAccount: "",
                          cardDetails: undefined,
                        });
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
