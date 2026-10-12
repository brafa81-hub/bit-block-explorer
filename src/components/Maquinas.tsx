import { SERVICIO } from "@/content/servicio";

/** Máquina de minería en vertical: carcasa, rejilla, ventilador con aspas, tornillos y LEDs. */
export function IconoMaquina({ indice = 0, animar = true }: { indice?: number; animar?: boolean }) {
  const aspas = [0, 72, 144, 216, 288];
  return (
    <svg viewBox="0 0 30 44" className="h-11 w-[30px]" fill="none" stroke="currentColor" aria-hidden="true">
      <rect x="0.6" y="0.6" width="28.8" height="42.8" rx="1.5" strokeWidth="1.2" />
      <rect x="3" y="3" width="24" height="5" strokeWidth="0.7" />
      {[6, 9.5, 13, 16.5, 20, 23.5].map((x) => (
        <line key={x} x1={x} y1="4" x2={x} y2="7" strokeWidth="0.7" />
      ))}
      <rect x="3" y="11" width="24" height="24" strokeWidth="0.7" />
      <circle cx="15" cy="23" r="10" strokeWidth="1" />
      <g>
        {aspas.map((a) => (
          <path key={a} d="M15 23 Q19 17 15 13.6" strokeWidth="0.9" transform={`rotate(${a} 15 23)`} />
        ))}
        {animar && (
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 15 23"
            to="360 15 23"
            dur="3.6s"
            begin={`${-indice * 0.7}s`}
            repeatCount="indefinite"
          />
        )}
      </g>
      <circle cx="15" cy="23" r="2.4" fill="currentColor" stroke="none" />
      {[[5, 13], [25, 13], [5, 33], [25, 33]].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="0.8" fill="currentColor" stroke="none" />
      ))}
      <line x1="3" y1="38.5" x2="17" y2="38.5" strokeWidth="0.7" />
      <line x1="3" y1="40.5" x2="17" y2="40.5" strokeWidth="0.7" />
      <circle cx="22" cy="39.5" r="1" fill="currentColor" stroke="none">
        {animar && (
          <animate
            attributeName="opacity"
            values="1;0.2;1"
            dur="2.4s"
            begin={`${-indice * 0.45}s`}
            repeatCount="indefinite"
          />
        )}
      </circle>
      <circle cx="25.5" cy="39.5" r="1" strokeWidth="0.7" />
    </svg>
  );
}

export function Equivalencia() {
  const n = SERVICIO.maquinasEquivalentes;
  // Decisión de producto: se animan siempre, aunque el sistema pida reducir movimiento (giro lento y LED suave).
  const animar = true;
  return (
    <div className="mt-4" aria-label={`Equivale a unas ${n} máquinas profesionales`}>
      <div className="flex flex-wrap gap-2 text-primary">
        {Array.from({ length: n }, (_, i) => (
          <IconoMaquina key={i} indice={i} animar={animar} />
        ))}
      </div>
      <p className="hash-text mt-2 text-[12px] text-muted-foreground">≈ {n} máquinas profesionales</p>
    </div>
  );
}
