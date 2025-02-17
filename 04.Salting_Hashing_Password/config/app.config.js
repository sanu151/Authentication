require("dotenv").config();

const dev = {
  app: {
    port: process.env.PORT,
  },
  db: {
    dbUrl: process.env.MONGODB_URL,
  },
};

module.exports = dev;
