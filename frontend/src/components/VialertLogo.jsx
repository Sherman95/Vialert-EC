import React from 'react';

const VialertLogo = ({ className = "w-12 h-12" }) => {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Fondo con Bordes Redondeados (Squircle) */}
      <rect width="100" height="100" rx="24" fill="#1e293b" />

      {/* La Vía Principal (Forma de V) */}
      <path
        d="激30 30 L50 75 L70 30"
        stroke="white"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Línea Central Discontinua */}
      <path
        d="M50 70 L50 45"
        stroke="#3b82f6"
        strokeWidth="4"
        strokeDasharray="4 4"
        strokeLinecap="round"
      />

      {/* Punto de Alerta (Estilo Waze) */}
      <circle cx="70" cy="30" r="10" fill="#ef4444" className="animate-pulse" />
      <circle cx="70" cy="30" r="4" fill="white" />

      {/* Detalle Tricolor en la base */}
      <rect x="35" y="85" width="10" height="3" rx="1.5" fill="#FFD700" />
      <rect x="45" y="85" width="10" height="3" rx="1.5" fill="#0035AD" />
      <rect x="55" y="85" width="10" height="3" rx="1.5" fill="#C8102E" />
    </svg>
  );
};

export default VialertLogo;