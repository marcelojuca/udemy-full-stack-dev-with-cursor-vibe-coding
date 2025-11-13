'use client';

import React from 'react';

interface StripePricingTableElement
  extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> {
  'pricing-table-id'?: string;
  'publishable-key'?: string;
  'client-reference-id'?: string;
  'customer-email'?: string;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'stripe-pricing-table': StripePricingTableElement;
    }
  }
}

export function PricingSection() {
  return (
    <section id="pricing" className="py-8 sm:py-12 md:py-16 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-balance mb-4 leading-tight">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground text-balance max-w-2xl mx-auto leading-relaxed">
            Choose the plan that fits your needs. Start free and upgrade as you grow.
          </p>
        </div>

        <style>{`
          stripe-pricing-table {
            --border-color: hsl(var(--border));
            --pricing-table-width: 100%;
          }
          @media (min-width: 768px) {
            stripe-pricing-table {
              max-width: 1200px;
              margin: 0 auto;
            }
          }
        `}</style>
        <div className="w-full flex justify-center">
          <div className="w-full max-w-6xl">
            {React.createElement('stripe-pricing-table', {
              'pricing-table-id': 'prctbl_1SRyLQE68yv2YzEA5mdR45yT',
              'publishable-key':
                'pk_test_51SRg21E68yv2YzEAWWtxAn9PnI2pS6Atie3yEk4zQ8HJybWzj9SCUZtePfOpLUR4qTeR699byyhtj4dsBcqGZYUx002GK87WNU',
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
