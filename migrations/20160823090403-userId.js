'use strict';

module.exports = {
    up: function(queryInterface, Sequelize) {
        /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
        return Promise.resolve()
        return queryInterface.addColumn(
            'imgs',
            'userId', {
                type: Sequelize.INTEGER,
                model: 'user',
                key: 'id'
            }
        )
    },

    down: function(queryInterface, Sequelize) {
        /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
        return queryInterface.removeColumn('imgs', 'userId');
    }
};