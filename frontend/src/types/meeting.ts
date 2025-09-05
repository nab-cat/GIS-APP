import { Location } from './location';
import { IsochroneData, OverlapArea } from './isochrone';
import { Place } from './places';
import { Route } from './navigation';

export type MeetingStep = 'location' | 'isochrone' | 'places' | 'navigation';

export interface MeetingState {
  // Current step in the flow
  currentStep: MeetingStep;
  
  // Location data
  userALocation: Location | null;
  userBLocation: Location | null;
  
  // Isochrone data
  userAIsochrone: IsochroneData | null;
  userBIsochrone: IsochroneData | null;
  overlapArea: OverlapArea | null;
  
  // Travel preferences
  travelMode: 'driving' | 'walking' | 'cycling';
  maxTravelTime: number; // in minutes
  
  // Places data
  meetingSpots: Place[];
  selectedSpot: Place | null;
  
  // Navigation data
  userARoute: Route | null;
  userBRoute: Route | null;
  
  // UI state
  isLoading: boolean;
  error: string | null;
}

export interface MeetingPreferences {
  travelMode: 'driving' | 'walking' | 'cycling';
  maxTravelTime: number;
  preferredCategories: string[];
  avoidTolls?: boolean;
  avoidHighways?: boolean;
}
