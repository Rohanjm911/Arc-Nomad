'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Compass,
  Sparkles,
  MapPin,
  Calendar,
  DollarSign,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Navigation,
} from 'lucide-react';
import { useAuth } from '../../../store/AuthContext';
import { tripService } from '../../../services/tripService';
import { itineraryService } from '../../../services/itineraryService';
import { InteractiveMap } from '../../../components/map/InteractiveMap';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { CurrencySelect } from '../../../components/ui/CurrencySelect';
import { CountryFlag } from '../../../components/ui/CountryFlag';
import { getCurrencySymbol } from '../../../services/currencyService';

const DESTINATION_PRESETS = [
  { name: 'Tokyo, Japan', lat: 35.6762, lng: 139.6503, image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80', vibe: 'Metropolis & Culinary' },
  { name: 'Rome & Amalfi Coast, Italy', lat: 41.9028, lng: 12.4964, image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80', vibe: 'Historic & Scenic' },
  { name: 'Swiss Alps, Switzerland', lat: 46.5592, lng: 7.9868, image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80', vibe: 'Alpine Adventure' },
  { name: 'Reykjavik, Iceland', lat: 64.1466, lng: -21.9426, image: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=1200&q=80', vibe: 'Glaciers & Auroras' },
  { name: 'Kyoto, Japan', lat: 35.0116, lng: 135.7681, image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80', vibe: 'Temples & Traditional' },
  { name: 'Barcelona, Spain', lat: 41.3851, lng: 2.1734, image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1200&q=80', vibe: 'Art, Beach & Tapas' },
];

function CreateTripForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialAi = searchParams.get('ai') === 'true';

  // Multi-step state (1 to 4)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form Fields
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [destinationLat, setDestinationLat] = useState<number | undefined>(undefined);
  const [destinationLng, setDestinationLng] = useState<number | undefined>(undefined);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('3000');
  const [currency, setCurrency] = useState('USD');
  const [coverImage, setCoverImage] = useState('');
  const [enableAI, setEnableAI] = useState(initialAi);
  const [aiTravelStyle, setAiTravelStyle] = useState('Balanced');
  const [pace, setPace] = useState('Moderate');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodedDisplayName, setGeocodedDisplayName] = useState('');

  // Debounced geocode when destination text changes
  useEffect(() => {
    if (!destination || destination.trim().length < 2) return;
    const timer = setTimeout(async () => {
      try {
        setIsGeocoding(true);
        const res = await tripService.geocode(destination);
        if (res && res.length > 0) {
          setDestinationLat(res[0].latitude);
          setDestinationLng(res[0].longitude);
          setGeocodedDisplayName(res[0].display_name);
        }
      } catch (err) {
        console.warn('Geocoding preview failed:', err);
      } finally {
        setIsGeocoding(false);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [destination]);

  const selectedMapLocation = useMemo(() => {
    if (destinationLat && destinationLng) {
      return { lat: destinationLat, lng: destinationLng, title: destination };
    }
    return null;
  }, [destinationLat, destinationLng, destination]);

  const handleSelectPreset = (preset: typeof DESTINATION_PRESETS[0]) => {
    setDestination(preset.name);
    setDestinationLat(preset.lat);
    setDestinationLng(preset.lng);
    setGeocodedDisplayName(preset.name);
    setCoverImage(preset.image);
    if (!title) {
      setTitle(`${preset.name.split(',')[0]} Expedition`);
    }
  };

  const handleNext = () => {
    setError(null);
    if (currentStep === 1) {
      if (!destination) {
        setError('Please enter or select a destination.');
        return;
      }
      if (!title) {
        setTitle(`${destination.split(',')[0]} Expedition`);
      }
    } else if (currentStep === 2) {
      if (!startDate || !endDate) {
        setError('Please select valid departure and return dates.');
        return;
      }
      if (new Date(startDate) > new Date(endDate)) {
        setError('Departure date must be before return date.');
        return;
      }
    }
    setCurrentStep((prev) => Math.min(4, prev + 1));
  };

  const handleBack = () => {
    setError(null);
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !destination || !startDate || !endDate) {
      setError('Please fill in trip title, destination, and valid dates.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Create Trip
      const newTrip = await tripService.createTrip({
        title,
        destination,
        destination_lat: destinationLat,
        destination_lng: destinationLng,
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
        budget: parseFloat(budget) || 0,
        currency,
        cover_image: coverImage || undefined,
      });

      // 2. Auto-Generate AI Itinerary if requested
      if (enableAI) {
        try {
          const start = new Date(startDate);
          const end = new Date(endDate);
          const diffDays = Math.max(1, Math.min(7, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))));

          await itineraryService.aiGenerateItinerary({
            trip_id: newTrip.id,
            destination: newTrip.destination,
            days_count: diffDays,
            interests: ['Culinary', 'Sightseeing', 'Culture', 'Local Highlights'],
            travel_style: aiTravelStyle,
            pace: pace,
            budget_tier: 'Moderate',
          });
        } catch (aiErr) {
          console.warn('AI generation skipped or delayed:', aiErr);
        }
      }

      router.push(`/trips/${newTrip.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create trip.');
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, title: 'Destination & Name' },
    { num: 2, title: 'Dates & Duration' },
    { num: 3, title: 'Budget & Style' },
    { num: 4, title: 'Review & Launch' },
  ];

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950 border border-blue-600/40 text-blue-300 text-xs font-bold">
          <Compass className="w-3.5 h-3.5 text-blue-400" />
          <span>EXPEDITION WIZARD</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Plan a New Journey
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Guided 4-step setup for collaborative itineraries, flight tracking, and expense splits.
        </p>
      </div>

      {/* Progress Stepper Bar (Solid, Clean, Clear Current Step) */}
      <div className="grid grid-cols-4 gap-2">
        {steps.map((s) => (
          <div key={s.num} className="space-y-1.5 text-center">
            <div
              className={`h-1.5 rounded-full transition-colors ${
                currentStep >= s.num ? 'bg-blue-600' : 'bg-slate-800'
              }`}
            />
            <span
              className={`text-[11px] font-bold block truncate ${
                currentStep === s.num ? 'text-blue-400' : currentStep > s.num ? 'text-slate-300' : 'text-slate-500'
              }`}
            >
              {s.num}. {s.title}
            </span>
          </div>
        ))}
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-800/60 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Wizard Form Card */}
      <Card className="p-6 bg-slate-900 border-slate-800 space-y-6">
        <form onSubmit={handleSubmit}>
          {/* STEP 1: Destination & Title */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <Input
                label="Destination City / Region"
                placeholder="e.g. Tokyo, Japan or Amalfi Coast, Italy"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                icon={<MapPin className="w-4 h-4" />}
                required
              />

              <Input
                label="Trip Title"
                placeholder="e.g. Tokyo Autumn Culinary Expedition"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                icon={<Compass className="w-4 h-4" />}
                required
              />

              {/* Destination Suggestions */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Featured Destinations
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {DESTINATION_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`p-3 rounded-xl text-left border transition-colors cursor-pointer ${
                        destination === preset.name
                          ? 'bg-blue-950 border-blue-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <p className="text-xs font-bold truncate">{preset.name.split(',')[0]}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">{preset.vibe}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Map Location Synchronization for the trip being planned */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                    <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Location Map: <span className="text-white">{destination || 'Select or type a destination'}</span></span>
                  </div>
                  {destinationLat && destinationLng ? (
                    <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-800/40 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                      {destinationLat.toFixed(4)}, {destinationLng.toFixed(4)}
                    </span>
                  ) : isGeocoding ? (
                    <span className="text-[11px] text-blue-400 animate-pulse font-medium">Detecting coordinates...</span>
                  ) : null}
                </div>

                <div className="h-[280px] rounded-xl overflow-hidden border border-slate-800/80">
                  <InteractiveMap
                    destination={destination || 'Select Destination'}
                    centerLat={destinationLat || 35.6762}
                    centerLng={destinationLng || 139.6503}
                    selectedLocation={selectedMapLocation}
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  The map automatically centers on your selected destination and pins its exact spatial coordinates for all itinerary and flight routes.
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: Dates & Duration */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Departure Date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  icon={<Calendar className="w-4 h-4" />}
                  required
                />
                <Input
                  label="Return Date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  icon={<Calendar className="w-4 h-4" />}
                  required
                />
              </div>

              {startDate && endDate && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Calculated Trip Duration:</span>
                  <span className="font-bold text-white">
                    {Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)))} Days
                  </span>
                </div>
              )}

              <Input
                label="Cover Image URL (Optional)"
                placeholder="https://images.unsplash.com/..."
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                helperText="Leave empty to use a scenic curated photo automatically."
              />
            </div>
          )}

          {/* STEP 3: Budget & Travel Style */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                <Input
                  label="Total Group Budget"
                  type="number"
                  placeholder="3000"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  icon={
                    <span className="text-xs font-mono font-bold text-slate-300">
                      {getCurrencySymbol(currency)}
                    </span>
                  }
                />
                <CurrencySelect
                  label="Primary Currency"
                  value={currency}
                  onChange={(val) => setCurrency(val)}
                />
              </div>

              {/* AI Itinerary Architect Toggle */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-bold text-white">AI Travel Architect</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableAI}
                    onChange={(e) => setEnableAI(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 text-purple-600 focus:ring-purple-500 cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Automatically structure day-by-day sightseeing, culinary hotspots, and estimated activity costs.
                </p>

                {enableAI && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                    <Select
                      label="Travel Persona"
                      value={aiTravelStyle}
                      onChange={(e) => setAiTravelStyle(e.target.value)}
                    >
                      <option value="Balanced">Balanced Highlights</option>
                      <option value="Cultural">Cultural & Historic</option>
                      <option value="Culinary">Foodie & Dining</option>
                      <option value="Adventure">Active & Outdoors</option>
                      <option value="Relaxed">Slow & Relaxed</option>
                    </Select>
                    <Select
                      label="Daily Pace"
                      value={pace}
                      onChange={(e) => setPace(e.target.value)}
                    >
                      <option value="Moderate">Moderate (4-5 stops/day)</option>
                      <option value="Relaxed">Relaxed (2-3 stops/day)</option>
                      <option value="Packed">Fast-Paced Sprint</option>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: Review & Launch */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-white pb-2 border-b border-slate-800">
                  Journey Summary
                </h3>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400">Trip Name:</span>
                    <p className="font-bold text-white mt-0.5">{title}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Destination:</span>
                    <p className="font-bold text-teal-400 mt-0.5 flex items-center gap-1">
                      <span>{destination}</span>
                      {destinationLat && destinationLng && (
                        <span className="text-[10px] font-mono text-slate-400">
                          ({destinationLat.toFixed(2)}, {destinationLng.toFixed(2)})
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Travel Dates:</span>
                    <p className="font-bold text-white mt-0.5">
                      {new Date(startDate).toLocaleDateString([], { month: 'short', day: 'numeric' })} –{' '}
                      {new Date(endDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Total Budget:</span>
                    <p className="font-bold text-white mt-0.5 flex items-center gap-1.5">
                      <CountryFlag currencyCode={currency} size="xs" />
                      <span>{currency} {Number(budget).toLocaleString()}</span>
                    </p>
                  </div>
                </div>

                {enableAI && (
                  <div className="pt-2 border-t border-slate-800 text-xs flex items-center gap-2 text-purple-300">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>The AI Travel Architect will build a custom {aiTravelStyle} plan on launch.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-800 mt-6">
            {currentStep > 1 ? (
              <Button type="button" variant="secondary" size="md" onClick={handleBack} disabled={loading} className="gap-1.5">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            ) : (
              <div />
            )}

            {currentStep < 4 ? (
              <Button type="button" variant="primary" size="md" onClick={handleNext} className="gap-1.5 font-bold">
                Continue
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button type="submit" variant="primary" size="md" loading={loading} className="gap-2 font-bold px-6">
                <Compass className="w-4 h-4" />
                Launch Expedition
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}

export default function CreateTripPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-slate-500">Loading Wizard...</div>}>
      <CreateTripForm />
    </Suspense>
  );
}
