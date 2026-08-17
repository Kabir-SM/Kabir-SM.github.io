"use client";

import { FormEvent, ReactNode, useEffect, useRef, useState } from "react";

const OPEN_CONTACT_EVENT = "open-kabir-contact";
const CONTACT_EMAIL = "Kabir_1_6@icloud.com";

export function ContactTrigger({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <button
      className={`contact-trigger ${className}`.trim()}
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_CONTACT_EVENT))}
    >
      {children}
    </button>
  );
}

export function ContactModal() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const openDialog = () => {
      const dialog = dialogRef.current;
      if (!dialog) return;
      previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setStatus("");
      if (!dialog.open) dialog.showModal();
      window.setTimeout(() => firstInputRef.current?.focus(), 40);
    };
    window.addEventListener(OPEN_CONTACT_EVENT, openDialog);
    return () => window.removeEventListener(OPEN_CONTACT_EVENT, openDialog);
  }, []);

  const closeDialog = () => {
    dialogRef.current?.close();
    previousFocusRef.current?.focus();
  };

  const prepareEmail = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") || "Portfolio visitor").trim();
    const email = String(data.get("email") || "").trim();
    const company = String(data.get("company") || "Not provided").trim();
    const interest = String(data.get("interest") || "General conversation").trim();
    const message = String(data.get("message") || "").trim();
    const subject = `Portfolio inquiry from ${name} — ${interest}`;
    const body = [
      `Hi Kabir,`,
      "",
      message,
      "",
      "— Contact details —",
      `Name: ${name}`,
      `Email: ${email}`,
      `Company / organization: ${company || "Not provided"}`,
      `Interested in: ${interest}`,
      "",
      "Sent from Kabir Marwaha's portfolio.",
    ].join("\n");
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(CONTACT_EMAIL)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setStatus("Opening Gmail with your message filled in. Press Send there to deliver it to Kabir.");
    window.location.assign(gmailUrl);
  };

  return (
    <dialog
      ref={dialogRef}
      className="contact-dialog"
      aria-labelledby="contact-dialog-title"
      onClick={(event) => { if (event.target === event.currentTarget) closeDialog(); }}
    >
      <div className="contact-modal-shell">
        <div className="contact-modal-topline">
          <span>DIRECT CHANNEL / KM</span>
          <button className="contact-modal-close" type="button" aria-label="Close contact form" onClick={closeDialog}>×</button>
        </div>
        <div className="contact-modal-heading">
          <p className="eyebrow">Start a conversation</p>
          <h2 id="contact-dialog-title">Tell me what you&apos;re building.</h2>
          <p>Share a few details and I&apos;ll turn them into a ready-to-send Gmail draft addressed directly to Kabir.</p>
        </div>
        <form className="contact-form" onSubmit={prepareEmail}>
          <div className="contact-form-grid">
            <label>
              <span>Name *</span>
              <input ref={firstInputRef} name="name" type="text" autoComplete="name" placeholder="Your name" required />
            </label>
            <label>
              <span>Email *</span>
              <input name="email" type="email" autoComplete="email" placeholder="you@company.com" required />
            </label>
          </div>
          <div className="contact-form-grid">
            <label>
              <span>Company / organization</span>
              <input name="company" type="text" autoComplete="organization" placeholder="Optional" />
            </label>
            <label>
              <span>Interested in</span>
              <select name="interest" defaultValue="Software engineering opportunity">
                <option>Software engineering opportunity</option>
                <option>Automation project</option>
                <option>AI / data project</option>
                <option>Collaboration</option>
                <option>General conversation</option>
                <option>Other</option>
              </select>
            </label>
          </div>
          <label>
            <span>Message *</span>
            <textarea name="message" rows={5} placeholder="A little about the opportunity, project, or idea…" required />
          </label>
          <div className="contact-form-actions">
            <button className="button button-primary" type="submit">Open Gmail <span aria-hidden="true">↗</span></button>
          </div>
          <p className="contact-form-note">Nothing is uploaded or stored. Gmail handles delivery after you press Send.</p>
          <p className="contact-form-status" role="status" aria-live="polite">{status}</p>
        </form>
      </div>
    </dialog>
  );
}
