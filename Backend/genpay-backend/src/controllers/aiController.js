/*
  controllers/aiController.js
  ---------------------------
  Menangani request/response untuk AI financial insight.
  Cara implementasi:
    - getInsight: Terima data keuangan user, kirim ke AI, return analisis
*/

import * as aiService from '../services/aiService.js'

export async function getInsight(req, res, next) {
  /*
    1. Ambil req.user.id
    2. (Opsional) Ambil req.body: { projectId, timeframe, customPrompt }
       untuk filter data cashflow yang akan dikirim ke AI.
    3. Panggil aiService.getFinancialInsight(userId, filters)
       - Service akan mengambil data cashflow dari DB
       - Susun prompt yang berisi ringkasan keuangan user
       - Kirim ke Gemini/OpenAI API
       - Parse response AI
    4. Return insight sebagai JSON
  */
  try {
    res.status(200).json({ success: true, message: 'getInsight placeholder' })
  } catch (error) {
    next(error)
  }
}
