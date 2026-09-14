import type { Metadata, Viewport } from "next"
import "./globals.css"
import PwaRuntime from "@/components/PwaRuntime"

export const metadata: Metadata = {
  title: "Engineer's Dashboard",
  description:
    "Personal dashboard: clock & calendar, basic/scientific calculators, ANS memory, loan EMIs, area and land converters. Installable PWA, works offline.",
  applicationName: "Engineer's Dashboard",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "EDash",
    startupImage: "/icons/icon-512.png"
  },
  formatDetection: {
    telephone: false
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icons/icon-512.png", type: "image/png", sizes: "512x512" }
    ],
    apple: [
      { url: "/icons/icon-192.png", type: "image/png" },
      { url: "/icons/icon-512.png", type: "image/png" }
    ]
  },
  openGraph: {
    title: "Engineer's Dashboard",
    description: "Calculator suite + schedule + finance tools. Install as a PWA.",
    type: "website"
  }
}

export const viewport: Viewport = {
  themeColor: "#0b0f17",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <PwaRuntime />
      </body>
    </html>
  )
}