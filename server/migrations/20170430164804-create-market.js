'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Markets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name:{
        type:Sequelize.TEXT
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      isdeleted: {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue:0
      }      
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('Markets');
  }
};