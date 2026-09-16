import { apiFetch } from './client';
import { Project, ProjectCreateInput, ProjectUpdateInput } from '../types/project';

export const projectsApi = {
  async getProjects(): Promise<Project[]> {
    return apiFetch<Project[]>('/projects', {
      method: 'GET',
    });
  },

  async getProject(projectId: string): Promise<Project> {
    return apiFetch<Project>(`/projects/${projectId}`, {
      method: 'GET',
    });
  },

  async createProject(input: ProjectCreateInput): Promise<Project> {
    return apiFetch<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  async updateProject(projectId: string, input: ProjectUpdateInput): Promise<Project> {
    return apiFetch<Project>(`/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  },

  async deleteProject(projectId: string): Promise<void> {
    await apiFetch<void>(`/projects/${projectId}`, {
      method: 'DELETE',
    });
  },
};
