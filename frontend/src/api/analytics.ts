import { apiFetch } from './client';
import { SiteAnalyticsRecord, SiteAnalyticsCreateInput } from '../types/analytics';

export const analyticsApi = {
  async getAnalytics(siteId: string): Promise<SiteAnalyticsRecord[]> {
    return apiFetch<SiteAnalyticsRecord[]>(`/sites/${siteId}/analytics`, {
      method: 'GET',
    });
  },

  async addAnalytics(
    siteId: string,
    input: SiteAnalyticsCreateInput
  ): Promise<SiteAnalyticsRecord> {
    return apiFetch<SiteAnalyticsRecord>(`/sites/${siteId}/analytics`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
};
