import { Model, Sequelize } from "sequelize";

module.exports = (sequelize: Sequelize, DataTypes: any) => {
  class DocumentToSign extends Model {
    static associate(models: any) {
      DocumentToSign.hasMany(models.DocumentCoordinates, {
        foreignKey: {
          name: "documentToSign",
        },
        sourceKey: "id",
        as: "documentsToSign",
        onDelete: "CASCADE",
      });

      DocumentToSign.hasMany(models.SignedDocument, {
        foreignKey: {
          name: "signedDocument",
        },
        sourceKey: "id",
        as: "signedDocuments",
        onDelete: "CASCADE",
      });
    }
  }

  DocumentToSign.init(
    {
      ownerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      s3Key: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "DocumentToSign",
      tableName: "DocumentToSign",
    }
  );

  return DocumentToSign;
};
