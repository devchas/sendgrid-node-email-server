const local = {
  host: 'localhost',
  db: 'email_series',
  user: 'devinchasanoff',
  password: 'password',
};

const localDocker = {
  host: 'psql',
  db: 'email_series',
  user: 'devinchasanoff',
  password: 'password',
};

const production = {
  host: 'psql',
  db: 'email_series',
  user: 'devinchasanoff',
  password: process.env.SG_SERIES_PW
}

let config;

switch (process.env.NODE_ENV) {
  case 'local':
    config = local;
  case 'localDocker':
    config = localDocker;
  case 'production':
    config = production;
  default:
    config = local;
}

export default config;