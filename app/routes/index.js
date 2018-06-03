const manabaseRoutes = require('./manabase_routes');

module.exports = function (app, db) {
  manabaseRoutes(app, db);
  // Other route groups could go here, in the future
};