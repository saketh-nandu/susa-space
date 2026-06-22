import React from 'react';

interface SusaLogoProps {
  /** Size in pixels for the icon mark (the geometric logo). The text scales proportionally. */
  size?: number;
  /** Show just the icon mark without the "SUSA SPACE" text */
  iconOnly?: boolean;
  /** Override the icon color — defaults to the brand champagne/gold palette */
  className?: string;
}

/**
 * Official SUSA Space brand logo.
 * Recreated from the provided brand asset: a geometric champagne-gold circle + 
 * grey diamond/chevron mark paired with "SUSA SPACE" in spaced-tracking caps.
 */
export default function SusaLogo({ size = 40, iconOnly = false, className = '' }: SusaLogoProps) {
  const iconW = size;
  const iconH = size * 0.9;

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Geometric mark */}
      <svg
        width={iconW}
        height={iconH}
        viewBox="0 0 100 90"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="SUSA Space logo mark"
      >
        {/* Gold circle — top-left */}
        <circle cx="36" cy="22" r="18" fill="#D4AF72" />

        {/* Grey upper-right rectangle / bar */}
        <rect x="54" y="10" width="34" height="14" rx="3" fill="#9B9B9B" />

        {/* Champagne lower-right diamond/chevron */}
        <rect
          x="54"
          y="28"
          width="34"
          height="14"
          rx="3"
          fill="#C8A86B"
          transform="skewX(-8)"
        />

        {/* Dark grey lower-left chevron */}
        <rect
          x="18"
          y="44"
          width="36"
          height="14"
          rx="3"
          fill="#6B6B6B"
          transform="skewX(-8)"
        />

        {/* Lighter grey bottom bar completing the S-curve diamond */}
        <rect
          x="18"
          y="62"
          width="34"
          height="14"
          rx="3"
          fill="#9B9B9B"
          transform="skewX(-8)"
        />
      </svg>

      {/* Brand text */}
      {!iconOnly && (
        <div className="flex flex-col leading-none">
          <span
            style={{
              fontSize: size * 0.38,
              fontFamily: '"Inter", sans-serif',
              fontWeight: 600,
              letterSpacing: '0.18em',
              color: '#5A5A5A',
            }}
          >
            SUSA
          </span>
          <span
            style={{
              fontSize: size * 0.22,
              fontFamily: '"Inter", sans-serif',
              fontWeight: 500,
              letterSpacing: '0.28em',
              color: '#C8A86B',
              marginTop: 1,
            }}
          >
            SPACE
          </span>
        </div>
      )}
    </div>
  );
}
