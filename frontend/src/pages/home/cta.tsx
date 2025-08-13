import { MapPin, Navigation, ArrowRight } from "lucide-react";

export default function CTASection() {
    return (
        <section className="relative py-16 sm:py-24 lg:py-32 overflow-hidden bg-primary dark:bg-black" id="cta">
            {/* Container with max width */}
            <div className="max-w-screen-xl mx-auto px-6 lg:px-8">

                {/* Background map pattern - absolute positioned */}
                <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.07]">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <pattern id="mapGrid" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="currentColor" strokeWidth="1" />
                        </pattern>
                        <rect width="100%" height="100%" fill="url(#mapGrid)" />
                    </svg>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary/10 blur-3xl transform translate-x-[-30%] translate-y-[30%]"></div>
                <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-secondary/10 blur-3xl transform translate-y-[10%] translate-x-[10%]"></div>

                {/* Floating map pins */}
                <div className="hidden lg:block absolute top-1/4 right-1/4">
                    <MapPin className="w-16 h-16 text-primary/20 animate-pulse" />
                </div>
                <div className="hidden lg:block absolute bottom-1/3 left-1/4">
                    <MapPin className="w-12 h-12 text-secondary/20 animate-pulse" style={{ animationDelay: "1s" }} />
                </div>

                {/* Main content area with grid */}
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">

                    {/* Left column - text content */}
                    <div className="order-2 lg:order-1">
                        <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
                            Find Your Perfect <span className="text-primary">Meeting Point</span> on the Map
                        </h2>

                        <p className="font-body text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-lg">
                            Our intelligent GIS system calculates the optimal meeting location based on everyone's starting points, preferred transportation methods, and venue types.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button className="px-6 py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg flex items-center justify-center transition-all duration-200 shadow-lg shadow-primary/20">
                                Find Middle Point
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </button>
                            <button className="px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                                How It Works
                            </button>
                        </div>
                    </div>

                    {/* Right column - visual element */}
                    <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
                        <div className="relative w-full max-w-md">
                            {/* Map visual with pin */}
                            <div className="relative aspect-square w-full rounded-2xl bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-900 p-1 border border-gray-200 dark:border-gray-800 shadow-xl">
                                {/* Map content */}
                                <div className="absolute inset-0 rounded-xl overflow-hidden bg-[url('/logo.png')] bg-cover bg-center opacity-50">
                                    {/* You can replace this with an actual map image */}
                                </div>

                                {/* Center pin with pulse effect */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                                    <div className="relative">
                                        <div className="absolute -inset-4 rounded-full bg-primary/20 animate-ping"></div>
                                        <div className="absolute -inset-8 rounded-full bg-primary/10 animate-pulse"></div>
                                        <div className="relative bg-primary text-white p-3 rounded-full shadow-lg">
                                            <Navigation className="h-6 w-6" />
                                        </div>
                                    </div>
                                </div>

                                {/* Connection lines to the center */}
                                <svg className="absolute inset-0 w-full h-full rounded-2xl bg-white dark:bg-black " xmlns="http://www.w3.org/2000/svg">
                                    <line x1="20%" y1="20%" x2="50%" y2="50%" stroke="currentColor" className="stroke-primary/50" strokeWidth="2" strokeDasharray="4" />
                                    <line x1="80%" y1="30%" x2="50%" y2="50%" stroke="currentColor" className="stroke-primary/50" strokeWidth="2" strokeDasharray="4" />
                                    <line x1="75%" y1="75%" x2="50%" y2="50%" stroke="currentColor" className="stroke-primary/50" strokeWidth="2" strokeDasharray="4" />
                                    <line x1="25%" y1="65%" x2="50%" y2="50%" stroke="currentColor" className="stroke-primary/50" strokeWidth="2" strokeDasharray="4" />
                                </svg>

                                {/* Corner pins */}
                                <div className="absolute top-[20%] left-[20%] p-1 bg-secondary rounded-full shadow-lg">
                                    <MapPin className="h-4 w-4 text-white" />
                                </div>
                                <div className="absolute top-[30%] left-[80%] p-1 bg-secondary rounded-full shadow-lg">
                                    <MapPin className="h-4 w-4 text-white" />
                                </div>
                                <div className="absolute top-[75%] left-[75%] p-1 bg-secondary rounded-full shadow-lg">
                                    <MapPin className="h-4 w-4 text-white" />
                                </div>
                                <div className="absolute top-[65%] left-[25%] p-1 bg-secondary rounded-full shadow-lg">
                                    <MapPin className="h-4 w-4 text-white" />
                                </div>
                            </div>

                            {/* Stats badges floating over the map */}
                            <div className="absolute -bottom-6 -right-6 bg-white dark:bg-gray-900 px-4 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                                <p className="font-heading font-bold text-gray-900 dark:text-white text-lg">2,500+ <span className="text-primary">Meetups</span></p>
                                <p className="font-body text-sm text-gray-500 dark:text-gray-400">Coordinated Daily</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}