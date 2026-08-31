import cron from 'node-cron';
import { checkAndSendDueNotifications } from './notification.js';

let task: any = null;

export function startNotificationScheduler() {
  // Vérifier au démarrage
  checkAndSendDueNotifications().catch(err => {
    console.error('Erreur vérification initiale notifications:', err);
  });

  // Vérifier toutes les minutes
  task = cron.schedule('* * * * *', () => {
    checkAndSendDueNotifications().catch(err => {
      console.error('Erreur cron notifications:', err);
    });
  });

  console.log('✓ Scheduleur de notifications lancé (toutes les minutes)');
}

export function stopNotificationScheduler() {
  if (task) {
    task.stop();
    console.log('✓ Scheduleur de notifications arrêté');
  }
}
