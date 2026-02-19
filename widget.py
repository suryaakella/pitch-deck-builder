import json


def build_widget_html(deck: dict) -> str:
    """Build a complete self-contained HTML string for the pitch deck viewer widget."""
    deck_json = json.dumps(deck)

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  :root {{
    --bg: #0f172a;
    --bg-secondary: rgba(255,255,255,0.05);
    --text: #ffffff;
    --text-secondary: rgba(255,255,255,0.7);
    --accent: #3b82f6;
    --accent-glow: rgba(59,130,246,0.3);
    --card-bg: rgba(255,255,255,0.06);
    --card-border: rgba(255,255,255,0.1);
    --nav-bg: rgba(255,255,255,0.08);
    --nav-hover: rgba(255,255,255,0.15);
    --dot-inactive: rgba(255,255,255,0.25);
    --shadow: 0 4px 24px rgba(0,0,0,0.3);
    --gradient: none;
  }}

  * {{ margin: 0; padding: 0; box-sizing: border-box; }}

  body {{
    font-family: 'DM Sans', sans-serif;
    overflow: hidden;
    height: 100vh;
    width: 100vw;
    background: var(--gradient, var(--bg));
    color: var(--text);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }}

  #app {{
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }}

  /* ─── Theme Switcher ─── */
  .theme-switcher {{
    position: absolute;
    top: 16px;
    left: 16px;
    display: flex;
    gap: 8px;
    z-index: 100;
  }}
  .theme-dot {{
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.3);
    cursor: pointer;
    transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
  }}
  .theme-dot:hover {{
    transform: scale(1.2);
  }}
  .theme-dot.active {{
    border-color: #fff;
    box-shadow: 0 0 8px rgba(255,255,255,0.4);
    transform: scale(1.15);
  }}
  .theme-dot[data-theme="midnight"] {{ background: #0f172a; }}
  .theme-dot[data-theme="clean"] {{ background: #ffffff; border-color: rgba(0,0,0,0.2); }}
  .theme-dot[data-theme="sunset"] {{ background: linear-gradient(135deg, #f97316, #ec4899); }}
  .theme-dot[data-theme="forest"] {{ background: #064e3b; }}
  .theme-dot[data-theme="electric"] {{ background: #0a0a0a; border-color: #00ff88; }}

  /* ─── Slide Counter ─── */
  .slide-counter {{
    position: absolute;
    top: 18px;
    right: 20px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    color: var(--text-secondary);
    z-index: 100;
    letter-spacing: 0.5px;
  }}

  /* ─── Slides Container ─── */
  .slides-viewport {{
    position: relative;
    width: 100%;
    height: 100%;
  }}
  .slide {{
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 60px 80px;
    opacity: 0;
    transform: translateX(60px);
    transition: opacity 0.4s ease, transform 0.4s ease;
    pointer-events: none;
  }}
  .slide.active {{
    opacity: 1;
    transform: translateX(0);
    pointer-events: auto;
  }}
  .slide.exit-left {{
    opacity: 0;
    transform: translateX(-60px);
  }}

  /* ─── Title Slide ─── */
  .slide-title {{
    text-align: center;
    justify-content: center;
    align-items: center;
  }}
  .slide-title .slide-icon {{
    font-size: 64px;
    margin-bottom: 20px;
    display: block;
  }}
  .slide-title h1 {{
    font-family: 'Montserrat', sans-serif;
    font-weight: 900;
    font-size: clamp(36px, 6vw, 64px);
    letter-spacing: -1.5px;
    line-height: 1.1;
    margin-bottom: 16px;
    background: linear-gradient(135deg, var(--text) 0%, var(--accent) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }}
  .slide-title .subtitle {{
    font-size: clamp(16px, 2.2vw, 22px);
    color: var(--text-secondary);
    font-weight: 400;
    max-width: 600px;
    line-height: 1.6;
  }}

  /* ─── Content Slides ─── */
  .slide-content .slide-icon {{
    font-size: 40px;
    margin-bottom: 12px;
    display: block;
  }}
  .slide-content h2 {{
    font-family: 'Montserrat', sans-serif;
    font-weight: 800;
    font-size: clamp(28px, 4vw, 44px);
    letter-spacing: -1px;
    line-height: 1.15;
    margin-bottom: 20px;
    color: var(--text);
  }}
  .slide-content .body-text {{
    font-size: clamp(15px, 1.8vw, 18px);
    color: var(--text-secondary);
    line-height: 1.7;
    max-width: 700px;
    margin-bottom: 28px;
  }}

  /* ─── Bullet List ─── */
  .bullet-list {{
    list-style: none;
    padding: 0;
    max-width: 650px;
  }}
  .bullet-list li {{
    position: relative;
    padding-left: 28px;
    margin-bottom: 14px;
    font-size: clamp(14px, 1.6vw, 17px);
    color: var(--text-secondary);
    line-height: 1.6;
  }}
  .bullet-list li::before {{
    content: '';
    position: absolute;
    left: 0;
    top: 9px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--accent);
    box-shadow: 0 0 8px var(--accent-glow);
  }}

  /* ─── Metric Cards ─── */
  .metrics-row {{
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
    margin-top: 8px;
  }}
  .metric-card {{
    flex: 1;
    min-width: 140px;
    max-width: 220px;
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 16px;
    padding: 24px 20px;
    text-align: center;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }}
  .metric-card:hover {{
    transform: translateY(-2px);
    box-shadow: var(--shadow);
  }}
  .metric-card .metric-value {{
    font-family: 'Montserrat', sans-serif;
    font-weight: 800;
    font-size: clamp(24px, 3vw, 36px);
    color: var(--accent);
    letter-spacing: -0.5px;
    margin-bottom: 6px;
  }}
  .metric-card .metric-label {{
    font-weight: 600;
    font-size: 14px;
    color: var(--text);
    margin-bottom: 4px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }}
  .metric-card .metric-desc {{
    font-size: 12px;
    color: var(--text-secondary);
  }}

  /* ─── Navigation Arrows ─── */
  .nav-arrow {{
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: none;
    background: var(--nav-bg);
    color: var(--text);
    font-size: 18px;
    cursor: pointer;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s ease, transform 0.2s ease;
    backdrop-filter: blur(8px);
  }}
  .nav-arrow:hover {{
    background: var(--nav-hover);
    transform: translateY(-50%) scale(1.08);
  }}
  .nav-arrow.prev {{ left: 16px; }}
  .nav-arrow.next {{ right: 16px; }}
  .nav-arrow:disabled {{
    opacity: 0.3;
    cursor: default;
  }}
  .nav-arrow:disabled:hover {{
    transform: translateY(-50%);
    background: var(--nav-bg);
  }}

  /* ─── Dot Indicators ─── */
  .dots {{
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 8px;
    z-index: 100;
  }}
  .dot {{
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--dot-inactive);
    cursor: pointer;
    transition: background 0.3s ease, transform 0.3s ease, width 0.3s ease;
  }}
  .dot.active {{
    background: var(--accent);
    width: 24px;
    border-radius: 4px;
    box-shadow: 0 0 10px var(--accent-glow);
  }}

  /* ─── Responsive ─── */
  @media (max-width: 640px) {{
    .slide {{
      padding: 50px 28px;
    }}
    .metrics-row {{
      gap: 12px;
    }}
    .metric-card {{
      min-width: 100px;
      padding: 16px 12px;
    }}
    .nav-arrow {{
      width: 36px;
      height: 36px;
      font-size: 14px;
    }}
    .nav-arrow.prev {{ left: 8px; }}
    .nav-arrow.next {{ right: 8px; }}
  }}
</style>
</head>
<body>
<div id="app"></div>
<script>
const DECK = {deck_json};

const THEMES = {{
  midnight: {{
    bg: '#0f172a',
    bgSecondary: 'rgba(255,255,255,0.05)',
    text: '#ffffff',
    textSecondary: 'rgba(255,255,255,0.7)',
    accent: '#3b82f6',
    accentGlow: 'rgba(59,130,246,0.3)',
    cardBg: 'rgba(255,255,255,0.06)',
    cardBorder: 'rgba(255,255,255,0.1)',
    navBg: 'rgba(255,255,255,0.08)',
    navHover: 'rgba(255,255,255,0.15)',
    dotInactive: 'rgba(255,255,255,0.25)',
    gradient: 'none',
  }},
  clean: {{
    bg: '#ffffff',
    bgSecondary: 'rgba(0,0,0,0.03)',
    text: '#1e293b',
    textSecondary: 'rgba(30,41,59,0.6)',
    accent: '#6366f1',
    accentGlow: 'rgba(99,102,241,0.25)',
    cardBg: 'rgba(0,0,0,0.03)',
    cardBorder: 'rgba(0,0,0,0.08)',
    navBg: 'rgba(0,0,0,0.05)',
    navHover: 'rgba(0,0,0,0.1)',
    dotInactive: 'rgba(0,0,0,0.15)',
    gradient: 'none',
  }},
  sunset: {{
    bg: '#1a0a2e',
    bgSecondary: 'rgba(255,255,255,0.06)',
    text: '#ffffff',
    textSecondary: 'rgba(255,255,255,0.75)',
    accent: '#f97316',
    accentGlow: 'rgba(249,115,22,0.3)',
    cardBg: 'rgba(255,255,255,0.08)',
    cardBorder: 'rgba(255,255,255,0.12)',
    navBg: 'rgba(255,255,255,0.1)',
    navHover: 'rgba(255,255,255,0.18)',
    dotInactive: 'rgba(255,255,255,0.25)',
    gradient: 'linear-gradient(135deg, #f97316 0%, #ec4899 50%, #8b5cf6 100%)',
  }},
  forest: {{
    bg: '#064e3b',
    bgSecondary: 'rgba(255,255,255,0.06)',
    text: '#ecfdf5',
    textSecondary: 'rgba(236,253,245,0.7)',
    accent: '#fbbf24',
    accentGlow: 'rgba(251,191,36,0.3)',
    cardBg: 'rgba(255,255,255,0.07)',
    cardBorder: 'rgba(255,255,255,0.1)',
    navBg: 'rgba(255,255,255,0.08)',
    navHover: 'rgba(255,255,255,0.15)',
    dotInactive: 'rgba(255,255,255,0.25)',
    gradient: 'none',
  }},
  electric: {{
    bg: '#0a0a0a',
    bgSecondary: 'rgba(255,255,255,0.04)',
    text: '#e0e0e0',
    textSecondary: 'rgba(224,224,224,0.6)',
    accent: '#00ff88',
    accentGlow: 'rgba(0,255,136,0.25)',
    cardBg: 'rgba(0,255,136,0.05)',
    cardBorder: 'rgba(0,255,136,0.15)',
    navBg: 'rgba(255,255,255,0.06)',
    navHover: 'rgba(0,255,136,0.12)',
    dotInactive: 'rgba(255,255,255,0.2)',
    gradient: 'none',
  }},
}};

let currentSlide = 0;
let currentTheme = DECK.theme || 'midnight';

function applyTheme(name) {{
  const t = THEMES[name];
  if (!t) return;
  currentTheme = name;
  const r = document.documentElement.style;
  r.setProperty('--bg', t.bg);
  r.setProperty('--bg-secondary', t.bgSecondary);
  r.setProperty('--text', t.text);
  r.setProperty('--text-secondary', t.textSecondary);
  r.setProperty('--accent', t.accent);
  r.setProperty('--accent-glow', t.accentGlow);
  r.setProperty('--card-bg', t.cardBg);
  r.setProperty('--card-border', t.cardBorder);
  r.setProperty('--nav-bg', t.navBg);
  r.setProperty('--nav-hover', t.navHover);
  r.setProperty('--dot-inactive', t.dotInactive);
  r.setProperty('--gradient', t.gradient);
  document.body.style.background = t.gradient !== 'none' ? t.gradient : t.bg;

  // Update active theme dot
  document.querySelectorAll('.theme-dot').forEach(d => {{
    d.classList.toggle('active', d.dataset.theme === name);
    // For clean theme, adjust border colors
    if (name === 'clean') {{
      d.style.borderColor = d.dataset.theme === name ? '#1e293b' : 'rgba(0,0,0,0.2)';
    }} else {{
      d.style.borderColor = d.dataset.theme === name ? '#fff' : 'rgba(255,255,255,0.3)';
      if (d.dataset.theme === 'clean') d.style.borderColor = 'rgba(255,255,255,0.5)';
    }}
  }});
}}

function renderSlideHTML(slide, index) {{
  const icon = slide.icon || '';
  const isTitle = slide.type === 'title';
  const hasMetrics = ['market', 'business_model', 'traction', 'ask'].includes(slide.type);
  const hasBullets = ['problem', 'solution', 'product', 'team', 'custom'].includes(slide.type);

  if (isTitle) {{
    return `
      <div class="slide slide-title ${{index === currentSlide ? 'active' : ''}}" data-index="${{index}}">
        <span class="slide-icon">${{icon}}</span>
        <h1>${{slide.title}}</h1>
        <p class="subtitle">${{slide.subtitle || ''}}</p>
      </div>`;
  }}

  let bulletsHTML = '';
  if ((hasBullets || slide.bullets) && slide.bullets) {{
    bulletsHTML = `<ul class="bullet-list">${{
      slide.bullets.map(b => `<li>${{b}}</li>`).join('')
    }}</ul>`;
  }}

  let metricsHTML = '';
  if ((hasMetrics || slide.metrics) && slide.metrics) {{
    metricsHTML = `<div class="metrics-row">${{
      slide.metrics.map(m => `
        <div class="metric-card">
          <div class="metric-value">${{m.value}}</div>
          <div class="metric-label">${{m.label}}</div>
          <div class="metric-desc">${{m.description || ''}}</div>
        </div>`).join('')
    }}</div>`;
  }}

  return `
    <div class="slide slide-content ${{index === currentSlide ? 'active' : ''}}" data-index="${{index}}">
      <span class="slide-icon">${{icon}}</span>
      <h2>${{slide.title}}</h2>
      <p class="body-text">${{slide.content || ''}}</p>
      ${{bulletsHTML}}
      ${{metricsHTML}}
    </div>`;
}}

function goToSlide(index) {{
  const slides = document.querySelectorAll('.slide');
  const total = DECK.slides.length;
  if (index < 0 || index >= total) return;

  const prev = currentSlide;
  currentSlide = index;

  slides.forEach((el, i) => {{
    el.classList.remove('active', 'exit-left');
    if (i === currentSlide) {{
      el.classList.add('active');
    }} else if (i === prev && prev < currentSlide) {{
      el.classList.add('exit-left');
    }}
  }});

  // Update counter
  const counter = document.querySelector('.slide-counter');
  if (counter) counter.textContent = `${{currentSlide + 1}} / ${{total}}`;

  // Update dots
  document.querySelectorAll('.dot').forEach((d, i) => {{
    d.classList.toggle('active', i === currentSlide);
  }});

  // Update arrow states
  const prevBtn = document.querySelector('.nav-arrow.prev');
  const nextBtn = document.querySelector('.nav-arrow.next');
  if (prevBtn) prevBtn.disabled = currentSlide === 0;
  if (nextBtn) nextBtn.disabled = currentSlide === total - 1;
}}

function render() {{
  const app = document.getElementById('app');
  const total = DECK.slides.length;

  // Theme switcher
  const themeSwitcher = `<div class="theme-switcher">
    ${{Object.keys(THEMES).map(name =>
      `<div class="theme-dot ${{name === currentTheme ? 'active' : ''}}" data-theme="${{name}}" title="${{name}}"></div>`
    ).join('')}}
  </div>`;

  // Slide counter
  const counter = `<div class="slide-counter">${{currentSlide + 1}} / ${{total}}</div>`;

  // Navigation arrows
  const arrows = `
    <button class="nav-arrow prev" ${{currentSlide === 0 ? 'disabled' : ''}} aria-label="Previous slide">&#8249;</button>
    <button class="nav-arrow next" ${{currentSlide === total - 1 ? 'disabled' : ''}} aria-label="Next slide">&#8250;</button>`;

  // Dots
  const dots = `<div class="dots">
    ${{DECK.slides.map((_, i) =>
      `<div class="dot ${{i === currentSlide ? 'active' : ''}}" data-index="${{i}}"></div>`
    ).join('')}}
  </div>`;

  // Slides
  const slidesHTML = `<div class="slides-viewport">
    ${{DECK.slides.map((s, i) => renderSlideHTML(s, i)).join('')}}
  </div>`;

  app.innerHTML = themeSwitcher + counter + arrows + slidesHTML + dots;

  // Event listeners
  document.querySelector('.nav-arrow.prev').addEventListener('click', () => goToSlide(currentSlide - 1));
  document.querySelector('.nav-arrow.next').addEventListener('click', () => goToSlide(currentSlide + 1));

  document.querySelectorAll('.dot').forEach(d => {{
    d.addEventListener('click', () => goToSlide(parseInt(d.dataset.index)));
  }});

  document.querySelectorAll('.theme-dot').forEach(d => {{
    d.addEventListener('click', () => applyTheme(d.dataset.theme));
  }});
}}

// Initialize
applyTheme(currentTheme);
render();

// Keyboard navigation
document.addEventListener('keydown', (e) => {{
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {{
    e.preventDefault();
    goToSlide(currentSlide + 1);
  }} else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {{
    e.preventDefault();
    goToSlide(currentSlide - 1);
  }}
}});
</script>
</body>
</html>"""
