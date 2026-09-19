import React, { useState, useEffect } from 'react';
import { GeoJSONPolygon, SiteCreateInput } from '../../types/site';
import { MapPin, Loader2, Layers } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

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
      // Calculate approximate area in hectares if desired, or default 100
      setArea('100');
    }
  }, [drawnPolygon]);

  if (!drawnPolygon) return null;

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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white border-slate-200 shadow-lg rounded-xl">
        <DialogHeader>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
              <MapPin className="w-4.5 h-4.5" />
            </div>
            <div>
              <DialogTitle className="text-base text-slate-900 font-bold font-sans">
                Save Spatial Site
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Assign metadata to captured GPS polygon coordinates.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-lg font-mono">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Site Name *</label>
            <Input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sector 4 - Canopy Sequestration Zone"
              className="bg-white border-slate-200 focus:border-emerald-600 text-xs rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <Textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Geography notes, canopy density estimates, soil type..."
              className="bg-white border-slate-200 focus:border-emerald-600 text-xs rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Estimated Area (Hectares)
            </label>
            <Input
              type="number"
              step="any"
              min="0"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="e.g. 150.5"
              className="bg-white border-slate-200 focus:border-emerald-600 text-xs font-mono rounded-lg"
            />
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[11px] font-mono text-slate-600 space-y-1">
            <div className="font-bold text-emerald-800 flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>SPATIAL BOUNDARY METADATA</span>
            </div>
            <p className="text-slate-600">
              Captured polygon contains {drawnPolygon.coordinates[0]?.length || 0} GPS vertices
              forming a closed spatial geometry.
            </p>
          </div>

          <DialogFooter className="pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="emerald"
              disabled={isSubmitting || !name.trim()}
              className="gap-1.5 font-semibold"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Site...</span>
                </>
              ) : (
                <span>Save Site</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
