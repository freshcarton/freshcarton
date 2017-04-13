'use strict';
module.exports = function(sequelize, DataTypes) {
  var Order = sequelize.define('Order', {
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
      OrderAmount:{
          type:DataTypes.FLOAT,
          allowNull:true,
          defaultValue:0.00,
      },
      TaxAmount:{
          type:DataTypes.FLOAT,
          allowNull:true,
          defaultValue:0.00,
      },
      TipAmount:{
          type:DataTypes.FLOAT,
          allowNull:true,
          defaultValue:0.00,
      },
	  BT_Payment_Nounce:{
          type:DataTypes.TEXT,
          allowNull:false,
          defaultValue:"none",
	  },
	  BT_Transaction_Status:{
          type:DataTypes.TEXT,
          allowNull:false,
          defaultValue:"none",
	  },
	  SettlementStatus:{
          type: DataTypes.TEXT,
          allowNull: false,
		  defaultValue:'new'	
	  },	
  }, {
    classMethods: {
      associate: function(models) {
          Order.hasMany(models.OrderVendorItem);
          Order.hasMany(models.OrderVendor);
          Order.belongsToMany(models.Vendor, {through:models.OrderVendor});
          Order.belongsToMany(models.VendorContactAddressBook, {through:models.OrderVendor});
          Order.belongsTo(models.Customer, {foreignKey:'CustomerId'});
          Order.belongsTo(models.CustomerContactAddressBook, {foreignKey:'CustomerDeliveryAddressBookId'});
          Order.hasMany(models.OrderPaymetDetails);
          Order.hasMany(models.OrderSignature);
          Order.belongsTo(models.Employee, {foreignKey:'EmployeeId'});
      }
    }
  });
  return Order;
};