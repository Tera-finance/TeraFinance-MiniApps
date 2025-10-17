import { useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { TOKEN_ADDRESSES } from "@/lib/config";

// ERC20 ABI for balanceOf function
const ERC20_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
] as const;

interface UseTokenBalanceProps {
  address: string | undefined;
  tokenAddress?: string;
  decimals?: number;
}

export function useTokenBalance({
  address,
  tokenAddress = TOKEN_ADDRESSES.USDC,
  decimals = 6,
}: UseTokenBalanceProps) {
  const { data, isError, isLoading, refetch } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const balance = data ? formatUnits(data, decimals) : "0";
  const balanceFormatted = parseFloat(balance).toFixed(2);

  return {
    balance,
    balanceFormatted,
    balanceRaw: data,
    isLoading,
    isError,
    refetch,
  };
}
