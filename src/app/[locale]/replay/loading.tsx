export default function ReplayLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8 space-y-3">
        <div className="h-8 w-56 rounded bg-aoe-dark/50 animate-pulse mx-auto" />
        <div className="h-4 w-80 max-w-full rounded bg-aoe-dark/40 animate-pulse mx-auto" />
      </div>
      <div className="card flex flex-col items-center justify-center py-16">
        <div className="h-16 w-16 rounded-full bg-aoe-dark/50 animate-pulse mb-4" />
        <div className="h-4 w-64 rounded bg-aoe-dark/40 animate-pulse" />
      </div>
    </div>
  );
}
