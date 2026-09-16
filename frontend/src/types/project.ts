export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  project_type: string;
  status: string;
  site_count?: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectCreateInput {
  name: string;
  description?: string;
  project_type?: string;
  status?: string;
}

export interface ProjectUpdateInput {
  name?: string;
  description?: string;
  project_type?: string;
  status?: string;
}
