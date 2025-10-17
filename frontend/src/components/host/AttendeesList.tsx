'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';

interface AttendeesListProps {
  attendees: any[];
  onRemove: (id: string) => void;
}

export default function AttendeesList({ attendees, onRemove }: AttendeesListProps) {
  if (attendees.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <div className="text-4xl mb-4">👥</div>
        <p className="text-lg">No attendees yet</p>
        <p className="text-sm">Approved attendees will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {attendees.map((attendance) => {
        const user = attendance.userId;
        return (
          <Card key={attendance._id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.email)}&background=ff6b9d&color=fff`} />
                    <AvatarFallback className="bg-orange-500 text-white">
                      {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {user.name || user.email || 'Unknown User'}
                      </p>
                      {user.points > 100 && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                          ⭐ {user.points}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                    {attendance.respondedAt && (
                      <p className="text-xs text-gray-400">
                        Joined {new Date(attendance.respondedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                  onClick={() => {
                    if (confirm(`Remove ${user.name || user.email} from the event?`)) {
                      onRemove(attendance._id);
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
