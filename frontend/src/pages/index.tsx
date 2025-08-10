import Image from "next/image";
import Navbar from "@/components/Navbar";


export default function Home() {
    return (
        <div className="bg-secondary bg-grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
            <Navbar />
        </div>
    );
}