import nodemailer from 'nodemailer';
import { getDatabase } from '../database.js';

let transporter: any = null;
let isSending = false;

export async function initializeMailer() {
  // Mode test/dev
  if (process.env.NODE_ENV === 'test') {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    console.log('✓ Mailer initialisé en mode test');
    return;
  }

  // Mode production
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    console.warn('⚠️ SMTP non configuré (SMTP_USER ou SMTP_PASS manquant)');
    return;
  }

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: smtpUser,
      pass: smtpPass
    }
  });

  console.log('✓ Mailer Gmail initialisé');
}

export async function sendPunitionNotification(
  punitionId: number,
  _studentId: number,
  firstName: string,
  lastName: string,
  className: string,
  detentionDate: string,
  reason: string | null
): Promise<boolean> {
  if (!transporter) {
    console.warn('⚠️ Mailer non initialisé');
    return false;
  }

  const notificationEmail = process.env.NOTIFICATION_EMAIL;
  if (!notificationEmail) {
    console.warn('⚠️ NOTIFICATION_EMAIL non configuré');
    return false;
  }

  const detention = new Date(detentionDate);
  const detentionStr = new Intl.DateTimeFormat('fr-BE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(detention);

  const subject = `Punition - ${lastName} ${firstName}`;
  const htmlContent = `
    <h2>Notification de Punition</h2>
    <p><strong>Eleve:</strong> ${lastName} ${firstName}</p>
    <p><strong>Classe:</strong> ${className}</p>
    <p><strong>Date et heure:</strong> ${detentionStr}</p>
    ${reason ? `<p><strong>Motif:</strong> ${reason}</p>` : ''}
    <p><em>La punition vient d'avoir lieu.</em></p>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER || 'noreply@example.com',
      to: notificationEmail,
      subject,
      html: htmlContent
    });

    // Marquer comme envoyé
    const db = getDatabase();
    await db.run(
      'UPDATE punitions SET email_sent_at = ?, email_last_error = NULL WHERE id = ?',
      [new Date().toISOString(), punitionId]
    );

    console.log(`✓ Email envoyé pour punition ${punitionId}`);
    return true;
  } catch (error: any) {
    const errorMsg = error.message || 'Erreur inconnue';
    console.error(`✗ Erreur d'envoi email punition ${punitionId}: ${errorMsg}`);

    // Enregistrer l'erreur et incrémenter le compteur
    const db = getDatabase();
    await db.run(
      'UPDATE punitions SET email_last_error = ?, email_attempts = email_attempts + 1 WHERE id = ?',
      [errorMsg, punitionId]
    );

    return false;
  }
}

export async function checkAndSendDueNotifications() {
  if (!transporter) {
    return;
  }

  if (isSending) {
    console.log('⏳ Vérification des notifications déjà en cours...');
    return;
  }

  isSending = true;

  try {
    const db = getDatabase();

    // Trouver les punitions dues (>10 minutes après detention_date, non envoyées)
    const duePunitions = await db.all(`
      SELECT
        p.id,
        p.student_id,
        p.detention_date,
        p.reason,
        p.email_attempts,
        s.first_name,
        s.last_name,
        c.name as class_name
      FROM punitions p
      JOIN students s ON p.student_id = s.id
      JOIN classes c ON s.class_id = c.id
      WHERE p.email_sent_at IS NULL
        AND p.email_attempts < 5
        AND datetime(p.detention_date, '+10 minutes') <= datetime('now')
      LIMIT 10
    `);

    if (duePunitions.length === 0) {
      return;
    }

    console.log(`📧 ${duePunitions.length} notification(s) due(s) à envoyer`);

    for (const punition of duePunitions) {
      await sendPunitionNotification(
        punition.id,
        punition.student_id,
        punition.first_name,
        punition.last_name,
        punition.class_name,
        punition.detention_date,
        punition.reason
      );
    }
  } catch (error) {
    console.error('Erreur lors de la vérification des notifications:', error);
  } finally {
    isSending = false;
  }
}

export async function getMailer() {
  return transporter;
}
