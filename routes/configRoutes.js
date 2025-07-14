const usersR = require("./userRoutes");
const leadsR = require("./leadRoutes");
const propertiesR = require("./propertyRoutes");
const dealsR = require("./dealRoutes");
const activitiesR = require("./activityRoutes");
const notificationsR = require("./notificationRoutes");
const recommendationsR = require("./recommendationRoutes");
const favoritesR = require("./favoriteRoutes");
const dashboardR = require("./dashboardRoutes");

exports.routesInit = (app) => {
  app.use("/api/users", usersR);
  app.use("/api/leads", leadsR);
  app.use("/api/properties", propertiesR);
  app.use("/api/deals", dealsR);
  app.use("/api/activities", activitiesR);
  app.use("/api/notifications", notificationsR);
  app.use("/api/recommendations", recommendationsR);
  app.use("/api/users/favorites", favoritesR);
  app.use("/api/dashboard", dashboardR);
};
