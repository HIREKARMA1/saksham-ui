import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { I18nProvider } from '@/components/providers/I18nProvider'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Saksham - AI Interview Preparation Platform',
    description: 'Get interview ready with AI-powered mock interviews, resume builder, job hunter, and real-time copilot assistance. Practice smarter and land your dream job.',
    keywords: 'AI interview preparation, mock interview, resume builder, job search, career development, interview copilot',
    authors: [{ name: 'HireKarma' }],
    openGraph: {
        title: 'Saksham - AI Interview Preparation Platform',
        description: 'Build your resume, practice smarter, and get real-time support with AI Interview Assistant.',
        type: 'website',
    },
}

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover'
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="light"
                    enableSystem
                    disableTransitionOnChange
                >
                    <I18nProvider>
                        {children}
                        <Toaster
                            position="top-right"
                            toastOptions={{
                                duration: 4000,
                                style: {
                                    background: 'var(--toast-bg)',
                                    color: 'var(--toast-color)',
                                    border: '1px solid var(--toast-border)',
                                },
                            }}
                        />
                    </I18nProvider>
                </ThemeProvider>
            </body>
        </html>
    )
}
