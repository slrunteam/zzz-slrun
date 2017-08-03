var path = require('path');
var dotenv = require('dotenv');

dotenv.load({ path: path.join(__dirname, '.env.example') });

module.exports = {
  client: 'sqlite',
  connection: {
    filename: './db.sqlite'
  },
  useNullAsDefault: true
};
