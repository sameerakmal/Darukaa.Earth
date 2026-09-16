export interface SiteAnalyticsRecord {
  id: string;
  site_id: string;
  date: string;
  carbon_value: number;
  biodiversity_score: number;
}

export interface SiteAnalyticsCreateInput {
  date?: string;
  carbon_value: number;
  biodiversity_score: number;
}
