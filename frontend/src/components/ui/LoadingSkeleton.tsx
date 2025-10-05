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
  const baseClasses = 'animate-pulse bg-gray-200 rounded';
  
  const variantClasses = {
    text: 'h-4 bg-gray-200 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    card: 'rounded-xl p-4 space-y-3'
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
              ...(i === lines - 1 && { width: '75%' }) // Last line is shorter
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-300 rounded w-1/2 mb-2"></div>
        <div className="h-3 bg-gray-300 rounded w-2/3"></div>
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={{ 
        width: width || '100%', 
        height: height || '20px' 
      }}
    />
  );
}

// Predefined skeleton components for common use cases
export function EventCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-4 shadow-lg animate-pulse">
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
          <div className="h-3 bg-gray-300 rounded w-2/3"></div>
        </div>
      </div>
    </div>
  );
}

export function MapLoadingSkeleton() {
  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="text-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 rounded-full animate-pulse"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <div className="mt-6 space-y-3">
          <div className="h-6 bg-gray-300 rounded w-64 mx-auto"></div>
          <div className="h-4 bg-gray-300 rounded w-48 mx-auto"></div>
        </div>
      </div>
    </div>
  );
}

export function ButtonSkeleton() {
  return (
    <div className="h-10 bg-gray-300 rounded-lg animate-pulse w-24"></div>
  );
}

export function AvatarSkeleton() {
  return (
    <div className="w-10 h-10 bg-gray-300 rounded-full animate-pulse"></div>
  );
}
