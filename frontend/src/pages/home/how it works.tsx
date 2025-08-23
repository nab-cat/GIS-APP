import { MapPin, Calculator, MessageCircle, ChevronRight } from "lucide-react";

export default function HowItWorks() {
    return (
        <section className="relative py-16 sm:py-24 lg:py-32 bg-white dark:bg-black overflow-hidden">
            <div className="max-w-screen-xl mx-auto px-6 lg:px-8">
                <div className="flex flex-col justify-center items-start gap-16 sm:gap-20">
                    {/* Section header */}
                    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20">
                        <div className="flex flex-col gap-4">
                            <p className="font-semibold text-primary dark:text-primary text-base">
                                Temukan
                            </p>
                            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                                Cara Kerja Meet Me in the Middle
                            </h2>
                        </div>
                        <p className="font-body text-lg text-gray-600 dark:text-gray-300">
                            Meet Me in the Middle memudahkan Anda untuk menentukan lokasi pertemuan yang ideal antara dua titik. Dengan menggunakan teknologi GIS, sistem kami secara otomatis menghitung titik tengah yang paling efisien. Anda juga dapat berkomunikasi dengan teman melalui fitur chat yang tersedia.
                        </p>
                    </div>

                    {/* Features */}
                    <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
                        {/* Feature 1 */}
                        <div className="flex flex-col gap-6">
                            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary dark:bg-primary/20">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <h3 className="font-heading text-2xl font-bold text-gray-900 dark:text-white">
                                Langkah-langkah Menentukan Lokasi Pertemuan
                            </h3>
                            <p className="font-body text-gray-600 dark:text-gray-300">
                                Masukkan dua lokasi yang ingin Anda temui.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="flex flex-col gap-6">
                            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary dark:bg-primary/20">
                                <Calculator className="w-6 h-6" />
                            </div>
                            <h3 className="font-heading text-2xl font-bold text-gray-900 dark:text-white">
                                Menghitung Titik Tengah Secara Otomatis
                            </h3>
                            <p className="font-body text-gray-600 dark:text-gray-300">
                                Sistem kami akan memberikan lokasi pertemuan terbaik.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="flex flex-col gap-6">
                            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary dark:bg-primary/20">
                                <MessageCircle className="w-6 h-6" />
                            </div>
                            <h3 className="font-heading text-2xl font-bold text-gray-900 dark:text-white">
                                Fitur Chat untuk Komunikasi Mudah
                            </h3>
                            <p className="font-body text-gray-600 dark:text-gray-300">
                                Berbicaralah dengan teman Anda tanpa hambatan.
                            </p>
                        </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <button className="px-6 py-3 bg-white border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white font-medium rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            Pelajari
                        </button>
                        <button className="px-6 py-3 text-primary font-medium rounded-full inline-flex items-center hover:underline transition-all">
                            Daftar
                            <ChevronRight className="w-5 h-5 ml-2" />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}