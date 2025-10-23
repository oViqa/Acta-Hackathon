'use client';

import React from 'react';
import { MapPin, Calendar, Users, Flame, Moon } from 'lucide-react';

interface WelcomePageProps {
  onSignIn: () => void;
  onSkipToDemo: () => void;
}

export default function WelcomePage({ onSignIn, onSkipToDemo }: WelcomePageProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-0 sm:p-4 animate-in fade-in duration-300">
      {/* Welcome Modal - Smaller overlay */}
      <div className="max-w-lg w-full h-full sm:h-auto animate-in zoom-in-95 slide-in-from-bottom-4 duration-500 delay-150">
        <div className="bg-white dark:bg-gray-800 rounded-none sm:rounded-2xl shadow-2xl overflow-hidden overflow-y-auto h-full sm:h-auto animate-in slide-in-from-bottom-2 duration-700 delay-300">
          {/* Header with Orange Gradient */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 sm:px-6 py-6 sm:py-8 text-center relative">
            {/* Decorative Stars */}
            <div className="absolute top-2 right-4 text-white/30 animate-in fade-in duration-1000 delay-500">
              <div className="text-lg animate-pulse">✨</div>
            </div>
            <div className="absolute top-4 right-2 text-white/20 animate-in fade-in duration-1000 delay-700">
              <div className="text-sm animate-bounce">⭐</div>
            </div>
            
            {/* Pudding Icon */}
            <div className="text-3xl sm:text-4xl mb-2 sm:mb-3 animate-in zoom-in-50 duration-800 delay-400">🍮</div>
            
            {/* Welcome Text */}
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-1 animate-in slide-in-from-top-2 duration-600 delay-600">Willkommen!</h1>
            <p className="text-xs sm:text-sm text-orange-100 animate-in slide-in-from-top-2 duration-600 delay-800">Welcome to Pudding mit Gabel</p>
          </div>

          {/* Body Content */}
          <div className="px-4 sm:px-6 py-4 sm:py-6">
            {/* Main Message */}
            <div className="flex items-center gap-2 mb-3 sm:mb-4 animate-in slide-in-from-left-2 duration-600 delay-1000">
              <div className="text-base sm:text-lg animate-spin">⭐</div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">weil ich will!</h2>
            </div>

            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 leading-relaxed animate-in slide-in-from-left-2 duration-600 delay-1200">
              Discover and create pudding meetups across Germany. Connect with fellow pudding enthusiasts, 
              share your favorite desserts, and make new friends!
            </p>

            {/* Features */}
            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
              <div className="flex items-center gap-2 animate-in slide-in-from-left-2 duration-500 delay-1400">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Find events on interactive map</span>
              </div>
              <div className="flex items-center gap-2 animate-in slide-in-from-left-2 duration-500 delay-1600">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Create your own pudding meetups</span>
              </div>
              <div className="flex items-center gap-2 animate-in slide-in-from-left-2 duration-500 delay-1800">
                <Users className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Join community of pudding lovers</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 sm:space-y-3">
              <button
                onClick={onSignIn}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 sm:py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl text-xs sm:text-sm animate-in slide-in-from-bottom-2 duration-600 delay-2000 hover:scale-105 active:scale-95"
              >
                Sign in to create events
              </button>
              
              <button
                onClick={onSkipToDemo}
                className="w-full bg-white dark:bg-gray-700 border-2 border-orange-500 text-orange-500 dark:text-orange-400 font-semibold py-2.5 sm:py-3 px-4 rounded-xl transition-all duration-300 hover:bg-orange-50 dark:hover:bg-gray-600 text-xs sm:text-sm animate-in slide-in-from-bottom-2 duration-600 delay-2200 hover:scale-105 active:scale-95"
              >
                Sign in later
              </button>
            </div>
          </div>

          {/* Footer Features */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 animate-in slide-in-from-bottom-2 duration-500 delay-2400">
            <div className="flex justify-center gap-4 sm:gap-6 text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
              {/* {/* <div className="flex items-center gap-1">
                <Flame className="w-3 h-3 text-red-500" />
                <span>HOT events</span> */}
              {/* </div> */}
              <div className="flex items-center gap-1 animate-in fade-in duration-500 delay-2600">
                <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-500" />
                <span>Location-based</span>
              </div>
              <div className="flex items-center gap-1 animate-in fade-in duration-500 delay-2800">
                <Moon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-purple-500" />
                <span>Dark mode</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
