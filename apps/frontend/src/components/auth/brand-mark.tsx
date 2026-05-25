export default function BrandMark() {
  return (
    <div className="mb-8 flex flex-col items-center gap-2">
      <div className="flex items-center gap-2">
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="rounded"
        >
          <rect width="20" height="20" rx="4" fill="#22d3ee" />
          <text
            x="10"
            y="14"
            textAnchor="middle"
            fill="#082f49"
            fontSize="11"
            fontWeight="700"
            fontFamily="system-ui, sans-serif"
          >
            AC
          </text>
        </svg>
        <span className="text-xs text-muted">agentic-code &middot; console</span>
      </div>
    </div>
  );
}
