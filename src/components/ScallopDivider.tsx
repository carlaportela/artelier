export default function ScallopDivider({ className = "" }: { className?: string }) {
  return (
    <svg
      width="100%"
      height="8"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <pattern id="scallop" x="0" y="0" width="12" height="8" patternUnits="userSpaceOnUse">
          <path d="M0,0 Q6,8 12,0" stroke="currentColor" strokeWidth="1.2" fill="none" strokeOpacity="0.4" />
        </pattern>
      </defs>
      <rect width="100%" height="8" fill="url(#scallop)" />
    </svg>
  );
}
