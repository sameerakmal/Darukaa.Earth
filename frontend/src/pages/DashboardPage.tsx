import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/Layout/Navbar';
import { ProjectCard } from '../components/Projects/ProjectCard';
import { CreateProjectModal } from '../components/Projects/CreateProjectModal';
import { projectsApi } from '../api/projects';
import { sitesApi } from '../api/sites';
import { Project, ProjectCreateInput } from '../types/project';
import { Plus, Search, FolderPlus, Loader2, AlertCircle } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await projectsApi.getProjects();

      // Fetch site counts for each project
      const projectsWithSiteCounts = await Promise.all(
        data.map(async (p) => {
          try {
            const sites = await sitesApi.getSites(p.id);
            return { ...p, site_count: sites.length };
          } catch {
            return { ...p, site_count: 0 };
          }
        })
      );

      setProjects(projectsWithSiteCounts);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (input: ProjectCreateInput) => {
    const newProject = await projectsApi.createProject(input);
    setProjects((prev) => [{ ...newProject, site_count: 0 }, ...prev]);
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await projectsApi.deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete project');
    }
  };

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.project_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Projects Overview</h1>
            <p className="text-xs text-slate-400 mt-1">
              Manage geospatial carbon, reforestation, and biodiversity initiatives.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center space-x-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 px-4 py-2.5 rounded-xl font-semibold text-xs transition-colors shadow-lg shadow-emerald-950/40 self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Project</span>
          </button>
        </div>

        {/* Search & Stats Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects by name or type..."
              className="w-full bg-slate-900/80 border border-slate-800 text-slate-100 text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="text-xs text-slate-400 font-medium self-end sm:self-auto">
            Showing <span className="text-white font-semibold">{filteredProjects.length}</span> of{' '}
            <span className="text-white font-semibold">{projects.length}</span> projects
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
            <p className="text-xs font-medium">Loading projects...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-2xl text-center max-w-md mx-auto my-12">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-red-300 mb-1">Failed to load projects</p>
            <p className="text-xs text-red-400/80 mb-4">{error}</p>
            <button
              onClick={fetchProjects}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="border border-dashed border-slate-800 rounded-2xl p-12 text-center max-w-md mx-auto my-12 bg-slate-900/20">
            <div className="w-12 h-12 rounded-xl bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto mb-4 border border-slate-700/50">
              <FolderPlus className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              {searchQuery ? 'No matching projects' : 'No projects created yet'}
            </h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              {searchQuery
                ? `No projects match "${searchQuery}". Try clearing your search filter.`
                : 'Create your first geospatial project to add sites and draw polygon boundaries.'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center space-x-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 px-4 py-2 rounded-lg font-semibold text-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create First Project</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} onDelete={handleDeleteProject} />
            ))}
          </div>
        )}
      </main>

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateProject}
      />
    </div>
  );
};
