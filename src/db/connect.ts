import db from "../models";

const connectDB = async () => {
  await db.sequelize.sync({ force: false });
  return db.sequelize.authenticate();
};

export default connectDB;
