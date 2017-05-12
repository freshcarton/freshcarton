'use strict';
module.exports = function(sequelize, DataTypes) {
  var Vendor = sequelize.define('Vendor', {
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
      isdeleted:{
        type:DataTypes.INTEGER,
        defaultValue:0
      }
  }, {
    classMethods: {
      associate: function(models) {
          Vendor.hasMany(models.VendorContact,{onDelete: 'cascade', hooks: true });
          Vendor.hasMany(models.VendorAddressBook,{onDelete: 'cascade', hooks: true });
          Vendor.belongsToMany(models.Product, {through:models.ProductVendor});
          Vendor.belongsToMany(models.Market, {through:models.MarketVendor});          
      }
    }
  });
  return Vendor;
};
