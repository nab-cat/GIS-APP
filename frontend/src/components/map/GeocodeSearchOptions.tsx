import React from 'react';
import { Search } from 'lucide-react';

interface GeocodeSearchOptionsProps {
    onSearch: (options: SearchOptions) => void;
    selectedPoint: [number, number] | null;
    isLoading: boolean;
}

export interface SearchOptions {
    radius: number;
    resultsCount: number;
    sources: {
        openstreetmap: boolean;
        openaddresses: boolean;
        whosonfirst: boolean;
        geonames: boolean;
    };
    layers: {
        venue: boolean;
        street: boolean;
        locality: boolean;
        neighbourhood: boolean;
        borough: boolean;
        address: boolean;
    };
}

export default function GeocodeSearchOptions({
    onSearch,
    selectedPoint,
    isLoading
}: GeocodeSearchOptionsProps) {
    // State variables for geocoding options
    const [geocodingRadius, setGeocodingRadius] = React.useState<number>(10); // Default radius for reverse geocoding
    const [geocodingResultsCount, setGeocodingResultsCount] = React.useState<number>(10); // Default number of results
    
    // Sources for geocoding
    const [selectedSources, setSelectedSources] = React.useState<{
        openstreetmap: boolean;
        openaddresses: boolean;
        whosonfirst: boolean;
        geonames: boolean;
    }>({
        openstreetmap: true,
        openaddresses: true,
        whosonfirst: true,
        geonames: true
    });
    
    // Layers for geocoding
    const [selectedLayers, setSelectedLayers] = React.useState<{
        venue: boolean;
        street: boolean;
        locality: boolean;
        neighbourhood: boolean;
        borough: boolean;
        address: boolean;
    }>({
        venue: true,
        street: true,
        locality: true,
        neighbourhood: true,
        borough: true,
        address: true
    });
    
    // Function to handle search button click
    const handleSearch = () => {
        if (!selectedPoint) return;
        
        onSearch({
            radius: geocodingRadius,
            resultsCount: geocodingResultsCount,
            sources: selectedSources,
            layers: selectedLayers
        });
    };

    return (
        <div className="space-y-4">
            {/* Radius slider */}
            <div className="mb-5">
                <label 
                    htmlFor="geocoding-radius" 
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                    Search radius: <span className="text-primary font-semibold">{geocodingRadius} meters</span>
                </label>
                <input
                    type="range"
                    id="geocoding-radius"
                    min="5"
                    max="100"
                    step="5"
                    value={geocodingRadius}
                    onChange={(e) => {
                        const newRadius = parseInt(e.target.value);
                        setGeocodingRadius(newRadius);
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>5m</span>
                    <span>50m</span>
                    <span>100m</span>
                </div>
            </div>
            
            {/* Results count */}
            <div className="mb-5">
                <label 
                    htmlFor="results-count" 
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                    Number of results: <span className="text-primary font-semibold">{geocodingResultsCount}</span>
                </label>
                <input
                    type="range"
                    id="results-count"
                    min="1"
                    max="20"
                    step="1"
                    value={geocodingResultsCount}
                    onChange={(e) => {
                        setGeocodingResultsCount(parseInt(e.target.value));
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1</span>
                    <span>10</span>
                    <span>20</span>
                </div>
            </div>
            
            {/* Sources checkboxes */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-5">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Data sources:
                </p>
                <div className="grid grid-cols-2 gap-3">
                    {Object.keys(selectedSources).map(source => (
                        <label key={source} className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <input
                                type="checkbox"
                                checked={selectedSources[source as keyof typeof selectedSources]}
                                onChange={() => {
                                    setSelectedSources({
                                        ...selectedSources,
                                        [source]: !selectedSources[source as keyof typeof selectedSources]
                                    });
                                }}
                                className="form-checkbox h-4 w-4 text-primary rounded mr-2"
                            />
                            {source}
                        </label>
                    ))}
                </div>
            </div>
            
            {/* Layers checkboxes */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-5">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Place types:
                </p>
                <div className="grid grid-cols-2 gap-3">
                    {Object.keys(selectedLayers).map(layer => (
                        <label key={layer} className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <input
                                type="checkbox"
                                checked={selectedLayers[layer as keyof typeof selectedLayers]}
                                onChange={() => {
                                    setSelectedLayers({
                                        ...selectedLayers,
                                        [layer]: !selectedLayers[layer as keyof typeof selectedLayers]
                                    });
                                }}
                                className="form-checkbox h-4 w-4 text-primary rounded mr-2"
                            />
                            {layer}
                        </label>
                    ))}
                </div>
            </div>
            
            {/* Search button */}
            <button
                onClick={handleSearch}
                disabled={!selectedPoint || isLoading}
                className={`w-full flex items-center justify-center py-3 rounded-lg transition-colors font-medium
                    ${(!isLoading && selectedPoint)
                        ? 'bg-primary hover:bg-primary/90 text-white'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'}`}
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Searching Nearby Places...
                    </>
                ) : (
                    <>
                        <Search size={18} className="mr-2" />
                        Search Nearby Places
                    </>
                )}
            </button>
        </div>
    );
}