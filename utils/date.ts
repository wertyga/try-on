// простой helper: "Resets in 5h 12m"
export function formatTimeLeft(resetsAt: string | null) {
  if (!resetsAt) return null;

  const end = new Date(resetsAt).getTime();
  const now = Date.now();
  const diff = end - now;

  if (Number.isNaN(end) || diff <= 0) return 'Resets soon';

  const totalMin = Math.floor(diff / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;

  if (h <= 0) return `Resets in ${m}m`;
  return `Resets in ${h}h ${m}m`;
}
