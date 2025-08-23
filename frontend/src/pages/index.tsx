import Navbar from "@/components/Navbar";
import Hero from "./home/hero";
import CTASection from "./home/cta";
import type { NextPage } from 'next';
import WhyChooseUs from "./home/why-choose-us";
import HowItWorks from "./home/how it works";

const Home: NextPage = () => {
    return (
        <div className="bg-white dark:bg-black">
            <Hero />
            <CTASection />
            <WhyChooseUs />
            <HowItWorks />
            
            {/* Navbar at the bottom */}
            <Navbar />
        </div>
    );
};

export default Home;
