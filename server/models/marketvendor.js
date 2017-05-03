/**
 * Created by kiran on 12/16/15.
 */
'use strict';
module.exports = function(sequelize, DataTypes) {
  var MarketVendor = sequelize.define('MarketVendor', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    MarketId:{
      type:DataTypes.INTEGER,
      allowNull:false
    },
    VendorId:{
      type:DataTypes.INTEGER,
      allowNull:false
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
        MarketVendor.belongsTo(models.Vendor);
        MarketVendor.belongsTo(models.Market);
      }
    }
  });
  return MarketVendor;
};
