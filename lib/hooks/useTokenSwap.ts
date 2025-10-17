import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, Address } from "viem";
import { ERC20_ABI, MULTI_TOKEN_SWAP_ABI } from "../contracts/abis";
import { CONTRACT_ADDRESSES } from "../config";

export interface SwapParams {
  tokenInAddress: string;
  tokenOutAddress: string;
  amountIn: string; // Human readable amount
  recipientAddress: string;
  minAmountOut: string; // Human readable amount
  decimalsIn: number;
  decimalsOut: number;
}

export function useTokenSwap() {
  const { address: userAddress } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [approvalTxHash, setApprovalTxHash] = useState<string | null>(null);
  const [swapTxHash, setSwapTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);

  // Wait for approval transaction
  const { isLoading: isApprovingOnChain, isSuccess: isApproved } =
    useWaitForTransactionReceipt({
      hash: approvalTxHash as Address | undefined,
    });

  // Wait for swap transaction
  const { isLoading: isSwappingOnChain, isSuccess: isSwapSuccess } =
    useWaitForTransactionReceipt({
      hash: swapTxHash as Address | undefined,
    });

  /**
   * Approve token spending
   */
  const approveToken = async (
    tokenAddress: string,
    amount: bigint
  ): Promise<string> => {
    if (!userAddress) throw new Error("Wallet not connected");

    setIsApproving(true);
    setError(null);

    try {
      const hash = await writeContractAsync({
        address: tokenAddress as Address,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [CONTRACT_ADDRESSES.MULTI_TOKEN_SWAP as Address, amount],
      });

      setApprovalTxHash(hash);
      return hash;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to approve token";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsApproving(false);
    }
  };

  /**
   * Execute token swap
   */
  const executeSwap = async (params: SwapParams): Promise<string> => {
    if (!userAddress) throw new Error("Wallet not connected");

    setIsSwapping(true);
    setError(null);

    try {
      // Convert human-readable amounts to wei/token units
      const amountInWei = parseUnits(params.amountIn, params.decimalsIn);
      const minAmountOutWei = parseUnits(
        params.minAmountOut,
        params.decimalsOut
      );

      // Approve first (always approve for safety)
      console.log("Approving token...");
      await approveToken(params.tokenInAddress, amountInWei);

      // Execute swap
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.MULTI_TOKEN_SWAP as Address,
        abi: MULTI_TOKEN_SWAP_ABI,
        functionName: "swap",
        args: [
          params.tokenInAddress as Address,
          params.tokenOutAddress as Address,
          amountInWei,
          params.recipientAddress as Address,
          minAmountOutWei,
        ],
      });

      setSwapTxHash(hash);
      return hash;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to execute swap";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsSwapping(false);
    }
  };

  /**
   * Execute complete swap flow (approve + swap)
   */
  const swapTokens = async (params: SwapParams): Promise<{
    approvalTxHash: string | null;
    swapTxHash: string;
  }> => {
    if (!userAddress) throw new Error("Wallet not connected");

    setError(null);

    try {
      // Execute swap (which includes approval)
      console.log("Executing swap...");
      const swapHash = await executeSwap(params);

      return {
        approvalTxHash: approvalTxHash,
        swapTxHash: swapHash,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to complete swap";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return {
    swapTokens,
    approveToken,
    executeSwap,
    isApproving: isApproving || isApprovingOnChain,
    isSwapping: isSwapping || isSwappingOnChain,
    isApproved,
    isSwapSuccess,
    approvalTxHash,
    swapTxHash,
    error,
    userAddress,
  };
}
