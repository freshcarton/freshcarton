'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
<<<<<<< HEAD
    return queryInterface.createTable('ProductRecommendations', {
=======
    return queryInterface.createTable('ProductRecommendation', {
>>>>>>> 4240e34b80b48e6a653bae38bf45e279953df1c9
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ProductId:{
        type:Sequelize.INTEGER,
        allowNull:false
      },
      LinkProductId:{
        type:Sequelize.INTEGER,
        allowNull:false
      },
      isdeleted:{
        type:Sequelize.INTEGER,
        allowNull:false
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
  down: function(queryInterface, Sequelize) {
<<<<<<< HEAD
    return queryInterface.dropTable('ProductRecommendations');
=======
    return queryInterface.dropTable('ProductRecommendation');
>>>>>>> 4240e34b80b48e6a653bae38bf45e279953df1c9
  }
};