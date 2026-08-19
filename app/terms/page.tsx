import type { Metadata } from "next";
import { LegalPage, LegalSection } from "../LegalPage";

export const metadata: Metadata = {
  title: "Terms of Use | Kabir Marwaha",
  description: "Terms governing use of Kabir Marwaha's portfolio website.",
};

export default function TermsOfUse() {
  return (
    <LegalPage
      eyebrow="Legal / Terms"
      title="Terms of Use"
      introduction="These terms describe the conditions for viewing and using Kabir Marwaha's portfolio website."
    >
      <LegalSection number="01" title="Acceptance of these terms">
        <p>
          By accessing this portfolio, you agree to these Terms of Use. If you do not agree,
          please discontinue use of the site. These terms may be updated periodically, with
          the revision date shown above.
        </p>
      </LegalSection>

      <LegalSection number="02" title="Portfolio purpose">
        <p>
          This site presents Kabir&apos;s background, experience, projects, skills, and contact
          information for general professional and informational purposes. Project summaries
          may be condensed, simplified, or updated as the underlying work evolves.
        </p>
        <p>
          Nothing on this site constitutes legal, financial, security, engineering, or other
          professional advice, and no employment, partnership, client, or other relationship
          is created merely by visiting the site or sending a message.
        </p>
      </LegalSection>

      <LegalSection number="03" title="Permitted use">
        <p>You may view and share links to this portfolio for lawful personal or professional purposes. You may not:</p>
        <ul>
          <li>interfere with the site, attempt unauthorized access, or introduce harmful code;</li>
          <li>misrepresent your identity or affiliation when contacting Kabir;</li>
          <li>use automated methods that place an unreasonable load on the site; or</li>
          <li>copy or present portfolio content as your own without permission.</li>
        </ul>
      </LegalSection>

      <LegalSection number="04" title="Intellectual property">
        <p>
          Unless otherwise identified, the portfolio&apos;s original text, visual design, code,
          and presentation are owned by Kabir Marwaha or used with permission. Names, logos,
          and materials belonging to schools, employers, projects, or other third parties
          remain the property of their respective owners.
        </p>
      </LegalSection>

      <LegalSection number="05" title="External services and links">
        <p>
          The site may link to Gmail, documents, repositories, or other third-party services.
          Kabir does not control those services and is not responsible for their availability,
          content, security, or policies. Visiting them is at your discretion and subject to
          their own terms.
        </p>
      </LegalSection>

      <LegalSection number="06" title="Availability and disclaimers">
        <p>
          The portfolio is provided “as is” and “as available.” While reasonable care is taken
          to keep it useful and accurate, no guarantee is made that every detail will always
          be complete, current, uninterrupted, or error-free.
        </p>
        <p>
          To the fullest extent permitted by applicable law, Kabir disclaims implied warranties
          and is not liable for indirect, incidental, special, consequential, or similar damages
          arising from use of, or inability to use, this portfolio.
        </p>
      </LegalSection>

      <LegalSection number="07" title="Contact">
        <p>
          Questions about these terms may be sent to <a href="mailto:Kabir_1_6@icloud.com">Kabir_1_6@icloud.com</a>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
