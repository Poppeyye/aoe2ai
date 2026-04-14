export default function TournamentsLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="text-center mb-8 space-y-3">
        <div className="h-8 w-40 rounded bg-aoe-dark/50 animate-pulse mx-auto" />
        <div className="h-4 w-96 max-w-full rounded bg-aoe-dark/40 animate-pulse mx-auto" />
      </div>
      <div className="flex gap-2 mb-6 justify-center">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-9 w-24 rounded-lg bg-aoe-card border border-aoe-border animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card space-y-3">
            <div className="h-5 w-48 rounded bg-aoe-dark/50 animate-pulse" />
            <div className="h-4 w-32 rounded bg-aoe-dark/40 animate-pulse" />
            <div className="h-4 w-24 rounded bg-aoe-dark/40 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
