export interface GeoJSONPolygon {
  type: 'Polygon';
  coordinates: number[][][];
}

export interface Site {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  area: number | null;
  geometry: GeoJSONPolygon;
  created_at: string;
  updated_at: string;
}

export interface SiteCreateInput {
  name: string;
  description?: string;
  area?: number;
  geometry: GeoJSONPolygon;
}

export interface SiteUpdateInput {
  name?: string;
  description?: string;
  area?: number;
  geometry?: GeoJSONPolygon;
}
