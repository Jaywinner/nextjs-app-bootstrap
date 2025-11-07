import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Image Upload & Model Processing",
  description: "Upload images and process them through AI models",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
