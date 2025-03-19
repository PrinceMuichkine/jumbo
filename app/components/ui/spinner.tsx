interface SpinnerProps {
  className?: string;
}

export default function Spinner({ className = "" }: SpinnerProps) {
  return (
    <div className="flex items-center justify-center">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        className={`animate-spin ${className}`}
      >
        {[...Array(8)].map((_, i) => (
          <line
            key={i}
            x1="12"
            y1="3"
            x2="12"
            y2="7"
            className="stroke-gray-800"
            style={{
              opacity: Math.max(0.2, 1 - (i * 0.1))
            }}
            strokeWidth="2"
            strokeLinecap="round"
            transform={`rotate(${i * 45} 12 12)`}
          />
        ))}
      </svg>
    </div>
  )
}