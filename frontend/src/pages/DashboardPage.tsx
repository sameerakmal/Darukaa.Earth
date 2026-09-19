import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/Layout/Navbar';
import { ProjectCard } from '../components/Projects/ProjectCard';
import { CreateProjectModal } from '../components/Projects/CreateProjectModal';
import { projectsApi } from '../api/projects';
import { sitesApi } from '../api/sites';
import { Project, ProjectCreateInput } from '../types/project';
import {
  Plus,
  Search,
  FolderPlus,
  AlertCircle,
  MapPin,
  CheckCircle2,
  ListFilter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const DashboardPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
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

  // Summary statistics
  const totalSitesCount = projects.reduce((acc, p) => acc + (p.site_count || 0), 0);
  const activeProjectsCount = projects.filter((p) => p.status.toLowerCase() === 'active').length;

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.project_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = typeFilter === 'all' || p.project_type.toLowerCase() === typeFilter;
    const matchesStatus = statusFilter === 'all' || p.status.toLowerCase() === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#F8FAF8] flex flex-col font-sans text-slate-900">
      <Navbar onOpenCreateProject={() => setIsModalOpen(true)} activeTab="projects" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Compact Green Hero Header */}
        <div className="bg-emerald-950 border border-emerald-900 rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 max-w-2xl relative z-10">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-sans text-white">
              Monitor the places that matter.
            </h1>
            <p className="text-sm text-emerald-100/80 leading-relaxed font-sans">
              Track ecological initiatives, map spatial boundaries, and analyze climate impact
              metrics.
            </p>

            {/* Integrated Stats Row */}
            <div className="flex items-center space-x-6 pt-3 mt-1 border-t border-emerald-900/80">
              <div className="flex items-center space-x-2">
                <FolderPlus className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-emerald-200">
                  <strong className="text-white font-semibold">{projects.length}</strong> Projects
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-emerald-200">
                  <strong className="text-white font-semibold">{totalSitesCount}</strong> Sites
                  Mapped
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-emerald-200">
                  <strong className="text-white font-semibold">{activeProjectsCount}</strong> Active
                </span>
              </div>
            </div>
          </div>

          <div className="shrink-0 relative z-10">
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white gap-2 font-semibold shadow-sm px-5 py-2.5 h-10 text-xs rounded-xl"
            >
              <Plus className="w-4 h-4" />
              <span>Create Project</span>
            </Button>
          </div>
        </div>

        {/* Filter Navigation & Search Bar */}
        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects by name or description..."
                className="pl-9 bg-white border-slate-200 focus:border-emerald-600 text-xs rounded-lg"
              />
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center space-x-2">
                <ListFilter className="w-3.5 h-3.5 text-slate-400" />
                <Select value={typeFilter} onValueChange={(val) => setTypeFilter(val)}>
                  <SelectTrigger className="w-36 h-9 bg-white border-slate-200 text-xs rounded-lg">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="carbon">Carbon</SelectItem>
                    <SelectItem value="biodiversity">Biodiversity</SelectItem>
                    <SelectItem value="reforestation">Reforestation</SelectItem>
                    <SelectItem value="conservation">Conservation</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val)}>
                  <SelectTrigger className="w-36 h-9 bg-white border-slate-200 text-xs rounded-lg">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                </div>
                <div className="flex justify-between items-center pt-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 p-6 rounded-xl text-center max-w-md mx-auto my-12">
            <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-red-900 mb-1">Failed to load projects</p>
            <p className="text-xs text-red-700/80 mb-4">{error}</p>
            <Button onClick={fetchProjects} variant="outline" size="sm">
              Retry
            </Button>
          </div>
        ) : filteredProjects.length === 0 ? (
          <EmptyState
            icon={<FolderPlus className="w-5 h-5 text-emerald-700" />}
            title={
              searchQuery || typeFilter !== 'all' || statusFilter !== 'all'
                ? 'No matching projects found'
                : 'No projects created yet'
            }
            description={
              searchQuery || typeFilter !== 'all' || statusFilter !== 'all'
                ? 'No projects match your active search or filters. Try adjusting your search criteria.'
                : 'Create your first environmental initiative to begin mapping site boundaries.'
            }
            actionLabel={
              searchQuery || typeFilter !== 'all' || statusFilter !== 'all'
                ? undefined
                : 'Create First Project'
            }
            onAction={
              searchQuery || typeFilter !== 'all' || statusFilter !== 'all'
                ? undefined
                : () => setIsModalOpen(true)
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProjects.map((project, idx) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={idx}
                onDelete={handleDeleteProject}
              />
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
