// This imports the 'Metadata' type from Next.js, which helps us define
// information for SEO, like the page title and description.
import type { Metadata } from "next";

// We import two modern fonts from Google via the next/font package.
// This is the optimized, professional way to handle fonts in Next.js.
import { Geist, Geist_Mono } from "next/font/google";

// This line imports all our global styles, including our theme colors.
import "./globals.css";

// We import the ThemeProvider we created, which handles our dark/light mode functionality.
import { ThemeProvider } from "@/components/theme-provider";

// --- FONT SETUP ---
// Here, we initialize our fonts and assign them to CSS variables.
// This makes them available throughout our entire application.
const geistSans = Geist({
  variable: "--font-geist-sans", // This will be our main sans-serif font.
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono", // This will be our monospace font, for code or numbers.
  subsets: ["latin"],
});

// --- METADATA ---
// This object defines the default title and description for our app.
// It's important for how the app appears in browser tabs and search engine results.
export const metadata: Metadata = {
  title: "Data Alchemist",
  description: "AI-enabled resource allocation configurator",
};

/**
 * This is the RootLayout component, the main shell for our entire application.
 * Every page we create will be passed in as the 'children' prop and rendered
 * inside this layout. This ensures a consistent look, font, and theme everywhere.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The 'suppressHydrationWarning' is important when using next-themes
    // to prevent a common warning related to server vs. client rendering of the theme.
    <html lang="en" suppressHydrationWarning>
      <body
        // We apply our font variables to the body. The 'antialiased' class
        // is a common utility to make text look smoother and more professional.
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/*
         * The ThemeProvider wraps our entire application. This is what allows
         * every component to know whether it's in light or dark mode.
         * We set 'dark' as the default theme here.
         */}
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
