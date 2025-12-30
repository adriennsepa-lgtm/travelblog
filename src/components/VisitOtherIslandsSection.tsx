// app/components/VisitOtherIslandsSection.tsx
import Image from "next/image";
const KAKABAN = "/images/kakaban.webp";
const SANGALAKI_TURTLE = "/images/sangalaki_baby_turtle.webp";
const SANGALAKI_BEACH_02 = "/images/sangalaki_beach02.webp";
const SANGALAKI_REEF = "/images/reef.webp";
const MONITOR_LIZARD = "/images/monitor_lizard.webp";


export default function VisitOtherIslandsSection() {
  return (
    <section className="w-full">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-start gap-12 px-6 py-20 md:grid-cols-2">
        {/* LEFT: text (1/2) */}
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-neutral-900">
            Visit Other Islands
          </h2>
          <p className="mt-4 text-neutral-700">
            Around Maratua, there are a number of other islands to visit. We visited Kakaban and Sangalaki.
            <strong> Kakaban</strong> is known for its large jellyfish lake with millions of stringless jellyfish. Snorkeling here was
            just an unforgettable experience.
            <br />
            <strong> Sangalaki</strong> is home to baby turtles and manta rays. We did not see manta rays during snorkeling but we did see
            baby turtles. The conservation center does an incredible work of protecting the turtles and helping with hatching.The island has beautiful white sand beaches and
            coral reefs. There are bungalows on the island where you can stay.
          </p>
          <p className="mt-4 text-neutral-700">
            Short boat rides, big payoffs. Plan a day trip or build a mini-loop.
          </p>

        </div>

        {/* RIGHT: collage (2 horizontals + 3 verticals) */}
        <div>
          {/* Row 1: two horizontals */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <figure className="overflow-hidden shadow">
              <div className="relative aspect-[16/12] w-full">
                <Image
                  src={KAKABAN}
                  alt="Island lagoon"
                  fill
                  className="object-cover"
                />
              </div>
            </figure>
            <figure className="overflow-hidden shadow">
              <div className="relative aspect-[16/12] w-full">
                <Image
                  src={SANGALAKI_REEF}
                  alt="Kakaban jellyfish lake"
                  fill
                  className="object-cover"
                />
              </div>
            </figure>
          </div>

          {/* Row 2: three verticals */}
          <div className="grid grid-cols-3 gap-4">
            <figure className="overflow-hidden shadow">
              <div className="relative aspect-[3/4] w-full">
                <Image
                  src={SANGALAKI_TURTLE}
                  alt="Sangalaki manta ray"
                  fill
                  className="object-cover"
                />
              </div>
            </figure>
            <figure className="overflow-hidden shadow">
              <div className="relative aspect-[3/4] w-full">
                <Image
                  src={MONITOR_LIZARD}
                  alt="Derawan pier"
                  fill
                  className="object-cover"
                />
              </div>
            </figure>
            <figure className="overflow-hidden shadow">
              <div className="relative aspect-[3/4] w-full">
                <Image
                  src={SANGALAKI_BEACH_02}
                  alt="Hidden island cave"
                  fill
                  className="object-cover"
                />
              </div>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
