import { useState } from "react";
import { MapPin, Trash2, Layers, Info, Menu, X, Compass, Loader2 } from "lucide-react";
import mapboxgl from "mapbox-gl";

interface MapOverlayProps {
    isMenuOpen: boolean;
    setIsMenuOpen: (isOpen: boolean) => void;
    selectedLocation: { lng: string; lat: string } | null;
    markers: mapboxgl.Marker[];
    onRemoveAllMarkers: () => void;
    onGetCurrentLocation: () => void;
    isLocating: boolean;
}

export default function MapOverlay({
    isMenuOpen,
    setIsMenuOpen,
    selectedLocation,
    markers,
    onRemoveAllMarkers,
    onGetCurrentLocation,
    isLocating,
}: MapOverlayProps) {
    return (
        <>
            {/* Mobile menu toggle button */}
            <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="absolute top-4 left-4 z-20 bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg"
            >
                {isMenuOpen ? (
                    <X size={24} className="text-primary" />
                ) : (
                    <Menu size={24} className="text-primary" />
                )}
            </button>

            {/* Current location button */}
            <button
                onClick={onGetCurrentLocation}
                disabled={isLocating}
                className="absolute top-4 right-14 z-20 bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg disabled:opacity-60"
                aria-label="Find my location"
                title="Find my location"
            >
                {isLocating ? (
                    <Loader2 size={24} className="text-primary animate-spin" />
                ) : (
                    <Compass size={24} className="text-primary" />
                )}
            </button>

            {/* App overlay - sidebar for desktop, bottom sheet for mobile */}
            <div
                className={`absolute z-10 transition-all duration-300 ease-in-out
                ${isMenuOpen
                        ? "bottom-0 left-0 right-0 sm:bottom-auto sm:left-4 sm:top-16 sm:w-80"
                        : "bottom-[-100%] left-0 right-0 sm:left-[-100%] sm:top-16 sm:w-80"
                    }
                bg-white dark:bg-gray-800 rounded-t-xl sm:rounded-xl shadow-xl
            `}
            >
                <div className="p-4 sm:p-5">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-heading text-lg font-bold text-gray-900 dark:text-white flex items-center">
                            <MapPin className="mr-2 text-primary" size={20} />
                            Location Explorer
                        </h2>
                        <button
                            onClick={() => setIsMenuOpen(false)}
                            className="sm:hidden text-gray-500 dark:text-gray-400 hover:text-primary"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gray-200 dark:bg-gray-700 mb-4"></div>

                    {/* Selected location info */}
                    <div className="mb-5">
                        <h3 className="font-heading text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 flex items-center">
                            <Info size={16} className="mr-1" /> Selected Location
                        </h3>
                        {selectedLocation ? (
                            <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                                <p className="font-body text-gray-900 dark:text-white mb-1">
                                    <span className="font-semibold">Longitude:</span>{" "}
                                    {selectedLocation.lng}
                                </p>
                                <p className="font-body text-gray-900 dark:text-white">
                                    <span className="font-semibold">Latitude:</span>{" "}
                                    {selectedLocation.lat}
                                </p>
                            </div>
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400 text-sm italic">
                                Click on the map to select a location
                            </p>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col gap-3">
                        <h3 className="font-heading text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                            Controls
                        </h3>
                        <button
                            onClick={onGetCurrentLocation}
                            disabled={isLocating}
                            className="flex items-center justify-center w-full py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors disabled:opacity-70"
                        >
                            {isLocating ? (
                                <Loader2 size={18} className="mr-2 animate-spin" />
                            ) : (
                                <Compass size={18} className="mr-2" />
                            )}
                            <span className="font-medium">
                                {isLocating ? "Locating..." : "Find My Location"}
                            </span>
                        </button>
                        
                        <button
                            onClick={onRemoveAllMarkers}
                            className="flex items-center justify-center w-full py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                        >
                            <Trash2 size={18} className="mr-2" />
                            <span className="font-medium">Remove All Markers</span>
                        </button>

                        <button className="flex items-center justify-center w-full py-2.5 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition-colors">
                            <Layers size={18} className="mr-2" />
                            <span className="font-medium">Toggle Map Style</span>
                        </button>
                    </div>

                    {/* Marker count */}
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-semibold">{markers.length}</span> marker
                            {markers.length !== 1 ? "s" : ""} on the map
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}