/**
 * LeadMap AI — Shared TypeScript Contracts & DTOs
 */

export type DataProvenance = 'PROVIDER' | 'OBSERVED' | 'DERIVED' | 'AI_INFERENCE';

export type WorkspaceRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

export type LeadStatus =
  | 'NEW'
  | 'RESEARCHED'
  | 'CONTACTED'
  | 'REPLIED'
  | 'QUALIFIED'
  | 'MEETING'
  | 'WON'
  | 'LOST';

export type OpportunityCategory =
  | 'WEBSITE'
  | 'SEO'
  | 'LOCAL_SEO'
  | 'CONVERSION'
  | 'BOOKING'
  | 'WHATSAPP'
  | 'MOBILE'
  | 'PERFORMANCE'
  | 'ECOMMERCE'
  | 'CRM'
  | 'AUTOMATION'
  | 'DIGITAL_MARKETING'
  | 'SOFTWARE'
  | 'BRANDING'
  | 'UI_UX';

export type OpportunityConfidence = 'HIGH' | 'MEDIUM' | 'LOW';

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
}

export interface WorkspaceDTO {
  id: string;
  name: string;
  slug: string;
  tier: 'FREE' | 'STARTER' | 'GROWTH' | 'PRO' | 'AGENCY';
  credit_balance: number;
  created_at: string;
}

export interface BusinessDTO {
  id: string;
  google_place_id: string;
  name: string;
  formatted_address: string;
  city: string;
  country: string;
  phone_number: string | null;
  website_url: string | null;
  rating: number | null;
  review_count: number;
  latitude: number;
  longitude: number;
  is_saved?: boolean;
}

export interface WebsiteAnalysisDTO {
  id: string;
  lead_id: string;
  http_status: number;
  https_enabled: boolean;
  mobile_friendly: boolean;
  load_time_ms: number;
  title_tag: string | null;
  meta_description: string | null;
  h1_count: number;
  schema_detected: boolean;
  contact_form_detected: boolean;
  tel_link_detected: boolean;
  whatsapp_detected: boolean;
  booking_detected: boolean;
  cms_detected: string | null;
  scores: {
    technical: number;
    seo: number;
    conversion: number;
  };
  created_at: string;
}

export interface AIOpportunityDTO {
  id: string;
  category: OpportunityCategory;
  opportunity: string;
  evidence: string;
  suggested_service: string;
  confidence: OpportunityConfidence;
}

export interface ScoreWaterfallItem {
  dimension: string;
  awarded_points: number;
  max_points: number;
  rationale: string;
}

export interface LeadScoreDTO {
  total_score: number;
  breakdown: ScoreWaterfallItem[];
}

export interface LeadDTO {
  id: string;
  workspace_id: string;
  business: BusinessDTO;
  status: LeadStatus;
  lead_score: LeadScoreDTO | null;
  analysis?: WebsiteAnalysisDTO;
  opportunities?: AIOpportunityDTO[];
  tags: string[];
  notes_count: number;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string | null;
  meta?: {
    request_id: string;
    timestamp: string;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}
