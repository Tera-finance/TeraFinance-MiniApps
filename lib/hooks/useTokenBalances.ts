import { useState, useEffect } from "react";
import { usePublicClient, useAccount } from "wagmi";
import { Address, formatUnits } from "viem";
import { ERC20_ABI } from "../contracts/abis";

export interface TokenBalance {
  symbol: string;
  address: string;
  balance: bigint;
  balanceFormatted: string;
  decimals: number;
}

export function useTokenBalances(tokenAddresses: { symbol: string; address: string }[]) {
  const { address: walletAddress } = useAccount();
  const publicClient = usePublicClient();
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBalances = async () => {
      if (!publicClient || !walletAddress || tokenAddresses.length === 0) {
        setBalances([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const balancePromises = tokenAddresses.map(async (token) => {
          try {
            // Fetch balance
            const balance = (await publicClient.readContract({
              address: token.address as Address,
              abi: ERC20_ABI,
              functionName: "balanceOf",
              args: [walletAddress as Address],
            })) as bigint;

            // Fetch decimals
            const decimals = (await publicClient.readContract({
              address: token.address as Address,
              abi: ERC20_ABI,
              functionName: "decimals",
            })) as number;

            const balanceFormatted = formatUnits(balance, decimals);

            return {
              symbol: token.symbol,
              address: token.address,
              balance,
              balanceFormatted,
              decimals,
            };
          } catch (err) {
            console.error(`Error fetching balance for ${token.symbol}:`, err);
            return {
              symbol: token.symbol,
              address: token.address,
              balance: 0n,
              balanceFormatted: "0",
              decimals: 18,
            };
          }
        });

        const results = await Promise.all(balancePromises);
        setBalances(results);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch balances";
        console.error("Error fetching token balances:", errorMessage);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalances();
  }, [publicClient, walletAddress, tokenAddresses]);

  return {
    balances,
    isLoading,
    error,
  };
}
