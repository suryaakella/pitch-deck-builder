import json
import uuid
from typing import Annotated, Optional
from pydantic import BaseModel, Field
from mcp.types import ToolAnnotations
from mcp_use.server import MCPServer
from mcp_ui_server import create_ui_resource
from mcp_ui_server.core import UIResource

from widget import build_widget_html

server = MCPServer(name="pitch-deck-builder", version="1.0.0")

# ─── In-memory state ──────────────────────────────────────────

decks: dict[str, dict] = {}
current_deck_id: str | None = None


def get_current_deck() -> dict | None:
    if current_deck_id and current_deck_id in decks:
        return decks[current_deck_id]
    return None


def make_slide(slide_type: str, title: str, **kwargs) -> dict:
    return {
        "id": str(uuid.uuid4())[:8],
        "type": slide_type,
        "title": title,
        **kwargs,
    }


def deck_to_ui(deck: dict) -> list[UIResource]:
    """Return the deck as an interactive HTML widget via mcp-ui-server."""
    html = build_widget_html(deck)
    ui_resource = create_ui_resource({
        "uri": f"ui://pitch-deck/{deck['id']}",
        "content": {
            "type": "rawHtml",
            "htmlString": html,
        },
        "encoding": "text",
    })
    return [ui_resource]


# ─── Tool 1: Generate Deck ────────────────────────────────────

@server.tool(
    name="generate_pitch_deck",
    title="Generate Pitch Deck",
    description="""Generate a complete pitch deck from a startup description.
    Returns an interactive slide viewer widget with 8-10 professionally designed slides.
    Use this when the user wants to create a pitch deck, investor presentation, or startup slides.""",
    annotations=ToolAnnotations(readOnlyHint=False, idempotentHint=False),
)
def generate_pitch_deck(
    company_name: Annotated[str, Field(description="Name of the company/startup")],
    description: Annotated[str, Field(description="What the company does, its value proposition")],
    industry: Annotated[Optional[str], Field(description="Industry/vertical (e.g. fintech, healthtech, edtech)", default=None)],
    stage: Annotated[Optional[str], Field(description="Funding stage (e.g. pre-seed, seed, Series A)", default=None)],
    ask_amount: Annotated[Optional[str], Field(description="How much they're raising (e.g. $2M)", default=None)],
    traction: Annotated[Optional[str], Field(description="Key traction metrics (e.g. 50K users, $1M ARR)", default=None)],
) -> list[UIResource]:
    """Generate a complete pitch deck with interactive slide viewer."""
    global current_deck_id

    deck_id = str(uuid.uuid4())[:8]
    ind = industry or "technology"
    stg = stage or "Seed"
    ask = ask_amount or "$2M"
    trac = traction or "Growing rapidly"

    slides = [
        make_slide("title", company_name, subtitle=description, icon="🚀"),
        make_slide("problem", "The Problem", content=f"The {ind} industry faces critical challenges that existing solutions fail to address.", bullets=[
            "Current solutions are fragmented and outdated",
            "Users waste significant time on manual processes",
            "No unified platform addresses the full workflow",
        ], icon="🔥"),
        make_slide("solution", "Our Solution", content=f"{company_name} {description}. We provide a seamless, integrated platform that transforms how people work.", bullets=[
            "AI-powered automation eliminates manual work",
            "Unified platform replaces 5+ point solutions",
            "Real-time insights drive better decisions",
        ], icon="💡"),
        make_slide("market", "Market Opportunity", content=f"The {ind} market is massive and growing rapidly.", metrics=[
            {"label": "TAM", "value": "$50B+", "description": "Total addressable market"},
            {"label": "SAM", "value": "$8B", "description": "Serviceable addressable market"},
            {"label": "SOM", "value": "$500M", "description": "Serviceable obtainable market"},
        ], icon="📊"),
        make_slide("product", "The Product", content=f"A brief walkthrough of {company_name}'s core product experience.", bullets=[
            "Intuitive onboarding — get started in under 2 minutes",
            "AI-powered core workflow that saves 10+ hours/week",
            "Dashboard with real-time analytics and insights",
            "Integrations with the tools teams already use",
        ], icon="📱"),
        make_slide("business_model", "Business Model", content="SaaS subscription model with strong unit economics.", metrics=[
            {"label": "ACV", "value": "$12K", "description": "Average contract value"},
            {"label": "Gross Margin", "value": "85%", "description": "Software margins"},
            {"label": "LTV:CAC", "value": "5:1", "description": "Efficient growth"},
        ], icon="💰"),
        make_slide("traction", "Traction", content=trac, metrics=[
            {"label": "Users", "value": "10K+", "description": "Active monthly users"},
            {"label": "Revenue", "value": "$500K ARR", "description": "Annual recurring revenue"},
            {"label": "Growth", "value": "3x YoY", "description": "Year-over-year growth"},
        ], icon="📈"),
        make_slide("team", "The Team", content="Experienced founders with deep domain expertise.", bullets=[
            "CEO — 10+ years in the industry, ex-FAANG",
            "CTO — ML/AI expert, PhD Stanford",
            "VP Sales — Built $50M pipeline at previous startup",
        ], icon="👥"),
        make_slide("ask", "The Ask", content=f"Raising {ask} {stg} round to accelerate growth.", metrics=[
            {"label": "Raising", "value": ask, "description": f"{stg} round"},
            {"label": "Use: Product", "value": "40%", "description": "Engineering & product"},
            {"label": "Use: Growth", "value": "35%", "description": "Sales & marketing"},
            {"label": "Use: Ops", "value": "25%", "description": "Team & operations"},
        ], icon="🎯"),
    ]

    deck = {
        "id": deck_id,
        "companyName": company_name,
        "tagline": description,
        "theme": "midnight",
        "slides": slides,
    }

    decks[deck_id] = deck
    current_deck_id = deck_id

    return deck_to_ui(deck)


# ─── Tool 2: Update Slide ─────────────────────────────────────

@server.tool(
    name="update_slide",
    title="Update Slide",
    description="Update the content of a specific slide in the current pitch deck. Can modify title, content, bullets, or metrics.",
)
def update_slide(
    slide_index: Annotated[int, Field(description="0-based index of the slide to update")],
    title: Annotated[Optional[str], Field(description="New title for the slide", default=None)],
    content: Annotated[Optional[str], Field(description="New body content", default=None)],
    bullets: Annotated[Optional[list[str]], Field(description="New bullet points", default=None)],
) -> list[UIResource]:
    """Update a specific slide and return the updated deck widget."""
    deck = get_current_deck()
    if not deck:
        raise ValueError("No deck found. Generate a pitch deck first.")
    if slide_index < 0 or slide_index >= len(deck["slides"]):
        raise ValueError(f"Invalid slide index. Deck has {len(deck['slides'])} slides (0-{len(deck['slides'])-1}).")

    slide = deck["slides"][slide_index]
    if title:
        slide["title"] = title
    if content:
        slide["content"] = content
    if bullets:
        slide["bullets"] = bullets

    return deck_to_ui(deck)


# ─── Tool 3: Add Slide ────────────────────────────────────────

@server.tool(
    name="add_slide",
    title="Add Slide",
    description="Add a new slide to the current pitch deck at a given position.",
)
def add_slide(
    title: Annotated[str, Field(description="Title of the new slide")],
    content: Annotated[str, Field(description="Body content of the slide")],
    slide_type: Annotated[str, Field(description="Slide type: problem, solution, market, product, business_model, traction, team, ask, custom", default="custom")],
    position: Annotated[Optional[int], Field(description="0-based position to insert at. Appends to end if omitted.", default=None)],
    bullets: Annotated[Optional[list[str]], Field(description="Optional bullet points", default=None)],
) -> list[UIResource]:
    """Add a new slide and return updated deck widget."""
    deck = get_current_deck()
    if not deck:
        raise ValueError("No deck found. Generate a pitch deck first.")

    new_slide = make_slide(slide_type, title, content=content)
    if bullets:
        new_slide["bullets"] = bullets

    if position is not None and 0 <= position <= len(deck["slides"]):
        deck["slides"].insert(position, new_slide)
    else:
        deck["slides"].append(new_slide)

    return deck_to_ui(deck)


# ─── Tool 4: Remove Slide ─────────────────────────────────────

@server.tool(
    name="remove_slide",
    title="Remove Slide",
    description="Remove a slide from the current pitch deck by its index.",
)
def remove_slide(
    slide_index: Annotated[int, Field(description="0-based index of the slide to remove")],
) -> list[UIResource]:
    """Remove a slide and return updated deck widget."""
    deck = get_current_deck()
    if not deck:
        raise ValueError("No deck found. Generate a pitch deck first.")
    if slide_index < 0 or slide_index >= len(deck["slides"]):
        raise ValueError(f"Invalid slide index.")

    deck["slides"].pop(slide_index)
    return deck_to_ui(deck)


# ─── Tool 5: Change Theme ─────────────────────────────────────

@server.tool(
    name="change_theme",
    title="Change Theme",
    description="Change the visual theme of the pitch deck. Options: midnight (dark navy), clean (white minimal), sunset (warm gradient), forest (deep green), electric (neon cyberpunk).",
)
def change_theme(
    theme: Annotated[str, Field(description="Theme name: midnight, clean, sunset, forest, electric")],
) -> list[UIResource]:
    """Change deck theme and return updated widget."""
    deck = get_current_deck()
    if not deck:
        raise ValueError("No deck found. Generate a pitch deck first.")
    if theme not in ("midnight", "clean", "sunset", "forest", "electric"):
        raise ValueError("Invalid theme. Choose: midnight, clean, sunset, forest, electric")
    deck["theme"] = theme
    return deck_to_ui(deck)


# ─── Run Server ───────────────────────────────────────────────

if __name__ == "__main__":
    server.run(transport="streamable-http", host="0.0.0.0", port=3000, debug=True)
