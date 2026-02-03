import { useState, useEffect } from 'react';
import { Bell, CheckCircle2, AlertCircle, Info, ChevronDown, ChevronUp } from 'lucide-react';
import * as API from '../../api';

interface Notification {
  id_notification: number;
  sujet: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  is_read: boolean;
  date_envoi: string;
}

export function PresidentChangeAlerts() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    loadNotifications();
    // Recharger les notifications toutes les 30 secondes
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await API.getUnreadNotifications();
      const notificationsList = Array.isArray(data) ? data : data?.results || [];
      setNotifications(notificationsList);
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationIds: number[]) => {
    try {
      await API.markNotificationsAsRead(notificationIds);
      setNotifications((prev) => prev.filter((n) => !notificationIds.includes(n.id_notification)));
    } catch (error) {
      console.error('Erreur lors du marquage des notifications:', error);
    }
  };

  const displayedNotifications = showAll ? notifications : notifications.slice(0, 3);
  const hasMore = notifications.length > 3;

  if (loading) {
    return null;
  }

  if (notifications.length === 0) {
    return null;
  }

  const getIconAndColor = (type: string) => {
    switch (type) {
      case 'warning':
        return { icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' };
      case 'error':
        return { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
      case 'success':
        return { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
      default:
        return { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' };
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Alertes et notifications</h3>
        {notifications.length > 0 && (
          <span className="ml-2 inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            {notifications.length}
          </span>
        )}
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="ml-auto flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          title={isVisible ? 'Masquer les notifications' : 'Afficher les notifications'}
        >
          {isVisible ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Masquer
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              Afficher
            </>
          )}
        </button>
      </div>

      {isVisible && (
        <>
          {displayedNotifications.map((notification) => {
            const { icon: Icon, color, bg, border } = getIconAndColor(notification.type);
            return (
              <div
                key={notification.id_notification}
                className={`${bg} border ${border} rounded-lg p-4 flex items-start justify-between gap-3`}
              >
                <div className="flex items-start gap-3 flex-1">
                  <Icon className={`${color} w-5 h-5 flex-shrink-0 mt-0.5`} />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{notification.sujet}</h4>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(notification.date_envoi).toLocaleString('fr-FR')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleMarkAsRead([notification.id_notification])}
                  className={`${color} hover:opacity-70 transition-opacity flex-shrink-0 px-3 py-1 text-sm font-medium rounded hover:bg-white/50`}
                >
                  ✓
                </button>
              </div>
            );
          })}

          {hasMore && !showAll && (
            <button
              onClick={() => setShowAll(true)}
              className="w-full py-2 text-center text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
            >
              Voir les {notifications.length - 3} notifications supplémentaires
            </button>
          )}

          {showAll && hasMore && (
            <button
              onClick={() => setShowAll(false)}
              className="w-full py-2 text-center text-gray-600 hover:text-gray-700 font-medium text-sm transition-colors"
            >
              Masquer les notifications supplémentaires
            </button>
          )}
        </>
      )}
    </div>
  );
}
