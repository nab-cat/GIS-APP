import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function Navigation() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [breadcrumbs, setBreadcrumbs] = useState<string[]>(["Home"]);

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

    return (
        <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
            {/* Floating container */}
            <nav
                aria-label="Main"
                className="w-full max-w-[1312px] min-h-[64px] px-4 lg:px-8 flex items-center justify-between rounded-full border border-white/15 bg-background/60 backdrop-blur-md shadow-lg pointer-events-auto"
            >
                {/* Left: Logo */}
                <div className="flex items-center gap-6">
                    <div className="flex w-[84px] h-9 px-[7.333px_6.667px] items-center justify-center">
                        <img
                            src="/logo.png"
                            alt="Logo"
                            width={60}
                            className="object-contain"
                        />
                    </div>
                </div>

                {/* Center: Breadcrumbs (small) */}
                <div className="flex-1 flex items-center lg:hidden">
                    <nav aria-label="Breadcrumbs" className="w-full">
                        <ol className="flex items-center gap-1 overflow-x-auto whitespace-nowrap px-2">
                            {breadcrumbs.map((crumb, idx) => (
                                <li key={`${crumb}-${idx}`} className="flex items-center">
                                    <span className="text-white font-body text-sm font-bold">{crumb}</span>
                                    {idx < breadcrumbs.length - 1 && (
                                        <ChevronRight className="w-4 h-4 mx-1 text-white/60 shrink-0" />
                                    )}
                                </li>
                            ))}
                        </ol>
                    </nav>
                </div>

                {/* Desktop Navigation Links (lg) */}
                <div className="hidden lg:flex flex-1 justify-center items-center gap-8">
                    <div className="flex items-center gap-8">
                        <div className="flex justify-center items-center gap-1">
                            <span className="text-white font-body text-base font-normal leading-[150%] cursor-pointer hover:text-primary transition-colors">
                                Link One
                            </span>
                        </div>
                        <div className="flex justify-center items-center gap-1">
                            <span className="text-white font-body text-base font-normal leading-[150%] cursor-pointer hover:text-primary transition-colors">
                                Link Two
                            </span>
                        </div>
                        <div className="flex justify-center items-center gap-2.5">
                            <span className="text-white font-body text-base font-normal leading-[150%] cursor-pointer hover:text-primary transition-colors">
                                Link Three
                            </span>
                        </div>
                        <div className="flex items-start gap-1 relative">
                            <button
                                aria-haspopup="menu"
                                aria-expanded={isDropdownOpen}
                                onClick={() => setIsDropdownOpen((v) => !v)}
                                className="flex w-[110px] justify-center items-center gap-1 hover:text-primary transition-colors"
                            >
                                <span className="text-white text-center font-body text-base font-normal leading-[150%]">
                                    Link Four
                                </span>
                                <ChevronDown className="w-5 h-5 text-white" />
                            </button>
                            {isDropdownOpen && (
                                <div className="absolute top-full mt-2 left-0 bg-background/95 backdrop-blur border border-white/20 rounded-lg py-2 min-w-[160px] z-50 shadow-xl">
                                    <div className="px-4 py-2 text-white hover:bg-white/10 cursor-pointer transition-colors">
                                        Dropdown Item 1
                                    </div>
                                    <div className="px-4 py-2 text-white hover:bg-white/10 cursor-pointer transition-colors">
                                        Dropdown Item 2
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Buttons (lg) + Mobile Menu Button (small) */}
                <div className="flex items-center gap-2">
                    {/* Desktop Buttons */}
                    <div className="hidden lg:flex justify-center items-center gap-4">
                        <button className="flex px-3 py-1.5 justify-center items-center gap-2 rounded-md border border-white/20 bg-transparent hover:bg-white/10 transition-colors">
                            <span className="text-white font-body text-base font-normal leading-[150%]">
                                Button
                            </span>
                        </button>
                        {/* Replaced rightmost button with theme switch */}
                        <ThemeToggle />
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        aria-label="Open menu"
                        onClick={() => setIsMobileMenuOpen((v) => !v)}
                        className="lg:hidden text-white p-2 rounded-md hover:bg-white/10 transition-colors"
                    >
                        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Overlay (only < lg) */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 lg:hidden">
                    <div className="flex flex-col items-center justify-center h-full gap-8 px-6">
                        <button
                            aria-label="Close menu"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="absolute top-4 right-4 text-white p-2 rounded-md hover:bg-white/10 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="flex flex-col items-center gap-6">
                            <span
                                className="text-white font-heading text-xl font-normal cursor-pointer hover:text-primary transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Link One
                            </span>
                            <span
                                className="text-white font-body text-xl font-normal cursor-pointer hover:text-primary transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Link Two
                            </span>
                            <span
                                className="text-white font-body text-xl font-normal cursor-pointer hover:text-primary transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Link Three
                            </span>
                            <span
                                className="text-white font-body text-xl font-normal cursor-pointer hover:text-primary transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Link Four
                            </span>
                        </div>

                        <div className="flex flex-col gap-4 w-48">
                            <button
                                className="flex px-4 py-2 justify-center items-center gap-2 rounded-md border border-white/20 bg-transparent hover:bg-white/10 transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <span className="text-white font-body text-base font-normal">
                                    Button
                                </span>
                            </button>
                            {/* Replaced second (rightmost equivalent) with theme switch */}
                            <div className="flex justify-center">
                                <ThemeToggle />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}