'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Meet extends Model {
    static associate({ User, Member }) {
      this.belongsToMany(User, { through: Member });
    }
    static associate({ User }) {
      // define association here
      this.belongsTo(User, { foreignKey: 'creator', as: 'user' })
    }
    toJSON() {
      return { ...this.get(), id: undefined }
    }
  }
  Meet.init(
    {
        uuid: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
        },
        meetDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        room: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        meetName: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        description: {
          type: DataTypes.STRING,
          allowNull: true,
        }
    },
    {
      sequelize,
      tableName: 'meets',
      modelName: 'Meet',
    }
  )
  return Meet
}