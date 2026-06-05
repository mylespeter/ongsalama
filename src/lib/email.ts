// lib/email.ts
import nodemailer from 'nodemailer'

// Log la configuration au démarrage
console.log('📧 Configuration email:', {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || '587',
  user: process.env.SMTP_USER ? `${process.env.SMTP_USER.substring(0, 5)}...` : 'NON DÉFINI',
  pass: process.env.SMTP_PASS ? '***défini***' : 'NON DÉFINI'
})

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  // Ajouter des logs de debug
  logger: true,
  debug: true
})

// Vérifier la connexion au démarrage
transporter.verify(function (error, success) {
  if (error) {
    console.error('❌ Erreur de connexion SMTP:', error)
  } else {
    console.log('✅ Serveur SMTP prêt à envoyer des emails')
  }
})

export async function sendEmail(to: string, subject: string, html: string) {
  console.log('📧 ========== TENTATIVE D\'ENVOI D\'EMAIL ==========')
  console.log('📧 À:', to)
  console.log('📧 Sujet:', subject)
  console.log('📧 HTML length:', html.length, 'caractères')
  console.log('📧 SMTP Config:', {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER ? process.env.SMTP_USER.substring(0, 5) + '...' : 'MANQUANT'
  })
  
  try {
    const mailOptions = {
      from: `"AssuranceApp" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html
    }

    console.log('📧 Options d\'envoi:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    })

    const info = await transporter.sendMail(mailOptions)
    
    console.log('✅ Email envoyé avec succès!')
    console.log('✅ Message ID:', info.messageId)
    console.log('✅ Response:', info.response)
    console.log('✅ Accepté:', info.accepted)
    console.log('✅ Rejeté:', info.rejected)
    
    return { success: true, messageId: info.messageId }
    
  } catch (error: any) {
    console.error('❌ ========== ERREUR ENVOI EMAIL ==========')
    console.error('❌ Message:', error.message)
    console.error('❌ Code:', error.code)
    console.error('❌ Command:', error.command)
    console.error('❌ Stack:', error.stack)
    
    if (error.code === 'EAUTH') {
      console.error('❌ Erreur d\'authentification - Vérifiez SMTP_USER et SMTP_PASS')
    } else if (error.code === 'ESOCKET') {
      console.error('❌ Erreur de connexion - Vérifiez SMTP_HOST et SMTP_PORT')
    } else if (error.code === 'EENVELOPE') {
      console.error('❌ Erreur d\'enveloppe - Vérifiez les adresses email')
    }
    
    return { success: false, error: error.message }
  }
}