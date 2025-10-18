import { useState, useEffect } from "react";
import { usePublicClient } from "wagmi";
import { Address, parseUnits } from "viem";
import { MULTI_TOKEN_SWAP_ABI } from "../contracts/abis";
import { CONTRACT_ADDRESSES } from "../config";

export interface SwapQuote {
  estimatedOut: bigint;
  fee: bigint;
  netOut: bigint;
  minAmountOut: bigint; // With slippage applied
}

export function useSwapQuote(
  tokenIn: string | null,
  tokenOut: string | null,
  amountIn: string, // Human readable
  decimalsIn: number,
  slippageTolerance: number = 0.02 // 2% default
) {
  const publicClient = usePublicClient();
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuote = async () => {
      if (!publicClient || !tokenIn || !tokenOut || !amountIn || parseFloat(amountIn) <= 0) {
        setQuote(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Convert amount to wei/token units
        const amountInWei = parseUnits(amountIn, decimalsIn);

        console.log("📊 Fetching on-chain quote...");
        console.log("   Token In:", tokenIn);
        console.log("   Token Out:", tokenOut);
        console.log("   Amount In:", amountInWei.toString());

        // Call getEstimatedOutput on the MultiTokenSwap contract
        const result = await publicClient.readContract({
          address: CONTRACT_ADDRESSES.MULTI_TOKEN_SWAP as Address,
          abi: MULTI_TOKEN_SWAP_ABI,
          functionName: "getEstimatedOutput",
          args: [tokenIn as Address, tokenOut as Address, amountInWei],
        }) as [bigint, bigint, bigint];

        const [estimatedOut, fee, netOut] = result;

        console.log("✅ Quote received:");
        console.log("   Estimated Out:", estimatedOut.toString());
        console.log("   Fee:", fee.toString());
        console.log("   Net Out:", netOut.toString());

        // Apply slippage tolerance to net output
        const minAmountOut = BigInt(
          Math.floor(Number(netOut) * (1 - slippageTolerance))
        );

        console.log(`   Min Amount Out (${slippageTolerance * 100}% slippage):`, minAmountOut.toString());

        setQuote({
          estimatedOut,
          fee,
          netOut,
          minAmountOut,
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch quote";
        console.error("Error fetching quote:", errorMessage);
        setError(errorMessage);
        setQuote(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce quote fetching
    const timeout = setTimeout(fetchQuote, 500);
    return () => clearTimeout(timeout);
  }, [publicClient, tokenIn, tokenOut, amountIn, decimalsIn, slippageTolerance]);

  return {
    quote,
    isLoading,
    error,
  };
}
