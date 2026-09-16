import { apiFetch } from './client';
import { Site, SiteCreateInput, SiteUpdateInput } from '../types/site';

export const sitesApi = {
  async getSites(projectId: string): Promise<Site[]> {
    return apiFetch<Site[]>(`/projects/${projectId}/sites`, {
      method: 'GET',
    });
  },

  async getSite(siteId: string): Promise<Site> {
    return apiFetch<Site>(`/sites/${siteId}`, {
      method: 'GET',
    });
  },

  async createSite(projectId: string, input: SiteCreateInput): Promise<Site> {
    return apiFetch<Site>(`/projects/${projectId}/sites`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  async updateSite(siteId: string, input: SiteUpdateInput): Promise<Site> {
    return apiFetch<Site>(`/sites/${siteId}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  },

  async deleteSite(siteId: string): Promise<void> {
    await apiFetch<void>(`/sites/${siteId}`, {
      method: 'DELETE',
    });
  },
};
