import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface ButtonPrimaryProps {
    href: string;
    label: string;
    icon?: LucideIcon;
    iconPosition?: "left" | "right";
    className?: string;
}

export default function ButtonPrimary({
    href,
    label,
    icon: Icon,
    iconPosition = "right",
    className = "",
}: ButtonPrimaryProps) {
    return (
        <Link
            href={href}
            className={`w-full sm:w-auto px-6 py-3 bg-primary hover:bg-black text-white hover:text-white dark:hover:bg-white dark:hover:text-primary rounded-lg font-medium flex items-center justify-center transition duration-300 ease-in-out hover:scale-105 ${className}`}
        >
            {Icon && iconPosition === "left" && <Icon className="mr-2 h-5 w-5" />}
            {label}
            {Icon && iconPosition === "right" && <Icon className="ml-2 h-5 w-5" />}
        </Link>
    );
}