'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 w-full">
        <section className="py-8 sm:py-12 md:py-16 px-4">
          <div className="container max-w-4xl mx-auto">
            <div className="mb-8 sm:mb-12">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
                Terms of Service
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Last updated: November 2025
              </p>
            </div>

            <div className="space-y-8 text-sm sm:text-base">
              <section>
                <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">1. Agreement to Terms</h2>
                <p className="text-foreground/90 leading-relaxed">
                  By accessing and using Dandi ("the Service"), you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by these terms, please do not use this service. These terms constitute a legally binding agreement between you and Wild Rose IT Consulting Inc., the company operating the Dandi service.
                </p>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">2. Use License</h2>
                <p className="text-foreground/90 leading-relaxed mb-3">
                  Permission is granted to use Dandi for personal, non-commercial use. This is the grant of a license, not a transfer of title, and under this license you may not:
                </p>
                <ul className="list-disc list-inside space-y-2 text-foreground/90 pl-2">
                  <li>Modify, copy, or reproduce the materials without authorization</li>
                  <li>Use the Service for any commercial purpose without written permission</li>
                  <li>Attempt to reverse engineer, decompile, or disassemble any software</li>
                  <li>Remove any copyright or proprietary notations from the materials</li>
                  <li>Transfer the materials to another person or mirror the Service on another server</li>
                  <li>Use automated tools to access the Service without authorization</li>
                  <li>Share your account credentials or API keys with unauthorized parties</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">3. Disclaimer</h2>
                <p className="text-foreground/90 leading-relaxed">
                  The materials on Dandi are provided on an 'as is' basis. Wild Rose IT Consulting Inc. makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                </p>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">4. Limitations</h2>
                <p className="text-foreground/90 leading-relaxed">
                  In no event shall Wild Rose IT Consulting Inc. or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Dandi, even if we or our authorized representative has been notified orally or in writing of the possibility of such damage.
                </p>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">5. Accuracy of Materials</h2>
                <p className="text-foreground/90 leading-relaxed">
                  The materials appearing on Dandi could include technical, typographical, or photographic errors. Wild Rose IT Consulting Inc. does not warrant that any of the materials on the Service are accurate, complete, or current. We may make changes to the materials contained on the Service at any time without notice.
                </p>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">6. Links</h2>
                <p className="text-foreground/90 leading-relaxed">
                  Wild Rose IT Consulting Inc. has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Wild Rose IT Consulting Inc. of the site. Use of any such linked website is at the user's own risk.
                </p>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">7. Modifications</h2>
                <p className="text-foreground/90 leading-relaxed">
                  Wild Rose IT Consulting Inc. may revise these terms of service for the Service at any time without notice. By using this Service, you are agreeing to be bound by the then current version of these terms of service.
                </p>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">8. Governing Law</h2>
                <p className="text-foreground/90 leading-relaxed">
                  These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which Wild Rose IT Consulting Inc. operates, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
                </p>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">9. Refund & Reimbursement Policy</h2>
                <div className="space-y-4 text-foreground/90">
                  <div>
                    <h3 className="font-semibold mb-2">Full Refund (100%)</h3>
                    <ul className="list-disc list-inside space-y-1 pl-2">
                      <li>Available within <strong>7 days</strong> of purchase for any reason</li>
                      <li>No questions asked</li>
                      <li>Refund appears in customer account within 5-10 business days</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">No Refund</h3>
                    <ul className="list-disc list-inside space-y-1 pl-2">
                      <li>After 7-day full refund period expires</li>
                      <li>For services fully delivered and used</li>
                      <li>Non-refundable purchases are clearly marked at checkout</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">GST Treatment (Canada)</h3>
                    <ul className="list-disc list-inside space-y-1 pl-2">
                      <li>All refunds include proportional GST (5% for Alberta)</li>
                      <li>Example: $100 purchase + $5 GST refunded = $105 refunded total</li>
                      <li>GST is not a separate charge; it is included in refunds</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Processing</h3>
                    <ul className="list-disc list-inside space-y-1 pl-2">
                      <li>Refunds issued to original payment method used</li>
                      <li><strong>Takes 5-10 business days</strong> to appear in customer account</li>
                      <li>Appears as a credit on customer's credit card or bank statement</li>
                      <li>Contact support to check refund status</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Chargebacks & Disputes</h3>
                    <ul className="list-disc list-inside space-y-1 pl-2">
                      <li>If you initiate a chargeback or dispute with your payment processor, we will investigate and respond</li>
                      <li>Fraudulent chargebacks may result in account suspension</li>
                      <li>Valid disputes will be refunded</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Special Cases</h3>
                    <ul className="list-disc list-inside space-y-1 pl-2">
                      <li><strong>Service outage:</strong> Automatic credit issued for affected period</li>
                      <li><strong>Billing error:</strong> Immediate refund plus credit for future usage</li>
                      <li><strong>Upgrade/downgrade:</strong> Prorated credit applied to next billing cycle</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">10. Limitation of Liability</h2>
                <p className="text-foreground/90 leading-relaxed">
                  To the fullest extent permitted by law, Wild Rose IT Consulting Inc. shall not be liable for any indirect, incidental, special, consequential, or punitive damages, even if Wild Rose IT Consulting Inc. has been advised of the possibility of such damages. Your sole remedy is limited to the amount paid to Wild Rose IT Consulting Inc.
                </p>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">11. Data Breach Notification</h2>
                <p className="text-foreground/90 leading-relaxed">
                  In the event of a data breach affecting personal information, Wild Rose IT Consulting Inc. will notify affected users and relevant authorities within the timeframes required by applicable law (including Canadian PIPEDA regulations). We maintain comprehensive incident response procedures to protect your data.
                </p>
              </section>

            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
