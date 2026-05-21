/**
 * Template engine: takes structured section data and renders the proposal HTML
 * using the sacred LCSC template CSS (never modified).
 */

// The complete CSS from the LCSC proposal template (~960 lines)
// This must NEVER be modified — it defines the visual identity.
export const PROPOSAL_CSS = `  :root {
    --ink: #0a0a0a;
    --ink-soft: #2a2a2a;
    --ink-mute: #6b6b6b;
    --ink-faint: #a8a8a8;
    --paper: #fafaf7;
    --paper-tint: #f3f1ea;
    --line: #e2dfd6;
    --line-soft: #ecead0;
    --accent: #6366f1;
    --accent-deep: #4f46e5;
    --accent-soft: rgba(99, 102, 241, 0.08);
    --warn: #b45309;
    --good: #15803d;
    --serif: 'Noto Serif SC', 'Fraunces', 'Songti SC', serif;
    --sans: 'Noto Sans SC', -apple-system, BlinkMacSystemFont, sans-serif;
    --mono: 'JetBrains Mono', 'SF Mono', monospace;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }

  body {
    font-family: var(--sans);
    background: var(--paper);
    color: var(--ink);
    line-height: 1.75;
    font-size: 15px;
    font-weight: 400;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  .topbar {
    border-bottom: 1px solid var(--line);
    padding: 24px 0;
    background: var(--paper);
    position: sticky;
    top: 0;
    z-index: 100;
    backdrop-filter: blur(8px);
    background: rgba(250, 250, 247, 0.92);
  }

  .topbar-inner {
    max-width: 920px;
    margin: 0 auto;
    padding: 0 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
    letter-spacing: 0.04em;
  }

  .brand {
    font-family: var(--serif);
    font-weight: 500;
    color: var(--ink);
  }

  .brand .cross {
    color: var(--accent);
    margin: 0 10px;
    font-weight: 400;
  }

  .meta {
    color: var(--ink-mute);
    font-feature-settings: "tnum";
  }

  .container {
    max-width: 920px;
    margin: 0 auto;
    padding: 0 32px;
  }

  .hero {
    padding: 120px 0 100px;
    border-bottom: 1px solid var(--line);
  }

  .hero-eyebrow {
    font-size: 12px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 48px;
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .hero-eyebrow::before {
    content: '';
    width: 36px;
    height: 1px;
    background: var(--accent);
  }

  .hero h1 {
    font-family: var(--serif);
    font-weight: 700;
    font-size: clamp(40px, 5.5vw, 64px);
    line-height: 1.18;
    letter-spacing: -0.02em;
    color: var(--ink);
    margin-bottom: 48px;
  }

  .hero h1 .accent {
    color: var(--accent);
    font-style: italic;
    font-weight: 500;
  }

  .hero-lede {
    font-family: var(--serif);
    font-size: 19px;
    line-height: 1.8;
    color: var(--ink-soft);
    max-width: 680px;
    margin-bottom: 80px;
  }

  .hero-lede strong {
    color: var(--ink);
    font-weight: 700;
    background: linear-gradient(transparent 65%, var(--accent-soft) 65%);
    padding: 0 2px;
  }

  .stat-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    border-top: 1px solid var(--line);
    border-bottom: 1px solid var(--line);
    padding: 32px 0;
    gap: 24px;
  }

  .stat {
    border-left: 1px solid var(--line);
    padding-left: 20px;
  }

  .stat:first-child {
    border-left: none;
    padding-left: 0;
  }

  .stat-label {
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--ink-mute);
    margin-bottom: 12px;
  }

  .stat-value {
    font-family: var(--serif);
    font-size: 32px;
    font-weight: 700;
    color: var(--ink);
    line-height: 1.1;
    margin-bottom: 6px;
    font-feature-settings: "tnum";
  }

  .stat-note {
    font-size: 12px;
    color: var(--ink-mute);
    line-height: 1.5;
  }

  section.chapter {
    padding: 100px 0;
    border-bottom: 1px solid var(--line);
  }

  .chapter-num {
    font-family: var(--serif);
    font-style: italic;
    font-size: 14px;
    letter-spacing: 0.08em;
    color: var(--accent);
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .chapter-num::before {
    content: '';
    width: 24px;
    height: 1px;
    background: var(--accent);
  }

  h2 {
    font-family: var(--serif);
    font-weight: 700;
    font-size: clamp(32px, 4vw, 44px);
    line-height: 1.2;
    letter-spacing: -0.015em;
    color: var(--ink);
    margin-bottom: 56px;
  }

  h2 .quiet {
    color: var(--ink-faint);
    font-weight: 400;
  }

  h3 {
    font-family: var(--serif);
    font-weight: 700;
    font-size: 22px;
    line-height: 1.4;
    color: var(--ink);
    margin-bottom: 14px;
  }

  p {
    color: var(--ink-soft);
    margin-bottom: 18px;
    max-width: 720px;
  }

  p strong, .prose strong {
    color: var(--ink);
    font-weight: 600;
  }

  .key {
    border-bottom: 2px solid var(--accent);
    padding-bottom: 1px;
    color: var(--ink);
    font-weight: 500;
  }

  .profile-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0;
    margin-bottom: 56px;
    border: 1px solid var(--line);
  }

  .profile-card {
    padding: 36px 32px;
    border-right: 1px solid var(--line);
  }

  .profile-card:last-child {
    border-right: none;
  }

  .profile-card .big {
    font-family: var(--serif);
    font-size: 36px;
    font-weight: 700;
    color: var(--ink);
    line-height: 1.1;
    margin-bottom: 12px;
    letter-spacing: -0.01em;
  }

  .profile-card .label {
    font-size: 13px;
    color: var(--ink-mute);
    line-height: 1.6;
  }

  .definition {
    border-left: 2px solid var(--accent);
    padding: 24px 0 24px 28px;
    margin-top: 32px;
    background: var(--accent-soft);
    padding-right: 28px;
  }

  .definition p {
    margin-bottom: 0;
    font-size: 15px;
    line-height: 1.85;
  }

  .definition p strong {
    color: var(--ink);
  }

  .diagnosis-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 64px;
    margin-top: 48px;
  }

  .diagnosis-col h4 {
    font-family: var(--serif);
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 28px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--ink);
  }

  .diagnosis-col.minus h4 { color: var(--ink); }
  .diagnosis-col.plus h4 { color: var(--ink); border-bottom-color: var(--accent); }

  .diagnosis-item {
    margin-bottom: 28px;
    padding-left: 32px;
    position: relative;
  }

  .diagnosis-item .num {
    position: absolute;
    left: 0;
    top: 2px;
    font-family: var(--serif);
    font-style: italic;
    font-size: 14px;
    color: var(--ink-faint);
    font-feature-settings: "tnum";
  }

  .diagnosis-item .title {
    font-weight: 700;
    color: var(--ink);
    font-size: 15px;
    margin-bottom: 6px;
    line-height: 1.5;
  }

  .diagnosis-item .desc {
    font-size: 14px;
    color: var(--ink-mute);
    line-height: 1.7;
  }

  .pullquote {
    margin-top: 64px;
    padding: 32px 0;
    border-top: 1px solid var(--line);
    border-bottom: 1px solid var(--line);
    font-family: var(--serif);
    font-size: 19px;
    line-height: 1.75;
    color: var(--ink);
    font-style: italic;
    font-weight: 500;
  }

  .pullquote strong {
    font-style: normal;
    background: linear-gradient(transparent 65%, var(--accent-soft) 65%);
    padding: 0 2px;
    font-weight: 700;
  }

  .compare-intro {
    margin-bottom: 36px;
  }

  .compare-wrap {
    overflow-x: auto;
    margin: 0 -2px;
  }

  .compare {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }

  .compare th, .compare td {
    text-align: left;
    padding: 16px 14px;
    border-bottom: 1px solid var(--line);
    vertical-align: top;
    line-height: 1.5;
  }

  .compare thead th {
    font-family: var(--serif);
    font-weight: 700;
    font-size: 13px;
    color: var(--ink);
    border-bottom: 1.5px solid var(--ink);
    background: var(--paper-tint);
  }

  .compare thead th.us {
    color: var(--accent);
    background: var(--accent-soft);
  }

  .compare tbody td.us {
    background: var(--accent-soft);
    font-weight: 500;
  }

  .compare td.dim {
    font-family: var(--serif);
    font-weight: 500;
    color: var(--ink);
    width: 26%;
  }

  .badge {
    display: inline-block;
    font-family: var(--mono);
    font-size: 11px;
    font-weight: 500;
    padding: 2px 6px;
    border-radius: 3px;
    margin-right: 6px;
    letter-spacing: 0.02em;
  }

  .b-good { background: rgba(21, 128, 61, 0.1); color: var(--good); }
  .b-warn { background: rgba(180, 83, 9, 0.1); color: var(--warn); }
  .b-soso { background: var(--line); color: var(--ink-mute); }
  .b-none { background: rgba(0,0,0,0.04); color: var(--ink-faint); }
  .b-star { background: var(--accent); color: white; }

  .compare-conclusion {
    margin-top: 36px;
    padding: 28px 32px;
    background: var(--paper-tint);
    border-left: 3px solid var(--accent);
    font-family: var(--serif);
    font-size: 16px;
    line-height: 1.8;
  }

  .compare-conclusion strong {
    color: var(--ink);
    font-weight: 700;
  }

  .service {
    padding: 48px 0;
    border-top: 1px solid var(--line);
  }

  .service:first-of-type {
    border-top: none;
    padding-top: 0;
  }

  .service-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 8px;
    flex-wrap: wrap;
    gap: 16px;
  }

  .service-tag {
    font-family: var(--serif);
    font-style: italic;
    font-size: 13px;
    color: var(--accent);
    margin-bottom: 12px;
  }

  .service h3 {
    margin-bottom: 4px;
  }

  .service-tagline {
    font-family: var(--serif);
    font-size: 17px;
    color: var(--ink-soft);
    margin-bottom: 24px;
    font-style: italic;
  }

  .service-price {
    font-family: var(--serif);
    font-weight: 700;
    font-size: 15px;
    color: var(--ink);
    padding: 6px 14px;
    border: 1px solid var(--ink);
    border-radius: 100px;
    white-space: nowrap;
  }

  .service-price.month {
    background: var(--ink);
    color: var(--paper);
  }

  .service-desc {
    margin-bottom: 20px;
    max-width: 800px;
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 24px;
  }

  .chip {
    font-size: 12px;
    padding: 5px 12px;
    background: var(--accent-soft);
    color: var(--accent-deep);
    border-radius: 100px;
    font-weight: 500;
    letter-spacing: 0.02em;
  }

  .pricing {
    width: 100%;
    border-collapse: collapse;
    margin-top: 32px;
  }

  .pricing th, .pricing td {
    text-align: left;
    padding: 24px 20px;
    border-bottom: 1px solid var(--line);
    vertical-align: top;
  }

  .pricing thead th {
    font-family: var(--serif);
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ink-mute);
    border-bottom: 1.5px solid var(--ink);
    background: transparent;
  }

  .pricing .module-name {
    font-family: var(--serif);
    font-weight: 700;
    font-size: 16px;
    color: var(--ink);
    margin-bottom: 4px;
  }

  .pricing .module-sub {
    font-size: 13px;
    color: var(--ink-mute);
  }

  .pricing .price-cell {
    font-family: var(--serif);
    font-weight: 700;
    font-size: 18px;
    color: var(--accent);
    white-space: nowrap;
  }

  .pricing .price-sub {
    display: block;
    font-family: var(--sans);
    font-weight: 400;
    font-size: 12px;
    color: var(--ink-mute);
    margin-top: 4px;
  }

  .pricing .note-cell {
    font-size: 13px;
    color: var(--ink-soft);
    line-height: 1.7;
  }

  .outcome-intro {
    margin-bottom: 40px;
  }

  .outcome-table {
    width: 100%;
    border-collapse: collapse;
  }

  .outcome-table th, .outcome-table td {
    text-align: left;
    padding: 24px 18px;
    vertical-align: top;
  }

  .outcome-table thead th {
    font-family: var(--serif);
    font-weight: 500;
    font-style: italic;
    font-size: 13px;
    letter-spacing: 0.06em;
    color: var(--ink-mute);
    border-bottom: 1px solid var(--ink);
  }

  .outcome-table tbody tr {
    border-bottom: 1px solid var(--line);
  }

  .outcome-table .timeline {
    font-family: var(--serif);
    font-weight: 700;
    font-size: 17px;
    color: var(--ink);
    width: 18%;
  }

  .outcome-table .metric {
    font-family: var(--serif);
    font-size: 16px;
    color: var(--accent);
    font-weight: 500;
  }

  .outcome-table .metric .small {
    display: block;
    font-family: var(--sans);
    font-size: 12px;
    color: var(--ink-mute);
    font-weight: 400;
    margin-top: 4px;
  }

  .outcome-notes {
    margin-top: 36px;
  }

  .outcome-notes ul {
    list-style: none;
    margin-bottom: 28px;
  }

  .outcome-notes li {
    position: relative;
    padding-left: 24px;
    margin-bottom: 12px;
    font-size: 14px;
    color: var(--ink-soft);
    line-height: 1.75;
    max-width: 740px;
  }

  .outcome-notes li::before {
    content: '—';
    position: absolute;
    left: 0;
    color: var(--accent);
  }

  .outcome-promise {
    padding: 24px 28px;
    border: 1px solid var(--accent);
    background: var(--accent-soft);
    border-radius: 4px;
    font-family: var(--serif);
    font-size: 15px;
    line-height: 1.8;
    color: var(--ink);
  }

  .outcome-promise strong {
    color: var(--accent-deep);
    font-weight: 700;
  }

  .timeline-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0;
    margin-top: 48px;
    border-top: 1px solid var(--ink);
    position: relative;
  }

  .timeline-grid::before {
    content: '';
    position: absolute;
    top: -5px;
    left: 0;
    width: 100%;
    height: 9px;
    background-image: radial-gradient(circle, var(--ink) 2px, transparent 2px);
    background-size: 25% 9px;
    background-position: 0 center;
    background-repeat: no-repeat;
    background-position-x: 0, 33.33%, 66.66%, 100%;
  }

  .phase {
    padding: 28px 20px 28px 0;
    border-right: 1px solid var(--line);
    position: relative;
  }

  .phase:last-child { border-right: none; }
  .phase:not(:first-child) { padding-left: 24px; }

  .phase-num {
    font-family: var(--serif);
    font-style: italic;
    font-size: 13px;
    color: var(--accent);
    margin-bottom: 8px;
  }

  .phase-time {
    font-family: var(--serif);
    font-weight: 700;
    font-size: 17px;
    color: var(--ink);
    margin-bottom: 16px;
    letter-spacing: -0.01em;
  }

  .phase-title {
    font-weight: 700;
    font-size: 14px;
    color: var(--ink);
    margin-bottom: 12px;
    line-height: 1.5;
  }

  .phase-desc {
    font-size: 13px;
    color: var(--ink-mute);
    line-height: 1.7;
  }

  .upsell-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0;
    margin-top: 48px;
    border: 1px solid var(--line);
  }

  .upsell-card {
    padding: 36px 32px;
    border-right: 1px solid var(--line);
    border-bottom: 1px solid var(--line);
    background: var(--paper);
  }

  .upsell-card:nth-child(2n) { border-right: none; }
  .upsell-card:nth-last-child(-n+2) { border-bottom: none; }

  .upsell-icon {
    font-family: var(--serif);
    font-style: italic;
    font-size: 13px;
    color: var(--accent);
    margin-bottom: 14px;
    letter-spacing: 0.04em;
  }

  .upsell-card h4 {
    font-family: var(--serif);
    font-weight: 700;
    font-size: 19px;
    color: var(--ink);
    margin-bottom: 12px;
    line-height: 1.4;
  }

  .upsell-formula {
    font-family: var(--mono);
    font-size: 12px;
    color: var(--ink-mute);
    margin-bottom: 16px;
    line-height: 1.6;
    padding: 8px 12px;
    background: var(--paper-tint);
    border-left: 2px solid var(--accent);
  }

  .upsell-card p {
    font-size: 14px;
    line-height: 1.75;
    margin-bottom: 0;
    color: var(--ink-soft);
  }

  .upsell-coda {
    margin-top: 36px;
    font-family: var(--serif);
    font-style: italic;
    font-size: 15px;
    color: var(--ink-mute);
    text-align: center;
  }

  .cta {
    padding: 140px 0 100px;
    text-align: center;
    background: var(--ink);
    color: var(--paper);
    margin-top: -1px;
  }

  .cta h2 {
    color: var(--paper);
    margin-bottom: 40px;
    font-size: clamp(40px, 5vw, 56px);
  }

  .cta h2 .accent {
    color: var(--accent);
    font-style: italic;
    font-weight: 500;
  }

  .cta-text {
    font-family: var(--serif);
    font-size: 18px;
    line-height: 1.8;
    color: rgba(250, 250, 247, 0.7);
    max-width: 580px;
    margin: 0 auto 56px;
  }

  .cta-text strong {
    color: var(--paper);
    font-weight: 700;
  }

  .cta-btn {
    display: inline-block;
    padding: 18px 44px;
    background: var(--accent);
    color: white;
    text-decoration: none;
    font-family: var(--serif);
    font-weight: 700;
    font-size: 16px;
    letter-spacing: 0.04em;
    border-radius: 4px;
    transition: all 0.2s ease;
  }

  .cta-btn:hover {
    background: var(--accent-deep);
    transform: translateY(-2px);
  }

  .cta-contact {
    margin-top: 40px;
    font-family: var(--mono);
    font-size: 13px;
    color: rgba(250, 250, 247, 0.5);
    letter-spacing: 0.04em;
  }

  .footer {
    background: var(--ink);
    color: rgba(250, 250, 247, 0.4);
    padding: 32px 0;
    font-size: 12px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .footer-inner {
    max-width: 920px;
    margin: 0 auto;
    padding: 0 32px;
    display: flex;
    justify-content: space-between;
    border-top: 1px solid rgba(250, 250, 247, 0.1);
    padding-top: 32px;
  }

  /* ─── Tablet ─── */
  @media (max-width: 900px) {
    .stat-row { grid-template-columns: repeat(2, 1fr); }
    .upsell-grid { grid-template-columns: repeat(2, 1fr); }
    .pricing th, .pricing td { padding: 16px 12px; }
    .outcome-table th, .outcome-table td { padding: 14px 10px; font-size: 13px; }
  }

  /* ─── Mobile ─── */
  @media (max-width: 720px) {
    /* Grids → single column */
    .stat-row, .profile-grid, .diagnosis-grid, .timeline-grid, .upsell-grid {
      grid-template-columns: 1fr;
    }
    .stat, .profile-card, .phase, .upsell-card {
      border-right: none !important;
      border-left: none !important;
      border-bottom: 1px solid var(--line);
      padding-left: 0 !important;
    }
    .stat:last-child, .profile-card:last-child, .upsell-card:last-child {
      border-bottom: none;
    }

    /* Spacing */
    section.chapter, .hero { padding: 60px 0; }
    .container { padding: 0 20px; }
    .topbar-inner { padding: 0 20px; font-size: 11px; }

    /* Hero */
    .hero h1 { font-size: clamp(28px, 8vw, 40px); margin-bottom: 32px; }
    .hero-lede { font-size: 16px; line-height: 1.7; margin-bottom: 48px; }

    /* Chapter headings */
    h2 { font-size: clamp(26px, 6vw, 36px); margin-bottom: 36px; }
    h3 { font-size: 19px; }

    /* Diagnosis */
    .diagnosis-grid { gap: 40px; }

    /* Competitor table — horizontal scroll */
    .compare-wrap { font-size: 12px; -webkit-overflow-scrolling: touch; }
    .compare th, .compare td { padding: 10px 8px; min-width: 100px; }
    .compare td.dim { width: auto; min-width: 90px; }

    /* Service cards */
    .service-header { flex-direction: column; gap: 8px; }
    .service-price { align-self: flex-start; }
    .service { padding: 36px 0; }

    /* Pricing table — card layout */
    .pricing thead { display: none; }
    .pricing tbody tr {
      display: block;
      padding: 20px 0;
      border-bottom: 1px solid var(--line);
    }
    .pricing tbody td {
      display: block;
      padding: 4px 0;
      border-bottom: none;
    }
    .pricing .module-name { font-size: 17px; font-weight: 700; }
    .pricing .price-cell { font-size: 20px; margin-top: 8px; }
    .pricing .note-cell { font-size: 13px; margin-top: 4px; }

    /* Outcome table — horizontal scroll */
    .outcome-table { display: block; overflow-x: auto; -webkit-overflow-scrolling: touch; }
    .outcome-table th, .outcome-table td { padding: 10px 8px; font-size: 12px; min-width: 90px; }
    .outcome-table .timeline { font-size: 13px; }
    .outcome-table .metric { font-size: 14px; }

    /* Timeline */
    .timeline-grid::before { display: none; }

    /* CTA */
    .cta { padding: 80px 0 60px; }
    .cta h2 { font-size: clamp(28px, 8vw, 40px); }
    .cta-text { font-size: 16px; margin-bottom: 40px; }
    .cta-btn { padding: 14px 32px; font-size: 15px; }

    /* Footer */
    .footer-inner { flex-direction: column; gap: 12px; text-align: center; }

    /* Pullquote */
    .pullquote { font-size: 16px; padding: 20px 16px; }

    /* Definition box */
    .definition { padding: 20px 16px; font-size: 15px; }
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .hero h1, .hero-lede, .stat-row {
    animation: fadeUp 0.9s ease-out backwards;
  }

  .hero-eyebrow { animation: fadeUp 0.6s ease-out backwards; }
  .hero h1 { animation-delay: 0.15s; }
  .hero-lede { animation-delay: 0.35s; }
  .stat-row { animation-delay: 0.55s; }

  @media print {
    .topbar { position: static; }
    section.chapter { page-break-inside: avoid; padding: 40px 0; }
    .cta { background: white; color: black; }
    .cta h2, .cta-text strong { color: black; }
  }

  /* ─── Visual enhancements ─── */

  /* Severity / leverage dot indicators */
  .severity-dots { color: var(--warn); font-size: 10px; letter-spacing: 2px; margin-left: 8px; }
  .leverage-dots { color: var(--good); font-size: 10px; letter-spacing: 2px; margin-left: 8px; }

  /* Competitor score bars */
  .score-bar {
    display: inline-block; height: 4px; border-radius: 2px;
    background: var(--accent-soft); margin-left: 6px; vertical-align: middle;
    transition: width 0.6s ease;
  }
  td.us .score-bar, .score-bar.client-bar { background: var(--accent); opacity: 0.3; }

  /* Outcome trend icons */
  .trend-icon { display: inline-block; width: 16px; height: 16px; margin-right: 4px; vertical-align: -2px; }
  .trend-icon.up { color: var(--good); }
  .trend-icon.big-up { color: var(--good); }
  .trend-icon.flat { color: var(--ink-mute); }

  /* Timeline deliverable chips */
  .phase-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
  .phase-chip {
    font-size: 11px; padding: 2px 10px; border-radius: 20px;
    background: var(--accent-soft); color: var(--accent-deep);
    font-weight: 500;
  }

  /* Service icons */
  .service-icon {
    display: inline-block; width: 18px; height: 18px;
    vertical-align: -3px; margin-right: 6px; color: var(--accent);
  }

  /* Chapter entrance animation */
  section.chapter {
    opacity: 0; transform: translateY(24px);
    animation: chapterIn 0.6s ease forwards;
  }
  section.chapter:nth-child(2) { animation-delay: 0.1s; }
  section.chapter:nth-child(3) { animation-delay: 0.2s; }
  section.chapter:nth-child(4) { animation-delay: 0.3s; }
  section.chapter:nth-child(5) { animation-delay: 0.4s; }
  section.chapter:nth-child(6) { animation-delay: 0.5s; }
  section.chapter:nth-child(7) { animation-delay: 0.6s; }
  section.chapter:nth-child(8) { animation-delay: 0.7s; }
  section.chapter:nth-child(9) { animation-delay: 0.8s; }
  section.chapter:nth-child(10) { animation-delay: 0.9s; }

  @keyframes chapterIn {
    to { opacity: 1; transform: translateY(0); }
  }

  /* Card hover micro-interactions */
  .profile-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
  .profile-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
  .upsell-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
  .upsell-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.06); }`;

const GOOGLE_FONTS_LINK = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;700;900&family=Noto+Sans+SC:wght@300;400;500;700&family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,700;9..144,900&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">`;

// ─── Type definitions for section data ────────────────────────────────

export interface HeroData {
  eyebrow: string;
  titleHtml: string; // Can contain <br> and <span class="accent">
  lede: string; // Can contain <strong>
  stats: Array<{ label: string; value: string; note: string }>;
}

export interface ProfileData {
  cards: Array<{ big: string; label: string }>;
  definition: string; // HTML content for the definition box
}

export interface DiagnosisData {
  intro: string;
  gaps: Array<{ title: string; desc: string; severity?: number }>;
  strengths: Array<{ title: string; desc: string; leverage?: number }>;
  pullquote: string; // HTML content
}

export interface CompetitorData {
  intro: string;
  clientName: string;
  competitors: string[]; // Max 3
  dimensions: Array<{
    label: string;
    clientCell: { badge: string; badgeClass: string; text: string; score?: number };
    competitorCells: Array<{ badge: string; badgeClass: string; text: string; score?: number }>;
  }>;
  conclusion: string; // HTML
}

export interface ServiceItem {
  tag: string;
  title: string;
  tagline: string;
  price: string;
  priceIsMonthly?: boolean;
  desc: string;
  chips: string[];
  iconKey?: string;
}

export interface ServiceData {
  sectionTitle?: string;
  sectionTitleQuiet?: string;
  services: ServiceItem[];
}

export interface PricingRow {
  moduleName: string;
  moduleSub: string;
  price: string;
  priceSub: string;
  note: string;
}

export interface PricingData {
  intro: string;
  rows: PricingRow[];
  pullquote: string;
}

export interface OutcomeRow {
  timeline: string;
  metrics: Array<{ value: string; note: string; trend?: "up" | "big_up" | "flat" }>;
}

export interface OutcomeData {
  intro: string;
  headers: string[];
  rows: OutcomeRow[];
  notes: string[];
  promise: string;
}

export interface TimelinePhase {
  num: string;
  time: string;
  title: string;
  desc: string;
  deliverables?: string[];
}

export interface TimelineData {
  phases: TimelinePhase[];
}

export interface UpsellCard {
  icon: string;
  title: string;
  formula: string;
  desc: string;
}

export interface UpsellData {
  intro: string;
  cards: UpsellCard[];
  coda: string;
}

export interface CtaData {
  titleHtml: string;
  text: string;
  buttonText: string;
  email: string;
  contact: string;
}

export interface ProposalSections {
  clientName: string;
  date: string; // e.g. "2026.05"
  hero?: HeroData;
  profile?: ProfileData;
  diagnosis?: DiagnosisData;
  competitor?: CompetitorData;
  service?: ServiceData;
  pricing?: PricingData;
  outcome?: OutcomeData;
  timeline?: TimelineData;
  upsell?: UpsellData;
  cta?: CtaData;
}

// ─── Rendering functions ──────────────────────────────────────────────

function esc(s: string | undefined | null): string {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderTopbar(clientName: string, date: string): string {
  return `<header class="topbar">
  <div class="topbar-inner">
    <div class="brand">Sitesfy <span class="cross">×</span> ${esc(clientName)}</div>
    <div class="meta">合作提案 · 保密文件 · ${esc(date)}</div>
  </div>
</header>`;
}

function renderHero(data: HeroData): string {
  const statsHtml = (data.stats ?? [])
    .map(
      (s) => `      <div class="stat">
        <div class="stat-label">${esc(s.label)}</div>
        <div class="stat-value">${esc(s.value)}</div>
        <div class="stat-note">${esc(s.note)}</div>
      </div>`
    )
    .join("\n");

  return `<section class="hero">
  <div class="container">
    <div class="hero-eyebrow">${esc(data.eyebrow)}</div>
    <h1>${data.titleHtml ?? ""}</h1>
    <p class="hero-lede">${data.lede ?? ""}</p>
    <div class="stat-row">
${statsHtml}
    </div>
  </div>
</section>`;
}

function renderProfile(data: ProfileData): string {
  const cardsHtml = (data.cards ?? [])
    .map(
      (c) => `      <div class="profile-card">
        <div class="big">${esc(c.big)}</div>
        <div class="label">${c.label ?? ""}</div>
      </div>`
    )
    .join("\n");

  return `<section class="chapter">
  <div class="container">
    <div class="chapter-num">01 — 公司画像</div>
    <h2>{{CLIENT_NAME}} <span class="quiet">是谁</span></h2>
    <div class="profile-grid">
${cardsHtml}
    </div>
    <div class="definition">
      <p>${data.definition ?? ""}</p>
    </div>
  </div>
</section>`;
}

function renderDiagnosis(data: DiagnosisData): string {
  const renderDots = (count: number | undefined, className: string) => {
    if (count == null || count < 1) return "";
    const filled = Math.min(Math.max(count, 1), 5);
    const dots = "●".repeat(filled) + "○".repeat(5 - filled);
    return ` <span class="${className}">${dots}</span>`;
  };

  const gapsHtml = (data.gaps ?? [])
    .map(
      (g, i) => `        <div class="diagnosis-item">
          <span class="num">${String(i + 1).padStart(2, "0")}</span>
          <div class="title">${esc(g.title)}${renderDots(g.severity, "severity-dots")}</div>
          <div class="desc">${esc(g.desc)}</div>
        </div>`
    )
    .join("\n");

  const strengthsHtml = (data.strengths ?? [])
    .map(
      (s, i) => `        <div class="diagnosis-item">
          <span class="num">${String(i + 1).padStart(2, "0")}</span>
          <div class="title">${esc(s.title)}${renderDots(s.leverage, "leverage-dots")}</div>
          <div class="desc">${esc(s.desc)}</div>
        </div>`
    )
    .join("\n");

  return `<section class="chapter">
  <div class="container">
    <div class="chapter-num">02 — 机会与诊断</div>
    <h2>增量<span class="quiet">在哪里</span></h2>
    <p>${esc(data.intro)}</p>
    <div class="diagnosis-grid">
      <div class="diagnosis-col minus">
        <h4>待解决的差距</h4>
${gapsHtml}
      </div>
      <div class="diagnosis-col plus">
        <h4>你已具备的牌</h4>
${strengthsHtml}
      </div>
    </div>
    <div class="pullquote">${data.pullquote ?? ""}</div>
  </div>
</section>`;
}

// ─── Normalizers: convert old AI-generated formats to template interfaces ────

function normalizeHero(raw: Record<string, unknown>): HeroData {
  // Already correct format?
  if (raw.titleHtml) return raw as unknown as HeroData;
  // Old format: headlineLine1/2/3Accent, proposition, stats without note
  const l1 = (raw.headlineLine1 as string) ?? "";
  const l2 = (raw.headlineLine2 as string) ?? "";
  const l3 = (raw.headlineLine3Accent as string) ?? "";
  const titleHtml = `${l1}<br>${l2}<br><span class="accent">${l3}</span>?`;
  const stats = ((raw.stats ?? []) as Array<Record<string, unknown>>).map((s) => ({
    value: (s.value as string) ?? "",
    label: (s.label as string) ?? "",
    note: (s.note as string) ?? "",
  }));
  return {
    eyebrow: (raw.eyebrow as string) ?? "",
    titleHtml,
    lede: (raw.lede as string) ?? (raw.proposition as string) ?? "",
    stats,
  };
}

function normalizeProfile(raw: Record<string, unknown>): ProfileData {
  if (raw.cards && Array.isArray(raw.cards) && (raw.cards as Array<Record<string, unknown>>).length > 0 && (raw.cards as Array<Record<string, unknown>>)[0].big) {
    return raw as unknown as ProfileData;
  }
  // Old format: profileCards[{value,label}], definitionHtml
  const cards = ((raw.profileCards ?? raw.cards ?? []) as Array<Record<string, unknown>>).map((c) => ({
    big: (c.big as string) ?? (c.value as string) ?? "",
    label: (c.label as string) ?? "",
  }));
  return {
    cards,
    definition: (raw.definition as string) ?? (raw.definitionHtml as string) ?? "",
  };
}

function normalizeDiagnosis(raw: Record<string, unknown>): DiagnosisData {
  const gaps = ((raw.gaps ?? []) as Array<Record<string, unknown>>).map((g) => ({
    title: (g.title as string) ?? "",
    desc: (g.desc as string) ?? (g.description as string) ?? "",
    severity: typeof g.severity === "number" ? g.severity : undefined,
  }));
  const strengths = ((raw.strengths ?? []) as Array<Record<string, unknown>>).map((s) => ({
    title: (s.title as string) ?? "",
    desc: (s.desc as string) ?? (s.description as string) ?? "",
    leverage: typeof s.leverage === "number" ? s.leverage : undefined,
  }));
  return {
    intro: (raw.intro as string) ?? "",
    gaps,
    strengths,
    pullquote: (raw.pullquote as string) ?? (raw.hookQuote as string) ?? "",
  };
}

/** Normalize AI-generated competitor data (old format) to CompetitorData */
function normalizeCompetitor(raw: Record<string, unknown>, clientName: string): CompetitorData {
  const r = raw as Record<string, unknown>;
  // Already in correct format?
  const dims = (r.dimensions ?? []) as Array<Record<string, unknown>>;
  if (dims.length > 0 && dims[0].clientCell) {
    // Ensure score fields are carried through
    const normalized = { ...r, clientName: (r.clientName as string) ?? clientName } as unknown as CompetitorData;
    return normalized;
  }

  // Old format: { competitors, dimensions: [{ name, clientRating, clientNote, competitorRatings }], summary }
  const ratingMap: Record<string, { badge: string; badgeClass: string }> = {
    good: { badge: "✓", badgeClass: "b-good" },
    warn: { badge: "⚠", badgeClass: "b-warn" },
    soso: { badge: "△", badgeClass: "b-soso" },
  };

  const toBadge = (rating: string) => ratingMap[rating] ?? ratingMap.soso;

  return {
    intro: (r.intro as string) ?? "",
    clientName: (r.clientName as string) ?? clientName,
    competitors: (r.competitors ?? []) as string[],
    dimensions: dims.map((dim) => {
      const cr = (dim.clientRating as string) ?? "soso";
      const crBadge = toBadge(cr);
      const compRatings = (dim.competitorRatings ?? []) as Array<Record<string, unknown>>;
      return {
        label: (dim.label as string) ?? (dim.name as string) ?? "",
        clientCell: { badge: crBadge.badge, badgeClass: crBadge.badgeClass, text: (dim.clientNote as string) ?? "", score: typeof dim.clientScore === "number" ? (dim.clientScore as number) : undefined },
        competitorCells: compRatings.map((comp) => {
          const b = toBadge((comp.rating as string) ?? "soso");
          return { badge: b.badge, badgeClass: b.badgeClass, text: (comp.note as string) ?? "", score: typeof comp.score === "number" ? (comp.score as number) : undefined };
        }),
      };
    }),
    conclusion: (r.conclusion as string) ?? (r.summary as string) ?? "",
  };
}

function renderCompetitor(data: CompetitorData): string {
  const renderScoreBar = (score: number | undefined, isClient?: boolean) => {
    if (score == null) return "";
    const s = Math.min(Math.max(score, 0), 100);
    const cls = isClient ? "score-bar client-bar" : "score-bar";
    return `<span class="${cls}" style="width:${s}%"></span>`;
  };

  const headerCells = [
    `<th></th>`,
    `<th class="us">${esc(data.clientName)}</th>`,
    ...(data.competitors ?? []).map((c) => `<th>${esc(c)}</th>`),
  ].join("\n            ");

  const bodyRows = (data.dimensions ?? [])
    .map((dim) => {
      const cells = [
        `<td class="dim">${esc(dim.label)}</td>`,
        `<td class="us"><span class="badge ${dim.clientCell?.badgeClass ?? ""}">${dim.clientCell?.badge ?? ""}</span>${esc(dim.clientCell?.text)}${renderScoreBar(dim.clientCell?.score, true)}</td>`,
        ...(dim.competitorCells ?? []).map(
          (cc) =>
            `<td><span class="badge ${cc.badgeClass ?? ""}">${cc.badge ?? ""}</span>${esc(cc.text)}${renderScoreBar(cc.score)}</td>`
        ),
      ];
      return `          <tr>\n            ${cells.join("\n            ")}\n          </tr>`;
    })
    .join("\n");

  return `<section class="chapter">
  <div class="container">
    <div class="chapter-num">02.5 — 竞品对标</div>
    <h2>与头部竞品的<span class="quiet">能力差距</span></h2>
    <p class="compare-intro">${esc(data.intro)}</p>
    <div class="compare-wrap">
      <table class="compare">
        <thead>
          <tr>
            ${headerCells}
          </tr>
        </thead>
        <tbody>
${bodyRows}
        </tbody>
      </table>
    </div>
    <div class="compare-conclusion">${data.conclusion ?? ""}</div>
  </div>
</section>`;
}

function normalizeService(raw: Record<string, unknown>): ServiceData {
  const services = ((raw.services ?? []) as Array<Record<string, unknown>>).map((s) => ({
    tag: (s.tag as string) ?? (s.badge as string) ?? "",
    title: (s.title as string) ?? "",
    tagline: (s.tagline as string) ?? "",
    price: (s.price as string) ?? "",
    priceIsMonthly: (s.priceIsMonthly as boolean) ?? false,
    desc: (s.desc as string) ?? [s.painPoint, s.bridgeSentence].filter(Boolean).join(" ") ?? "",
    chips: (s.chips ?? []) as string[],
    iconKey: (s.iconKey as string) ?? undefined,
  }));
  return {
    sectionTitle: (raw.sectionTitle as string) ?? undefined,
    sectionTitleQuiet: (raw.sectionTitleQuiet as string) ?? undefined,
    services,
  };
}

function normalizePricing(raw: Record<string, unknown>): PricingData {
  const rows = ((raw.rows ?? raw.pricingRows ?? []) as Array<Record<string, unknown>>).map((r) => ({
    moduleName: (r.moduleName as string) ?? (r.item as string) ?? "",
    moduleSub: (r.moduleSub as string) ?? "",
    price: (r.price as string) ?? "",
    priceSub: (r.priceSub as string) ?? "",
    note: (r.note as string) ?? "",
  }));
  return {
    intro: (raw.intro as string) ?? (raw.introSentence as string) ?? "",
    rows,
    pullquote: (raw.pullquote as string) ?? (raw.closingSentence as string) ?? "",
  };
}

function normalizeOutcome(raw: Record<string, unknown>): OutcomeData {
  const headers = (raw.headers ?? raw.columns ?? []) as string[];
  const rawRows = (raw.rows ?? []) as Array<Record<string, unknown>>;
  const rows: OutcomeRow[] = rawRows.map((r) => {
    if (r.metrics) {
      // Ensure trend is carried through
      const metrics = (r.metrics as Array<Record<string, unknown>>).map((m) => ({
        value: (m.value as string) ?? "",
        note: (m.note as string) ?? "",
        trend: (m.trend as "up" | "big_up" | "flat") ?? undefined,
      }));
      return { timeline: (r.timeline as string) ?? "", metrics };
    }
    // Old format: { period, values: string[] }
    const values = (r.values ?? []) as string[];
    return {
      timeline: (r.timeline as string) ?? (r.period as string) ?? "",
      metrics: values.map((v) => ({ value: v, note: "" })),
    };
  });
  return {
    intro: (raw.intro as string) ?? "",
    headers,
    rows,
    notes: (raw.notes ?? []) as string[],
    promise: (raw.promise as string) ?? (raw.disclaimer as string) ?? "",
  };
}

function normalizeTimeline(raw: Record<string, unknown>): TimelineData {
  const phases = ((raw.phases ?? []) as Array<Record<string, unknown>>).map((p) => ({
    num: (p.num as string) ?? (p.number as string) ?? "",
    time: (p.time as string) ?? (p.period as string) ?? "",
    title: (p.title as string) ?? "",
    desc: (p.desc as string) ?? (Array.isArray(p.deliverables) ? (p.deliverables as string[]).join("；") : ""),
    deliverables: Array.isArray(p.deliverables) ? (p.deliverables as string[]) : undefined,
  }));
  return { phases };
}

function normalizeUpsell(raw: Record<string, unknown>): UpsellData {
  const cards = ((raw.cards ?? []) as Array<Record<string, unknown>>).map((c) => ({
    icon: (c.icon as string) ?? "",
    title: (c.title as string) ?? "",
    formula: (c.formula as string) ?? "",
    desc: (c.desc as string) ?? (c.description as string) ?? "",
  }));
  return {
    intro: (raw.intro as string) ?? "",
    cards,
    coda: (raw.coda as string) ?? (raw.closingNote as string) ?? "",
  };
}

function normalizeCta(raw: Record<string, unknown>): CtaData {
  return {
    titleHtml: (raw.titleHtml as string) ?? "",
    text: (raw.text as string) ?? (raw.closingStatement as string) ?? "",
    buttonText: (raw.buttonText as string) ?? "预约沟通 →",
    email: (raw.email as string) ?? (raw.contactEmail as string) ?? "hello@sitesfy.ai",
    contact: (raw.contact as string) ?? (raw.contactWebsite as string) ?? "sitesfy.ai",
  };
}

const SERVICE_ICONS: Record<string, string> = {
  website: '<svg class="service-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M3 9h18"/><circle cx="6.5" cy="6.5" r="0.5" fill="currentColor"/><circle cx="9" cy="6.5" r="0.5" fill="currentColor"/></svg>',
  seo: '<svg class="service-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="6"/><path d="M14.5 14.5L20 20"/><path d="M8 7.5c1.5-1 3.5-1 5 0"/></svg>',
  content: '<svg class="service-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v16H4z"/><path d="M8 8h8M8 12h6M8 16h4"/></svg>',
  custom: '<svg class="service-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12,2 15,9 22,9 16.5,14 18.5,21 12,17 5.5,21 7.5,14 2,9 9,9"/></svg>',
};

function renderService(data: ServiceData): string {
  const servicesHtml = (data.services ?? [])
    .map((s) => {
      const chipsHtml = (s.chips ?? [])
        .map((c) => `        <span class="chip">${esc(c)}</span>`)
        .join("\n");
      const priceClass = s.priceIsMonthly ? ' class="service-price month"' : ' class="service-price"';
      const iconHtml = s.iconKey && SERVICE_ICONS[s.iconKey] ? SERVICE_ICONS[s.iconKey] : "";
      return `    <div class="service">
      <div class="service-tag">${iconHtml}${esc(s.tag)}</div>
      <div class="service-header">
        <div>
          <h3>${esc(s.title)}</h3>
          <div class="service-tagline">${esc(s.tagline)}</div>
        </div>
        <div${priceClass}>${esc(s.price)}</div>
      </div>
      <p class="service-desc">${s.desc ?? ""}</p>
      <div class="chips">
${chipsHtml}
      </div>
    </div>`;
    })
    .join("\n\n");

  return `<section class="chapter">
  <div class="container">
    <div class="chapter-num">03 — 服务方案</div>
    <h2>${esc(data.sectionTitle ?? "服务方案")}${data.sectionTitleQuiet ? `,<span class="quiet">${esc(data.sectionTitleQuiet)}</span>` : ""}</h2>
${servicesHtml}
  </div>
</section>`;
}

function renderPricing(data: PricingData): string {
  const rowsHtml = (data.rows ?? [])
    .map(
      (r) => `        <tr>
          <td>
            <div class="module-name">${esc(r.moduleName)}</div>
            <div class="module-sub">${esc(r.moduleSub)}</div>
          </td>
          <td>
            <div class="price-cell">${esc(r.price)}<span class="price-sub">${esc(r.priceSub)}</span></div>
          </td>
          <td class="note-cell">${esc(r.note)}</td>
        </tr>`
    )
    .join("\n");

  return `<section class="chapter">
  <div class="container">
    <div class="chapter-num">04 — 合作结构</div>
    <h2>透明定价,<span class="quiet">按效果付费</span></h2>
    <p>${esc(data.intro)}</p>
    <table class="pricing">
      <thead>
        <tr>
          <th style="width:35%">服务模块</th>
          <th style="width:22%">费用结构</th>
          <th style="width:43%">说明</th>
        </tr>
      </thead>
      <tbody>
${rowsHtml}
      </tbody>
    </table>
    <div class="pullquote" style="margin-top:56px;">${data.pullquote ?? ""}</div>
  </div>
</section>`;
}

function renderOutcome(data: OutcomeData): string {
  const trendSvg = (trend: string | undefined): string => {
    if (!trend) return "";
    if (trend === "up") return '<svg class="trend-icon up" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 12V4M5 7l3-3 3 3"/></svg>';
    if (trend === "big_up") return '<svg class="trend-icon big-up" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12V4M2 7l3-3 3 3"/><path d="M11 12V4M8 7l3-3 3 3"/></svg>';
    if (trend === "flat") return '<svg class="trend-icon flat" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 8h10M10 5l3 3-3 3"/></svg>';
    return "";
  };

  const thHtml = (data.headers ?? []).map((h) => `          <th>${esc(h)}</th>`).join("\n");
  const rowsHtml = (data.rows ?? [])
    .map((r) => {
      const metricCells = (r.metrics ?? [])
        .map(
          (m) =>
            `          <td class="metric">${trendSvg(m.trend)}${esc(m.value)}<span class="small">${esc(m.note)}</span></td>`
        )
        .join("\n");
      return `        <tr>
          <td class="timeline">${esc(r.timeline)}</td>
${metricCells}
        </tr>`;
    })
    .join("\n");

  const notesHtml = (data.notes ?? [])
    .map((n) => `        <li>${n ?? ""}</li>`)
    .join("\n");

  return `<section class="chapter">
  <div class="container">
    <div class="chapter-num">04.5 — 预期效果</div>
    <h2>你能拿到什么,<span class="quiet">多久能拿到</span></h2>
    <p class="outcome-intro">${data.intro ?? ""}</p>
    <table class="outcome-table">
      <thead>
        <tr>
          <th>时间节点</th>
${thHtml}
        </tr>
      </thead>
      <tbody>
${rowsHtml}
      </tbody>
    </table>
    <div class="outcome-notes">
      <ul>
${notesHtml}
      </ul>
      <div class="outcome-promise">${data.promise ?? ""}</div>
    </div>
  </div>
</section>`;
}

function renderTimeline(data: TimelineData): string {
  const phasesHtml = (data.phases ?? [])
    .map((p) => {
      const chipsHtml = (p.deliverables && p.deliverables.length > 0)
        ? `\n        <div class="phase-chips">${p.deliverables.map((d) => `<span class="phase-chip">${esc(d)}</span>`).join("")}</div>`
        : "";
      return `      <div class="phase">
        <div class="phase-num">${esc(p.num)}</div>
        <div class="phase-time">${esc(p.time)}</div>
        <div class="phase-title">${esc(p.title)}</div>
        <div class="phase-desc">${esc(p.desc)}</div>${chipsHtml}
      </div>`;
    })
    .join("\n");

  return `<section class="chapter">
  <div class="container">
    <div class="chapter-num">05 — 执行路径</div>
    <h2>从启动<span class="quiet">到全自动</span></h2>
    <div class="timeline-grid">
${phasesHtml}
    </div>
  </div>
</section>`;
}

function renderUpsell(data: UpsellData): string {
  const cardsHtml = (data.cards ?? [])
    .map(
      (c) => `      <div class="upsell-card">
        <div class="upsell-icon">${esc(c.icon)}</div>
        <h4>${esc(c.title)}</h4>
        <div class="upsell-formula">${esc(c.formula)}</div>
        <p>${esc(c.desc)}</p>
      </div>`
    )
    .join("\n");

  return `<section class="chapter">
  <div class="container">
    <div class="chapter-num">06 — 更多可能</div>
    <h2>AI 能力的<span class="quiet">延伸方向</span></h2>
    <p style="max-width:740px;">${esc(data.intro)}</p>
    <div class="upsell-grid">
${cardsHtml}
    </div>
    <div class="upsell-coda">${data.coda ?? ""}</div>
  </div>
</section>`;
}

function renderCta(data: CtaData, clientName: string): string {
  const encodedSubject = encodeURIComponent(`${clientName} × Sitesfy 合作沟通`);
  return `<section class="cta">
  <div class="container">
    <h2>${data.titleHtml ?? ""}</h2>
    <p class="cta-text">${data.text ?? ""}</p>
    <a href="mailto:${esc(data.email)}?subject=${encodedSubject}" class="cta-btn">${esc(data.buttonText)}</a>
    <div class="cta-contact">${esc(data.contact)}</div>
  </div>
</section>`;
}

function renderFooter(clientName: string, date: string): string {
  return `<footer class="footer">
  <div class="footer-inner">
    <div>Sitesfy × ${esc(clientName)}</div>
    <div>合作提案 · 保密文件 · ${esc(date)}</div>
  </div>
</footer>`;
}

// ─── Main render function ─────────────────────────────────────────────

export function renderProposal(sections: ProposalSections): string {
  const parts: string[] = [];

  parts.push(`<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Sitesfy × ${esc(sections.clientName)} · 合作提案</title>
${GOOGLE_FONTS_LINK}
<style>
${PROPOSAL_CSS}
</style>
</head>
<body>`);

  parts.push(renderTopbar(sections.clientName, sections.date));
  parts.push("<main>");

  if (sections.hero) parts.push(renderHero(normalizeHero(sections.hero as unknown as Record<string, unknown>)));

  if (sections.profile) {
    parts.push(
      renderProfile(normalizeProfile(sections.profile as unknown as Record<string, unknown>)).replace(
        "{{CLIENT_NAME}}",
        esc(sections.clientName)
      )
    );
  }

  if (sections.diagnosis) parts.push(renderDiagnosis(normalizeDiagnosis(sections.diagnosis as unknown as Record<string, unknown>)));
  if (sections.competitor) parts.push(renderCompetitor(normalizeCompetitor(sections.competitor as unknown as Record<string, unknown>, sections.clientName)));
  if (sections.service) parts.push(renderService(normalizeService(sections.service as unknown as Record<string, unknown>)));
  if (sections.pricing) parts.push(renderPricing(normalizePricing(sections.pricing as unknown as Record<string, unknown>)));
  if (sections.outcome) parts.push(renderOutcome(normalizeOutcome(sections.outcome as unknown as Record<string, unknown>)));
  if (sections.timeline) parts.push(renderTimeline(normalizeTimeline(sections.timeline as unknown as Record<string, unknown>)));
  if (sections.upsell) parts.push(renderUpsell(normalizeUpsell(sections.upsell as unknown as Record<string, unknown>)));
  if (sections.cta) parts.push(renderCta(normalizeCta(sections.cta as unknown as Record<string, unknown>), sections.clientName));

  parts.push("</main>");
  parts.push(renderFooter(sections.clientName, sections.date));
  parts.push("</body>\n</html>");

  return parts.join("\n\n");
}
