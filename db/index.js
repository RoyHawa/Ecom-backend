const { comparePasswords, passwordHash } = require("../util/password.js");
const Pool = require("pg").Pool;
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "test",
  password: "postgres",
  port: 5432,
});

const emailExists = async (email) => {
  try {
    const res = await pool.query('SELECT * FROM "users" WHERE email=$1', [
      email,
    ]);
    return res.rowCount > 0 ? true : false;
  } catch (error) {
    console.log(error);
  }
};

const createUser = async (firstName, lastName, email, password) => {
  try {
    const exists = await emailExists(email);
    if (exists) {
      throw new Error("Email already exists");
    }
    const hashedPassword = await passwordHash(password);
    const res = await pool.query(
      'INSERT INTO "users"(firstName,lastName,email,password) VALUES($1,$2,$3,$4) RETURNING *;',
      [firstName, lastName, email, hashedPassword]
    );
    return res.rows[0];
  } catch (error) {
    console.error(error);
    // throw error;
  }
};

const isValidUser = async (email, password) => {
  try {
    const res = await pool.query('SELECT * FROM "users" WHERE email=$1', [
      email,
    ]);
    console.log(res);
    console.log(
      `received password :${password}, actual password:${res.rows[0].password}`
    );
    if (res.rowCount === 0) {
      return -1;
    }
    if (await comparePasswords(res.rows[0].password, password)) {
      return 1;
    }
    return 0;
  } catch (error) {
    console.error(error);
    return -2;
  }
};

const getProductsByCategoryId = async (category_id) => {
  try {
    const res = await pool.query(
      "SELECT * FROM products WHERE category_id=$1",
      [category_id]
    );
    return res.rows;
  } catch (error) {
    console.error(error);
  }
};

const getCategories = async () => {
  try {
    const res = await pool.query("SELECT * FROM categories");
    return res.rows;
  } catch (error) {
    console.error(error);
  }
};

const getCategoriesAndProducts = async () => {
  const categories = await getCategories();

  for (let i = 0; i < categories.length; i++) {
    let prods = await getProductsByCategoryId(categories[i].id);

    categories[i].products = prods;
  }
  return categories;
};

(async () => {
  const res = await getCategoriesAndProducts(1);
  console.log(res[0].products[0].name);
})();

const getIdFromEmail = async (email) => {
  try {
    const res = await pool.query(`SELECT "id" FROM users WHERE email=$1`, [
      email,
    ]);
    return res.rows[0].id;
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  createUser,
  isValidUser,
  getProductsByCategoryId,
  getCategories,
  getIdFromEmail,
  getCategoriesAndProducts,
};
