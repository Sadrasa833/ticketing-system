export default function StatusBadge({ status }) {
  const styles = {
    open: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-yellow-100 text-yellow-700',
    resolved: 'bg-green-100 text-green-700',
    closed: 'bg-gray-100 text-gray-600',
  };
  const labels = {
    open: 'باز',
    in_progress: 'در حال بررسی',
    resolved: 'حل شده',
    closed: 'بسته',
  };
  return (
    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
