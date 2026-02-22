export function Logo({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Building outline */}
      <rect
        x="4"
        y="8"
        width="16"
        height="20"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      {/* Building top/roof accent */}
      <path
        d="M7 8V5.5A1.5 1.5 0 0 1 8.5 4h7A1.5 1.5 0 0 1 17 5.5V8"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      {/* Window row 1 */}
      <rect x="8" y="12" width="3" height="3" rx="0.5" fill="currentColor" />
      <rect x="13" y="12" width="3" height="3" rx="0.5" fill="currentColor" />
      {/* Window row 2 */}
      <rect x="8" y="18" width="3" height="3" rx="0.5" fill="currentColor" />
      <rect x="13" y="18" width="3" height="3" rx="0.5" fill="currentColor" />
      {/* Door */}
      <rect x="10" y="24" width="4" height="4" rx="0.5" fill="currentColor" />
      {/* Checkmark — efficiency/kushal */}
      <circle cx="24" cy="12" r="7" fill="currentColor" opacity="0.15" />
      <path
        d="M20.5 12L23 14.5L28 9.5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
