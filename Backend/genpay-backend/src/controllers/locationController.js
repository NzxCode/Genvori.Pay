/*
  controllers/locationController.js
  -------------------------------
  Menangani request update lokasi dari frontend.
*/

import * as locationService from '../services/locationService.js'

export async function updateLocation(req, res, next) {
  try {
    const { latitude, longitude, accuracy, address } = req.body;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ success: false, message: 'Latitude and Longitude are required' });
    }

    const result = await locationService.updateLocation(req.user.id, { 
      latitude, 
      longitude, 
      accuracy, 
      address 
    });

    res.status(200).json({ 
      success: true, 
      message: 'Location updated successfully', 
      data: result 
    });
  } catch (error) {
    next(error);
  }
}
