# Frontend Slippage Fix - Solution Implemented

## Problem
The "Too little received" error was occurring because the frontend was calculating `minAmountOut` incorrectly:
```typescript
// WRONG - Used only 10% of expected output
const minAmountOut = (expectedOutputHuman * 0.1).toFixed(0);
```

This didn't account for:
- The actual on-chain exchange rate
- Contract fees (0.5%)
- Uniswap pool fees (0.3%)
- Real-time liquidity conditions

## Solution Implemented

### 1. Created `useSwapQuote` Hook
**File:** `/lib/hooks/useSwapQuote.ts`

This hook:
- Calls `getEstimatedOutput()` on the MultiTokenSwap contract
- Gets the actual on-chain quote including all fees
- Applies configurable slippage tolerance (default 2%)
- Returns `minAmountOut` ready to use

```typescript
const { quote: swapQuote, isLoading: isLoadingSwapQuote } = useSwapQuote(
  tokenInAddress,
  tokenOutAddress,
  transferData.amount,
  decimalsIn,
  0.02 // 2% slippage
);
```

### 2. Updated Transfer Page
**File:** `/app/transfer/page.tsx`

Changes:
- Import the new `useSwapQuote` hook
- Fetch on-chain quote for wallet transfers
- Use `swapQuote.minAmountOut` instead of calculating manually
- Added validation to ensure quote exists before executing swap

**Before:**
```typescript
const expectedOutputHuman = senderAmount * exchangeRate;
const minAmountOut = (expectedOutputHuman * 0.1).toFixed(0); // WRONG!
```

**After:**
```typescript
// Get on-chain quote
const { quote: swapQuote } = useSwapQuote(...);

// Ensure we have a quote
if (!swapQuote) {
  throw new Error("Unable to fetch on-chain quote");
}

// Use the calculated minAmountOut (with 2% slippage applied)
const minAmountOut = formatUnits(swapQuote.minAmountOut, decimalsOut);
```

## How It Works

### Flow:
1. User enters amount to swap
2. `useSwapQuote` hook automatically fetches on-chain quote
3. Contract returns:
   - `estimatedOut`: Raw Uniswap output
   - `fee`: Platform fee (0.5%)
   - `netOut`: Final output after fees
4. Hook applies 2% slippage to `netOut`
5. Calculated `minAmountOut` is used in the swap transaction

### Quote Calculation in Contract:
```solidity
// From MultiTokenSwap.sol
function getEstimatedOutput(address tokenIn, address tokenOut, uint256 amountIn)
    external returns (uint256 estimatedOut, uint256 fee, uint256 netOut)
{
    fee = (amountIn * feeRate) / 10000; // 0.5%
    uint256 swapAmount = amountIn - fee;

    // Get quote from Uniswap
    estimatedOut = quoter.quoteExactInputSingle(...);
    netOut = estimatedOut; // This is what we use

    return (estimatedOut, fee, netOut);
}
```

### Slippage Calculation in Hook:
```typescript
// In useSwapQuote.ts
const minAmountOut = BigInt(
  Math.floor(Number(netOut) * (1 - slippageTolerance))
);
// With 2% slippage: minAmountOut = netOut * 0.98
```

## Testing

### 1. Start the frontend:
```bash
cd Tera-MiniApps
npm run dev
```

### 2. Test a swap:
- Connect your wallet
- Select "Crypto Wallet" as payment method
- Enter amount (e.g., 10 USDC)
- Select recipient currency (e.g., IDR)
- Proceed with the swap
- Check browser console for logs:
  ```
  📊 Fetching on-chain quote...
  ✅ Quote received:
     Estimated Out: [value]
     Fee: [value]
     Net Out: [value]
     Min Amount Out (2% slippage): [value]
  ```

### 3. Verify the swap succeeds
- Transaction should complete without "Too little received" error
- Check transaction on Base Sepolia explorer

## Adjusting Slippage

If swaps still fail, increase slippage tolerance in `app/transfer/page.tsx`:

```typescript
const { quote: swapQuote, isLoading: isLoadingSwapQuote } = useSwapQuote(
  tokenInAddress,
  tokenOutAddress,
  transferData.amount,
  decimalsIn,
  0.05 // Change from 0.02 (2%) to 0.05 (5%)
);
```

Recommended values:
- **1-2%**: Normal conditions (current default)
- **3-5%**: High volatility or low liquidity
- **5%+**: Testing only

## Benefits

1. **Accurate quotes**: Uses real on-chain data instead of exchange rates
2. **Accounts for all fees**: Platform fee + Uniswap fee
3. **Real-time**: Updates automatically as user types
4. **Safer**: Prevents failed transactions from incorrect slippage
5. **User-friendly**: No manual calculation needed

## Files Modified

1. **Created:** `lib/hooks/useSwapQuote.ts` - New hook for fetching on-chain quotes
2. **Modified:** `app/transfer/page.tsx` - Updated to use on-chain quote

## Summary

The fix ensures that `minAmountOut` is calculated from the **actual on-chain quote** with proper slippage protection. Your swaps should now work correctly! 🎉
