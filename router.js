const router = require('express').Router();
import db from './db';
import { 
  createSeries, 
  updateSeriesLabel, 
  deleteSeries, 
  createStageAndAddToSeries,
  updateStage,
  deleteStage,
  createUserSeries,
  stopUserSeries
} from './controllers/email-series';

// Create a new email series (including stages)
router.post('/series', createSeries);

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

// Sign a user up for a series
router.post('/series/user', createUserSeries);

// End a user series
router.put('/series/user/stop', stopUserSeries);

export default router;
