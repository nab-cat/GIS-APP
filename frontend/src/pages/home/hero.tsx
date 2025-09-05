import ButtonPrimary from "@/components/ui/button-primary";
import ButtonSecondary from "@/components/ui/button-secondary";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export default function Hero() {
    // Move the state inside the component
    const [isLoaded, setIsLoaded] = useState(false);
    const { resolvedTheme } = useTheme();

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const logoSrc = resolvedTheme === 'dark' ? '/logo-name-dark.svg' : '/logo-name.svg';

    return (
        // Main container with full viewport height and centered content
        <div className="relative flex flex-col items-center justify-center min-h-[100vh] px-6 sm:px-8 lg:px-12 pt-4 pb-24">
            {/* Background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 right-40 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 left-40 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl"></div>
            </div>

            {/* Main content */}
            <div
                className={`w-full max-w-7xl mx-auto text-center transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
            >
                {/* Logo */}
                <div className="mb-10 flex justify-center">
                    <Image
                        src={logoSrc}
                        alt="MMIM Logo"
                        width={200}
                        height={46}
                        className="h-auto"
                        priority
                    />
                </div>

                {/* Eyebrow text */}
                <p className="text-primary font-medium font-body mb-6 lg:mb-8 tracking-wider">
                    MEMPERKENALKAN
                </p>

                {/* Main headline - taking up full page width */}
                <h1 className="font-heading font-bold text-5xl sm:text-7xl lg:text-9xl text-gray-900 dark:text-white leading-[1.1] tracking-tight mb-6 lg:mb-10">
                    <span className="block text-primary">Meet Me</span>
                    <span className="block">In The <span className="text-primary">Middle</span></span>
                </h1>

                {/* Subtitle */}
                <p className="max-w-xl font-body mx-auto text-lg text-black dark:text-white mb-8 lg:mb-12">
                    Temukan tempat pertemuan yang strategis dari dua lokasi yang berbeda menggunakan algoritma canggih ini.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <ButtonPrimary href="/meet" label="Get Started" icon={ArrowRight} />
                    <ButtonSecondary href="#cta" label="Pelajari Lebih Lanjut" />
                </div>
            </div>
        </div>
    )
}