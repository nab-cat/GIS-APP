import { useState, useEffect } from 'react';
import { MapPin, Star, Clock, Phone, Globe, Filter, Search, Loader2, Navigation } from 'lucide-react';
import { Place, PlaceCategory } from '@/types/places';
import { OverlapArea } from '@/types/isochrone';
import { usePlacesSearch } from '@/hooks/usePlacesSearch';

interface MeetingSpotSelectorProps {
  overlapArea: OverlapArea | null;
  onPlaceSelect: (place: Place) => void;
  selectedPlace: Place | null;
  className?: string;
}

const PLACE_CATEGORIES: PlaceCategory[] = [
  { id: 'restaurant', name: 'Restaurants', icon: '🍽️', mapboxCategory: 'restaurant' },
  { id: 'cafe', name: 'Cafes', icon: '☕', mapboxCategory: 'cafe' },
  { id: 'park', name: 'Parks', icon: '🌳', mapboxCategory: 'park' },
  { id: 'shopping', name: 'Shopping', icon: '🛍️', mapboxCategory: 'shop' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬', mapboxCategory: 'entertainment' },
  { id: 'hotel', name: 'Hotels', icon: '🏨', mapboxCategory: 'hotel' },
  { id: 'gas', name: 'Gas Stations', icon: '⛽', mapboxCategory: 'gas' },
  { id: 'bank', name: 'Banks', icon: '🏦', mapboxCategory: 'bank' },
  { id: 'hospital', name: 'Hospitals', icon: '🏥', mapboxCategory: 'hospital' },
];

export default function MeetingSpotSelector({
  overlapArea,
  onPlaceSelect,
  selectedPlace,
  className = '',
}: MeetingSpotSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('restaurant');
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'relevance'>('distance');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPlaces, setFilteredPlaces] = useState<Place[]>([]);

  const { places, isLoading, error, searchPlaces, clearPlaces } = usePlacesSearch();

  // Clear places when overlap area is removed
  useEffect(() => {
    if (!overlapArea) {
      console.log('MeetingSpotSelector: No overlap area, clearing places');
      clearPlaces();
    }
  }, [overlapArea]); // Only clear when overlap area is removed

  // Filter places based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPlaces(places);
    } else {
      const filtered = places.filter(place =>
        place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        place.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        place.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPlaces(filtered);
    }
  }, [places, searchQuery]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleSortChange = (sort: 'distance' | 'rating' | 'relevance') => {
    setSortBy(sort);
  };

  const handleManualSearch = () => {
    if (overlapArea) {
      console.log('Manual search triggered');
      searchPlaces(overlapArea, {
        category: selectedCategory,
        sortBy,
        limit: 20,
      });
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

  const formatRating = (rating?: number) => {
    if (!rating) return 'No rating';
    return `${rating.toFixed(1)} ⭐`;
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
          Places in the overlap area where you can meet
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3 mb-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search places..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors text-sm"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="text-gray-400" size={16} />
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-colors text-sm"
            aria-label="Select place category"
          >
            {PLACE_CATEGORIES.map((category) => (
              <option key={category.id} value={category.mapboxCategory}>
                {category.icon} {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Options */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value as 'distance' | 'rating' | 'relevance')}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-colors text-sm"
            aria-label="Sort places by"
          >
            <option value="distance">Distance</option>
            <option value="rating">Rating</option>
            <option value="relevance">Relevance</option>
          </select>
        </div>

        {/* Manual Search Button */}
        <button
          onClick={handleManualSearch}
          disabled={isLoading || !overlapArea}
          className="w-full py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed text-sm font-medium"
        >
          {isLoading ? 'Searching...' : 'Search Places'}
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="animate-spin text-primary" size={24} />
          <span className="ml-2 text-gray-600 dark:text-gray-400">Finding places...</span>
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
          {filteredPlaces.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <MapPin className="mx-auto mb-2" size={32} />
              <p>No places found in this area</p>
              <p className="text-sm">Try a different category or search term</p>
            </div>
          ) : (
            filteredPlaces.map((place) => (
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
                      {place.rating && (
                        <span className="flex items-center">
                          <Star size={12} className="mr-1" />
                          {formatRating(place.rating)}
                        </span>
                      )}
                      {place.priceLevel && (
                        <span>
                          {'$'.repeat(place.priceLevel)}
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
