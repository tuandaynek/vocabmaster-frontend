VocabAI - Comprehensive Design System & UI/UX Guidelines (Grammar Quest & Core Platform)

Document Version: 2.0 (Production Grade)
Core Objective: Establish an unbreakable visual contract for all AI code generators (GitHub Copilot, Claude, ChatGPT) to maintain a Cute, Bright, Pastel, Gamified (Duolingo-inspired) UI tailored for Vietnamese students (ages 11–18).

1. DESIGN PHILOSOPHY & VIBE

Emotional Tone: Encouraging, playful, rewarding, friendly, and stress-free. Learning feels like playing a game.

Visual References: Duolingo, Kahoot, Quizizz, modern educational web apps.

Strict Prohibition: NO dark mode, NO cyberpunk neon, NO deep purple/black cyberpunk themes, NO sharp angular cards (rounded-none or rounded-sm is banned unless specified for inner badges).

2. COLOR SYSTEM & PALETTE (Tailwind CSS Mappings)

Backgrounds (Canvas)

Main Page Background: bg-slate-50 or bg-amber-50/20 (Clean, soft cream/slate white).

Card Background: bg-white with crisp border definition.

Modal Overlay: bg-slate-900/40 backdrop-blur-sm (Soft translucent overlay for popups).

Brand & Action Colors

Primary / Success (Fresh Mint):

Base: bg-emerald-500 hover:bg-emerald-600 text-white

Soft Container: bg-emerald-50 text-emerald-800 border border-emerald-200

Secondary / XP / Coins (Sunny Amber & Warm Orange):

Base: bg-amber-400 hover:bg-amber-500 text-amber-950

Soft Container: bg-amber-50 text-amber-800 border border-amber-200

Danger / Lives / Errors (Soft Coral Rose):

Base: bg-rose-500 hover:bg-rose-600 text-white

Soft Container: bg-rose-50 text-rose-700 border border-rose-200

Info / Special Actions (Sky Blue):

Base: bg-sky-400 hover:bg-sky-500 text-white

Soft Container: bg-sky-50 text-sky-800 border border-sky-200

Fun / Mastery (Playful Purple / Lavender):

Base: bg-violet-500 hover:bg-violet-600 text-white

Soft Container: bg-violet-50 text-violet-800 border border-violet-200

Typography Colors

Headings & Primary Text: text-slate-800 (Never use pure black #000000).

Body & Secondary Text: text-slate-600.

Subtle / Disabled / Hints: text-slate-400.

3. TYPOGRAPHY & SPACING RULES

Font Family: Clean Sans-Serif (font-sans, Inter, Plus Jakarta Sans, or system-ui).

Font Weights:

Regular text: font-normal (400) or font-medium (500).

Emphasis / Labels: font-semibold (600).

Headings / Stats / Buttons: font-bold (700) or font-extrabold (800).

Spacing / Padding: Generous padding to avoid cramped layouts. Use p-6 or p-8 for major containers, p-4 for inner cards.

4. COMPONENT BLUEPRINTS & TAILWIND UTILITY CLASSES

4.1. Buttons (3D Bouncy Interactive Buttons)

All primary and secondary buttons must have a physical 3D "bouncy" press effect using bottom border shadows (border-b-4):

Primary Action (Mint):

// Class string
"px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 active:translate-y-1 active:border-b-0 border-b-4 border-emerald-700 text-white font-bold rounded-2xl shadow-sm transition-all duration-150 cursor-pointer flex items-center justify-center gap-2"


Secondary Action (Amber / Yellow):

// Class string
"px-6 py-3.5 bg-amber-400 hover:bg-amber-500 active:translate-y-1 active:border-b-0 border-b-4 border-amber-600 text-amber-950 font-bold rounded-2xl shadow-sm transition-all duration-150 cursor-pointer flex items-center justify-center gap-2"


Neutral / Cancel Button:

// Class string
"px-6 py-3.5 bg-white hover:bg-slate-100 active:translate-y-1 active:border-b-0 border-2 border-b-4 border-slate-200 text-slate-700 font-bold rounded-2xl transition-all duration-150 cursor-pointer flex items-center justify-center gap-2"


4.2. Cards & Containers

Standard Card:

"p-6 bg-white border-2 border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow"


Interactive Game Word Blocks (cho phần Sentence Puzzle):

"px-4 py-3 bg-white border-2 border-b-4 border-slate-200 hover:border-emerald-400 text-slate-800 font-bold rounded-2xl shadow-sm cursor-pointer active:scale-95 transition-all select-none text-center"


Selected/Placed Word Block:

"px-4 py-3 bg-emerald-50 border-2 border-emerald-400 text-emerald-800 font-bold rounded-2xl shadow-inner cursor-pointer animate-pop"


4.3. Status Badges & Game Stats (Header Bar)

Streak 🔥:

"px-4 py-2 bg-orange-50 border border-orange-200 text-orange-600 font-extrabold rounded-full flex items-center gap-2 shadow-sm"


Lives ❤️ (Tim):

"px-4 py-2 bg-rose-50 border border-rose-200 text-rose-600 font-extrabold rounded-full flex items-center gap-2 shadow-sm"


XP ⚡ / Score:

"px-4 py-2 bg-amber-50 border border-amber-200 text-amber-600 font-extrabold rounded-full flex items-center gap-2 shadow-sm"


5. ANIMATIONS & MICRO-INTERACTIONS

Hover scaling: transition-transform hover:scale-105 duration-200

Active clicking: active:scale-95

Success Pop: Smooth scale bounce when correct answers are submitted.

Error Shake: Shake effect on wrong inputs (animate-shake or custom keyframes).

6. STRICT RULES FOR AI CODE GENERATION

Never use raw unstyled HTML buttons (<button> without Tailwind classes).

Always apply rounded-2xl or rounded-3xl for modern playful aesthetics.

Always include icons (Lucide React icons preferred, e.g., Heart, Flame, Zap, Check, X, ArrowRight) to make buttons and cards feel alive.

When writing game screens (like Grammar Quest games), separate logic from clean JSX presentation components adhering strictly to this color palette.