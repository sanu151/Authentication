require("dotenv").config();

const dev = {
  app: {
    port: process.env.PORT || 3001,
  },
  db: {
    dbUrl: process.env.MONGODB_URL,
  },
};

module.exports = dev;
