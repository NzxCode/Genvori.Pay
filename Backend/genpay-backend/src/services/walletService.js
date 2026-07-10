/*
  services/walletService.js
  -------------------------
  Logika bisnis untuk multi-wallet: ledger, transfer, tax allocation, aggregation.
*/

import { supabase } from '../config/supabase.js'
import * as notificationService from './notificationService.js'

function generateAccountNumber() {
  return Math.floor(100000000000 + Math.random() * 900000000000).toString();
}

export async function createWallet(userId, { name }) {
  // 1. Cek apakah wallet dengan nama yang sama sudah ada untuk user ini
  const { data: existing, error: checkErr } = await supabase
    .from('wallets')
    .select('id')
    .eq('user_id', userId)
    .eq('name', name)
    .single()

  if (checkErr && checkErr.code !== 'PGRST116') throw checkErr
  if (existing) throw new Error('Wallet with this name already exists')

  // 2. Create new wallet
  const { data, error } = await supabase
    .from('wallets')
    .insert({ user_id: userId, name, balance: 0, account_number: generateAccountNumber() })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getBalances(userId) {
  const { data, error } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId)

  if (error) throw error
  return data
}

export async function topUp(userId, { walletName, amount, description }) {
  if (amount <= 0) throw new Error('Top-up amount must be greater than 0')
  
  console.log(`[WalletService] Starting topUp for user ${userId}`);
  // Memanggil fungsi creditWallet yang sudah ada untuk menambahkan saldo dan mencatat ledger
  await creditWallet(userId, walletName, amount, description || 'Wallet Top-up')
  
  // Catat di transaction_history
  await supabase.from('transaction_history').insert({
    user_id: userId,
    type: 'TOPUP',
    amount: amount,
    status: 'success',
    description: `${description || 'Wallet Top-up'} to ${walletName} wallet`
  });

  console.log(`[WalletService] Triggering notification for topUp...`);
  try {
    await notificationService.createNotification(userId, {
      title: 'Top-up Berhasil',
      message: `Saldo sebesar ${amount} telah berhasil ditambahkan ke wallet ${walletName}.`,
      type: 'success'
    });
    console.log(`[WalletService] Notification trigger successful`);
  } catch (notifErr) {
    console.error(`[WalletService] Notification trigger failed:`, notifErr);
    // We don't throw here so the topUp still returns success to the user
  }
  
  return { success: true, message: `Successfully topped up ${amount} to ${walletName} wallet` }
}


export async function creditWallet(userId, walletName, amount, description) {
  // 1. Cari wallet berdasarkan user_id dan name
  let { data: wallet, error: wErr } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId)
    .eq('name', walletName)
    .single()

  // 2. Jika wallet tidak ditemukan, buat wallet baru secara otomatis
  if (wErr && wErr.code === 'PGRST116') {
    const { data: newWallet, error: createErr } = await supabase
      .from('wallets')
      .insert({ user_id: userId, name: walletName, balance: 0, account_number: generateAccountNumber() })
      .select()
      .single()

    if (createErr) throw createErr
    wallet = newWallet
  } else if (wErr) {
    throw wErr
  }

  // 3. Update balance
  const { error: uErr } = await supabase
    .from('wallets')
    .update({ balance: wallet.balance + parseFloat(amount) })
    .eq('id', wallet.id)

  if (uErr) throw uErr

  // 4. Catat di ledger
  const { error: lErr } = await supabase
    .from('ledger')
    .insert({
      wallet_id: wallet.id,
      user_id: userId,
      amount: amount,
      type: 'credit',
      description
    })
  
  if (lErr) throw lErr
}


export async function getWalletDetail(walletId, userId) {
  const { data, error } = await supabase
    .from('wallets')
    .select('*')
    .eq('id', walletId)
    .eq('user_id', userId)
    .single()

  if (error) throw error
  return data
}

export async function getTransactions(walletId, userId, filters = {}) {
  const page = parseInt(filters.page) || 1
  const limit = parseInt(filters.limit) || 10
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('ledger')
    .select('*', { count: 'exact' })
    .eq('wallet_id', walletId)
    .eq('user_id', userId)
    .range(from, to)
    .order('created_at', { ascending: false })

  if (filters.startDate) {
    query = query.gte('created_at', filters.startDate)
  }
  if (filters.endDate) {
    query = query.lte('created_at', filters.endDate)
  }

  const { data, error, count } = await query

  if (error) throw error

  return {
    data,
    total: count,
    page,
    limit
  }
}

export async function transfer(userId, { fromAccountNumber, toAccountNumber, amount, description }) {
  if (amount <= 0) throw new Error('Amount must be greater than 0')
  if (fromAccountNumber === toAccountNumber) throw new Error('Source and destination wallets must be different')

  // 1. Cari wallet asal berdasarkan account number dan user_id
  const { data: fromWallet, error: fromErr } = await supabase
    .from('wallets')
    .select('id, balance')
    .eq('account_number', fromAccountNumber)
    .eq('user_id', userId)
    .single()

  if (fromErr || !fromWallet) throw new Error('Source wallet not found or access denied')
  if (fromWallet.balance < amount) throw new Error('Insufficient balance')

  // 2. Cari wallet tujuan berdasarkan account number
  const { data: toWallet, error: toErr } = await supabase
    .from('wallets')
    .select('id, balance, user_id')
    .eq('account_number', toAccountNumber)
    .single()

  if (toErr || !toWallet) throw new Error('Destination wallet not found')

  // 3. Execute transfer
  // Debit from A
  const { error: debitErr } = await supabase
    .from('wallets')
    .update({ balance: fromWallet.balance - amount })
    .eq('id', fromWallet.id)

  if (debitErr) throw debitErr

  const { data: fromLedger } = await supabase.from('ledger').insert({
    wallet_id: fromWallet.id,
    user_id: userId,
    amount: -amount,
    type: 'debit',
    description: description || 'Transfer'
  }).select().single();

  // Credit to B
  const { error: creditErr } = await supabase
    .from('wallets')
    .update({ balance: toWallet.balance + amount })
    .eq('id', toWallet.id)

  if (creditErr) throw creditErr

  const { data: toLedger } = await supabase.from('ledger').insert({
    wallet_id: toWallet.id,
    user_id: toWallet.user_id,
    amount: amount,
    type: 'credit',
    description: description || 'Transfer'
  }).select().single();

  // 4. Catat di transaction_history (Pengirim)
  await supabase.from('transaction_history').insert({
    user_id: userId,
    type: 'TRANSFER',
    amount: -amount,
    status: 'success',
    description: `Transfer to ${toAccountNumber}: ${description || 'Transfer'}`,
    reference_id: fromLedger?.id
  });

  // 5. Catat di transaction_history (Penerima)
  await supabase.from('transaction_history').insert({
    user_id: toWallet.user_id,
    type: 'TRANSFER',
    amount: amount,
    status: 'success',
    description: `Received transfer from ${fromAccountNumber}: ${description || 'Transfer'}`,
    reference_id: toLedger?.id
  });

  return { success: true, message: 'Transfer completed successfully' }
}
