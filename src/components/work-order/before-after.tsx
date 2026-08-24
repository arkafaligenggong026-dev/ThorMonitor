import Image from "next/image";

export function BeforeAfter({
  before,
  after,
}: {
  before: string;
  after: string | null;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Sebelum
        </p>
        <div className="relative aspect-square overflow-hidden rounded-lg bg-slate-100">
          <Image src={before} alt="Kondisi sebelum" fill className="object-cover" sizes="50vw" />
        </div>
      </div>
      <div>
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Sesudah
        </p>
        <div className="relative aspect-square overflow-hidden rounded-lg bg-slate-100">
          {after ? (
            <Image src={after} alt="Kondisi sesudah" fill className="object-cover" sizes="50vw" />
          ) : (
            <div className="flex h-full items-center justify-center text-center text-xs text-slate-400">
              Belum ada foto
              <br />
              hasil kerja
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
