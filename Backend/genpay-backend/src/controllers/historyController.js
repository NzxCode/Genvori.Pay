/*
  controllers/historyController.js
  ------------------------------
  Menangani request riwayat transaksi.
*/

import * as historyService from '../services/historyService.js'

export async function getHistory(req, res, next) {
  try {
    const filters = req.query;
    const result = await historyService.getUserHistory(req.user.id, filters);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}
