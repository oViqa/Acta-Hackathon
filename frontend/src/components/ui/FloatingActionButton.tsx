'use client';

import { Plus } from 'lucide-react';

interface FloatingActionButtonProps {
  onClick: () => void;
}

export default function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 z-40 flex items-center justify-center group"
      title="Create Event"
    >
      <Plus className="w-6 h-6 transition-transform group-hover:rotate-90" />
      
      {/* Pulse animation */}
      <div className="absolute inset-0 bg-orange-500 rounded-full animate-ping opacity-20"></div>
    </button>
  );
}
