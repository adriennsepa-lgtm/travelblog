// app/components/CavesSection.tsx
import Image from "next/image";
const TABUNGCAVE = "/images/halo_tabung_cave.webp";
const GUMANTUNG_CAVE = "/images/gumantung_cave.webp";

const CavesSection = () => {
  return (
    <section className="w-full bg-[#f2efe9]">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-start gap-12 px-6 py-20 md:grid-cols-2">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="relative h-[350px] grid gap-2">
              <Image
                src={TABUNGCAVE}
                alt="Inside the limestone cave"
                fill
                className="object-cover rounded-[2px] shadow"
                sizes="(min-width: 768px) 25vw, 100vw"
              />
            </div>
            <h5 className="italic text-gray-500 text-center text-sm leading-7">Goa Halo Tabung</h5>

          </div>

          <div>
            <div className="relative h-[350px]">

              <Image
                src={GUMANTUNG_CAVE}
                alt="Cave opening to the sea"
                fill
                className="object-cover"
                sizes="(min-width: 768px) 25vw, 100vw"
              />

            </div>
            <h5 className="italic text-gray-500 text-center text-sm leading-7">Goa Gumantung
            </h5>

          </div>
        </div>

        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-neutral-900">
            Explore {"Maratua's"} Caves
          </h2>
          <p className="mt-4 text-neutral-700">
            {"Maratua's"} caves are some of the {"island's"} most intriguing hidden treasures.
            Dramatic limestone formations, secret pools, and openings to the turquoise sea
            make them a paradise for adventurers and divers alike.
          </p>
          <p className="mt-4 text-neutral-700">
            Whether you dive into crystal-clear cave lakes or wander through echoing caverns,
            these natural wonders bring you closer to the {"island's"} untold stories.
          </p>

        </div>
      </div>
    </section>
  );
}

export default CavesSection;