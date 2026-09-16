import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '../components/Layout/Navbar';
import { ProjectMap } from '../components/Map/ProjectMap';
import { CreateSiteModal } from '../components/Sites/CreateSiteModal';
import { SiteAnalyticsModal } from '../components/Sites/SiteAnalyticsModal';
import { projectsApi } from '../api/projects';
import { sitesApi } from '../api/sites';
import { Project } from '../types/project';
import { Site, GeoJSONPolygon, SiteCreateInput } from '../types/site';
import {
  ArrowLeft,
  MapPin,
  PenTool,
  Trash2,
  Loader2,
  AlertCircle,
  X,
  Layers,
  BarChart2,
} from 'lucide-react';

export const ProjectDetailsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();

  const [project, setProject] = useState<Project | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Map Drawing State
  const [isDrawingMode, setIsDrawingMode] = useState<boolean>(false);
  const [drawnPolygon, setDrawnPolygon] = useState<GeoJSONPolygon | null>(null);
  const [isCreateSiteModalOpen, setIsCreateSiteModalOpen] = useState<boolean>(false);

  // Analytics Modal State
  const [analyticsSite, setAnalyticsSite] = useState<Site | null>(null);
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const [projData, sitesData] = await Promise.all([
        projectsApi.getProject(projectId),
        sitesApi.getSites(projectId),
      ]);
      setProject(projData);
      setSites(sitesData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load project details');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePolygonDrawn = (polygon: GeoJSONPolygon) => {
    setDrawnPolygon(polygon);
    setIsDrawingMode(false);
    setIsCreateSiteModalOpen(true);
  };

  const handleSaveSite = async (input: SiteCreateInput) => {
    if (!projectId) return;
    const newSite = await sitesApi.createSite(projectId, input);
    setSites((prev) => [newSite, ...prev]);
    setSelectedSiteId(newSite.id);
  };

  const handleDeleteSite = async (siteId: string) => {
    if (!confirm('Are you sure you want to delete this site?')) return;
    try {
      await sitesApi.deleteSite(siteId);
      setSites((prev) => prev.filter((s) => s.id !== siteId));
      if (selectedSiteId === siteId) {
        setSelectedSiteId(null);
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete site');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center space-y-3 text-slate-400">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          <p className="text-xs font-medium">Loading project &amp; geospatial sites...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-2xl text-center max-w-md">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-red-300 mb-1">Project Not Found</p>
            <p className="text-xs text-red-400/80 mb-4">
              {error || 'The requested project does not exist.'}
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6 flex flex-col">
        {/* Navigation & Header */}
        <div className="mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-emerald-400 font-medium transition-colors mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Projects</span>
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-white tracking-tight">{project.name}</h1>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/80">
                  {project.project_type}
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                  {project.status}
                </span>
              </div>
              {project.description && (
                <p className="text-xs text-slate-400 mt-1 max-w-2xl">{project.description}</p>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsDrawingMode((prev) => !prev)}
                className={`inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-colors shadow-lg ${
                  isDrawingMode
                    ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                    : 'bg-emerald-400 hover:bg-emerald-300 text-slate-950'
                }`}
              >
                {isDrawingMode ? (
                  <>
                    <X className="w-4 h-4" />
                    <span>Cancel Drawing</span>
                  </>
                ) : (
                  <>
                    <PenTool className="w-4 h-4" />
                    <span>Draw New Site Polygon</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Main Grid: Mapbox Map (2 Cols) + Sites Sidebar (1 Col) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[550px]">
          {/* Map Container */}
          <div className="lg:col-span-2 min-h-[450px] flex flex-col">
            <ProjectMap
              sites={sites}
              selectedSiteId={selectedSiteId}
              isDrawingMode={isDrawingMode}
              onSelectSite={(site) => setSelectedSiteId(site.id)}
              onPolygonDrawn={handlePolygonDrawn}
              onCancelDrawing={() => setIsDrawingMode(false)}
            />
          </div>

          {/* Sites Sidebar */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <h2 className="font-bold text-slate-100 text-sm">Project Sites</h2>
                </div>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                  {sites.length} total
                </span>
              </div>

              {sites.length === 0 ? (
                <div className="py-12 text-center text-slate-500 space-y-2 border border-dashed border-slate-800/80 rounded-xl bg-slate-950/40">
                  <Layers className="w-8 h-8 mx-auto text-slate-600" />
                  <p className="text-xs font-medium text-slate-400">No sites added yet</p>
                  <p className="text-[11px] text-slate-500 px-4">
                    Click "Draw New Site Polygon" above to draw site boundaries on satellite map.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                  {sites.map((site) => {
                    const isSelected = site.id === selectedSiteId;
                    return (
                      <div
                        key={site.id}
                        onClick={() => setSelectedSiteId(site.id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-950/40 border-emerald-500/80 shadow-md shadow-emerald-950/30'
                            : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-xs text-slate-100">{site.name}</h4>
                            {site.description && (
                              <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                                {site.description}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center space-x-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setAnalyticsSite(site);
                                setIsAnalyticsModalOpen(true);
                              }}
                              className="text-emerald-400 hover:text-emerald-300 p-1 rounded hover:bg-emerald-950/60 transition-colors flex items-center space-x-1 text-[10px] font-semibold px-2 py-0.5 border border-emerald-500/30"
                              title="View site analytics"
                            >
                              <BarChart2 className="w-3 h-3" />
                              <span>Analytics</span>
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSite(site.id);
                              }}
                              className="text-slate-500 hover:text-red-400 p-1 rounded transition-colors"
                              title="Delete site"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="mt-2 pt-2 border-t border-slate-700/40 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                          <span>Area: {site.area ? `${site.area} ha` : 'N/A'}</span>
                          <span className="text-emerald-400/80">
                            {site.geometry?.coordinates[0]?.length || 0} vertices
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 text-center">
              Click any site card or polygon to highlight on map.
            </div>
          </div>
        </div>
      </main>

      <CreateSiteModal
        isOpen={isCreateSiteModalOpen}
        drawnPolygon={drawnPolygon}
        onClose={() => {
          setIsCreateSiteModalOpen(false);
          setDrawnPolygon(null);
        }}
        onSubmit={handleSaveSite}
      />

      <SiteAnalyticsModal
        isOpen={isAnalyticsModalOpen}
        site={analyticsSite}
        onClose={() => {
          setIsAnalyticsModalOpen(false);
          setAnalyticsSite(null);
        }}
      />
    </div>
  );
};
