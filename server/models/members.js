'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Member extends Model {
      
    toJSON() {
        return { ...this.get(), id: undefined }
    }
  }
  Member.init(
    {
        moderator: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: 0,
        }
        },
        {
        sequelize,
        tableName: 'members',
        modelName: 'Member',
    }
  )
  return Member
}