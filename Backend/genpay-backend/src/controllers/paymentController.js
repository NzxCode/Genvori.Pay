import * as paymentService from '../services/paymentService.js'

export async function charge(req, res, next) {
  try {
    const { amount, projectId, description } = req.body
    if (!amount) {
      return res.status(400).json({ success: false, message: 'Amount is required' })
    }

    const result = await paymentService.createTransaction(req.user.id, { 
      amount, 
      projectId, 
      description 
    })

    res.status(201).json({ 
      success: true, 
      message: 'Payment processed successfully (Simulated)', 
      data: result 
    })
  } catch (error) {
    next(error)
  }
}

export async function processDigitalPayment(req, res, next) {
  try {
    const { type, target, amount, description } = req.body;
    if (!type || !target || !amount) {
      return res.status(400).json({ success: false, message: 'Type, target, and amount are required' });
    }

    const result = await paymentService.processDigitalPayment(req.user.id, { 
      type, 
      target, 
      amount, 
      description: description || `Top up ${type}` 
    });

    res.status(200).json({ 
      success: true, 
      message: `${type} payment processed successfully (Simulated)`, 
      data: result 
    });
  } catch (error) {
    next(error);
  }
}

export async function webhook(req, res, next) {
  // In simulation mode, we don't expect actual Midtrans webhooks.
  // But we keep the endpoint for compatibility.
  try {
    res.status(200).json({ success: true, message: 'Webhook received (Simulated)' })
  } catch (error) {
    next(error)
  }
}

export async function getStatus(req, res, next) {
  try {
    const { paymentId } = req.params
    const status = await paymentService.getStatus(paymentId)
    
    if (!status) {
      return res.status(404).json({ success: false, message: 'Payment not found' })
    }

    res.status(200).json({ success: true, data: status })
  } catch (error) {
    next(error)
  }
}
