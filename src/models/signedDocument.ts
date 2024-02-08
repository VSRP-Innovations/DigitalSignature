import { Model, Sequelize } from "sequelize";

module.exports = (sequelize: Sequelize, DataTypes: any) => {
  class SignedDocument extends Model {
    static associate(models: any) {
      SignedDocument.belongsTo(models.DocumentToSign, {
        foreignKey: {
          name: "signedDocument",
        },
        targetKey: "id",
        as: "signedDocuments",
        onDelete: "CASCADE",
      });
    }
  }

  SignedDocument.init(
    {
      s3Key: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "SignedDocument",
      tableName: "SignedDocument",
    }
  );

  return SignedDocument;
};
