import React, { useEffect, useState, useCallback } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { analyticsApi } from '../../api/analytics';
import { SiteAnalyticsRecord } from '../../types/analytics';
import { Site } from '../../types/site';
import {
  TrendingUp,
  Award,
  Calendar,
  PlusCircle,
  Loader2,
  Sparkles,
  BarChart2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SiteAnalyticsModalProps {
  isOpen: boolean;
  site: Site | null;
  onClose: () => void;
}

export const SiteAnalyticsModal: React.FC<SiteAnalyticsModalProps> = ({
  isOpen,
  site,
  onClose,
}) => {
  const [analytics, setAnalytics] = useState<SiteAnalyticsRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [dateStr, setDateStr] = useState<string>(new Date().toISOString().split('T')[0]);
  const [carbonVal, setCarbonVal] = useState<string>('240.5');
  const [biodiversityVal, setBiodiversityVal] = useState<string>('85.0');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchAnalytics = useCallback(async () => {
    if (!site) return;
    setLoading(true);
    setError(null);
    try {
      const records = await analyticsApi.getAnalytics(site.id);
      setAnalytics(records);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load site analytics');
    } finally {
      setLoading(false);
    }
  }, [site]);

  useEffect(() => {
    if (isOpen && site) {
      fetchAnalytics();
    }
  }, [isOpen, site, fetchAnalytics]);

  const handleAddSample = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!site) return;
    setSubmitting(true);
    try {
      const newRec = await analyticsApi.addAnalytics(site.id, {
        date: dateStr,
        carbon_value: parseFloat(carbonVal) || 0,
        biodiversity_score: parseFloat(biodiversityVal) || 0,
      });
      setAnalytics((prev) => [...prev, newRec]);
      setShowAddForm(false);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to add analytics entry');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateSeedData = async () => {
    if (!site) return;
    setLoading(true);
    try {
      const today = new Date();
      const samplePoints = [
        { offsetMonths: 5, carbon: 180.2, bio: 72.0 },
        { offsetMonths: 4, carbon: 210.5, bio: 76.5 },
        { offsetMonths: 3, carbon: 245.0, bio: 81.0 },
        { offsetMonths: 2, carbon: 290.8, bio: 84.2 },
        { offsetMonths: 1, carbon: 330.4, bio: 88.0 },
        { offsetMonths: 0, carbon: 375.0, bio: 92.5 },
      ];

      for (const pt of samplePoints) {
        const d = new Date(today);
        d.setMonth(d.getMonth() - pt.offsetMonths);
        await analyticsApi.addAnalytics(site.id, {
          date: d.toISOString().split('T')[0],
          carbon_value: pt.carbon,
          biodiversity_score: pt.bio,
        });
      }
      await fetchAnalytics();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to generate sample data');
    } finally {
      setLoading(false);
    }
  };

  if (!site) return null;

  // Sort analytics by date
  const sortedAnalytics = [...analytics].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const categories = sortedAnalytics.map((a) => a.date);
  const carbonSeries = sortedAnalytics.map((a) => a.carbon_value);
  const bioSeries = sortedAnalytics.map((a) => a.biodiversity_score);

  const avgCarbon =
    analytics.length > 0
      ? (analytics.reduce((acc, curr) => acc + curr.carbon_value, 0) / analytics.length).toFixed(1)
      : '0.0';

  const maxBio =
    analytics.length > 0
      ? Math.max(...analytics.map((a) => a.biodiversity_score)).toFixed(1)
      : '0.0';

  const chartOptions: Highcharts.Options = {
    chart: {
      type: 'spline',
      backgroundColor: 'transparent',
      height: 320,
      style: {
        fontFamily: 'Inter, sans-serif',
      },
    },
    title: { text: undefined },
    xAxis: {
      categories: categories,
      lineColor: '#e2e8f0',
      tickColor: '#e2e8f0',
      labels: {
        style: {
          color: '#64748b',
          fontSize: '11px',
          fontFamily: 'Inter, sans-serif',
        },
      },
    },
    yAxis: [
      {
        title: {
          text: 'Carbon Stock (tCO₂e)',
          style: {
            color: '#064e3b',
            fontSize: '11px',
            fontWeight: '700',
            fontFamily: 'Inter, sans-serif',
          },
        },
        gridLineColor: '#f1f5f9',
        labels: {
          style: {
            color: '#064e3b',
            fontSize: '11px',
            fontFamily: 'Inter, sans-serif',
          },
        },
      },
      {
        title: {
          text: 'Biodiversity Health Index (0-100)',
          style: {
            color: '#10b981',
            fontSize: '11px',
            fontWeight: '700',
            fontFamily: 'Inter, sans-serif',
          },
        },
        opposite: true,
        gridLineColor: 'transparent',
        labels: {
          style: {
            color: '#10b981',
            fontSize: '11px',
            fontFamily: 'Inter, sans-serif',
          },
        },
      },
    ],
    tooltip: {
      shared: true,
      backgroundColor: '#ffffff',
      borderColor: '#e2e8f0',
      borderRadius: 8,
      shadow: true,
      style: {
        color: '#0f172a',
        fontSize: '12px',
        fontFamily: 'Inter, sans-serif',
      },
    },
    legend: {
      itemStyle: {
        color: '#334155',
        fontSize: '12px',
        fontWeight: '600',
      },
      itemHoverStyle: {
        color: '#064e3b',
      },
    },
    credits: { enabled: false },
    series: [
      {
        name: 'Carbon Stock (tCO₂e)',
        type: 'spline',
        yAxis: 0,
        data: carbonSeries,
        color: '#064e3b',
        marker: {
          fillColor: '#047857',
          radius: 4.5,
        },
      },
      {
        name: 'Biodiversity Index',
        type: 'spline',
        yAxis: 1,
        data: bioSeries,
        color: '#10b981',
        marker: {
          fillColor: '#059669',
          radius: 4.5,
        },
      },
    ],
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col overflow-hidden p-6 bg-white border-slate-200 shadow-lg rounded-xl">
        <DialogHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base text-slate-900 font-bold font-sans">
                {site.name}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Site Telemetry Analytics &amp; Ecological Indices
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto space-y-6 pt-4 pr-1 flex-1">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div className="bg-white border border-slate-200 p-4 rounded-lg flex items-center space-x-3.5 shadow-xs">
              <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-mono">Avg. Carbon Value</p>
                <p className="text-base font-bold text-slate-900 mt-0.5 font-mono">
                  {avgCarbon} <span className="text-xs font-normal text-emerald-700">tCO₂e</span>
                </p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-lg flex items-center space-x-3.5 shadow-xs">
              <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-mono">Max Biodiversity Score</p>
                <p className="text-base font-bold text-slate-900 mt-0.5 font-mono">
                  {maxBio} <span className="text-xs font-normal text-emerald-600">/ 100</span>
                </p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-lg flex items-center space-x-3.5 shadow-xs">
              <div className="p-2.5 bg-slate-100 text-slate-700 rounded-lg border border-slate-200 shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-mono">Recorded Samples</p>
                <p className="text-base font-bold text-slate-900 mt-0.5 font-mono">
                  {analytics.length}{' '}
                  <span className="text-xs font-normal text-slate-500">entries</span>
                </p>
              </div>
            </div>
          </div>

          {/* Action Header */}
          <div className="flex items-center justify-between pt-1">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
              Ecological Trend Lines
            </h4>

            <div className="flex items-center space-x-2">
              {analytics.length === 0 && (
                <Button
                  onClick={handleGenerateSeedData}
                  disabled={loading}
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Seed Demo Data</span>
                </Button>
              )}

              <Button
                onClick={() => setShowAddForm((prev) => !prev)}
                size="sm"
                className="gap-1.5 font-semibold"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Log Data Entry</span>
              </Button>
            </div>
          </div>

          {/* Add Data Form */}
          {showAddForm && (
            <form
              onSubmit={handleAddSample}
              className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3 animate-in fade-in duration-150"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Date
                  </label>
                  <Input
                    type="date"
                    value={dateStr}
                    onChange={(e) => setDateStr(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Carbon Value (tCO₂e)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={carbonVal}
                    onChange={(e) => setCarbonVal(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Biodiversity Score (0-100)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={biodiversityVal}
                    onChange={(e) => setBiodiversityVal(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-1">
                <Button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  variant="ghost"
                  size="sm"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  size="sm"
                  className="gap-1 font-semibold"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Record</span>
                </Button>
              </div>
            </form>
          )}

          {/* Highcharts Visualization Container */}
          <div className="bg-white border border-slate-200 p-4 rounded-xl min-h-[340px] flex flex-col justify-center shadow-xs">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500 space-y-2">
                <Loader2 className="w-7 h-7 text-forest-800 animate-spin" />
                <p className="text-xs">Loading analytics data...</p>
              </div>
            ) : error ? (
              <div className="py-8 text-center text-red-600 text-xs">{error}</div>
            ) : analytics.length === 0 ? (
              <div className="py-12 text-center text-slate-500 space-y-3">
                <BarChart2 className="w-9 h-9 mx-auto text-slate-400" />
                <p className="text-xs font-semibold text-slate-700">
                  No analytics logs recorded for this site yet.
                </p>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                  Click "Log Data Entry" or "Seed Demo Data" above to chart carbon sequestration and
                  biodiversity performance metrics.
                </p>
              </div>
            ) : (
              <HighchartsReact highcharts={Highcharts} options={chartOptions} />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
