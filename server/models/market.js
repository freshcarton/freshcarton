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
      },
      business_on_sunday:{
          type:DataTypes.INTEGER,
          defaultValue:0
      },
      business_on_monday:{
          type:DataTypes.INTEGER,
          defaultValue:0
      },
      business_on_tuesday:{
          type:DataTypes.INTEGER,
          defaultValue:0
      },
      business_on_wednesday:{
          type:DataTypes.INTEGER,
          defaultValue:0
      },
      business_on_thrusday:{
          type:DataTypes.INTEGER,
          defaultValue:0
      },
      business_on_friday:{
          type:DataTypes.INTEGER,
          defaultValue:0
      },
      business_on_saturday:{
          type:DataTypes.INTEGER,
          defaultValue:0
      },
      business_from_time:{
          type:DataTypes.FLOAT,
          defaultValue:7.0
      },
      business_to_time:{
          type:DataTypes.INTEGER,
          defaultValue:16.0
      },
      delivery_on_sunday:{
          type:DataTypes.INTEGER,
          defaultValue:0
      },
      delivery_on_monday:{
          type:DataTypes.INTEGER,
          defaultValue:0
      },
      delivery_on_tuesday:{
          type:DataTypes.INTEGER,
          defaultValue:0
      },
      delivery_on_wednesday:{
          type:DataTypes.INTEGER,
          defaultValue:0
      },
      delivery_on_thrusday:{
          type:DataTypes.INTEGER,
          defaultValue:0
      },
      delivery_on_friday:{
          type:DataTypes.INTEGER,
          defaultValue:0
      },
      delivery_on_saturday:{
          type:DataTypes.INTEGER,
          defaultValue:0
      },
      delivery_from_time:{
          type:DataTypes.FLOAT,
          defaultValue:7.0
      },
      delivery_to_time:{
          type:DataTypes.INTEGER,
          defaultValue:16.0
      },      
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