"use client";

function Bone({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-full bg-[#f0f0f0] ${className}`} />;
}

function BoneRect({ className }: { className: string }) {
  return <div className={`animate-pulse bg-[#f0f0f0] ${className}`} />;
}

export default function DashboardSkeleton() {
  return (
    <main className="h-dvh overflow-hidden bg-white">
      <div className="mx-auto flex h-full max-w-155 flex-col bg-white shadow-[0_0_0_1px_rgba(15,23,42,0.04)]">
        {/* Session header skeleton ~76px */}
        <header className="flex shrink-0 items-center justify-between px-4 pb-3 pt-[47px]">
          <Bone className="h-10 w-10 rounded-full" />
          <Bone className="h-5 w-28" />
          <Bone className="h-9 w-9 rounded-full" />
        </header>

        {/* Top segment tabs skeleton ~44px */}
        <div className="flex shrink-0 gap-6 border-b border-[#f0f0f0] px-6">
          <Bone className="mb-3 h-4 w-14" />
          <Bone className="mb-3 h-4 w-20" />
        </div>

        {/* Content skeleton — live tab + order tab pill */}
        <section className="flex flex-1 flex-col gap-3 overflow-hidden px-4 pt-4">
          {/* Tab switcher pill */}
          <div className="flex gap-2 rounded-full bg-[#f6f6f6] p-1">
            <Bone className="h-10 flex-1 rounded-full" />
            <Bone className="h-10 flex-1 rounded-full" />
          </div>

          {/* Connect card */}
          <div className="rounded-3xl border border-[#f0f0f0] bg-white p-4 shadow-sm">
            <Bone className="mb-2 h-4 w-36" />
            <Bone className="mb-4 h-3 w-48" />
            <div className="flex gap-2">
              <Bone className="h-12 flex-1 rounded-2xl" />
              <Bone className="h-12 w-24 rounded-2xl" />
            </div>
          </div>
        </section>

        {/* Bottom nav skeleton ~80px */}
        <footer className="flex shrink-0 border-t border-[#f0f0f0] px-4 pb-4 pt-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1.5 pt-1">
              <BoneRect className="h-6 w-6 rounded-md" />
              <Bone className="h-2.5 w-8" />
            </div>
          ))}
        </footer>
      </div>
    </main>
  );
}
