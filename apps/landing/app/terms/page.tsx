/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";
import Image from "next/image";
import Navigation from "@/components/Navigation";

export const metadata = {
  title: "Terms of Service - SmithKit",
  description: "SmithKit Terms of Service - Rules and guidelines for using our platform.",
};

export default function TermsOfService() {
  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      <Navigation />
      
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <Link href="/" className="text-purple-400 hover:text-purple-300 text-sm mb-4 inline-block">
              ← Back to Home
            </Link>
            <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
            <p className="text-zinc-400">Last updated: February 23, 2026</p>
          </div>

          <div className="prose prose-invert prose-zinc max-w-none">
            <div className="space-y-8 text-zinc-300">
              
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">1. Agreement to Terms</h2>
                <p>
                  These Terms of Service ("Terms") constitute a legally binding agreement between you ("User," "you," or "your") and SmithKit ("Company," "we," "us," or "our") governing your access to and use of the SmithKit website, applications, APIs, and services (collectively, the "Service").
                </p>
                <p className="mt-4">
                  By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of these Terms, you may not access the Service.
                </p>
                <p className="mt-4">
                  If you are using the Service on behalf of an organization, you represent and warrant that you have authority to bind that organization to these Terms, and "you" refers to both you individually and that organization.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">2. Description of Service</h2>
                <p>
                  SmithKit is a software-as-a-service (SaaS) platform that provides developer tools and services, including but not limited to:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  <li><strong>Uptime Monitoring:</strong> Website and API availability monitoring</li>
                  <li><strong>StatusKit:</strong> Public status page hosting</li>
                  <li><strong>ErrorWatch:</strong> Error tracking and monitoring</li>
                  <li><strong>Changelog:</strong> AI-powered release note generation</li>
                  <li><strong>CommitBot:</strong> AI commit message generation</li>
                  <li><strong>ToggleBox:</strong> Feature flag management</li>
                  <li><strong>CronPilot:</strong> Scheduled job execution</li>
                  <li><strong>WebhookLab:</strong> Webhook testing and debugging</li>
                  <li><strong>EventLog:</strong> Event tracking and analytics</li>
                  <li><strong>LLM Analytics:</strong> AI/LLM usage monitoring</li>
                  <li><strong>VaultKit:</strong> Secrets and environment variable management</li>
                  <li><strong>DepWatch:</strong> Dependency vulnerability scanning</li>
                </ul>
                <p className="mt-4">
                  We reserve the right to modify, suspend, or discontinue any part of the Service at any time with or without notice.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">3. Account Registration</h2>
                
                <h3 className="text-xl font-medium text-white mt-6 mb-3">3.1 Account Creation</h3>
                <p>
                  To access certain features of the Service, you must create an account. When creating an account, you agree to:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain and promptly update your account information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized access or security breach</li>
                </ul>

                <h3 className="text-xl font-medium text-white mt-6 mb-3">3.2 Account Requirements</h3>
                <p>
                  You must be at least 16 years of age to create an account. By creating an account, you represent that you meet this requirement.
                </p>

                <h3 className="text-xl font-medium text-white mt-6 mb-3">3.3 Account Termination</h3>
                <p>
                  We reserve the right to suspend or terminate your account at any time for any reason, including violation of these Terms. You may also delete your account at any time through your account settings.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">4. Subscription Plans and Payment</h2>
                
                <h3 className="text-xl font-medium text-white mt-6 mb-3">4.1 Subscription Plans</h3>
                <p>
                  The Service is offered through various subscription plans:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  <li><strong>Free Plan:</strong> Limited access to all tools with usage restrictions</li>
                  <li><strong>Pro Plan ($49/month):</strong> Full access with higher usage limits</li>
                  <li><strong>Premium Plan ($129/month):</strong> Full access with team features and priority support</li>
                </ul>
                <p className="mt-4">
                  Current pricing and plan details are available at smithkit.dev/pricing.
                </p>

                <h3 className="text-xl font-medium text-white mt-6 mb-3">4.2 Billing</h3>
                <p>
                  Paid subscriptions are billed in advance on a monthly or annual basis. By subscribing, you authorize us to charge your payment method on a recurring basis until you cancel.
                </p>

                <h3 className="text-xl font-medium text-white mt-6 mb-3">4.3 Price Changes</h3>
                <p>
                  We may change our prices at any time. Price changes will be communicated via email at least 30 days before taking effect. Continued use of the Service after a price change constitutes acceptance of the new price.
                </p>
                <p className="mt-4">
                  <strong>Grandfathering:</strong> Early adopters who subscribe before publicly announced price increases will be locked in at their original subscription price for as long as their subscription remains active.
                </p>

                <h3 className="text-xl font-medium text-white mt-6 mb-3">4.4 Refunds</h3>
                <p>
                  All subscription fees are non-refundable except as required by law or as explicitly stated otherwise. If you believe you are entitled to a refund, please contact support@smithkit.dev.
                </p>

                <h3 className="text-xl font-medium text-white mt-6 mb-3">4.5 Cancellation</h3>
                <p>
                  You may cancel your subscription at any time through your account settings. Upon cancellation:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  <li>You will retain access to paid features until the end of your current billing period</li>
                  <li>Your account will revert to the Free plan after the billing period ends</li>
                  <li>No partial refunds will be provided for unused time</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">5. Acceptable Use Policy</h2>
                
                <h3 className="text-xl font-medium text-white mt-6 mb-3">5.1 Permitted Use</h3>
                <p>
                  You may use the Service only for lawful purposes and in accordance with these Terms. You agree to use the Service for its intended purpose of software development, monitoring, and operations.
                </p>

                <h3 className="text-xl font-medium text-white mt-6 mb-3">5.2 Prohibited Activities</h3>
                <p>
                  You agree NOT to:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  <li>Violate any applicable law, regulation, or third-party rights</li>
                  <li>Use the Service for any illegal or unauthorized purpose</li>
                  <li>Attempt to gain unauthorized access to the Service or its related systems</li>
                  <li>Interfere with or disrupt the Service or servers/networks connected to the Service</li>
                  <li>Transmit viruses, malware, or other malicious code</li>
                  <li>Use the Service to send spam or unsolicited communications</li>
                  <li>Harvest or collect information about other users</li>
                  <li>Impersonate any person or entity</li>
                  <li>Use the Service to compete with SmithKit</li>
                  <li>Reverse engineer, decompile, or disassemble the Service</li>
                  <li>Remove any copyright or proprietary notices</li>
                  <li>Use automated systems (bots, scrapers) to access the Service without permission</li>
                  <li>Exceed rate limits or abuse API endpoints</li>
                  <li>Share account credentials with unauthorized users</li>
                  <li>Use the Service to mine cryptocurrency</li>
                  <li>Store or transmit illegal content</li>
                </ul>

                <h3 className="text-xl font-medium text-white mt-6 mb-3">5.3 Rate Limits and Fair Use</h3>
                <p>
                  The Service is subject to rate limits and fair use policies. Excessive usage that impacts other users or our infrastructure may result in throttling, suspension, or termination of your account.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">6. User Content and Data</h2>
                
                <h3 className="text-xl font-medium text-white mt-6 mb-3">6.1 Your Content</h3>
                <p>
                  You retain ownership of all content, data, and materials you submit, upload, or store through the Service ("User Content"). By using the Service, you grant us a limited license to use, process, and store your User Content solely to provide the Service.
                </p>

                <h3 className="text-xl font-medium text-white mt-6 mb-3">6.2 Responsibility for Content</h3>
                <p>
                  You are solely responsible for your User Content and the consequences of storing or sharing it through the Service. You represent and warrant that:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  <li>You own or have the necessary rights to use and authorize use of your User Content</li>
                  <li>Your User Content does not violate any third-party rights</li>
                  <li>Your User Content complies with all applicable laws and regulations</li>
                </ul>

                <h3 className="text-xl font-medium text-white mt-6 mb-3">6.3 Data Processing</h3>
                <p>
                  By using certain features of the Service, you acknowledge that your data may be processed by third-party services, including AI providers (OpenAI, Anthropic) for features like changelog generation and commit message generation. See our Privacy Policy for details.
                </p>

                <h3 className="text-xl font-medium text-white mt-6 mb-3">6.4 Data Backup</h3>
                <p>
                  While we implement reasonable measures to protect your data, you are responsible for maintaining backups of your User Content. We are not liable for any loss or corruption of User Content.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">7. Intellectual Property</h2>
                
                <h3 className="text-xl font-medium text-white mt-6 mb-3">7.1 Our Intellectual Property</h3>
                <p>
                  The Service, including its original content, features, functionality, design, and source code, is owned by SmithKit and is protected by copyright, trademark, and other intellectual property laws. Our trademarks may not be used without prior written permission.
                </p>

                <h3 className="text-xl font-medium text-white mt-6 mb-3">7.2 License to Use</h3>
                <p>
                  Subject to these Terms, we grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Service for your internal business purposes.
                </p>

                <h3 className="text-xl font-medium text-white mt-6 mb-3">7.3 Feedback</h3>
                <p>
                  If you provide us with feedback, suggestions, or ideas ("Feedback"), you grant us a perpetual, worldwide, royalty-free license to use, modify, and incorporate that Feedback into the Service without compensation or attribution.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">8. API Terms</h2>
                
                <h3 className="text-xl font-medium text-white mt-6 mb-3">8.1 API Access</h3>
                <p>
                  We may provide APIs that allow you to integrate with the Service. Your use of our APIs is subject to these Terms and any additional API documentation.
                </p>

                <h3 className="text-xl font-medium text-white mt-6 mb-3">8.2 API Keys</h3>
                <p>
                  API keys are confidential and must be kept secure. You are responsible for all activity that occurs using your API keys. Do not share API keys or embed them in client-side code.
                </p>

                <h3 className="text-xl font-medium text-white mt-6 mb-3">8.3 Rate Limits</h3>
                <p>
                  API calls are subject to rate limits based on your subscription plan. Exceeding rate limits may result in temporary throttling or suspension of API access.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">9. Third-Party Services</h2>
                <p>
                  The Service may integrate with or contain links to third-party services (e.g., GitHub, Slack, email providers). Your use of third-party services is governed by their respective terms of service. We are not responsible for third-party services and do not endorse them.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">10. Service Level and Availability</h2>
                
                <h3 className="text-xl font-medium text-white mt-6 mb-3">10.1 Availability</h3>
                <p>
                  We strive to maintain high availability of the Service but do not guarantee uninterrupted access. The Service may be temporarily unavailable due to maintenance, updates, or factors beyond our control.
                </p>

                <h3 className="text-xl font-medium text-white mt-6 mb-3">10.2 Support</h3>
                <p>
                  Support is provided based on your subscription plan:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  <li><strong>Free Plan:</strong> Community support only</li>
                  <li><strong>Pro Plan:</strong> Email support with 48-hour response time</li>
                  <li><strong>Premium Plan:</strong> Priority support with 24-hour response time</li>
                </ul>

                <h3 className="text-xl font-medium text-white mt-6 mb-3">10.3 Maintenance</h3>
                <p>
                  We may perform scheduled maintenance that temporarily affects Service availability. We will endeavor to provide advance notice of scheduled maintenance.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">11. Disclaimers</h2>
                <p className="uppercase text-sm">
                  THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.
                </p>
                <p className="mt-4 uppercase text-sm">
                  WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE, THAT DEFECTS WILL BE CORRECTED, OR THAT THE SERVICE IS FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.
                </p>
                <p className="mt-4 uppercase text-sm">
                  WE DO NOT WARRANT OR MAKE ANY REPRESENTATIONS REGARDING THE USE OR RESULTS OF THE SERVICE IN TERMS OF ACCURACY, RELIABILITY, OR OTHERWISE.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">12. Limitation of Liability</h2>
                <p className="uppercase text-sm">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL SMITHKIT, ITS OFFICERS, DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, OR GOODWILL, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE SERVICE.
                </p>
                <p className="mt-4 uppercase text-sm">
                  OUR TOTAL LIABILITY FOR ALL CLAIMS ARISING OUT OF OR RELATING TO THESE TERMS OR THE SERVICE SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR ONE HUNDRED DOLLARS ($100), WHICHEVER IS GREATER.
                </p>
                <p className="mt-4">
                  Some jurisdictions do not allow the exclusion or limitation of certain damages, so some of the above limitations may not apply to you.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">13. Indemnification</h2>
                <p>
                  You agree to indemnify, defend, and hold harmless SmithKit and its officers, directors, employees, agents, and affiliates from and against any claims, damages, losses, liabilities, costs, and expenses (including reasonable attorneys' fees) arising out of or relating to:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  <li>Your use of the Service</li>
                  <li>Your User Content</li>
                  <li>Your violation of these Terms</li>
                  <li>Your violation of any third-party rights</li>
                  <li>Your violation of any applicable laws or regulations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">14. Dispute Resolution</h2>
                
                <h3 className="text-xl font-medium text-white mt-6 mb-3">14.1 Governing Law</h3>
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law provisions.
                </p>

                <h3 className="text-xl font-medium text-white mt-6 mb-3">14.2 Arbitration</h3>
                <p>
                  Any dispute arising out of or relating to these Terms or the Service shall be resolved by binding arbitration in accordance with the American Arbitration Association's rules. The arbitration shall be conducted in English in Delaware, United States.
                </p>

                <h3 className="text-xl font-medium text-white mt-6 mb-3">14.3 Class Action Waiver</h3>
                <p>
                  You agree that any dispute resolution proceedings will be conducted only on an individual basis and not in a class, consolidated, or representative action.
                </p>

                <h3 className="text-xl font-medium text-white mt-6 mb-3">14.4 Exceptions</h3>
                <p>
                  Notwithstanding the above, either party may seek injunctive relief in any court of competent jurisdiction to protect its intellectual property rights.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">15. General Provisions</h2>
                
                <h3 className="text-xl font-medium text-white mt-6 mb-3">15.1 Entire Agreement</h3>
                <p>
                  These Terms, together with our Privacy Policy, constitute the entire agreement between you and SmithKit regarding the Service and supersede all prior agreements.
                </p>

                <h3 className="text-xl font-medium text-white mt-6 mb-3">15.2 Severability</h3>
                <p>
                  If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions will continue in full force and effect.
                </p>

                <h3 className="text-xl font-medium text-white mt-6 mb-3">15.3 Waiver</h3>
                <p>
                  Our failure to enforce any right or provision of these Terms will not be considered a waiver of that right or provision.
                </p>

                <h3 className="text-xl font-medium text-white mt-6 mb-3">15.4 Assignment</h3>
                <p>
                  You may not assign or transfer these Terms or your rights under these Terms without our prior written consent. We may assign our rights and obligations under these Terms without restriction.
                </p>

                <h3 className="text-xl font-medium text-white mt-6 mb-3">15.5 Force Majeure</h3>
                <p>
                  We will not be liable for any failure or delay in performance due to circumstances beyond our reasonable control, including natural disasters, war, terrorism, labor disputes, or internet service provider failures.
                </p>

                <h3 className="text-xl font-medium text-white mt-6 mb-3">15.6 Notices</h3>
                <p>
                  We may provide notices to you via email, through the Service, or by posting on our website. You may contact us at legal@smithkit.dev.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">16. Changes to Terms</h2>
                <p>
                  We reserve the right to modify these Terms at any time. We will notify you of material changes by posting the updated Terms on our website and updating the "Last updated" date. For significant changes, we will provide additional notice, such as an email notification.
                </p>
                <p className="mt-4">
                  Your continued use of the Service after changes become effective constitutes acceptance of the revised Terms. If you do not agree to the new Terms, please stop using the Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">17. Contact Information</h2>
                <p>
                  If you have any questions about these Terms, please contact us at:
                </p>
                <div className="mt-4 p-6 rounded-xl bg-zinc-900/50 border border-zinc-800">
                  <p><strong>SmithKit</strong></p>
                  <p className="mt-2">Email: legal@smithkit.dev</p>
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
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="text-purple-400">Terms</Link>
            <Link href="https://github.com/CoHoast/smith-kit" className="hover:text-white transition-colors">GitHub</Link>
          </div>
          
          <p className="text-sm text-zinc-600">© 2026 SmithKit</p>
        </div>
      </footer>
    </main>
  );
}
