# Wallet Token Balances Feature

## Overview
Enhanced the wallet page to display all ERC20 token balances (USDC, IDRX, CNHT, EUROC, JPYC, MXNT) in addition to ETH balance.

## Changes Made

### 1. Created `useTokenBalances` Hook
**File:** `lib/hooks/useTokenBalances.ts`

A new React hook that fetches balances for multiple ERC20 tokens:

**Features:**
- Accepts an array of token addresses
- Fetches balance and decimals for each token
- Returns formatted balances ready for display
- Handles errors gracefully (shows 0 balance on error)
- Uses viem's `formatUnits` for proper decimal formatting

**Usage:**
```typescript
const { balances, isLoading, error } = useTokenBalances([
  { symbol: "USDC", address: "0x..." },
  { symbol: "IDRX", address: "0x..." }
]);
```

**Returns:**
```typescript
{
  balances: TokenBalance[]; // Array of token balances
  isLoading: boolean;
  error: string | null;
}

interface TokenBalance {
  symbol: string;
  address: string;
  balance: bigint;
  balanceFormatted: string;
  decimals: number;
}
```

### 2. Updated Wallet Page
**File:** `app/wallet/page.tsx`

**Added:**
- Import `useTokenBalances` hook
- Import `blockchainService` to fetch available tokens
- Fetch available tokens from backend on mount
- Display all token balances in cards

**UI Changes:**
- Changed "Balance" title to "Balances" (plural)
- ETH balance now shown in a card with icon
- Each token shown in individual cards with:
  - Token icon (Coins)
  - Token symbol
  - Shortened address (first 6 + last 4 chars)
  - Balance with appropriate decimals
- Loading state while fetching balances
- Hover effect on token cards

## UI Layout

```
┌─────────────────────────────────────────┐
│ Balances                                 │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ 💼 Ethereum                         │ │
│ │    ETH                              │ │
│ │ 0.1234                              │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 🪙 USDC         |         10.0000   │ │
│ │ 0x1234...5678   |         USDC      │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 🪙 IDRX         |      150000.00    │ │
│ │ 0xabcd...ef12   |         IDRX      │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ... (other tokens)                      │
└─────────────────────────────────────────┘
```

## Token Display Logic

### Decimal Formatting
```typescript
parseFloat(token.balanceFormatted).toFixed(
  token.decimals === 18 ? 2 : 4
)
```

- **18 decimals** (IDRX, JPYC): Show 2 decimal places
- **6 decimals** (USDC, CNHT, EUROC, MXNT): Show 4 decimal places

### Address Truncation
```typescript
{token.address.slice(0, 6)}...{token.address.slice(-4)}
```
Example: `0x1234567890abcdef` → `0x1234...cdef`

## Data Flow

1. **Page loads** → Fetch available tokens from backend
2. **Tokens received** → Pass to `useTokenBalances` hook
3. **Hook fetches** → Balance and decimals for each token
4. **Balances received** → Display in UI with proper formatting

## Example Tokens Displayed

| Token | Symbol | Decimals | Example Balance |
|-------|--------|----------|----------------|
| USD Coin | USDC | 6 | 100.5000 |
| Indonesian Rupiah | IDRX | 18 | 1500000.00 |
| Chinese Yuan | CNHT | 6 | 500.0000 |
| Euro Coin | EUROC | 6 | 75.2500 |
| Japanese Yen | JPYC | 18 | 10000.00 |
| Mexican Peso | MXNT | 6 | 200.0000 |

## Loading States

### While fetching tokens:
```
┌─────────────────────────────────┐
│ Loading token balances...       │
└─────────────────────────────────┘
```

### After load complete:
Shows individual token cards with balances.

## Error Handling

- If token balance fetch fails → Shows "0" balance
- If token list fetch fails → Shows ETH balance only
- Errors logged to console for debugging
- UI remains functional even with partial failures

## Benefits

1. **Complete view**: Users see all their assets in one place
2. **Real-time**: Balances fetched directly from blockchain
3. **Accurate decimals**: Proper formatting for each token
4. **User-friendly**: Clean, organized display with icons
5. **Responsive**: Hover effects and transitions
6. **Reliable**: Graceful error handling

## Future Improvements

1. **USD values**: Show USD equivalent for each token
2. **Total portfolio**: Display total portfolio value
3. **Price changes**: Show 24h price change percentages
4. **Token icons**: Use actual token logos instead of generic icon
5. **Sorting**: Allow sorting by balance value
6. **Filtering**: Filter tokens with zero balance
7. **Refresh button**: Manual refresh of balances
8. **Historical data**: Show balance history chart

## Testing

1. Connect wallet to Base Sepolia
2. Ensure you have some test tokens (use faucet if needed)
3. Navigate to wallet page
4. Verify all token balances display correctly
5. Check that decimals are formatted properly:
   - USDC: 4 decimals (e.g., 10.0000)
   - IDRX: 2 decimals (e.g., 150000.00)

## Summary

The wallet page now provides a comprehensive view of all user assets including ETH and all supported ERC20 tokens. Balances are fetched in real-time from the blockchain and displayed with proper formatting based on each token's decimal configuration. 💰✨
