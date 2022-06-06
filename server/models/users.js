'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate({ Meet, Member }) {
        this.belongsToMany(Meet, { through: Member });
      }
    toJSON() {
        return { ...this.get(), id: undefined }
    }
  }
  User.init(
    {
        uuid: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: { msg: 'User must have a email' },
                notEmpty: { msg: 'email must not be empty' },
                isEmail: { msg: 'Must be a valid email address' },
            },
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "BASIC",
            validate: {
                notNull: { msg: 'User must have a role' },
                notEmpty: { msg: 'role must not be empty' },
            },
        }
      
        
        },
        {
        sequelize,
        tableName: 'users',
        modelName: 'User',
    }
  )
  return User
}