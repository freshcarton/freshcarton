'use strict';
module.exports = function(sequelize, DataTypes) {
  var NewOrder = sequelize.define('NewOrder', {
     id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      name: {
        allowNull: false,
        type: DataTypes.TEXT
      },
      EmployeeId:{
          type: DataTypes.INTEGER,
          allowNull: false
      },
      CustomerId:{
          type: DataTypes.INTEGER,
          allowNull: false
      },
      CustomerDeliveryAddressBookId:{
          type: DataTypes.INTEGER,
          allowNull: false
      },
      CustomerBillingAddressBookId:{
          type: DataTypes.INTEGER,
          allowNull: false
      },
      scheduleAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      deliveryAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      status: {
        allowNull: false,
        type: DataTypes.TEXT
      },
      isdeleted:{
        type:DataTypes.INTEGER,
        allowNull:false
      },
      EmployeeSignatureImageId:{
          type: DataTypes.INTEGER,
          allowNull: false
      },
      CustomerSignatureImageId:{
          type: DataTypes.INTEGER,
          allowNull: false
      },
      TotalAmount:{
          type:DataTypes.FLOAT,
          allowNull:true,
          defaultValue:0.00,
      },
	  SettlementStatus:{
          type: DataTypes.TEXT,
          allowNull: false,
		  defaultValue:'new'
	  },
  }, {
    classMethods: {
      associate: function(models) {
          NewOrder.hasMany(models.OrderVendorItem);
          NewOrder.hasMany(models.OrderVendor, {foreignKey: 'OrderId'});
          NewOrder.belongsToMany(models.Vendor, {through:models.OrderVendor});
          NewOrder.belongsToMany(models.VendorContactAddressBook, {through:models.OrderVendor});
          NewOrder.belongsTo(models.Customer, {foreignKey:'CustomerId'});
          NewOrder.belongsTo(models.CustomerContactAddressBook, {foreignKey:'CustomerDeliveryAddressBookId'});
          NewOrder.hasMany(models.OrderPaymetDetails);
          NewOrder.hasMany(models.OrderSignature);
          NewOrder.belongsTo(models.Employee, {foreignKey:'EmployeeId'});
      }
    } 
  });
  return NewOrder;
};
