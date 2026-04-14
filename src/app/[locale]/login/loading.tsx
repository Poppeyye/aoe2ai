export default function LoginLoading() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="card max-w-md w-full space-y-6">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-aoe-dark/50 animate-pulse" />
          <div className="h-6 w-48 rounded bg-aoe-dark/50 animate-pulse" />
          <div className="h-4 w-64 rounded bg-aoe-dark/40 animate-pulse" />
        </div>
        <div className="space-y-3">
          <div className="h-12 w-full rounded-lg bg-aoe-dark/50 animate-pulse" />
          <div className="h-12 w-full rounded-lg bg-aoe-dark/50 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
