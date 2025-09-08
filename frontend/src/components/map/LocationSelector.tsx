import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Compass, Loader2, X, Check, MapIcon } from 'lucide-react';
import { Location, LocationSearchResult } from '@/types/location';
import { useGeolocation } from '@/hooks/useGeolocation';
import { mapboxService } from '@/services/mapboxService';
import { v4 as uuidv4 } from 'uuid';

interface LocationSelectorProps {
    userType: 'A' | 'B';
    location: Location | null;
    onLocationSelect: (location: Location) => void;
    onLocationClear: () => void;
    onMapPickerToggle: (userType: 'A' | 'B', isActive: boolean) => void;
    isMapPickerActive: boolean;
    className?: string;
    map?: mapboxgl.Map | null; // Add map prop
}

export default function LocationSelector({
    userType,
    location,
    onLocationSelect,
    onLocationClear,
    onMapPickerToggle,
    isMapPickerActive,
    className = '',
    map = null, // Default to null
}: LocationSelectorProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [sessionToken] = useState(() => uuidv4());
    const [skipSearchUpdate, setSkipSearchUpdate] = useState(false);

    const { location: currentLocation, isLoading: isGeolocating, error: geoError, getCurrentLocation } = useGeolocation();
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Handle search input changes
    useEffect(() => {
        if (searchQuery.trim().length < 3) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(async () => {
            setIsSearching(true);
            setSearchError(null);

            try {
                // Use Mapbox Searchbox API for POI and place search
                const results = await mapboxService.searchboxSearch(searchQuery, 5, sessionToken);
                setSearchResults(results);
                setShowResults(true);
            } catch (error) {
                setSearchError(error instanceof Error ? error.message : 'Search failed');
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchQuery, sessionToken]);

    // Handle current location selection
    useEffect(() => {
        if (currentLocation) {
            onLocationSelect(currentLocation);
            
            // Don't update search query for current location
            if (!skipSearchUpdate) {
                setSearchQuery('');
            }
            
            setShowResults(false);
            
            // Fly to selected location
            flyToLocation(currentLocation.coordinates.lng, currentLocation.coordinates.lat);
        }
    }, [currentLocation, onLocationSelect, skipSearchUpdate]);

    // Helper function to fly to location
    const flyToLocation = (lng: number, lat: number) => {
        if (map) {
            map.flyTo({
                center: [lng, lat],
                zoom: 14,
                speed: 1.5,
                curve: 1,
                essential: true
            });
        }
    };

    const handleSearchResultSelect = async (result: LocationSearchResult) => {
        try {
            const place = await mapboxService.retrievePlace(result.id, sessionToken);
            if (!place) throw new Error('Could not retrieve place details');
            const newLocation: Location = {
                id: place.id,
                name: place.name,
                coordinates: {
                    lng: place.coordinates.lng,
                    lat: place.coordinates.lat,
                },
                address: place.address,
                type: 'search',
                timestamp: Date.now(),
                category: place.category,
                maki: place.maki,
                full_address: place.address,
                poi_category: place.poi_category,
                poi_category_ids: place.poi_category_ids,
                distance: result.distance,
            };
            onLocationSelect(newLocation);

            // Clear search state to stop further suggestions
            setSearchQuery('');
            setSearchResults([]);
            setShowResults(false);
            
            // Fly to selected location
            flyToLocation(newLocation.coordinates.lng, newLocation.coordinates.lat);
        } catch (err) {
            setSearchError(err instanceof Error ? err.message : 'Failed to retrieve place');
        }
    };

    const handleClearLocation = () => {
        setSearchQuery('');
        setSearchResults([]);
        setShowResults(false);
        onLocationClear();

        // Also turn off map picker if it's active
        if (isMapPickerActive) {
            onMapPickerToggle(userType, false);
        }
    };

    const handleGetCurrentLocation = () => {
        // Turn off map picker if it's active
        if (isMapPickerActive) {
            onMapPickerToggle(userType, false);
        }
        
        // Set flag to avoid updating search query with current location
        setSkipSearchUpdate(true);
        getCurrentLocation();
        
        // Reset flag after a delay
        setTimeout(() => {
            setSkipSearchUpdate(false);
        }, 1000);
    };

    const handleToggleMapPicker = () => {
        onMapPickerToggle(userType, !isMapPickerActive);
    };

    const handleInputFocus = () => {
        if (searchResults.length > 0) {
            setShowResults(true);
        }
    };

    const handleInputBlur = () => {
        // Delay hiding results to allow clicking on them
        setTimeout(() => setShowResults(false), 200);
    };

    return (
        <div className={`relative ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-heading text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <MapPin className="mr-2 text-primary" size={20} />
                    User {userType} Location
                </h3>
                {location && (
                    <button
                        onClick={handleClearLocation}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Clear location"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>

            {/* Search Input */}
            <div className="relative mb-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        placeholder="Search for a location..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    />
                    {isSearching && (
                        <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary animate-spin" size={18} />
                    )}
                </div>

                {/* Search Results */}
                {showResults && searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                        {searchResults.map((result) => (
                            <button
                                key={result.id}
                                onClick={() => handleSearchResultSelect(result)}
                                className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                            >
                                <div className="font-medium text-gray-900 dark:text-white text-sm">
                                    {result.place_name}
                                </div>
                                {result.address && result.address !== result.place_name && (
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {result.address}
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                )}

                {/* Search Error */}
                {searchError && (
                    <div className="mt-2 text-sm text-red-500">
                        {searchError}
                    </div>
                )}
            </div>

            {/* Location Selection Buttons */}
            <div className="flex space-x-2 mb-3">
                {/* Current Location Button */}
                <button
                    onClick={handleGetCurrentLocation}
                    disabled={isGeolocating}
                    className="flex-1 flex items-center justify-center py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isGeolocating ? (
                        <Loader2 size={18} className="mr-2 animate-spin" />
                    ) : (
                        <Compass size={18} className="mr-2" />
                    )}
                    <span className="font-medium">
                        {isGeolocating ? 'Getting...' : 'Current Location'}
                    </span>
                </button>

                {/* Map Picker Button */}
                <button
                    onClick={handleToggleMapPicker}
                    className={`flex-1 flex items-center justify-center py-2.5 rounded-lg transition-colors ${isMapPickerActive
                            ? 'bg-green-500 hover:bg-green-600 text-white'
                            : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white'
                        }`}
                >
                    <MapIcon size={18} className="mr-2" />
                    <span className="font-medium">
                        {isMapPickerActive ? 'Picking...' : 'Pick on Map'}
                    </span>
                </button>
            </div>

            {/* Map Picker Instructions */}
            {isMapPickerActive && (
                <div className="mb-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-sm text-green-800 dark:text-green-200">
                        Click anywhere on the map to set User {userType}&apos;s location
                    </p>
                </div>
            )}

            {/* Geolocation Error */}
            {geoError && (
                <div className="mt-2 text-sm text-red-500">
                    {geoError}
                </div>
            )}

            {/* Selected Location Display */}
            {location && (
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center mb-1">
                                <Check className="text-green-500 mr-2" size={16} />
                                <span className="font-medium text-gray-900 dark:text-white text-sm">
                                    {location.name}
                                </span>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                {location.coordinates.lng.toFixed(4)}, {location.coordinates.lat.toFixed(4)}
                            </div>
                            {location.address && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {location.address}
                                </div>
                            )}
                            {location.category && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    Category: {location.category}
                                </div>
                            )}
                            {location.poi_category && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    POI Categories: {location.poi_category.join(', ')}
                                </div>
                            )}
                            {location.distance && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    Distance: {location.distance}m
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
