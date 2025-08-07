import Layout from '@/layout/Layout';

export default function LandingPage() {
    return (
        <Layout>
            <section className="max-w-6xl mx-auto px-6 py-20 text-center">
                <h1 className="text-h1 lg:text-[3rem] font-heading text-primary dark:text-secondary">
                    Discover Jakarta’s Points of Interest
                </h1>
                <p className="text-body lg:text-lg mt-4 text-muted dark:text-gray-400">
                    Map your journey through parks, museums, and more.
                </p>
            </section>
        </Layout>
    );
}
