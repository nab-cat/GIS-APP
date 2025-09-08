import { useState, useEffect } from 'react';
import { MapPin, Loader2, Navigation } from 'lucide-react';
import { Place } from '@/types/places';
import { OverlapArea } from '@/types/isochrone';
import { usePlacesSearch } from '@/hooks/usePlacesSearch';

interface MeetingSpotSelectorProps {
    overlapArea: OverlapArea | null;
    onPlaceSelect: (place: Place) => void;
    selectedPlace: Place | null;
    className?: string;
}

export default function MeetingSpotSelector({
    overlapArea,
    onPlaceSelect,
    selectedPlace,
    className = '',
}: MeetingSpotSelectorProps) {
    const { places, isLoading, error, searchPlaces, clearPlaces } = usePlacesSearch();

    // Clear places when overlap area is removed
    useEffect(() => {
        if (!overlapArea) {
            console.log('MeetingSpotSelector: No overlap area, clearing places');
            clearPlaces();
        } else {
            // Auto-search when overlap area changes
            handleSearch();
        }
    }, [overlapArea, clearPlaces]);

    const handleSearch = () => {
        if (overlapArea) {
            console.log('Searching for meeting spots...');
            searchPlaces(overlapArea);
        }
    };

    const handlePlaceSelect = (place: Place) => {
        onPlaceSelect(place);
    };

    const formatDistance = (distance?: number) => {
        if (!distance) return 'Unknown';
        if (distance < 1000) {
            return `${Math.round(distance)}m`;
        }
        return `${(distance / 1000).toFixed(1)}km`;
    };

    if (!overlapArea) {
        return (
            <div className={`p-4 text-center text-gray-500 dark:text-gray-400 ${className}`}>
                <MapPin className="mx-auto mb-2" size={32} />
                <p>Select both locations to find meeting spots</p>
            </div>
        );
    }

    return (
        <div className={`${className}`}>
            {/* Header */}
            <div className="mb-4">
                <h3 className="font-heading text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-2">
                    <MapPin className="mr-2 text-primary" size={20} />
                    Meeting Spots
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Select a place in the overlap area to meet
                </p>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-primary" size={24} />
                    <span className="ml-2 text-gray-600 dark:text-gray-400">Finding meeting spots...</span>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                </div>
            )}

            {/* Places List */}
            {!isLoading && !error && (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {places.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <MapPin className="mx-auto mb-2" size={32} />
                            <p>No places found in this area</p>
                            <button
                                onClick={handleSearch}
                                className="mt-3 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors text-sm font-medium"
                            >
                                Retry Search
                            </button>
                        </div>
                    ) : (
                        places.map((place) => (
                            <div
                                key={place.id}
                                onClick={() => handlePlaceSelect(place)}
                                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                                    selectedPlace?.id === place.id
                                        ? 'border-primary bg-primary/5 dark:bg-primary/10'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-800'
                                }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                                            {place.name}
                                        </h4>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                            {place.address}
                                        </p>

                                        <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                                            {place.distance && (
                                                <span className="flex items-center">
                                                    <Navigation size={12} className="mr-1" />
                                                    {formatDistance(place.distance)}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {selectedPlace?.id === place.id && (
                                        <div className="ml-2">
                                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Selected Place Summary */}
            {selectedPlace && (
                <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-medium text-primary text-sm">
                                Selected: {selectedPlace.name}
                            </h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                {formatDistance(selectedPlace.distance)} away
                            </p>
                        </div>
                        <button
                            onClick={() => onPlaceSelect(selectedPlace)}
                            className="px-3 py-1 bg-primary text-white text-xs rounded-md hover:bg-primary/90 transition-colors"
                        >
                            Get Directions
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}