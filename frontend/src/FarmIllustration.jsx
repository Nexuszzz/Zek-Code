import React from 'react';

export default function FarmIllustration({ pumpOn }) {
  return (
    <svg width="200" height="150" viewBox="0 0 200 150" className="mx-auto">
      <rect x="10" y="80" width="180" height="60" fill="#a3e635" stroke="#4d7c0f" />
      <rect x="70" y="40" width="60" height="40" fill="#d4d4d4" stroke="#737373" />
      <circle cx="30" cy="110" r="10" fill={pumpOn ? 'blue' : 'gray'}>
        <animate attributeName="opacity" values="0;1;0" dur="1s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}
