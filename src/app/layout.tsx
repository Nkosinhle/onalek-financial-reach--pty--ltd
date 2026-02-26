import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider>
          <div className="appShell">
            <SiteHeader />
            <main className="appMain">{children}</main>
            <SiteFooter />
          </div>
        </ClerkProvider>
      </body>
    </html>
  );
}