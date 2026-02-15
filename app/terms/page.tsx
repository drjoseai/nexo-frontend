import { Metadata } from "next";
import Link from "next/link";
import { LEGAL_LAST_UPDATED, COMPANY_INFO } from "@/lib/constants/legal";

export const metadata: Metadata = {
  title: "Terms of Service | NEXO",
  description: "Terms of Service for NEXO - AI Companion Platform",
};

export default function TermsOfServicePage() {
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
          <h1>Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: {LEGAL_LAST_UPDATED}</p>

          <section>
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using NEXO (&quot;the Service&quot;), you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h2>2. Description of Service</h2>
            <p>
              NEXO is an AI-powered emotional companionship platform that provides users with AI avatars 
              for conversation, emotional support, and companionship. Our AI companions are designed to 
              provide a supportive and engaging conversational experience.
            </p>
            <p>
              <strong>Important:</strong> NEXO&apos;s AI companions are artificial intelligence programs. 
              They are not real people, therapists, counselors, or medical professionals. The Service 
              is not a substitute for professional mental health care, medical advice, or human relationships.
            </p>
          </section>

          <section>
            <h2>3. Age Requirement</h2>
            <p>
              You must be at least 18 years old to use NEXO. By using the Service, you represent and 
              warrant that you are at least 18 years of age. We reserve the right to terminate accounts 
              of users who misrepresent their age.
            </p>
          </section>

          <section>
            <h2>4. User Accounts</h2>
            <p>
              To use NEXO, you must create an account with accurate information. You are responsible for:
            </p>
            <ul>
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use</li>
            </ul>
          </section>

          <section>
            <h2>5. Acceptable Use</h2>
            <p>You agree not to use NEXO to:</p>
            <ul>
              <li>Violate any applicable laws or regulations</li>
              <li>Harass, abuse, or harm others</li>
              <li>Share content involving minors in any inappropriate context</li>
              <li>Attempt to extract personal data or manipulate the AI system</li>
              <li>Use the Service for any illegal or unauthorized purpose</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Attempt to bypass any security measures</li>
            </ul>
          </section>

          <section>
            <h2>6. AI Interaction Disclaimer</h2>
            <p>
              Our AI companions are powered by artificial intelligence and may occasionally produce 
              inaccurate, inappropriate, or unexpected responses. By using the Service, you acknowledge that:
            </p>
            <ul>
              <li>AI responses are generated automatically and do not represent human opinions</li>
              <li>The AI may make mistakes or provide incorrect information</li>
              <li>Conversations should not be relied upon for medical, legal, financial, or professional advice</li>
              <li>The AI companions do not have genuine emotions or consciousness</li>
            </ul>
          </section>

          <section>
            <h2>7. Subscription and Payments</h2>
            <p>
              NEXO offers various subscription plans. By subscribing, you agree to:
            </p>
            <ul>
              <li>Pay all applicable fees for your chosen plan</li>
              <li>Automatic renewal unless you cancel before the renewal date</li>
              <li>Provide accurate billing information</li>
            </ul>
            <p>
              Refunds are handled on a case-by-case basis. Contact our support team for refund requests.
            </p>
          </section>

          <section>
            <h2>8. Intellectual Property</h2>
            <p>
              All content, features, and functionality of NEXO, including but not limited to text, 
              graphics, logos, and software, are the exclusive property of NEXO and are protected by 
              copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          <section>
            <h2>9. Privacy</h2>
            <p>
              Your use of NEXO is also governed by our{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
              , which describes how we collect, use, and protect your personal information.
            </p>
          </section>

          <section>
            <h2>10. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, NEXO SHALL NOT BE LIABLE FOR ANY INDIRECT, 
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO 
              LOSS OF PROFITS, DATA, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR USE OF THE SERVICE.
            </p>
            <p>
              NEXO is provided &quot;as is&quot; without warranties of any kind, either express or implied.
            </p>
          </section>

          <section>
            <h2>11. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your account at any time for violations of 
              these Terms or for any other reason at our sole discretion. Upon termination, your right 
              to use the Service will immediately cease.
            </p>
          </section>

          <section>
            <h2>12. Changes to Terms</h2>
            <p>
              We may update these Terms from time to time. We will notify you of any material changes 
              by posting the new Terms on this page and updating the &quot;Last updated&quot; date. Your continued 
              use of the Service after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2>13. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the 
              State of Florida, United States, without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2>14. Contact Information</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
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
            <Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link>
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

