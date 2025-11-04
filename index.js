import express from "express";
import bodyParser from "body-parser";
import PG from "pg";
import { configDotenv } from "dotenv";

configDotenv();

const app = express();
const port = 3000;

const db = new PG.Client({
  user: process.env.USER,
  host: process.env.HOST,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  port: process.env.PORT,
})

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


app.get("/", async (req, res) => {
  let items = [];
  const result = await db.query("SELECT * FROM items");
  result.rows.forEach(item => {
    items.push(item);
  });
  res.render("index.ejs", {
    listTitle: "Today",
    listItems: items,
  });
});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  const result = await db.query("INSERT INTO items (title) VALUES($1);",
    [item]
  );
  res.redirect("/");
});

app.post("/edit", async (req, res) => {
  const editedItem = req.body.updatedItemTitle;
  const itemId = req.body.updatedItemId;
  const result = await db.query("UPDATE items SET title = $1 WHERE id = $2;",
    [editedItem, itemId]
  )
  res.redirect("/");
});

app.post("/delete", async (req, res) => {
  const deletedItemId = req.body.deleteItemId;
  const result = await db.query("DELETE FROM items WHERE id = $1;",
    [deletedItemId]
  )
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
