/* Project ledger: the single source of truth.
   Counts, status bar, filters, previews and case panels are all derived from this array.

   TODO(client): the original site copy was not in the repo, so every `summary`, `stack`
   and `audience` below is a neutral placeholder. Replace with the exact approved copy.
   TODO(client): confirm "shipped" for the first seven. Last four are "planned" per current copy.
   Do not add metrics, logos or testimonials that the client has not supplied. */

window.GM = window.GM || {};

window.GM.STATUS = {
  shipped: { label: "Shipped", color: "var(--moss)" },
  build: { label: "In build", color: "var(--signal)" },
  planned: { label: "Planned", color: "var(--steel)" },
};

window.GM.PROJECTS = [
  {
    id: "innovation-ai", name: "Innovation AI", type: "AI platform", status: "shipped", art: "network",
    summary: "An AI platform built around the way the team already works. TODO(client): exact copy.",
    focus: ["Custom AI workflows", "Internal knowledge search", "Admin dashboard"],
    stack: "TODO(client)", audience: "TODO(client)",
  },
  {
    id: "innovation-odoo-ai", name: "Innovation Odoo AI", type: "ERP + AI", status: "shipped", art: "modules",
    summary: "Odoo extended with AI assistance for day-to-day operations. TODO(client): exact copy.",
    focus: ["Odoo customisation", "AI assistant inside ERP", "Reporting"],
    stack: "Odoo · TODO(client)", audience: "TODO(client)",
  },
  {
    id: "innovation-recruitment-services", name: "Innovation Recruitment Services", type: "Website + platform", status: "shipped", art: "profiles",
    summary: "A recruitment site and candidate flow for a hiring business. TODO(client): exact copy.",
    focus: ["Job listings", "Candidate intake", "Admin tools"],
    stack: "TODO(client)", audience: "Employers and candidates",
  },
  {
    id: "meshoo-pictures", name: "Meshoo Pictures", type: "Website", status: "shipped", art: "frame",
    summary: "A portfolio-led website for a picture and production studio. TODO(client): exact copy.",
    focus: ["Visual portfolio", "Fast image delivery", "Contact flow"],
    stack: "TODO(client)", audience: "Clients and collaborators",
  },
  {
    id: "innovation-erp", name: "Innovation ERP", type: "ERP system", status: "shipped", art: "table",
    summary: "An ERP built to the company's own processes, not a template. TODO(client): exact copy.",
    focus: ["Inventory and orders", "Finance and reporting", "Role-based access"],
    stack: "TODO(client)", audience: "Operations and finance teams",
  },
  {
    id: "kawader-jo", name: "Kawader JO", type: "Platform", status: "shipped", art: "steps",
    summary: "A platform that connects people and opportunities in Jordan. TODO(client): exact copy.",
    focus: ["Profiles", "Search and matching", "Admin review"],
    stack: "TODO(client)", audience: "TODO(client)",
  },
  {
    id: "candera-cake", name: "Candera Cake", type: "E-commerce", status: "shipped", art: "cake",
    summary: "An online store for a cake business, from menu to checkout. TODO(client): exact copy.",
    focus: ["Product catalogue", "Cart and checkout", "Order management"],
    stack: "TODO(client)", audience: "Customers ordering online",
  },
  {
    id: "pipo3", name: "PIPO3", type: "AI + robotics", status: "planned", art: "skeleton",
    summary: "A humanoid motion project, mapped to a 32-joint skeleton. TODO(client): exact copy.",
    focus: ["32-joint skeleton model", "Motion planning", "Simulation first"],
    stack: "TODO(client)", audience: "TODO(client)",
  },
  {
    id: "cookie", name: "Cookie", type: "AI agents", status: "planned", art: "agents",
    summary: "A graph of cooperating agents that hand work to each other. TODO(client): exact copy.",
    focus: ["Agent graph", "Task hand-off", "Human review step"],
    stack: "TODO(client)", audience: "TODO(client)",
  },
  {
    id: "goat-cheese", name: "Goat Cheese", type: "Automation", status: "planned", art: "pipeline",
    summary: "A pipeline that moves data from intake to a finished report. TODO(client): exact copy.",
    focus: ["Intake forms", "Automated processing", "Reporting"],
    stack: "TODO(client)", audience: "TODO(client)",
  },
  {
    id: "nashmi", name: "Nashmi", type: "AI chat", status: "planned", art: "bubble",
    summary: "An Arabic-first conversational assistant. TODO(client): exact copy.",
    focus: ["Arabic-first conversation", "Context memory", "Hand-off to a person"],
    stack: "TODO(client)", audience: "Arabic-speaking users",
  },
];
