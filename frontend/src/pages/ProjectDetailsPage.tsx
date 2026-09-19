import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '../components/Layout/Navbar';
import { ProjectMap } from '../components/Map/ProjectMap';
import { CreateSiteModal } from '../components/Sites/CreateSiteModal';
import { SiteInspectionSheet } from '../components/Sites/SiteInspectionSheet';
import { projectsApi } from '../api/projects';
import { sitesApi } from '../api/sites';
import { Project } from '../types/project';
import { Site, GeoJSONPolygon, SiteCreateInput } from '../types/site';
import {
  ArrowLeft,
  MapPin,
  PenTool,
  Trash2,
  AlertCircle,
  X,
  Layers,
  BarChart2,
  Plus,
  Compass,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

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

  // Site Inspection Sheet State
  const [inspectionSite, setInspectionSite] = useState<Site | null>(null);
  const [isInspectionSheetOpen, setIsInspectionSheetOpen] = useState<boolean>(false);

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

  const handleQuickAddSampleSite = () => {
    const samplePolygon: GeoJSONPolygon = {
      type: 'Polygon',
      coordinates: [
        [
          [-60.1, 3.1],
          [-60.0, 3.1],
          [-60.0, 3.0],
          [-60.1, 3.0],
          [-60.1, 3.1],
        ],
      ],
    };
    setDrawnPolygon(samplePolygon);
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

  const getTypeVariant = (type: string) => {
    switch (type.toLowerCase()) {
      case 'carbon':
        return 'carbon';
      case 'biodiversity':
        return 'biodiversity';
      case 'reforestation':
        return 'reforestation';
      case 'conservation':
        return 'conservation';
      default:
        return 'secondary';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'active';
      case 'planning':
        return 'planning';
      case 'completed':
        return 'completed';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col space-y-4">
          <Skeleton className="h-6 w-36" />
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-10 w-44" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[520px]">
            <Skeleton className="lg:col-span-2 rounded-xl min-h-[460px]" />
            <Skeleton className="rounded-xl" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-background flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="bg-red-50 border border-red-200 p-6 rounded-xl text-center max-w-md">
            <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-red-900 mb-1">Project Not Found</p>
            <p className="text-xs text-red-700/80 mb-4">
              {error || 'The requested project does not exist.'}
            </p>
            <Link to="/dashboard">
              <Button variant="outline" size="sm" className="gap-1.5">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalAreaSum = sites.reduce((sum, s) => sum + (s.area || 0), 0);

  return (
    <div className="min-h-screen bg-[#F8FAF8] flex flex-col font-sans text-slate-900">
      <Navbar activeTab="projects" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col space-y-5">
        {/* Navigation & Workspace Header */}
        <div className="pb-4 border-b border-slate-200">
          <Link
            to="/dashboard"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>← Back to Projects</span>
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-sans">
                  {project.name}
                </h1>
                <Badge variant={getTypeVariant(project.project_type)} className="capitalize">
                  {project.project_type}
                </Badge>
                <Badge variant={getStatusVariant(project.status)}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                  <span className="capitalize">{project.status}</span>
                </Badge>
                <span className="text-xs font-mono text-slate-700 font-semibold bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                  {totalAreaSum.toFixed(1)} ha total
                </span>
              </div>
              {project.description && (
                <p className="text-xs text-slate-600 mt-1.5 max-w-2xl leading-relaxed font-sans">
                  {project.description}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setIsDrawingMode((prev) => !prev)}
                variant={isDrawingMode ? 'amber' : 'emerald'}
                className="gap-2 shadow-xs font-semibold"
                size="default"
              >
                {isDrawingMode ? (
                  <>
                    <X className="w-4 h-4" />
                    <span>Cancel Drawing</span>
                  </>
                ) : (
                  <>
                    <PenTool className="w-4 h-4" />
                    <span>Draw Site Boundary</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Grid: Mapbox Map (Col 2) + Spatial Explorer Sidebar (Col 1) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[540px]">
          {/* Map Container */}
          <div className="lg:col-span-2 min-h-[460px] flex flex-col">
            <ProjectMap
              sites={sites}
              selectedSiteId={selectedSiteId}
              isDrawingMode={isDrawingMode}
              onSelectSite={(site) => {
                setSelectedSiteId(site.id);
                setInspectionSite(site);
                setIsInspectionSheetOpen(true);
              }}
              onPolygonDrawn={handlePolygonDrawn}
              onCancelDrawing={() => setIsDrawingMode(false)}
            />
          </div>

          {/* Spatial Explorer Sidebar */}
          <Card className="p-4 flex flex-col justify-between border-slate-200 shadow-xs bg-white rounded-xl">
            <div>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <h2 className="font-bold text-slate-900 text-sm font-sans">Spatial Explorer</h2>
                </div>
                <Badge variant="outline" className="font-mono text-[11px] font-semibold">
                  {sites.length} {sites.length === 1 ? 'polygon' : 'polygons'}
                </Badge>
              </div>

              {sites.length === 0 ? (
                <div className="py-10 text-center text-slate-500 space-y-3 border border-dashed border-slate-200 rounded-lg bg-slate-50/50 px-4 my-2">
                  <Layers className="w-7 h-7 mx-auto text-slate-400" />
                  <p className="text-xs font-bold text-slate-800 font-sans">
                    No spatial sites added yet
                  </p>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed font-sans">
                    Click "Draw Site Boundary" above to plot GPS vertices directly on the satellite
                    map, or add a sample site polygon below:
                  </p>
                  <Button
                    onClick={handleQuickAddSampleSite}
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs text-emerald-700 border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100 font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Quick Add Sample Site</span>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                  {sites.map((site) => {
                    const isSelected = site.id === selectedSiteId;

                    return (
                      <div
                        key={site.id}
                        onClick={() => setSelectedSiteId(site.id)}
                        className={`p-3 rounded-lg border transition-all cursor-pointer group ${
                          isSelected
                            ? 'bg-emerald-50/80 border-emerald-500 shadow-2xs'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start space-x-2">
                            <div>
                              <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5 font-sans">
                                {isSelected && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0"></span>
                                )}
                                <span>{site.name}</span>
                              </h4>
                              {site.description && (
                                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 font-sans">
                                  {site.description}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-1 shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSiteId(site.id);
                              }}
                              className="h-6 w-6 p-0 text-slate-500 hover:text-slate-900"
                              title="Focus camera to site"
                            >
                              <Compass className="w-3.5 h-3.5 text-emerald-600" />
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setInspectionSite(site);
                                setIsInspectionSheetOpen(true);
                              }}
                              className="h-6 text-[10px] px-2 font-semibold text-emerald-700 border-emerald-200 hover:bg-emerald-50 gap-1"
                              title="Inspect site analytics"
                            >
                              <BarChart2 className="w-3 h-3 text-emerald-600" />
                              <span>INSPECT</span>
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSite(site.id);
                              }}
                              className="h-6 w-6 text-slate-400 hover:text-red-700 hover:bg-red-50"
                              title="Delete site"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>

                        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-500">
                          <span>AREA: {site.area ? `${site.area} ha` : 'N/A'}</span>
                          <span className="text-slate-700 font-semibold">
                            {site.geometry?.coordinates[0]?.length || 0} VERTICES
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 text-center">
              Click site tile or map polygon to focus camera &amp; view analytics.
            </div>
          </Card>
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

      <SiteInspectionSheet
        isOpen={isInspectionSheetOpen}
        site={inspectionSite}
        onClose={() => {
          setIsInspectionSheetOpen(false);
          setInspectionSite(null);
        }}
      />
    </div>
  );
};
