// app/components/VisitBeachesSection.tsx
import Image from "next/image";

const LUMANTANG_BEACH = "/images/lumantangbeach.png";
const DISSAPEARING_BEACH_HORIZONTAL =
  "/images/disappearing_beach_horizontal.png";
const PRATASABA_BEACH = "/images/pratasaba_beach_03.png";

// VisitBeachesSection: A section with a collage of images and text encouraging users to visit the blog

export default function VisitBeachesSection() {
  return (
    <section className="w-full bg-[#f7f7f7]">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-start gap-12 px-6 py-20 md:grid-cols-2">
        {/* LEFT: text (1/3) */}
        <div className="md:col-span-1">
          <h2 className="text-3xl font-semibold tracking-tight text-neutral-900">
            Beaches to visit
          </h2>
          <p className="mt-3 mb-6 max-w-prose text-neutral-700">
            <strong>Dissappearing beach:</strong>a stretch of sand that shows up
            only at low tide and vanishes back into the sea as the water rises.
            You can get there by asking a local in Najo village to take you by
            boat. We paid around 300,000 rupiah for the trip, and the boatman
            waited about an hour while we explored before heading back.
          </p>

          <p className="mt-3 mb-6 max-w-prose text-neutral-700">
            <strong>Lumantang Beach</strong>: is a bit harder to reach, which
            keeps it quiet and wild. The beach is still mostly untouched, and
            you might see animals like monitor lizards wandering around. You
            need to be careful with the tides, since getting in and out isn’t
            always easy, and a few spots are spoiled by garbage, but overall it
            feels raw and remote.{" "}
          </p>
          <p>
            <strong>Beach next to Pratasaba resort:</strong> The beach next to
            Pratasaba Resort is easy to reach and stretches long with soft sand,
            lined with palm trees and clear turquoise water – perfect for a
            relaxed swim or just soaking in the view.
          </p>
        </div>

        <div className="relative w-[520px] h-[390px]">
          <div className="flex gap-x-7">
            <div className="flex flex-col gap-y-1">
              <div>
                <Image
                  src={LUMANTANG_BEACH}
                  alt="Diver"
                  className="w-[210px] h-[150px] object-cover shadow rounded-[2px]"
                  width={200}
                  height={180}
                />
                <h5 className="italic text-gray-500 text-center text-sm leading-7">
                  Lumatang beach
                </h5>
              </div>
              <div>
                <Image
                  src={PRATASABA_BEACH}
                  alt="Pratasaba beach"
                  className="w-[210px] h-[270px] object-cover shadow rounded-[2px]"
                  width={200}
                  height={170}
                />
                <h5 className="italic text-gray-500 text-center text-sm leading-7">
                  Pratasaba beach
                </h5>
              </div>
            </div>

            <div>
              <Image
                src={DISSAPEARING_BEACH_HORIZONTAL}
                alt="Surfer"
                className="w-[290px] h-[450px] object-cover shadow rounded-[2px]"
                width={290}
                height={370}
              />
              <h5 className="italic text-gray-500 text-center text-sm leading-7">
                Disappering beach
              </h5>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
