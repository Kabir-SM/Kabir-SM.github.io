import type { Metadata } from "next";
import { LegalPage, LegalSection } from "../LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy | Kabir Marwaha",
  description: "Privacy information for Kabir Marwaha's portfolio website.",
};

export default function PrivacyPolicy() {
  return (
    <LegalPage
      eyebrow="Legal / Privacy"
      title="Privacy Policy"
      introduction="This policy explains what information may be handled when you visit this portfolio or choose to contact Kabir."
    >
      <LegalSection number="01" title="Information you choose to provide">
        <p>
          The contact form may ask for your name, email address, company or organization,
          area of interest, and a message. Nothing entered in the contact form is uploaded
          to or stored by this portfolio.
        </p>
        <p>
          When you submit the form, the site prepares a draft and opens Gmail in your
          browser. Your information is sent only if you choose to send that email, at which
          point it is handled by your email provider and Kabir&apos;s email provider under their
          respective privacy practices.
        </p>
      </LegalSection>

      <LegalSection number="02" title="Technical information">
        <p>
          Like most hosted websites, the hosting and network providers that deliver this
          portfolio may automatically process limited technical information such as your IP
          address, browser type, requested pages, timestamps, and security logs. This
          information may be used to deliver, maintain, and protect the site.
        </p>
        <p>This portfolio does not intentionally use advertising trackers or analytics cookies.</p>
      </LegalSection>

      <LegalSection number="03" title="How information is used">
        <p>Information you email may be used to:</p>
        <ul>
          <li>respond to your question, opportunity, or collaboration request;</li>
          <li>continue a professional conversation you initiated; and</li>
          <li>prevent abuse and protect the portfolio and its visitors.</li>
        </ul>
      </LegalSection>

      <LegalSection number="04" title="Sharing and retention">
        <p>
          Kabir does not sell personal information. Information may be handled by service
          providers needed to host the site or deliver email, or disclosed when required by
          law or reasonably necessary to protect rights, safety, and security.
        </p>
        <p>
          Emails and related correspondence may be retained for as long as reasonably needed
          to respond, maintain professional records, resolve issues, or satisfy legal obligations.
        </p>
      </LegalSection>

      <LegalSection number="05" title="Your choices and external links">
        <p>
          You decide whether to send an email. You may also request access, correction, or
          deletion of information you previously emailed, subject to applicable law and
          legitimate recordkeeping needs.
        </p>
        <p>
          The portfolio may link to third-party websites or services. Their privacy practices
          are controlled by those third parties, not by this policy.
        </p>
      </LegalSection>

      <LegalSection number="06" title="Children and policy updates">
        <p>
          This professional portfolio is not directed to children under 13 and does not
          knowingly seek personal information from them. This policy may be updated as the
          portfolio or its services change. The date above identifies the latest revision.
        </p>
      </LegalSection>

      <LegalSection number="07" title="Contact">
        <p>
          For privacy questions or requests, email <a href="mailto:Kabir_1_6@icloud.com">Kabir_1_6@icloud.com</a>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
