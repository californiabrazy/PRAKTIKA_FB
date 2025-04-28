class NotificationManager {
    constructor() {
      this.notificationEnabled = localStorage.getItem('notificationEnabled') === 'true';
      this.notificationInterval = null;
      this.init();
    }
  
    init() {
      document.getElementById('notificationBtn').addEventListener('click', () => {
        this.toggleNotifications();
      });
  
      this.updateButtonText();
  
      if (this.notificationEnabled) {
        this.requestPermission();
        this.startReminder();
      }
    }
  
    toggleNotifications() {
      this.notificationEnabled = !this.notificationEnabled;
      localStorage.setItem('notificationEnabled', this.notificationEnabled.toString());
      this.updateButtonText();
  
      if (this.notificationEnabled) {
        this.requestPermission();
        this.startReminder();
      } else {
        this.stopReminder();
      }
    }
  
    updateButtonText() {
      const btn = document.getElementById('notificationBtn');
      btn.textContent = this.notificationEnabled ? 
        'Отключить уведомления' : 'Включить уведомления';
    }
  
    requestPermission() {
      Notification.requestPermission().then(permission => {
        if (permission !== 'granted') {
          this.notificationEnabled = false;
          localStorage.setItem('notificationEnabled', 'false');
          this.updateButtonText();
        }
      });
    }
  
    showNotification(title, body) {
      if (!this.notificationEnabled) return;
  
      if ('Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification(title, {
          body,
          icon: '/icons/icon-192x192.png'
        });
      } else if ('serviceWorker' in navigator && 'PushManager' in window) {
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification(title, {
            body,
            icon: '/icons/icon-192x192.png'
          });
        });
      }
    }
  
    startReminder() {
      if (this.notificationInterval) clearInterval(this.notificationInterval);
      
      this.notificationInterval = setInterval(() => {
        const activeTasks = db.getActiveTasks();
        if (activeTasks.length > 0) {
          this.showNotification(
            'У вас есть невыполненные задачи!',
            `У вас ${activeTasks.length} невыполненных задач.`
          );
        }
      }, 2 * 60 * 60 * 1000); // Каждые 2 часа
    }
  
    stopReminder() {
      if (this.notificationInterval) {
        clearInterval(this.notificationInterval);
        this.notificationInterval = null;
      }
    }
  }
  
  const notificationManager = new NotificationManager();