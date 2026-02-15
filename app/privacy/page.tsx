import { Metadata } from "next";
import Link from "next/link";
import { LEGAL_LAST_UPDATED, COMPANY_INFO } from "@/lib/constants/legal";

export const metadata: Metadata = {
  title: "Privacy Policy | NEXO",
  description: "Privacy Policy for NEXO - AI Companion Platform",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="text-2xl font-bold text-gradient"
          >
            NEXO
          </Link>
        </div>

        {/* Back Navigation */}
        <div className="mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>←</span>
            <span>Back to NEXO</span>
          </Link>
        </div>

        <article className="prose prose-neutral dark:prose-invert max-w-none">
          <h1>Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: {LEGAL_LAST_UPDATED}</p>

          <section>
            <h2>1. Introduction</h2>
            <p>
              NEXO (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy 
              explains how we collect, use, disclose, and safeguard your information when you use our 
              AI companion platform.
            </p>
          </section>

          <section>
            <h2>2. Information We Collect</h2>
            
            <h3>2.1 Information You Provide</h3>
            <ul>
              <li><strong>Account Information:</strong> Email address, password, display name, date of birth</li>
              <li><strong>Profile Information:</strong> Preferences, interests, and settings you choose to share</li>
              <li><strong>Conversation Data:</strong> Messages you exchange with our AI companions</li>
              <li><strong>Payment Information:</strong> Billing details processed securely through Stripe</li>
            </ul>

            <h3>2.2 Information Collected Automatically</h3>
            <ul>
              <li><strong>Usage Data:</strong> How you interact with the Service, features used, time spent</li>
              <li><strong>Device Information:</strong> Browser type, operating system, device identifiers</li>
              <li><strong>Log Data:</strong> IP address, access times, pages viewed</li>
            </ul>
          </section>

          <section>
            <h2>3. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul>
              <li>Provide, maintain, and improve our Service</li>
              <li>Personalize your experience with AI companions</li>
              <li>Process transactions and send related information</li>
              <li>Send administrative messages, updates, and security alerts</li>
              <li>Respond to your comments, questions, and support requests</li>
              <li>Monitor and analyze usage patterns to improve the Service</li>
              <li>Detect, prevent, and address technical issues or abuse</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2>4. AI Conversations and Data Retention</h2>
            <p>
              <strong>Conversation Storage:</strong> Your conversations with AI companions are stored to 
              provide continuity and improve your experience. This allows our AI to remember context and 
              provide more personalized responses.
            </p>
            <p>
              <strong>AI Training:</strong> We may use anonymized and aggregated conversation data to 
              improve our AI models. Individual conversations are not used to train AI without your consent.
            </p>
            <p>
              <strong>Retention Period:</strong> Conversation data is retained for as long as your account 
              is active. You can request deletion of your conversation history at any time.
            </p>
          </section>

          <section>
            <h2>5. Data Sharing and Third Parties</h2>
            <p>We do not sell your personal information. We may share your data with:</p>
            <ul>
              <li><strong>Service Providers:</strong> Third parties that help us operate the Service 
                (e.g., hosting, payment processing, analytics)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
            </ul>
            
            <h3>5.1 Third-Party Services We Use</h3>
            <ul>
              <li><strong>OpenAI:</strong> AI model provider (conversations are processed through their API)</li>
              <li><strong>Stripe:</strong> Payment processing</li>
              <li><strong>Render:</strong> Cloud hosting</li>
              <li><strong>Vercel:</strong> Frontend hosting</li>
            </ul>
          </section>

          <section>
            <h2>6. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal 
              information, including:
            </p>
            <ul>
              <li>Encryption of data in transit (HTTPS/TLS)</li>
              <li>Secure password hashing</li>
              <li>Regular security assessments</li>
              <li>Access controls and authentication</li>
            </ul>
            <p>
              However, no method of transmission over the Internet is 100% secure, and we cannot 
              guarantee absolute security.
            </p>
          </section>

          <section>
            <h2>7. Your Rights (GDPR)</h2>
            <p>If you are in the European Economic Area, you have the right to:</p>
            <ul>
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Rectification:</strong> Request correction of inaccurate data</li>
              <li><strong>Erasure:</strong> Request deletion of your data (&quot;right to be forgotten&quot;)</li>
              <li><strong>Portability:</strong> Request transfer of your data</li>
              <li><strong>Objection:</strong> Object to processing of your data</li>
              <li><strong>Restriction:</strong> Request restriction of processing</li>
            </ul>
            <p>
              To exercise these rights, contact us at {COMPANY_INFO.privacyEmail}. We will respond within 30 days.
            </p>
          </section>

          <section>
            <h2>8. Cookies and Tracking</h2>
            <p>
              We use essential cookies to maintain your session and authentication. We may also use 
              analytics cookies to understand how the Service is used.
            </p>
            <p>
              You can control cookies through your browser settings, but disabling certain cookies may 
              affect the functionality of the Service.
            </p>
          </section>

          <section>
            <h2>9. Children&apos;s Privacy</h2>
            <p>
              NEXO is not intended for users under 18 years of age. We do not knowingly collect personal 
              information from children under 18. If we discover that we have collected information from 
              a child under 18, we will delete it immediately.
            </p>
          </section>

          <section>
            <h2>10. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your own. 
              We ensure appropriate safeguards are in place for such transfers in compliance with 
              applicable data protection laws.
            </p>
          </section>

          <section>
            <h2>11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any material 
              changes by posting the new policy on this page and updating the &quot;Last updated&quot; date.
            </p>
          </section>

          <section>
            <h2>12. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or want to exercise your rights, contact us at:
            </p>
            <p>
              <strong>{COMPANY_INFO.name}</strong><br />
              {COMPANY_INFO.address}<br />
              {COMPANY_INFO.city}<br />
              {COMPANY_INFO.country}<br /><br />
              <strong>Email:</strong> {COMPANY_INFO.email}<br />
              <strong>Website:</strong> {COMPANY_INFO.website}
            </p>
          </section>
        </article>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t">
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <Link href="/terms" className="hover:text-foreground">Terms of Service</Link>
            <Link href="/register" className="hover:text-foreground">Sign Up</Link>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            © 2026 VENKO AI INNOVATIONS LLC. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

