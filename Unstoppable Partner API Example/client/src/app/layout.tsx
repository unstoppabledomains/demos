import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from './context/CartContext';

export const metadata: Metadata = {
  title: "Unstoppable Domains Partner API Example",
  description: "Demo of Unstoppable Domains Partner API",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/x-icon" href="https://unstoppabledomains.com/favicon.ico" />
      </head>
      <body
        className={`antialiased`}
      >
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
