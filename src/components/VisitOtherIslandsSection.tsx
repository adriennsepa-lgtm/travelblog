// app/components/VisitOtherIslandsSection.tsx
import Image from "next/image";
const TABUNGCAVE =  "/images/goahalotabung.png";

export default function VisitOtherIslandsSection() {
  return (
    <section className="w-full bg-[#f6f3ee]">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-start gap-12 px-6 py-20 md:grid-cols-2">
        {/* LEFT: text (1/2) */}
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-neutral-900">
            Visit <em className="not-italic font-serif italic">Other Islands</em>
          </h2>
          <p className="mt-4 text-neutral-700">
            Maratua’s neighbors are wild and worth it. Hop across to Kakaban for
            jellyfish lakes, Sangalaki for manta runs, and Derawan for calm, easy days.
          </p>
          <p className="mt-4 text-neutral-700">
            Short boat rides, big payoffs. Plan a day trip or build a mini-loop.
          </p>

          <a
            href="/blog/other-islands"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white shadow hover:opacity-90"
          >
            SEE THE ISLAND HOP GUIDE
          </a>
        </div>

        {/* RIGHT: collage (2 horizontals + 3 verticals) */}
        <div>
          {/* Row 1: two horizontals */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <figure className="overflow-hidden rounded-xl shadow">
              <div className="relative aspect-[16/9] w-full">
                <Image
                  src={TABUNGCAVE}
                  alt="Island lagoon"
                  fill
                  className="object-cover"
                />
              </div>
            </figure>
            <figure className="overflow-hidden rounded-xl shadow">
              <div className="relative aspect-[16/9] w-full">
                <Image
                  src={TABUNGCAVE}
                  alt="Kakaban reef"
                  fill
                  className="object-cover"
                />
              </div>
            </figure>
          </div>

          {/* Row 2: three verticals */}
          <div className="grid grid-cols-3 gap-4">
            <figure className="overflow-hidden rounded-xl shadow">
              <div className="relative aspect-[3/4] w-full">
                <Image
                  src={TABUNGCAVE}
                  alt="Sangalaki manta ray"
                  fill
                  className="object-cover"
                />
              </div>
            </figure>
            <figure className="overflow-hidden rounded-xl shadow">
              <div className="relative aspect-[3/4] w-full">
                <Image
                  src={TABUNGCAVE}
                  alt="Derawan pier"
                  fill
                  className="object-cover"
                />
              </div>
            </figure>
            <figure className="overflow-hidden rounded-xl shadow">
              <div className="relative aspect-[3/4] w-full">
                <Image
                  src={TABUNGCAVE}
                  alt="Hidden island cave"
                  fill
                  className="object-cover"
                />
              </div>
            </figure>
          </div>

          {/* Title under collage */}
          <h3 className="mt-8 text-center text-xl font-semibold text-neutral-900">
            Island Hop Collage
          </h3>
        </div>
      </div>
    </section>
  );
}
