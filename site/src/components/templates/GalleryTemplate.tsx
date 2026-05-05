import { getAllGalleryPhotos } from "@/lib/gallery";
import { GalleryGrid } from "./_helpers/GalleryGrid";

export async function GalleryTemplate(_props: { pageKey?: string } = {}) {
  const photos = await getAllGalleryPhotos();

  return (
    <>
      {/* HERO */}
      <section className="-mx-4 bg-ydm-cream py-16 sm:-mx-6 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          <p className="m-0 mb-3 font-accent text-sm uppercase tracking-[0.3em] text-ydm-gold">
            MOMENTS WITH OUR FAMILY
          </p>
          <p className="m-0 mb-4 font-script text-4xl text-ydm-amber sm:text-5xl">
            Worship in motion
          </p>
          <h1 className="m-0 mb-6 font-display text-5xl uppercase leading-none text-ydm-ink sm:text-7xl">
            Photo Gallery
          </h1>
          <p className="m-0 font-serif text-lg leading-relaxed text-ydm-text">
            Glimpses of YDM gatherings, outreach, and the everyday faithfulness of our church family.
          </p>
        </div>
      </section>

      {/* GRID */}
      <section className="bg-ydm-surface py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
          {photos.length === 0 ? (
            <p className="m-0 text-center font-serif text-lg text-ydm-muted">
              No photos in the gallery yet — check back soon.
            </p>
          ) : (
            <GalleryGrid photos={photos} />
          )}
        </div>
      </section>
    </>
  );
}
