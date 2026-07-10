/*
  services/aiService.js
  ---------------------
  Logika integrasi ke Gemini/OpenAI API untuk memproses data cashflow user
  menjadi financial insight dan rekomendasi.
  Cara implementasi:
    1. Ambil data cashflow user dari DB (transaksi, wallet balance, project budget).
    2. Susun prompt yang berisi ringkasan keuangan terstruktur.
    3. Kirim ke Gemini API (atau OpenAI) menggunakan library @google/generative-ai.
    4. Parse response AI dan format sebagai insight JSON.
    5. (Opsional) Simpan riwayat insight ke tabel 'ai_insights' untuk audit.
*/

import { supabase } from '../config/supabase.js'

// Inisialisasi AI client di sini
// import { GoogleGenerativeAI } from '@google/generative-ai'
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
// const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

export async function getFinancialInsight(userId, { projectId, timeframe, customPrompt } = {}) {
  /*
    1. Kumpulkan data keuangan user dari Supabase:
       a. Wallet balances:  SELECT * FROM wallets WHERE user_id = userId
       b. Recent transactions: SELECT * FROM ledger WHERE user_id = userId
          ORDER BY created_at DESC LIMIT 50
       c. (Jika projectId) Project detail + budget allocation
       d. (Jika timeframe) Filter transaksi berdasarkan range tanggal

    2. Susun structured prompt:
       "Kamu adalah asisten keuangan untuk aplikasi Gen-Pay.
        Berikut data keuangan user:
        - Total saldo: Rp X
        - Dompet: [detail per wallet]
        - Transaksi terbaru: [list 5-10 transaksi]
        - (Jika ada project) Progress project: [nama, budget terpakai, sisa]

        Berikan insight dalam format JSON:
        {
          summary: 'ringkasan singkat',
          analysis: 'analisis cashflow',
          recommendations: ['rekomendasi 1', 'rekomendasi 2'],
          warnings: ['peringatan 1']  // jika ada
        }"

    3. Kirim prompt ke model AI:
       const result = await model.generateContent(prompt)
       const response = await result.response
       const text = response.text()

    4. Parse text response menjadi object JSON (gunakan JSON.parse)

    5. Simpan ke tabel ai_insights:
       { user_id: userId, prompt, response: text, project_id: projectId, created_at }

    6. Return parsed insight
  */
  return { message: 'getFinancialInsight placeholder' }
}
