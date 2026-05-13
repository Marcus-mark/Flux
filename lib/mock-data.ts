import type { Briefing, Signal } from '@/lib/types'

export const mockSignals: Signal[] = [
  {
    id: 'sig-1',
    tier: 'CRITICAL',
    score: 94,
    headline: 'OpenAI removes GPT-4 from API — all calls rerouting to GPT-4o',
    source: 'OpenAI',
    timestamp: '1h ago',
    tag: 'API Change',
    state: 'unread',
  },
  {
    id: 'sig-2',
    tier: 'HIGH',
    score: 83,
    headline: 'Mistral launches Le Chat Pro with code interpreter and web access',
    source: 'Mistral',
    timestamp: '2h ago',
    tag: 'Product Launch',
    state: 'unread',
  },
  {
    id: 'sig-3',
    tier: 'HIGH',
    score: 77,
    headline: 'GitHub Copilot adds Claude 3.5 Sonnet as selectable model in VS Code',
    source: 'GitHub',
    timestamp: '3h ago',
    tag: 'Integration',
    state: 'unread',
  },
  {
    id: 'sig-4',
    tier: 'MEDIUM',
    score: 64,
    headline: 'Perplexity raises $500M at $9B valuation — doubles enterprise focus',
    source: 'Perplexity',
    timestamp: '4h ago',
    tag: 'Funding',
    state: 'unread',
  },
  {
    id: 'sig-5',
    tier: 'MEDIUM',
    score: 58,
    headline: 'Replit releases Agent SDK for third-party tool integration',
    source: 'Replit',
    timestamp: '5h ago',
    tag: 'SDK Release',
    state: 'unread',
  },
]

export const mockBriefings: Record<string, Briefing> = {
  'sig-1': {
    signalId: 'sig-1',
    openingStatement:
      'OpenAI just removed GPT-4 from the API with no migration window. If your product calls gpt-4, it is already affected.',
    sections: [
      {
        type: 'what_changed',
        text: 'OpenAI deprecated gpt-4 API access across all tiers. Calls now route silently to gpt-4o. No warning. No opt-out. Live now.',
      },
      {
        type: 'why_it_matters',
        text: 'Silent rerouting means your output behaviour has already changed. GPT-4o is a different model — prompts validated on GPT-4 will drift.',
      },
      {
        type: 'what_to_consider',
        text: '',
        prompts: [
          'Audit codebase for gpt-4 model strings today.',
          'Run regression tests against gpt-4o on your core prompts.',
          'If GPT-4 consistency was in your pitch, update it now.',
        ],
      },
    ],
    reasoningText:
      'Domain match: direct API deprecation in AI tooling. Novelty: forced migration with no window. User context: API integrations flagged as priority. Time sensitivity: rerouting is live now. Source credibility: primary source confirmed by two outlets.',
    sources: [
      { name: 'OpenAI status page', url: '#', label: '→ Read post' },
      { name: 'TechCrunch', url: '#', label: '→ Read article' },
    ],
    relatedSignals: [
      'Developers report output drift after GPT-4→GPT-4o reroute · HN · 2h ago',
      'OpenAI deprecates gpt-4-0314 and gpt-4-0613 endpoints · OpenAI · 3h ago',
    ],
    timeline: [
      {
        date: 'Mar 2024',
        event: 'GPT-4 Turbo replaced GPT-4 as default. Silent migration. Developer backlash within 48hrs.',
      },
      {
        date: 'Nov 2023',
        event: 'GPT-4 pricing cut 3x. Triggered competitive repricing at Anthropic and Mistral.',
      },
    ],
  },

  'sig-2': {
    signalId: 'sig-2',
    openingStatement:
      'Mistral just shipped a Pro tier with a code interpreter and live web access. Le Chat is no longer just a chatbot — it is a direct Copilot competitor.',
    sections: [
      {
        type: 'what_changed',
        text: 'Mistral launched Le Chat Pro at €14.99/month. New capabilities include a sandboxed Python code interpreter, live web search, and file uploads up to 50MB. The free tier retains basic chat only. Enterprise pricing available on request.',
      },
      {
        type: 'why_it_matters',
        text: 'Mistral is the first European frontier lab to ship a full-stack productivity assistant. Le Chat Pro now overlaps with GitHub Copilot, Cursor, and Claude.ai Pro on feature surface. European enterprises under GDPR pressure have a credible domestic alternative for the first time.',
      },
      {
        type: 'what_to_consider',
        text: '',
        prompts: [
          'If your product targets European enterprise, Mistral is now a legitimate procurement alternative — update your competitive positioning.',
          'The code interpreter runs sandboxed Python. Compare directly against your own interpreter or tool-use offering.',
          'Web access is powered by Brave Search. Evaluate source quality versus Perplexity and Bing-backed competitors.',
        ],
      },
    ],
    reasoningText:
      'Domain match: direct product launch in AI assistant space. Novelty: first European frontier model with full productivity suite. Competitive relevance: overlaps with Copilot, Claude.ai Pro, and Cursor. Time sensitivity: Pro subscriptions are live, pricing is set.',
    sources: [
      { name: 'Mistral blog', url: '#', label: '→ Read announcement' },
      { name: 'The Verge', url: '#', label: '→ Read coverage' },
    ],
    relatedSignals: [
      'Mistral AI raises €600M Series B at €6B valuation · TechCrunch · 3d ago',
      'Le Chat hits 1M users in first month · Mistral · 1w ago',
    ],
    timeline: [
      {
        date: 'Feb 2024',
        event: 'Le Chat launched as free chatbot. Positioned as European ChatGPT alternative.',
      },
      {
        date: 'Dec 2023',
        event: 'Mistral Medium released via API. Matched GPT-3.5 on MMLU at lower cost.',
      },
    ],
  },

  'sig-3': {
    signalId: 'sig-3',
    openingStatement:
      'GitHub just added Claude 3.5 Sonnet to Copilot inside VS Code. Developers can now switch models mid-session without leaving the editor.',
    sections: [
      {
        type: 'what_changed',
        text: 'GitHub Copilot Chat in VS Code now supports model selection from a dropdown. Available models: GPT-4o, GPT-4 Turbo, Claude 3.5 Sonnet, and o1-preview. The selected model persists per workspace. Copilot completions (inline autocomplete) remain GPT-4o only for now.',
      },
      {
        type: 'why_it_matters',
        text: 'Model selection in Copilot is a structural shift. GitHub is moving from a single-model product to a model router. This normalises multi-model workflows for the 1.8M paid Copilot users. Anthropic gains distribution inside the most-used developer tool in the world without a direct sales motion.',
      },
      {
        type: 'what_to_consider',
        text: '',
        prompts: [
          'If you sell developer tooling, Copilot model-switching raises the baseline expectation — your product may need to offer model choice too.',
          "Claude 3.5 Sonnet's inclusion validates Anthropic's enterprise go-to-market via platform partnerships. Watch for JetBrains and Neovim integrations next.",
          'o1-preview inclusion alongside Claude signals GitHub is positioning Copilot as a router, not a model.',
        ],
      },
    ],
    reasoningText:
      'Domain match: direct integration of a tracked model (Claude 3.5 Sonnet) into a core developer tool. Novelty: first time Copilot supports non-OpenAI models in production. Distribution impact: 1.8M paid seats. Time sensitivity: rolling out to all users this week.',
    sources: [
      { name: 'GitHub Changelog', url: '#', label: '→ Read changelog' },
      { name: 'GitHub Blog', url: '#', label: '→ Read announcement' },
    ],
    relatedSignals: [
      'Anthropic announces GitHub as official Copilot model partner · Anthropic · 1d ago',
      'VS Code 1.90 adds model picker API for extensions · Microsoft · 5d ago',
    ],
    timeline: [
      {
        date: 'Nov 2023',
        event: 'GitHub Copilot Chat goes GA. GPT-4 only. 1M paid users at launch.',
      },
      {
        date: 'Jun 2023',
        event: 'GitHub Copilot X announced. Promised multi-model future. Never shipped.',
      },
    ],
  },

  'sig-4': {
    signalId: 'sig-4',
    openingStatement:
      'Perplexity just closed $500M at a $9B valuation with a hard pivot to enterprise. They are no longer just a consumer search product.',
    sections: [
      {
        type: 'what_changed',
        text: 'Perplexity AI closed a $500M Series D at a $9B valuation. The round was led by Accel, with participation from SoftBank and Jeff Bezos. The announcement confirms a new Perplexity Enterprise One tier with SOC 2 compliance, private deployment, and admin controls. Consumer product remains free.',
      },
      {
        type: 'why_it_matters',
        text: 'At $9B Perplexity is now valued above Mistral and Cohere combined. The enterprise pivot is a direct attack on Microsoft Copilot for Search and Google Workspace. Their distribution edge — a clean answer-layer UI that non-technical users adopt without training — is now being productised for B2B procurement. This changes their competitive surface area significantly.',
      },
      {
        type: 'what_to_consider',
        text: '',
        prompts: [
          'If your product competes on enterprise search or knowledge retrieval, Perplexity Enterprise One is now a named competitor in RFPs.',
          'The Bezos and SoftBank participation signals international expansion — Japan and Southeast Asia likely next.',
          'SOC 2 + private deployment removes the last procurement objection for regulated industries. Healthcare and finance deals are now unlocked.',
        ],
      },
    ],
    reasoningText:
      'Domain match: major funding round in AI search, directly adjacent to core tracking area. Novelty: enterprise pivot with named product is new strategic direction, not iteration. Competitive relevance: Perplexity Enterprise One enters the same RFP category as several watchlisted products.',
    sources: [
      { name: 'Perplexity blog', url: '#', label: '→ Read announcement' },
      { name: 'Bloomberg', url: '#', label: '→ Read article' },
    ],
    relatedSignals: [
      'Perplexity hits 100M monthly queries — up from 10M in January · TechCrunch · 2w ago',
      'Google fires back with AI Overviews GA rollout · Google · 3d ago',
    ],
    timeline: [
      {
        date: 'Jan 2024',
        event: 'Perplexity raised $73.6M Series B at $520M valuation. First institutional round.',
      },
      {
        date: 'Apr 2023',
        event: 'Perplexity launches Pro tier at $20/month. First monetisation attempt.',
      },
    ],
  },

  'sig-5': {
    signalId: 'sig-5',
    openingStatement:
      'Replit just shipped an Agent SDK that lets any third-party tool embed a code-generating agent into their product. The moat they are building is distribution, not the model.',
    sections: [
      {
        type: 'what_changed',
        text: 'Replit released the Agent SDK in public beta. It exposes a set of APIs allowing external developers to embed Replit Agent — code generation, file system access, shell execution, and live preview — into their own products. Pricing is usage-based at $0.05 per agent-minute. No self-hosting option.',
      },
      {
        type: 'why_it_matters',
        text: 'Replit Agent SDK turns a consumer coding product into a platform. Any product can now embed a fully sandboxed coding agent without building one. This competes directly with E2B, Modal, and Daytona in the sandbox infrastructure space — but Replit brings its own model fine-tuned on 30B lines of code. The usage-based pricing is aggressive enough to undercut pure infrastructure plays.',
      },
      {
        type: 'what_to_consider',
        text: '',
        prompts: [
          'If you are building or considering a code-generation feature, evaluate Replit Agent SDK against E2B and Modal before committing to infra.',
          '$0.05 per agent-minute is low enough for async batch workloads but expensive for long-running interactive sessions — model your cost at target volume.',
          "Replit's no-self-hosting constraint is a dealbreaker for enterprise customers with data residency requirements. Note this in competitive comparisons.",
        ],
      },
    ],
    reasoningText:
      'Domain match: SDK release in agentic coding, a tracked strategic area. Novelty: first time Replit has exposed agent capabilities via API to external developers. Competitive relevance: directly competes with E2B and sandboxed coding infra watchlisted products. Time sensitivity: public beta pricing may change at GA.',
    sources: [
      { name: 'Replit blog', url: '#', label: '→ Read announcement' },
      { name: 'Hacker News thread', url: '#', label: '→ Read discussion' },
    ],
    relatedSignals: [
      'E2B raises $3M seed to build open-source code sandboxes · TechCrunch · 1w ago',
      'Replit Agent hits 500K users in first 30 days · Replit · 2w ago',
    ],
    timeline: [
      {
        date: 'Sep 2023',
        event: 'Replit Agent launched in private beta. Generated complete apps from natural language prompts.',
      },
      {
        date: 'Jun 2023',
        event: 'Replit raised $97.4M Series B. Announced AI-first pivot, deprecated legacy IDE features.',
      },
    ],
  },
}
