import { useEffect, useState } from "react";
import {
    ChevronDown,
    AlignJustify,
    Home,
    Layers,
    HelpCircle,
    Users,
    MessageSquare,
    LogIn
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import Link from "next/link";

export default function Navigation() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [breadcrumbs, setBreadcrumbs] = useState<string[]>(["Home"]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('[data-menu="true"]') && !target.closest('[data-menu-button="true"]')) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    // Auto-generate breadcrumbs from the current path
    useEffect(() => {
        if (typeof window !== "undefined") {
            const path = window.location.pathname.replace(/\/+$/, "");
            const parts = path.split("/").filter(Boolean);
            const pretty = parts.map((p) =>
                decodeURIComponent(p)
                    .replace(/[-_]/g, " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase())
            );
            setBreadcrumbs(pretty.length ? ["Home", ...pretty] : ["Home"]);
        }
    }, []);

    const currentPage = breadcrumbs[breadcrumbs.length - 1] || "Home";

    return (
        <>
            {/* Bottom fixed navbar */}
            <div className="fixed bottom-4 left-0 right-0 z-50 flex justify-center pointer-events-none min-w-[400px] max-w-screen-xl mx-auto">
                <div className="w-[min(92%,400px)] pointer-events-auto">
                    {/* Main navbar */}
                    <nav
                        aria-label="Main"
                        className="relative w-full min-h-[56px] px-4 flex items-center justify-between rounded-full border border-gray-200 dark:border-white/15 bg-white/95 dark:bg-black/90 backdrop-blur-md shadow-lg"
                    >
                        {/* Logo */}
                        <div className="flex items-center">
                            <img
                                src="/logo2.png"
                                alt="Logo"
                                width={36}
                                height={36}
                                className="object-contain"
                            />
                        </div>

                        {/* Current page name / breadcrumbs indicator */}
                        <div className="flex-1 mx-3 text-center">
                            <span className="font-medium text-gray-900 dark:text-white">
                                {currentPage}
                            </span>
                        </div>

                        {/* Theme toggle and menu button */}
                        <div className="flex items-center gap-2">
                            <ThemeToggle className="h-7 w-12" />

                            <button
                                data-menu-button="true"
                                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsMenuOpen(!isMenuOpen);
                                }}
                                className="text-gray-800 dark:text-white p-2 rounded-md hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                            >
                                {isMenuOpen ?
                                    <ChevronDown className="w-5 h-5" /> :
                                    <AlignJustify className="w-5 h-5" />
                                }
                            </button>
                        </div>
                    </nav>

                    {/* Bottom-up expanding menu - now transparent with max width */}
                    <div
                        data-menu="true"
                        className={`absolute bottom-full mb-3 left-1/2 -translate-x-1/2 overflow-hidden rounded-xl max-w-[400px] w-full backdrop-blur-sm transition-all duration-300 ease-in-out ${isMenuOpen
                            ? 'max-h-[500px] opacity-100 translate-y-0'
                            : 'max-h-0 opacity-0 translate-y-4'
                            }`}
                    >
                        <div className="p-4 space-y-3">
                            {/* Modern boxed links with icons */}
                            <Link
                                href="/"
                                className="block w-full text-left mb-2"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <div className="px-4 py-3 rounded-xl border border-gray-200 dark:border-white/15 bg-white/80 dark:bg-black/70 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 flex items-center">
                                    <Home className="w-5 h-5 text-gray-700 dark:text-gray-300 mr-3" />
                                    <span className="text-gray-900 dark:text-white font-medium">Beranda</span>
                                </div>
                            </Link>

                            <Link
                                href="/features"
                                className="block w-full text-left mb-2"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <div className="px-4 py-3 rounded-xl border border-gray-200 dark:border-white/15 bg-white/80 dark:bg-black/70 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 flex items-center">
                                    <Layers className="w-5 h-5 text-gray-700 dark:text-gray-300 mr-3" />
                                    <span className="text-gray-900 dark:text-white font-medium">Fitur</span>
                                </div>
                            </Link>

                            <Link
                                href="/how-it-works"
                                className="block w-full text-left mb-2"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <div className="px-4 py-3 rounded-xl border border-gray-200 dark:border-white/15 bg-white/80 dark:bg-black/70 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 flex items-center">
                                    <HelpCircle className="w-5 h-5 text-gray-700 dark:text-gray-300 mr-3" />
                                    <span className="text-gray-900 dark:text-white font-medium">How it Works</span>
                                </div>
                            </Link>

                            <Link
                                href="/about"
                                className="block w-full text-left mb-2"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <div className="px-4 py-3 rounded-xl border border-gray-200 dark:border-white/15 bg-white/80 dark:bg-black/70 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 flex items-center">
                                    <Users className="w-5 h-5 text-gray-700 dark:text-gray-300 mr-3" />
                                    <span className="text-gray-900 dark:text-white font-medium">About Us</span>
                                </div>
                            </Link>

                            <Link
                                href="/contact"
                                className="block w-full text-left mb-2"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <div className="px-4 py-3 rounded-xl border border-gray-200 dark:border-white/15 bg-white/80 dark:bg-black/70 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 flex items-center">
                                    <MessageSquare className="w-5 h-5 text-gray-700 dark:text-gray-300 mr-3" />
                                    <span className="text-gray-900 dark:text-white font-medium">Contact</span>
                                </div>
                            </Link>

                            {/* Login button with icon */}
                            <div className="pt-2">
                                <button className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-white/20 bg-white/90 dark:bg-black/80 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-center">
                                    <LogIn className="w-5 h-5 text-gray-700 dark:text-gray-300 mr-2" />
                                    <span className="text-gray-800 dark:text-white font-medium">
                                        Login
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}