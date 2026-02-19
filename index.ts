import { MCPServer, widget, text } from "mcp-use/server";
import { z } from "zod";
import { randomUUID } from "crypto";

const server = new MCPServer({
  name: "pitch-deck-builder",
  version: "1.0.0",
});

// ─── Types ──────────────────────────────────────────────────

interface Metric {
  label: string;
  value: string;
  description?: string;
}

interface Slide {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  content?: string;
  bullets?: string[];
  metrics?: Metric[];
  icon?: string;
}

interface Deck {
  id: string;
  companyName: string;
  tagline: string;
  theme: string;
  slides: Slide[];
}

// ─── In-memory state ────────────────────────────────────────

const decks = new Map<string, Deck>();
let currentDeckId: string | null = null;

function getCurrentDeck(): Deck | null {
  if (currentDeckId && decks.has(currentDeckId)) {
    return decks.get(currentDeckId)!;
  }
  return null;
}

function makeSlide(type: string, title: string, opts: Partial<Slide> = {}): Slide {
  return {
    id: randomUUID().slice(0, 8),
    type,
    title,
    ...opts,
  };
}

// ─── Text fallback helpers ──────────────────────────────────

function formatSlideText(index: number, slide: Slide): string {
  const icon = slide.icon || "";
  const lines: string[] = [`### Slide ${index + 1}: ${icon} ${slide.title}`];
  if (slide.subtitle) lines.push(slide.subtitle);
  if (slide.content) lines.push(slide.content);
  if (slide.bullets) {
    for (const b of slide.bullets) lines.push(`  - ${b}`);
  }
  if (slide.metrics) {
    for (const m of slide.metrics) {
      const desc = m.description ? ` (${m.description})` : "";
      lines.push(`  - **${m.label}**: ${m.value}${desc}`);
    }
  }
  return lines.join("\n");
}

function deckToText(deck: Deck): string {
  const header = `## ${deck.companyName} — Pitch Deck\n*${deck.tagline}*\n*Theme: ${deck.theme} | ${deck.slides.length} slides*\n`;
  const slidesText = deck.slides.map((s, i) => formatSlideText(i, s)).join("\n\n");
  return `${header}\n${slidesText}`;
}

// ─── Widget props builder ───────────────────────────────────

function deckProps(deck: Deck) {
  return {
    companyName: deck.companyName,
    tagline: deck.tagline,
    theme: deck.theme,
    slides: deck.slides,
  };
}

// ─── Tool 1: Generate Pitch Deck ────────────────────────────

server.tool(
  {
    name: "generate_pitch_deck",
    description:
      "Generate a complete pitch deck from a startup description. Returns an interactive slide viewer with 8-10 professionally designed slides. Use this when the user wants to create a pitch deck, investor presentation, or startup slides.",
    schema: z.object({
      company_name: z.string().describe("Name of the company/startup"),
      description: z.string().describe("What the company does, its value proposition"),
      industry: z.string().optional().describe("Industry/vertical (e.g. fintech, healthtech, edtech)"),
      stage: z.string().optional().describe("Funding stage (e.g. pre-seed, seed, Series A)"),
      ask_amount: z.string().optional().describe("How much they're raising (e.g. $2M)"),
      traction: z.string().optional().describe("Key traction metrics (e.g. 50K users, $1M ARR)"),
    }),
    widget: {
      name: "pitch-deck",
      invoking: "Building your pitch deck...",
      invoked: "Pitch deck ready!",
    },
  },
  async ({ company_name, description, industry, stage, ask_amount, traction }) => {
    const deckId = randomUUID().slice(0, 8);
    const ind = industry || "technology";
    const stg = stage || "Seed";
    const ask = ask_amount || "$2M";
    const trac = traction || "Growing rapidly";

    const slides: Slide[] = [
      makeSlide("title", company_name, { subtitle: description, icon: "\u{1F680}" }),
      makeSlide("problem", "The Problem", {
        content: `The ${ind} industry faces critical challenges that existing solutions fail to address.`,
        bullets: [
          "Current solutions are fragmented and outdated",
          "Users waste significant time on manual processes",
          "No unified platform addresses the full workflow",
        ],
        icon: "\u{1F525}",
      }),
      makeSlide("solution", "Our Solution", {
        content: `${company_name} ${description}. We provide a seamless, integrated platform that transforms how people work.`,
        bullets: [
          "AI-powered automation eliminates manual work",
          "Unified platform replaces 5+ point solutions",
          "Real-time insights drive better decisions",
        ],
        icon: "\u{1F4A1}",
      }),
      makeSlide("market", "Market Opportunity", {
        content: `The ${ind} market is massive and growing rapidly.`,
        metrics: [
          { label: "TAM", value: "$50B+", description: "Total addressable market" },
          { label: "SAM", value: "$8B", description: "Serviceable addressable market" },
          { label: "SOM", value: "$500M", description: "Serviceable obtainable market" },
        ],
        icon: "\u{1F4CA}",
      }),
      makeSlide("product", "The Product", {
        content: `A brief walkthrough of ${company_name}'s core product experience.`,
        bullets: [
          "Intuitive onboarding \u2014 get started in under 2 minutes",
          "AI-powered core workflow that saves 10+ hours/week",
          "Dashboard with real-time analytics and insights",
          "Integrations with the tools teams already use",
        ],
        icon: "\u{1F4F1}",
      }),
      makeSlide("business_model", "Business Model", {
        content: "SaaS subscription model with strong unit economics.",
        metrics: [
          { label: "ACV", value: "$12K", description: "Average contract value" },
          { label: "Gross Margin", value: "85%", description: "Software margins" },
          { label: "LTV:CAC", value: "5:1", description: "Efficient growth" },
        ],
        icon: "\u{1F4B0}",
      }),
      makeSlide("traction", "Traction", {
        content: trac,
        metrics: [
          { label: "Users", value: "10K+", description: "Active monthly users" },
          { label: "Revenue", value: "$500K ARR", description: "Annual recurring revenue" },
          { label: "Growth", value: "3x YoY", description: "Year-over-year growth" },
        ],
        icon: "\u{1F4C8}",
      }),
      makeSlide("team", "The Team", {
        content: "Experienced founders with deep domain expertise.",
        bullets: [
          "CEO \u2014 10+ years in the industry, ex-FAANG",
          "CTO \u2014 ML/AI expert, PhD Stanford",
          "VP Sales \u2014 Built $50M pipeline at previous startup",
        ],
        icon: "\u{1F465}",
      }),
      makeSlide("ask", "The Ask", {
        content: `Raising ${ask} ${stg} round to accelerate growth.`,
        metrics: [
          { label: "Raising", value: ask, description: `${stg} round` },
          { label: "Use: Product", value: "40%", description: "Engineering & product" },
          { label: "Use: Growth", value: "35%", description: "Sales & marketing" },
          { label: "Use: Ops", value: "25%", description: "Team & operations" },
        ],
        icon: "\u{1F3AF}",
      }),
    ];

    const deck: Deck = {
      id: deckId,
      companyName: company_name,
      tagline: description,
      theme: "midnight",
      slides,
    };

    decks.set(deckId, deck);
    currentDeckId = deckId;

    return widget({
      props: deckProps(deck),
      output: text(`Created pitch deck for ${company_name} with ${slides.length} slides.\n\n${deckToText(deck)}`),
    });
  },
);

// ─── Tool 2: Update Slide ───────────────────────────────────

server.tool(
  {
    name: "update_slide",
    description:
      "Update the content of a specific slide in the current pitch deck. Can modify title, content, or bullets.",
    schema: z.object({
      slide_index: z.number().int().describe("0-based index of the slide to update"),
      title: z.string().optional().describe("New title for the slide"),
      content: z.string().optional().describe("New body content"),
      bullets: z.array(z.string()).optional().describe("New bullet points"),
    }),
    widget: {
      name: "pitch-deck",
      invoking: "Updating slide...",
      invoked: "Slide updated!",
    },
  },
  async ({ slide_index, title, content, bullets }) => {
    const deck = getCurrentDeck();
    if (!deck) throw new Error("No deck found. Generate a pitch deck first.");
    if (slide_index < 0 || slide_index >= deck.slides.length) {
      throw new Error(`Invalid slide index. Deck has ${deck.slides.length} slides (0-${deck.slides.length - 1}).`);
    }

    const slide = deck.slides[slide_index];
    if (title) slide.title = title;
    if (content) slide.content = content;
    if (bullets) slide.bullets = bullets;

    return widget({
      props: deckProps(deck),
      output: text(`Updated slide ${slide_index} in ${deck.companyName} deck.\n\n${deckToText(deck)}`),
    });
  },
);

// ─── Tool 3: Add Slide ──────────────────────────────────────

server.tool(
  {
    name: "add_slide",
    description: "Add a new slide to the current pitch deck at a given position.",
    schema: z.object({
      title: z.string().describe("Title of the new slide"),
      content: z.string().describe("Body content of the slide"),
      slide_type: z
        .string()
        .default("custom")
        .describe("Slide type: problem, solution, market, product, business_model, traction, team, ask, custom"),
      position: z.number().int().optional().describe("0-based position to insert at. Appends to end if omitted."),
      bullets: z.array(z.string()).optional().describe("Optional bullet points"),
    }),
    widget: {
      name: "pitch-deck",
      invoking: "Adding slide...",
      invoked: "Slide added!",
    },
  },
  async ({ title, content, slide_type, position, bullets }) => {
    const deck = getCurrentDeck();
    if (!deck) throw new Error("No deck found. Generate a pitch deck first.");

    const newSlide = makeSlide(slide_type, title, { content });
    if (bullets) newSlide.bullets = bullets;

    if (position !== undefined && position >= 0 && position <= deck.slides.length) {
      deck.slides.splice(position, 0, newSlide);
    } else {
      deck.slides.push(newSlide);
    }

    return widget({
      props: deckProps(deck),
      output: text(`Added slide '${title}' to ${deck.companyName} deck.\n\n${deckToText(deck)}`),
    });
  },
);

// ─── Tool 4: Remove Slide ───────────────────────────────────

server.tool(
  {
    name: "remove_slide",
    description: "Remove a slide from the current pitch deck by its index.",
    schema: z.object({
      slide_index: z.number().int().describe("0-based index of the slide to remove"),
    }),
    widget: {
      name: "pitch-deck",
      invoking: "Removing slide...",
      invoked: "Slide removed!",
    },
  },
  async ({ slide_index }) => {
    const deck = getCurrentDeck();
    if (!deck) throw new Error("No deck found. Generate a pitch deck first.");
    if (slide_index < 0 || slide_index >= deck.slides.length) {
      throw new Error("Invalid slide index.");
    }

    const removedTitle = deck.slides[slide_index].title;
    deck.slides.splice(slide_index, 1);

    return widget({
      props: deckProps(deck),
      output: text(`Removed slide '${removedTitle}' from ${deck.companyName} deck.\n\n${deckToText(deck)}`),
    });
  },
);

// ─── Tool 5: Change Theme ───────────────────────────────────

const VALID_THEMES = ["midnight", "clean", "sunset", "forest", "electric"] as const;

server.tool(
  {
    name: "change_theme",
    description:
      "Change the visual theme of the pitch deck. Options: midnight (dark navy), clean (white minimal), sunset (warm gradient), forest (deep green), electric (neon cyberpunk).",
    schema: z.object({
      theme: z.enum(VALID_THEMES).describe("Theme name"),
    }),
    widget: {
      name: "pitch-deck",
      invoking: "Changing theme...",
      invoked: "Theme changed!",
    },
  },
  async ({ theme }) => {
    const deck = getCurrentDeck();
    if (!deck) throw new Error("No deck found. Generate a pitch deck first.");

    deck.theme = theme;

    return widget({
      props: deckProps(deck),
      output: text(`Changed ${deck.companyName} deck theme to ${theme}.\n\n${deckToText(deck)}`),
    });
  },
);

// ─── Start ──────────────────────────────────────────────────

server.listen(3000);
