/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Users, Clock, ChevronRight, AlertTriangle, Sliders } from 'lucide-react';

interface IsochroneOptionsProps {
    locations: [number, number][]; // Array of [lng, lat] coordinates
    onGenerateIsochrones: (options: IsochroneRequestOptions) => void;
    isLoading?: boolean;
}

export interface IsochroneRequestOptions {
    locations: [number, number][];
    range: number[];
    range_type: 'time' | 'distance';
    attributes?: string[];
    intersections?: boolean | string;
    interval?: number;
    location_type?: 'start' | 'destination';
    smoothing?: number;
    area_units?: 'm' | 'km' | 'mi'; // Only used if attributes includes "area"
    profile?: string;
    options?: {
        avoid_borders?: 'all' | 'controlled' | 'neither' | '';
        [key: string]: any;
    };
}

export default function IsochroneOptions({
    locations,
    onGenerateIsochrones,
    isLoading = false
}: IsochroneOptionsProps) {
    // State for all the options
    const [rangeValues, setRangeValues] = useState<number[]>([30, 15]);
    const [rangeType, setRangeType] = useState<'time' | 'distance'>('time');
    const [transportMode, setTransportMode] = useState<string>('driving-car');
    const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
    const [smoothing, setSmoothing] = useState<number>(25);
    const [interval, setInterval] = useState<number>(30);
    const [intersections, setIntersections] = useState<boolean>(true);
    const [locationType, setLocationType] = useState<'start' | 'destination'>('destination');
    const [avoidBorders, setAvoidBorders] = useState<'all' | 'controlled' | 'neither' | ''>('');

    // Format time display
    const formatTime = (minutes: number) => {
        if (minutes < 60) return `${minutes} min`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h${mins > 0 ? ` ${mins}m` : ''}`;
    };

    // Format distance display
    const formatDistance = (meters: number) => {
        if (meters < 1000) return `${meters} m`;
        return `${(meters / 1000).toFixed(1)} km`;
    };

    // Handle range value changes
    const handleRangeChange = (index: number, value: number) => {
        const newRanges = [...rangeValues];
        newRanges[index] = value;
        // Sort in descending order to ensure proper nesting of isochrones
        setRangeValues(newRanges.sort((a, b) => b - a));
    };

    // Handle adding a new range
    const handleAddRange = () => {
        if (rangeValues.length < 3) {
            const newValue = Math.max(5, Math.min(...rangeValues) - 5);
            setRangeValues([...rangeValues, newValue].sort((a, b) => b - a));
        }
    };

    // Handle removing a range
    const handleRemoveRange = (index: number) => {
        if (rangeValues.length > 1) {
            const newRanges = [...rangeValues];
            newRanges.splice(index, 1);
            setRangeValues(newRanges);
        }
    };

    // Generate isochrones with current options
    const handleGenerateClick = () => {
        // Convert minutes to seconds if range_type is time
        const convertedRangeValues = rangeType === 'time'
            ? rangeValues.map(v => v * 60) // Convert minutes to seconds
            : rangeValues;

        // Define attributes array with "area" for area calculations
        const attributes = ["area"];

        const options: IsochroneRequestOptions = {
            locations,
            range: convertedRangeValues,
            range_type: rangeType,
            profile: transportMode,
            location_type: locationType,
            attributes,
            intersections
        };

        // Removed units parameter as it causes API errors

        // Include area_units only when attributes includes "area"
        if (attributes.includes("area")) {
            options.area_units = 'km'; // Default to square kilometers
        }

        // Add optional parameters only if they're different from defaults
        if (smoothing !== 25) options.smoothing = smoothing;

        // Only add interval if we have a single range value
        if (rangeValues.length === 1 && interval) {
            options.interval = rangeType === 'time' ? interval * 60 : interval;
        }

        // Add avoid borders option if selected
        if (avoidBorders) {
            options.options = { avoid_borders: avoidBorders };
        }

        onGenerateIsochrones(options);
    };

    // Check if we have valid locations
    const hasValidLocations = locations.length === 2 &&
        locations.every(loc => loc.length === 2 && !isNaN(loc[0]) && !isNaN(loc[1]));

    return (
        <div className="space-y-6">
            <div className="mb-6">
                <h3 className="font-heading text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-3">
                    <Users className="mr-2 text-primary" size={20} />
                    Travel Time Areas
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Customize how far each person can travel and find the optimal meeting area
                </p>
            </div>

            {/* Travel Mode Selector */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mode of Transport
                </label>
                <div className="grid grid-cols-3 gap-2">
                    {[
                        {
                            id: 'driving-car',
                            name: 'Driving',
                            icon: '🚗'
                        },
                        {
                            id: 'cycling-regular',
                            name: 'Cycling',
                            icon: '🚲'
                        },
                        {
                            id: 'foot-walking',
                            name: 'Walking',
                            icon: '👣'
                        },
                    ].map((mode) => (
                        <button
                            key={mode.id}
                            onClick={() => setTransportMode(mode.id)}
                            className={`flex flex-col items-center justify-center py-3 px-2 rounded-lg border transition-colors 
                ${mode.id === transportMode
                                    ? 'border-primary bg-primary/10 text-primary'
                                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                        >
                            <span className="text-xl mb-1">{mode.icon}</span>
                            <span className="text-sm font-medium">{mode.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Range Type Selector */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Range Type
                </label>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setRangeType('time')}
                        className={`flex-1 py-2 px-3 rounded-lg border transition-colors 
              ${rangeType === 'time'
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}
                    >
                        <Clock className="w-4 h-4 inline-block mr-2" />
                        Time
                    </button>
                    <button
                        onClick={() => setRangeType('distance')}
                        className={`flex-1 py-2 px-3 rounded-lg border transition-colors 
              ${rangeType === 'distance'
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}
                    >
                        <svg className="w-4 h-4 inline-block mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M2 12h20M2 12l5-5M2 12l5 5M22 12l-5-5M22 12l-5 5" />
                        </svg>
                        Distance
                    </button>
                </div>
            </div>

            {/* Range Values */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Range Values ({rangeType === 'time' ? 'minutes' : 'meters'})
                    </label>
                    {rangeValues.length < 3 && (
                        <button
                            onClick={handleAddRange}
                            className="text-primary text-sm hover:underline"
                        >
                            + Add range
                        </button>
                    )}
                </div>

                <div className="space-y-4">
                    {rangeValues.map((value, index) => (
                        <div key={index} className="flex items-center space-x-3">
                            <div className="flex-1">
                                <input
                                    type="range"
                                    min={rangeType === 'time' ? 5 : 500}
                                    max={rangeType === 'time' ? 60 : 5000}
                                    step={rangeType === 'time' ? 5 : 500}
                                    value={value}
                                    onChange={(e) => handleRangeChange(index, parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>
                                        {rangeType === 'time' ? '5m' : '500m'}
                                    </span>
                                    <span>
                                        {rangeType === 'time' ? formatTime(value) : formatDistance(value)}
                                        {rangeType === 'time' &&
                                            <span className="text-xs text-gray-400 ml-1">({value * 60} seconds)</span>
                                        }
                                    </span>
                                    <span>
                                        {rangeType === 'time' ? '60m' : '5km'}
                                    </span>
                                </div>
                            </div>

                            {rangeValues.length > 1 && (
                                <button
                                    onClick={() => handleRemoveRange(index)}
                                    className="text-red-500 hover:text-red-600"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Advanced Options Toggle */}
            <button
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className="flex items-center text-sm text-gray-700 dark:text-gray-300 hover:text-primary transition-colors w-full justify-between"
            >
                <span className="flex items-center">
                    <Sliders className="w-4 h-4 mr-2" />
                    Advanced Options
                </span>
                <ChevronRight className={`w-4 h-4 transition-transform ${showAdvancedOptions ? 'rotate-90' : ''}`} />
            </button>

            {/* Advanced Options Panel */}
            {showAdvancedOptions && (
                <div className="space-y-4 pl-2 border-l-2 border-gray-200 dark:border-gray-700">
                    {/* Smoothing */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Smoothing Factor (0-100)
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={smoothing}
                            onChange={(e) => setSmoothing(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>0 (Detailed)</span>
                            <span>{smoothing}</span>
                            <span>100 (Smooth)</span>
                        </div>
                    </div>

                    {/* Location Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Location Type
                        </label>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setLocationType('start')}
                                className={`flex-1 py-2 px-3 rounded-lg border transition-colors text-sm
                  ${locationType === 'start'
                                        ? 'border-primary bg-primary/10 text-primary'
                                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}
                            >
                                Starting Point
                            </button>
                            <button
                                onClick={() => setLocationType('destination')}
                                className={`flex-1 py-2 px-3 rounded-lg border transition-colors text-sm
                  ${locationType === 'destination'
                                        ? 'border-primary bg-primary/10 text-primary'
                                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}
                            >
                                Destination
                            </button>
                        </div>
                    </div>

                    {/* Distance Units section removed */}

                    {/* Intersections */}
                    <div className="flex items-center">
                        <input
                            id="intersections"
                            type="checkbox"
                            checked={intersections}
                            onChange={(e) => setIntersections(e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label htmlFor="intersections" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                            Show intersections between areas
                        </label>
                    </div>

                    {/* Avoid Borders */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Avoid Borders
                        </label>
                        <select
                            value={avoidBorders}
                            onChange={(e) => setAvoidBorders(e.target.value as any)}
                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white py-2 px-3 focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            <option value="">Don`t avoid borders</option>
                            <option value="all">Avoid all borders</option>
                            <option value="controlled">Avoid controlled borders</option>
                        </select>
                    </div>
                </div>
            )}

            {/* Warning if locations are not set */}
            {!hasValidLocations && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3 mt-4">
                    <div className="flex items-center">
                        <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                            Please select both locations before generating travel time areas
                        </p>
                    </div>
                </div>
            )}

            {/* Generate Button */}
            <button
                onClick={handleGenerateClick}
                disabled={!hasValidLocations || isLoading}
                className={`w-full flex items-center justify-center py-3 rounded-lg transition-colors mt-4 font-medium
          ${hasValidLocations && !isLoading
                        ? 'bg-primary hover:bg-primary/90 text-white'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'}`}
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                    </>
                ) : (
                    <>
                        <Users size={18} className="mr-2" />
                        Generate Travel Time Areas
                    </>
                )}
            </button>
        </div>
    );
}