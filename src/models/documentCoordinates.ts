import { Model, Sequelize } from "sequelize";

module.exports = (sequelize: Sequelize, DataTypes: any) => {
  class DocumentCoordinates extends Model {
    static associate(models: any) {
      DocumentCoordinates.belongsTo(models.DocumentToSign, {
        foreignKey: {
          name: "documentToSign",
        },
        targetKey: "id",
        as: "documentsToSign",
        onDelete: "CASCADE",
      });
    }
  }

  DocumentCoordinates.init(
    {
      documentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      x: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      y: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      height: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      width: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      page: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "DocumentCoordinates",
      tableName: "DocumentCoordinates",
    }
  );

  return DocumentCoordinates;
};
