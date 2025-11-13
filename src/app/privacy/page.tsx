'use client';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 w-full">
        <section className="py-8 sm:py-12 md:py-16 px-4">
          <div className="container max-w-4xl mx-auto">
            <div className="mb-8 sm:mb-12">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
                Privacy Policy
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Last updated: November 2025
              </p>
            </div>

            <div className="space-y-8 text-sm sm:text-base">
              <section>
                <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">1. Introduction</h2>
                <p className="text-foreground/90 leading-relaxed">
                  Xpto (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;, or &quot;Company&quot;) is
                  operated by Wild Rose IT Consulting Inc. This page informs you of our policies
                  regarding the collection, use, and disclosure of personal data when you use our
                  Service and the choices you have associated with that data.
                </p>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">
                  2. Information Collection and Use
                </h2>
                <p className="text-foreground/90 leading-relaxed mb-3">
                  We collect several different types of information for various purposes to provide
                  and improve our Service to you:
                </p>
                <ul className="list-disc list-inside space-y-2 text-foreground/90 pl-2">
                  <li>
                    <strong>Account Information:</strong> When you create an account, we collect
                    your name, email address, and profile information from your Google account.
                  </li>
                  <li>
                    <strong>API Keys:</strong> If you provide API keys (GitHub, OpenAI), they are
                    encrypted and stored securely in our database.
                  </li>
                  <li>
                    <strong>Usage Data:</strong> We may collect information about how you interact
                    with our Service (e.g., repository analyses, searches).
                  </li>
                  <li>
                    <strong>Device Information:</strong> We may collect information about your
                    device, including browser type, IP address, and operating system.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">3. Use of Data</h2>
                <p className="text-foreground/90 leading-relaxed mb-3">
                  Wild Rose IT Consulting Inc. uses the collected data for various purposes:
                </p>
                <ul className="list-disc list-inside space-y-2 text-foreground/90 pl-2">
                  <li>To provide and maintain our Service</li>
                  <li>To notify you about changes to our Service</li>
                  <li>To provide customer support</li>
                  <li>To gather analysis or valuable information to improve our Service</li>
                  <li>To monitor the usage of our Service</li>
                  <li>To detect, prevent, and address technical and security issues</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">
                  4. Security of Data
                </h2>
                <p className="text-foreground/90 leading-relaxed">
                  The security of your data is important to us but remember that no method of
                  transmission over the Internet or method of electronic storage is 100% secure.
                  While we strive to use commercially acceptable means to protect your personal
                  data, we cannot guarantee its absolute security.
                </p>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">
                  5. Third-Party Services
                </h2>
                <p className="text-foreground/90 leading-relaxed">
                  Our Service may contain links to other sites that are not operated by us. This
                  Privacy Policy does not apply to third-party websites, and we are not responsible
                  for their privacy practices. We encourage you to review the privacy policies of
                  any third-party services before providing your information.
                </p>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">
                  6. Children&apos;s Privacy
                </h2>
                <p className="text-foreground/90 leading-relaxed">
                  Our Service does not address anyone under the age of 13. We do not knowingly
                  collect personally identifiable information from children under 13. If we become
                  aware that a child under 13 has provided us with personal information, we
                  immediately delete such information from our servers.
                </p>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">
                  7. Changes to This Privacy Policy
                </h2>
                <p className="text-foreground/90 leading-relaxed">
                  We may update our Privacy Policy from time to time. We will notify you of any
                  changes by posting the new Privacy Policy on this page and updating the &quot;Last
                  updated&quot; date at the top of this Privacy Policy.
                </p>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">
                  8. Your Rights (PIPEDA Compliance)
                </h2>
                <p className="text-foreground/90 leading-relaxed mb-3">
                  Under Canada&apos;s Personal Information Protection and Electronic Documents Act
                  (PIPEDA), you have the following rights:
                </p>
                <ul className="list-disc list-inside space-y-2 text-foreground/90 pl-2">
                  <li>
                    <strong>Access Your Data:</strong> Request a copy of all personal data we hold
                    about you
                  </li>
                  <li>
                    <strong>Correct Your Data:</strong> Request corrections to inaccurate or
                    incomplete information
                  </li>
                  <li>
                    <strong>Delete Your Account:</strong> Request deletion of your account and
                    associated data (with exceptions for legal/compliance records)
                  </li>
                  <li>
                    <strong>Export Your Data:</strong> Request your data in a portable format
                    (JSON/CSV) as per PIPEDA requirements
                  </li>
                  <li>
                    <strong>Opt-Out:</strong> Unsubscribe from marketing communications at any time
                  </li>
                  <li>
                    <strong>Know How Your Data is Used:</strong> Request information about how your
                    data is processed
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">
                  9. PIPEDA Compliance Statement
                </h2>
                <p className="text-foreground/90 leading-relaxed mb-3">
                  Wild Rose IT Consulting Inc. is committed to complying with PIPEDA and protecting
                  your personal information. Key commitments:
                </p>
                <ul className="list-disc list-inside space-y-2 text-foreground/90 pl-2">
                  <li>We only collect personal information necessary to provide our Service</li>
                  <li>We are transparent about data collection and use</li>
                  <li>We obtain explicit consent for optional data collection</li>
                  <li>We maintain comprehensive security measures to protect your data</li>
                  <li>We notify you of any data breaches within legally required timeframes</li>
                  <li>
                    We retain data only as long as necessary (or as required by law for
                    tax/compliance purposes)
                  </li>
                  <li>
                    We do not share your data with third parties without your consent (except as
                    required by law)
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">
                  10. Data Retention
                </h2>
                <p className="text-foreground/90 leading-relaxed mb-3">
                  We retain personal data as follows:
                </p>
                <ul className="list-disc list-inside space-y-2 text-foreground/90 pl-2">
                  <li>
                    <strong>Account Information:</strong> Until you delete your account or request
                    deletion
                  </li>
                  <li>
                    <strong>API Keys:</strong> Until you delete the key or close your account
                  </li>
                  <li>
                    <strong>Transaction Records:</strong> For 6 years per Canadian tax (CRA)
                    requirements
                  </li>
                  <li>
                    <strong>Invoices & Billing:</strong> For 6 years per Canadian tax requirements
                  </li>
                  <li>
                    <strong>Usage Data:</strong> Up to 12 months (for analytics and service
                    improvement)
                  </li>
                  <li>
                    <strong>Deleted Accounts:</strong> Associated data deleted within 30 days
                    (except legal/tax records)
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">
                  11. Data Breach Incident Response
                </h2>
                <p className="text-foreground/90 leading-relaxed mb-3">
                  In the event of a data breach affecting personal information, Wild Rose IT
                  Consulting Inc. will:
                </p>
                <ul className="list-disc list-inside space-y-2 text-foreground/90 pl-2">
                  <li>Assess the severity and impact of the breach</li>
                  <li>Notify affected users without unreasonable delay (as required by PIPEDA)</li>
                  <li>Notify the Privacy Commissioner of Canada if required by law</li>
                  <li>
                    Provide information on what personal data was accessed and recommended security
                    steps
                  </li>
                  <li>Maintain incident logs and investigate the root cause</li>
                  <li>Implement preventative measures to avoid future incidents</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">
                  12. Contact & Complaints
                </h2>
                <p className="text-foreground/90 leading-relaxed mb-3">
                  If you have questions about this Privacy Policy or wish to exercise your rights:
                </p>
                <ul className="list-disc list-inside space-y-2 text-foreground/90 pl-2">
                  <li>Email us at: xpto_saas@googlegroups.com</li>
                  <li>Response time: 30 days</li>
                  <li>
                    If you are not satisfied with our response, you may file a complaint with the
                    Office of the Privacy Commissioner of Canada
                  </li>
                </ul>
              </section>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
