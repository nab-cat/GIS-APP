import React from 'react';
import { MapPin, Users, Navigation, Loader2, ChevronLeft, ChevronRight, MapIcon, Car, Footprints, Bike, X, Search, Compass, ArrowRight, Clock } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MeetInMiddleMapSkeletonProps {
    className?: string;
}

export default function MeetInMiddleMapSkeleton({ className = '' }: MeetInMiddleMapSkeletonProps) {
    return (
        <div className={`relative w-full h-screen bg-white dark:bg-gray-900 ${className}`}>
            {/* Map container - This is just the container, no actual map initialization */}
            <div className="w-full h-screen" />

            {/* Step Indicator */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg px-4 py-2">
                    <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 rounded-full bg-primary"></div>
                            <MapPin size={12} className="text-gray-500" />
                        </div>
                        <ChevronRight size={12} className="text-gray-400" />
                        <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                            <Users size={12} className="text-gray-500" />
                        </div>
                        <ChevronRight size={12} className="text-gray-400" />
                        <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                            <MapPin size={12} className="text-gray-500" />
                        </div>
                        <ChevronRight size={12} className="text-gray-400" />
                        <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                            <Navigation size={12} className="text-gray-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Loading Indicator */}
            <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-20">
                <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded-lg px-3 py-2">
                    <div className="flex items-center space-x-2">
                        <Loader2 size={16} className="animate-spin text-yellow-600" />
                        <span className="text-yellow-800 dark:text-yellow-200 text-sm">Loading map...</span>
                    </div>
                </div>
            </div>

            {/* Map Picker Indicator */}
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

            {/* Control Panel */}
            <div className="absolute bottom-4 left-4 right-4 z-20">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-h-96 overflow-y-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-heading text-lg font-semibold text-gray-900 dark:text-white">
                            Select Locations
                        </h2>
                        <div className="flex items-center space-x-2">
                            <button
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                className="p-2 text-primary hover:text-primary/80"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Location Step Content */}
                    <div className="space-y-4">
                        {/* Location Selector A */}
                        <div className="relative">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-heading text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                                    <MapPin className="mr-2 text-primary" size={20} />
                                    User A Location
                                </h3>
                                <button
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                    title="Clear location"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Search Input */}
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
                                {/* Current Location Button */}
                                <button
                                    className="flex-1 flex items-center justify-center py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors"
                                >
                                    <Compass size={18} className="mr-2" />
                                    <span className="font-medium">
                                        Current Location
                                    </span>
                                </button>

                                {/* Map Picker Button */}
                                <button
                                    className="flex-1 flex items-center justify-center py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors"
                                >
                                    <MapIcon size={18} className="mr-2" />
                                    <span className="font-medium">
                                        Pick on Map
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Location Selector B - Similar structure */}
                        <div className="relative">
                            {/* Same structure as A, just different labels */}
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-heading text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                                    <MapPin className="mr-2 text-primary" size={20} />
                                    User B Location
                                </h3>
                            </div>
                            {/* Search input and buttons would go here */}
                        </div>
                    </div>

                    {/* Isochrone Step Content */}
                    <div className="space-y-4">
                        <div className="text-center">
                            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                                Isochrone Analysis
                            </h3>

                            {/* Travel Mode Selector */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Travel Mode
                                </label>
                                <div className="flex space-x-2">
                                    {[
                                        { id: 'driving', name: 'Driving', icon: Car },
                                        { id: 'walking', name: 'Walking', icon: Footprints },
                                        { id: 'cycling', name: 'Cycling', icon: Bike },
                                    ].map((mode) => {
                                        const Icon = mode.icon;
                                        return (
                                            <button
                                                key={mode.id}
                                                className={`flex-1 flex items-center justify-center py-2 px-3 rounded-lg border transition-colors 
                          ${mode.id === 'driving' ? 'border-primary bg-primary/10 text-primary' :
                                                        'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}
                                            >
                                                <Icon size={16} className="mr-2" />
                                                <span className="text-sm font-medium">{mode.name}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Max Travel Time Slider */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Maximum Travel Time: 30 minutes
                                </label>
                                <input
                                    type="range"
                                    min="5"
                                    max="60"
                                    step="5"
                                    value="30"
                                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>5m</span>
                                    <span>30m</span>
                                    <span>60m</span>
                                </div>
                            </div>

                            {/* Contour Times (Multiple Travel Times) */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Show Travel Time Contours
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {[10, 20, 30, 40, 50, 60].map((time) => (
                                        <label key={time} className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-300 text-primary shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                                                checked={time <= 30}
                                                disabled={time > 30}
                                            />
                                            <span className="ml-1 text-sm">{time}m</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Generate Button */}
                            <button
                                className="w-full flex items-center justify-center py-3 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors mt-4"
                            >
                                <Users size={18} className="mr-2" />
                                <span className="font-medium">
                                    Generate Travel Time Areas
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Places Step Content */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium text-gray-900 dark:text-white flex items-center">
                                <MapPin className="mr-2 text-primary" size={18} />
                                Choose Meeting Spot
                            </h3>
                        </div>

                        {/* Filter options */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            <button className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full border border-primary/20">
                                All
                            </button>
                            <button className="px-3 py-1 bg-transparent text-gray-700 dark:text-gray-300 text-xs rounded-full border border-gray-200 dark:border-gray-700">
                                Restaurants
                            </button>
                            <button className="px-3 py-1 bg-transparent text-gray-700 dark:text-gray-300 text-xs rounded-full border border-gray-200 dark:border-gray-700">
                                Coffee
                            </button>
                            <button className="px-3 py-1 bg-transparent text-gray-700 dark:text-gray-300 text-xs rounded-full border border-gray-200 dark:border-gray-700">
                                Parks
                            </button>
                        </div>

                        {/* Loading State */}
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="animate-spin text-primary" size={24} />
                            <span className="ml-2 text-gray-600 dark:text-gray-400">Finding meeting spots...</span>
                        </div>

                        {/* Places List */}
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {/* Place Item */}
                            <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                                            Coffee Shop Example
                                        </h4>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                            123 Example Street
                                        </p>

                                        <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                                            <span className="flex items-center">
                                                <Navigation size={12} className="mr-1" />
                                                1.2km
                                            </span>
                                        </div>
                                    </div>
                                    <button className="px-3 py-1 bg-primary text-white text-xs rounded-md hover:bg-primary/90 transition-colors">
                                        Select
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Step Content */}
                    <div className="space-y-4">
                        <div className="mb-4">
                            <h3 className="font-heading text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-2">
                                <Navigation className="mr-2 text-primary" size={20} />
                                Directions
                            </h3>
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                <MapPin className="mr-1" size={14} />
                                To: Example Meeting Place
                            </div>
                        </div>

                        {/* Travel Mode Selector */}
                        <div className="mb-4">
                            <div className="flex space-x-2">
                                <button className="flex-1 flex items-center justify-center py-2 px-3 rounded-lg border border-primary bg-primary/10 text-primary">
                                    <Car size={16} className="mr-2 text-blue-500" />
                                    <span className="text-sm font-medium">Driving</span>
                                </button>
                                <button className="flex-1 flex items-center justify-center py-2 px-3 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">
                                    <Footprints size={16} className="mr-2 text-green-500" />
                                    <span className="text-sm font-medium">Walking</span>
                                </button>
                                <button className="flex-1 flex items-center justify-center py-2 px-3 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">
                                    <Bike size={16} className="mr-2 text-orange-500" />
                                    <span className="text-sm font-medium">Cycling</span>
                                </button>
                            </div>
                        </div>

                        {/* Get Directions Button */}
                        <button className="w-full flex items-center justify-center py-3 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors mb-4">
                            <Navigation size={18} className="mr-2" />
                            <span className="font-medium">
                                Get Directions
                            </span>
                        </button>

                        {/* Routes */}
                        <div className="space-y-3">
                            {/* Route A */}
                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 rounded-full mr-2 bg-blue-500"></div>
                                        <span className="font-medium text-gray-900 dark:text-white text-sm">
                                            User A
                                        </span>
                                    </div>
                                    <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                        <ArrowRight size={16} />
                                    </button>
                                </div>

                                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                                    <div className="flex items-center">
                                        <Clock size={14} className="mr-1" />
                                        15m
                                    </div>
                                    <div className="flex items-center">
                                        <Navigation size={14} className="mr-1" />
                                        5.2km
                                    </div>
                                </div>

                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                    From: User A Location
                                </div>
                            </div>

                            {/* Route B - Similar structure */}
                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 rounded-full mr-2 bg-red-500"></div>
                                        <span className="font-medium text-gray-900 dark:text-white text-sm">
                                            User B
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Meeting Spot Info */}
                        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-2">
                                Meeting Spot Details
                            </h4>
                            <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                                <div className="flex items-center">
                                    <MapPin size={12} className="mr-2" />
                                    Example Address
                                </div>
                            </div>
                        </div>

                        {/* Navigation Actions */}
                        <div className="mt-4 space-y-2">
                            <button className="w-full py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-medium">
                                Share Meeting Details
                            </button>
                            <button className="w-full py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-medium">
                                Save to Calendar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Debug Info Panel */}
            <div className="absolute top-16 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-xs w-full z-20">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">
                    Debug Info
                </h3>
                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                    <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Current Step:</span> location
                    </div>
                    <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Travel Mode:</span> driving
                    </div>
                    <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Max Travel Time:</span> 30 minutes
                    </div>
                    <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Contour Times:</span> 10, 20, 30
                    </div>
                </div>

                {/* Overlap Area Info */}
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg mt-2">
                    <div className="flex items-center mb-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                        <span className="font-medium text-green-800 dark:text-green-200">Overlap Area</span>
                    </div>
                    <p className="text-sm text-green-600 dark:text-green-400">
                        Meeting area found! Travel time: 15 minutes
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                        Area: 5.2 km²
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Travel mode: driving | Max time: 30min
                    </p>
                </div>
            </div>
        </div>
    );
}