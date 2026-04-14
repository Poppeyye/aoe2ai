export default function TechTreeLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="relative mb-6">
        <div className="h-11 w-full rounded-lg bg-aoe-card border border-aoe-border pl-10 animate-pulse" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-1.5">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="h-10 rounded-lg border border-aoe-border bg-aoe-card animate-pulse"
            />
          ))}
        </div>
        <div className="lg:col-span-3 space-y-6">
          <div className="card space-y-4">
            <div className="h-8 w-48 max-w-full rounded bg-aoe-dark/50 animate-pulse" />
            <div className="flex flex-wrap gap-3">
              <div className="h-8 w-32 rounded-lg bg-aoe-dark/40 animate-pulse" />
              <div className="h-8 w-32 rounded-lg bg-aoe-dark/40 animate-pulse" />
              <div className="h-8 w-36 rounded-lg bg-aoe-dark/40 animate-pulse" />
            </div>
          </div>
          <div className="flex gap-1 bg-aoe-card rounded-lg p-1 border border-aoe-border">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex-1 h-9 rounded-md bg-aoe-dark/50 animate-pulse" />
            ))}
          </div>
          <div className="card space-y-3">
            <div className="h-5 w-40 rounded bg-aoe-dark/50 animate-pulse" />
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-4 w-full rounded bg-aoe-dark/40 animate-pulse" />
            ))}
          </div>
          <div className="card">
            <div className="h-5 w-36 rounded bg-aoe-dark/50 animate-pulse mb-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="h-24 rounded-lg bg-aoe-dark/40 animate-pulse" />
              <div className="h-24 rounded-lg bg-aoe-dark/40 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
