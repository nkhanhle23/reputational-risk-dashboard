export interface Company {
  company_id: string
  ticker: string
  company_name: string
  sector: string
  location: string
  n_articles: number
  n_peaks: number
}

export interface EventStudy {
  event_date: string | null
  dominant_emotion: string
  primary_category: string
  max_z: number
  duration_days: number
  alpha: number
  beta: number
  resid_std: number
  n_est: number
  n_event_days: number
  car: number
  car_post: number
  scar: number
  ar_day_0: number
  ar_day_1: number
  ar_day_2: number
  ar_day_3: number
  ar_day_4: number
  ar_day_5: number
  ar_day_6: number
}

export interface Peak {
  peak_id: string
  ticker: string
  start_date: string
  end_date: string
  duration_days: number
  max_anger_z: number
  max_sadness_z: number
  max_fear_z: number
  max_disgust_z: number
  max_z: number
  dominant_emotion: string
  total_articles: number
  company_name: string
  primary_category: string
  event_study: EventStudy | null
}

export interface CategoryEvolutionPoint {
  Communication: number
  Governance: number
  'IT/Data': number
  Legal: number
  Personnel: number
  Processes: number
  Products: number
  article_count: number
  date: string
  day_offset: number
}

export interface PeakDetail extends Peak {
  category_evolution: CategoryEvolutionPoint[]
}

export interface Article {
  article_id: number
  title: string
  summary: string
  section: string
  published_date: string
  url: string
  predicted_category: string | null
  is_ambiguous: boolean | null
  top_score: number | null
}

export interface CompanyDetail {
  company: Company
  peaks: Peak[]
  articles: Article[]
}

export interface CrosstabRow {
  Category: string
  Emotion: string
  n: number
  'Mean CAR': number
  'Mean CAR %': string
  '% Negative': string
  'Wilcoxon p': number
  Wilcoxon: string
  't-test p': number
  't-test': string
  'Wilcoxon p (FDR)': number
  'Raw sig': string | null
  'FDR sig': string | null
}

export interface Overview {
  summary: {
    methodology: Record<string, string>
    parameters: Record<string, number | string>
    tier_hierarchy: Record<string, string[]>
    full_dataset: {
      total_articles_scored: number
      no_event_filtered: number
      no_event_filtered_pct: number
      total_articles: number
      ambiguous_cases: number
      ambiguous_percentage: number
      clear_cases: number
      category_distribution: Record<string, number>
    }
    validation_subset: Record<string, number>
  }
  n_articles: number
  n_companies: number
  n_peaks: number
  n_event_studies: number
}

const API_BASE = import.meta.env.VITE_API_URL ?? '/api'

async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`)
  if (!res.ok) {
    throw new Error(`${path} failed: ${res.status}`)
  }
  return res.json() as Promise<T>
}

export const api = {
  overview: () => getJSON<Overview>('/stats/overview'),
  crosstab: () => getJSON<CrosstabRow[]>('/stats/crosstab'),
  companies: () => getJSON<Company[]>('/companies'),
  companyDetail: (companyId: string) => getJSON<CompanyDetail>(`/companies/${companyId}`),
  peakDetail: (peakId: string) => getJSON<PeakDetail>(`/peaks/${peakId}`),
}
