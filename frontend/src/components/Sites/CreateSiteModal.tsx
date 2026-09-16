import React, { useState, useEffect } from 'react';
import { GeoJSONPolygon, SiteCreateInput } from '../../types/site';
import { X, MapPin, Loader2 } from 'lucide-react';

interface CreateSiteModalProps {
  isOpen: boolean;
  drawnPolygon: GeoJSONPolygon | null;
  onClose: () => void;
  onSubmit: (data: SiteCreateInput) => Promise<void>;
}

export const CreateSiteModal: React.FC<CreateSiteModalProps> = ({
  isOpen,
  drawnPolygon,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [area, setArea] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (drawnPolygon) {
      // Calculate approximate area in hectares or sq km if desired, or default empty
      setArea('100');
    }
  }, [drawnPolygon]);

  if (!isOpen || !drawnPolygon) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
        area: area ? parseFloat(area) : undefined,
        geometry: drawnPolygon,
      });
      setName('');
      setDescription('');
      setArea('');
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create site');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-emerald-400" />
            <span>Save Drawn Site</span>
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Site Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sector A - Reforestation Reserve"
              className="w-full bg-slate-800/80 border border-slate-700 text-slate-100 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Key notes regarding site geography, canopy density, etc..."
              className="w-full bg-slate-800/80 border border-slate-700 text-slate-100 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-emerald-500 transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Estimated Area (Hectares)
            </label>
            <input
              type="number"
              step="any"
              min="0"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="e.g. 250.5"
              className="w-full bg-slate-800/80 border border-slate-700 text-slate-100 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 text-[11px] text-slate-400 space-y-1">
            <div className="font-semibold text-slate-300 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Captured GeoJSON Polygon</span>
            </div>
            <p>
              Polygon points: {drawnPolygon.coordinates[0]?.length || 0} vertices forming a closed
              loop (SRID 4326).
            </p>
          </div>

          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-4 py-2 text-xs font-medium text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-1.5 font-semibold"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Site...</span>
                </>
              ) : (
                <span>Save Site</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
