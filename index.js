const express = require("express");
const app = express();
const PORT = 4000;
const bodyParser = require("body-parser");
const session = require("express-session");
const cors = require("cors");
const {
  createUser,
  isValidUser,
  getProductsByCategoryId,
  getCategories,
  getIdFromEmail,
  getCategoriesAndProducts
} = require("./db");

app.use(express.static(__dirname + "/public"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());

// app.use(cookieParser());
app.use(
  session({
    secret: "my-secret-key",
    resave: false,
    saveUninitialized: true,
    store: new session.MemoryStore(),
    cookie: {
      path: "/",
      secure: false,
      maxAge: 24 * 60 * 60 * 1000, // session expires after 24 hours
    },
  })
);

const loggedIn = (req, res, next) => {
  const userId = req.session.userId; // retrieve the user ID from the session
  console.log(req.session);
  if (userId) {
    res.redirect("/");
  } else {
    next();
  }
};

//render pages based on url
//-------------------------------------------------------------------------------------
app.get("/", async (req, res, next) => {
  let loggedIn = req.session.userId;
  const categories = await getCategoriesAndProducts(); 
  res.render("index.ejs", { loggedIn,data:categories });
});

app.get("/privacy", (req, res, next) => {
  res.render("privacy.ejs");
});

app.get("/careers", (req, res, next) => {
  res.render("careers.ejs");
});

app.get("/login", loggedIn, (req, res, next) => {
  res.render("login.ejs");
});

app.get("/createacc", (req, res, next) => {
  res.render("createacc.ejs");
});

app.get("*", (req, res, next) => {
  res.json("not found");
});

//app.get ->products by category id
app.get("/products/:id", async (req, res) => {
  //const products=await getProductsByCategoryId(req.params.id);
  //res.json(products)
});
//app.get -> all categories

app.get("/categories", async (req, res) => {});
//-------------------------------------------------------------------------------------
app.post("/createacc", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  createUser(firstName, lastName, email, password);
  res.redirect("/login");
});

app.post("/login", async (req, res) => {
  console.log("in login route");
  const { email, password } = req.body;
  let checkCredentials = await isValidUser(email, password);
  switch (checkCredentials) {
    case 1:
      console.log("done");
      req.session.userId = await getIdFromEmail(email);
      console.log("in post login");
      console.log(req.session);
      res.redirect("/");
      break;
    case -1:
      console.log("invalid email");
      break;
    default:
      console.log("invalid password");
      break;
  }
});

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
    } else {
      res.redirect("/");
    }
  });
});

app.listen(PORT, () => {
  console.log(`server is listening on port ${PORT}`);
});
