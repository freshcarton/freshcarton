'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('MarketVendors', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      MarketId:{
        type:Sequelize.INTEGER,
        allowNull:false
      },
      VendorId:{
        type:Sequelize.INTEGER,
        allowNull:false
      },
      isprimary:{
        type:Sequelize.INTEGER,
        allowNull:false,
        defaultValue:0
      },
      isdeleted:{
        type:Sequelize.INTEGER,
        allowNull:false,
        defaultValue:0
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('MarketVendors');
  }
};
