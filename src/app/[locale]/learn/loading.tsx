export default function LearnLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="text-center mb-10 space-y-3">
        <div className="h-10 w-64 max-w-full rounded-lg bg-aoe-dark/50 animate-pulse mx-auto" />
        <div className="h-4 w-full max-w-xl rounded bg-aoe-dark/40 animate-pulse mx-auto" />
        <div className="h-4 w-3/4 max-w-lg rounded bg-aoe-dark/30 animate-pulse mx-auto" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="card text-left space-y-4 border border-aoe-border"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="h-6 flex-1 rounded bg-aoe-dark/50 animate-pulse" />
              <div className="h-6 w-20 shrink-0 rounded-full bg-aoe-dark/40 animate-pulse" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              <div className="h-6 w-16 rounded-full bg-aoe-dark/40 animate-pulse" />
              <div className="h-6 w-20 rounded-full bg-aoe-dark/40 animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-20 rounded bg-aoe-dark/30 animate-pulse" />
              <div className="flex flex-wrap gap-1">
                <div className="h-5 w-14 rounded bg-aoe-accent/10 animate-pulse" />
                <div className="h-5 w-16 rounded bg-aoe-accent/10 animate-pulse" />
                <div className="h-5 w-12 rounded bg-aoe-accent/10 animate-pulse" />
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-aoe-border/50">
              <div className="h-3 w-24 rounded bg-aoe-dark/40 animate-pulse" />
              <div className="h-4 w-4 rounded bg-aoe-dark/40 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
