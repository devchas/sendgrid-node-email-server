const router = require('express').Router();
import db from './db';
import { 
  createSeries,
  getAllSeries,
  getSeries, 
  updateSeriesLabel, 
  deleteSeries, 
  createStageAndAddToSeries,
  updateStage,
  deleteStage,
  getSeriesUsers,
  createUserSeries,
  stopUserSeries,
  getSGTemplates
} from './controllers/email-series';

// Create a new email series (including stages, if provided)
router.post('/series', createSeries);

// Get basic info for all series
router.get('/series', getAllSeries);

// Get series info with associated stage data
router.get('/series/:id', getSeries);

// Update a series label
router.put('/series/label', updateSeriesLabel);

// Delete a series
router.delete('/series', deleteSeries);

// Create an individual stage and add to email series
router.post('/series/stage', createStageAndAddToSeries);

// Update an individual stage
router.put('/series/stage', updateStage);

// Delete stage by ID
router.delete('/series/stage', deleteStage);

// Get a list of users subscribed to a given series
router.get('/series/users/:emailSeryId', getSeriesUsers);

// Sign a user up for a series
router.post('/series/user', createUserSeries);

// End a user series
router.put('/series/user/stop', stopUserSeries);

// Get SendGrid Templates
router.get('/templates', getSGTemplates);

export default router;
