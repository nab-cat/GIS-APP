import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

type Props = {
    className?: string;
};

export default function ThemeToggle({ className = "" }: Props) {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    // Avoid SSR mismatch
    if (!mounted) {
        return (
            <div
                className={`h-9 w-14 rounded-full border border-white/20 bg-white/10 animate-pulse ${className}`}
                aria-hidden="true"
            />
        );
    }

    const isDark = resolvedTheme === "dark";
    const next = isDark ? "light" : "dark";

    return (
        <button
            type="button"
            role="switch"
            aria-checked={isDark}
            aria-label={`Switch to ${next} mode`}
            onClick={() => setTheme(next)}
            className={`relative inline-flex h-9 w-14 items-center rounded-full border border-white/20 bg-white/10 hover:bg-white/15 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${className}`}
        >
            {/* Track gradient tint */}
            <span
                className={`absolute inset-0 rounded-full transition-opacity ${
                    isDark ? "opacity-30 bg-black" : "opacity-20 bg-yellow-400"
                }`}
                aria-hidden="true"
            />
            {/* Knob */}
            <span
                className={`absolute flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-900 shadow transition-transform duration-300 ${
                    isDark ? "translate-x-6" : "translate-x-1"
                }`}
            >
                <Sun
                    className={`h-4 w-4 absolute transition-opacity ${
                        isDark ? "opacity-0" : "opacity-100"
                    }`}
                    aria-hidden="true"
                />
                <Moon
                    className={`h-4 w-4 absolute transition-opacity ${
                        isDark ? "opacity-100" : "opacity-0"
                    }`}
                    aria-hidden="true"
                />
            </span>
        </button>
    );
}