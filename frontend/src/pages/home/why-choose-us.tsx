import { Award, Target, Zap, Rocket } from "lucide-react";

export default function WhyChooseUs() {
    return (
        <section className="relative py-16 sm:py-24 lg:py-32 bg-secondary dark:bg-black overflow-hidden">
            {/* Container with max width */}
            <div className="max-w-screen-xl mx-auto px-6 lg:px-8">
                <div className="flex flex-col justify-center items-center gap-16 sm:gap-20">
                    {/* Section header */}
                    <div className="max-w-2xl mx-auto text-center">
                        <p className="text-base font-semibold text-primary dark:text-primary mb-4">
                            Tagline
                        </p>
                        <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                            Medium length section heading goes here
                        </h2>
                        <p className="font-body text-lg text-gray-600 dark:text-gray-300">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.
                        </p>
                    </div>

                    {/* Features grid with image */}
                    <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Left column */}
                        <div className="space-y-16">
                            {/* Feature 1 */}
                            <div className="text-center">
                                <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary dark:bg-primary/20 mb-6">
                                    <Award className="w-6 h-6" />
                                </div>
                                <h3 className="font-heading text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                    Short heading goes here
                                </h3>
                                <p className="font-body text-gray-600 dark:text-gray-300">
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.
                                </p>
                            </div>

                            {/* Feature 2 */}
                            <div className="text-center">
                                <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary dark:bg-primary/20 mb-6">
                                    <Target className="w-6 h-6" />
                                </div>
                                <h3 className="font-heading text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                    Short heading goes here
                                </h3>
                                <p className="font-body text-gray-600 dark:text-gray-300">
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.
                                </p>
                            </div>
                        </div>

                        {/* Center - Image */}
                        <div className="flex justify-center items-center">
                            <img
                                className="w-full max-w-md rounded-3xl shadow-xl"
                                src="https://placehold.co/540x540"
                                alt="Features illustration"
                            />
                        </div>

                        {/* Right column */}
                        <div className="space-y-16">
                            {/* Feature 3 */}
                            <div className="text-center">
                                <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary dark:bg-primary/20 mb-6">
                                    <Zap className="w-6 h-6" />
                                </div>
                                <h3 className="font-heading text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                    Short heading goes here
                                </h3>
                                <p className="font-body text-gray-600 dark:text-gray-300">
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.
                                </p>
                            </div>

                            {/* Feature 4 */}
                            <div className="text-center">
                                <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary dark:bg-primary/20 mb-6">
                                    <Rocket className="w-6 h-6" />
                                </div>
                                <h3 className="font-heading text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                    Short heading goes here
                                </h3>
                                <p className="font-body text-gray-600 dark:text-gray-300">
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                        <button className="px-6 py-3 bg-white border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white font-medium rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            Pelajari
                        </button>
                        <button className="px-6 py-3 text-primary font-medium rounded-full inline-flex items-center hover:underline transition-all">
                            Gabung
                            <svg className="w-5 h-5 ml-2" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4.16667 10H15.8333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M10.8333 5L15.8333 10L10.8333 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}