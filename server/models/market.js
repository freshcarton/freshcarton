'use strict';
module.exports = function(sequelize, DataTypes) {
  var Market = sequelize.define('Market', {
      id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: DataTypes.INTEGER
      },
      name:{
          type:DataTypes.TEXT,
          allowNull: false,
          validate: {
              notEmpty: true,
              is: ["^[a-zA-Z0-9 \-\\\/\#\.]+$", 'i']
          }
      }
  }, {
    classMethods: {
      associate: function(models) {
          Market.hasMany(models.MarketContact,{onDelete: 'cascade', hooks: true });
          Market.hasMany(models.MarketAddressBook,{onDelete: 'cascade', hooks: true });
          Market.hasMany(models.MarketVendor,{onDelete: 'cascade', hooks: true });
      }
    }
  });
  return Market;
};