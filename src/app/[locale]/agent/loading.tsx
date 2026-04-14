export default function AgentLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col h-[calc(100vh-8rem)]">
      <div className="text-center mb-8 space-y-3">
        <div className="h-8 w-64 rounded bg-aoe-dark/50 animate-pulse mx-auto" />
        <div className="h-4 w-96 max-w-full rounded bg-aoe-dark/40 animate-pulse mx-auto" />
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-wrap justify-center gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 w-48 rounded-xl bg-aoe-card border border-aoe-border animate-pulse" />
          ))}
        </div>
      </div>
      <div className="h-12 w-full rounded-lg bg-aoe-card border border-aoe-border animate-pulse" />
    </div>
  );
}
