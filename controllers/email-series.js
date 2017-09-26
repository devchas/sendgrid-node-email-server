import db from '../db';
var sg = require('sendgrid')(process.env.SG_API_KEY);

// POST /series
export const createSeries = (req, res) => {
  const { body: { series: { label, stages } } } = req;

  db.models.emailSeries.findOne({ where: { label } }).then(existingSeries => {
    if (existingSeries) { throw new Error('Email series already exists'); }

    db.models.emailSeries.create({ label }).then(newSeries => {
      const stagesToAdd = (stages) ? stages : [];

      createStages(stagesToAdd, newSeries.id, 0, () => {
        res.send({ emailSeries: newSeries });
      });
    });
  });  
};

function createStages(stages, emailSeryId, i=0, callback) {
  if (i == stages.length) { return callback(); }

  const { label, daysToSend, sgTemplateID } = stages[i];

  db.models.seriesStage.create({ label, daysToSend, sgTemplateID, emailSeryId }).then(stage => {
    i++;
    createStages(stages, emailSeryId, i, callback);
  });
}

// GET /series
export const getAllSeries = (req, res) => {
  db.models.emailSeries.findAll().then(allSeries => {
    getAllSeriesStages(allSeries, 0, [], allSeriesWithStages => {
      res.send(allSeriesWithStages);
    });
  });
}

function getAllSeriesStages(series, i=0, result=[], callback) {
  if (i === series.length) { return callback(result); }

  getSeriesWithStages(series[i], seriesWithStages => {
    result.push(seriesWithStages);
    i++;
    getAllSeriesStages(series, i, result, callback);
  });
}

// GET /series/<id>
export const getSeries = (req, res) => {
  const { params: { id } } = req;
  if (!id) { throw new Error('Missing required param: id'); }

  console.log('ID: ', id);

  db.models.emailSeries.findById(id).then(emailSeries => {
    if (!emailSeries) { throw new Error('Series does not exist'); }

    getSeriesWithStages(emailSeries, series => {
      res.send(series);
    });
  });
};

function getSeriesWithStages(series, callback) {
  series.getStages().then(seriesStages => {
    const stages = seriesStages.map(({ id, label, daysToSend, sgTemplateID }) => {
      return { id, label, daysToSend, sgTemplateID };
    });

    const { id, label } = series;
    callback({ id, label, stages });
  });
}

// PUT /series/label
export const updateSeriesLabel = (req, res) => {
  const { body: { id, label } } = req;
  if (!id || !label) { throw new Error('Missing ID or Label'); }

  db.models.emailSeries.findById(id).then(series => {
    series.update({ label }).then(() => {
      res.send(series);
    });
  });
};

// DELETE /series
export const deleteSeries = (req, res) => {
  const { body: { id } } = req;
  if (!id) { throw new Error("Missing required param ID"); }

  db.models.emailSeries.findById(id).then(series => {
    series.destroy({ force: true }).then(() => {
      res.json({ DELETED: series });
    });
  }); 
};

// POST /series/stage
export const createStageAndAddToSeries = (req, res) => {
  const { body: { emailSeryId, label, daysToSend, sgTemplateID } } = req;
  if (!emailSeryId || !label || !daysToSend || !sgTemplateID) {
    throw new Error('Missing requried parameter emailSeryId, label, daysToSend or sgTemplateID');
  }

  db.models.seriesStage.create({ label, daysToSend, sgTemplateID, emailSeryId }).then(stage => {
    res.send(stage);
  });  
};

// PUT /series/stage
export const updateStage = (req, res) => {
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
};

// DELETE /series/stage
export const deleteStage = (req, res) => {
  const { body: { id } } = req;
  if (!id) { throw new Error('Missing requried parameter id'); }  

  db.models.seriesStage.findById(id).then(stage => {
    if (!stage) { throw new Error('Invalid series stage ID'); }

    stage.destroy({ force: true }).then(() => {
      res.send(stage);
    });
  });
};

// GET /series/users/<emailSeryId>
export const getSeriesUsers = (req, res) => {
  const { params: { emailSeryId } } = req;

  db.models.userSeries.findAll({ where: { emailSeryId, stopEmails: false } }).then(userSeries => {
    getUsersFromUserSeries(userSeries, 0, [], users => {
      res.send(users);
    });
  });
};

function getUsersFromUserSeries(userSeries, i=0, outputSeries=[], callback) {
  if (i == userSeries.length) { return callback(outputSeries); }

  const { startDate } = userSeries[i];

  const userId = userSeries[i].userId;
  db.models.user.findById(userId).then(({ id, email, firstName, lastName }) => {
    outputSeries.push({ id, email, firstName, lastName, startDate });
    i++;
    getUsersFromUserSeries(userSeries, i, outputSeries, callback);
  });
}

// POST /series/user
export const createUserSeries = (req, res) => {
  const { body: { userId, emailSeryId } } = req;
  if (!userId || !emailSeryId) { 
    throw new Error('Missing required param: userId or emailSeryId'); 
  }

  db.models.userSeries.find({ where: { userId, emailSeryId } }).then((existingSeries) => {
    if (existingSeries) { throw new Error('User is already registed to receive series'); }
    
    const startDate = new Date();
    db.models.userSeries.create({ userId, emailSeryId, startDate }).then(userSeries => {
      res.send(userSeries);
    });
  });
};

// POST /series/user
export const stopUserSeries = (req, res) => {
  const { body: { userId, emailSeryId, stopEmails } } = req;
  if (!userId || !emailSeryId || !stopEmails) { 
    throw new Error('Missing required params userId, emailSeryId, or stopEmails'); 
  }
  
  db.models.userSeries.findOne({ where: { userId, emailSeryId } }).then(series => {
    if (!series) { throw  new Error('userSeries does not exist'); }

    series.update({ stopEmails }).then(() => {
      res.send(series);
    });
  });
};

// GET /templates
export const getSGTemplates = (req, res) => {
  var request = sg.emptyRequest({
    method: 'GET',
    path: '/v3/templates',
  });  

  sg.API(request, (error, response) => {
    if (error) {
      console.log('Error response received', error.response.body.errors[0]);
      throw new Error(error.response.body.errors[0]);
    }
    res.send(response.body);
  });  
};
