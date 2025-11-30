"use client";

import Image from "next/image";
import VisitBeachesSection from "../components/VisitBeachesSection";
import CavesSection from "../components/VisitCavesSection";
import DivingSnorkelingSection from "../components/DivingSnorkelingSection";
import OtherActivitiesSection from "../components/OtherActivitiesSection";
import VisitOtherIslandsSection from "../components/VisitOtherIslandsSection";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import dynamic from "next/dynamic";

const AccomodationMap = dynamic(() => import("../components/MaratuaMap"), {
  ssr: false, // leaflet doesn't like SSR anyway
  loading: () => <p>Loading map…</p>
});


// Note: you can use local images too with next/image

// app/page.tsx (Server Component)
import type { Stay } from "@/lib/stays/types";

// Drop your images in /public and update the constants below
const MAINIMAGE = "/images/beach_with_palm_trees.png";
const PLANE_MARATUA = "/images/maratua_plane.png";
const DISSAPEARING_BEACH_HORIZONTAL = "/images/disappearing_beach_horizontal.png";
const MARATUA_JETTY = "/images/jetty_maratua.png";
const GRAGE_GUESTHOUSE = "/images/grage_guesthouse.jpg";
const CAVE = "/images/cave_04.png";

// font-family: 'Montserrat', 'Arial', sans-serif;
// font-weight: 700;
// color: #FFFFFF;
// letter-spacing: 0.01em;

export default async function TravelBlogLanding() {
  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <section className="relative">
        <div className="relative h-[48vh] w-full sm:h-[56vh] lg:h-[70vh]">
          <Image
            src={MAINIMAGE}
            alt="Lumantang beach"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <h1
              style={{
                fontFamily: "Playfair Display, Arial, sans-serif",
                fontWeight: 700,
                letterSpacing: "0.01em",
                textShadow: "0 2px 12px rgba(0,0,0,0.35)",
                color: "white",
              }}
              className="px-6 text-center text-3xl font-semibold tracking-tight text-white sm:text-5xl"
            >
              Exploring Maratua Island
            </h1>
          </div>
        </div>
      </section>
      <section className="w-full bg-[#f2efe9]">
        <div className="mx-auto grid max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="mt-3 text-neutral-800">
            Maratua Island is this dreamy little crescent-shaped island in
            Indonesia’s Derawan Archipelago. Think turquoise lagoons, untouched
            coral reefs, sea turtles everywhere, and a super laid-back vibe with
            small Bajau fishing villages. It’s the kind of place that feels far
            away from everything, perfect if you want diving, snorkeling, or
            just a quiet escape.
          </p>
          <div className="relative flex flex-row items-center gap-2 mt-10">
          <div className="relative w-full aspect-[3/3] overflow-hidden">

          <Image
            src= {DISSAPEARING_BEACH_HORIZONTAL}
            alt="Disappearing beach"
            fill
            className="object-cover"
          />
          </div>  
                <div className="relative w-full aspect-[3/3] overflow-hidden">
          <Image
            src={MARATUA_JETTY}
            alt="Maratua jetty"
            fill
            className="object-cover"

          />   
          </div>
                <div className="relative w-full aspect-[3/3] overflow-hidden"> 
          <Image
            src={GRAGE_GUESTHOUSE}
            alt="Grage guesthouse"
            fill
            className="object-cover"
          />
          </div>
                <div className="relative w-full aspect-[3/3] overflow-hidden">
          <Image
            src={CAVE}
            alt="Cave on Maratua"
            fill
            className="object-cover"
          />    
          </div>  
          </div>
        </div>
      </section>
      <section className="w-full flex bg-[#f7f7f7]">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-start gap-12 px-6 py-20 md:grid-cols-3">
          <div className="md:col-span-2">
            <h4 className="text-3xl font-semibold">How To Get To Maratua </h4>
            <p className="mt-3 text-neutral-600">
              There are different ways to get to Maratua. Most people fly into
              Berau (Kalimantan, Indonesia), then take a 2–3 hour car ride to
              Tanjung Batu port. From there, it’s another 2–3 hours by speedboat
              across the sea to Maratua. Some resorts also arrange direct
              transfers, which saves the hassle if you don’t want to figure it
              out yourself.
            </p>
            <p>
              The other option is to fly into Samarinda or Tarakan, which we
              chose. It is less known as mostly locals use it. The cost is
              similar to the boat ride from Berau, but it’s a lot quicker and
              more comfortable. The booking can be done only through a Whatsapp
              number.
            </p>
          </div>
          <div className="relative md:col-span-1">
            <Image
              src={PLANE_MARATUA}
              alt="Plane landing on Maratua"
              width={300}
              height={200}
              className="object-cover shadow rounded-[2px]"
            />
          </div>
        </div>
      </section>
      <section className="mx-auto  bg-[#f2efe9] gap-8 px-4 pb-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-start gap-12 px-6 py-20 md:grid-cols-2">
          <div className="relative h-56 w-full overflow-hidden rounded-lg border border-neutral-200 sm:h-72">
            <AccomodationMap />
          </div>
          <article className="space-y-3">
            <h2 className="text-3xl font-semibold tracking-tight text-neutral-900">Where to stay</h2>
            <p className="max-w-prose text-neutral-600">
              You’ve got a few options for where to stay depending on the vibe
              (and budget) you’re after. At the top end, there are fancy resorts
              right on the water, with private villas, infinity pools, and
              full-service dining — perfect if you want the postcard-style
              island escape. If you’d rather keep it simple but still
              comfortable, there are smaller bungalows around the island.
              They’re cheaper, usually run by locals, and often sit right on the
              beach with just the basics you need. For the most authentic
              experience, you can stay in a village homestay. It’s the least
              expensive option, and it gives you a chance to actually meet
              families, eat local food, and see daily island life up close.
            </p>
          </article>
        </div>
      </section>

      {/* Features list */}
      <VisitBeachesSection />
      <CavesSection />
      <DivingSnorkelingSection />
      <OtherActivitiesSection />
      <VisitOtherIslandsSection />

      {/* Footer */}
      <footer className="border-t border-neutral-200">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 text-sm text-neutral-500 sm:grid-cols-6">
            <div className="col-span-2 font-medium text-neutral-900">
              Site name
            </div>
            {Array.from({ length: 10 }).map((_, i) => (
              <a key={i} href="#" className="hover:text-neutral-700">
                Page
              </a>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-4 text-neutral-400">
            <span>© {new Date().getFullYear()} Your Name</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
