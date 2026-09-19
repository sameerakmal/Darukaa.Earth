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
  MapPin,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface SiteInspectionSheetProps {
  isOpen: boolean;
  site: Site | null;
  onClose: () => void;
}

export const SiteInspectionSheet: React.FC<SiteInspectionSheetProps> = ({
  isOpen,
  site,
  onClose,
}) => {
  const [analytics, setAnalytics] = useState<SiteAnalyticsRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7D' | '30D' | '90D' | '1Y' | 'ALL'>('ALL');

  // Form State
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [dateStr, setDateStr] = useState<string>(new Date().toISOString().split('T')[0]);
  const [carbonVal, setCarbonVal] = useState<string>('245.0');
  const [biodiversityVal, setBiodiversityVal] = useState<string>('88.5');
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

  // Filter & Sort analytics by date & active timeRange
  const sortedAnalytics = [...analytics].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const filteredAnalytics = sortedAnalytics.filter((record) => {
    if (timeRange === 'ALL') return true;
    const recordDate = new Date(record.date).getTime();
    const now = new Date().getTime();
    const daysDiff = (now - recordDate) / (1000 * 3600 * 24);

    if (timeRange === '7D') return daysDiff <= 7;
    if (timeRange === '30D') return daysDiff <= 30;
    if (timeRange === '90D') return daysDiff <= 90;
    if (timeRange === '1Y') return daysDiff <= 365;
    return true;
  });

  const categories = filteredAnalytics.map((a) => a.date);
  const carbonSeries = filteredAnalytics.map((a) => a.carbon_value);
  const bioSeries = filteredAnalytics.map((a) => a.biodiversity_score);

  const avgCarbon =
    filteredAnalytics.length > 0
      ? (
          filteredAnalytics.reduce((acc, curr) => acc + curr.carbon_value, 0) /
          filteredAnalytics.length
        ).toFixed(1)
      : '0.0';

  const maxBio =
    filteredAnalytics.length > 0
      ? Math.max(...filteredAnalytics.map((a) => a.biodiversity_score)).toFixed(1)
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
          style: { color: '#064e3b', fontSize: '11px', fontFamily: 'Inter, sans-serif' },
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
          style: { color: '#10b981', fontSize: '11px', fontFamily: 'Inter, sans-serif' },
        },
      },
    ],
    tooltip: {
      shared: true,
      backgroundColor: '#ffffff',
      borderColor: '#e2e8f0',
      borderRadius: 8,
      shadow: true,
      style: { color: '#0f172a', fontSize: '12px', fontFamily: 'Inter, sans-serif' },
    },
    legend: {
      itemStyle: { color: '#334155', fontSize: '12px', fontWeight: '600' },
      itemHoverStyle: { color: '#064e3b' },
    },
    credits: { enabled: false },
    series: [
      {
        name: 'Carbon Stock (tCO₂e)',
        type: 'spline',
        yAxis: 0,
        data: carbonSeries,
        color: '#064e3b',
        marker: { fillColor: '#047857', radius: 4.5 },
      },
      {
        name: 'Biodiversity Index',
        type: 'spline',
        yAxis: 1,
        data: bioSeries,
        color: '#10b981',
        marker: { fillColor: '#059669', radius: 4.5 },
      },
    ],
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="sm:max-w-2xl overflow-y-auto p-6 flex flex-col justify-between font-sans bg-white border-slate-200"
      >
        <div>
          {/* Header */}
          <SheetHeader className="pb-4 border-b border-slate-100 text-left">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <SheetTitle className="text-xl font-extrabold text-slate-900 font-sans">
                  {site.name}
                </SheetTitle>
                <SheetDescription className="text-xs text-slate-500">
                  Site Inspection &amp; Telemetry Analytics
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {/* Quick Specs Bar */}
          <div className="grid grid-cols-3 gap-2.5 my-5 font-mono">
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-center">
              <p className="text-[10px] uppercase font-bold text-slate-500">Total Area</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">
                {site.area ? `${site.area} ha` : 'N/A'}
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-center">
              <p className="text-[10px] uppercase font-bold text-slate-500">Vertices</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">
                {site.geometry?.coordinates[0]?.length || 0} pts
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-center flex flex-col items-center justify-center">
              <p className="text-[10px] uppercase font-bold text-slate-500 mb-0.5">Status</p>
              <Badge variant="active" className="text-[9px]">
                Monitored
              </Badge>
            </div>
          </div>

          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <div className="bg-white border border-slate-200 p-3.5 rounded-lg flex items-center space-x-3 shadow-xs">
              <div className="p-2 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-mono font-bold text-slate-500">
                  Avg Carbon
                </p>
                <p className="text-sm font-bold text-slate-900 mt-0.5 font-mono">
                  {avgCarbon}{' '}
                  <span className="text-[10px] font-normal text-emerald-700">tCO₂e</span>
                </p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-3.5 rounded-lg flex items-center space-x-3 shadow-xs">
              <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-mono font-bold text-slate-500">
                  Max Bio Score
                </p>
                <p className="text-sm font-bold text-slate-900 mt-0.5 font-mono">
                  {maxBio} <span className="text-[10px] font-normal text-emerald-600">/ 100</span>
                </p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-3.5 rounded-lg flex items-center space-x-3 shadow-xs">
              <div className="p-2 bg-slate-100 text-slate-700 rounded-lg border border-slate-200 shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-mono font-bold text-slate-500">Samples</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5 font-mono">
                  {analytics.length}{' '}
                  <span className="text-[10px] font-normal text-slate-500">entries</span>
                </p>
              </div>
            </div>
          </div>

          {/* Time Range Filter Bar & Data Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
              Ecological Sequestration Trends
            </h4>

            {/* Time Period Filter Pill Buttons */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg">
              {(['7D', '30D', '90D', '1Y', 'ALL'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors ${
                    timeRange === range
                      ? 'bg-white text-forest-800 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-end space-x-2 mb-4">
            {analytics.length === 0 && (
              <Button
                onClick={handleGenerateSeedData}
                disabled={loading}
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Seed Demo Data</span>
              </Button>
            )}

            <Button
              onClick={() => setShowAddForm((prev) => !prev)}
              size="sm"
              className="gap-1.5 text-xs font-semibold"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Log Sample Record</span>
            </Button>
          </div>

          {/* Inline Data Entry Form */}
          {showAddForm && (
            <form
              onSubmit={handleAddSample}
              className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-3 mb-4 animate-in fade-in duration-150"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">
                    Sample Date
                  </label>
                  <Input
                    type="date"
                    value={dateStr}
                    onChange={(e) => setDateStr(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">
                    Carbon Stock (tCO₂e)
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
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">
                    Biodiversity (0-100)
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
                  className="h-7 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  size="sm"
                  className="h-7 text-xs font-semibold gap-1"
                >
                  {submitting && <Loader2 className="w-3 h-3 animate-spin" />}
                  <span>Save Record</span>
                </Button>
              </div>
            </form>
          )}

          {/* Highcharts Visualization Box */}
          <div className="bg-white border border-slate-200 p-3.5 rounded-xl min-h-[330px] flex flex-col justify-center shadow-xs">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500 space-y-2">
                <Loader2 className="w-6 h-6 text-forest-800 animate-spin" />
                <p className="text-xs font-medium">Loading highcharts analytics...</p>
              </div>
            ) : error ? (
              <div className="py-8 text-center text-red-600 text-xs">{error}</div>
            ) : filteredAnalytics.length === 0 ? (
              <div className="py-12 text-center text-slate-500 space-y-2">
                <BarChart2 className="w-8 h-8 mx-auto text-slate-400" />
                <p className="text-xs font-semibold text-slate-700">
                  No records match selected time range ({timeRange}).
                </p>
                <p className="text-[11px] text-slate-500">
                  Click "Seed Demo Data" or "Log Sample Record" above to visualize performance.
                </p>
              </div>
            ) : (
              <HighchartsReact highcharts={Highcharts} options={chartOptions} />
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 text-center">
          <Button variant="outline" onClick={onClose} size="sm" className="w-full">
            Close Inspection Sheet
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
