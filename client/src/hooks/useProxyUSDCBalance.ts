import { useUserBalance } from '../lib/api';

export function useProxyUSDCBalance(userId?: string | null) {
    const { data, isLoading, refetch } = useUserBalance(userId || "");

    // Adapt to match previous interface
    const rawValue = data?.usdc ? parseFloat(data.usdc) * 1_000_000 : 0; // scaled up if needed, but wait...
    // Previous hook returned raw value from contract (which is scaled 1e6).
    // The server returns formatted "usdc".

    // Check if components expect scaled or formatted.
    // components usually used `formatted`.

    return {
        balance: rawValue, // approximate raw
        formatted: data?.usdc ? parseFloat(data.usdc).toFixed(2) : "0.00",
        isLoading,
        refetch
    };
}
