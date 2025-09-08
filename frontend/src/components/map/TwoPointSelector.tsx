import React, { useState, useEffect } from 'react';
import { MapPin, ChevronRight, X, Search, MapIcon, Compass } from 'lucide-react';
import mapboxgl from 'mapbox-gl';

interface TwoPointSelectorProps {
  map: mapboxgl.Map | null;
  onLocationSelected: (index: number, lng: number, lat: number, label: string) => void;
}

export default function TwoPointSelector({ map, onLocationSelected }: TwoPointSelectorProps) {
  const [activeSelector, setActiveSelector] = useState<number | null>(null);
  const [locations, setLocations] = useState<Array<{name: string, selected: boolean}>>([
    { name: "User A Location", selected: false },
    { name: "User B Location", selected: false }
  ]);
  const [showPickerHint, setShowPickerHint] = useState<boolean>(false);
  
  // Change cursor to indicate selection mode
  useEffect(() => {
    if (!map) return;
    
    // Clear any existing click handlers when component mounts/updates
    const mapClickHandler = (e: mapboxgl.MapMouseEvent) => {
      if (activeSelector === null) return;
      
      const { lng, lat } = e.lngLat;
      
      // Call the parent function to handle this location
      onLocationSelected(activeSelector, lng, lat, locations[activeSelector].name);
      
      // Update local state to show this location is selected
      setLocations(prevLocations => {
        const newLocations = [...prevLocations];
        newLocations[activeSelector].selected = true;
        return newLocations;
      });
      
      // Reset the cursor
      map.getCanvas().style.cursor = '';
      setShowPickerHint(false);
      
      // Clear active selector
      setActiveSelector(null);
    };
    
    if (activeSelector !== null) {
      // Set cursor to crosshair
      map.getCanvas().style.cursor = 'crosshair';
      setShowPickerHint(true);
      
      // Add click listener
      map.on('click', mapClickHandler);
    }
    
    // Cleanup function runs when component unmounts or dependencies change
    return () => {
      map.off('click', mapClickHandler);
      if (activeSelector === null) {
        map.getCanvas().style.cursor = '';
      }
    };
  }, [activeSelector, map, onLocationSelected, locations]);
  
  // Handle pick on map button
  const handlePickOnMap = (index: number) => {
    if (!map) return;
    setActiveSelector(index);
  };
  
  // Clear a selected location
  const handleClearLocation = (index: number) => {
    // Update the local state first
    setLocations(prevLocations => {
      const newLocations = [...prevLocations];
      newLocations[index].selected = false;
      return newLocations;
    });
    
    // Tell the parent to remove the marker
    onLocationSelected(index, 0, 0, "");
  };
  
  return (
    <>
      {/* Map Picker Indicator - only shows when actively picking a location */}
      {showPickerHint && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded-lg px-3 py-2">
            <div className="flex items-center space-x-2">
              <MapIcon size={16} className="text-green-600" />
              <span className="text-green-800 dark:text-green-200 text-sm">
                Click anywhere to set location
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* Main control panel */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-lg font-semibold text-gray-900 dark:text-white">
            Select Locations
          </h2>
        </div>

        {/* Location Selectors */}
        <div className="space-y-4">
          {locations.map((location, index) => (
            <div key={index} className="relative">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-heading text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <MapPin className={`mr-2 ${index === 0 ? 'text-blue-500' : 'text-red-500'}`} size={20} />
                  {location.name}
                </h3>
                
                {location.selected && (
                  <button
                    onClick={() => handleClearLocation(index)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    title="Clear location"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              {/* Search Input (placeholder for now) */}
              <div className="relative mb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search for a location..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  />
                </div>
              </div>

              {/* Location Selection Buttons */}
              <div className="flex space-x-2 mb-3">
                {/* Current Location Button - Placeholder functionality */}
                <button
                  className="flex-1 flex items-center justify-center py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors"
                >
                  <Compass size={18} className="mr-2" />
                  <span className="font-medium">
                    Current Location
                  </span>
                </button>

                {/* Map Picker Button */}
                <button
                  onClick={() => handlePickOnMap(index)}
                  className={`flex-1 flex items-center justify-center py-2.5 
                    ${activeSelector === index 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white'} 
                    rounded-lg transition-colors`}
                >
                  <MapIcon size={18} className="mr-2" />
                  <span className="font-medium">
                    Pick on Map
                  </span>
                </button>
              </div>
              
              {/* Selected status */}
              {location.selected && (
                <div className="mt-2 text-sm text-green-600 dark:text-green-400 flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                  Location selected
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Continue button - becomes active when both locations are selected */}
        <button
          onClick={() => {
            // Here you would normally navigate to the next step
            console.log('Moving to next step - both locations selected');
          }}
          className={`w-full mt-6 py-3 rounded-lg transition-colors font-medium
            ${locations[0].selected && locations[1].selected
              ? 'bg-primary hover:bg-primary/90 text-white' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'}`}
          disabled={!locations[0].selected || !locations[1].selected}
        >
          Next Step: Calculate Meetup Areas
          <ChevronRight size={16} className="inline ml-1" />
        </button>
      </div>
    </>
  );
}