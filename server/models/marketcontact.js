'use strict';
module.exports = function(sequelize, DataTypes) {
  var MarketContact = sequelize.define('MarketContact', {
      id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: DataTypes.INTEGER
      },
      MarketId:{
        type: DataTypes.INTEGER,
        allowNull:false
      },      
      name:{
          type:DataTypes.TEXT,
          allowNull: false,
          validate: {
              notEmpty: true,
              is: ["^[a-zA-Z0-9 \-\\\/\#\.]+$", 'i']
          }
      },
      isprimary:{
        type:DataTypes.INTEGER,
        allowNull:false,
        defaultValue:0
      },
      isdeleted:{
        type:DataTypes.INTEGER,
        allowNull:false,
        defaultValue:0
      },

  }, {
    classMethods: {
      associate: function(models) {
      }
    }
  });
  return MarketContact;
};