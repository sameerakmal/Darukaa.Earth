import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { Site, GeoJSONPolygon } from '../../types/site';
import { AlertTriangle, Layers } from 'lucide-react';

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

    map.on('load', () => {
      setMapLoaded(true);

      map.addSource('sites-geojson', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      });

      map.addLayer({
        id: 'sites-fill',
        type: 'fill',
        source: 'sites-geojson',
        paint: {
          'fill-color': ['case', ['boolean', ['get', 'isSelected'], false], '#f59e0b', '#10b981'],
          'fill-opacity': 0.4,
        },
      });

      map.addLayer({
        id: 'sites-line',
        type: 'line',
        source: 'sites-geojson',
        paint: {
          'line-color': ['case', ['boolean', ['get', 'isSelected'], false], '#fbbf24', '#34d399'],
          'line-width': 2.5,
        },
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

      map.on('mouseenter', 'sites-fill', () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', 'sites-fill', () => {
        map.getCanvas().style.cursor = '';
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

  // Update map features & bounds when sites change
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    const geojsonFeatures: GeoJSON.Feature[] = sites.map((site) => ({
      type: 'Feature',
      properties: {
        id: site.id,
        name: site.name,
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

    if (sites.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      sites.forEach((site) => {
        if (site.geometry && site.geometry.coordinates) {
          site.geometry.coordinates[0].forEach((coord) => {
            bounds.extend([coord[0], coord[1]]);
          });
        }
      });

      if (!bounds.isEmpty()) {
        mapRef.current.fitBounds(bounds, { padding: 80, maxZoom: 15, duration: 1000 });
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
      <div className="h-full w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Mapbox Access Token Required</h3>
        <p className="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">
          To render interactive satellite maps and draw site polygons, please create a local{' '}
          <code className="text-amber-300 bg-slate-800 px-1.5 py-0.5 rounded font-mono">
            frontend/.env
          </code>{' '}
          file and configure your Mapbox public token.
        </p>
        <div className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-slate-300 border border-slate-800 text-left w-full max-w-md space-y-1">
          <div className="text-slate-500 font-sans text-[11px] mb-1">frontend/.env</div>
          <div>VITE_API_BASE_URL=http://localhost:8000</div>
          <div className="text-emerald-400 font-semibold">VITE_MAPBOX_TOKEN=pk.eyJ1Ijo...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-800">
      <div ref={mapContainerRef} className="w-full h-full min-h-[450px]" />

      {isDrawingMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur border border-emerald-500/50 px-4 py-2 rounded-xl text-xs font-medium text-emerald-400 flex items-center space-x-2 shadow-xl z-10 animate-pulse">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span>Polygon Drawing Mode Active: Click map to draw polygon boundary</span>
        </div>
      )}
    </div>
  );
};
