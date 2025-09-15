import React from 'react';
import { MapPin, ChevronRight, ArrowLeft } from 'lucide-react';
import mapboxgl from 'mapbox-gl';

// Define interface for POI
export interface POI {
    id: string;
    name: string;
    category: string;
    distance: number;
    address: string;
    coordinates: [number, number];
}

interface LocationChooserProps {
    map: mapboxgl.Map | null;
    pois: POI[];
    onBackToPreviousStep: () => void;
    onPOISelected: (poiId: string) => void;
    selectedPOI: string | null;
    onNextStep?: () => void;
}

export default function LocationChooser({
    map,
    pois,
    onBackToPreviousStep,
    onPOISelected,
    selectedPOI,
    onNextStep
}: LocationChooserProps) {
    // Function to highlight the selected POI on the map
    const highlightPOIOnMap = (poiId: string) => {
        if (!map) return;
        
        // Find all POI markers
        const markers = document.querySelectorAll('.poi-marker');
        
        // Remove selected class from all markers
        markers.forEach((marker, index) => {
            if (pois[index]?.id === poiId) {
                marker.classList.add('selected');
            } else {
                marker.classList.remove('selected');
            }
        });
    };

    // Handle POI selection
    const handleSelectPOI = (poiId: string) => {
        onPOISelected(poiId);
        highlightPOIOnMap(poiId);
    };

    return (
        <div className="space-y-6">
            <div className="mb-4">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-heading text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                        <MapPin className="mr-2 text-primary" size={20} />
                        Choose Meeting Location
                    </h3>
                    <button 
                        onClick={onBackToPreviousStep}
                        className="text-sm text-primary hover:text-primary/80 flex items-center font-medium"
                    >
                        <ArrowLeft size={16} className="mr-1" />
                        Back to Search
                    </button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Select a nearby place for your meeting
                </p>
            </div>

            <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-gray-800 dark:text-gray-200">
                    Found {pois.length} Nearby Places
                </h4>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                    {pois.map((poi) => (
                        <div
                            key={poi.id}
                            onClick={() => handleSelectPOI(poi.id)}
                            className={`w-full flex items-start p-3 rounded-lg border cursor-pointer transition-colors
                                ${selectedPOI === poi.id
                                    ? 'border-primary bg-primary/5 text-primary shadow-sm'
                                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-750 bg-white dark:bg-gray-800'}`}
                        >
                            <MapPin 
                                size={18} 
                                className={`mt-0.5 mr-3 flex-shrink-0 ${selectedPOI === poi.id ? 'text-primary' : 'text-gray-500'}`}
                            />
                            <div className="flex-grow">
                                <p className={`text-sm font-medium ${selectedPOI === poi.id ? 'text-primary' : 'text-gray-800 dark:text-gray-200'}`}>
                                    {poi.name || 'Unnamed Location'}
                                </p>
                                <div className="flex justify-between items-center mt-1">
                                    <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded">
                                        {poi.category || 'Place'}
                                    </span>
                                    {poi.distance !== null && (
                                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                            {poi.distance}m
                                        </span>
                                    )}
                                </div>
                                {poi.address && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                        {poi.address}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Next Step Button */}
            <button
                onClick={onNextStep}
                disabled={!selectedPOI}
                className={`w-full flex items-center justify-center py-3 rounded-lg transition-colors mt-6 font-medium
                    ${selectedPOI
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'}`}
            >
                <ChevronRight size={18} className="mr-2" />
                Confirm Meeting Location
            </button>
        </div>
    );
}