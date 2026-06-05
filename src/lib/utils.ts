// import crypto from 'crypto'

// // Générer un numéro de lot style "LOT-250421-A7F"
// export function generateNumeroLot(medicament_nom: string): string {
//   const date = new Date()
//   const year = date.getFullYear().toString().slice(-2)
//   const month = (date.getMonth() + 1).toString().padStart(2, '0')
//   const day = date.getDate().toString().padStart(2, '0')
//   const random = Math.random().toString(36).substring(2, 5).toUpperCase()
  
//   const prefix = medicament_nom.substring(0, 4).toUpperCase()
//   return `${prefix}-${year}${month}${day}-${random}`
// }

// // Générer code unique style "LOT-1234567890-ABC123"
// export function generateCodeUnique(medicament_id: string): string {
//   const timestamp = Date.now()
//   const random = Math.random().toString(36).substring(2, 8)
//   return `LOT-${medicament_id}-${timestamp}-${random}`.toUpperCase()
// }

// // Générer le hash du lot
// export function generateLotHash(data: {
//   code_unique: string
//   numero_lot: string
//   medicament_id: string
//   date_fabrication: string
//   timestamp: number
// }): string {
//   const hashData = `${data.code_unique}${data.numero_lot}${data.medicament_id}${data.date_fabrication}${data.timestamp}`
//   return crypto.createHash('sha256').update(hashData).digest('hex').substring(0, 16)
// }

// // Générer le contenu du QR code
// export function generateQRContent(data: {
//   code_unique: string
//   numero_lot: string
//   hash: string
//   medicament_id: string
//   date_fabrication: string
// }): string {
//   return JSON.stringify({
//     code: data.code_unique,
//     lot: data.numero_lot,
//     hash: data.hash,
//     medicament_id: data.medicament_id,
//     date: data.date_fabrication
//   })
// }

// // Générer le hash d'un mouvement
// export function generateMouvementHash(data: any): string {
//   const content = JSON.stringify({
//     ...data,
//     timestamp: Date.now(),
//     random: Math.random().toString(36)
//   })
//   return crypto.createHash('sha256').update(content).digest('hex')
// }