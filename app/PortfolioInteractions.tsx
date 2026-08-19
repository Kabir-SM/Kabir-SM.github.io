"use client";

import { useEffect, useRef, useState } from "react";

type ProjectCase = {
  index: string;
  title: string;
  kicker: string;
  description: string;
  impact: string;
  challenge: string;
  approach: string;
  features: string[];
  tags: string[];
  accent: string;
};

const terminalQuestions = [
  { id: "skills", label: "What are Kabir's strongest skills?" },
  { id: "building", label: "What does Kabir build?" },
  { id: "hire", label: "Why work with Kabir?" },
  { id: "availability", label: "What opportunities interest him?" },
  { id: "education", label: "What is his education?" },
] as const;

const terminalAnswers: Record<(typeof terminalQuestions)[number]["id"], string> = {
  skills: "Kabir is strongest where software meets operations: Python and Java engineering, workflow automation, database systems, AI integration, reporting, and translating real user needs into practical tools.",
  building: "He builds connected systems that remove repetitive work—multi-location reporting automations, database interfaces, RFID asset tracking, and AI-ready operational tools.",
  hire: "Kabir combines hands-on implementation with customer and operational awareness. He can understand the workflow, build the system, test it with people, and explain the result clearly.",
  availability: "Kabir is interested in software engineering, automation, data, and applied AI opportunities where thoughtful technology can create measurable improvements.",
  education: "Kabir is pursuing a bachelor's degree in Computer Science with a concentration in Artificial Intelligence at New York Institute of Technology, with an expected graduation in May 2027.",
};

export function PortfolioInteractions({ projects }: { projects: ProjectCase[] }) {
  const projectDialogRef = useRef<HTMLDialogElement>(null);
  const terminalDialogRef = useRef<HTMLDialogElement>(null);
  const shortcutsDialogRef = useRef<HTMLDialogElement>(null);
  const projectTriggerRef = useRef<HTMLElement | null>(null);
  const terminalTriggerRef = useRef<HTMLElement | null>(null);
  const shortcutTriggerRef = useRef<HTMLElement | null>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectCase | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<(typeof terminalQuestions)[number]["id"]>("skills");

  const closeDialog = (dialog: HTMLDialogElement | null) => {
    if (dialog?.open) dialog.close();
  };

  const openTerminal = () => {
    terminalTriggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (!terminalDialogRef.current?.open) terminalDialogRef.current?.showModal();
  };

  const openShortcuts = () => {
    shortcutTriggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (!shortcutsDialogRef.current?.open) shortcutsDialogRef.current?.showModal();
  };

  useEffect(() => {
    const onProjectClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-project-open]") : null;
      if (!target) return;
      const project = projects.find((item) => item.index === target.dataset.projectOpen);
      if (!project) return;
      projectTriggerRef.current = target;
      setSelectedProject(project);
    };
    document.addEventListener("click", onProjectClick);
    return () => document.removeEventListener("click", onProjectClick);
  }, [projects]);

  useEffect(() => {
    if (selectedProject && !projectDialogRef.current?.open) projectDialogRef.current?.showModal();
  }, [selectedProject]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey || event.repeat) return;
      const target = event.target instanceof HTMLElement ? event.target : null;
      if (target?.matches("input, textarea, select, [contenteditable='true']")) return;
      if (document.querySelector("dialog[open]")) return;

      const key = event.key.toLowerCase();
      const destinations: Record<string, string> = { w: "#work", e: "#experience", a: "#about", c: "#contact" };
      if (destinations[key]) {
        event.preventDefault();
        document.querySelector(destinations[key])?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (key === "m") {
        event.preventDefault();
        document.querySelector<HTMLButtonElement>(".sound-toggle")?.click();
      } else if (key === "k") {
        event.preventDefault();
        openTerminal();
      } else if (event.key === "?") {
        event.preventDefault();
        openShortcuts();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <button className="ask-kabir-launcher" type="button" onClick={openTerminal} data-cursor="ASK KABIR">
        <span aria-hidden="true">&gt;_</span><b>Ask Kabir</b>
      </button>
      <button className="shortcuts-launcher" type="button" onClick={openShortcuts} aria-label="View keyboard shortcuts" data-cursor="SHORTCUTS">
        ?
      </button>

      <dialog
        ref={projectDialogRef}
        className={`project-dialog ${selectedProject ? `accent-${selectedProject.accent}` : ""}`}
        aria-labelledby="project-dialog-title"
        onClick={(event) => { if (event.target === event.currentTarget) closeDialog(projectDialogRef.current); }}
        onClose={() => { setSelectedProject(null); projectTriggerRef.current?.focus(); }}
      >
        {selectedProject ? (
          <div className="project-dialog-shell">
            <div className="interaction-dialog-topline">
              <span>CASE STUDY / {selectedProject.index}</span>
              <button type="button" onClick={() => closeDialog(projectDialogRef.current)} aria-label="Close case study">×</button>
            </div>
            <header className="project-dialog-heading">
              <p>{selectedProject.kicker}</p>
              <h2 id="project-dialog-title">{selectedProject.title}</h2>
              <span>{selectedProject.description}</span>
            </header>
            <div className="case-study-grid">
              <section>
                <p className="eyebrow">01 / Challenge</p>
                <h3>What needed to change</h3>
                <p>{selectedProject.challenge}</p>
              </section>
              <section>
                <p className="eyebrow">02 / Approach</p>
                <h3>How I approached it</h3>
                <p>{selectedProject.approach}</p>
              </section>
              <section className="case-study-outcome">
                <p className="eyebrow">03 / Outcome</p>
                <h3>{selectedProject.impact}</h3>
              </section>
              <section>
                <p className="eyebrow">04 / System features</p>
                <ul>{selectedProject.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
              </section>
            </div>
            <div className="case-study-footer">
              <ul className="tag-list" aria-label={`${selectedProject.title} technologies`}>
                {selectedProject.tags.map((tag) => <li key={tag}>{tag}</li>)}
              </ul>
              <div>
                <button type="button" className="button button-primary" onClick={() => { closeDialog(projectDialogRef.current); window.dispatchEvent(new Event("open-kabir-contact")); }}>
                  Ask about this project <span aria-hidden="true">?</span>
                </button>
                <a className="button button-secondary" href="/Kabir_Marwaha_Resume_2026.pdf" target="_blank" rel="noreferrer">View résumé <span aria-hidden="true">↗</span></a>
              </div>
            </div>
          </div>
        ) : null}
      </dialog>

      <dialog
        ref={terminalDialogRef}
        className="terminal-dialog"
        aria-labelledby="terminal-dialog-title"
        onClick={(event) => { if (event.target === event.currentTarget) closeDialog(terminalDialogRef.current); }}
        onClose={() => terminalTriggerRef.current?.focus()}
      >
        <div className="terminal-shell">
          <div className="interaction-dialog-topline">
            <span>KABIR_PROFILE.EXE / LOCAL</span>
            <button type="button" onClick={() => closeDialog(terminalDialogRef.current)} aria-label="Close Ask Kabir">×</button>
          </div>
          <div className="terminal-heading">
            <p>&gt; profile --interactive</p>
            <h2 id="terminal-dialog-title">Ask Kabir</h2>
            <span>Choose a question. Answers come from the portfolio and résumé—nothing is uploaded.</span>
          </div>
          <div className="terminal-grid">
            <div className="terminal-questions" aria-label="Questions">
              {terminalQuestions.map((question) => (
                <button className={selectedQuestion === question.id ? "is-active" : ""} type="button" key={question.id} onClick={() => setSelectedQuestion(question.id)}>
                  <span>&gt;</span>{question.label}
                </button>
              ))}
            </div>
            <div className="terminal-answer" aria-live="polite">
              <p>kabir@portfolio:~$ answer --{selectedQuestion}</p>
              <strong>{terminalAnswers[selectedQuestion]}</strong>
              <span>STATUS / READY TO CONNECT</span>
            </div>
          </div>
          <button className="terminal-contact" type="button" onClick={() => { closeDialog(terminalDialogRef.current); window.dispatchEvent(new Event("open-kabir-contact")); }}>
            Start a real conversation <span aria-hidden="true">↗</span>
          </button>
        </div>
      </dialog>

      <dialog
        ref={shortcutsDialogRef}
        className="shortcuts-dialog"
        aria-labelledby="shortcuts-dialog-title"
        onClick={(event) => { if (event.target === event.currentTarget) closeDialog(shortcutsDialogRef.current); }}
        onClose={() => shortcutTriggerRef.current?.focus()}
      >
        <div className="shortcuts-shell">
          <div className="interaction-dialog-topline">
            <span>NAVIGATION / KEYS</span>
            <button type="button" onClick={() => closeDialog(shortcutsDialogRef.current)} aria-label="Close keyboard shortcuts">×</button>
          </div>
          <h2 id="shortcuts-dialog-title">Move through the portfolio.</h2>
          <dl>
            <div><dt>W</dt><dd>Selected work</dd></div>
            <div><dt>E</dt><dd>Experience</dd></div>
            <div><dt>A</dt><dd>About Kabir</dd></div>
            <div><dt>C</dt><dd>Contact</dd></div>
            <div><dt>M</dt><dd>Toggle music</dd></div>
            <div><dt>K</dt><dd>Ask Kabir</dd></div>
            <div><dt>?</dt><dd>Show shortcuts</dd></div>
          </dl>
        </div>
      </dialog>
    </>
  );
}
