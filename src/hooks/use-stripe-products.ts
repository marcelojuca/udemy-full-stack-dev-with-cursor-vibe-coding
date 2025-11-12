/**
 * Hook to fetch and cache Stripe products
 * Can be used in both web app and Figma plugin
 */

import { useEffect, useState } from 'react';

interface TierConfig {
  id: string;
  name: string;
  displayName: string;
  resizesPerDay?: number;
  resizesOneTime?: number;
  maxBatchSize: number;
  supportedFormats: string[];
  maxImageSize: number;
  hasWatermark: boolean;
  hasApiAccess: boolean;
  hasTeamSupport: boolean;
  hasAnalytics: boolean;
  supportLevel: 'community' | 'email' | 'priority';
  stripeProductId?: string;
  stripePriceId?: string;
  monthlyPrice?: number;
  yearlyPrice?: number;
}

interface ProductInfo {
  tiers: TierConfig[];
  stripePublishableKey: string;
}

export function useStripeProducts() {
  const [products, setProducts] = useState<ProductInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/plugin/products');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data: ProductInfo = await response.json();
        setProducts(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch products';
        setError(errorMessage);
        console.error('Error fetching Stripe products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Get a specific tier by ID
  const getTier = (tierId: string): TierConfig | null => {
    return products?.tiers.find(t => t.id === tierId) || null;
  };

  return {
    products,
    loading,
    error,
    getTier,
    tiers: products?.tiers || [],
    stripePublishableKey: products?.stripePublishableKey,
  };
}
