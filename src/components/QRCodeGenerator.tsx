// components/QRCodeGenerator.tsx
'use client';

import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
}

export default function QRCodeGenerator({ value, size = 250 }: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCode.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });
    }
  }, [value, size]);

  return (
    <div className="inline-block">
      <canvas ref={canvasRef} id="qr-canvas" />
    </div>
  );
}