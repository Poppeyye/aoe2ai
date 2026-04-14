export default function PlayersLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <div className="h-11 w-full rounded-lg bg-aoe-card border border-aoe-border animate-pulse" />
        </div>
        <div className="h-11 w-24 rounded-lg bg-aoe-accent/20 animate-pulse shrink-0" />
      </div>

      <div className="flex gap-1 mb-6 bg-aoe-card rounded-lg p-1 border border-aoe-border">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex-1 h-10 rounded-md bg-aoe-dark/50 animate-pulse"
          />
        ))}
      </div>

      <div className="bg-aoe-card border border-aoe-border rounded-xl overflow-hidden">
        <div className="grid grid-cols-[60px_1fr_100px_120px] gap-2 px-4 py-3 border-b border-aoe-border">
          <div className="h-3 w-10 rounded bg-aoe-dark/50 animate-pulse" />
          <div className="h-3 w-16 rounded bg-aoe-dark/50 animate-pulse" />
          <div className="h-3 w-12 rounded bg-aoe-dark/50 animate-pulse justify-self-end" />
          <div className="h-3 w-14 rounded bg-aoe-dark/50 animate-pulse justify-self-end" />
        </div>
        {Array.from({ length: 8 }).map((_, idx) => (
          <div
            key={idx}
            className={`grid grid-cols-[60px_1fr_100px_120px] gap-2 px-4 py-3 items-center border-b border-aoe-border/30 last:border-0 ${
              idx % 2 === 1 ? "bg-aoe-dark/30" : ""
            }`}
          >
            <div className="h-8 w-8 rounded-full bg-aoe-dark/50 animate-pulse mx-auto" />
            <div className="space-y-2 min-w-0">
              <div className="h-4 w-3/5 max-w-[200px] rounded bg-aoe-dark/50 animate-pulse" />
              <div className="h-3 w-20 rounded bg-aoe-dark/40 animate-pulse" />
            </div>
            <div className="h-6 w-12 rounded bg-aoe-dark/50 animate-pulse justify-self-end" />
            <div className="space-y-1 justify-self-end">
              <div className="h-4 w-16 rounded bg-aoe-dark/50 animate-pulse ml-auto" />
              <div className="h-3 w-10 rounded bg-aoe-dark/40 animate-pulse ml-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
