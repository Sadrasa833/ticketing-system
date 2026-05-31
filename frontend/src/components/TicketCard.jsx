import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';

export default function TicketCard({ ticket }) {
  return (
    <Link to={`/tickets/${ticket.id}`}>
      <div className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md hover:border-indigo-200 transition cursor-pointer">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-400 font-mono">#{ticket.id}</span>
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
            <h3 className="font-semibold text-gray-800 truncate">{ticket.title}</h3>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{ticket.description}</p>
          </div>
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-indigo-600">
                {ticket.created_by?.username?.[0]?.toUpperCase()}
              </span>
            </div>
            <span className="text-xs text-gray-500">{ticket.created_by?.username}</span>
          </div>
          <span className="text-xs text-gray-400">
            {new Date(ticket.created_at).toLocaleDateString('fa-IR')}
          </span>
        </div>
      </div>
    </Link>
  );
}
