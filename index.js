import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

// basic database connection
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "permalist",
  password: "ConnorD:0124",
  port: 5432,
});
db.connect();

// bodyParser import so I can access form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// defines the empty array
let items = [];

async function checkItems() {
  const result = await db.query(
    "SELECT * FROM items ORDER BY id DESC;"
  );
  // just sets the array to the rows, doesn't need to overwrite anything
  items = result.rows;
  console.log(items);
  // returns the array to whatever called it
  return items;
}

app.get("/", async (req, res) => {
  try {
    const itemsList = await checkItems();
    res.render("index.ejs", {
      listTitle: "Today",
      listItems: itemsList
    });
  } catch (err) {
    console.error("Error fetching items:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  console.log(item);

  try {
    // just need to await query, no need to push into array
    // redirecting to "/" triggeres function that does that
      await db.query(
      "INSERT INTO items (title) VALUES ($1) RETURNING *;",
      [item]
    );
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

app.post("/edit", async (req, res) => {
  const updatedItemId = req.body.updatedItemId;
  console.log(updatedItemId);
  const updatedItemTitle = req.body.updatedItemTitle;

  try {
    // updates title to what is entered in title field, and only where it is being edited at
    // only updated the item that is selected
    await db.query(
      "UPDATE items SET title = $1 WHERE id = $2 RETURNING *;",
      [updatedItemTitle, updatedItemId]
    );
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

app.post("/delete", async (req, res) => {
  const deleteItemId = req.body.deleteItemId;
  try {
    await db.query(
      "DELETE FROM items WHERE id = $1;",
      [deleteItemId]
    );
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// TO DO
// [Sat Nov 30 12:29 PM] make the /add push the item to the database and array
// [Sort of] make the edit function
// [Sat Nov 30 7:10 PM] make the delete function

// BUGS:
// the edit method moves item to bottom of list
// it edits what is in field, and one with right ID, just moves to bottom.
// its only in the array, in the datababse it is fine