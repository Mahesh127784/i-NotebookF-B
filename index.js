const connectToMongo = require("./db");
const express = require("express");
const app = express();
const port = 5000;

connectToMongo();
const cors = require("cors");

app.use(cors());
app.use(express.json());

//Available routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/notes", require("./routes/notes"));

app.listen(port, () => {
  console.log(`iNOTEBOOK app listening at http://localhost:${port}`);
});
