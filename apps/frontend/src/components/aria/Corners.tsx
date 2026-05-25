import React from 'react';

interface CornersProps {
  color?: string;
  children: React.ReactNode;
}

export default function Corners({ color = '#22d3ee', children }: CornersProps) {
  const bracketStyle = { borderColor: color };

  return (
    <div className="relative">
      {/* Top-left */}
      <div
        style={bracketStyle}
        className="absolute top-0 left-0 w-3 h-3 border-t border-l"
      />
      {/* Top-right */}
      <div
        style={bracketStyle}
        className="absolute top-0 right-0 w-3 h-3 border-t border-r"
      />
      {/* Bottom-left */}
      <div
        style={bracketStyle}
        className="absolute bottom-0 left-0 w-3 h-3 border-b border-l"
      />
      {/* Bottom-right */}
      <div
        style={bracketStyle}
        className="absolute bottom-0 right-0 w-3 h-3 border-b border-r"
      />
      <div className="p-3 pt-4 pb-4">{children}</div>
    </div>
  );
}
