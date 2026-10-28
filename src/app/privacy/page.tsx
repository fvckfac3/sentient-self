import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalPage } from '@/components/legal/legal-page'
import { SITE_NAME, SUPPORT_EMAIL } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `How ${SITE_NAME} collects, uses and protects your information.`,
}

// DRAFT - must be reviewed by a lawyer before launch. Items to confirm:
// - each AI provider's API data-retention and training terms (DeepSeek, OpenAI,
//   Anthropic, Google) and the cross-border transfer wording for DeepSeek
// - which US state consumer-health-data laws apply (e.g. Washington MHMDA) and
//   whether GDPR/UK GDPR applies at launch
// - backup retention period and the legal entity name/address
export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <section>
        <p>
          {SITE_NAME} is a place to talk through hard things, journal, and work through guided
          exercises. What you share here is personal, and often about recovery and mental health.
          This policy explains what we collect, why, who we share it with, and the choices you
          have.
        </p>
        <p>
          {SITE_NAME} is not a healthcare provider. What you share is not part of a medical record
          and is not reviewed by a clinician.
        </p>
      </section>

      <section>
        <h2>What we collect</h2>
        <ul>
          <li>
            <strong>Account details:</strong> your email address, name, and a securely hashed
            password. If you sign in with Google, we receive your name, email and profile picture
            from Google.
          </li>
          <li>
            <strong>Onboarding answers:</strong> your goals, current challenges, emotional
            baseline, preferences, and, if you choose to share them, your recovery stage and the
            substances you are recovering from.
          </li>
          <li>
            <strong>Your content:</strong> chat messages, journal entries, mood and energy ratings,
            gratitude and goals, exercise reflections, and the insights generated from them.
          </li>
          <li>
            <strong>Usage records:</strong> which exercises you started, completed or declined,
            streaks, your preferred AI model, and when you acknowledged the medical disclaimer.
          </li>
          <li>
            <strong>Billing details:</strong> if you subscribe, our payment processor (Stripe)
            collects your payment information. We store only a customer reference and your
            subscription status, never your card number.
          </li>
          <li>
            <strong>Technical data:</strong> a session cookie that keeps you signed in, and
            error reports with basic device and browser information when something breaks.
          </li>
        </ul>
      </section>

      <section>
        <h2>How we use it</h2>
        <ul>
          <li>To run the service: hold conversations, suggest and guide exercises, save your
            journal, and show your progress.</li>
          <li>To personalize responses using your onboarding answers and recent conversation.</li>
          <li>To check your messages automatically for signs of crisis so we can show crisis
            resources right away. This check runs on our servers; we do not contact anyone on
            your behalf.</li>
          <li>To process payments and manage your subscription.</li>
          <li>To keep the service secure, prevent abuse, and fix errors.</li>
        </ul>
        <p>
          We do not sell your personal information, we do not use it for advertising, and we do
          not use your content to train AI models.
        </p>
      </section>

      <section>
        <h2>AI providers</h2>
        <p>
          To generate replies and insights, we send the relevant part of your conversation or
          journal entry, along with context from your profile, to the company that runs the AI
          model in use. Depending on your plan and settings, that is DeepSeek, Anthropic, OpenAI
          or Google. Each provider processes this data under its own API terms, which may allow it
          to keep data for a limited time for safety and abuse monitoring.
        </p>
        <p>
          The free plan uses DeepSeek by default. DeepSeek is based in China, so if you use a
          DeepSeek model your messages are processed there. You can choose a different model in
          Settings &rarr; AI Preferences if one is available on your plan.
        </p>
      </section>

      <section>
        <h2>Who else we share data with</h2>
        <ul>
          <li><strong>Service providers</strong> that host our app and database, process
            payments (Stripe), and report errors, only as needed to provide those services.</li>
          <li><strong>Legal requirements:</strong> when the law requires it, or to protect
            someone&apos;s safety in an emergency.</li>
          <li><strong>Business transfers:</strong> if {SITE_NAME} is merged or acquired, your
            information would transfer under this policy, and we would tell you first.</li>
        </ul>
        <p>
          If you use {SITE_NAME} through an organization, it can see aggregate usage only, never
          your conversations or journal.
        </p>
      </section>

      <section>
        <h2>Your choices and rights</h2>
        <ul>
          <li><strong>Export:</strong> download all of your data as JSON or CSV from
            Settings &rarr; Privacy.</li>
          <li><strong>Delete:</strong> delete your account from Settings &rarr; Privacy. This
            immediately and permanently removes your profile, conversations, journal and insights.
            Residual copies may remain in encrypted backups for a limited period before being
            overwritten.</li>
          <li><strong>Correct:</strong> update your profile in Settings &rarr; Profile.</li>
          <li><strong>Ask us:</strong> email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>{' '}
            for anything else, including access requests under the laws of your state or country.</li>
        </ul>
      </section>

      <section>
        <h2>Storage and security</h2>
        <p>
          Data is encrypted in transit and stored with our hosting and database providers.
          Passwords are hashed and never stored in plain text. Your browser may also keep your
          current conversation and settings in local storage so the app loads quickly; signing
          out or clearing site data removes it.
        </p>
        <p>
          No system is perfectly secure. If we learn of a breach that affects your information,
          we will notify you as the law requires.
        </p>
      </section>

      <section>
        <h2>Age requirement</h2>
        <p>
          {SITE_NAME} is for adults 18 and older. We do not knowingly collect information from
          anyone younger. If you believe a minor has created an account, contact us and we will
          delete it.
        </p>
      </section>

      <section>
        <h2>Changes to this policy</h2>
        <p>
          If we make material changes, we will tell you in the app or by email before they take
          effect.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          Questions about privacy: <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. See
          also our <Link href="/terms">Terms of Service</Link>.
        </p>
      </section>
    </LegalPage>
  )
}
