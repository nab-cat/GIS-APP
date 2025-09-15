import React from 'react';
import { MapPin, ChevronRight } from 'lucide-react';

// Define interface for POI
export interface POI {
    id: string;
    name: string;
    category: string;
    distance: number;
    address: string;
    coordinates: [number, number];
}

interface GeocodeLocationChooserProps {
    pois: POI[];
    onBackToSearchOptions: () => void;
    onSelectPOI: (poiId: string) => void;
    selectedPOI: string | null;
    onNextStep?: () => void;
}

export default function GeocodeLocationChooser({
    pois,
    onBackToSearchOptions,
    onSelectPOI,
    selectedPOI,
    onNextStep
}: GeocodeLocationChooserProps) {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-gray-800 dark:text-gray-200">
                    Found {pois.length} Nearby Places
                </h4>
                <button
                    onClick={onBackToSearchOptions}
                    className="flex items-center text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Search Options
                </button>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                    {pois.map((poi) => (
                        <div
                            key={poi.id}
                            onClick={() => onSelectPOI(poi.id)}
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