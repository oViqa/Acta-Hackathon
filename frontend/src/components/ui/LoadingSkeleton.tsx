'use client';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export default function LoadingSkeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
  lines = 1
}: LoadingSkeletonProps) {
  const baseClasses = 'relative overflow-hidden bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded';
  
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    card: 'rounded-xl p-4 space-y-3'
  };

  // Shimmer effect
  const shimmerStyle = {
    backgroundSize: '200% 100%',
    animation: 'shimmer 2s infinite ease-in-out'
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`${baseClasses} ${variantClasses[variant]}`}
            style={{
              width: width || '100%',
              height: height || '16px',
              ...(i === lines - 1 && { width: '75%' }),
              ...shimmerStyle
            }}
          />
        ))}
        <style jsx>{`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}</style>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} style={shimmerStyle}>
        <div className="h-4 bg-gray-300/30 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-300/30 rounded w-1/2 mb-2"></div>
        <div className="h-3 bg-gray-300/30 rounded w-2/3"></div>
        <style jsx>{`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={{
        width: width || '100%',
        height: height || '20px',
        ...shimmerStyle
      }}
    >
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}

// Predefined skeleton components with pudding theme
export function EventCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-4 shadow-lg relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-50 to-transparent animate-shimmer-fast"></div>
      <div className="flex items-start space-x-4 relative z-10">
        <div className="w-12 h-12 bg-gradient-to-br from-orange-200 to-yellow-200 rounded-full animate-pulse">
          <div className="w-full h-full flex items-center justify-center text-2xl">🍮</div>
        </div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gradient-to-r from-orange-100 to-yellow-100 rounded w-3/4 animate-pulse"></div>
          <div className="h-3 bg-gradient-to-r from-orange-100 to-yellow-100 rounded w-1/2 animate-pulse delay-75"></div>
          <div className="h-3 bg-gradient-to-r from-orange-100 to-yellow-100 rounded w-2/3 animate-pulse delay-150"></div>
        </div>
      </div>
      <style jsx>{`
        @keyframes shimmer-fast {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer-fast {
          animation: shimmer-fast 2s infinite;
        }
        .delay-75 {
          animation-delay: 75ms;
        }
        .delay-150 {
          animation-delay: 150ms;
        }
      `}</style>
    </div>
  );
}

export function MapLoadingSkeleton() {
  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-yellow-50">
      <div className="text-center">
        <div className="relative mb-8">
          {/* Animated pudding cup */}
          <div className="relative w-32 h-32 mx-auto">
            {/* Pudding cup body */}
            <div className="absolute inset-x-4 bottom-0 h-24 bg-gradient-to-b from-amber-400 to-orange-500 rounded-b-3xl animate-pulse">
              {/* Pudding surface */}
              <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-300 rounded-t-lg animate-shimmer"></div>
              {/* Wobble effect */}
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-orange-400/30 rounded-full animate-wobble"></div>
            </div>
            
            {/* Spoon */}
            <div className="absolute top-0 right-4 w-8 h-20 animate-spoon">
              <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
              <div className="w-1.5 h-16 bg-gray-300 mx-auto rounded-full"></div>
            </div>
            
            {/* Floating pudding emoji */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-4xl animate-float">
              🍮
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="h-6 bg-gradient-to-r from-orange-200 via-yellow-200 to-orange-200 rounded-full w-64 mx-auto animate-pulse bg-[length:200%_100%] animate-shimmer"></div>
          <div className="h-4 bg-gradient-to-r from-orange-200 via-yellow-200 to-orange-200 rounded-full w-48 mx-auto animate-pulse bg-[length:200%_100%] animate-shimmer delay-300"></div>
        </div>
        
        {/* Loading text */}
        <div className="mt-6 text-orange-600 font-medium animate-pulse">
          Preparing your pudding experience...
        </div>
      </div>
      
      <style jsx>{`
        @keyframes wobble {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-4px) scale(1.05); }
        }
        @keyframes spoon {
          0%, 100% { transform: rotate(-10deg); }
          50% { transform: rotate(10deg); }
        }
        @keyframes float {
          0%, 100% { transform: translate(-50%, 0px); }
          50% { transform: translate(-50%, -10px); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-wobble {
          animation: wobble 2s infinite ease-in-out;
        }
        .animate-spoon {
          animation: spoon 1.5s infinite ease-in-out;
        }
        .animate-float {
          animation: float 2s infinite ease-in-out;
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        .delay-300 {
          animation-delay: 300ms;
        }
      `}</style>
    </div>
  );
}

export function ButtonSkeleton() {
  return (
    <div className="relative h-10 bg-gradient-to-r from-orange-200 via-yellow-200 to-orange-200 rounded-lg overflow-hidden w-24">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer"></div>
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}

export function AvatarSkeleton() {
  return (
    <div className="relative w-10 h-10 bg-gradient-to-br from-orange-200 to-yellow-300 rounded-full overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center text-lg animate-pulse">
        🍮
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}

// Bonus: Pudding Loading Spinner
export function PuddingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };
  
  return (
    <div className={`${sizes[size]} relative animate-spin`}>
      <div className="absolute inset-0 text-4xl flex items-center justify-center">🍮</div>
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Demo component showing all skeletons
export function SkeletonDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Map Loading</h2>
          <div className="h-96 relative">
            <MapLoadingSkeleton />
          </div>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Event Cards</h2>
          <div className="grid gap-4">
            <EventCardSkeleton />
            <EventCardSkeleton />
          </div>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Text Skeletons</h2>
          <LoadingSkeleton variant="text" lines={3} />
        </div>
        
        <div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Buttons & Avatars</h2>
          <div className="flex gap-4 items-center">
            <ButtonSkeleton />
            <ButtonSkeleton />
            <AvatarSkeleton />
            <AvatarSkeleton />
          </div>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Pudding Spinner</h2>
          <div className="flex gap-8">
            <PuddingSpinner size="sm" />
            <PuddingSpinner size="md" />
            <PuddingSpinner size="lg" />
          </div>
        </div>
      </div>
    </div>
  );
}