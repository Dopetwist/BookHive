import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import pg from "pg";
import env from "dotenv";


const app = express();
const port = 3000;

env.config();


// Database Connection
const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

db.connect();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

let books = [];

// async function getBookId () {
//   const result = await db.query("SELECT * FROM books");
//   books = result.rows;
//   return books.find((book) => book.id == bookId );
// }

// async function getBookId () {
//   const result = await db.query("SELECT * FROM books");
//   const id = result.rows[0].id;
//   bookId = id;
// }


// Home Route.
app.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM books JOIN notes ON books.id = notes.book_id");
    books = result.rows;

    // Store each book in a new array with it's cover.
    const booksWithCovers = await Promise.all(books.map(async (book) => {
      const coverUrl = `https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg?default=false`;

  
        try {
          await axios.get(coverUrl);
          return { ...book, coverUrl }
        } catch (error) {
          console.error(`No book cover found for ISBN: ${book.isbn}`);
          return { ...book, coverUrl }
        }
    }));

    res.render("index.ejs", { books: booksWithCovers, error: null });
  } catch (error) {
      // Error if API responds with a non-2xx status code.
      if (error.response) {
      console.error("API Error:", error.response.status, error.response.data);
      res.render("index.ejs", { error: "No book cover for some books!", books: null });

      // Error if request was made but the API didn't respond.
    } else if (error.request) {
      console.error("The API is not responding:", error.request);
      res.render("index.ejs", { error: "Something went wrong while fetching images, please try again later.", books: null });

      // Error for any other unexpected and unforeseen errors.
    } else {
      console.error("Error:", error.message);
      res.render("index.ejs", { error: "Internal Server Error!" }); 
    }
  }
});


// Sort by Title.
app.get("/sort-title", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM books JOIN notes ON books.id = notes.book_id ORDER BY title ASC");
    books = result.rows;

    const booksWithCovers = await Promise.all(books.map(async (book) => {
      const coverUrl = `https://covers.openlibrary.org/b/isbn/${book.isbn}-S.jpg?default=false`;
      
      try {
        await axios.get(coverUrl);
        return { ...book, coverUrl }
      } catch (error) {
        console.error(`No book cover found for ISBN: ${book.isbn}`);
        return { ...book, coverUrl: null }
      }
    }));

    res.render("index.ejs", { books: booksWithCovers, error: null });
  } catch (error) {
    // Error if API responds with a non-2xx status code.
    if (error.response) {
      console.error("API Error:", error.response.status, error.response.data);
      res.render("index.ejs", { error: "No book cover for some books!", books: null });

      // Error if request was made but the API didn't respond.
    } else if (error.request) {
      console.error("The API is not responding:", error.request);
      res.render("index.ejs", { error: "Something went wrong while fetching images, please try again later.", books: null });

      // Error for any other unexpected and unforeseen errors.
    } else {
      console.error("Error:", error.message);
      res.render("index.ejs", { error: "Internal Server Error!" }); 
    }
  }
});

// Sort by Recency.
app.get("/sort-recent", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM books JOIN notes ON books.id = notes.book_id ORDER BY date DESC");
    books = result.rows;

    const booksWithCovers = await Promise.all(books.map(async (book) => {
      const coverUrl = `https://covers.openlibrary.org/b/isbn/${book.isbn}-S.jpg?default=false`;

      try {
        await axios.get(coverUrl);
        return { ...book, coverUrl }
      } catch (error) {
        console.error(`No book cover found for ISBN: ${book.isbn}`);
        return { ...book, coverUrl: null }
      }
    }));

    res.render("index.ejs", { books: booksWithCovers, error: null });
  } catch (error) {
    // Error if API responds with a non-2xx status code.
    if (error.response) {
      console.error("API Error:", error.response.status, error.response.data);
      res.render("index.ejs", { error: "No book cover for some books!", books: null });

      // Error if request was made but the API didn't respond.
    } else if (error.request) {
      console.error("The API is not responding:", error.request);
      res.render("index.ejs", { error: "Something went wrong while fetching images, please try again later.", books: null });

      // Error for any other unexpected and unforeseen errors.
    } else {
      console.error("Error:", error.message);
      res.render("index.ejs", { error: "Internal Server Error!" }); 
    }
  }
});


// Sort by Rating.
app.get("/sort-rating", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM books JOIN notes ON books.id = notes.book_id ORDER BY rating DESC");
    books = result.rows;

    const booksWithCovers = await Promise.all(books.map(async (book) => {
      const coverUrl = `https://covers.openlibrary.org/b/isbn/${book.isbn}-S.jpg?default=false`;

      try {
        await axios.get(coverUrl);
        return { ...book, coverUrl }
      } catch (error) {
        console.error(`No book cover found for ISBN: ${book.isbn}`);
        return { ...book, coverUrl: null }
      }
    }));

    res.render("index.ejs", { books: booksWithCovers, error: null });
  } catch (error) {
    // Error if API responds with a non-2xx status code.
    if (error.response) {
      console.error("API Error:", error.response.status, error.response.data);
      res.render("index.ejs", { error: "No book cover for some books!", books: null });

      // Error if request was made but the API didn't respond.
    } else if (error.request) {
      console.error("The API is not responding:", error.request);
      res.render("index.ejs", { error: "Something went wrong while fetching images, please try again later.", books: null });

      // Error for any other unexpected and unforeseen errors.
    } else {
      console.error("Error:", error.message);
      res.render("index.ejs", { error: "Internal Server Error!" }); 
    }
  }
});


// Display new book page.
app.post("/add", (req, res) => {
  res.render("new.ejs");
});


// Add new book to the Database.
app.post("/book", async (req, res) => {
  try {
    const title = req.body.title;
    const isbn = req.body.isbn;
    const rating = req.body.rating;
    const summary = req.body.summary.replace(/\\n/g, '\n');
    const note = req.body.note.replace(/\\n/g, '\n');
    const year = new Date().getFullYear();
    let month = new Date().getMonth() + 1;
    let day = new Date().getDate();

    
    if (day < 10) {
      day = "0" + day;
    } else if (month < 10) {
      month = "0" + month;
    }

    const date = `${year}/${month}/${day}`;


    const result = await db.query("INSERT INTO books (title, isbn, rating, date) VALUES ($1, $2, $3, $4) RETURNING id", 
    [title, isbn, rating, date]);

    const bookId = result.rows[0].id;

    await db.query("INSERT INTO notes (book_id, note, summary) VALUES ($1, $2, $3)", 
    [bookId, note, summary]);

    res.redirect("/");
  } catch (error) {
    console.error(error);
  }
});


// Display details of each selected book
app.get("/display/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const query = `SELECT * FROM books LEFT JOIN notes ON books.id = notes.book_id WHERE id = $1`

    const result = await db.query(query, [id]);

    const coverUrl = `https://covers.openlibrary.org/b/isbn/${result.rows[0].isbn}-M.jpg?default=false`;


    res.render("display.ejs", { item: result.rows, coverUrl });
  } catch (error) {
    console.error(error);
  }
});


// Edit selected book
app.get("/edit/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const result = await db.query("SELECT * FROM books JOIN notes ON books.id = notes.book_id WHERE id = $1", [id]);

    res.render("edit.ejs", { item: result.rows });
  } catch (error) {
    console.error(error);
  }
});


// Update selected book's details to the Database
app.post("/edit-book/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const bookTitle = req.body.editTitle;
    const bookIsbn = req.body.editIsbn;
    const bookDate = req.body.editDate;
    const bookRating = req.body.editRating;
    const bookSummary = req.body.editSummary.replace(/\\n/g, '\n');
    const bookNote = req.body.editNote.replace(/\\n/g, '\n'); //Convert a plain \n to an actual newline character

    const result = await db.query("SELECT * FROM books JOIN notes ON books.id = notes.book_id WHERE id = $1", [id]);

    if (isNaN(bookRating)) { 
      return res.render("edit.ejs", { item: result.rows, error: "Please enter a number on Rating!" });
    } else if (bookRating > 10) {
      return res.render("edit.ejs", { item: result.rows, error: "Rating must not be greater than 10!"});
    } 
  
    await db.query("UPDATE books SET title = $1, isbn = $2, rating = $3, date = $4 WHERE id = $5", 
    [bookTitle, bookIsbn, bookRating, bookDate, id]);
    
    await db.query("UPDATE notes SET note = $1, summary = $2 WHERE book_id = $3", [bookNote, bookSummary, id]);
  
    res.redirect("/");
  } catch (error) {
    console.error(error); 
  }
});


// Delete Book
app.get("/delete/:id", async (req, res) => {
  try {
    const id = req.params.id;

    await db.query("DELETE FROM notes WHERE book_id = $1", [id])

    await db.query("DELETE FROM books WHERE id = $1", [id]);

    res.redirect("/");
  } catch (error) {
    console.error(error);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}.`);
});


// function isValidDate (dateString) {
//   const [year, month, day] = dateString.split('/').map(Number);
//   const date = new Date(year, month - 1, day);

//   return (
//       date.getFullYear() === year &&
//       date.getMonth() + 1 === month &&
//       date.getDate() === day
//   );
// }

// function validateDate() {
//   const dateInput = document.getElementById('dateInput').value;
//   const errorMessage = document.getElementById('errorMessage');

//   const datePattern = /^\d{4}\/(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])$/;

//   if (!datePattern.test(dateInput)) {
//       errorMessage.textContent = "Please enter a valid date in the required format!";
//       return false;
//   } else if (!isValidDate(dateInput)) {
//       errorMessage.textContent = "Please enter a valid Calender date!";
//       return false;
//   } else {
//       errorMessage.textContent = "";
//       return true;
//   }
// }