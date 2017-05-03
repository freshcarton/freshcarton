/**
 * Created by kiran on 12/16/15.
 */
'use strict';
module.exports = function(sequelize, DataTypes) {
  var ProductRecommendation = sequelize.define('ProductRecommendation', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      ProductId:{
        type:DataTypes.INTEGER,
        allowNull:false
      },
      LinkProductId:{
        type:DataTypes.INTEGER,
        allowNull:false
      },
      isdeleted:{
        type:DataTypes.INTEGER,
        allowNull:false,
        defaultValue:0
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      }
  }, {
    classMethods: {
      associate: function(models) {
          ProductRecommendation.belongsTo(models.Product,{foreignKey: 'LinkProductId'});
      }
    }
  });
  return ProductRecommendation;
};
