import React, { useEffect, useState } from 'react';

// ─────────────────────────────────────────────
//  SPLASH SCREEN — DockTask
//  Ilustración: cabeza ansiosa con ideas saliendo
// ─────────────────────────────────────────────

const SplashScreen = ({ onFinish }) => {
  const [phase, setPhase] = useState('enter'); // 'enter' | 'idle' | 'exit'

  useEffect(() => {
    // Fase idle después de que entró
    const t1 = setTimeout(() => setPhase('idle'), 600);
    // Salir a los 3.5s
    const t2 = setTimeout(() => setPhase('exit'), 3500);
    // Callback al finalizar
    const t3 = setTimeout(() => onFinish?.(), 4100);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: 'hsl(var(--background))',
        opacity: phase === 'exit' ? 0 : 1,
        transition: 'opacity 0.6s ease-in-out',
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {/* Partículas de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-10"
            style={{
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              background: 'hsl(var(--primary))',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float-particle ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Logo arriba */}
      <div
        className="mb-4 text-center"
        style={{
          transform: phase === 'enter' ? 'translateY(-30px)' : 'translateY(0)',
          opacity: phase === 'enter' ? 0 : 1,
          transition: 'all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <div className="flex items-center gap-2 justify-center mb-1">
          <div style={{
            width: 36, height: 36,
            background: 'hsl(var(--primary))',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg viewBox="0 0 24 24" fill="white" width="22" height="22">
              <path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
            </svg>
          </div>
          <span style={{ fontSize: 26, fontWeight: 800, color: 'white', letterSpacing: -0.5 }}>
            DockTask
          </span>
        </div>
        <p style={{ color: '#93c5fd', fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 500 }}>
          Organiza el caos
        </p>
      </div>

      {/* ── ILUSTRACIÓN PRINCIPAL ── */}
      <div
        style={{
          transform: phase === 'enter' ? 'scale(0.7)' : 'scale(1)',
          opacity: phase === 'enter' ? 0 : 1,
          transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s',
        }}
      >
        <svg
          viewBox="0 0 260 280"
          width="260"
          height="280"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* ── ICONOS FLOTANDO DESDE LA CABEZA ── */}

          {/* Ampolleta (arriba izquierda) */}
          <g style={{ animation: 'float-up-left 3s ease-in-out infinite', transformOrigin: '80px 60px' }}>
            <circle cx="80" cy="60" r="16" fill="#fbbf24" opacity="0.15"/>
            <circle cx="80" cy="60" r="12" fill="#fbbf24" opacity="0.25"/>
            {/* Bombilla */}
            <ellipse cx="80" cy="57" rx="9" ry="10" fill="#fef3c7" stroke="#fbbf24" strokeWidth="1.5"/>
            <path d="M74 67 Q80 72 86 67" stroke="#fbbf24" strokeWidth="1.5" fill="none"/>
            <rect x="77" y="67" width="6" height="4" rx="1" fill="#fbbf24" opacity="0.8"/>
            {/* Destellos */}
            <line x1="80" y1="43" x2="80" y2="39" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="92" y1="47" x2="94.8" y2="44.2" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="68" y1="47" x2="65.2" y2="44.2" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="80" cy="57" r="4" fill="#fef9c3" opacity="0.7"/>
          </g>

          {/* Engranaje (arriba derecha, girando) */}
          <g style={{ animation: 'float-up-right 3.5s ease-in-out infinite 0.5s', transformOrigin: '180px 55px' }}>
            <circle cx="180" cy="55" r="16" fill="#60a5fa" opacity="0.12"/>
            <g style={{ animation: 'spin-gear 4s linear infinite', transformOrigin: '180px 55px' }}>
              <circle cx="180" cy="55" r="9" fill="none" stroke="#60a5fa" strokeWidth="2.5"/>
              <circle cx="180" cy="55" r="4" fill="#60a5fa"/>
              {/* Dientes del engranaje */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                <rect
                  key={i}
                  x="178" y="43"
                  width="4" height="5"
                  rx="1"
                  fill="#60a5fa"
                  transform={`rotate(${angle} 180 55)`}
                />
              ))}
            </g>
          </g>

          {/* Reloj (derecha) */}
          <g style={{ animation: 'float-right 4s ease-in-out infinite 1s', transformOrigin: '200px 110px' }}>
            <circle cx="200" cy="110" r="14" fill="#34d399" opacity="0.12"/>
            <circle cx="200" cy="110" r="11" fill="none" stroke="#34d399" strokeWidth="2"/>
            <circle cx="200" cy="110" r="2" fill="#34d399"/>
            {/* Agujas */}
            <line x1="200" y1="110" x2="200" y2="102" stroke="#34d399" strokeWidth="1.8" strokeLinecap="round"
              style={{ animation: 'tick-minute 2s steps(1) infinite', transformOrigin: '200px 110px' }}/>
            <line x1="200" y1="110" x2="206" y2="110" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round"/>
            {/* Marcas horas */}
            {[0,30,60,90,120,150,180,210,240,270,300,330].map((a, i) => (
              <line
                key={i}
                x1="200" y1="100"
                x2="200" y2={i % 3 === 0 ? "99" : "101"}
                stroke="#34d399"
                strokeWidth={i % 3 === 0 ? 2 : 1}
                transform={`rotate(${a} 200 110)`}
              />
            ))}
          </g>

          {/* Checkmark flotante (izquierda) */}
          <g style={{ animation: 'float-left 3.8s ease-in-out infinite 1.5s', transformOrigin: '60px 120px' }}>
            <circle cx="60" cy="120" r="14" fill="#a78bfa" opacity="0.15"/>
            <circle cx="60" cy="120" r="10" fill="none" stroke="#a78bfa" strokeWidth="2"/>
            <path d="M54 120 L58 124 L67 114" stroke="#a78bfa" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </g>

          {/* ── CABEZA ── */}

          {/* Cuello */}
          <rect x="110" y="220" width="40" height="30" rx="8" fill="#f3d5b5" stroke="#d4a574" strokeWidth="1.5"/>

          {/* Cara - cuerpo oval */}
          <ellipse cx="130" cy="185" rx="52" ry="60" fill="#f9e4c8" stroke="#d4a574" strokeWidth="2"/>

          {/* ── CABEZA ABIERTA (tapa levantada) ── */}
          {/* Línea de corte de la cabeza */}
          <path
            d="M82 165 Q90 145 130 140 Q170 145 178 165"
            fill="none" stroke="#d4a574" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.7"
          />

          {/* Interior del cerebro (visible porque está abierta) */}
          <path
            d="M88 162 Q95 148 130 143 Q165 148 172 162 Q165 158 155 157 Q145 160 130 158 Q115 160 105 157 Q95 158 88 162Z"
            fill="#fce7f3" opacity="0.6"
          />
          {/* Pliegues del cerebro */}
          <path d="M100 157 Q110 150 120 155" stroke="#f9a8d4" strokeWidth="1.2" fill="none"/>
          <path d="M140 155 Q150 150 160 157" stroke="#f9a8d4" strokeWidth="1.2" fill="none"/>
          <path d="M120 153 Q130 148 140 153" stroke="#f9a8d4" strokeWidth="1.2" fill="none"/>

          {/* Tapa de la cabeza levantada (con bisagra implícita) */}
          <path
            d="M82 165 Q85 120 130 115 Q175 120 178 165"
            fill="#f9e4c8" stroke="#d4a574" strokeWidth="2"
            style={{ animation: 'lid-bounce 2s ease-in-out infinite', transformOrigin: '130px 165px' }}
          />
          {/* Pelo en la tapa */}
          <path
            d="M90 155 Q95 130 110 125 M108 123 Q120 118 130 117 M130 117 Q140 118 152 123 M150 125 Q165 130 170 155"
            stroke="#8b6914" strokeWidth="2.5" fill="none" strokeLinecap="round"
            style={{ animation: 'lid-bounce 2s ease-in-out infinite', transformOrigin: '130px 165px' }}
          />

          {/* ── CARA ANSIOSA ── */}

          {/* Ojos grandes (ansiosos) */}
          {/* Ojo izquierdo */}
          <ellipse cx="112" cy="185" rx="10" ry="12" fill="white" stroke="#d4a574" strokeWidth="1.5"/>
          <ellipse cx="112" cy="187" rx="6" ry="7" fill="#3b1f0a"/>
          <ellipse cx="112" cy="186" rx="4" ry="5" fill="#1a0f05"/>
          <circle cx="114.5" cy="183.5" r="2" fill="white"/>
          {/* Líneas de tensión sobre ojo izquierdo */}
          <path d="M104 176 L108 179" stroke="#c97b4b" strokeWidth="1.2" strokeLinecap="round"/>
          <path d="M107 175 L109 178.5" stroke="#c97b4b" strokeWidth="1.2" strokeLinecap="round"/>

          {/* Ojo derecho */}
          <ellipse cx="148" cy="185" rx="10" ry="12" fill="white" stroke="#d4a574" strokeWidth="1.5"/>
          <ellipse cx="148" cy="187" rx="6" ry="7" fill="#3b1f0a"/>
          <ellipse cx="148" cy="186" rx="4" ry="5" fill="#1a0f05"/>
          <circle cx="150.5" cy="183.5" r="2" fill="white"/>
          {/* Líneas de tensión sobre ojo derecho */}
          <path d="M156 176 L152 179" stroke="#c97b4b" strokeWidth="1.2" strokeLinecap="round"/>
          <path d="M153 175 L151 178.5" stroke="#c97b4b" strokeWidth="1.2" strokeLinecap="round"/>

          {/* Cejas arqueadas de ansiedad */}
          <path d="M102 173 Q112 169 120 172" stroke="#8b6914" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
          <path d="M140 172 Q148 169 158 173" stroke="#8b6914" strokeWidth="2.2" fill="none" strokeLinecap="round"/>

          {/* Nariz */}
          <path d="M128 192 Q130 198 133 192" stroke="#c97b4b" strokeWidth="1.5" fill="none" strokeLinecap="round"/>

          {/* Boca ansiosa (ondulada, nerviosa) */}
          <path
            d="M112 210 Q116 207 120 210 Q124 213 128 210 Q132 207 136 210 Q140 213 144 210 Q148 207 150 210"
            stroke="#8b6914" strokeWidth="2" fill="none" strokeLinecap="round"
            style={{ animation: 'mouth-twitch 1.5s ease-in-out infinite' }}
          />

          {/* Gota de sudor ansiedad */}
          <ellipse cx="163" cy="178" rx="4" ry="5.5" fill="#93c5fd" opacity="0.7"
            style={{ animation: 'sweat-drop 2s ease-in-out infinite 0.5s' }}
          />
          <circle cx="163" cy="173" r="2.5" fill="#93c5fd" opacity="0.7"
            style={{ animation: 'sweat-drop 2s ease-in-out infinite 0.5s' }}
          />

          {/* Colorete (rubor ansioso) */}
          <ellipse cx="100" cy="197" rx="10" ry="5" fill="#f87171" opacity="0.3"/>
          <ellipse cx="160" cy="197" rx="10" ry="5" fill="#f87171" opacity="0.3"/>

          {/* Líneas de estrés al lado de la cara */}
          <path d="M73 182 L68 180 M73 188 L67 188 M73 194 L68 196"
            stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"
            style={{ animation: 'stress-lines 1.2s ease-in-out infinite' }}/>
          <path d="M187 182 L192 180 M187 188 L193 188 M187 194 L192 196"
            stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"
            style={{ animation: 'stress-lines 1.2s ease-in-out infinite 0.3s' }}/>

        </svg>
      </div>

      {/* Tagline y botón */}
      <div
        className="mt-2 text-center"
        style={{
          transform: phase === 'enter' ? 'translateY(30px)' : 'translateY(0)',
          opacity: phase === 'enter' ? 0 : 1,
          transition: 'all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s',
        }}
      >
        <p style={{ color: '#cbd5e1', fontSize: 14, marginBottom: 6 }}>
          Tantas ideas, tan poco orden.
        </p>
        <p style={{ color: '#64748b', fontSize: 12 }}>
          DockTask te ayuda a cerrar la tapa.
        </p>
        <button
          onClick={() => onFinish?.()}
          style={{
            marginTop: 20,
            padding: '10px 32px',
            background: 'hsl(var(--primary))',
            border: 'none',
            borderRadius: 24,
            color: 'white',
            fontSize: 15,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: 'none',
            letterSpacing: 0.5,
          }}
        >
          Empezar →
        </button>
      </div>

      {/* Estilos de animación inline */}
      <style>{`
        @keyframes float-up-left {
          0%, 100% { transform: translateY(0) rotate(-5deg); }
          50% { transform: translateY(-12px) rotate(5deg); }
        }
        @keyframes float-up-right {
          0%, 100% { transform: translateY(0) rotate(5deg); }
          50% { transform: translateY(-14px) rotate(-5deg); }
        }
        @keyframes float-right {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(8px); }
        }
        @keyframes float-left {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-8px); }
        }
        @keyframes spin-gear {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes lid-bounce {
          0%, 100% { transform: rotate(-2deg); }
          50% { transform: rotate(3deg); }
        }
        @keyframes mouth-twitch {
          0%, 100% { transform: scaleY(1); }
          30% { transform: scaleY(0.7) translateY(2px); }
          60% { transform: scaleY(1.2); }
        }
        @keyframes sweat-drop {
          0% { transform: translateY(0); opacity: 0.7; }
          80% { transform: translateY(14px); opacity: 0; }
          100% { transform: translateY(0); opacity: 0; }
        }
        @keyframes stress-lines {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
        @keyframes tick-minute {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes float-particle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
