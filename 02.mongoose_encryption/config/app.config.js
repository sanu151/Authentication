require("dotenv").config();

const dev = {
  app: {
    port: process.env.PORT || 3000,
  },
  db: {
    dbUrl: process.env.MONGODB_URL,
  },
};

module.exports = dev;
