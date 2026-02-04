import Image from "next/image";

export default function ListingGallery({ images }: { images: { url: string }[] }) {
  if (!images.length) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-200 text-slate-500">
        Sin imágenes
      </div>
    );
  }

  const [first, ...rest] = images;

  return (
    <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
      <div className="relative h-64 w-full overflow-hidden rounded-2xl bg-slate-100">
        <Image src={first.url} alt="Imagen principal" fill className="object-cover" />
      </div>
      <div className="grid gap-4">
        {rest.slice(0, 2).map((img) => (
          <div key={img.url} className="relative h-[120px] w-full overflow-hidden rounded-2xl bg-slate-100">
            <Image src={img.url} alt="Imagen secundaria" fill className="object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
}
