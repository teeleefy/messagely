/** Server startup for Message.ly. */


const app = require("./app");

const port = process.env.PORT || 3000;

app.listen(port, function () {
  console.log(`Listening on ${port}`);
});