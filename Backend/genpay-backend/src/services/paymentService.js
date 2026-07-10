import { supabase } from '../config/supabase.js'
import * as walletService from './walletService.js'
import * as notificationService from './notificationService.js'

export async function createTransaction(userId, { amount, projectId, description }) {
  // 1. Buat record payment status 'pending'
  const { data: payment, error: pErr } = await supabase
    .from('payments')
    .insert({ user_id: userId, project_id: projectId, amount, status: 'pending', description })
    .select()
    .single()

  if (pErr) throw pErr

  // 2. Simulasi pembayaran instan (Hackathon style)
  // Langsung set ke 'success' dan update wallet
  const { error: updateErr } = await supabase
    .from('payments')
    .update({ status: 'success' })
    .eq('id', payment.id)

  if (updateErr) throw updateErr

  // 3. Tambahkan saldo ke wallet 'cash' (Asumsi wallet cash ada)
  await walletService.creditWallet(userId, 'cash', amount, `Payment for project: ${projectId} - ${description}`)

  // 4. Catat di history
  await supabase.from('transaction_history').insert({
    user_id: userId,
    type: 'TOPUP',
    amount,
    status: 'success',
    description: `Topup saldo via project ${projectId}: ${description}`,
    reference_id: payment.id
  });

  // Trigger Notifikasi
  await notificationService.createNotification(userId, {
    title: 'Dana Diterima',
    message: `Pembayaran sebesar ${amount} untuk ${description} telah masuk ke wallet cash Anda.`,
    type: 'success'
  });
  
  return { ...payment, status: 'success' }
}


export async function processDigitalPayment(userId, { type, target, amount, description }) {
  // 1. Cari wallet 'cash' user untuk cek saldo
  const { data: wallet, error: wErr } = await supabase
    .from('wallets')
    .select('id, balance')
    .eq('user_id', userId)
    .eq('name', 'cash')
    .single();

  if (wErr || !wallet) throw new Error('Cash wallet not found');
  if (wallet.balance < amount) throw new Error('Insufficient balance in cash wallet');

  // 2. Catat di tabel digital_payments
  const { data: dp, error: dpErr } = await supabase
    .from('digital_payments')
    .insert({ 
      user_id: userId, 
      type, 
      target, 
      amount, 
      status: 'success', 
      description 
    })
    .select()
    .single();

  if (dpErr) throw dpErr;

  // 3. Potong saldo wallet 'cash' (Debit)
  const { error: uErr } = await supabase
    .from('wallets')
    .update({ balance: wallet.balance - amount })
    .eq('id', wallet.id);

  if (uErr) throw uErr;

  // 4. Catat di ledger
  const { data: ledger, error: lErr } = await supabase
    .from('ledger')
    .insert({
      wallet_id: wallet.id,
      user_id: userId,
      amount: -amount,
      type: 'debit',
      description: `Payment: ${type} - ${description} (${target})`
    })
    .select()
    .single();

  if (lErr) throw lErr;

  // 5. Catat di transaction_history
  await supabase.from('transaction_history').insert({
    user_id: userId,
    type: 'DIGITAL_PAYMENT',
    amount: -amount,
    status: 'success',
    description: `${type} to ${target}: ${description}`,
    reference_id: dp.id
  });

  return { success: true, payment: dp };
}

export async function getStatus(paymentId) {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('id', paymentId)
    .single()

  if (error && error.code !== 'PGRST116') throw error // PGRST116 is 'no rows found'
  return data
}

export async function handleWebhook(payload) {
  // Simulation: No actual webhook needed
  return { success: true }
}

