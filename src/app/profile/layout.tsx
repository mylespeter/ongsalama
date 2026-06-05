import type { Metadata } from "next";
import Navigation from "@/components/Navigation";



export const metadata: Metadata = {
  title: "Gestion Utilisateurs",
  description: "Traçabilité pharmaceutique",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
    
    <Navigation />
    <main>{children}</main>
    
    </>
    
       
  );
}