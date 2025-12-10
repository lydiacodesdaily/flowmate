export const TomatoIcon = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    className={`w-5 h-5 ${className}`}
  >
    {/* Shadow / base */}
    <ellipse cx="12" cy="18" rx="6.5" ry="2.2" fill="rgba(0,0,0,0.08)" />

    {/* Tomato body */}
    <circle cx="12" cy="12" r="7" fill="#FF4B4B" />

    {/* Subtle highlight */}
    <ellipse cx="9" cy="10" rx="2.4" ry="1.6" fill="#FFFFFF" opacity="0.35" />

    {/* Stem base */}
    <circle cx="12" cy="7.4" r="2.1" fill="#2E7D32" />

    {/* Leafy top */}
    <path
      d="M12 5.3 L10.7 6.5 L9.1 6.1 L9.6 7.7 L8.5 9 L10.2 9.1 L11.1 10.6 L12 9.2 L12.9 10.6 L13.8 9.1 L15.5 9 L14.4 7.7 L14.9 6.1 L13.3 6.5 Z"
      fill="#388E3C"
    />

    {/* Tiny top highlight on stem */}
    <circle cx="11.3" cy="6.8" r="0.45" fill="#FFFFFF" opacity="0.6" />
  </svg>
);
