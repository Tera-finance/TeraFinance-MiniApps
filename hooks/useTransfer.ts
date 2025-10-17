import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits } from "viem";
import { TOKEN_ADDRESSES } from "@/lib/config";

// ERC20 ABI for transfer function
const ERC20_ABI = [
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
] as const;

interface UseTransferProps {
  recipientAddress: string;
  amount: string;
  tokenAddress?: string;
}

export function useTransfer({
  recipientAddress,
  amount,
  tokenAddress = TOKEN_ADDRESSES.USDC,
}: UseTransferProps) {
  const [status, setStatus] = useState<"idle" | "transferring" | "completed" | "error">("idle");
  const [error, setError] = useState<Error | null>(null);

  const { data: hash, writeContract, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isPending || isConfirming) {
      setStatus("transferring");
    } else if (isSuccess) {
      setStatus("completed");
    }
  }, [isPending, isConfirming, isSuccess]);

  const transfer = async () => {
    try {
      setStatus("transferring");
      setError(null);

      const amountInWei = parseUnits(amount, 6); // USDC has 6 decimals

      writeContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "transfer",
        args: [recipientAddress as `0x${string}`, amountInWei],
      });
    } catch (err) {
      setStatus("error");
      setError(err as Error);
      console.error("Transfer error:", err);
    }
  };

  return {
    transfer,
    status,
    error,
    isTransferring: status === "transferring",
    isCompleted: status === "completed",
    txHash: hash,
  };
}
