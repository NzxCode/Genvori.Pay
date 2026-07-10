/*
  routes/wallet.routes.js
  -----------------------
  Route untuk fitur multi-wallet: cek saldo, mutasi, transfer antar dompet.
  Cara implementasi:
    - GET    /               -> walletController.getBalances (semua dompet user)
    - GET    /:walletId      -> walletController.getWalletDetail (dompet spesifik)
    - GET    /:walletId/transactions -> walletController.getTransactions (mutasi)
    - POST   /transfer       -> walletController.transfer (pindah dana antar dompet)
*/

import { Router } from 'express'
import {
  createWallet,
  getBalances,
  getWalletDetail,
  getTransactions,
  transfer,
  topUp,
} from '../controllers/walletController.js'
import { authenticate } from '../middlewares/authMiddleware.js'

const router = Router()

router.use(authenticate)

router.post('/', createWallet)
router.get('/', getBalances)
router.get('/:walletId', getWalletDetail)
router.get('/:walletId/transactions', getTransactions)
router.post('/transfer', transfer)
router.post('/top-up', topUp)

export default router
