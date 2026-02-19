import { Metadata } from "next";
import Link from "next/link";
import { LEGAL_LAST_UPDATED, COMPANY_INFO } from "@/lib/constants/legal";

export const metadata: Metadata = {
  title: "Cookie Policy | NEXO",
  description: "Cookie Policy for NEXO — AI Companion Platform",
};

export default function CookiePolicyPage() {
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
          <h1>Cookie Policy</h1>
          <p className="text-muted-foreground">Last updated: {LEGAL_LAST_UPDATED}</p>

          <section>
            <h2>1. What Are Cookies</h2>
            <p>
              Cookies are small text files that are placed on your device when you visit a website.
              They are widely used to make websites work more efficiently, provide a better user
              experience, and supply information to site owners.
            </p>
            <p>
              In addition to cookies, we may use similar technologies such as local storage, session
              storage, and pixels to store and retrieve information on your device. Throughout this
              policy, we refer to all of these technologies collectively as &quot;cookies.&quot;
            </p>
          </section>

          <section>
            <h2>2. How We Use Cookies</h2>
            <p>NEXO uses the following categories of cookies:</p>

            <h3>2.1 Essential Cookies</h3>
            <p>
              These cookies are strictly necessary for the operation of our Service. They enable core
              functionality such as authentication, session management, and security features. Essential
              cookies are always active and cannot be disabled, as the Service would not function
              properly without them.
            </p>
            <ul>
              <li><strong>Authentication:</strong> Keep you signed in across pages and sessions</li>
              <li><strong>Session Management:</strong> Maintain your session state while using the platform</li>
              <li><strong>Security:</strong> Help protect your account from unauthorized access and prevent CSRF attacks</li>
            </ul>

            <h3>2.2 Functional Cookies</h3>
            <p>
              These cookies allow us to remember choices you make and provide enhanced, personalized
              features. They may be set by us or by third-party providers whose services we have added
              to our pages.
            </p>
            <ul>
              <li><strong>Language Preferences:</strong> Remember your preferred language setting</li>
              <li><strong>Theme Settings:</strong> Store your dark/light mode preference</li>
              <li><strong>Chat Configuration:</strong> Retain your AI companion conversation preferences and layout settings</li>
            </ul>

            <h3>2.3 Analytics Cookies</h3>
            <p>
              These cookies help us understand how visitors interact with our Service by collecting
              anonymous, aggregated information. This data allows us to improve the performance and
              usability of NEXO.
            </p>
            <ul>
              <li>Pages visited and time spent on each page</li>
              <li>Features used and interaction patterns</li>
              <li>Error rates and performance metrics</li>
              <li>General geographic region (country level)</li>
            </ul>
          </section>

          <section>
            <h2>3. Third-Party Cookies</h2>
            <p>
              Some cookies are placed by third-party services that appear on our pages. We do not
              control these cookies and recommend reviewing the respective privacy policies for more
              information.
            </p>
            <ul>
              <li>
                <strong>Stripe:</strong> Used for secure payment processing. Stripe may set cookies to
                detect fraud and process transactions safely. See{" "}
                <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Stripe&apos;s Privacy Policy
                </a>.
              </li>
              <li>
                <strong>Vercel Analytics:</strong> Used to collect anonymous performance and usage
                metrics to help us optimize the platform. See{" "}
                <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Vercel&apos;s Privacy Policy
                </a>.
              </li>
              <li>
                <strong>Sentry:</strong> Used for error tracking and monitoring to help us identify and
                fix issues quickly. See{" "}
                <a href="https://sentry.io/privacy/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Sentry&apos;s Privacy Policy
                </a>.
              </li>
            </ul>
          </section>

          <section>
            <h2>4. Managing Your Cookies</h2>
            <p>
              Most web browsers allow you to manage your cookie preferences through browser settings.
              You can typically:
            </p>
            <ul>
              <li>View what cookies are stored and delete them individually</li>
              <li>Block third-party cookies</li>
              <li>Block cookies from specific sites</li>
              <li>Block all cookies from being set</li>
              <li>Delete all cookies when you close your browser</li>
            </ul>
            <p>
              Please note that disabling or blocking certain cookies may affect the functionality of
              NEXO. In particular, <strong>essential cookies are required</strong> for the Service to
              operate correctly — disabling them may prevent you from signing in or using core features.
            </p>
            <p>
              For more information on managing cookies in your browser, visit your browser&apos;s help
              documentation or{" "}
              <a href="https://www.allaboutcookies.org/manage-cookies/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                allaboutcookies.org
              </a>.
            </p>
          </section>

          <section>
            <h2>5. Cookie Duration</h2>
            <p>Cookies used on NEXO fall into two categories based on their duration:</p>
            <ul>
              <li>
                <strong>Session Cookies:</strong> These are temporary cookies that are deleted when you
                close your browser. They are used primarily for session management and security during
                your visit.
              </li>
              <li>
                <strong>Persistent Cookies:</strong> These remain on your device for a set period or
                until you delete them manually. They are used to remember your preferences, keep you
                signed in, and provide analytics data across multiple sessions.
              </li>
            </ul>
          </section>

          <section>
            <h2>6. Updates to This Policy</h2>
            <p>
              We may update this Cookie Policy from time to time to reflect changes in our practices
              or for operational, legal, or regulatory reasons. When we make material changes, we will
              notify you by email or through an in-app notification, and we will update the &quot;Last
              updated&quot; date at the top of this page.
            </p>
            <p>
              We encourage you to review this policy periodically to stay informed about how we use
              cookies.
            </p>
          </section>

          <section>
            <h2>7. Contact Us</h2>
            <p>
              If you have any questions about our use of cookies or this Cookie Policy, please contact
              us at:
            </p>
            <p>
              <strong>{COMPANY_INFO.name}</strong><br />
              {COMPANY_INFO.address}<br />
              {COMPANY_INFO.city}<br />
              {COMPANY_INFO.country}<br /><br />
              <strong>Privacy Email:</strong> {COMPANY_INFO.privacyEmail}<br />
              <strong>General Email:</strong> {COMPANY_INFO.email}<br />
              <strong>Website:</strong> {COMPANY_INFO.website}
            </p>
          </section>
        </article>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t">
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <Link href="/terms" className="hover:text-foreground">Terms of Service</Link>
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
