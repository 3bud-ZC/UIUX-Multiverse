import type { Metadata, Viewport } from "next";
import { fontClassNames } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "ABUD — UI/UX Multiverse",
  description:
    "Ten independent design worlds by ABUD: AI software, luxury, music, fintech, games, architecture, mobile, marketing, product and commerce. Choose one and enter it.",
  applicationName: "ABUD — UI/UX Multiverse",
  authors: [{ name: "ABUD" }],
  openGraph: {
    title: "ABUD — UI/UX Multiverse",
    description: "Ten design worlds. One hand. Pick the one that looks like your problem.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#08080b",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontClassNames}>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
