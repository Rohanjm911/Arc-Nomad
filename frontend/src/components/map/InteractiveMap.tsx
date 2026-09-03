'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapPin, PlusCircle, Navigation, Layers, Compass, Crosshair, Globe } from 'lucide-react';
import { ItineraryItem, Recommendation } from '../../types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export type MapStyle = 'osm' | 'dark' | 'satellite' | 'streets';

interface MapStyleConfig {
  id: MapStyle;
  name: string;
  url: string;
  attribution: string;
  subdomains?: string;
  maxZoom?: number;
}

const CARTO_API_KEY = process.env.NEXT_PUBLIC_CARTO_API_KEY || 'cb1_2vep_1_9546c170df238ee0af73db4d';

const FREE_LEAFLET_STYLES: Record<MapStyle, MapStyleConfig> = {
  osm: {
    id: 'osm',
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
    subdomains: 'abc',
    maxZoom: 19,
  },
  dark: {
    id: 'dark',
    name: 'Dark Matter',
    url: CARTO_API_KEY
      ? `https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png?key=${CARTO_API_KEY}`
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 19,
  },
  streets: {
    id: 'streets',
    name: 'Voyager',
    url: CARTO_API_KEY
      ? `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=${CARTO_API_KEY}`
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 19,
  },
  satellite: {
    id: 'satellite',
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, Earthstar Geographics',
    maxZoom: 18,
  },
};

interface MapLocation {
  id: string;
  title: string;
  category: string;
  latitude: number;
  longitude: number;
  description?: string;
  address?: string;
  cost?: number;
  type: 'itinerary' | 'recommendation';
  orderIndex?: number;
}

interface InteractiveMapProps {
  destination: string;
  centerLat?: number;
  centerLng?: number;
  itineraryItems?: ItineraryItem[];
  recommendations?: Recommendation[];
  selectedLocation?: { lat: number; lng: number; title: string } | null;
  onAddRecommendationToItinerary?: (recId: string) => void;
  initialStyle?: MapStyle;
}

const EMPTY_ITINERARY_ITEMS: ItineraryItem[] = [];
const EMPTY_RECOMMENDATIONS: Recommendation[] = [];

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  destination,
  centerLat = 35.6762,
  centerLng = 139.6503,
  itineraryItems = EMPTY_ITINERARY_ITEMS,
  recommendations = EMPTY_RECOMMENDATIONS,
  selectedLocation,
  onAddRecommendationToItinerary,
  initialStyle = 'dark',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const polylineLayerRef = useRef<any>(null);

  const [activeMarker, setActiveMarker] = useState<MapLocation | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [currentStyle, setCurrentStyle] = useState<MapStyle>(initialStyle);
  const [isMapReady, setIsMapReady] = useState(false);

  // Consolidate all geo locations
  const locations: MapLocation[] = useMemo(() => {
    const list: MapLocation[] = [];

    itineraryItems.forEach((item, idx) => {
      if (item.latitude && item.longitude) {
        list.push({
          id: item.id,
          title: item.title,
          category: item.category || 'SIGHTSEEING',
          latitude: item.latitude,
          longitude: item.longitude,
          description: item.description || undefined,
          address: item.address || item.location_name || undefined,
          cost: item.estimated_cost,
          type: 'itinerary',
          orderIndex: idx + 1,
        });
      }
    });

    recommendations.forEach((rec) => {
      if (rec.latitude && rec.longitude) {
        list.push({
          id: rec.id,
          title: rec.name,
          category: rec.category || 'Attractions',
          latitude: rec.latitude,
          longitude: rec.longitude,
          description: rec.description || undefined,
          address: rec.address || undefined,
          type: 'recommendation',
        });
      }
    });

    return list;
  }, [itineraryItems, recommendations]);

  const filteredLocations = useMemo(() => {
    if (filterCategory === 'ALL') return locations;
    return locations.filter((l) => l.category.toUpperCase().includes(filterCategory.toUpperCase()));
  }, [locations, filterCategory]);

  const locationsRef = useRef(locations);
  locationsRef.current = locations;

  // Initialize Leaflet Map
  useEffect(() => {
    let isMounted = true;

    async function initLeaflet() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;

      const L = (await import('leaflet')).default;

      if (!isMounted) return;

      if (!mapInstanceRef.current && mapContainerRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [centerLat, centerLng],
          zoom: 13,
          zoomControl: false,
        });

        // Initialize free Leaflet tile layer
        const styleConfig = FREE_LEAFLET_STYLES[currentStyle];
        const tileLayer = L.tileLayer(styleConfig.url, {
          attribution: styleConfig.attribution,
          subdomains: styleConfig.subdomains || 'abc',
          maxZoom: styleConfig.maxZoom || 19,
        }).addTo(map);

        tileLayerRef.current = tileLayer;

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        const markersLayer = L.layerGroup().addTo(map);
        const polylineLayer = L.layerGroup().addTo(map);

        markersLayerRef.current = markersLayer;
        polylineLayerRef.current = polylineLayer;
        mapInstanceRef.current = map;
        setIsMapReady(true);
      }
    }

    initLeaflet();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        tileLayerRef.current = null;
        markersLayerRef.current = null;
        polylineLayerRef.current = null;
        setIsMapReady(false);
      }
    };
  }, []);

  // Update Free Leaflet Tile Layer on style toggle
  useEffect(() => {
    async function switchTileLayer() {
      if (!mapInstanceRef.current || !isMapReady) return;
      const L = (await import('leaflet')).default;

      if (tileLayerRef.current) {
        mapInstanceRef.current.removeLayer(tileLayerRef.current);
      }

      const styleConfig = FREE_LEAFLET_STYLES[currentStyle];
      const newLayer = L.tileLayer(styleConfig.url, {
        attribution: styleConfig.attribution,
        subdomains: styleConfig.subdomains || 'abc',
        maxZoom: styleConfig.maxZoom || 19,
      }).addTo(mapInstanceRef.current);

      tileLayerRef.current = newLayer;
      newLayer.bringToBack();
    }

    switchTileLayer();
  }, [currentStyle, isMapReady]);

  // Sync center when centerLat / centerLng changes
  useEffect(() => {
    if (mapInstanceRef.current && centerLat && centerLng) {
      mapInstanceRef.current.flyTo([centerLat, centerLng], 13, { duration: 1.2 });
    }
  }, [centerLat, centerLng]);

  // Update Markers & Route lines when locations change
  useEffect(() => {
    async function renderMarkers() {
      if (!mapInstanceRef.current || !markersLayerRef.current || !polylineLayerRef.current) return;

      const L = (await import('leaflet')).default;
      const markersLayer = markersLayerRef.current;
      const polylineLayer = polylineLayerRef.current;

      markersLayer.clearLayers();
      polylineLayer.clearLayers();

      const routePoints: [number, number][] = [];

      filteredLocations.forEach((loc) => {
        const isItinerary = loc.type === 'itinerary';
        if (isItinerary) {
          routePoints.push([loc.latitude, loc.longitude]);
        }

        const markerHtml = `
          <div class="relative flex items-center justify-center cursor-pointer group transition-transform duration-200 hover:scale-115">
            <div class="absolute -inset-1.5 rounded-full ${
              isItinerary ? 'bg-cyan-500/30 animate-pulse' : 'bg-purple-500/30'
            } blur-[3px]"></div>
            <div class="w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 ${
              isItinerary
                ? 'bg-slate-900 border-cyan-400 text-cyan-300'
                : 'bg-slate-900 border-purple-400 text-purple-300'
            } text-xs font-black">
              ${loc.orderIndex ? loc.orderIndex : isItinerary ? '★' : '✦'}
            </div>
          </div>
        `;

        const customIcon = L.divIcon({
          className: 'custom-leaflet-marker',
          html: markerHtml,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([loc.latitude, loc.longitude], { icon: customIcon }).addTo(markersLayer);

        marker.on('click', () => {
          setActiveMarker(loc);
          mapInstanceRef.current.flyTo([loc.latitude, loc.longitude], 15, { duration: 0.8 });
        });
      });

      // Destination center landmark pin
      if (centerLat && centerLng) {
        const destIcon = L.divIcon({
          className: 'custom-leaflet-center',
          html: `
            <div class="relative flex items-center justify-center pointer-events-none">
              <div class="absolute -inset-2 rounded-full bg-blue-500/25 animate-ping"></div>
              <div class="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-xl"></div>
            </div>
          `,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });
        L.marker([centerLat, centerLng], { icon: destIcon }).addTo(markersLayer);
      }

      // Draw route connecting itinerary stops
      if (routePoints.length >= 2) {
        L.polyline(routePoints, {
          color: '#38bdf8',
          weight: 3,
          opacity: 0.8,
          dashArray: '6, 8',
          lineCap: 'round',
        }).addTo(polylineLayer);
      }

      // Auto-fit if markers exist
      if (filteredLocations.length >= 2) {
        const bounds = L.latLngBounds(filteredLocations.map((l) => [l.latitude, l.longitude]));
        mapInstanceRef.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
      }
    }

    if (isMapReady) {
      renderMarkers();
    }
  }, [filteredLocations, isMapReady, centerLat, centerLng]);

  // Handle selectedLocation changes
  useEffect(() => {
    if (selectedLocation?.lat && selectedLocation?.lng && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([selectedLocation.lat, selectedLocation.lng], 15, { duration: 1.0 });
      const match = locationsRef.current.find(
        (l) => Math.abs(l.latitude - selectedLocation.lat) < 0.001 && Math.abs(l.longitude - selectedLocation.lng) < 0.001
      );
      if (match) {
        setActiveMarker((prev) => (prev?.id === match.id ? prev : match));
      } else {
        setActiveMarker((prev) => {
          if (
            prev?.latitude === selectedLocation.lat &&
            prev?.longitude === selectedLocation.lng &&
            prev?.title === selectedLocation.title
          ) {
            return prev;
          }
          return {
            id: 'selected',
            title: selectedLocation.title,
            category: 'SIGHTSEEING',
            latitude: selectedLocation.lat,
            longitude: selectedLocation.lng,
            type: 'itinerary',
          };
        });
      }
    }
  }, [selectedLocation?.lat, selectedLocation?.lng, selectedLocation?.title]);

  const handleResetToCenter = () => {
    if (mapInstanceRef.current && centerLat && centerLng) {
      mapInstanceRef.current.flyTo([centerLat, centerLng], 13, { duration: 1.0 });
      setActiveMarker(null);
    }
  };

  const handleFitAll = () => {
    if (mapInstanceRef.current && locations.length > 0) {
      const L = (window as any).L;
      if (L) {
        const bounds = L.latLngBounds(locations.map((l) => [l.latitude, l.longitude]));
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
      } else {
        const lats = locations.map((l) => l.latitude);
        const lngs = locations.map((l) => l.longitude);
        mapInstanceRef.current.fitBounds([
          [Math.min(...lats), Math.min(...lngs)],
          [Math.max(...lats), Math.max(...lngs)],
        ], { padding: [50, 50] });
      }
    }
  };

  return (
    <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl h-[620px] flex flex-col">
      {/* Top Floating Action Bar */}
      <div className="absolute top-4 left-4 right-4 z-[400] flex flex-wrap items-center justify-between gap-2.5 pointer-events-none">
        {/* Category Filters */}
        <div className="flex items-center gap-1 p-1.5 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-xl pointer-events-auto">
          {['ALL', 'SIGHTSEEING', 'FOOD', 'ACTIVITY', 'HOTEL'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterCategory === cat
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat === 'ALL' ? 'All Pins' : cat}
            </button>
          ))}
        </div>

        {/* Free Leaflet Style Selector & Location Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Leaflet Free Maps Style Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 px-1.5 flex items-center gap-1">
              <Globe className="w-3 h-3 text-cyan-400" />
              Style:
            </span>
            {[
              { id: 'dark', label: 'Dark' },
              { id: 'osm', label: 'OpenStreetMap' },
              { id: 'satellite', label: 'Satellite' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setCurrentStyle(st.id as MapStyle)}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  currentStyle === st.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleFitAll}
            title="Fit all stops into view"
            className="p-2 px-3 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Crosshair className="w-3.5 h-3.5 text-blue-400" />
            <span>Fit All</span>
          </button>

          <button
            onClick={handleResetToCenter}
            title={`Center on ${destination}`}
            className="p-2 px-3 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span className="max-w-[120px] truncate">{destination}</span>
            <span className="w-1 h-1 rounded-full bg-slate-500" />
            <span className="text-slate-400">{filteredLocations.length} pins</span>
          </button>
        </div>
      </div>

      {/* Main Map Canvas */}
      <div className="relative w-full flex-1 bg-slate-950">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Active Marker Popup Card */}
        {activeMarker && (
          <div className="absolute bottom-6 left-6 right-6 sm:right-auto sm:max-w-sm z-[400] animate-in fade-in slide-in-from-bottom-3 duration-200">
            <Card className="p-4 bg-slate-900/95 backdrop-blur-xl border-blue-500/40 shadow-2xl shadow-black/80">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Badge variant={activeMarker.type === 'itinerary' ? 'primary' : 'purple'} size="sm">
                      {activeMarker.category}
                    </Badge>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      {activeMarker.type === 'itinerary' ? 'Itinerary Stop' : 'Discovery Spot'}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white leading-snug">{activeMarker.title}</h4>
                </div>
                <button
                  onClick={() => setActiveMarker(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 text-xs"
                >
                  ✕
                </button>
              </div>

              {activeMarker.description && (
                <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                  {activeMarker.description}
                </p>
              )}

              {activeMarker.address && (
                <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span className="truncate">{activeMarker.address}</span>
                </p>
              )}

              <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">
                  {activeMarker.latitude.toFixed(4)}, {activeMarker.longitude.toFixed(4)}
                </span>

                {activeMarker.type === 'recommendation' && onAddRecommendationToItinerary && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => onAddRecommendationToItinerary(activeMarker.id)}
                    className="text-xs gap-1 py-1 px-2.5 font-bold"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Add to Day
                  </Button>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Bottom Horizontal Plotted Stops Drawer */}
      <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 px-2 flex items-center gap-1">
          <Navigation className="w-3 h-3 text-cyan-400" />
          Mapped Stops:
        </span>
        {filteredLocations.length === 0 ? (
          <span className="text-xs text-slate-500 italic">No stops plotted yet for this view</span>
        ) : (
          filteredLocations.map((loc) => (
            <button
              key={loc.id}
              onClick={() => {
                setActiveMarker(loc);
                if (mapInstanceRef.current) {
                  mapInstanceRef.current.flyTo([loc.latitude, loc.longitude], 15, { duration: 0.8 });
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all cursor-pointer border ${
                activeMarker?.id === loc.id
                  ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/30'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  loc.type === 'itinerary' ? 'bg-cyan-400' : 'bg-purple-400'
                }`}
              />
              <span className="max-w-[140px] truncate">{loc.title}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
};
