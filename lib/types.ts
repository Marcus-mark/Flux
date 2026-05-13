export type SignalTier = 'CRITICAL' | 'HIGH' | 'MEDIUM';

export type SignalState = 'unread' | 'active' | 'viewed' | 'saved' | 'acted' | 'dismissed';

export type SignalTag =
  | 'API Change'
  | 'Product Launch'
  | 'Integration'
  | 'Funding'
  | 'SDK Release'
  | 'Competitor Move'
  | 'Model Release'
  | 'Research';

export interface Signal {
  id: string;
  tier: SignalTier;
  score: number;
  headline: string;
  source: string;
  timestamp: string;
  tag: SignalTag;
  state: SignalState;
}

export interface BriefingSection {
  type: 'what_changed' | 'why_it_matters' | 'what_to_consider';
  text: string;
  prompts?: string[];
}

export interface SourceRef {
  name: string;
  url: string;
  label: string;
}

export interface Briefing {
  signalId: string;
  openingStatement: string;
  sections: BriefingSection[];
  reasoningText: string;
  sources: SourceRef[];
  relatedSignals?: string[];
  timeline?: { date: string; event: string }[];
}

export interface UserContext {
  role: string;
  interests: string[];
  watchlist: string[];
  threshold: number;
}
