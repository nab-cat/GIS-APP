import Link from 'next/link';

const navItems = [
    { name: 'Home', href: '#' },
    { name: 'Explore', href: '#' },
    { name: 'Features', href: '#' },
    { name: 'Contact', href: '#' },
];

export default function Navbar() {
    return (
        <nav className="w-full px-6 py-4 bg-white dark:bg-dark border-b border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="max-w-6xl mx-auto flex justify-between items-center">
                <div className="text-2xl font-heading text-primary dark:text-secondary">
                    GeoApp
                </div>
                <div className="flex gap-6 text-sm font-medium">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="text-dark dark:text-light hover:text-primary dark:hover:text-secondary transition-colors"
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>
            </div>
        </nav>
    );
}
