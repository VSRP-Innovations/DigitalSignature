"use strict";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { Sequelize, DataTypes } from "sequelize";

dotenv.config();
const basename: string = path.basename(__filename);
const db: any = {};

let sequelize = new Sequelize({ dialect: "sqlite", storage: "../db.sqlite" });

fs.readdirSync(__dirname)
  .filter((file: string): boolean => {
    return (
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".ts"
    );
  })
  .forEach((file: string): void => {
    const model = require(path.join(__dirname, file))(sequelize, DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName: string): void => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
