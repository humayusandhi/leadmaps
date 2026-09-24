/**
 * LeadMap AI — Shared TypeScript Contracts & DTOs
 */

export type DataProvenance = 'PROVIDER' | 'OBSERVED' | 'DERIVED' | 'AI_INFERENCE';

export type WorkspaceRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

export type LeadStatus =
  | 'NEW'
  | 'RESEARCHED'
  | 'AUDITED'
  | 'PITCH_READY'
  | 'CONTACTED'
  | 'REPLIED'
  | 'QUALIFIED'
  | 'MEETING'
  | 'WON'
  | 'LOST'
  | 'UNQUALIFIED';

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
  reviews_count?: number;
  address?: string;
  email?: string | null;
  latitude: number;
  longitude: number;
  is_saved?: boolean;
}

export type SearchStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface SearchCriteriaDTO {
  category: string;
  location: string;
  radius_km: number;
  has_website?: boolean;
  min_rating?: number;
  min_reviews?: number;
}

export interface SearchDTO {
  id: string;
  workspace_id: string;
  user_id: string;
  query: string;
  category: string;
  location: string;
  radius_km: number;
  status: SearchStatus;
  total_results: number;
  created_at: string;
  businesses?: BusinessDTO[];
}

export type AnalysisStatus =
  | 'pending'
  | 'crawling'
  | 'completed'
  | 'failed'
  | 'PENDING'
  | 'ANALYZING'
  | 'COMPLETED'
  | 'FAILED';

export interface WebsiteAnalysisDTO {
  id: string;
  lead_id: string;
  status: AnalysisStatus;
  url?: string;
  target_url?: string;
  final_url?: string | null;
  http_status: number | null;
  load_time_ms: number | null;
  is_ssl_active?: boolean;
  https_enabled?: boolean;
  is_mobile_responsive?: boolean;
  mobile_friendly?: boolean;
  title_tag?: string | null;
  meta_description?: string | null;
  has_meta_description?: boolean;
  has_open_graph?: boolean;
  has_schema_markup?: boolean;
  schema_detected?: boolean;
  h1_count?: number;
  h1_tags?: string[] | null;
  has_cta?: boolean;
  contact_form_detected?: boolean;
  has_contact_form?: boolean;
  tel_link_detected?: boolean;
  has_tel_links?: boolean;
  whatsapp_detected?: boolean;
  has_whatsapp_chat?: boolean;
  booking_detected?: boolean;
  has_booking_embed?: boolean;
  cms_detected: string | null;
  error_message?: string | null;
  raw_signals?: Record<string, any>;
  raw_dom_signals?: Record<string, any>;
  scores?: {
    technical: number;
    seo: number;
    conversion: number;
  };
  crawled_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AIOpportunityDTO {
  id: string;
  category: OpportunityCategory | string;
  title?: string;
  opportunity?: string;
  evidence: string;
  suggested_service: string;
  confidence: OpportunityConfidence | string;
  points_estimated?: number;
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

export interface TagDTO {
  id: string;
  workspace_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface LeadNoteDTO {
  id: string;
  lead_id: string;
  user_id: string;
  user_name?: string;
  content: string;
  created_at: string;
}

export interface LeadDTO {
  id: string;
  workspace_id: string;
  business_id?: string;
  business: BusinessDTO;
  status: LeadStatus;
  lead_score: LeadScoreDTO | null;
  score_value?: number | null;
  analysis?: WebsiteAnalysisDTO;
  opportunities?: AIOpportunityDTO[];
  tags: (string | TagDTO)[];
  notes?: LeadNoteDTO[];
  notes_count: number;
  lists?: LeadListDTO[];
  outreach_drafts?: AiOutreachDraftDTO[];
  assigned_to_user_id?: string | null;
  assigned_user?: UserDTO | null;
  crm_sync_status?: CRMSyncStatus;
  crm_external_id?: string | null;
  crm_synced_at?: string | null;
  created_at: string;
  updated_at: string;
}

// Custom Lead Lists
export interface LeadListDTO {
  id: string;
  workspace_id: string;
  name: string;
  description: string | null;
  color: string;
  icon?: string | null;
  leads_count?: number;
  created_at: string;
  updated_at: string;
}

export interface LeadListItemDTO {
  id: string;
  lead_list_id: string;
  lead_id: string;
  added_by_user_id?: string | null;
  created_at: string;
}

export interface CreateLeadListRequest {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface UpdateLeadListRequest {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface AddLeadsToListRequest {
  lead_ids: string[];
}

// AI Outreach Synthesizer
export type OutreachChannel = 'email' | 'whatsapp' | 'linkedin';

export interface AiOutreachDraftDTO {
  id: string;
  workspace_id: string;
  lead_id: string;
  channel: OutreachChannel;
  subject: string | null;
  body: string;
  status: 'draft' | 'approved' | 'sent' | 'rejected';
  tokens_used: number;
  metadata?: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateOutreachDraftRequest {
  subject?: string | null;
  body: string;
  status?: 'draft' | 'approved' | 'sent' | 'rejected';
}

// CSV Export Engine
export type ExportField =
  | 'id'
  | 'business_name'
  | 'phone'
  | 'email'
  | 'website'
  | 'address'
  | 'city'
  | 'rating'
  | 'reviews_count'
  | 'lead_score'
  | 'status'
  | 'opportunities_count'
  | 'top_opportunity'
  | 'technical_deficit'
  | 'cms'
  | 'has_ssl'
  | 'mobile_responsive'
  | 'has_booking'
  | 'has_whatsapp';

export interface ExportJobDTO {
  id: string;
  workspace_id: string;
  user_id: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  type: string;
  file_path?: string | null;
  file_name?: string | null;
  row_count: number;
  filters?: Record<string, any> | null;
  columns?: ExportField[] | null;
  download_ready?: boolean;
  expires_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExportLeadsRequest {
  filters?: {
    list_id?: string;
    status?: string;
    min_score?: number;
    lead_ids?: string[];
  };
  columns?: ExportField[];
  direct_download?: boolean;
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

// Phase 8: Usage Credit Engine & Billing
export type CreditTransactionType =
  | 'MONTHLY_GRANT'
  | 'PURCHASE'
  | 'RESERVATION_HOLD'
  | 'CONSUMPTION'
  | 'REFUND'
  | 'ADJUSTMENT';

export interface CreditBalanceDTO {
  balance: number;
  reserved: number;
  available: number;
  lifetime_granted: number;
  lifetime_consumed: number;
}

export interface CreditTransactionDTO {
  id: string;
  workspace_id: string;
  amount: number;
  type: CreditTransactionType;
  description: string;
  reference_id?: string | null;
  balance_after: number;
  created_at: string;
}

export type SubscriptionTier = 'FREE' | 'STARTER' | 'GROWTH' | 'PRO' | 'AGENCY';

export interface PlanDTO {
  id: string;
  code: SubscriptionTier;
  name: string;
  price_inr: number;
  monthly_credits: number;
  features: string[];
  is_active?: boolean;
}

export interface SubscriptionDTO {
  id: string;
  workspace_id: string;
  plan_id: string;
  plan?: PlanDTO;
  provider: string;
  provider_subscription_id?: string | null;
  status: 'active' | 'pending' | 'past_due' | 'halted' | 'cancelled';
  current_period_start?: string | null;
  current_period_end?: string | null;
  cancelled_at?: string | null;
  created_at: string;
}

export interface BillingSummaryDTO {
  balance: number;
  reserved: number;
  available: number;
  lifetime_granted: number;
  lifetime_consumed: number;
  subscription: SubscriptionDTO | null;
  current_plan: PlanDTO;
}

export interface CreateCheckoutRequest {
  plan_code: SubscriptionTier;
}

export interface CheckoutResponse {
  subscription_id: string;
  checkout_url: string;
  key_id: string;
  amount: number;
  currency: string;
}

export interface TopUpRequest {
  pack: 'pack_100' | 'pack_500' | 'pack_2000';
}

// CRM Integrations (Phase 9)
export type CRMProvider = 'riffcrm' | 'hubspot' | 'salesforce' | 'mock' | 'webhook';
export type IntegrationStatus = 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
export type CRMSyncStatus = 'NOT_SYNCED' | 'SYNCING' | 'SYNCED' | 'FAILED';

export interface IntegrationDTO {
  id: string;
  workspace_id: string;
  provider: CRMProvider;
  name: string;
  status: IntegrationStatus;
  has_credentials: boolean;
  masked_api_key?: string | null;
  base_url?: string | null;
  settings?: {
    auto_sync_high_score?: boolean;
    score_threshold?: number;
    sync_tags?: boolean;
    pipeline_stage?: string;
    [key: string]: any;
  };
  last_synced_at?: string | null;
  created_at: string;
  updated_at: string;
  stats?: {
    total_syncs: number;
    successful_syncs: number;
    failed_syncs: number;
  };
}

export interface IntegrationLogDTO {
  id: string;
  event: string;
  status: 'SUCCESS' | 'FAILED';
  external_id?: string | null;
  lead_id?: string | null;
  business_name?: string | null;
  request_payload?: Record<string, any> | null;
  response_payload?: Record<string, any> | null;
  error_message?: string | null;
  created_at: string;
}

export interface ConnectIntegrationRequest {
  provider: CRMProvider;
  name?: string;
  credentials: {
    api_key: string;
    base_url?: string;
    [key: string]: any;
  };
  settings?: Record<string, any>;
  test_before_connect?: boolean;
}

export interface SyncLeadRequest {
  lead_id: string;
  sync_now?: boolean;
}

export interface SyncLeadResponse {
  lead_id: string;
  crm_sync_status?: CRMSyncStatus;
  crm_external_id?: string | null;
  crm_synced_at?: string | null;
  queued?: boolean;
  status?: string;
}


