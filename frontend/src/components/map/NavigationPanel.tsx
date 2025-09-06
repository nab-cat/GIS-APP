import { useState } from 'react';
import { Navigation, Clock, MapPin, ArrowRight, Car, Bike, Loader2, ExternalLink, Phone, Globe, Footprints } from 'lucide-react';
import { Route } from '@/types/navigation';
import { Location } from '@/types/location';
import { Place } from '@/types/places';

interface NavigationPanelProps {
  userARoute: Route | null;
  userBRoute: Route | null;
  userALocation: Location | null;
  userBLocation: Location | null;
  meetingSpot: Place | null;
  isLoading: boolean;
  error: string | null;
  onGetDirections: () => void;
  className?: string;
}

const TRAVEL_MODES = [
  { id: 'driving', name: 'Driving', icon: Car, color: 'text-blue-500' },
  { id: 'walking', name: 'Walking', icon: Footprints, color: 'text-green-500' },
  { id: 'cycling', name: 'Cycling', icon: Bike, color: 'text-orange-500' },
];

export default function NavigationPanel({
  userARoute,
  userBRoute,
  userALocation,
  userBLocation,
  meetingSpot,
  isLoading,
  error,
  onGetDirections,
  className = '',
}: NavigationPanelProps) {
  const [selectedMode, setSelectedMode] = useState<'driving' | 'walking' | 'cycling'>('driving');
  const [expandedRoute, setExpandedRoute] = useState<'A' | 'B' | null>(null);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const handleModeChange = (mode: 'driving' | 'walking' | 'cycling') => {
    setSelectedMode(mode);
    // You would call the directions API again with the new mode
  };

  const handleExpandRoute = (route: 'A' | 'B') => {
    setExpandedRoute(expandedRoute === route ? null : route);
  };

  const renderRouteDetails = (route: Route, userType: 'A' | 'B', userLocation: Location | null) => {
    if (!route || !userLocation) return null;

    const isExpanded = expandedRoute === userType;

    return (
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${userType === 'A' ? 'bg-blue-500' : 'bg-red-500'}`}></div>
            <span className="font-medium text-gray-900 dark:text-white text-sm">
              User {userType}
            </span>
          </div>
          <button
            onClick={() => handleExpandRoute(userType)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <ArrowRight 
              size={16} 
              className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
            />
          </button>
        </div>

        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
          <div className="flex items-center">
            <Clock size={14} className="mr-1" />
            {formatDuration(route.duration)}
          </div>
          <div className="flex items-center">
            <Navigation size={14} className="mr-1" />
            {formatDistance(route.distance)}
          </div>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          From: {userLocation.name}
        </div>

        {isExpanded && (
          <div className="mt-3 space-y-2">
            <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Route Summary: {route.legs[0]?.summary || 'Direct route'}
            </div>
            
            {route.legs[0]?.steps.slice(0, 5).map((step, index) => (
              <div key={index} className="flex items-start text-xs">
                <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                <span className="text-gray-600 dark:text-gray-400">
                  {step.instruction}
                </span>
              </div>
            ))}
            
            {route.legs[0]?.steps.length > 5 && (
              <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                ... and {route.legs[0].steps.length - 5} more steps
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (!meetingSpot) {
    return (
      <div className={`p-4 text-center text-gray-500 dark:text-gray-400 ${className}`}>
        <Navigation className="mx-auto mb-2" size={32} />
        <p>Select a meeting spot to get directions</p>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Header */}
      <div className="mb-4">
        <h3 className="font-heading text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-2">
          <Navigation className="mr-2 text-primary" size={20} />
          Directions
        </h3>
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <MapPin className="mr-1" size={14} />
          To: {meetingSpot.name}
        </div>
      </div>

      {/* Travel Mode Selector */}
      <div className="mb-4">
        <div className="flex space-x-2">
          {TRAVEL_MODES.map((mode) => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => handleModeChange(mode.id as 'driving' | 'walking' | 'cycling')}
                className={`flex-1 flex items-center justify-center py-2 px-3 rounded-lg border transition-colors ${
                  selectedMode === mode.id
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <Icon size={16} className={`mr-2 ${mode.color}`} />
                <span className="text-sm font-medium">{mode.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Get Directions Button */}
      {(!userARoute || !userBRoute) && (
        <button
          onClick={onGetDirections}
          disabled={isLoading || !userALocation || !userBLocation}
          className="w-full flex items-center justify-center py-3 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed mb-4"
        >
          {isLoading ? (
            <Loader2 size={18} className="mr-2 animate-spin" />
          ) : (
            <Navigation size={18} className="mr-2" />
          )}
          <span className="font-medium">
            {isLoading ? 'Getting Directions...' : 'Get Directions'}
          </span>
        </button>
      )}

      {/* Error State */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Routes */}
      {userARoute && userBRoute && (
        <div className="space-y-3">
          {renderRouteDetails(userARoute, 'A', userALocation)}
          {renderRouteDetails(userBRoute, 'B', userBLocation)}
        </div>
      )}

      {/* Meeting Spot Info */}
      {meetingSpot && (
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-2">
            Meeting Spot Details
          </h4>
          <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center">
              <MapPin size={12} className="mr-2" />
              {meetingSpot.address}
            </div>
            {meetingSpot.phone && (
              <div className="flex items-center">
                <Phone size={12} className="mr-2" />
                {meetingSpot.phone}
              </div>
            )}
            {meetingSpot.website && (
              <div className="flex items-center">
                <Globe size={12} className="mr-2" />
                <a 
                  href={meetingSpot.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center"
                >
                  Website
                  <ExternalLink size={10} className="ml-1" />
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation Actions */}
      {userARoute && userBRoute && (
        <div className="mt-4 space-y-2">
          <button className="w-full py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-medium">
            Share Meeting Details
          </button>
          <button className="w-full py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-medium">
            Save to Calendar
          </button>
        </div>
      )}
    </div>
  );
}
