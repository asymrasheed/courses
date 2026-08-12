import { Fraunces, Archivo } from "next/font/google";
import ToastProvider from "@/components/ToastProvider";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

export const metadata = {
  title: "Curio — Course & Question Bank",
  description: "Manage categories, courses and question banks.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${archivo.variable}`}>
      <body>
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
