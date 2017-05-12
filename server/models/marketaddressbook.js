'use strict';
module.exports = function(sequelize, DataTypes) {
  var MarketAddressBook = sequelize.define('MarketAddressBook', {
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
      addressline1:{
          type:DataTypes.TEXT,
          allowNull:true,
          notEmpty: true,
          validate: {
              is: ["^[a-zA-Z0-9 \-\\\/\#\.]+$", 'i']
          }
      },
      addressline2:{
          type:DataTypes.TEXT,
          allowNull:true,
      },
      street:{
          type:DataTypes.TEXT,
          allowNull:true,
          validate: {
              is: ["^[a-zA-Z0-9 \-\\\/\#\.]+$", 'i']
          }
      },
      city:{
          type:DataTypes.STRING,
          allowNull:true,
          validate: {
              is: ["^[a-zA-Z ]+$", 'i']
          }
      },
      country:{
          type:DataTypes.STRING,
          allowNull:true,
          validate: {
              is: ["^[a-zA-Z ]+$", 'i']
          }
      },
      zipcode:{
          type:DataTypes.STRING,
          allowNull:true,
          validate: {
              is: ["^[a-zA-Z0-9 \-]+$", 'i']
          }
      },
      email:{
          type:DataTypes.STRING,
          allowNull:true,
          defaultValue:'na@default',
      },
      phone:{
          type:DataTypes.STRING,
          allowNull:true,
          defaultValue:'0000000000'
      },
      latitude:{
        type:DataTypes.FLOAT,
        allowNull:true
      },
      longitude:{
        type:DataTypes.FLOAT,
        allowNull:true
      },
      formattedaddress:{
        type:DataTypes.TEXT,
        allowNull:true
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
      }
  }, {
    classMethods: {
      associate: function(models) {
      }
    }
  });
  return MarketAddressBook;
};