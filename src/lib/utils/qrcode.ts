
// lib/utils/qrcode.ts
import QRCode from 'qrcode';

export async function generateQRCode(data: string): Promise<string> {
  try {
    return await QRCode.toDataURL(data, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
  } catch (err) {
    console.error('Erreur génération QR code:', err);
    throw err;
  }
}