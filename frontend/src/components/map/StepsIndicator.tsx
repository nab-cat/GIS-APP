import React from 'react';
import { MapPin, Users, Navigation, ChevronRight } from 'lucide-react';

interface StepsIndicatorProps {
    currentStep: number;
    className?: string;
}

export default function StepsIndicator({ currentStep = 0, className = '' }: StepsIndicatorProps) {
    // Define all steps
    const steps = [
        { icon: MapPin, label: 'Locations' },
        { icon: Users, label: 'Isochrones' },
        { icon: MapPin, label: 'Places' },
        { icon: Navigation, label: 'Directions' }
    ];

    return (
        <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 z-20 ${className}`}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg px-4 py-2">
                <div className="flex items-center space-x-2">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        const isActive = index === currentStep;
                        const isPast = index < currentStep;

                        return (
                            <React.Fragment key={index}>
                                {/* Add chevron between steps, but not before the first step */}
                                {index > 0 && (
                                    <ChevronRight size={12} className="text-gray-400" />
                                )}

                                {/* Step indicator */}
                                <div className="flex items-center space-x-1">
                                    <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-primary' :
                                            isPast ? 'bg-green-500' : 'bg-gray-300'
                                        }`}></div>
                                    <span title={step.label}>
                                        <Icon
                                            size={12}
                                            className={`${isActive ? 'text-primary' :
                                                    isPast ? 'text-green-500' : 'text-gray-500'
                                                }`}
                                        />
                                    </span>
                                </div>
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}