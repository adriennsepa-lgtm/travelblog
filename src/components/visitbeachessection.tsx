// app/components/VisitBlogSection.tsx
import Image from "next/image";

const LUMANTANGBEACH = "/images/lumantangbeach.png";


// VisitBlogSection: A section with a collage of images and text encouraging users to visit the blog

export default function VisitBlogSection() {
  return (
    <section className="w-full bg-[#ccb39f]">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-start gap-12 px-6 py-20 md:grid-cols-2">
        {/* LEFT: text (1/3) */}
        <div className="md:col-span-1">
          <h2 className="text-3xl font-semibold tracking-tight text-neutral-900">
            Beaches to visit
          </h2>
          <p className="mt-3 mb-6 max-w-prose text-neutral-700"><strong>Dissappearing beach:</strong>  Off the coast of Maratua Paradise Resort, there’s a delicate, elongated sandbar that emerges during low tide, stretching into the clear ocean. But when the tide rolls in? Boom—it disappears under water. And then reappears. It’s that simple, yet special.</p>

          <p className="mt-3 mb-6 max-w-prose text-neutral-700">
          <strong>Lumantang Beach</strong> also known as Pantai Lumantang—is a slice of untouched paradise tucked away in Teluk Alulu on Maratua Island, Berau Regency, East Kalimantan, Indonesia 
evendo.com
. Think soft white sands, crystal-clear turquoise waters, lush palm-framed surroundings—ideal if you want to zone out, snap some killer Instagram shots, or snorkel without the circus crowd
          </p>
          <p><strong>Maratua guesthouse beach:</strong> fgjgfhhigfjgidfh</p>
        </div>

        {/* RIGHT: collage (2/3) */}
        <div className="md:col-span-1">
          {/* grid: 2 cols, healthy gap */}
          <div className="grid grid-cols-2 gap-6">
            {/* Row 1: single horizontal spanning both cols */}
            <figure className="col-span-2 overflow-hidden rounded-xl shadow">
              <div className="relative aspect-[16/9]">
                <Image
                  src={LUMANTANGBEACH}
                  alt="Maratua shoreline"
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 66vw, 100vw"
                />
              </div>
              <h3 className="mt-3 text-xl font-semibold text-neutral-900 text-center">
            Maratua Highlights
          </h3>
            </figure>

            {/* Row 2: two vertical images */}
            <figure className="overflow-hidden rounded-xl shadow">
              <div className="relative aspect-[3/4]">
                <Image
                  src={LUMANTANGBEACH}
                  alt="Lumantang beach"
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 33vw, 100vw"
                />
              </div>
              <h3 className="mt-3 text-xl font-semibold text-neutral-900 text-center">
            Maratua Highlights
          </h3>
            </figure>

            <figure className="overflow-hidden rounded-xl shadow">
              <div className="relative aspect-[3/4]">
                <Image
                  src={LUMANTANGBEACH}
                  alt="Turtle pass"
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 33vw, 100vw"
                />
              </div>
              
            </figure>
          </div>
          
        </div>
      </div>
    </section>
  );
}
