'use strict';

module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('NewOrders', {
     id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        allowNull: false,
        type: Sequelize.TEXT
      },         
      EmployeeId:{
          type: Sequelize.INTEGER,
          allowNull: false          
      },        
      CustomerId:{
          type: Sequelize.INTEGER,
          allowNull: false
      },
      CustomerDeliveryAddressBookId:{
          type: Sequelize.INTEGER,
          allowNull: false          
      }, 
      CustomerBillingAddressBookId:{
          type: Sequelize.INTEGER,
          allowNull: false          
      },
      scheduleAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deliveryAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      status: {
        allowNull: false,
        type: Sequelize.TEXT
      },          
      isdeleted:{
        type:Sequelize.INTEGER,
        allowNull:false
      },
      EmployeeSignatureImageId:{
          type: Sequelize.INTEGER,
          allowNull: false            
      },    
      CustomerSignatureImageId:{
          type: Sequelize.INTEGER,
          allowNull: false            
      },
      TotalAmount:{
          type:Sequelize.FLOAT,
          allowNull:true,
          defaultValue:0.00,
      },
	  SettlementStatus:{
          type: Sequelize.TEXT,
          allowNull: false,
		  defaultValue:'new'	
	  }
    
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('Orders');
  }

};
