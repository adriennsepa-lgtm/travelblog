// app/components/CavesSection.tsx
import Image from "next/image";
const TABUNGCAVE =  "/images/goahalotabung.png";

 const CavesSection = () => {
  return (
    <section className="w-full bg-[#f2efe9]">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-start gap-12 px-6 py-20 md:grid-cols-2">
        <div>
          <div className="grid grid-cols-2 gap-6">
            <figure className="overflow-hidden rounded-xl shadow">
              <div className="relative aspect-[3/4]">
                <Image
                  src={TABUNGCAVE}
                  alt="Inside the limestone cave"
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 25vw, 100vw"
                />
              </div>
            </figure>
            
            <figure className="overflow-hidden rounded-xl shadow">
              <div className="relative aspect-[3/4]">
                <Image
                  src={TABUNGCAVE}
                  alt="Cave opening to the sea"
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 25vw, 100vw"
                />
              </div>
            </figure>
            <h3 className="mt-6 text-lg font-semibold text-neutral-900 text-center">
            Maratua Caves
          </h3>
          </div>
          
        </div>

        {/* RIGHT: text (1/2 width) */}
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-neutral-900">
            Exploring the <em className="not-italic font-serif italic">Caves</em>
          </h2>
          <p className="mt-4 text-neutral-700">
            Maratua’s caves are some of the island’s most intriguing hidden treasures.
            Dramatic limestone formations, secret pools, and openings to the turquoise sea
            make them a paradise for adventurers and divers alike.
          </p>
          <p className="mt-4 text-neutral-700">
            Whether you dive into crystal-clear cave lakes or wander through echoing caverns,
            these natural wonders bring you closer to the island’s untold stories.
          </p>

        </div>
      </div>
    </section>
  );
}

export default CavesSection;