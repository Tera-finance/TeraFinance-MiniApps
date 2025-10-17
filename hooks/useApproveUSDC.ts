import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits } from "viem";
import { TOKEN_ADDRESSES } from "@/lib/config";

// ERC20 ABI for approve function
const ERC20_ABI = [
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
] as const;

interface UseApproveUSDCProps {
  spenderAddress: string;
  amount: string;
}

export function useApproveUSDC({ spenderAddress, amount }: UseApproveUSDCProps) {
  const [status, setStatus] = useState<"idle" | "approving" | "approved" | "error">("idle");
  const [error, setError] = useState<Error | null>(null);

  const { data: hash, writeContract, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isPending || isConfirming) {
      setStatus("approving");
    } else if (isSuccess) {
      setStatus("approved");
    }
  }, [isPending, isConfirming, isSuccess]);

  const approve = async () => {
    try {
      setStatus("approving");
      setError(null);

      const amountInWei = parseUnits(amount, 6); // USDC has 6 decimals

      writeContract({
        address: TOKEN_ADDRESSES.USDC,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [spenderAddress as `0x${string}`, amountInWei],
      });
    } catch (err) {
      setStatus("error");
      setError(err as Error);
      console.error("Approval error:", err);
    }
  };

  return {
    approve,
    status,
    error,
    isApproving: status === "approving",
    isApproved: status === "approved",
    txHash: hash,
  };
}
