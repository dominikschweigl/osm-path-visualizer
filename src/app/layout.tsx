import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "@/styles/globals.css";
import { Toaster } from "sonner";
import Navigation from "@/components/layouts/Navigation";

export const metadata: Metadata = {
  title: "OSM Pathfinding Visualizer",
  description: `Visualize the search for the shortest path between any two locations on Earth using our tool. 
      Compare how algorithms like Dijkstra's and A* find the most efficient routes in real-time on 
      a global map. Ideal for learning and understanding pathfinding concepts.`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={GeistSans.className + "bg-gray-50"}>
        <div className="grid h-screen w-full">
          <div className="flex flex-col">
            <Navigation />
            {children}
            <Toaster />
          </div>
        </div>
      </body>
    </html>
  );
}
