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
<<<<<<< HEAD
      },
      isdeleted: {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue:0
      }      
=======
      }
>>>>>>> 4240e34b80b48e6a653bae38bf45e279953df1c9
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('Markets');
  }
};