const router = require('express').Router();
const db = require('./db');

// Create a new email series (including stages)
router.post('/series/new', (req, res) => {
  const { body: { series: { label, stages } } } = req;

  db.models.emailSeries.findOrCreate({ 
    where: { label } 
  }).then((emailSeries, created) => {
    if (!created) { throw new Error('Email series already exists'); }

    createStages(stages.length, emailSeries.id, 0, () => {
      res.send(emailSeries);
    });
  });
});

function createStages(stages, emailSeryId, i=0, callback) {
  if (i == stages.lenth) { return callback(); }

  const { label, daysToSend, sgTemplateID } = stages[i];

  db.models.seriesStage.create({ label, daysToSend, sgTemplateID, emailSeryId }).then(stage => {
    i++;
    createStages(stages, emailSeryId, i, callback);
  });
}

// Update a series label
router.put('/series', (req, res) {
  const { body: { series: { id, label } } } = req;
  if (!id || !label) { throw new Error('Missing ID or Label'); }

  db.models.findById(id).then(series => {
    series.update({ label }).then(() => {
      res.send(series);
    });
  });
});

// Delete a series
router.delete('/series', (req, res) {
  const { body: { series: { id } } } = req;
  if (!id) { throw new Error("Missing required param ID"); }

  db.models.findById(id).then(series => {
    series.destroy({ force: true }).then(() => {
      res.json({ DELETED: series });
    });
  });  
});

// Create an individual stage and add to email series
router.post('/series/stage', (req, res) => {
  const { body: { emailSeryId, label, daysToSend, sgTemplateID } } = req;
  if (!emailSeryId || !label || !daysToSend || !sgTemplateID) {
    throw new Error('Missing requried parameter emailSeryId, abel, daysToSend or sgTemplateID');
  }

  db.models.seriesStage.create({ label, daysToSend, sgTemplateID, emailSeryId }).then(stage => {
    res.send(stage);
  });
});

// Update an individual stage
router.put('/series/stage', (req, res) {
  const { body: { id, label, daysToSend, sgTemplateID } } = req;
  if (!id) { throw new Error('Missing requried parameter id'); }

  db.models.seriesStage.findById(id).then(stage => {
    stage.update({
      label: label || stage.label,
      daysToSend: daysToSend || stage.daysToSend,
      sgTemplateID: sgTemplateID || stage.sgTemplateID
    }).then(() => {
      res.send(stage);
    });
  });
});

// Delete stage by ID
router.delete('/series/stage', (req, res) {
  const { body: { id } } = req;
  if (!id) { throw new Error('Missing requried parameter id'); }  

  db.models.seriesStage.findById(id).then(stage => {
    stage.destroy({ force: true }).then(() => {
      res.json({ DELETED: stage });
    });
  });
});

router.post('/series/user', (req, res) => {
  const { body: { userId, seriesId } } = req;
  if (!userId || !seriesName) { 
    throw new Error('Missing required param: userId or seriesName'); 
  }

  db.models.userSeries.findOrCreate({ where: 
    { userId, emailSeryId: seriesId },
    { defaults: { startDate: new Date() } }
  }).then((userSeries, created) => {
    if (!created) { throw new Error('User already registed to receive series'); }
    res.send(userSeries);
  });
});

router.patch('/series/stop', (req, res) => {
  const { body: { seriesId, stopEmails } } = req;
  if (!seriesId) { throw new Error('Missing required seriesId'); }
  
  db.models.userSeries.findById(seriesId).then(series => {
    series.update({ stopEmails }).then(() => {
      res.send(series);
    });
  });
});

export default router;
