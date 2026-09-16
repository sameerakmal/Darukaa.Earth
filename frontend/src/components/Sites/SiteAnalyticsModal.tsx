import React, { useEffect, useState, useCallback } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { analyticsApi } from '../../api/analytics';
import { SiteAnalyticsRecord } from '../../types/analytics';
import { Site } from '../../types/site';
import {
  X,
  TrendingUp,
  Award,
  Calendar,
  PlusCircle,
  Loader2,
  Sparkles,
  BarChart2,
} from 'lucide-react';

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

  if (!isOpen || !site) return null;

  // Prepare Highcharts series data sorted by date
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
      height: 340,
      style: {
        fontFamily: 'Inter, sans-serif',
      },
    },
    title: {
      text: undefined,
    },
    xAxis: {
      categories: categories,
      lineColor: '#334155',
      tickColor: '#334155',
      labels: {
        style: {
          color: '#94a3b8',
          fontSize: '11px',
        },
      },
    },
    yAxis: [
      {
        // Primary yAxis (Carbon)
        title: {
          text: 'Carbon Sequestration (tCO₂e)',
          style: {
            color: '#34d399',
            fontSize: '11px',
            fontWeight: '600',
          },
        },
        gridLineColor: '#1e293b',
        labels: {
          style: {
            color: '#34d399',
            fontSize: '11px',
          },
        },
      },
      {
        // Secondary yAxis (Biodiversity)
        title: {
          text: 'Biodiversity Health Score (0-100)',
          style: {
            color: '#60a5fa',
            fontSize: '11px',
            fontWeight: '600',
          },
        },
        opposite: true,
        gridLineColor: 'transparent',
        labels: {
          style: {
            color: '#60a5fa',
            fontSize: '11px',
          },
        },
      },
    ],
    tooltip: {
      shared: true,
      backgroundColor: '#0f172a',
      borderColor: '#334155',
      borderRadius: 12,
      style: {
        color: '#f8fafc',
        fontSize: '12px',
      },
    },
    legend: {
      itemStyle: {
        color: '#cbd5e1',
        fontSize: '12px',
        fontWeight: '500',
      },
      itemHoverStyle: {
        color: '#10b981',
      },
    },
    credits: {
      enabled: false,
    },
    series: [
      {
        name: 'Carbon Stock (tCO₂e)',
        type: 'spline',
        yAxis: 0,
        data: carbonSeries,
        color: '#10b981',
        marker: {
          fillColor: '#059669',
          radius: 4,
        },
      },
      {
        name: 'Biodiversity Index',
        type: 'spline',
        yAxis: 1,
        data: bioSeries,
        color: '#3b82f6',
        marker: {
          fillColor: '#2563eb',
          radius: 4,
        },
      },
    ],
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-950 border border-emerald-800/80 text-emerald-400">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">{site.name}</h3>
              <p className="text-xs text-slate-400">
                Site Performance Analytics &amp; Ecological Monitoring
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl flex items-center space-x-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Avg. Carbon Value</p>
                <p className="text-lg font-bold text-white mt-0.5">
                  {avgCarbon} <span className="text-xs font-normal text-emerald-400">tCO₂e</span>
                </p>
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl flex items-center space-x-4">
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Max Biodiversity Score</p>
                <p className="text-lg font-bold text-white mt-0.5">
                  {maxBio} <span className="text-xs font-normal text-blue-400">/ 100</span>
                </p>
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl flex items-center space-x-4">
              <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Recorded Samples</p>
                <p className="text-lg font-bold text-white mt-0.5">
                  {analytics.length}{' '}
                  <span className="text-xs font-normal text-slate-400">entries</span>
                </p>
              </div>
            </div>
          </div>

          {/* Action Header */}
          <div className="flex items-center justify-between pt-2">
            <h4 className="font-semibold text-sm text-slate-200 flex items-center space-x-2">
              <span>Historical Trend (Highcharts)</span>
            </h4>

            <div className="flex items-center space-x-3">
              {analytics.length === 0 && (
                <button
                  onClick={handleGenerateSeedData}
                  disabled={loading}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Seed Demo Data</span>
                </button>
              )}

              <button
                onClick={() => setShowAddForm((prev) => !prev)}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition-colors shadow-md"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Log Data Entry</span>
              </button>
            </div>
          </div>

          {/* Add Data Form */}
          {showAddForm && (
            <form
              onSubmit={handleAddSample}
              className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-4 animate-in fade-in duration-150"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={dateStr}
                    onChange={(e) => setDateStr(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Carbon Value (tCO₂e)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={carbonVal}
                    onChange={(e) => setCarbonVal(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Biodiversity Score (0-100)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={biodiversityVal}
                    onChange={(e) => setBiodiversityVal(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition-colors inline-flex items-center space-x-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Record</span>
                </button>
              </div>
            </form>
          )}

          {/* Highcharts Visualization Container */}
          <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl min-h-[350px] flex flex-col justify-center">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-2">
                <Loader2 className="w-7 h-7 text-emerald-400 animate-spin" />
                <p className="text-xs">Loading analytics data...</p>
              </div>
            ) : error ? (
              <div className="py-8 text-center text-red-400 text-xs">{error}</div>
            ) : analytics.length === 0 ? (
              <div className="py-12 text-center text-slate-500 space-y-3">
                <BarChart2 className="w-10 h-10 mx-auto text-slate-600" />
                <p className="text-xs font-medium text-slate-300">
                  No analytics data logged for this site yet.
                </p>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                  Click "Log Data Entry" or "Seed Demo Data" above to visualize carbon and
                  biodiversity metrics on Highcharts.
                </p>
              </div>
            ) : (
              <HighchartsReact highcharts={Highcharts} options={chartOptions} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
