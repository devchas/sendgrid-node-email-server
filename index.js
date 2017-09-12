import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import router from './router';

const app = express();

var corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true // <-- REQUIRED backend setting
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(router);

app.listen(4000, function () {
  console.log('Listening on port 4000!');
});

