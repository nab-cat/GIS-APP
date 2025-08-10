import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Plus_Jakarta_Sans, Manrope } from 'next/font/google';
import { ThemeProvider } from 'next-themes';

// Heading font
const heading = Plus_Jakarta_Sans({
    subsets: ['latin'],
    variable: '--font-heading',
    display: 'swap',
});

// Body font
const body = Manrope({
    subsets: ['latin'],
    variable: '--font-body',
    display: 'swap',
});

export default function App({ Component, pageProps }: AppProps) {
    return (
        <html lang="en" suppressHydrationWarning>
            <ThemeProvider attribute="class" enableSystem={true} defaultTheme="system">
                <main className={`${heading.variable} ${body.variable} font-body`}>
                    <Component {...pageProps} />
                </main>
            </ThemeProvider>
        </html>
    );
}
