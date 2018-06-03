const poolRoutes = require('./manabase_routes');

module.exports = function (app, db) {
  poolRoutes(app, db);
  // Other route groups could go here, in the future
};