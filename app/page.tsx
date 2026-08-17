const experience = [
  {
    company: "Apple",
    role: "Product Zone Specialist",
    place: "Manhasset, NY",
    dates: "July 2026 - Present",
    copy:
      "Translate customer needs into clear product decisions through tailored conversations, hands-on demonstrations, and deep knowledge across Apple hardware, accessories, and services.",
    tags: ["Product knowledge", "Customer experience", "Collaboration"],
  },
  {
    company: "Goldfish Swim School / Boardman Bay Capital Management",
    role: "Data Analyst & Software Engineering Intern",
    place: "New Rochelle, NY",
    dates: "June 2026 - August 2026",
    copy:
      "Built production automations for aged accounts and absence reporting, connected IClassPro data to Excel, Gmail, and Podium, and launched a centralized reporting hub across three locations.",
    tags: ["Python", "Automation", "Reporting", "AI integration"],
  },
  {
    company: "All Scientific Technology Group, LLC",
    role: "Software Engineering Intern",
    place: "New Hyde Park, NY",
    dates: "July 2025 - December 2025",
    copy:
      "Integrated RFID hardware with internal software for real-time medical equipment tracking, improving inventory visibility and supporting deployments at major New York City healthcare facilities.",
    tags: ["RFID systems", "Systems integration", "Field deployment"],
  },
  {
    company: "New York Institute of Technology",
    role: "Software Engineering Project Lead",
    place: "Old Westbury, NY",
    dates: "April 2025 - July 2025",
    copy:
      "Led PolyDB, a JavaFX and JDBC application that unified PostgreSQL, MySQL, and Oracle workflows through one interface while eliminating more than 400 lines of duplicated connection logic.",
    tags: ["Java", "JavaFX", "JDBC", "SQL"],
  },
];

const projects = [
  {
    index: "01",
    title: "Absence Report Automation",
    kicker: "Operations automation / 3 locations",
    description:
      "A maintainable reporting and outreach workflow that moves attendance data from IClassPro into structured Excel reports, then coordinates Gmail and Podium communication.",
    impact: "Replaced a repetitive multi-system process with one connected workflow.",
    tags: ["Python", "Excel", "Gmail", "Podium", "IClassPro"],
    accent: "cyan",
  },
  {
    index: "02",
    title: "PolyDB",
    kicker: "Multi-database desktop application",
    description:
      "A unified JavaFX interface for PostgreSQL, MySQL, and Oracle with authentication, schema inspection, dynamic table rendering, and GUI-driven CRUD operations.",
    impact: "Improved student database workflows by approximately 40%.",
    tags: ["Java", "JavaFX", "JDBC", "PostgreSQL", "MySQL", "Oracle"],
    accent: "lime",
  },
  {
    index: "03",
    title: "Central Reporting Hub",
    kicker: "Live operational intelligence",
    description:
      "A deployed reporting surface that centralized recurring operational information, surfaced workflow bottlenecks, and created a home for AI-enabled process improvements.",
    impact: "Made reporting easier to access, understand, and act on.",
    tags: ["Data analysis", "Reporting", "AI / LLM", "Process design"],
    accent: "violet",
  },
  {
    index: "04",
    title: "RFID Asset Tracking",
    kicker: "Software + hardware integration",
    description:
      "A real-time medical equipment tracking system connecting RFID hardware with internal inventory software across healthcare environments.",
    impact: "Supported data accuracy, lifecycle visibility, and field deployment.",
    tags: ["RFID", "Inventory systems", "Testing", "Healthcare tech"],
    accent: "orange",
  },
];

const skillGroups = [
  {
    number: "01",
    title: "Build",
    items: ["Python", "Java", "SQL", "HTML", "CSS", "JavaFX", "JDBC", "Git"],
  },
  {
    number: "02",
    title: "Connect",
    items: ["Gmail", "Podium", "IClassPro", "Excel", "RFID systems", "Databases"],
  },
  {
    number: "03",
    title: "Improve",
    items: ["Automation", "AI / LLM integration", "Data analysis", "Reporting", "Process improvement"],
  },
];

const coursework = [
  "Data Structures",
  "Design & Analysis of Algorithms",
  "Operating Systems",
  "Theory of Computation",
  "Computer Networks",
  "Database Management",
  "Artificial Intelligence",
  "Software Engineering",
];

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <div className="site-shell">
        <div className="ambient ambient-one" aria-hidden="true" />
        <div className="ambient ambient-two" aria-hidden="true" />
        <div className="signal-grid" aria-hidden="true" />

        <header className="site-header">
          <a className="brand" href="#top" aria-label="Kabir Marwaha, home">
            <span className="brand-mark">KM</span>
            <span>Kabir Marwaha</span>
          </a>
          <nav className="main-nav" aria-label="Primary navigation">
            <a href="#work">Work</a>
            <a href="#experience">Experience</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </nav>
          <a className="header-cta" href="mailto:Kabir_1_6@icloud.com">
            Let&apos;s talk <span aria-hidden="true">↗</span>
          </a>
        </header>

        <main id="main-content">
          <section className="hero" id="top">
            <div className="hero-copy">
              <div className="availability-pill">
                <span className="status-dot" aria-hidden="true" />
                CS + AI student in New York
              </div>
              <p className="hero-kicker">Software engineering / automation / data</p>
              <h1>
                I build systems that turn manual work into <em>momentum.</em>
              </h1>
              <p className="hero-intro">
                I&apos;m Kabir, a computer science student and software engineer focused on
                automation, AI integration, and practical tools that make complex work feel
                simple.
              </p>
              <div className="hero-actions">
                <a className="button button-primary" href="#work">
                  Explore my work <span aria-hidden="true">↓</span>
                </a>
                <a
                  className="button button-secondary"
                  href="/Kabir_Marwaha_Resume_2026.pdf"
                  target="_blank"
                  rel="noreferrer"
                >
                  View resume <span aria-hidden="true">↗</span>
                </a>
              </div>
              <dl className="hero-metrics" aria-label="Selected results">
                <div>
                  <dt>3</dt>
                  <dd>locations automated</dd>
                </div>
                <div>
                  <dt>400+</dt>
                  <dd>duplicate lines removed</dd>
                </div>
                <div>
                  <dt>40%</dt>
                  <dd>workflow improvement</dd>
                </div>
              </dl>
            </div>

            <div className="badge-stage" aria-label="Kabir Marwaha profile card">
              <div className="badge-shadow" aria-hidden="true" />
              <div className="lanyard" aria-hidden="true">
                <span />
              </div>
              <article className="profile-badge">
                <div className="badge-topline">
                  <span>FIELD NOTE / 2026</span>
                  <span className="badge-live"><i /> ACTIVE</span>
                </div>
                <div className="badge-portrait">
                  <span className="initials">KM</span>
                  <span className="scan-line" aria-hidden="true" />
                  <span className="corner corner-one" aria-hidden="true" />
                  <span className="corner corner-two" aria-hidden="true" />
                  <span className="corner corner-three" aria-hidden="true" />
                  <span className="corner corner-four" aria-hidden="true" />
                </div>
                <div className="badge-name">
                  <span>Kabir Singh</span>
                  <strong>Marwaha</strong>
                </div>
                <div className="badge-role">
                  <span>Computer Science</span>
                  <span>AI concentration</span>
                </div>
                <div className="barcode" aria-hidden="true" />
                <div className="badge-footer">
                  <span>NYIT / MAY 2027</span>
                  <span>NEW YORK / US</span>
                </div>
              </article>
              <p className="badge-caption">Drag-free, physics-inspired profile identity</p>
            </div>
          </section>

          <div className="ticker" aria-label="Core skills">
            <div className="ticker-track">
              {[...Array(2)].flatMap((_, loop) =>
                ["Python", "Java", "Automation", "AI / LLM", "SQL", "Data", "Systems"].map(
                  (item) => (
                    <span key={`${loop}-${item}`}>
                      {item}<i aria-hidden="true" />
                    </span>
                  ),
                ),
              )}
            </div>
          </div>

          <section className="section projects-section" id="work">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Selected work</p>
                <h2>Built for the real world.</h2>
              </div>
              <p>
                Practical systems across automation, data, databases, and hardware - designed
                around the people who use them.
              </p>
            </div>

            <div className="project-grid">
              {projects.map((project) => (
                <article className={`project-card accent-${project.accent}`} key={project.title}>
                  <div className="project-number">{project.index}</div>
                  <div className="project-visual" aria-hidden="true">
                    <span className="orbit orbit-one" />
                    <span className="orbit orbit-two" />
                    <span className="core-dot" />
                    <span className="visual-label">{project.index} / KM</span>
                  </div>
                  <p className="project-kicker">{project.kicker}</p>
                  <h3>{project.title}</h3>
                  <p className="project-description">{project.description}</p>
                  <details>
                    <summary>Project impact <span aria-hidden="true">+</span></summary>
                    <p>{project.impact}</p>
                  </details>
                  <ul className="tag-list" aria-label={`${project.title} technologies`}>
                    {project.tags.map((tag) => <li key={tag}>{tag}</li>)}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          <section className="section experience-section" id="experience">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Experience</p>
                <h2>Across people, products, and systems.</h2>
              </div>
              <span className="section-count">04 roles / 2025-2026</span>
            </div>

            <div className="timeline">
              {experience.map((item, index) => (
                <article className="timeline-item" key={`${item.company}-${item.role}`}>
                  <div className="timeline-index">0{index + 1}</div>
                  <div className="timeline-main">
                    <p className="timeline-company">{item.company}</p>
                    <h3>{item.role}</h3>
                    <p>{item.copy}</p>
                    <ul className="tag-list compact" aria-label={`${item.role} skills`}>
                      {item.tags.map((tag) => <li key={tag}>{tag}</li>)}
                    </ul>
                  </div>
                  <div className="timeline-meta">
                    <span>{item.dates}</span>
                    <span>{item.place}</span>
                  </div>
                </article>
              ))}
            </div>

            <div className="earlier-experience">
              <p className="eyebrow">Earlier experience</p>
              <div>
                <span>CVS / Pharmacy Technician</span>
                <span>July 2024 - November 2025</span>
              </div>
              <div>
                <span>Starbucks / Barista</span>
                <span>June 2022 - July 2024</span>
              </div>
            </div>
          </section>

          <section className="section about-section" id="about">
            <div className="about-grid">
              <div className="about-statement">
                <p className="eyebrow">About Kabir</p>
                <h2>
                  I like the moment when a messy process becomes a system people can
                  <em> trust.</em>
                </h2>
              </div>
              <div className="about-copy">
                <p>
                  I&apos;m pursuing a bachelor&apos;s degree in Computer Science with an AI
                  concentration at New York Institute of Technology. My work sits where
                  software, operations, and human needs meet.
                </p>
                <p>
                  From deploying RFID tracking in healthcare environments to automating
                  reporting across three business locations, I&apos;ve learned to ask the same
                  question: what would make this easier, clearer, and more reliable?
                </p>
                <a href="mailto:Kabir_1_6@icloud.com">
                  Start a conversation <span aria-hidden="true">↗</span>
                </a>
              </div>
            </div>

            <div className="education-card">
              <div className="education-main">
                <p className="eyebrow">Education / Expected May 2027</p>
                <h3>New York Institute of Technology</h3>
                <p>Bachelor&apos;s in Computer Science · Concentration in Artificial Intelligence</p>
              </div>
              <div className="coursework">
                <p>Relevant coursework</p>
                <ul>
                  {coursework.map((course) => <li key={course}>{course}</li>)}
                </ul>
              </div>
            </div>

            <div className="skill-groups">
              {skillGroups.map((group) => (
                <article key={group.title}>
                  <span>{group.number}</span>
                  <h3>{group.title}</h3>
                  <p>{group.items.join(" · ")}</p>
                </article>
              ))}
            </div>

            <div className="leadership-card">
              <div>
                <p className="eyebrow">Beyond the screen</p>
                <h3>Founder & President, NYIT Badminton Club</h3>
              </div>
              <p>
                Founded and lead a student organization, coordinating logistics, budgets,
                scheduling, procurement, and campus partnerships since September 2024.
              </p>
            </div>
          </section>

          <section className="contact-section" id="contact">
            <p className="eyebrow">Contact / New York</p>
            <h2>Have a system worth improving?</h2>
            <p className="contact-intro">
              I&apos;m interested in software engineering, automation, data, and AI opportunities
              where thoughtful technology can make a measurable difference.
            </p>
            <div className="contact-links">
              <a href="mailto:Kabir_1_6@icloud.com">
                <span>Email</span>
                <strong>Kabir_1_6@icloud.com</strong>
                <i aria-hidden="true">↗</i>
              </a>
              <a href="tel:+19175133731">
                <span>Phone</span>
                <strong>(917) 513-3731</strong>
                <i aria-hidden="true">↗</i>
              </a>
              <a href="/Kabir_Marwaha_Resume_2026.pdf" target="_blank" rel="noreferrer">
                <span>Resume</span>
                <strong>View PDF</strong>
                <i aria-hidden="true">↗</i>
              </a>
            </div>
          </section>
        </main>

        <footer className="site-footer">
          <a className="brand" href="#top" aria-label="Back to top">
            <span className="brand-mark">KM</span>
            <span>Kabir Marwaha</span>
          </a>
          <p>Built around useful work. © {new Date().getFullYear()}</p>
          <a href="#top">Back to top ↑</a>
        </footer>
      </div>
    </>
  );
}
