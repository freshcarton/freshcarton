'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return [queryInterface.addColumn('Markets','business_on_sunday',{
          type: Sequelize.INTEGER,
          defaultValue:0
        }),
        queryInterface.addColumn('Markets','business_on_monday',{
          type: Sequelize.INTEGER,
          defaultValue:0
        }),
        queryInterface.addColumn('Markets','business_on_tuesday',{
          type: Sequelize.INTEGER,
          defaultValue:0
        }),
        queryInterface.addColumn('Markets','business_on_wednesday',{
          type: Sequelize.INTEGER,
          defaultValue:0
        }),
        queryInterface.addColumn('Markets','business_on_thrusday',{
          type: Sequelize.INTEGER,
          defaultValue:0
        }),
        queryInterface.addColumn('Markets','business_on_friday',{
          type: Sequelize.INTEGER,
          defaultValue:0
       }),
        queryInterface.addColumn('Markets','business_on_saturday',{
          type: Sequelize.INTEGER,
          defaultValue:0
       }),
        queryInterface.addColumn('Markets','business_from_time',{
          type: Sequelize.FLOAT,
          defaultValue:7.0
        }),
        queryInterface.addColumn('Markets','business_to_time',{
          type: Sequelize.FLOAT,
          defaultValue:16.0
        }),queryInterface.addColumn('Markets','delivery_on_sunday',{
          type: Sequelize.INTEGER,
          defaultValue:0
        }),
        queryInterface.addColumn('Markets','delivery_on_monday',{
          type: Sequelize.INTEGER,
          defaultValue:0
        }),
        queryInterface.addColumn('Markets','delivery_on_tuesday',{
          type: Sequelize.INTEGER,
          defaultValue:0
        }),
        queryInterface.addColumn('Markets','delivery_on_wednesday',{
          type: Sequelize.INTEGER,
          defaultValue:0
        }),
        queryInterface.addColumn('Markets','delivery_on_thrusday',{
          type: Sequelize.INTEGER,
          defaultValue:0
        }),
        queryInterface.addColumn('Markets','delivery_on_friday',{
          type: Sequelize.INTEGER,
          defaultValue:0
       }),
        queryInterface.addColumn('Markets','delivery_on_saturday',{
          type: Sequelize.INTEGER,
          defaultValue:0
       }),
        queryInterface.addColumn('Markets','delivery_from_time',{
          type: Sequelize.FLOAT,
          defaultValue:7.0
        }),
        queryInterface.addColumn('Markets','delivery_to_time',{
          type: Sequelize.FLOAT,
          defaultValue:16.0
        })
    ]    
  },

  down: function (queryInterface, Sequelize) {
    return [
        queryInterface.removeColumn('Markets','business_on_sunday'),
        queryInterface.removeColumn('Markets','business_on_monday'),
        queryInterface.removeColumn('Markets','business_on_tuesday'),
        queryInterface.removeColumn('Markets','business_on_wednesday'),
        queryInterface.removeColumn('Markets','business_on_thrusday'),
        queryInterface.removeColumn('Markets','business_on_friday'),
        queryInterface.removeColumn('Markets','business_on_saturday'),
        queryInterface.removeColumn('Markets','business_from_time'),
        queryInterface.removeColumn('Markets','business_to_time'),
        queryInterface.removeColumn('Markets','delivery_on_sunday'),
        queryInterface.removeColumn('Markets','delivery_on_monday'),
        queryInterface.removeColumn('Markets','delivery_on_tuesday'),
        queryInterface.removeColumn('Markets','delivery_on_wednesday'),
        queryInterface.removeColumn('Markets','delivery_on_thrusday'),
        queryInterface.removeColumn('Markets','delivery_on_friday'),
        queryInterface.removeColumn('Markets','delivery_on_saturday'),
        queryInterface.removeColumn('Markets','delivery_from_time'),
        queryInterface.removeColumn('Markets','delivery_to_time'),
    ]
  }
};
