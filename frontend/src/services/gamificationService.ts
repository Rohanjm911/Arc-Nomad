import { TripSummary } from '../types';

export interface ExplorerRank {
  level: number;
  title: string;
  badgeEmblem: string;
  minXp: number;
  maxXp: number;
  perk: string;
}

export interface PassportBadge {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: 'JOURNEY' | 'EXPLORATION' | 'BUDGET' | 'COLLECTIVE';
  unlocked: boolean;
  progressText: string;
}

export const RANKS: ExplorerRank[] = [
  {
    level: 1,
    title: 'Novice Wanderer',
    badgeEmblem: '🎒',
    minXp: 0,
    maxXp: 300,
    perk: 'Custom itinerary pins & travel notes',
  },
  {
    level: 2,
    title: 'Trailblazer',
    badgeEmblem: '🥾',
    minXp: 300,
    maxXp: 700,
    perk: 'AI Itinerary Architect & live weather integration',
  },
  {
    level: 3,
    title: 'Voyager',
    badgeEmblem: '🧭',
    minXp: 700,
    maxXp: 1300,
    perk: 'Live FX currency converter & export dossiers',
  },
  {
    level: 4,
    title: 'Globetrotter',
    badgeEmblem: '✈️',
    minXp: 1300,
    maxXp: 2200,
    perk: 'Atmospheric matrix themes & collective debt solver',
  },
  {
    level: 5,
    title: 'Apex Nomad',
    badgeEmblem: '👑',
    minXp: 2200,
    maxXp: 4000,
    perk: 'Master explorer insignia & verified nomad passport',
  },
];

export interface GamificationStats {
  totalXp: number;
  currentRank: ExplorerRank;
  nextRank: ExplorerRank | null;
  progressPercent: number;
  xpToNextLevel: number;
  badges: PassportBadge[];
  unlockedBadgesCount: number;
  completedActivitiesCount: number;
}

export const gamificationService = {
  // Compute user XP and badges dynamically from trips and localStorage
  calculateStats(trips: TripSummary[]): GamificationStats {
    const tripsCount = trips.length;
    const completedTripsCount = trips.filter((t) => t.status === 'COMPLETED').length;
    const activeTripsCount = trips.filter((t) => t.status === 'ACTIVE').length;
    const totalCrew = trips.reduce((acc, t) => acc + (t.member_count || 1), 0);

    // Read stored completed activities count
    let completedSpotsCount = 0;
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('arc_completed_activities_count');
        completedSpotsCount = stored ? parseInt(stored, 10) : 0;
      } catch (e) {
        completedSpotsCount = 0;
      }
    }

    // XP breakdown
    const totalXp =
      tripsCount * 150 +
      completedTripsCount * 250 +
      activeTripsCount * 50 +
      completedSpotsCount * 25 +
      Math.min(totalCrew * 20, 200);

    // Determine current rank
    let currentRank = RANKS[0];
    let nextRank: ExplorerRank | null = RANKS[1] || null;

    for (let i = 0; i < RANKS.length; i++) {
      if (totalXp >= RANKS[i].minXp) {
        currentRank = RANKS[i];
        nextRank = RANKS[i + 1] || null;
      }
    }

    const xpRange = nextRank ? nextRank.minXp - currentRank.minXp : 1000;
    const xpInCurrentLevel = totalXp - currentRank.minXp;
    const progressPercent = nextRank
      ? Math.min(100, Math.max(5, Math.round((xpInCurrentLevel / xpRange) * 100)))
      : 100;

    const xpToNextLevel = nextRank ? Math.max(0, nextRank.minXp - totalXp) : 0;

    // Badges calculation
    const destinations = new Set(trips.map((t) => t.destination.toLowerCase().trim()));
    const hasMetropolis = Array.from(destinations).some((d) =>
      ['tokyo', 'japan', 'paris', 'france', 'new york', 'rome', 'reykjavik', 'london'].some((m) =>
        d.includes(m)
      )
    );

    const badges: PassportBadge[] = [
      {
        id: 'first-horizon',
        name: 'First Horizon',
        icon: '🗺️',
        description: 'Map and launch your very first journey on Arc-Nomad',
        category: 'JOURNEY',
        unlocked: tripsCount >= 1,
        progressText: tripsCount >= 1 ? 'Unlocked' : '0/1 Journeys',
      },
      {
        id: 'metropolis-pathfinder',
        name: 'Metropolis Pathfinder',
        icon: '🗼',
        description: 'Plan an expedition to an iconic world capital or cultural hub',
        category: 'EXPLORATION',
        unlocked: hasMetropolis,
        progressText: hasMetropolis ? 'Unlocked' : 'Plan Tokyo, Paris, Rome, or NYC',
      },
      {
        id: 'voyager-trio',
        name: 'Voyager Trio',
        icon: '🧭',
        description: 'Map 3 or more distinct travel destinations in your collective',
        category: 'JOURNEY',
        unlocked: tripsCount >= 3,
        progressText: `${Math.min(3, tripsCount)}/3 Journeys`,
      },
      {
        id: 'checklist-master',
        name: 'Checklist Virtuoso',
        icon: '🎯',
        description: 'Check off at least 5 itinerary activities or travel spots',
        category: 'EXPLORATION',
        unlocked: completedSpotsCount >= 5,
        progressText: `${Math.min(5, completedSpotsCount)}/5 Spots Visited`,
      },
      {
        id: 'crew-captain',
        name: 'Nomad Collective',
        icon: '👥',
        description: 'Organize an expedition with 2 or more traveling companions',
        category: 'COLLECTIVE',
        unlocked: totalCrew >= 3,
        progressText: totalCrew >= 3 ? 'Unlocked' : `${totalCrew}/3 Travelers`,
      },
      {
        id: 'seasoned-nomad',
        name: 'Expedition Veteran',
        icon: '🏆',
        description: 'Complete at least 1 expedition and reach Level 2 Trailblazer',
        category: 'JOURNEY',
        unlocked: completedTripsCount >= 1 && currentRank.level >= 2,
        progressText:
          completedTripsCount >= 1 && currentRank.level >= 2
            ? 'Unlocked'
            : 'Reach Level 2 & complete 1 trip',
      },
    ];

    const unlockedBadgesCount = badges.filter((b) => b.unlocked).length;

    return {
      totalXp,
      currentRank,
      nextRank,
      progressPercent,
      xpToNextLevel,
      badges,
      unlockedBadgesCount,
      completedActivitiesCount: completedSpotsCount,
    };
  },

  // Record an activity completion to give XP
  recordActivityCompleted() {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('arc_completed_activities_count');
      const count = stored ? parseInt(stored, 10) : 0;
      localStorage.setItem('arc_completed_activities_count', (count + 1).toString());
    } catch (e) {
      // ignore
    }
  },
};
