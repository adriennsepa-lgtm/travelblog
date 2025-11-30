// app/components/VisitBeachesSection.tsx
import Image from "next/image";

const DIVING = "/images/diving_spots.png";


// VisitBeachesSection: A section with a collage of images and text encouraging users to visit the blog

const  DivingSnorkelingSection = ()  => {
  return (
    <section className="w-full bg-[#f7f7f7]">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-start gap-12 px-6 py-20 md:grid-cols-2">
        {/* LEFT: text (1/3) */}
        <div className="md:col-span-1">
          <h2 className="text-3xl font-semibold tracking-tight text-neutral-900">
            Diving & Snorkeling Spots
          </h2>
          <p className="mt-3 mb-6 max-w-prose text-neutral-700">
            <p>Current can be strong, so be cautious.</p>
            <strong>Maratua Guesthouse area:</strong>
            We found this spot the most enjoyable for diving and snorkeling.
             There is a wall that drops off to about 30 meters, teeming with 
             vibrant coral and diverse marine life. The area is known for frequent 
             turtle sightings, and if you're lucky, you might even spot a reef shark 
             or barracuda. Easily accessible from the shore.
          </p>

          <p className="mt-3 mb-6 max-w-prose text-neutral-700">
            <strong>Chanel</strong>: It is the most challanging spot due to strong currents, only for experienced divers. 
            
          </p>
          <p>
            <strong>Turtle point:</strong> Mild currents and shallow waters make this spot ideal snorkeling and divng. 
          </p>
        </div>

        <div className="relative w-[520px] h-[390px]">
          <div className="flex gap-x-7">
            <div className="flex flex-col gap-y-1">
              <div>
                <Image
                  src={DIVING}
                  alt="Diver"
                  className="w-[210px] h-[150px] object-cover shadow rounded-[2px]"
                  fill
                  sizes="(max-width: 520px) 100vw, 520px"
                />
              </div>
            
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
export default DivingSnorkelingSection;