import { ReactNode } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen bg-light text-dark dark:bg-dark dark:text-light">
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
        </div>
    );
}
