import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { parseUnits, formatUnits, Address } from "viem";
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
   * Check token allowance
   */
  const checkAllowance = async (
    tokenAddress: string,
    spenderAddress: string
  ): Promise<bigint> => {
    if (!userAddress) throw new Error("Wallet not connected");

    const { data } = useReadContract({
      address: tokenAddress as Address,
      abi: ERC20_ABI,
      functionName: "allowance",
      args: [userAddress, spenderAddress as Address],
    }) as { data: bigint | undefined };

    return data || BigInt(0);
  };

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
    } catch (err: any) {
      const errorMessage = err.message || "Failed to approve token";
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

      // Check allowance first
      const currentAllowance = await checkAllowance(
        params.tokenInAddress,
        CONTRACT_ADDRESSES.MULTI_TOKEN_SWAP
      );

      // If allowance is insufficient, approve first
      if (currentAllowance < amountInWei) {
        console.log("Insufficient allowance, requesting approval...");
        await approveToken(params.tokenInAddress, amountInWei);

        // Wait for approval to be mined (handled by useWaitForTransactionReceipt)
        // In a real implementation, you'd want to wait here
      }

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
    } catch (err: any) {
      const errorMessage = err.message || "Failed to execute swap";
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
      const amountInWei = parseUnits(params.amountIn, params.decimalsIn);

      // Step 1: Check and approve if needed
      let approvalHash: string | null = null;
      const currentAllowance = await checkAllowance(
        params.tokenInAddress,
        CONTRACT_ADDRESSES.MULTI_TOKEN_SWAP
      );

      if (currentAllowance < amountInWei) {
        console.log("Approving token...");
        approvalHash = await approveToken(params.tokenInAddress, amountInWei);
        // Note: In production, you should wait for approval confirmation
      }

      // Step 2: Execute swap
      console.log("Executing swap...");
      const swapHash = await executeSwap(params);

      return {
        approvalTxHash: approvalHash,
        swapTxHash: swapHash,
      };
    } catch (err: any) {
      const errorMessage = err.message || "Failed to complete swap";
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
