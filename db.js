/** Database connection for messagely. */
const { Client } = require("pg");
const { db } = require("./config");

const client = new Client({
  host: '/var/run/postgresql',
  database: db,
})

client.connect();
module.exports = client;


//THIS DOESNT WORK FOR MY CONNECTION TO POSTRESQL FOR SOME UNKNOWN REASON
// const { Client } = require("pg");

// const client = new Client(DB_URI);
// client.connect();
// module.exports = client;
/** Database for lunchly */
//END ALTERNATIVE DB CONNECTION CODE

