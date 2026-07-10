/*
  controllers/notificationController.js
  -----------------------------------
  Menangani request/response untuk notifikasi pengguna.
*/

import * as notificationService from '../services/notificationService.js';

export async function getNotifications(req, res, next) {
  try {
    const userId = req.user.id || req.user.user_id;
    const filters = req.query;
    const notifications = await notificationService.getNotifications(userId, filters);
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
}

export async function markAsRead(req, res, next) {
  try {
    const userId = req.user.id || req.user.user_id;
    const { notificationId } = req.params;
    await notificationService.markAsRead(notificationId, userId);
    res.status(200).json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    next(error);
  }
}
