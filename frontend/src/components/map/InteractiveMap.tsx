'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  MapPin,
  PlusCircle,
  Navigation,
  Layers,
  Compass,
  Crosshair,
  Globe,
  Search,
  Calendar,
  Clock,
  Coins,
  Maximize2,
  Minimize2,
  ChevronRight,
  Sparkles,
  X,
  Eye,
} from 'lucide-react';
import { ItineraryItem, Recommendation, ItineraryDay } from '../../types';
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

export interface MapLocation {
  id: string;
  title: string;
  category: string;
  latitude: number;
  longitude: number;
  description?: string;
  address?: string;
  cost?: number;
  type: 'itinerary' | 'recommendation';
  dayNumber?: number;
  dayId?: string;
  orderIndex?: number;
  startTime?: string;
  endTime?: string;
}

interface InteractiveMapProps {
  destination: string;
  centerLat?: number;
  centerLng?: number;
  days?: ItineraryDay[];
  itineraryItems?: ItineraryItem[];
  recommendations?: Recommendation[];
  selectedLocation?: { lat: number; lng: number; title: string } | null;
  onAddRecommendationToItinerary?: (recId: string) => void;
  initialStyle?: MapStyle;
  compact?: boolean;
}

const EMPTY_DAYS: ItineraryDay[] = [];
const EMPTY_ITINERARY_ITEMS: ItineraryItem[] = [];
const EMPTY_RECOMMENDATIONS: Recommendation[] = [];

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  destination,
  centerLat = 35.6762,
  centerLng = 139.6503,
  days = EMPTY_DAYS,
  itineraryItems = EMPTY_ITINERARY_ITEMS,
  recommendations = EMPTY_RECOMMENDATIONS,
  selectedLocation,
  onAddRecommendationToItinerary,
  initialStyle = 'dark',
  compact = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const polylineLayerRef = useRef<any>(null);

  const [activeMarker, setActiveMarker] = useState<MapLocation | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('ALL'); // 'ALL', 'DISCOVERY', or dayNumber string e.g. '1'
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentStyle, setCurrentStyle] = useState<MapStyle>(initialStyle);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'map' | 'list'>('map');

  // Consolidate all geo-locations across itinerary days and recommendations
  const allLocations: MapLocation[] = useMemo(() => {
    const list: MapLocation[] = [];

    // If days are provided with items, parse by day structure
    if (days.length > 0) {
      days.forEach((d) => {
        d.items?.forEach((item, idx) => {
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
              dayNumber: d.day_number,
              dayId: d.id,
              orderIndex: idx + 1,
              startTime: item.start_time || undefined,
              endTime: item.end_time || undefined,
            });
          }
        });
      });
    } else {
      // Fallback to flat itineraryItems list
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
            startTime: item.start_time || undefined,
            endTime: item.end_time || undefined,
          });
        }
      });
    }

    // Append AI discoveries
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
  }, [days, itineraryItems, recommendations]);

  // Filtered by Day, Category, and Search Query
  const filteredLocations = useMemo(() => {
    return allLocations.filter((l) => {
      // 1. Day Filter
      if (selectedDayFilter === 'DISCOVERY' && l.type !== 'recommendation') {
        return false;
      }
      if (selectedDayFilter !== 'ALL' && selectedDayFilter !== 'DISCOVERY') {
        const dayNum = parseInt(selectedDayFilter, 10);
        if (l.type !== 'itinerary' || l.dayNumber !== dayNum) {
          return false;
        }
      }

      // 2. Category Filter
      if (filterCategory !== 'ALL' && !l.category.toUpperCase().includes(filterCategory.toUpperCase())) {
        return false;
      }

      // 3. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = l.title.toLowerCase().includes(q);
        const matchesAddress = l.address ? l.address.toLowerCase().includes(q) : false;
        const matchesCategory = l.category.toLowerCase().includes(q);
        if (!matchesTitle && !matchesAddress && !matchesCategory) {
          return false;
        }
      }

      return true;
    });
  }, [allLocations, selectedDayFilter, filterCategory, searchQuery]);

  const locationsRef = useRef(allLocations);
  useEffect(() => {
    locationsRef.current = allLocations;
  }, [allLocations]);

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
          scrollWheelZoom: false,
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

  // Update Tile Layer on style toggle
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

  // Sync center when coordinates change
  useEffect(() => {
    if (mapInstanceRef.current && centerLat && centerLng) {
      mapInstanceRef.current.flyTo([centerLat, centerLng], 13, { duration: 1.0 });
    }
  }, [centerLat, centerLng]);

  // Update Markers & Connected Polyline Route Lines
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
        const isSelected = activeMarker?.id === loc.id;

        if (isItinerary) {
          routePoints.push([loc.latitude, loc.longitude]);
        }

        // Custom Solid Marker (Strict Dual-Tone: Tone 1 = Blue/Itinerary, Tone 2 = Cyan/Discovery)
        const markerHtml = `
          <div class="relative flex items-center justify-center cursor-pointer transition-transform duration-150 hover:scale-110 select-none">
            <div class="w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs shadow-lg border-2 ${
              isItinerary
                ? isSelected
                  ? 'bg-blue-600 text-white border-white ring-2 ring-blue-400'
                  : 'bg-slate-950 text-blue-400 border-blue-500'
                : isSelected
                ? 'bg-cyan-500 text-slate-950 border-white ring-2 ring-cyan-300'
                : 'bg-slate-950 text-cyan-300 border-cyan-400'
            }">
              ${loc.orderIndex != null ? loc.orderIndex : isItinerary ? '★' : '✦'}
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

      // Destination center landmark pin (Dual-Tone Concentric Beacon)
      if (centerLat && centerLng) {
        const destIcon = L.divIcon({
          className: 'custom-leaflet-center',
          html: `
            <div class="relative flex items-center justify-center pointer-events-none">
              <div class="w-5 h-5 rounded-full bg-blue-600/30 border border-cyan-400 flex items-center justify-center shadow-lg">
                <div class="w-2 h-2 rounded-full bg-cyan-400"></div>
              </div>
            </div>
          `,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });
        L.marker([centerLat, centerLng], { icon: destIcon }).addTo(markersLayer);
      }

      // Draw connected solid route line
      if (routePoints.length >= 2) {
        L.polyline(routePoints, {
          color: '#38bdf8',
          weight: 3,
          opacity: 0.9,
          dashArray: '6, 8',
          lineCap: 'round',
        }).addTo(polylineLayer);
      }

      // Auto-fit if multiple markers exist
      if (filteredLocations.length >= 2) {
        const bounds = L.latLngBounds(filteredLocations.map((l) => [l.latitude, l.longitude]));
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    }

    if (isMapReady) {
      renderMarkers();
    }
  }, [filteredLocations, isMapReady, centerLat, centerLng, activeMarker?.id]);

  // Handle external selectedLocation
  useEffect(() => {
    if (selectedLocation?.lat && selectedLocation?.lng && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([selectedLocation.lat, selectedLocation.lng], 15, { duration: 1.0 });
      const match = locationsRef.current.find(
        (l) => Math.abs(l.latitude - selectedLocation.lat) < 0.001 && Math.abs(l.longitude - selectedLocation.lng) < 0.001
      );
      if (match) {
        setActiveMarker(match);
      }
    }
  }, [selectedLocation?.lat, selectedLocation?.lng, selectedLocation?.title]);

  const handleFlyTo = (loc: MapLocation) => {
    setActiveMarker(loc);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([loc.latitude, loc.longitude], 15, { duration: 0.8 });
    }
    if (mobileTab === 'list') {
      setMobileTab('map');
    }
  };

  const handleResetToCenter = () => {
    if (mapInstanceRef.current && centerLat && centerLng) {
      mapInstanceRef.current.flyTo([centerLat, centerLng], 13, { duration: 1.0 });
      setActiveMarker(null);
    }
  };

  const handleFitAll = () => {
    if (mapInstanceRef.current && filteredLocations.length > 0) {
      const lats = filteredLocations.map((l) => l.latitude);
      const lngs = filteredLocations.map((l) => l.longitude);
      mapInstanceRef.current.fitBounds([
        [Math.min(...lats), Math.min(...lngs)],
        [Math.max(...lats), Math.max(...lngs)],
      ], { padding: [60, 60] });
    }
  };

  // If in compact mode (e.g. inside trip creation modal), render a simplified canvas
  if (compact) {
    return (
      <div className="relative w-full h-full rounded-2xl overflow-hidden border border-theme-subtle bg-slate-950">
        <div ref={mapContainerRef} className="w-full h-full z-0" />
        <div className="absolute top-3 left-3 z-[400] px-2.5 py-1 rounded-lg bg-theme-surface/90 backdrop-blur border border-theme-subtle text-xs font-bold text-slate-200 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-teal-400" />
          <span>{destination}</span>
        </div>
      </div>
    );
  }

  // Calculate day-specific route stats
  const itineraryStopsInFilter = filteredLocations.filter((l) => l.type === 'itinerary');
  const totalEstimatedCost = itineraryStopsInFilter.reduce((sum, l) => sum + (Number(l.cost) || 0), 0);

  return (
    <div
      className={`relative rounded-3xl overflow-hidden border border-theme-subtle bg-theme-surface shadow-2xl transition-all ${
        isFullscreen ? 'fixed inset-4 z-50 rounded-2xl' : 'w-full min-h-[680px]'
      } flex flex-col`}
    >
      {/* 1. Pro Studio Top Control Bar (Solid Matte, Zero Gradients) */}
      <div className="p-4 bg-theme-surface border-b border-theme-subtle flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-theme-surface-raised border border-theme-subtle text-cyan-400">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-white tracking-tight flex items-center gap-1.5">
                <span>Spatial Map Studio</span>
                <span className="text-slate-500">•</span>
                <span className="text-teal-400">{destination}</span>
              </h3>
              <Badge variant="primary" size="sm">
                {filteredLocations.length} Pins Plotted
              </Badge>
              <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-theme-surface-raised border border-theme-subtle text-[10px] font-mono">
                <span className="w-2 h-2 rounded-full bg-blue-500 shadow-sm" />
                <span className="text-blue-400 font-bold">Stops</span>
                <span className="text-slate-600">/</span>
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-sm" />
                <span className="text-cyan-300 font-bold">Discoveries</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              Interactive spatial routing, day-by-day sequence, and curated discoveries.
            </p>
          </div>
        </div>

        {/* Right Controls: Map Layers & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mobile Tab Switcher */}
          <div className="flex lg:hidden items-center p-1 rounded-xl bg-theme-surface-raised border border-theme-subtle">
            <button
              onClick={() => setMobileTab('map')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                mobileTab === 'map' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Map Canvas
            </button>
            <button
              onClick={() => setMobileTab('list')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                mobileTab === 'list' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Stop List ({filteredLocations.length})
            </button>
          </div>

          {/* Map Layer Style Switcher */}
          <div className="hidden sm:flex items-center gap-1 p-1 rounded-xl bg-theme-surface-raised border border-theme-subtle">
            <span className="text-[10px] uppercase font-bold text-slate-400 px-1.5 flex items-center gap-1">
              <Globe className="w-3 h-3 text-cyan-400" />
              Layer:
            </span>
            {[
              { id: 'dark', label: 'Dark Matter' },
              { id: 'streets', label: 'Voyager' },
              { id: 'satellite', label: 'Satellite' },
              { id: 'osm', label: 'OSM' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setCurrentStyle(st.id as MapStyle)}
                className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  currentStyle === st.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-theme-surface'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleFitAll}
            title="Fit all markers into view"
            className="px-3 py-1.5 rounded-xl bg-theme-surface-raised border border-theme-subtle text-xs font-semibold text-slate-300 hover:text-white hover:border-theme-strong transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Crosshair className="w-3.5 h-3.5 text-blue-400" />
            <span>Fit All</span>
          </button>

          <button
            onClick={handleResetToCenter}
            title={`Recenter on ${destination}`}
            className="px-3 py-1.5 rounded-xl bg-theme-surface-raised border border-theme-subtle text-xs font-semibold text-slate-300 hover:text-white hover:border-theme-strong transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-teal-400" />
            <span>Recenter</span>
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
            className="p-2 rounded-xl bg-theme-surface-raised border border-theme-subtle text-slate-300 hover:text-white hover:border-theme-strong transition-colors cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. Main Studio Workspace: Left Side Directory + Right Map Canvas */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-[580px] overflow-hidden">
        {/* Left Side Panel: Spatial Itinerary & Stop Directory */}
        <div
          className={`w-full lg:w-[380px] xl:w-[420px] bg-theme-surface border-b lg:border-b-0 lg:border-r border-theme-subtle flex flex-col shrink-0 ${
            mobileTab === 'map' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Search & Quick Filter */}
          <div className="p-3 border-b border-theme-subtle space-y-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search mapped stops or streets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl bg-theme-surface-raised border border-theme-subtle pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Day Selector Pills */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-1">
              <button
                onClick={() => setSelectedDayFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 transition-colors cursor-pointer ${
                  selectedDayFilter === 'ALL'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-theme-surface-raised'
                }`}
              >
                All Days
              </button>

              {days.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDayFilter(d.day_number.toString())}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1 ${
                    selectedDayFilter === d.day_number.toString()
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-theme-surface-raised'
                  }`}
                >
                  <span>Day {d.day_number}</span>
                  {d.items && d.items.length > 0 && (
                    <span className="text-[10px] opacity-75">({d.items.length})</span>
                  )}
                </button>
              ))}

              <button
                onClick={() => setSelectedDayFilter('DISCOVERY')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1 ${
                  selectedDayFilter === 'DISCOVERY'
                    ? 'bg-cyan-500 text-slate-950'
                    : 'text-cyan-400 border border-cyan-800/40 bg-cyan-950/30 hover:bg-cyan-950/60'
                }`}
              >
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>Discoveries ({recommendations.length})</span>
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-0.5">
              {['ALL', 'SIGHTSEEING', 'FOOD', 'ACTIVITY', 'HOTEL'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-semibold shrink-0 transition-colors cursor-pointer ${
                    filterCategory === cat
                      ? 'bg-theme-surface-raised text-white border border-theme-strong'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {cat === 'ALL' ? 'All Types' : cat.toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Route Summary Metric Strip */}
          {selectedDayFilter !== 'ALL' && selectedDayFilter !== 'DISCOVERY' && (
            <div className="px-4 py-2 bg-theme-surface-raised/50 border-b border-theme-subtle flex items-center justify-between text-xs">
              <span className="text-slate-400">
                Day {selectedDayFilter} Route: <strong className="text-white">{itineraryStopsInFilter.length} Stops</strong>
              </span>
              {totalEstimatedCost > 0 && (
                <span className="text-slate-400">
                  Est. Cost: <strong className="text-cyan-400 font-mono">${totalEstimatedCost.toFixed(0)}</strong>
                </span>
              )}
            </div>
          )}

          {/* Scrollable Plotted Stops List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-none">
            {filteredLocations.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <Compass className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400 font-semibold">No plotted stops match this filter.</p>
                <p className="text-[11px] text-slate-500">
                  Try switching the day filter or clearing the search box.
                </p>
              </div>
            ) : (
              filteredLocations.map((loc) => {
                const isSelected = activeMarker?.id === loc.id;
                const isItinerary = loc.type === 'itinerary';

                return (
                  <div
                    key={loc.id}
                    onClick={() => handleFlyTo(loc)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                      isSelected
                        ? 'bg-blue-600/15 border-blue-500/80 shadow-md ring-1 ring-blue-500/30'
                        : 'bg-theme-surface-raised border-theme-subtle hover:border-theme-strong hover:bg-theme-surface-raised/80'
                    }`}
                  >
                    {/* Marker Badge Number (Dual-Tone) */}
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-extrabold text-xs shrink-0 mt-0.5 border ${
                        isItinerary
                          ? isSelected
                            ? 'bg-blue-600 text-white border-white'
                            : 'bg-slate-950 text-blue-400 border-blue-500/60'
                          : isSelected
                          ? 'bg-cyan-500 text-slate-950 border-white'
                          : 'bg-slate-950 text-cyan-300 border-cyan-500/60'
                      }`}
                    >
                      {loc.orderIndex != null ? loc.orderIndex : isItinerary ? '★' : '✦'}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-white truncate">{loc.title}</h4>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border shrink-0 ${
                          isItinerary
                            ? 'bg-blue-950/60 border-blue-800/40 text-blue-300'
                            : 'bg-cyan-950/60 border-cyan-800/40 text-cyan-300'
                        }`}>
                          {loc.category}
                        </span>
                      </div>

                      {loc.address && (
                        <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                          <span>{loc.address}</span>
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                        {loc.startTime && (
                          <span className="flex items-center gap-1 text-slate-300">
                            <Clock className="w-3 h-3 text-cyan-400" />
                            {loc.startTime} {loc.endTime ? `– ${loc.endTime}` : ''}
                          </span>
                        )}

                        {loc.cost != null && loc.cost > 0 && (
                          <span className="text-cyan-400 font-semibold font-mono">
                            ${Number(loc.cost).toFixed(0)}
                          </span>
                        )}

                        {loc.type === 'recommendation' && onAddRecommendationToItinerary && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddRecommendationToItinerary(loc.id);
                            }}
                            className="px-2 py-0.5 rounded-md bg-cyan-950 text-cyan-300 border border-cyan-700/60 hover:bg-cyan-600 hover:text-white text-[10px] font-bold transition-colors ml-auto"
                          >
                            + Add to Day
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Map Canvas Container */}
        <div
          className={`flex-1 relative bg-slate-950 min-h-[500px] ${
            mobileTab === 'list' ? 'hidden lg:block' : 'block'
          }`}
        >
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Floating Marker Detail Card (Bottom Left Overlay) */}
          {activeMarker && (
            <div className="absolute bottom-6 left-6 right-6 sm:right-auto sm:max-w-sm z-[400] animate-in fade-in slide-in-from-bottom-2 duration-150">
              <Card className="p-4 bg-theme-surface/95 backdrop-blur-xl border-blue-500/50 shadow-2xl space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Badge variant={activeMarker.type === 'itinerary' ? 'primary' : 'teal'} size="sm">
                        {activeMarker.category}
                      </Badge>
                      {activeMarker.dayNumber != null && (
                        <span className="text-[10px] font-bold text-blue-300 px-1.5 py-0.5 rounded bg-blue-950 border border-blue-800/40">
                          Day {activeMarker.dayNumber}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-white leading-snug">{activeMarker.title}</h4>
                  </div>
                  <button
                    onClick={() => setActiveMarker(null)}
                    className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-theme-surface-raised text-xs cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {activeMarker.description && (
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                    {activeMarker.description}
                  </p>
                )}

                {activeMarker.address && (
                  <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span className="truncate">{activeMarker.address}</span>
                  </p>
                )}

                <div className="pt-2.5 border-t border-theme-subtle flex items-center justify-between text-xs">
                  <span className="font-mono text-[11px] text-slate-400">
                    {activeMarker.latitude.toFixed(4)}, {activeMarker.longitude.toFixed(4)}
                  </span>

                  {activeMarker.type === 'recommendation' && onAddRecommendationToItinerary ? (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => onAddRecommendationToItinerary(activeMarker.id)}
                      className="text-xs gap-1 py-1 px-3 font-bold"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      Add to Day
                    </Button>
                  ) : (
                    <button
                      onClick={() => {
                        window.open(
                          `https://www.google.com/maps/search/?api=1&query=${activeMarker.latitude},${activeMarker.longitude}`,
                          '_blank'
                        );
                      }}
                      className="text-cyan-400 hover:underline text-[11px] font-semibold flex items-center gap-1"
                    >
                      Google Maps &rarr;
                    </button>
                  )}
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
