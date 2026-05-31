export default function PriorityBadge({ priority }) {
  const styles = {
    low: 'bg-green-100 text-green-700',
    medium: 'bg-orange-100 text-orange-700',
    high: 'bg-red-100 text-red-700',
  };
  const labels = { low: '🟢 کم', medium: '🟡 متوسط', high: '🔴 زیاد' };
  return (
    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${styles[priority]}`}>
      {labels[priority]}
    </span>
  );
}
