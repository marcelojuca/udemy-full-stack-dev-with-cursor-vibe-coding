'use client'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'stripe-pricing-table': {
        'pricing-table-id': string
        'publishable-key': string
      }
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

        <div className="flex justify-center">
          <stripe-pricing-table
            pricing-table-id="prctbl_1SRyLQE68yv2YzEA5mdR45yT"
            publishable-key="pk_test_51SRg21E68yv2YzEAWWtxAn9PnI2pS6Atie3yEk4zQ8HJybWzj9SCUZtePfOpLUR4qTeR699byyhtj4dsBcqGZYUx002GK87WNU">
          </stripe-pricing-table>
        </div>
      </div>
    </section>
  )
}
