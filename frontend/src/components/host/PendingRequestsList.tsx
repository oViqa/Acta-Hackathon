'use client';

import RequestCard from './RequestCard';

interface PendingRequestsListProps {
  requests: any[];
  onApprove: (id: string) => void;
  onReject: (id: string, reason?: string) => void;
}

export default function PendingRequestsList({
  requests,
  onApprove,
  onReject
}: PendingRequestsListProps) {
  if (requests.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <div className="text-4xl mb-4">🍮</div>
        <p className="text-lg">No pending requests</p>
        <p className="text-sm">People will appear here when they request to join your event.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <RequestCard
          key={request._id}
          request={request}
          onApprove={onApprove}
          onReject={onReject}
        />
      ))}
    </div>
  );
}
