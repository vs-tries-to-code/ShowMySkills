export function notificationKey(notification) {
  return notification?._id || notification?.id || null;
}

export function uniqueNotifications(notifications) {
  const seen = new Set();
  return (Array.isArray(notifications) ? notifications : []).filter((item) => {
    const key = notificationKey(item);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function markNotificationsRead(notifications) {
  return notifications.map((notification) => ({
    ...notification,
    unread: false,
  }));
}

export function markNotificationRead(notifications, id) {
  return notifications.map((notification) =>
    notificationKey(notification) === id
      ? { ...notification, unread: false }
      : notification
  );
}
