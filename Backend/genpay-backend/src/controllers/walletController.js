import * as walletService from '../services/walletService.js'

export async function createWallet(req, res, next) {
  try {
    const { name } = req.body
    if (!name) {
      return res.status(400).json({ success: false, message: 'Wallet name is required' })
    }
    const result = await walletService.createWallet(req.user.id, { name })
    res.status(201).json({ success: true, data: result })
  } catch (error) {
    next(error)
  }
}

export async function getBalances(req, res, next) {
  try {
    const balances = await walletService.getBalances(req.user.id)
    res.status(200).json({ success: true, data: balances })
  } catch (error) {
    next(error)
  }
}

export async function getWalletDetail(req, res, next) {
  try {
    const { walletId } = req.params
    const detail = await walletService.getWalletDetail(walletId, req.user.id)
    res.status(200).json({ success: true, data: detail })
  } catch (error) {
    next(error)
  }
}

export async function getTransactions(req, res, next) {
  try {
    const { walletId } = req.params
    const filters = req.query
    const transactions = await walletService.getTransactions(walletId, req.user.id, filters)
    res.status(200).json({ success: true, data: transactions })
  } catch (error) {
    next(error)
  }
}

export async function transfer(req, res, next) {
  try {
    const { fromAccountNumber, toAccountNumber, amount, description } = req.body
    if (!fromAccountNumber || !toAccountNumber || !amount) {
      return res.status(400).json({ success: false, message: 'Missing required fields' })
    }
    const result = await walletService.transfer(req.user.id, { fromAccountNumber, toAccountNumber, amount, description })
    res.status(200).json({ success: true, message: result.message })
  } catch (error) {
    next(error)
  }
}

export async function topUp(req, res, next) {
  try {
    const { walletName, amount, description } = req.body
    if (!walletName || !amount) {
      return res.status(400).json({ success: false, message: 'walletName and amount are required' })
    }
    const result = await walletService.topUp(req.user.id, { walletName, amount, description })
    res.status(200).json({ success: true, message: result.message })
  } catch (error) {
    next(error)
  }
}
