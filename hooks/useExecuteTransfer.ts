import { useState, useEffect } from "react";
import { useApproveUSDC } from "./useApproveUSDC";
import { useTransfer } from "./useTransfer";

interface UseExecuteTransferProps {
  recipientAddress: string;
  amount: string;
  spenderAddress?: string; // If using a contract instead of direct transfer
}

type TransferStatus = "idle" | "approving" | "transferring" | "completed" | "error";

export function useExecuteTransfer({
  recipientAddress,
  amount,
  spenderAddress,
}: UseExecuteTransferProps) {
  const [status, setStatus] = useState<TransferStatus>("idle");
  const [error, setError] = useState<Error | null>(null);

  // If spenderAddress is provided, we need approval first
  const approve = useApproveUSDC({
    spenderAddress: spenderAddress || recipientAddress,
    amount,
  });

  const transfer = useTransfer({
    recipientAddress,
    amount,
  });

  // Auto-trigger transfer after approval (if using spender)
  useEffect(() => {
    if (spenderAddress && approve.isApproved && status === "approving") {
      transfer.transfer();
    }
  }, [approve.isApproved, spenderAddress, status]);

  // Update overall status
  useEffect(() => {
    if (approve.isApproving) {
      setStatus("approving");
    } else if (transfer.isTransferring) {
      setStatus("transferring");
    } else if (transfer.isCompleted) {
      setStatus("completed");
    } else if (approve.error || transfer.error) {
      setStatus("error");
      setError(approve.error || transfer.error);
    }
  }, [
    approve.isApproving,
    transfer.isTransferring,
    transfer.isCompleted,
    approve.error,
    transfer.error,
  ]);

  const execute = async () => {
    try {
      setStatus("approving");
      setError(null);

      if (spenderAddress) {
        // If using a spender contract, approve first
        await approve.approve();
        // Transfer will be triggered automatically via useEffect
      } else {
        // Direct transfer without approval
        setStatus("transferring");
        await transfer.transfer();
      }
    } catch (err) {
      setStatus("error");
      setError(err as Error);
      console.error("Execute transfer error:", err);
    }
  };

  return {
    execute,
    status,
    error,
    isIdle: status === "idle",
    isApproving: status === "approving",
    isTransferring: status === "transferring",
    isCompleted: status === "completed",
    isError: status === "error",
    approveTxHash: approve.txHash,
    transferTxHash: transfer.txHash,
  };
}
