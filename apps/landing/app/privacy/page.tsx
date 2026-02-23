import Link from "next/link";
import Image from "next/image";
import Navigation from "@/components/Navigation";

export const metadata = {
  title: "Privacy Policy - SmithKit",
  description: "SmithKit Privacy Policy - How we collect, use, and protect your data.",
};

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      <Navigation />
      
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <Link href="/" className="text-purple-400 hover:text-purple-300 text-sm mb-4 inline-block">
              ← Back to Home
            </Link>
            <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-zinc-400">Last updated: February 23, 2026</p>
          </div>

          <div className="prose prose-invert prose-zinc max-w-none">
            <div className="space-y-8 text-zinc-300">
              
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">1. Introduction</h2>
                <p>
                  SmithKit ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, applications, and services (collectively, the "Service").
                </p>
                <p>
                  By accessing or using the Service, you agree to this Privacy Policy. If you do not agree with the terms of this Privacy Policy, please do not access the Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">2. Information We Collect</h2>
                
                <h3 className="text-xl font-medium text-white mt-6 mb-3">2.1 Personal Information</h3>
                <p>We may collect personal information that you voluntarily provide when using our Service, including:</p>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  <li><strong>Account Information:</strong> Name, email address, username, and password when you create an account.</li>
                  <li><strong>Profile Information:</strong> Profile picture, company name, job title, and other information you choose to provide.</li>
                  <li><strong>Payment Information:</strong> Billing address, payment card details (processed securely through our payment processor, Stripe).</li>
                  <li><strong>Communication Data:</strong> Information you provide when contacting our support team or participating in surveys.</li>
                  <li><strong>OAuth Data:</strong> Information from third-party services (GitHub, Google) when you choose to authenticate using these services.</li>
                </ul>

                <h3 className="text-xl font-medium text-white mt-6 mb-3">2.2 Automatically Collected Information</h3>
                <p>When you access our Service, we automatically collect certain information, including:</p>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  <li><strong>Device Information:</strong> Browser type, operating system, device type, and unique device identifiers.</li>
                  <li><strong>Log Data:</strong> IP address, access times, pages viewed, and referring URLs.</li>
                  <li><strong>Usage Data:</strong> Features used, actions taken, and performance metrics within the Service.</li>
                  <li><strong>Cookies and Tracking:</strong> Information collected through cookies, web beacons, and similar technologies.</li>
                </ul>

                <h3 className="text-xl font-medium text-white mt-6 mb-3">2.3 Information from Third Parties</h3>
                <p>We may receive information about you from third parties, including:</p>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  <li><strong>GitHub:</strong> Repository information, commit data, and organization details when you connect your GitHub account.</li>
                  <li><strong>Analytics Providers:</strong> Aggregated usage and demographic information.</li>
                  <li><strong>Payment Processors:</strong> Transaction confirmations and billing information from Stripe.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">3. How We Use Your Information</h2>
                <p>We use the collected information for the following purposes:</p>
                
                <h3 className="text-xl font-medium text-white mt-6 mb-3">3.1 Providing and Improving the Service</h3>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  <li>Create and manage your account</li>
                  <li>Process transactions and send related information</li>
                  <li>Provide customer support and respond to inquiries</li>
                  <li>Monitor and analyze usage patterns to improve the Service</li>
                  <li>Develop new features and functionality</li>
                  <li>Ensure the security and integrity of the Service</li>
                </ul>

                <h3 className="text-xl font-medium text-white mt-6 mb-3">3.2 Communications</h3>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  <li>Send transactional emails (account verification, password resets, billing)</li>
                  <li>Provide product updates and announcements</li>
                  <li>Send marketing communications (with your consent)</li>
                  <li>Respond to your comments, questions, and requests</li>
                </ul>

                <h3 className="text-xl font-medium text-white mt-6 mb-3">3.3 Legal and Safety</h3>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  <li>Comply with legal obligations</li>
                  <li>Enforce our terms and policies</li>
                  <li>Protect our rights, privacy, safety, or property</li>
                  <li>Detect, prevent, and address fraud or security issues</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">4. Data Sharing and Disclosure</h2>
                <p>We do not sell your personal information. We may share your information in the following circumstances:</p>
                
                <h3 className="text-xl font-medium text-white mt-6 mb-3">4.1 Service Providers</h3>
                <p>
                  We share information with third-party vendors who perform services on our behalf, including:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  <li><strong>Supabase:</strong> Database and authentication services</li>
                  <li><strong>Railway:</strong> Application hosting and deployment</li>
                  <li><strong>Stripe:</strong> Payment processing</li>
                  <li><strong>Vercel:</strong> Content delivery and edge functions</li>
                  <li><strong>OpenAI/Anthropic:</strong> AI-powered features (changelog generation, commit messages)</li>
                </ul>

                <h3 className="text-xl font-medium text-white mt-6 mb-3">4.2 Business Transfers</h3>
                <p>
                  If we are involved in a merger, acquisition, or sale of all or a portion of our assets, your information may be transferred as part of that transaction. We will notify you via email and/or prominent notice on our website of any change in ownership or uses of your personal information.
                </p>

                <h3 className="text-xl font-medium text-white mt-6 mb-3">4.3 Legal Requirements</h3>
                <p>
                  We may disclose your information if required to do so by law or in response to valid requests by public authorities (e.g., a court or government agency).
                </p>

                <h3 className="text-xl font-medium text-white mt-6 mb-3">4.4 With Your Consent</h3>
                <p>
                  We may share your information for other purposes with your explicit consent.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">5. Data Retention</h2>
                <p>
                  We retain your personal information for as long as your account is active or as needed to provide you with the Service. We will also retain and use your information as necessary to:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  <li>Comply with our legal obligations</li>
                  <li>Resolve disputes</li>
                  <li>Enforce our agreements</li>
                  <li>Maintain business records for a reasonable period</li>
                </ul>
                <p className="mt-4">
                  Data retention periods vary by plan:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  <li><strong>Free Plan:</strong> 7 days of activity data</li>
                  <li><strong>Pro Plan:</strong> 30 days of activity data</li>
                  <li><strong>Premium Plan:</strong> 90 days of activity data</li>
                </ul>
                <p className="mt-4">
                  Upon account deletion, we will delete or anonymize your personal information within 30 days, except where retention is required by law.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">6. Data Security</h2>
                <p>
                  We implement appropriate technical and organizational measures to protect your personal information, including:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  <li><strong>Encryption:</strong> All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption.</li>
                  <li><strong>Access Controls:</strong> Strict access controls and authentication requirements for our systems.</li>
                  <li><strong>Secure Infrastructure:</strong> Our services are hosted on secure, SOC 2 compliant infrastructure.</li>
                  <li><strong>Regular Audits:</strong> We conduct regular security assessments and vulnerability testing.</li>
                  <li><strong>VaultKit Encryption:</strong> Secrets stored in VaultKit use AES-256-GCM encryption with customer-isolated keys.</li>
                </ul>
                <p className="mt-4">
                  While we strive to use commercially acceptable means to protect your personal information, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">7. Your Rights and Choices</h2>
                
                <h3 className="text-xl font-medium text-white mt-6 mb-3">7.1 Account Information</h3>
                <p>
                  You may update, correct, or delete your account information at any time by logging into your account settings. You may also contact us directly to request access to, correction of, or deletion of personal information.
                </p>

                <h3 className="text-xl font-medium text-white mt-6 mb-3">7.2 Marketing Communications</h3>
                <p>
                  You may opt out of marketing communications by clicking the "unsubscribe" link in any marketing email or by contacting us. Note that you will continue to receive transactional emails related to your account.
                </p>

                <h3 className="text-xl font-medium text-white mt-6 mb-3">7.3 Cookies</h3>
                <p>
                  Most web browsers are set to accept cookies by default. You can usually modify your browser settings to decline cookies. However, disabling cookies may affect your ability to use certain features of the Service.
                </p>

                <h3 className="text-xl font-medium text-white mt-6 mb-3">7.4 Do Not Track</h3>
                <p>
                  We do not currently respond to "Do Not Track" signals. However, you may opt out of certain tracking as described in this policy.
                </p>

                <h3 className="text-xl font-medium text-white mt-6 mb-3">7.5 Data Portability</h3>
                <p>
                  You have the right to request a copy of your personal data in a structured, commonly used, and machine-readable format. Contact us to request data export.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">8. International Data Transfers</h2>
                <p>
                  Your information may be transferred to and processed in countries other than your country of residence, including the United States. These countries may have data protection laws that are different from the laws of your country.
                </p>
                <p className="mt-4">
                  We take appropriate safeguards to require that your personal information will remain protected in accordance with this Privacy Policy, including using Standard Contractual Clauses approved by the European Commission for transfers of personal information from the EEA to the United States.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">9. Children's Privacy</h2>
                <p>
                  The Service is not intended for children under the age of 16. We do not knowingly collect personal information from children under 16. If you are a parent or guardian and believe that your child has provided us with personal information, please contact us so we can delete such information.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">10. California Privacy Rights (CCPA)</h2>
                <p>
                  If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA):
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  <li><strong>Right to Know:</strong> You can request information about the categories and specific pieces of personal information we have collected about you.</li>
                  <li><strong>Right to Delete:</strong> You can request deletion of your personal information, subject to certain exceptions.</li>
                  <li><strong>Right to Opt-Out:</strong> You can opt out of the sale of your personal information. Note: We do not sell personal information.</li>
                  <li><strong>Right to Non-Discrimination:</strong> We will not discriminate against you for exercising your CCPA rights.</li>
                </ul>
                <p className="mt-4">
                  To exercise these rights, please contact us at privacy@smithkit.dev.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">11. European Privacy Rights (GDPR)</h2>
                <p>
                  If you are located in the European Economic Area (EEA), United Kingdom, or Switzerland, you have additional rights under the General Data Protection Regulation (GDPR):
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  <li><strong>Right of Access:</strong> You can request copies of your personal data.</li>
                  <li><strong>Right to Rectification:</strong> You can request that we correct inaccurate data.</li>
                  <li><strong>Right to Erasure:</strong> You can request that we delete your personal data.</li>
                  <li><strong>Right to Restrict Processing:</strong> You can request that we restrict processing of your data.</li>
                  <li><strong>Right to Data Portability:</strong> You can request transfer of your data to another organization.</li>
                  <li><strong>Right to Object:</strong> You can object to processing of your personal data.</li>
                  <li><strong>Right to Withdraw Consent:</strong> Where we rely on consent, you can withdraw it at any time.</li>
                </ul>
                <p className="mt-4">
                  Our legal basis for processing personal data includes: performance of our contract with you, legitimate business interests, compliance with legal obligations, and your consent.
                </p>
                <p className="mt-4">
                  You also have the right to lodge a complaint with a supervisory authority in the EEA.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">12. Third-Party Links</h2>
                <p>
                  The Service may contain links to third-party websites or services that are not operated by us. We are not responsible for the privacy practices of these third parties. We encourage you to review the privacy policies of any third-party sites you visit.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">13. Changes to This Privacy Policy</h2>
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. For significant changes, we will provide additional notice, such as an email notification.
                </p>
                <p className="mt-4">
                  We encourage you to review this Privacy Policy periodically to stay informed about how we are protecting your information.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">14. Contact Us</h2>
                <p>
                  If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
                </p>
                <div className="mt-4 p-6 rounded-xl bg-zinc-900/50 border border-zinc-800">
                  <p><strong>SmithKit</strong></p>
                  <p className="mt-2">Email: privacy@smithkit.dev</p>
                  <p>Support: support@smithkit.dev</p>
                </div>
              </section>

            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-zinc-800/50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <Link href="/" className="flex items-center">
            <Image src="/logo-white.png" alt="SmithKit" width={180} height={50} className="h-10 w-auto" />
          </Link>
          
          <div className="flex items-center gap-8 text-sm text-zinc-500">
            <Link href="/privacy" className="text-purple-400">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="https://github.com/CoHoast/smith-kit" className="hover:text-white transition-colors">GitHub</Link>
          </div>
          
          <p className="text-sm text-zinc-600">© 2026 SmithKit</p>
        </div>
      </footer>
    </main>
  );
}
