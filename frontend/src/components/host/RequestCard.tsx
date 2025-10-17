'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';

interface RequestCardProps {
  request: any;
  onApprove: (id: string) => void;
  onReject: (id: string, reason?: string) => void;
}

export default function RequestCard({ request, onApprove, onReject }: RequestCardProps) {
  const [showPhoto, setShowPhoto] = useState(false);

  const user = request.userId;
  const timeSince = getTimeSince(request.requestedAt);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* User Avatar */}
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.email)}&background=ff6b9d&color=fff`} />
            <AvatarFallback className="bg-orange-500 text-white">
              {(user.name || user.email || 'U').charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* User Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                {user.name || user.email || 'Unknown User'}
              </h3>
              {user.points > 100 && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  ⭐ {user.points} pts
                </Badge>
              )}
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              📧 {user.email}
            </p>

            <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
              <span>🕐 {timeSince}</span>
              {user.eventsAttended && (
                <span>🎉 {user.eventsAttended} events attended</span>
              )}
            </div>

            {request.requestMessage && (
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mb-3">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  💬 "{request.requestMessage}"
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 flex-wrap">
              {request.puddingPhotoUrl && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowPhoto(!showPhoto)}
                  className="flex items-center gap-1"
                >
                  {showPhoto ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showPhoto ? 'Hide Photo' : 'View Photo'}
                </Button>
              )}

              <Button
                size="sm"
                variant="default"
                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1"
                onClick={() => onApprove(request._id)}
              >
                <CheckCircle className="w-4 h-4" />
                Approve
              </Button>

              <Button
                size="sm"
                variant="destructive"
                className="flex items-center gap-1"
                onClick={() => {
                  const reason = prompt('Reason for rejection (optional):');
                  onReject(request._id, reason || undefined);
                }}
              >
                <XCircle className="w-4 h-4" />
                Reject
              </Button>
            </div>

            {/* Photo Preview */}
            {showPhoto && request.puddingPhotoUrl && (
              <div className="mt-4">
                <img
                  src={request.puddingPhotoUrl}
                  alt="Pudding photo"
                  className="max-w-sm rounded-lg border shadow-sm"
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getTimeSince(date: string): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  if (diffHours < 1) return 'Just now';
  if (diffHours === 1) return '1 hour ago';
  if (diffHours < 24) return `${diffHours} hours ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return '1 day ago';
  return `${diffDays} days ago`;
}
