require("dotenv").config();
const express = require("express");
const app = express();
const { PORT } = require("./config");
const cors = require("cors"); 
const morgan = require("morgan");
const bodyParser = require("body-parser");

try {
  require("./services/mongo");
} catch (e) {
  console.log("⚠️ MongoDB non démarré ou fichier manquant");
}

app.use(morgan("tiny"));
app.use(cors()); 

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

try {
    require("./services/passport")(app);
} catch (e) { console.log("⚠️ Passport non configuré"); }

app.use("/user", require("./controllers/user"));
app.use("/list", require("./controllers/list"));

app.get("/", (req, res) => {
  res.send("API IS RUNNING 🚀");
});

app.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur le port ${PORT}`);
});