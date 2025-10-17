"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Check, Loader2, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

type TransferStep = "amount" | "recipient" | "confirm" | "processing" | "success";

interface TransferData {
  fromCurrency: string;
  toCurrency: string;
  amount: string;
  recipientName: string;
  recipientPhone: string;
  recipientCountry: string;
}

export default function TransferPage() {
  const router = useRouter();
  const [step, setStep] = useState<TransferStep>("amount");
  const [transferData, setTransferData] = useState<TransferData>({
    fromCurrency: "USD",
    toCurrency: "EUR",
    amount: "",
    recipientName: "",
    recipientPhone: "",
    recipientCountry: "France",
  });

  const [estimatedFee, setEstimatedFee] = useState<number>(0);
  const [estimatedTotal, setEstimatedTotal] = useState<number>(0);
  const [exchangeRate] = useState<number>(0.92);

  const handleNext = () => {
    if (step === "amount") setStep("recipient");
    else if (step === "recipient") setStep("confirm");
    else if (step === "confirm") handleConfirm();
  };

  const handleConfirm = () => {
    setStep("processing");
    // Simulate processing
    setTimeout(() => {
      setStep("success");
    }, 2000);
  };

  const handleBack = () => {
    if (step === "recipient") setStep("amount");
    else if (step === "confirm") setStep("recipient");
  };

  const updateAmount = (value: string) => {
    setTransferData({ ...transferData, amount: value });
    const amt = parseFloat(value) || 0;
    const fee = amt * 0.015; // 1.5% fee
    setEstimatedFee(fee);
    setEstimatedTotal(amt + fee);
  };

  const canProceed = () => {
    if (step === "amount") return parseFloat(transferData.amount) > 0;
    if (step === "recipient") return transferData.recipientName && transferData.recipientPhone;
    return true;
  };

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
                  <Label className="text-ice-blue mb-2 block">You send</Label>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={transferData.amount}
                        onChange={(e) => updateAmount(e.target.value)}
                        className="glass text-2xl h-14 text-ice-blue border-light-blue/30"
                      />
                    </div>
                    <Select value={transferData.fromCurrency} onValueChange={(v) => setTransferData({ ...transferData, fromCurrency: v })}>
                      <SelectTrigger className="w-32 glass h-14 border-light-blue/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
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
                        value={(parseFloat(transferData.amount) * exchangeRate || 0).toFixed(2)}
                        disabled
                        className="glass text-2xl h-14 text-ice-blue border-light-blue/30"
                      />
                    </div>
                    <Select value={transferData.toCurrency} onValueChange={(v) => setTransferData({ ...transferData, toCurrency: v })}>
                      <SelectTrigger className="w-32 glass h-14 border-light-blue/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {parseFloat(transferData.amount) > 0 && (
                  <div className="glass p-4 space-y-2 animate-fade-in">
                    <div className="flex justify-between text-sm">
                      <span className="text-silver">Exchange rate</span>
                      <span className="text-ice-blue">1 {transferData.fromCurrency} = {exchangeRate} {transferData.toCurrency}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-silver">Fee (1.5%)</span>
                      <span className="text-ice-blue">{estimatedFee.toFixed(2)} {transferData.fromCurrency}</span>
                    </div>
                    <div className="h-px bg-light-blue/20 my-2" />
                    <div className="flex justify-between font-semibold">
                      <span className="text-ice-blue">Total amount</span>
                      <span className="text-glow">{estimatedTotal.toFixed(2)} {transferData.fromCurrency}</span>
                    </div>
                  </div>
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
                  <Label className="text-ice-blue mb-2 block">Phone number</Label>
                  <Input
                    placeholder="+33 6 12 34 56 78"
                    value={transferData.recipientPhone}
                    onChange={(e) => setTransferData({ ...transferData, recipientPhone: e.target.value })}
                    className="glass h-12 text-ice-blue border-light-blue/30"
                  />
                </div>

                <div>
                  <Label className="text-ice-blue mb-2 block">Country</Label>
                  <Select value={transferData.recipientCountry} onValueChange={(v) => setTransferData({ ...transferData, recipientCountry: v })}>
                    <SelectTrigger className="glass h-12 border-light-blue/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="France">France</SelectItem>
                      <SelectItem value="Germany">Germany</SelectItem>
                      <SelectItem value="Spain">Spain</SelectItem>
                      <SelectItem value="Italy">Italy</SelectItem>
                    </SelectContent>
                  </Select>
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
          {step === "confirm" && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-dark p-8"
            >
              <h2 className="text-2xl font-bold text-glow mb-6">Confirm transfer</h2>

              <div className="space-y-6">
                <div className="glass p-6 space-y-4">
                  <div>
                    <p className="text-sm text-silver mb-1">You send</p>
                    <p className="text-3xl font-bold gradient-text-purple">{transferData.amount} {transferData.fromCurrency}</p>
                  </div>
                  <div className="h-px bg-light-blue/20" />
                  <div>
                    <p className="text-sm text-silver mb-1">Recipient gets</p>
                    <p className="text-2xl font-bold text-ice-blue">{(parseFloat(transferData.amount) * exchangeRate).toFixed(2)} {transferData.toCurrency}</p>
                  </div>
                </div>

                <div className="glass p-6 space-y-3">
                  <h3 className="font-semibold text-ice-blue mb-4">Recipient details</h3>
                  <div className="flex justify-between">
                    <span className="text-silver">Name</span>
                    <span className="text-ice-blue">{transferData.recipientName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-silver">Phone</span>
                    <span className="text-ice-blue">{transferData.recipientPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-silver">Country</span>
                    <span className="text-ice-blue">{transferData.recipientCountry}</span>
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
                    <span className="text-ice-blue">{estimatedFee.toFixed(2)} {transferData.fromCurrency}</span>
                  </div>
                  <div className="h-px bg-light-blue/20" />
                  <div className="flex justify-between font-semibold text-lg">
                    <span className="text-ice-blue">Total</span>
                    <span className="text-glow">{estimatedTotal.toFixed(2)} {transferData.fromCurrency}</span>
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
              <h2 className="text-2xl font-bold text-glow mb-4">Processing your transfer</h2>
              <p className="text-silver">Please wait while we process your transaction...</p>
            </motion.div>
          )}

          {/* Step 5: Success */}
          {step === "success" && (
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
                  <span className="text-silver">Amount sent</span>
                  <span className="text-ice-blue font-semibold">{transferData.amount} {transferData.fromCurrency}</span>
                </div>
                <div className="flex justify-between mb-3">
                  <span className="text-silver">Recipient gets</span>
                  <span className="text-ice-blue font-semibold">{(parseFloat(transferData.amount) * exchangeRate).toFixed(2)} {transferData.toCurrency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-silver">Estimated arrival</span>
                  <span className="text-green-400 font-semibold">5-10 minutes</span>
                </div>
              </div>

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
                    setTransferData({ ...transferData, amount: "", recipientName: "", recipientPhone: "" });
                  }}
                  className="flex-1 btn-space h-12"
                >
                  Send again
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
