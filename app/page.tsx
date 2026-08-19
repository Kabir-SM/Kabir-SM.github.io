import Link from "next/link";
import ParticleText from "./ParticleText";
import { ContactModal, ContactTrigger } from "./ContactModal";
import { PortfolioInteractions } from "./PortfolioInteractions";

const experience = [
  {
    company: "Apple",
    role: "Product Zone Specialist",
    place: "Manhasset, NY",
    dates: "July 2026 - Present",
    copy:
      "Translate customer needs into clear product decisions through tailored conversations, hands-on demonstrations, and deep knowledge across Apple hardware, accessories, and services.",
    tags: ["Product knowledge", "Customer experience", "Collaboration"],
    highlights: [
      "Turn individual customer needs into clear product and service recommendations.",
      "Deliver hands-on demonstrations across hardware, accessories, and services.",
      "Coordinate with teammates to keep the product-zone experience responsive and useful.",
    ],
  },
  {
    company: "Goldfish Swim School / Boardman Bay Capital Management",
    role: "Data Analyst & Software Engineering Intern",
    place: "New Rochelle, NY",
    dates: "June 2026 - August 2026",
    copy:
      "Built production automations for aged accounts and absence reporting, connected IClassPro data to Excel, Gmail, and Podium, and launched a centralized reporting hub across three locations.",
    tags: ["Python", "Automation", "Reporting", "AI integration"],
    highlights: [
      "Connected IClassPro data with Excel, Gmail, and Podium workflows.",
      "Automated aged-account and absence-reporting processes across three locations.",
      "Created a centralized reporting surface for recurring operational decisions.",
    ],
  },
  {
    company: "All Scientific Technology Group, LLC",
    role: "Software Engineering Intern",
    place: "New Hyde Park, NY",
    dates: "July 2025 - December 2025",
    copy:
      "Integrated RFID hardware with internal software for real-time medical equipment tracking, improving inventory visibility and supporting deployments at major New York City healthcare facilities.",
    tags: ["RFID systems", "Systems integration", "Field deployment"],
    highlights: [
      "Integrated RFID readers with internal inventory software.",
      "Tested real-time equipment visibility across healthcare environments.",
      "Supported field deployments at major New York City healthcare facilities.",
    ],
  },
  {
    company: "New York Institute of Technology",
    role: "Software Engineering Project Lead",
    place: "Old Westbury, NY",
    dates: "April 2025 - July 2025",
    copy:
      "Led PolyDB, a JavaFX and JDBC application that unified PostgreSQL, MySQL, and Oracle workflows through one interface while eliminating more than 400 lines of duplicated connection logic.",
    tags: ["Java", "JavaFX", "JDBC", "SQL"],
    highlights: [
      "Led the design of one interface for PostgreSQL, MySQL, and Oracle workflows.",
      "Centralized connection logic and removed more than 400 duplicated lines.",
      "Implemented authentication, schema inspection, table rendering, and GUI-driven CRUD.",
    ],
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
    visual: "workflow",
    challenge: "Attendance and account follow-up moved through disconnected systems, creating repetitive work and inconsistent handoffs.",
    approach: "Designed a modular Python workflow that validates IClassPro exports, builds structured Excel reports, and prepares coordinated Gmail and Podium outreach.",
    features: ["Input validation and structured reporting", "Multi-location workflow support", "Email and messaging coordination", "Maintainable modular automation"],
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
    visual: "database",
    challenge: "Students needed different tools and repeated connection code to work across PostgreSQL, MySQL, and Oracle databases.",
    approach: "Built a JavaFX desktop application with a shared JDBC layer, authentication, schema browsing, dynamic tables, and GUI-driven CRUD operations.",
    features: ["Three database engines", "Centralized connection management", "Schema and table inspection", "Interactive CRUD workflows"],
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
    visual: "dashboard",
    challenge: "Recurring operational information was distributed across locations and difficult to translate into timely action.",
    approach: "Created a centralized reporting surface that organizes recurring metrics, exposes workflow bottlenecks, and provides a home for AI-assisted process improvements.",
    features: ["Centralized operational reporting", "Bottleneck visibility", "Multi-location context", "AI-ready improvement queue"],
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
    visual: "rfid",
    challenge: "Healthcare teams needed more reliable visibility into the location and lifecycle of medical equipment.",
    approach: "Connected RFID hardware with internal inventory software, tested real-time data flow, and supported deployment in active healthcare environments.",
    features: ["RFID reader integration", "Real-time asset visibility", "Inventory lifecycle data", "Field testing and deployment"],
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

function ProjectVisual({ visual }: { visual: (typeof projects)[number]["visual"] }) {
  if (visual === "workflow") {
    return (
      <div className="visual-system workflow-system" aria-hidden="true">
        <div className="flow-node"><span>01</span><strong>ICLASSPRO</strong></div>
        <i className="flow-link" />
        <div className="flow-node is-core"><span>02</span><strong>PYTHON</strong></div>
        <i className="flow-link" />
        <div className="flow-output">
          <span>EXCEL</span><span>GMAIL</span><span>PODIUM</span>
        </div>
        <p>AUTOMATED DATA ROUTE / 3 LOCATIONS</p>
      </div>
    );
  }

  if (visual === "database") {
    return (
      <div className="visual-system database-system" aria-hidden="true">
        <div className="database-sources">
          <span><i>PG</i>POSTGRES</span>
          <span><i>MY</i>MYSQL</span>
          <span><i>OR</i>ORACLE</span>
        </div>
        <div className="database-bus"><span /><span /><span /></div>
        <div className="database-console"><b>POLYDB</b><em>ONE INTERFACE / THREE ENGINES</em></div>
      </div>
    );
  }

  if (visual === "dashboard") {
    return (
      <div className="visual-system dashboard-system" aria-hidden="true">
        <div className="dash-header"><span>OPERATIONS / LIVE</span><i>SYNCED</i></div>
        <div className="dash-panels">
          <div className="dash-stat"><span>03</span><small>LOCATIONS</small></div>
          <div className="dash-bars"><i /><i /><i /><i /><i /><i /></div>
          <div className="dash-signal"><span>AI</span><b>INSIGHT QUEUE</b><em>12 READY</em></div>
        </div>
        <div className="dash-timeline"><i /><i /><i /><i /></div>
      </div>
    );
  }

  return (
    <div className="visual-system rfid-system" aria-hidden="true">
      <div className="rfid-reader"><span>RFID</span><b>LIVE READER</b><i /></div>
      <div className="asset-grid">
        {["A-17", "B-04", "C-12", "D-09", "E-21", "F-02"].map((asset, assetIndex) => (
          <span className={assetIndex === 2 || assetIndex === 4 ? "is-detected" : ""} key={asset}>{asset}</span>
        ))}
      </div>
      <p>ASSET POSITION / VERIFIED</p>
    </div>
  );
}

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
          <a className="brand" href="#top" aria-label="Kabir Marwaha, home" data-cursor="HOME">
            <span className="brand-mark">KM</span>
            <span>Kabir Marwaha</span>
          </a>
          <nav className="main-nav" aria-label="Primary navigation">
            <a href="#work" data-cursor="VIEW WORK">Work</a>
            <a href="#experience" data-cursor="VIEW ROLES">Experience</a>
            <a href="#about" data-cursor="ABOUT KABIR">About</a>
            <a href="#contact" data-cursor="CONTACT">Contact</a>
          </nav>
          <ContactTrigger className="header-cta">
            Let&apos;s talk <span aria-hidden="true">↗</span>
          </ContactTrigger>
        </header>

        <main id="main-content">
          <section className="hero" id="top">
            <div className="hero-copy">
              <div className="availability-pill">
                <span className="status-dot" aria-hidden="true" />
                Computer Science + AI / Open to opportunities
              </div>
              <p className="hero-kicker">Software engineering / automation / data</p>
              <h1 className="particle-heading hero-particle-heading">
                <ParticleText
                  text={"MANUAL WORK\nINTO MOMENTUM."}
                  particleSize={2}
                  density={4}
                  color="#f4f5ee"
                  highlightColor="#c9ff57"
                  scatter={180}
                  gatherDuration={1600}
                  stagger={420}
                  pointerRepel={44}
                  repelRadius={125}
                  idleDrift={0.75}
                  trigger="hover"
                  fontSize="clamp(3.25rem, 7.25vw, 8.3rem)"
                  fontWeight={800}
                  height="clamp(17rem, 31vw, 28rem)"
                  glow
                />
              </h1>
              <p className="hero-intro">
                I&apos;m Kabir, a computer science student and software engineer focused on
                automation, AI integration, and practical tools that make complex work feel
                simple.
              </p>
              <p className="hero-system-note">Building reliable software where automation, data, and AI meet real operational needs.</p>
              <div className="hero-actions">
                <a className="button button-primary" href="#work" data-cursor="EXPLORE">
                  Explore my work <span aria-hidden="true">↓</span>
                </a>
                <a
                  className="button button-secondary"
                  href="/Kabir_Marwaha_Resume_2026.pdf"
                  target="_blank"
                  rel="noreferrer"
                  data-cursor="OPEN PDF"
                >
                  View resume <span aria-hidden="true">↗</span>
                </a>
              </div>
              <nav className="hero-section-nav" aria-label="Jump to a portfolio section">
                <a href="#work" data-cursor="VIEW WORK">
                  <span>01</span>
                  <strong>Work</strong>
                  <small>Projects &amp; case studies</small>
                  <i aria-hidden="true">↓</i>
                </a>
                <a href="#experience" data-cursor="VIEW ROLES">
                  <span>02</span>
                  <strong>Experience</strong>
                  <small>Roles &amp; impact</small>
                  <i aria-hidden="true">↓</i>
                </a>
                <a href="#about" data-cursor="ABOUT KABIR">
                  <span>03</span>
                  <strong>About</strong>
                  <small>Skills &amp; background</small>
                  <i aria-hidden="true">↓</i>
                </a>
                <a href="#contact" data-cursor="CONTACT">
                  <span>04</span>
                  <strong>Contact</strong>
                  <small>Start a conversation</small>
                  <i aria-hidden="true">↓</i>
                </a>
              </nav>
            </div>

            <div className="badge-stage" aria-label="Kabir Marwaha profile card">
              <div className="badge-shadow" aria-hidden="true" />
              <div className="lanyard" aria-hidden="true">
                <span />
              </div>
              <article className="profile-badge">
                <div className="badge-topline">
                  <span>ACCESS PROFILE / 2026</span>
                  <span className="badge-live"><i /> ACTIVE</span>
                </div>
                <div className="badge-portrait">
                  {/* Static asset avoids an unnecessary runtime image service for this compact badge. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="badge-photo"
                    src="/kabir-marwaha-portrait.png"
                    alt="Portrait of Kabir Marwaha"
                    width="1254"
                    height="1254"
                  />
                  <span className="badge-photo-shade" aria-hidden="true" />
                  <span className="scan-line" aria-hidden="true" />
                  <span className="corner corner-one" aria-hidden="true" />
                  <span className="corner corner-two" aria-hidden="true" />
                  <span className="corner corner-three" aria-hidden="true" />
                  <span className="corner corner-four" aria-hidden="true" />
                  <span className="badge-photo-meta" aria-hidden="true">
                    <span>KM / NEW YORK</span>
                    <span>VERIFIED PROFILE</span>
                  </span>
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
                <h2 className="particle-heading section-particle-heading">
                  <ParticleText
                    text={"BUILT FOR\nTHE REAL WORLD."}
                    particleSize={1.7}
                    density={4}
                    color="#f4f5ee"
                    highlightColor="#70e1f1"
                    scatter={110}
                    gatherDuration={1350}
                    stagger={260}
                    pointerRepel={34}
                    repelRadius={100}
                    idleDrift={0.55}
                    trigger="hover"
                    fontSize="clamp(2.8rem, 5.8vw, 6rem)"
                    fontWeight={780}
                    height="clamp(10rem, 18vw, 15rem)"
                    glow
                  />
                </h2>
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
                  <div className="project-visual">
                    <ProjectVisual visual={project.visual} />
                    <span className="visual-label">{project.index} / KM</span>
                  </div>
                  <p className="project-kicker">{project.kicker}</p>
                  <h3>{project.title}</h3>
                  <p className="project-description">{project.description}</p>
                  <p className="project-impact-preview"><span>Impact</span>{project.impact}</p>
                  <ul className="tag-list" aria-label={`${project.title} technologies`}>
                    {project.tags.map((tag) => <li key={tag}>{tag}</li>)}
                  </ul>
                  <div className="project-card-action" aria-hidden="true">Open case study <span>↗</span></div>
                  <button
                    className="project-card-hit-area"
                    type="button"
                    aria-label={`Open ${project.title} case study`}
                    data-project-open={project.index}
                    data-cursor="VIEW CASE"
                  />
                </article>
              ))}
            </div>
          </section>

          <section className="section experience-section" id="experience">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Experience</p>
                <h2 className="particle-heading section-particle-heading wide-particle-heading">
                  <ParticleText
                    text={"PEOPLE / PRODUCTS\n/ SYSTEMS"}
                    particleSize={1.7}
                    density={4}
                    color="#f4f5ee"
                    highlightColor="#bda8ff"
                    scatter={105}
                    gatherDuration={1350}
                    stagger={240}
                    pointerRepel={32}
                    repelRadius={95}
                    idleDrift={0.5}
                    trigger="hover"
                    fontSize="clamp(2.55rem, 5.1vw, 5.6rem)"
                    fontWeight={760}
                    height="clamp(9rem, 16vw, 13.5rem)"
                    glow
                  />
                </h2>
              </div>
              <span className="section-count">04 roles / 2025-2026</span>
            </div>

            <div className="timeline">
              {experience.map((item, index) => (
                <details className="timeline-item" key={`${item.company}-${item.role}`}>
                  <summary className="timeline-summary" data-cursor="EXPAND ROLE">
                    <div className="timeline-index">0{index + 1}</div>
                    <div className="timeline-main">
                      <p className="timeline-company">{item.company}</p>
                      <h3>{item.role}</h3>
                      <p>{item.copy}</p>
                    </div>
                    <div className="timeline-meta">
                      <span>{item.dates}</span>
                      <span>{item.place}</span>
                      <i className="timeline-toggle" aria-hidden="true">+</i>
                    </div>
                  </summary>
                  <div className="timeline-expanded">
                    <div>
                      <p className="eyebrow">Selected contributions</p>
                      <ul>
                        {item.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
                      </ul>
                    </div>
                    <ul className="tag-list compact" aria-label={`${item.role} skills`}>
                      {item.tags.map((tag) => <li key={tag}>{tag}</li>)}
                    </ul>
                  </div>
                </details>
              ))}
            </div>

            <div className="earlier-experience">
              <p className="eyebrow">Earlier experience</p>
              <div>
                <span>Zara / Sales Associate</span>
                <span>November 2025 - January 2026</span>
              </div>
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
                <ContactTrigger className="conversation-trigger">
                  Start a conversation <span aria-hidden="true">↗</span>
                </ContactTrigger>
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

            <div className="achievement-grid">
              <article className="achievement-card achievement-card-featured">
                <div className="achievement-topline">
                  <p className="eyebrow">Campus leadership / September 2024 - Present</p>
                  <span>01</span>
                </div>
                <h3>Built NYIT Badminton from one tournament into a recognized team.</h3>
                <p className="achievement-copy">
                  As founder and president, I turned sustained student interest into a growing
                  campus program—organizing events, coordinating with Campus Recreation, building
                  the club&apos;s identity, and helping lead competition across Long Island.
                </p>
                <ul className="achievement-metrics" aria-label="NYIT Badminton achievements">
                  <li><strong>76</strong><span>participants at the first tournament</span></li>
                  <li><strong>3×</strong><span>weekly open-gym sessions by Spring 2026</span></li>
                  <li><strong>3–1</strong><span>scrimmage record against regional schools</span></li>
                  <li><strong>1st</strong><span>after winning the badminton tournament</span></li>
                </ul>
                <div className="achievement-footer">
                  <span>Recognized NYIT team beginning Fall 2026</span>
                  <a
                    href="https://files.nyit.edu/files/events/2026-CampusSlate-ManhattanGlobe-Commencement-Edition.pdf#page=21"
                    target="_blank"
                    rel="noreferrer"
                    data-cursor="READ FEATURE"
                  >
                    Read the Campus Slate feature <span aria-hidden="true">↗</span>
                  </a>
                </div>
              </article>

              <article className="achievement-card achievement-card-techlit">
                <div className="achievement-topline">
                  <p className="eyebrow">Community technology / April 2024</p>
                  <span>02</span>
                </div>
                <h3>Constructed five PCs for TechLit Africa.</h3>
                <p className="achievement-copy">
                  Built five personal computers from scratch for donation to people in need,
                  combining hands-on hardware assembly with careful wiring and thermal planning.
                </p>
                <ul className="achievement-details">
                  <li>Installed motherboards, CPUs, GPUs, RAM, power supplies, and cooling fans.</li>
                  <li>Routed internal power wiring and planned fan placement for effective airflow.</li>
                </ul>
                <div className="achievement-footer">
                  <span>Role / Constructor</span>
                  <span>Hardware with a human purpose</span>
                </div>
              </article>
            </div>
          </section>

          <section className="contact-section" id="contact">
            <p className="eyebrow">Contact / New York</p>
            <h2 className="particle-heading contact-particle-heading">
              <ParticleText
                text={"LET'S BUILD\nSOMETHING USEFUL."}
                particleSize={1.8}
                density={4}
                color="#f4f5ee"
                highlightColor="#c9ff57"
                scatter={125}
                gatherDuration={1450}
                stagger={300}
                pointerRepel={38}
                repelRadius={110}
                idleDrift={0.65}
                trigger="hover"
                fontSize="clamp(3rem, 7vw, 7.4rem)"
                fontWeight={790}
                height="clamp(13rem, 25vw, 22rem)"
                glow
              />
            </h2>
            <p className="contact-intro">
              I&apos;m interested in software engineering, automation, data, and AI opportunities
              where thoughtful technology can make a measurable difference.
            </p>
            <div className="contact-links">
              <a href="mailto:Kabir_1_6@icloud.com" data-cursor="EMAIL">
                <span>Email</span>
                <strong>Kabir_1_6@icloud.com</strong>
                <i aria-hidden="true">✉️</i>
              </a>
              <a href="tel:+19175133731" data-cursor="CALL">
                <span>Phone</span>
                <strong>(917) 513-3731</strong>
                <i aria-hidden="true">📞</i>
              </a>
              <a href="/Kabir_Marwaha_Resume_2026.pdf" target="_blank" rel="noreferrer" data-cursor="OPEN PDF">
                <span>Resume</span>
                <strong>View PDF</strong>
                <i aria-hidden="true">📄</i>
              </a>
              <a href="https://github.com/Kabir-SM" target="_blank" rel="noreferrer" data-cursor="GITHUB">
                <span>GitHub</span>
                <strong>Kabir-SM on GitHub</strong>
                <i aria-hidden="true">💻</i>
              </a>
              <a href="https://www.linkedin.com/in/kabir-marwaha-70ba2738b" target="_blank" rel="noreferrer" data-cursor="LINKEDIN">
                <span>LinkedIn</span>
                <strong>Kabir Marwaha on LinkedIn</strong>
                <i aria-hidden="true">💼</i>
              </a>
            </div>
          </section>
        </main>

        <footer className="site-footer">
          <a className="brand" href="#top" aria-label="Back to top" data-cursor="TOP">
            <span className="brand-mark">KM</span>
            <span>Kabir Marwaha</span>
          </a>
          <div className="footer-signature">
            <p>© 2026 Kabir Marwaha. Built with intention.</p>
            <nav className="footer-legal-links" aria-label="Legal information">
              <Link href="/privacy">Privacy Policy</Link>
              <Link href="/terms">Terms of Use</Link>
            </nav>
          </div>
          <a href="#top" data-cursor="TOP">Back to top ↑</a>
        </footer>
        <ContactModal />
        <PortfolioInteractions projects={projects} />
      </div>
    </>
  );
}
