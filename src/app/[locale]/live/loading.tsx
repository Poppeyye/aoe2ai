export default function LiveLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="relative mb-8 max-w-2xl mx-auto">
        <div className="h-12 w-full rounded-lg bg-aoe-card border border-aoe-border animate-pulse" />
      </div>

      <div className="card mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1 min-w-0 space-y-3">
            <div className="h-8 w-48 max-w-full rounded bg-aoe-dark/50 animate-pulse" />
            <div className="flex flex-wrap gap-2">
              <div className="h-4 w-24 rounded bg-aoe-dark/40 animate-pulse" />
              <div className="h-4 w-20 rounded bg-aoe-dark/40 animate-pulse" />
              <div className="h-4 w-28 rounded bg-aoe-dark/40 animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-6 md:gap-8 shrink-0">
            <div className="space-y-2 text-center">
              <div className="h-10 w-16 rounded bg-aoe-dark/50 animate-pulse mx-auto" />
              <div className="h-3 w-10 rounded bg-aoe-dark/40 animate-pulse mx-auto" />
            </div>
            <div className="w-px h-12 bg-aoe-border hidden md:block" />
            <div className="space-y-2 text-center">
              <div className="h-6 w-20 rounded bg-aoe-dark/50 animate-pulse mx-auto" />
              <div className="h-3 w-16 rounded bg-aoe-dark/40 animate-pulse mx-auto" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card space-y-4">
          <div className="h-5 w-40 rounded bg-aoe-dark/50 animate-pulse" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between gap-2">
                <div className="h-4 w-28 rounded bg-aoe-dark/40 animate-pulse" />
                <div className="h-4 w-16 rounded bg-aoe-dark/40 animate-pulse" />
              </div>
              <div className="h-2.5 rounded-full bg-aoe-dark overflow-hidden">
                <div className="h-full w-2/3 rounded-full bg-aoe-accent/20 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
        <div className="card space-y-4">
          <div className="h-5 w-36 rounded bg-aoe-dark/50 animate-pulse" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between gap-2">
                <div className="h-4 w-32 rounded bg-aoe-dark/40 animate-pulse" />
                <div className="h-4 w-14 rounded bg-aoe-dark/40 animate-pulse" />
              </div>
              <div className="h-2.5 rounded-full bg-aoe-dark overflow-hidden">
                <div className="h-full w-1/2 rounded-full bg-aoe-accent/20 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
