import { useState } from "react";

import { SERVICIO } from "@/content/servicio";

const { notaMinima } = SERVICIO.certificado;

/**
 * Certificado del test final. El PDF se genera en el navegador:
 * no se envía ni se guarda nada en ningún servidor.
 * Certificado sin descuento (mismo precio para todos).
 */
export function Certificado({
  aciertos,
  total,
  onRepetir,
}: {
  aciertos: number;
  total: number;
  onRepetir: () => void;
}) {
  const [nombre, setNombre] = useState("");
  const [generando, setGenerando] = useState(false);
  const aprobado = aciertos >= notaMinima;


  async function descargar() {
    setGenerando(true);
    try {
      const { jsPDF } = await import("jspdf/dist/jspdf.es.min.js");
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const W = 297;
      const H = 210;
      const crema: [number, number, number] = [240, 237, 228];
      const negro: [number, number, number] = [26, 26, 24];
      const verde: [number, number, number] = [14, 124, 107];

      doc.setFillColor(...crema);
      doc.rect(0, 0, W, H, "F");
      doc.setDrawColor(...negro);
      doc.setLineWidth(0.4);
      doc.rect(12, 12, W - 24, H - 24);
      doc.setDrawColor(...verde);
      doc.line(24, 40, W - 24, 40);

      doc.setTextColor(...negro);
      doc.setFont("courier", "normal");
      doc.setFontSize(10);
      doc.text(`${SERVICIO.marca.toUpperCase()} · MINERÍA DE BITCOIN`, 24, 32);
      doc.text(new Date().toLocaleDateString("es-ES"), W - 24, 32, { align: "right" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(32);
      doc.text("Certificado", W / 2, 70, { align: "center" });
      doc.setFontSize(14);
      doc.text("Test de minería de Bitcoin superado", W / 2, 82, { align: "center" });

      const n = nombre.trim();
      if (n) {
        doc.setFontSize(24);
        doc.text(n.slice(0, 60), W / 2, 104, { align: "center" });
      }

      doc.setFont("courier", "bold");
      doc.setFontSize(18);
      doc.setTextColor(...verde);
      doc.text(`${aciertos}/${total}`, W / 2, n ? 120 : 108, { align: "center" });

      doc.setTextColor(...negro);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.text("Ya entiendes cómo funciona la minería de Bitcoin.", W / 2, 148, {
        align: "center",
      });

      doc.setFont("courier", "normal");
      doc.setFontSize(9);
      doc.text(`${SERVICIO.dominio}/minar`, W / 2, H - 22, { align: "center" });

      doc.save("certificado-mineria-bitcoin.pdf");
    } finally {
      setGenerando(false);
    }
  }

  if (!aprobado) {
    return (
      <div className="border-t border-border pt-5 text-[16px]">
        <p>
          Para el certificado necesitas al menos <span className="font-mono">{notaMinima}/{total}</span>. Repasa las
          explicaciones y vuelve a intentarlo.
        </p>
        <button type="button" onClick={onRepetir} className="mt-4 min-h-[44px] border border-foreground px-4">
          Repetir el test
        </button>
      </div>
    );
  }

  return (
    <div className="border-t border-border pt-5 text-[16px]">
      <p className="etiqueta">Test superado.</p>
      <p className="mt-2">
        Descarga tu certificado en PDF.
      </p>
      <label htmlFor="cert-nombre" className="index-label mt-5 block">
        Nombre en el certificado (opcional)
      </label>
      <input
        id="cert-nombre"
        value={nombre}
        maxLength={60}
        onChange={(e) => setNombre(e.target.value)}
        className="mt-2 min-h-[44px] w-full border border-border bg-transparent px-3"
        autoComplete="name"
      />
      <p className="mt-2 text-[14px] text-muted-foreground">El PDF se crea en tu navegador; no guardamos tu nombre.</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={descargar}
          disabled={generando}
          className="min-h-[44px] bg-primary px-4 text-primary-foreground"
        >
          {generando ? "Generando…" : "Descargar certificado (PDF)"}
        </button>
        <button type="button" onClick={onRepetir} className="min-h-[44px] border border-border px-4">
          Repetir el test
        </button>
      </div>
    </div>
  );
}
