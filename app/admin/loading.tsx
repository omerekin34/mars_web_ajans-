export default function AdminLoading() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Sayfa yükleniyor">
      <div className="h-3 w-28 animate-pulse rounded bg-emerald-500/20" />
      <div className="h-9 w-64 max-w-full animate-pulse rounded-lg bg-slate-800" />
      <div className="h-4 w-96 max-w-full animate-pulse rounded bg-slate-800/70" />
      <div className="h-72 animate-pulse rounded-2xl border border-white/10 bg-slate-900/50" />
    </div>
  );
}
