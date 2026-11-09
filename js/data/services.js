/* Services: single source of truth for the scroll stage and the calculator.
   TODO(client): confirm copy, and confirm the "best for" lists. */
window.GM = window.GM || {};

window.GM.SERVICES = [
  { id: "website", mini: "website", title: "Website design & redesign",
    desc: "Fast, custom-built sites that say clearly what you do and make the next step obvious.",
    best: ["Companies with an outdated site", "Launching a new brand", "Services that need to be found"] },
  { id: "ai-apps", mini: "ai", title: "AI web apps",
    desc: "Assistants and tools that answer from your own data, with a person able to step in.",
    best: ["Repeated customer questions", "Searching internal documents", "Drafting and summarising"] },
  { id: "erp", mini: "erp", title: "ERP & business systems",
    desc: "One system for orders, stock, invoices and reports, shaped to how your team already works.",
    best: ["Teams living in spreadsheets", "Several branches or warehouses", "Odoo extensions"] },
  { id: "ecommerce", mini: "shop", title: "E-commerce & ordering",
    desc: "Stores and ordering flows with a catalogue you can manage yourself and a checkout that finishes.",
    best: ["Selling products online", "Taking orders by phone today", "Local delivery"] },
  { id: "automation", mini: "flow", title: "Automation & workflow tools",
    desc: "Connect forms, inboxes and reports so the routine steps run without anyone chasing them.",
    best: ["Manual copy and paste", "Lead follow-up", "Weekly reporting"] },
];
