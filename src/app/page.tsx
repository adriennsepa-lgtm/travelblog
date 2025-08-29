
// import { getHomestays } from "../app/api/jadesta/route";

//   const data = await getHomestays();      


// export default function Home() {


//   console.log(data, "this is dataaaa")


//   return (
//     <div style={{ padding: 20 }}>

      
//   <h1>Homestays: { data?.count}</h1>
//       <ul>
//         { data?.count > 0 && data.items.map((item: any) => (
//           <li key={item.url}>
//             <a href={item.url} target="_blank" rel="noreferrer">
//               {item.name || "(no title)"}
//               <br></br>
//             </a>
//             {" — "}
//             Address: {item.address || ""}
//             {" — "}<br></br>
//             Phone: {item.phone_primary || ""}<br></br>
//             Price: {item.price_rp_numeric.toLocaleString()}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }

import Image from "next/image";
import MaratuaMap from "../components/MaratuaMap";
import VisitBlogSection from "../components/VisitBeachesSection";
import CavesSection from "../components/VisitCavesSection";
import VisitOtherIslandsSection from "../components/VisitOtherIslandsSection";
import 'leaflet/dist/leaflet.css';
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import HotelMap from "../components/MaratuaMap";

// Note: you can use local images too with next/image


// Drop your images in /public and update the constants below
const MAINIMAGE = "/maratua/lumantangbeach.png"


export default function TravelBlogLanding() {
  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <section className="relative">
        <div className="relative h-[48vh] w-full sm:h-[56vh] lg:h-[64vh]">
          <Image src={MAINIMAGE} alt="Lumantang beach" fill priority className="object-cover" />
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="px-6 text-center text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            Exploring Maratua Island
                        </h1>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <article className="space-y-3">
            <h2 className="text-2xl font-semibold">Brief introduction with</h2>
            <p className="max-w-prose text-neutral-600">
              You can fly fom Samarinda, Taraka or you can take the sppedboat from Berau. The speedboat takes about 2-3 hours and costs around IDR 150,000 one way. From the harbor in Maratua you can take a local boat to your accommodation.
            </p>
            <div className="flex gap-3">
              
            </div>
          </article>

          <div className="relative h-56 w-full overflow-hidden rounded-lg border border-neutral-200 sm:h-72">
            <HotelMap />
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl gap-8 px-4 pb-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="relative h-56 w-full overflow-hidden rounded-lg border border-neutral-200 sm:h-72">
            <MaratuaMap />
          </div>
          <article className="space-y-3">
            <h2 className="text-2xl font-semibold">Where to stay</h2>
            <p className="max-w-prose text-neutral-600">
              A subheading for this section, as long or as short as you like
            </p>
            
          </article>
        </div>
      </section>


      {/* Features list */}
      <section className="">
        <h3 className="text-xl font-semibold">Activities and places to explore</h3>
        <VisitBlogSection />
        <CavesSection />
        <VisitOtherIslandsSection />
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 text-sm text-neutral-500 sm:grid-cols-6">
            <div className="col-span-2 font-medium text-neutral-900">Site name</div>
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


