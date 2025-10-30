import React from 'react';

// Base skeleton component with shimmer animation
export const Skeleton: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ 
  className = '', 
  style 
}) => (
  <div 
    className={`skeleton-base ${className}`} 
    style={style}
  />
);

// Text skeleton with configurable width
export const SkeletonText: React.FC<{ 
  width?: string | number; 
  height?: string | number;
  className?: string; 
}> = ({ 
  width = '100%', 
  height = '0.875rem',
  className = '' 
}) => (
  <div 
    className={`skeleton-text ${className}`}
    style={{ width, height }}
  />
);

// Avatar skeleton (circular)
export const SkeletonAvatar: React.FC<{ 
  size?: number; 
  className?: string; 
}> = ({ 
  size = 36, 
  className = '' 
}) => (
  <div 
    className={`skeleton-circle ${className}`}
    style={{ width: size, height: size }}
  />
);

// Card skeleton for project cards
export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`skeleton-card ${className}`}>
    <div className="skeleton-image"></div>
    <div className="skeleton-content">
      <div className="flex items-start gap-3 mb-3">
        <SkeletonAvatar size={36} />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <SkeletonText width="60%" height="1rem" />
            <div className="skeleton-badge"></div>
          </div>
          <SkeletonText width="40%" height="0.75rem" />
        </div>
      </div>
    </div>
  </div>
);

// Hero card skeleton for larger featured cards
export const SkeletonHeroCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`skeleton-hero-card ${className}`}>
    <div className="skeleton-hero-content">
      <div className="skeleton-hero-badge"></div>
      <div className="skeleton-hero-title"></div>
      <div className="skeleton-hero-description"></div>
    </div>
    <div className="skeleton-hero-image"></div>
  </div>
);

// Chart skeleton for analytics
export const SkeletonChart: React.FC<{ 
  height?: number; 
  className?: string; 
}> = ({ 
  height = 200, 
  className = '' 
}) => (
  <div 
    className={`skeleton-chart ${className}`}
    style={{ height }}
  >
    <div className="skeleton-chart-bars">
      {Array.from({ length: 7 }).map((_, i) => (
        <div 
          key={i}
          className="skeleton-chart-bar"
          style={{ height: `${Math.random() * 80 + 20}%` }}
        />
      ))}
    </div>
  </div>
);

// Table skeleton
export const SkeletonTable: React.FC<{ 
  rows?: number; 
  columns?: number; 
  className?: string; 
}> = ({ 
  rows = 5, 
  columns = 4, 
  className = '' 
}) => (
  <div className={`skeleton-table ${className}`}>
    <div className="skeleton-table-header">
      {Array.from({ length: columns }).map((_, i) => (
        <SkeletonText key={i} height="1rem" />
      ))}
    </div>
    <div className="skeleton-table-body">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="skeleton-table-row">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <SkeletonText key={colIndex} height="0.875rem" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

// Form skeleton
export const SkeletonForm: React.FC<{ 
  fields?: number; 
  className?: string; 
}> = ({ 
  fields = 4, 
  className = '' 
}) => (
  <div className={`skeleton-form ${className}`}>
    {Array.from({ length: fields }).map((_, i) => (
      <div key={i} className="skeleton-form-field">
        <SkeletonText width="30%" height="0.875rem" className="mb-2" />
        <div className="skeleton-form-input"></div>
      </div>
    ))}
  </div>
);

// Stats card skeleton
export const SkeletonStatsCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`skeleton-stats-card ${className}`}>
    <div className="skeleton-stats-icon"></div>
    <div className="skeleton-stats-content">
      <SkeletonText width="60%" height="1.5rem" className="mb-1" />
      <SkeletonText width="40%" height="0.75rem" />
    </div>
  </div>
);