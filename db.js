import Sequelize from 'sequelize';
import config from './config';

const Conn = new Sequelize(config.db, config.user, config.password, {
  dialect: 'postgres',
  host: config.host
});

const User = Conn.define('user', {
  email: { type: Sequelize.STRING, allowNull: false },
  firstName: { type: Sequelize.STRING },
  lastName: { type: Sequelize.STRING }
});

const EmailSeries = Conn.define('emailSeries', {
  label: { type: Sequelize.STRING, allowNull: false }
});

const SeriesStage = Conn.define('seriesStage', {
  label: { type: Sequelize.STRING, allowNull: false },
  daysToSend: { type: Sequelize.INTEGER, allowNull: false },
  sgTemplateID: { type: Sequelize.STRING, allowNull: false }
});

const UserSeries = Conn.define('userSeries', {
  stopEmails: { type: Sequelize.BOOLEAN, defaultValue: false, allowNull: false },
  startDate: { type: Sequelize.DATE, allowNull: false }
});

User.belongsToMany(EmailSeries, { through: UserSeries });
EmailSeries.belongsToMany(User, { through: UserSeries });

EmailSeries.hasMany(SeriesStage, { as: 'Stages' });
SeriesStage.belongsTo(EmailSeries);

export default Conn;