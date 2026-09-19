import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { Site, GeoJSONPolygon } from '../../types/site';
import { AlertTriangle, Layers, Pencil } from 'lucide-react';

import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

interface ProjectMapProps {
  sites: Site[];
  selectedSiteId?: string | null;
  isDrawingMode: boolean;
  onSelectSite?: (site: Site) => void;
  onPolygonDrawn?: (polygon: GeoJSONPolygon) => void;
  onCancelDrawing?: () => void;
}

export const ProjectMap: React.FC<ProjectMapProps> = ({
  sites,
  selectedSiteId,
  isDrawingMode,
  onSelectSite,
  onPolygonDrawn,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const drawRef = useRef<MapboxDraw | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const sitesRef = useRef(sites);
  const onSelectSiteRef = useRef(onSelectSite);
  const onPolygonDrawnRef = useRef(onPolygonDrawn);

  useEffect(() => {
    sitesRef.current = sites;
    onSelectSiteRef.current = onSelectSite;
    onPolygonDrawnRef.current = onPolygonDrawn;
  });

  const rawToken = import.meta.env.VITE_MAPBOX_TOKEN;
  const isTokenConfigured =
    Boolean(rawToken) &&
    rawToken.trim() !== '' &&
    !rawToken.includes('your_mapbox_public_access_token_here');

  const handleDrawCreate = useCallback((e: { features: GeoJSON.Feature[] }) => {
    if (e.features && e.features.length > 0) {
      const feature = e.features[0];
      if (feature.geometry.type === 'Polygon') {
        const drawnPoly: GeoJSONPolygon = {
          type: 'Polygon',
          coordinates: feature.geometry.coordinates as number[][][],
        };
        if (onPolygonDrawnRef.current) {
          onPolygonDrawnRef.current(drawnPoly);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (!isTokenConfigured || !mapContainerRef.current || mapRef.current) return;

    mapboxgl.accessToken = rawToken;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [-60.0, 3.0],
      zoom: 3,
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true,
      },
      defaultMode: 'simple_select',
    });

    map.addControl(draw as unknown as mapboxgl.IControl, 'top-left');
    drawRef.current = draw;

    const popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 10,
    });
    popupRef.current = popup;

    map.on('load', () => {
      setMapLoaded(true);

      map.addSource('sites-geojson', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      });

      // Polygon fill styling
      map.addLayer({
        id: 'sites-fill',
        type: 'fill',
        source: 'sites-geojson',
        paint: {
          'fill-color': ['case', ['boolean', ['get', 'isSelected'], false], '#F59E0B', '#10B981'],
          'fill-opacity': ['case', ['boolean', ['get', 'isSelected'], false], 0.55, 0.35],
        },
      });

      // Polygon outline styling
      map.addLayer({
        id: 'sites-line',
        type: 'line',
        source: 'sites-geojson',
        paint: {
          'line-color': ['case', ['boolean', ['get', 'isSelected'], false], '#D97706', '#047857'],
          'line-width': ['case', ['boolean', ['get', 'isSelected'], false], 3.5, 2.0],
        },
      });

      // Map hover popovers
      map.on('mousemove', 'sites-fill', (e) => {
        if (!e.features || e.features.length === 0) return;
        const feature = e.features[0];
        const props = feature.properties;
        map.getCanvas().style.cursor = 'pointer';

        if (props && props.name) {
          const lng = e.lngLat.lng.toFixed(4);
          const lat = e.lngLat.lat.toFixed(4);
          popup
            .setLngLat(e.lngLat)
            .setHTML(
              `<div style="font-family: 'Inter', sans-serif; font-size: 11px; background: #ffffff; color: #0f172a; padding: 6px 10px; border-radius: 6px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgb(15 23 42 / 0.1);">
                <div style="font-weight: 700; color: #0f172a; font-size: 12px; margin-bottom: 2px;">${props.name}</div>
                ${props.area ? `<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #059669; font-weight: 600;">AREA: ${props.area} ha</div>` : ''}
                <div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #64748b; margin-top: 2px;">${lat}°N ${lng}°E</div>
              </div>`
            )
            .addTo(map);
        }
      });

      map.on('click', 'sites-fill', (e) => {
        if (!e.features || e.features.length === 0) return;
        const siteId = e.features[0].properties?.id;
        if (siteId && onSelectSiteRef.current) {
          const clickedSite = sitesRef.current.find((s) => s.id === siteId);
          if (clickedSite) {
            onSelectSiteRef.current(clickedSite);
          }
        }
      });

      map.on('mouseleave', 'sites-fill', () => {
        map.getCanvas().style.cursor = '';
        popup.remove();
      });
    });

    map.on('draw.create', handleDrawCreate as unknown as (e: object) => void);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      drawRef.current = null;
    };
  }, [isTokenConfigured, rawToken, handleDrawCreate]);

  // Update map features & camera positioning when sites or selectedSiteId change
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    const geojsonFeatures: GeoJSON.Feature[] = sites.map((site) => ({
      type: 'Feature',
      properties: {
        id: site.id,
        name: site.name,
        area: site.area,
        isSelected: site.id === selectedSiteId,
      },
      geometry: site.geometry,
    }));

    const source = mapRef.current.getSource('sites-geojson') as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData({
        type: 'FeatureCollection',
        features: geojsonFeatures,
      });
    }

    if (selectedSiteId) {
      // Camera flies directly to the selected site polygon
      const selectedSite = sites.find((s) => s.id === selectedSiteId);
      if (selectedSite && selectedSite.geometry && selectedSite.geometry.coordinates) {
        const bounds = new mapboxgl.LngLatBounds();
        selectedSite.geometry.coordinates[0].forEach((coord) => {
          bounds.extend([coord[0], coord[1]]);
        });

        if (!bounds.isEmpty()) {
          mapRef.current.fitBounds(bounds, {
            padding: 100,
            maxZoom: 14,
            duration: 1200,
          });
        }
      }
    } else if (sites.length > 0) {
      // Fit to all sites when no specific site is selected
      const bounds = new mapboxgl.LngLatBounds();
      sites.forEach((site) => {
        if (site.geometry && site.geometry.coordinates) {
          site.geometry.coordinates[0].forEach((coord) => {
            bounds.extend([coord[0], coord[1]]);
          });
        }
      });

      if (!bounds.isEmpty()) {
        mapRef.current.fitBounds(bounds, {
          padding: 80,
          maxZoom: 12,
          duration: 1000,
        });
      }
    }
  }, [sites, selectedSiteId, mapLoaded]);

  // Toggle drawing mode
  useEffect(() => {
    if (!drawRef.current) return;
    if (isDrawingMode) {
      drawRef.current.deleteAll();
      drawRef.current.changeMode('draw_polygon');
    } else {
      drawRef.current.changeMode('simple_select');
      drawRef.current.deleteAll();
    }
  }, [isDrawingMode]);

  if (!isTokenConfigured) {
    return (
      <div className="h-full w-full bg-white border border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center shadow-xs">
        <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 mb-4 shadow-xs">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-2">Mapbox Access Token Required</h3>
        <p className="text-xs text-slate-500 max-w-md mb-6 leading-relaxed">
          To render interactive satellite maps and draw site polygons, please create a local{' '}
          <code className="text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded font-mono border border-amber-200">
            frontend/.env
          </code>{' '}
          file and configure your Mapbox public access token.
        </p>
        <div className="bg-slate-900 p-4 rounded-xl text-xs font-mono text-slate-100 text-left w-full max-w-md space-y-1">
          <div className="text-slate-400 font-sans text-[11px] mb-1">frontend/.env</div>
          <div>VITE_API_BASE_URL=http://localhost:8000</div>
          <div className="text-emerald-400 font-semibold">VITE_MAPBOX_TOKEN=pk.eyJ1Ijo...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-900">
      <div ref={mapContainerRef} className="w-full h-full min-h-[480px]" />

      {isDrawingMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-amber-600 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 shadow-lg z-10 animate-bounce border border-amber-700">
          <Pencil className="w-4 h-4" />
          <span>
            DRAWING ACTIVE: Click map points to construct boundary. Double-click to complete loop.
          </span>
        </div>
      )}

      {/* Map style indicator */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md border border-slate-200 px-3 py-1.5 rounded-lg text-[11px] font-mono text-slate-700 font-semibold flex items-center gap-2 shadow-xs pointer-events-none">
        <Layers className="w-3.5 h-3.5 text-emerald-600" />
        <span>MAPBOX SATELLITE</span>
      </div>
    </div>
  );
};
