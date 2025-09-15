import React from 'react';
import { MapPin, Users, Navigation, ChevronRight, Search } from 'lucide-react';

interface StepsIndicatorProps {
    currentStep: number;
    className?: string;
}

export default function StepsIndicator({ currentStep = 0, className = '' }: StepsIndicatorProps) {
    // Define all steps
    const steps = [
        { icon: MapPin, label: 'Locations' },        // Step 1: Choose two points
        { icon: Users, label: 'Isochrones' },        // Step 2: Isochrone options
        { icon: MapPin, label: 'Intersections' },    // Step 3: Generate isochrones & intersections
        { icon: Search, label: 'Search' },           // Step 4: Search options for POIs
        { icon: Navigation, label: 'Places' }        // Step 5: Choose location
    ];

    return (
        <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 z-20 ${className}`}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg px-4 py-2">
                <div className="flex items-center space-x-1.5">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        const isActive = index === currentStep;
                        const isPast = index < currentStep;

                        return (
                            <React.Fragment key={index}>
                                {/* Add chevron between steps, but not before the first step */}
                                {index > 0 && (
                                    <ChevronRight size={10} className="text-gray-400 mx-0.5" />
                                )}

                                {/* Step indicator */}
                                <div className="flex items-center space-x-1" title={step.label}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-primary' :
                                            isPast ? 'bg-green-500' : 'bg-gray-300'
                                        }`}></div>
                                    <Icon
                                        size={11}
                                        className={`${isActive ? 'text-primary' :
                                                isPast ? 'text-green-500' : 'text-gray-500'
                                            }`}
                                    />
                                </div>
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}