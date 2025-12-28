import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import type { Notification as NotificationType, NavigationItem, SidebarItem } from '../types';
import type { User } from '../types';
import './Dashboard.css';

interface CandidateNotificationsProps {
  user?: User;
  onLogout?: () => void;
}

const CandidateNotifications: React.FC<CandidateNotificationsProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Job_Alert');

  // Navigation items for the top navigation bar
  const navigationItems: NavigationItem[] = [
    { id: 'Home', label: 'Home' },
    { id: 'Find_Job', label: 'Find Job', path: '/find-jobs' },
    { id: 'Dashboard', label: 'Dashboard', path: '/dashboard' },
    { id: 'Job_Alerts', label: 'Job Alerts' },
    { id: 'Customer_Supports', label: 'Customer Supports' }
  ];

  // Sidebar items for the dashboard
  const sidebarItems: SidebarItem[] = [
    { id: 'Overview', label: 'Overview', icon: '📊' },
    { id: 'Applied_Jobs', label: 'Applied Jobs', icon: '💼' },
    { id: 'Saved_Jobs', label: 'Saved Jobs', icon: '💾' },
    { id: 'Job_Alert', label: 'Job Alert', icon: '🔔', badge: notifications.filter(n => n.status === 'unread').length.toString() },
    { id: 'Settings', label: 'Settings', icon: '⚙️' }
  ];

  // Handle navigation between pages
  const handleNavigation = (itemId: string) => {
    if (itemId === 'Dashboard') {
      navigate('/dashboard');
    } else if (itemId === 'Home') {
      navigate('/');
    } else if (itemId === 'Find_Job') {
      navigate('/find-jobs');
    } else if (itemId === 'Job_Alerts') {
      navigate('/notifications');
    } else if (itemId === 'Customer_Supports') {
      navigate('/customer-support');
    }
  };

  // Handle sidebar item clicks
  const handleSidebarClick = (itemId: string) => {
    if (itemId === 'Applied_Jobs') {
      navigate('/applied-jobs');
      return;
    }
    if (itemId === 'Saved_Jobs') {
      navigate('/saved-jobs');
      return;
    }
    if (itemId === 'Settings') {
      navigate('/settings');
      return;
    }
    if (itemId === 'Overview' || itemId === 'Dashboard') {
      navigate('/dashboard');
      return;
    }
    setActiveTab(itemId);
  };

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setIsLoading(true);
        const data = await apiService.getNotifications();
        setNotifications(data || []);
      } catch (error) {
        console.error('Error loading notifications:', error);
        setNotifications([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();
    
    // Recharger les notifications toutes les 30 secondes
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await apiService.markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, status: 'read' as const } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiService.markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, status: 'read' as const })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDelete = async (notificationId: number) => {
    try {
      await apiService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleNotificationClick = (notification: NotificationType) => {
    // Marquer comme lue si non lue
    if (notification.status === 'unread') {
      handleMarkAsRead(notification.id);
    }
    
    // Si la notification est liée à une candidature, naviguer vers les candidatures
    if (notification.application_id) {
      navigate('/applied-jobs');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    if (diffDays < 7) return `Il y a ${diffDays} j`;
    
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const getNotificationIcon = (subject: string) => {
    if (subject.includes('acceptée') || subject.includes('accepté')) return '🎉';
    if (subject.includes('refusée') || subject.includes('refusé')) return '❌';
    if (subject.includes('examen')) return '👀';
    return '📬';
  };

  if (isLoading) {
    return (
      <div className="dashboard">
        <div className="dashboard-content">
          <main className="dashboard-main">
            <div className="loading">Chargement des notifications...</div>
          </main>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  return (
    <div className="dashboard">
      {/* Header with navigation */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">💼</span>
            <span className="logo-text">RecruPlus</span>
          </div>
          <nav className="main-nav">
            {navigationItems.map(item => (
              <a 
                key={item.id}
                href="#" 
                className={`nav-link ${item.id === 'Dashboard' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigation(item.id);
                }}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
        
      </header>

      <div className="dashboard-content">
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <h3 className="sidebar-title">CANDIDATE DASHBOARD</h3>
          <nav className="sidebar-nav">
            <ul>
              {sidebarItems.map((item) => (
                <li key={item.id}>
                  <a
                    href="#"
                    className={`sidebar-link ${activeTab === item.id ? 'active' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleSidebarClick(item.id);
                    }}
                  >
                    <span className="sidebar-icon">{item.icon}</span>
                    <span className="sidebar-label">{item.label}</span>
                    {item.badge && unreadCount > 0 && (
                      <span className="badge" style={{ background: '#f44336', color: 'white' }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="logout-section">
            <button 
              onClick={onLogout}
              className="logout-link"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', textDecoration: 'none' }}
            >
              <span className="logout-icon">↗️</span>
              Log-out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="dashboard-main">
          <div className="welcome-section">
            <h1 className="welcome-title">Notifications</h1>
            <p className="welcome-subtitle">
              {unreadCount > 0 
                ? `Vous avez ${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}`
                : 'Toutes vos notifications sont à jour'}
            </p>
          </div>

          {unreadCount > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <button
                onClick={handleMarkAllAsRead}
                style={{
                  padding: '10px 20px',
                  background: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Marquer tout comme lu
              </button>
            </div>
          )}

          <div style={{ padding: '20px' }}>
            {notifications.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    style={{
                      background: notification.status === 'unread' ? '#e3f2fd' : 'white',
                      border: notification.status === 'unread' ? '2px solid #2196F3' : '1px solid #e0e0e0',
                      borderRadius: '8px',
                      padding: '20px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: notification.status === 'unread' ? '0 2px 4px rgba(33, 150, 243, 0.2)' : '0 1px 2px rgba(0,0,0,0.1)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = notification.status === 'unread' 
                        ? '0 2px 4px rgba(33, 150, 243, 0.2)' 
                        : '0 1px 2px rgba(0,0,0,0.1)';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px', flex: 1 }}>
                        <span style={{ fontSize: '32px' }}>{getNotificationIcon(notification.subject)}</span>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', fontWeight: '600', color: '#333' }}>
                            {notification.subject}
                          </h3>
                          <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666', lineHeight: '1.5' }}>
                            {notification.message}
                          </p>
                          <span style={{ fontSize: '12px', color: '#999' }}>
                            {formatDate(notification.sent_at)}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        {notification.status === 'unread' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification.id);
                            }}
                            style={{
                              padding: '6px 12px',
                              background: '#4caf50',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Marquer comme lu
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(notification.id);
                          }}
                          style={{
                            padding: '6px 12px',
                            background: '#f44336',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                background: 'white',
                borderRadius: '8px',
                border: '1px solid #e0e0e0'
              }}>
                <div style={{ fontSize: '64px', marginBottom: '20px' }}>📭</div>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '20px', color: '#333' }}>
                  Aucune notification
                </h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                  Vous n'avez pas encore de notifications. Elles apparaîtront ici lorsque vous recevrez des mises à jour.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CandidateNotifications;

