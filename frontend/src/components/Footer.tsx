export default function Footer() {
    return (
        <footer className="w-full px-6 py-8 bg-gray-100 dark:bg-zinc-900 text-sm text-center text-gray-600 dark:text-gray-400">
            &copy; {new Date().getFullYear()} GeoApp. All rights reserved.
        </footer>
    );
}
