import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import env from "dotenv";
import bcrypt from "bcrypt";
import session from "express-session";
import flash from "connect-flash";
import passport from "passport";
import { Strategy } from "passport-local"; 
import multer from "multer";
import path from "path";
import feedbackRoutes from './routes/feedback.js';
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();
const port = 3000;

const saltRounds = 10;


// User profile picture upload handler
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/"); // Save files in public/uploads folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

env.config();


// Note: Lookup how to persist the session by pairing and saving to Postgres before deployment
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24  // A day session before expiration
    }
  })
);

app.use(bodyParser.json()); // Middleware to parse JSON data (E.g, For feedback emails)
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


app.use(flash()); // Enable flash messages
app.use(passport.initialize());
app.use(passport.session());
app.use("/feedback", feedbackRoutes);

// Middlewares to make flash messages available in all views
app.use((req, res, next) => {
  res.locals.error = req.flash("error");
  next();
});


// Database Connection
const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

db.connect();

let books = [];


// Home Route.
app.get("/", async (req, res) => {
  try {

    const user = req.user ? { 
      id: req.user.id, 
      firstName: req.user.first_name,
      profilePic: req.user.profile_picture } : null;

    const query = `
            SELECT 
                ab.id,
                ab.title,
                u.id AS user_id,
                u.first_name AS first_name,
                u.last_name AS last_name,
                COALESCE(ab.isbn, 'N/A') AS isbn,
                ab.rating,
                an.summary,
                ab.created_at,
                ab.book_cover,
                ab.source_table
            FROM all_books ab
            LEFT JOIN users u ON ab.user_id = u.id
            LEFT JOIN all_notes an 
                ON ab.id = an.book_id AND ab.source_table = an.source_table
            ORDER BY ab.created_at DESC
            `;

    const result = await db.query(query); 
    books = result.rows;

  
    // Store each book in a new array.
    const booksWithCovers = books.map((book) => {
      return { ...book };
    });
    
    res.render("index.ejs", { books: booksWithCovers, user });
  } catch (error) {
    console.error("Error:", error);
    return res.render("index.ejs", { error: "An error occured, please try again later.", books }); 
  }
});

// ============================================================================================================

// Sort by Title.
app.get("/sort-title", async (req, res) => {

  const { currentPage, userId } = req.query;
  let query;
  let params = [];

  try {
    // Profile page
     if (currentPage === "profile" && userId) {
      query = `
            SELECT 
                ab.id,
                ab.title,
                u.id AS user_id,
                u.first_name AS first_name,
                u.last_name AS last_name,
                COALESCE(ab.isbn, 'N/A') AS isbn,
                ab.rating,
                an.summary,
                TO_CHAR(ab.created_at AT TIME ZONE u.time_zone, 'YYYY/MM/DD HH12:MI AM') AS formatted_timestamp,
                ab.book_cover,
                ab.source_table
            FROM all_books ab
            LEFT JOIN users u ON ab.user_id = u.id
            LEFT JOIN all_notes an 
                ON ab.id = an.book_id AND ab.source_table = an.source_table
              WHERE ab.user_id = $1
            ORDER BY ab.title ASC
            `;
          params = [userId];
     } else if (currentPage === "visitProfile" && userId) { 
      // Visiting someone else's profile
        query = `
              SELECT 
                  ab.id,
                  ab.title,
                  u.first_name AS first_name,
                  u.last_name AS last_name,
                  COALESCE(ab.isbn, 'N/A') AS isbn,
                  ab.rating,
                  an.summary,
                  ab.book_cover,
                  TO_CHAR(ab.created_at AT TIME ZONE u.time_zone, 'YYYY/MM/DD HH12:MI AM') AS formatted_timestamp,
                  ab.source_table
              FROM all_books ab
              LEFT JOIN users u ON ab.user_id = u.id
              LEFT JOIN all_notes an 
                  ON ab.id = an.book_id AND ab.source_table = an.source_table
                WHERE u.id = $1
              ORDER BY ab.title ASC 
              `;
          params = [userId];
    } else {
      // Home page
      query = `
            SELECT 
                ab.id,
                ab.title,
                u.id AS user_id,
                u.first_name AS first_name,
                u.last_name AS last_name,
                COALESCE(ab.isbn, 'N/A') AS isbn,
                ab.rating,
                an.summary,
                ab.created_at,
                ab.book_cover,
                ab.source_table
            FROM all_books ab
            LEFT JOIN users u ON ab.user_id = u.id
            LEFT JOIN all_notes an 
                ON ab.id = an.book_id AND ab.source_table = an.source_table
            ORDER BY ab.title ASC
            `;
     }

    const result = await db.query(query, params);
    books = result.rows;

    // Build HTML snippets for each book
    const booksWithCovers = books.map((book) => `
        <div class="sortedBooks-con">
          <div class="book-details">
            <section id="book-cover">
              <figure>
                <img src="${book.book_cover}" alt="Book Cover" class="book-cover" loading="lazy" onerror="this.onerror=null; this.src='/images/default.png';">
              </figure>
            </section>                                
                                        
            <section id="infos-2">
              <div class="infos-2">
                ${currentPage === "profile"
                  ? `<a href="/display/${book.source_table}/${book.id}" id="title" class="bookTitle"> ${book.title} </a>`
                  : currentPage === "visitProfile"
                    ? `<a href="/visitor-display/${book.source_table}/${book.id}?currentPage=visitProfile" id="title" class="bookTitle"> ${book.title} </a>`
                    : `<a href="/visitor-display/${book.source_table}/${book.id}" id="title" class="bookTitle"> ${book.title} </a>`
                }
            
                ${book.created_at 
                  ? `<p class="timestamp read newColor mg-tp" data-utc="${book.created_at}"> Loading... </p>` 
                  : `<p class="read newColor mg-tp"><strong class="strong">Posted on:</strong> ${book.formatted_timestamp} </p>`
                }
        
                                         
                ${book.source_table === "with_isbn"
                  ? `<p class="newColor mg-tp"><strong class="strong">ISBN:</strong> ${book.isbn}</p>`
                  : ''
                }
                                                
                <p class="newColor mg-tp"><strong class="strong">My Rating on this book:</strong> ${book.rating}/10 </p>
            
                ${currentPage === "profile" || currentPage === "visitProfile"
                  ? `<p class="newColor mg-tp"><strong class="strong">Read by:</strong> ${book.first_name} ${book.last_name} </p>`
                  : `<p class="newColor mg-tp"><strong class="strong">Read by:</strong> <a href="/selected-user/${book.user_id}" class="names"> ${book.first_name} ${book.last_name} </a></p>`
                }
            
                <p class="read-more newColor">
                  ${currentPage === "profile"
                    ? `<a href="/display/${book.source_table}/${book.id}" class="yellow">Read my notes on this book</a>`
                    : currentPage === "visitProfile"
                      ? `<a href="/visitor-display/${book.source_table}/${book.id}?currentPage=visitProfile" class="yellow">Read notes on this book</a>`
                      : `<a href="/visitor-display/${book.source_table}/${book.id}" class="yellow">Read my notes on this book</a>`
                  }
                  ${book.source_table === "with_isbn" 
                    ? `or see more details on <a href="https://www.amazon.com/s?k=${book.isbn}" target="_blank" class="yellow">Amazon</a>`
                    : ''
                  } 
                </p>
              </div>
            </section>
          </div>
        
    
          <section id="summary">
            <p class="summary">${book.summary ? book.summary : 'No summary available'}</p>
          </section>
        </div>
      `
    );


    res.send(booksWithCovers.join(""));
  } catch (error) {
    console.error("Error:", error); 
    res.status(500).send("<p style='color:red;' class='errorHtml'>An error occured, please try again later!</p>");
  }
});


// ============================================================================================================

// Sort by Recency.
app.get("/sort-recent", async (req, res) => {
  
  const { currentPage, userId } = req.query;
  let query;
  let params = [];

  try {
     if (currentPage === "profile" && userId) {
      query = `
            SELECT 
                ab.id,
                ab.title,
                u.id AS user_id,
                u.first_name AS first_name,
                u.last_name AS last_name,
                COALESCE(ab.isbn, 'N/A') AS isbn,
                ab.rating,
                an.summary,
                TO_CHAR(ab.created_at AT TIME ZONE u.time_zone, 'YYYY/MM/DD HH12:MI AM') AS formatted_timestamp,
                ab.book_cover,
                ab.source_table
            FROM all_books ab
            LEFT JOIN users u ON ab.user_id = u.id
            LEFT JOIN all_notes an 
                ON ab.id = an.book_id AND ab.source_table = an.source_table
              WHERE ab.user_id = $1
            ORDER BY formatted_timestamp DESC
            `;
          params = [userId];
     } else if (currentPage === "visitProfile" && userId) {
        query = `
              SELECT 
                  ab.id,
                  ab.title,
                  u.first_name AS first_name,
                  u.last_name AS last_name,
                  COALESCE(ab.isbn, 'N/A') AS isbn,
                  ab.rating,
                  an.summary,
                  ab.book_cover,
                  TO_CHAR(ab.created_at AT TIME ZONE u.time_zone, 'YYYY/MM/DD HH12:MI AM') AS formatted_timestamp,
                  ab.source_table
              FROM all_books ab
              LEFT JOIN users u ON ab.user_id = u.id
              LEFT JOIN all_notes an 
                  ON ab.id = an.book_id AND ab.source_table = an.source_table
                WHERE u.id = $1
              ORDER BY formatted_timestamp DESC 
              `;
          params = [userId];
    } else {
      query = `
            SELECT 
                ab.id,
                ab.title,
                u.id AS user_id,
                u.first_name AS first_name,
                u.last_name AS last_name,
                COALESCE(ab.isbn, 'N/A') AS isbn,
                ab.rating,
                an.summary,
                ab.created_at,
                ab.book_cover,
                ab.source_table
            FROM all_books ab
            LEFT JOIN users u ON ab.user_id = u.id
            LEFT JOIN all_notes an 
                ON ab.id = an.book_id AND ab.source_table = an.source_table
            ORDER BY ab.created_at DESC
            `;
    }

    const result = await db.query(query, params);
    books = result.rows;

    // Build HTML snippets for each book
    const booksWithCovers = books.map((book) => `
        <div class="sortedBooks-con">
          <div class="book-details">
            <section id="book-cover">
              <figure>
                <img src="${book.book_cover}" alt="Book Cover" class="book-cover" loading="lazy" onerror="this.onerror=null; this.src='/images/default.png';">
              </figure>
            </section>                                
                                        
            <section id="infos-2">
              <div class="infos-2">
                ${currentPage === "profile"
                  ? `<a href="/display/${book.source_table}/${book.id}" id="title" class="bookTitle"> ${book.title} </a>`
                  : currentPage === "visitProfile"
                    ? `<a href="/visitor-display/${book.source_table}/${book.id}?currentPage=visitProfile" id="title" class="bookTitle"> ${book.title} </a>`
                    : `<a href="/visitor-display/${book.source_table}/${book.id}" id="title" class="bookTitle"> ${book.title} </a>`
                }
            
                ${book.created_at 
                  ? `<p class="timestamp read newColor mg-tp" data-utc="${book.created_at}"> Loading... </p>` 
                  : `<p class="read newColor mg-tp"><strong class="strong">Posted on:</strong> ${book.formatted_timestamp} </p>`
                }
        
                                         
                ${book.source_table === "with_isbn"
                  ? `<p class="newColor mg-tp"><strong class="strong">ISBN:</strong> ${book.isbn}</p>`
                  : ''
                }
                                                
                <p class="newColor mg-tp"><strong class="strong">My Rating on this book:</strong> ${book.rating}/10 </p>
            
                ${currentPage === "profile" || currentPage === "visitProfile"
                  ? `<p class="newColor mg-tp"><strong class="strong">Read by:</strong> ${book.first_name} ${book.last_name} </p>`
                  : `<p class="newColor mg-tp"><strong class="strong">Read by:</strong> <a href="/selected-user/${book.user_id}" class="names"> ${book.first_name} ${book.last_name} </a></p>`
                }
            
                <p class="read-more newColor">
                  ${currentPage === "profile"
                    ? `<a href="/display/${book.source_table}/${book.id}" class="yellow">Read my notes on this book</a>`
                    : currentPage === "visitProfile"
                      ? `<a href="/visitor-display/${book.source_table}/${book.id}?currentPage=visitProfile" class="yellow">Read notes on this book</a>`
                      : `<a href="/visitor-display/${book.source_table}/${book.id}" class="yellow">Read my notes on this book</a>`
                  }
                  ${book.source_table === "with_isbn" 
                    ? `or see more details on <a href="https://www.amazon.com/s?k=${book.isbn}" target="_blank" class="yellow">Amazon</a>`
                    : ''
                  } 
                </p>
              </div>
            </section>
          </div>
        
    
          <section id="summary">
            <p class="summary">${book.summary ? book.summary : 'No summary available'}</p>
          </section>
        </div>
      `
    );

    res.send(booksWithCovers.join(""));
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("<p style='color:red;' class='errorHtml'>An error occured, please try again later!</p>");
  }
});

// ============================================================================================================

// Sort by Rating.
app.get("/sort-rating", async (req, res) => {

  const { currentPage, userId } = req.query;
  let query;
  let params = [];
  try {
     if (currentPage === "profile" && userId) {
      query = `
            SELECT 
                ab.id,
                ab.title,
                u.id AS user_id,
                u.first_name AS first_name,
                u.last_name AS last_name,
                COALESCE(ab.isbn, 'N/A') AS isbn,
                ab.rating,
                an.summary,
                TO_CHAR(ab.created_at AT TIME ZONE u.time_zone, 'YYYY/MM/DD HH12:MI AM') AS formatted_timestamp,
                ab.book_cover,
                ab.source_table
            FROM all_books ab
            LEFT JOIN users u ON ab.user_id = u.id
            LEFT JOIN all_notes an 
                ON ab.id = an.book_id AND ab.source_table = an.source_table
              WHERE ab.user_id = $1
            ORDER BY ab.rating DESC
            `;
          params = [userId];
     } else if (currentPage === "visitProfile" && userId) {
        query = `
              SELECT 
                  ab.id,
                  ab.title,
                  u.first_name AS first_name,
                  u.last_name AS last_name,
                  COALESCE(ab.isbn, 'N/A') AS isbn,
                  ab.rating,
                  an.summary,
                  ab.book_cover,
                  TO_CHAR(ab.created_at AT TIME ZONE u.time_zone, 'YYYY/MM/DD HH12:MI AM') AS formatted_timestamp,
                  ab.source_table
              FROM all_books ab
              LEFT JOIN users u ON ab.user_id = u.id
              LEFT JOIN all_notes an 
                  ON ab.id = an.book_id AND ab.source_table = an.source_table
                WHERE u.id = $1
              ORDER BY ab.rating DESC 
              `;
          params = [userId];
    } else {
      query = `
            SELECT 
                ab.id,
                ab.title,
                u.id AS user_id,
                u.first_name AS first_name,
                u.last_name AS last_name,
                COALESCE(ab.isbn, 'N/A') AS isbn,
                ab.rating,
                an.summary,
                ab.created_at,
                ab.book_cover,
                ab.source_table
            FROM all_books ab
            LEFT JOIN users u ON ab.user_id = u.id
            LEFT JOIN all_notes an 
                ON ab.id = an.book_id AND ab.source_table = an.source_table
            ORDER BY ab.rating DESC
            `;
     }

    const result = await db.query(query, params);
    books = result.rows;

    // Build HTML snippets for each book
    const booksWithCovers = books.map((book) => `
        <div class="sortedBooks-con">
          <div class="book-details">
            <section id="book-cover">
              <figure>
                <img src="${book.book_cover}" alt="Book Cover" class="book-cover" loading="lazy" onerror="this.onerror=null; this.src='/images/default.png';">
              </figure>
            </section>                                
                                        
            <section id="infos-2">
              <div class="infos-2">
                ${currentPage === "profile"
                  ? `<a href="/display/${book.source_table}/${book.id}" id="title" class="bookTitle"> ${book.title} </a>`
                  : currentPage === "visitProfile"
                    ? `<a href="/visitor-display/${book.source_table}/${book.id}?currentPage=visitProfile" id="title" class="bookTitle"> ${book.title} </a>`
                    : `<a href="/visitor-display/${book.source_table}/${book.id}" id="title" class="bookTitle"> ${book.title} </a>`
                }
            
                ${book.created_at 
                  ? `<p class="timestamp read newColor mg-tp" data-utc="${book.created_at}"> Loading... </p>` 
                  : `<p class="read newColor mg-tp"><strong class="strong">Posted on:</strong> ${book.formatted_timestamp} </p>`
                }
        
                                         
                ${book.source_table === "with_isbn"
                  ? `<p class="newColor mg-tp"><strong class="strong">ISBN:</strong> ${book.isbn}</p>`
                  : ''
                }
                                                
                <p class="newColor mg-tp"><strong class="strong">My Rating on this book:</strong> ${book.rating}/10 </p>
            
                ${currentPage === "profile" || currentPage === "visitProfile"
                  ? `<p class="newColor mg-tp"><strong class="strong">Read by:</strong> ${book.first_name} ${book.last_name} </p>`
                  : `<p class="newColor mg-tp"><strong class="strong">Read by:</strong> <a href="/selected-user/${book.user_id}" class="names"> ${book.first_name} ${book.last_name} </a></p>`
                }
            
                <p class="read-more newColor">
                  ${currentPage === "profile"
                    ? `<a href="/display/${book.source_table}/${book.id}" class="yellow">Read my notes on this book</a>`
                    : currentPage === "visitProfile"
                      ? `<a href="/visitor-display/${book.source_table}/${book.id}?currentPage=visitProfile" class="yellow">Read notes on this book</a>`
                      : `<a href="/visitor-display/${book.source_table}/${book.id}" class="yellow">Read my notes on this book</a>`
                  }
                  ${book.source_table === "with_isbn" 
                    ? `or see more details on <a href="https://www.amazon.com/s?k=${book.isbn}" target="_blank" class="yellow">Amazon</a>`
                    : ''
                  } 
                </p>
              </div>
            </section>
          </div>
        
    
          <section id="summary">
            <p class="summary">${book.summary ? book.summary : 'No summary available'}</p>
          </section>
        </div>
      `
    );

    res.send(booksWithCovers.join(""));
  } catch (error) {
    console.error("Error:", error); 
    res.status(500).send("<p style='color:red;' class='errorHtml'>An error occured, please try again later!</p>");
  }
});

// ============================================================================================================

// Display registration form
app.get("/register-form", (req, res) => {
  res.render("register.ejs", { formData: {} });
});

// Display login form
app.get("/login-form", (req, res) => {
  res.render("login.ejs", { formData: {} });
});

// Display Reset Page
app.get("/forgot", (req, res) => {
  res.render("reset.ejs", { formData: {} });
});

// Change Password Page
app.get("/change-pass", (req, res) => {
  console.log(req.user);

  if (req.isAuthenticated()) {
    res.render("change.ejs", { formData: {} });
  } else {
    res.redirect("/login-form");
  }
});

// Delete Account Page
app.get("/delete-account", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("delete.ejs", { formData: {} });
  } else {
    res.redirect("/login-form");
  }
});

// Display new book page.
app.post("/add", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("new.ejs", { formData: {} });
  } else {
    res.redirect("/login-form");
  }
});

// Display Non-ISBN book page
app.get("/no_isbn", async (req, res) => {
  if (req.isAuthenticated()) {
    res.render("noIsbn.ejs", { formData: {} });
  } else {
    res.redirect("/login-form");
  }
});

// Log out
app.get("/log-out", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
  });
  res.redirect("/");
});

// ============================================================================================================

// User Profile
app.get("/profile", async (req, res) => {
  // console.log(req.user);

  try {
    if (req.isAuthenticated()) {

      const userId = req.user.id;
  
      const query = `
              SELECT 
                  ab.id,
                  ab.title,
                  u.first_name AS first_name,
                  u.last_name AS last_name,
                  COALESCE(ab.isbn, 'N/A') AS isbn,
                  ab.rating,
                  an.summary,
                  ab.book_cover,
                  TO_CHAR(ab.created_at AT TIME ZONE u.time_zone, 'YYYY/MM/DD HH12:MI AM') AS formatted_timestamp,
                  ab.source_table
              FROM all_books ab
              LEFT JOIN users u ON ab.user_id = u.id
              LEFT JOIN all_notes an 
                  ON ab.id = an.book_id AND ab.source_table = an.source_table
                WHERE u.id = $1
              ORDER BY ab.created_at DESC 
              `;
  
      const result = await db.query(query, [userId]);
      books = result.rows;
  
  
      // Store each book in a new array.
      const booksWithCovers = books.map((book) => {
        return { ...book };
      });
  
      const user = await db.query("SELECT * FROM users WHERE id = $1", [userId]);
      const updatedUser = user.rows[0];
  
  
      res.render("user.ejs", { 
        user: updatedUser, 
        books: booksWithCovers, 
        profilePicture: updatedUser.profile_picture
      });
    } else {
      res.redirect("/login-form");
    }
  } catch (error) {
    console.error(error);
    return res.render("user.ejs", { message: "An error occured, please try again later!" });
  }
});

// ============================================================================================================

// Add Bio
app.post("/bio", async (req, res) => {
  try {
    if (req.isAuthenticated()) {
      const userId = req.user.id;
      const bio = req.body.bio.replace(/\\n/g, '\n');
  
      await db.query("UPDATE users SET bio = $1 WHERE id = $2", [bio, userId]);
      res.redirect("/profile");
    } else {
      res.redirect("/login-form");
    }
  } catch (error) {
    console.error(error);
    return res.render("user.ejs", { message: "An error occured, please try again later!" });
  }
});


// Get Selected User's profile
app.get("/selected-user/:id", async (req, res) => {


  const userId = req.params.id;

  try {
    const query = `
              SELECT 
                  ab.id,
                  ab.title,
                  u.first_name AS first_name,
                  u.last_name AS last_name,
                  COALESCE(ab.isbn, 'N/A') AS isbn,
                  ab.rating,
                  an.summary,
                  ab.book_cover,
                  TO_CHAR(ab.created_at AT TIME ZONE u.time_zone, 'YYYY/MM/DD HH12:MI AM') AS formatted_timestamp,
                  ab.source_table
              FROM all_books ab
              LEFT JOIN users u ON ab.user_id = u.id
              LEFT JOIN all_notes an 
                  ON ab.id = an.book_id AND ab.source_table = an.source_table
                WHERE u.id = $1
              ORDER BY ab.created_at DESC 
              `;
  
      const result = await db.query(query, [userId]);
      books = result.rows;
  
  
      // Store each book in a new array.
      const booksWithCovers = books.map((book) => {
        return { ...book };
      });
  
      const user = await db.query("SELECT * FROM users WHERE id = $1", [userId]);
      const updatedUser = user.rows[0];
  
  
      res.render("visitProfile.ejs", { 
        user: updatedUser, 
        books: booksWithCovers, 
        profilePicture: updatedUser.profile_picture
      });
  } catch (error) {
    console.error(error);
    return res.render("visitProfile.ejs", { message: "An error occured, please try again later!" });
  }
});

// ============================================================================================================

// Search User
app.post("/search", async (req, res) => {

  const searchInput = req.body.search.trim();
  const nameParts = searchInput.split(" "); // Splits input by space


  try {
    if (nameParts.length > 2) {
      return res.send(`<p style="color:red;" class="errorHtml">Please do not enter more than 2 names!</p>`);
    } 
  
    
    if (nameParts.length === 2) {
      const [ first_name, last_name ] = nameParts;

      const userQuery = ` 
        SELECT * FROM users 
        WHERE (first_name ILIKE $1 AND last_name ILIKE $2)
        OR (first_name ILIKE $2 AND last_name ILIKE $1)
        LIMIT 10
        `;

      const userResult = await db.query(userQuery, [ first_name, last_name ]);


      if (userResult.rows.length === 0) {
        return res.send(`<p style="color:red;" class="errorHtml">User not found!</p>`);
      }

      // Return a simple HTML block with matching users
      const html = userResult.rows.map(user => `
        <a href="/selected-user/${user.id}" class="user-name">
          <figure class="userDp">
            <img src="${user.profile_picture || '/uploads/default.png'}" alt="User Picture">
          </figure>
          <p>${user.first_name} ${user.last_name}</p>
        </a>     
      `).join("");

      res.send(html);
    } else {
      const userQuery = `
      SELECT * FROM users WHERE first_name ILIKE $1 OR last_name ILIKE $1 LIMIT 10
      `

      const userResult = await db.query(userQuery, [searchInput]);
      

      if (userResult.rows.length === 0) {
        return res.send(`<p style="color:red;" class="errorHtml">User not found!</p>`);
      }

      // Return a simple HTML block with matching users
      const html = userResult.rows.map(user => `
          <a href="/selected-user/${user.id}" class="user-name">
            <figure class="userDp">
              <img src="${user.profile_picture || '/uploads/default.png'}" alt="User Picture">
            </figure>
            <p>${user.first_name} ${user.last_name}</p>
          </a>     
      `).join("");

      res.send(html);
    }
  } catch (error) {
    console.error(error);
    res.send(`<p style="color:red;" class="errorHtml">An error occurred. Please try again later.</p>`);
  }
});

// ============================================================================================================

// Upload profile picture
app.post("/upload-picture", upload.single("profile-img"), async (req, res) => {
  // console.log("File received:", req.file); // Debugging

  if (req.isAuthenticated()) {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  
    const userId = req.user.id;
    const profilePicture = `/uploads/${req.file.filename}`;
    
  
    try {
      await db.query("UPDATE users SET profile_picture = $1 WHERE id = $2", [profilePicture, userId]);
      res.json({ profilePicture });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update profile picture" });
    }
  } else {
    res.redirect("/login-form");
  }
});

// Delete profile picture
app.post("/pic-delete", async (req, res) => {

  if (req.isAuthenticated()) {
    try {
      const userId = req.user.id;

      await db.query("UPDATE users SET profile_picture = NULL WHERE id = $1", [userId]);

      res.json({ message: "Profile picture removed successfully." }); // Sends success message to axios
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Failed to remove profile picture." });
    }
  } else {
    res.redirect("/login-form"); 
  }
});

// ============================================================================================================

// Login redirect
app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/login-form",
    failureFlash: true, // This enables flash messages on failure
  })
);

// Register User
app.post("/register", async (req, res) => {

  const { firstName, lastName, password, confirm, secretWord, time_zone } = req.body;
  const email = req.body.username;
  

  const userTimeZone = time_zone || 'UTC'; // Defaults to 'UTC' if no time zone is detected


  try {
    // Check if entered passwords match.
    if (password !== confirm) {
      res.render("register.ejs", { error: "Passwords does not Match!",
        formData: { firstName, lastName, email, secretWord }
      });
      return; // Stop execution 
    }

    const checkUser = await db.query("SELECT * FROM users WHERE email = $1", [email]);


    if (checkUser.rows.length > 0) {
      res.render("register.ejs", { error: "Email already exists, Try logging in.",
        formData: { firstName, lastName, email, password, confirm, secretWord }
      });
      return; // Stop execution
    } else {
      // Hash passwords and save it in the database
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          console.error("Error Hashing Passwords", err);
        } else {
          const result = await db.query(
            "INSERT INTO users (first_name, last_name, email, password, secret_word, time_zone) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *", 
            [firstName, lastName, email, hash, secretWord, userTimeZone]
          );
    
          const user = result.rows[0];
    
          req.login(user, (err) => {
            console.log(err);
            res.redirect("/profile");
          })
        }
      });
    }
  } catch (error) {
    console.error(error);
    return res.render("register.ejs", { error: "Something went wrong. Please try again later." });
  }
});

// ============================================================================================================

// Login User
passport.use(
  new Strategy(async function verify(username, password, cb) {
    try {

      const result = await db.query("SELECT * FROM users WHERE email = $1", [username]);

      if (result.rows.length > 0) {
        const user = result.rows[0];
        const storedHashedPassword = user.password;

        // Check if passwords match
        bcrypt.compare(password, storedHashedPassword, (err, valid) => {
          if (err) {
            // Error with password check
            console.error("Error comparing passwords", err);
            return cb(err);
          } else { 
            if (valid) {
              // Passed password check
              return cb(null, user);
            } else {
              // Did not pass password check
              return cb(null, false, { message: "Incorrect Password!" });
            }
          }
        });
      } else {
        return cb(null, false, { message: "User not found!" });
      }
    } catch (error) {
      console.error(error); // Log the error for debugging
      return cb(null, false, { message: "Something went wrong. Please try again later." });
    }
  })
); 

// Access the user's details stored in the database
passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((user, cb) => {
  cb(null, user);
});

// ============================================================================================================

// Add new book to the Database.
app.post("/book", async (req, res) => {
  if (req.isAuthenticated()) {
    try {
      const id = req.user.id;
      const { title, isbn, rating } = req.body;
      const summary = req.body.summary.replace(/\\n/g, '\n');
      const note = req.body.note.replace(/\\n/g, '\n');
      const timestamp = new Date().toISOString();
  
      const coverUrl = `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg?default=false`;
      
      if (isNaN(rating)) { 
        res.render("new.ejs", { error: "Please enter a number on Rating!", 
          formData: { title, isbn, rating, summary, note } // Pre-fill user form inputs on error
        });
        return; // Stop execution
      } else if (rating > 10) {
        res.render("new.ejs", { error: "Rating must not be greater than 10!",
          formData: { title, isbn, rating, summary, note } // Pre-fill user form inputs on error
        });
        return; // Stop execution
      }
  
      const result = await db.query("INSERT INTO books (user_id, title, isbn, rating, created_at, book_cover) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id", 
      [id, title, isbn, rating, timestamp, coverUrl]);
  
      const bookId = result.rows[0].id;
  
      await db.query("INSERT INTO notes (user_id, book_id, summary, note) VALUES ($1, $2, $3, $4)", 
      [id, bookId, summary, note]);
  
      res.redirect("/profile");
    } catch (error) {
      console.error(error);
      return res.render("new.ejs", { error: "An error occured, please try again later." });
    }
  } else {
    res.redirect("/login-form");
  }
});


// Add Non-ISBN books to the Database
app.post("/book-with-no-isbn", upload.single("book_cover"), async (req, res) => {
  // console.log("File received:", req.file); // Debugging
  
  if (req.isAuthenticated()) {

    try {
      const id = req.user.id;
      const { title, rating } = req.body;
      const summary = req.body.summary.replace(/\\n/g, '\n');
      const note = req.body.note.replace(/\\n/g, '\n');
      const timestamp = new Date().toISOString();

      let bookPicture;

      if (!req.file) {
        bookPicture = null;
      } else {
        bookPicture = `/uploads/${req.file.filename}`;
      }
  
      if (isNaN(rating)) { 
        res.render("noIsbn.ejs", { error: "Please enter a number on Rating!",
          formData: { title, rating, summary, note }
         });
        return; // Stop execution
      } else if (rating > 10) {
        res.render("noIsbn.ejs", { error: "Rating must not be greater than 10!",
          formData: { title, rating, summary, note }
        });
        return; // Stop execution
      }

      const result = await db.query("INSERT INTO noisbnbooks (user_id, title, rating, created_at, book_cover) VALUES ($1, $2, $3, $4, $5) RETURNING id", 
      [id, title, rating, timestamp, bookPicture]);
    
      const bookId = result.rows[0].id;
    
      await db.query("INSERT INTO noisbnnotes (user_id, book_id, summary, note) VALUES ($1, $2, $3, $4)", 
      [id, bookId, summary, note]);
    
      res.redirect("/profile");
  
    } catch (error) {
      console.error(error);
      return res.render("noIsbn.ejs", { error: "An error occured, please try again later." });
    }
  } else {
    res.redirect("/login-form");
  }
});

// ============================================================================================================

// Reset Password
app.post("/reset", async (req, res) => {
  const email = req.body.username;

  const { password, confirm, secretWord } = req.body;


  try {
    if (password !== confirm) {
      res.render("reset.ejs", { error: "Passwords does not Match!",
        formData: { email }
      });
      return; // Stop execution
    }


    const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
  
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const storedSecret = user.secret_word;
  
      if (secretWord === storedSecret) {
        // Hash passwords and save it in the database
        bcrypt.hash(password, saltRounds, async (err, hash) => {
          if (err) {
            console.error("Error Hashing Passwords", err);
          } else {
            const result = await db.query("UPDATE users SET password = $1 WHERE email = $2 RETURNING *", 
              [hash, email]
            );
      
            const user = result.rows[0];
      
            req.login(user, (err) => {
              console.log(err);
              res.redirect("/profile");
            })
          }
        });
      } else {
        res.render("reset.ejs", { error: "Incorrect Secret Word!", 
          formData: { email, password, confirm, secretWord }
        });
      }
    } else {
      res.render("reset.ejs", { error: "User does not exist!", 
        formData: { email, password, confirm, secretWord }
      });
    }
  } catch (error) {
    console.error(error);
    return res.render("reset.ejs", { error: "An error occured, please try again later." });
  }
});

// ============================================================================================================

// Function to Change Password
app.post("/change", async (req, res) => {
  if (req.isAuthenticated()) {

    const email = req.user.email;

    const { oldPass, newPassword, confirm, secretWord } = req.body;

    try {
      if (newPassword !== confirm) {
        res.render("change.ejs", { error: "New Passwords does not Match!",
          formData: { oldPass }
        });
        return; // Stop execution
      }

      const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    
      if (result.rows.length > 0) {
        const user = result.rows[0];
        const storedHashedPassword = user.password;
        const storedSecret = user.secret_word;


        if (secretWord !== storedSecret) {
          res.render("change.ejs", { error: "Incorrect Secret Word!",
            formData: { oldPass, newPassword, confirm, secretWord }
           });
          return; // Stop execution
        }
      
        // Verify Old Password
        bcrypt.compare(oldPass, storedHashedPassword, (err, valid) => {
          if (err) {
            console.error("Error Comparing passwords:", err);
          } else {
            if (valid) {
              bcrypt.hash(newPassword, saltRounds, async (err, hash) => {
                if (err) {
                  console.error("Error hashing password:", err);
                } else {
                  const result = await db.query("UPDATE users SET password = $1 WHERE email = $2 RETURNING *",
                    [hash, email]
                  );
                  
                  const user = result.rows[0];


                  req.login(user, (err) => {
                    console.error(err);
                    res.redirect("/profile");
                  });
                }
              });
            } else {
              res.render("change.ejs", { error: "Incorrect Old Password!",
                formData: { oldPass, newPassword, confirm, secretWord }
              });
            }
          }
        });
      }
    } catch (error) {
      console.error(error);
      return res.render("change.ejs", { error: "An error occured, please try again later." });
    }
  } else {
    res.redirect("/login-form");
  }
});

// ============================================================================================================

// Function to Delete User Account
app.post("/delete", async (req, res) => {
  if (req.isAuthenticated()) {
    const email = req.user.email;
    const id = req.user.id;

    const { password, secretWord } = req.body;


    try {
      const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    
      if (result.rows.length > 0) {
        const user = result.rows[0];
        const storedHashedPassword = user.password;
        const storedSecret = user.secret_word;


        if (secretWord !== storedSecret) {
          res.render("delete.ejs", { error: "Incorrect Secret Word!",
            formData: { password, secretWord }
          });
          return; // Stop execution
        } 


        bcrypt.compare(password, storedHashedPassword, async (err, valid) => {
          if (err) {
            console.error("Error Comparing Password:", err);
          } else {
            if (valid) {

              await db.query("DELETE FROM notes WHERE user_id = $1", [id]);
              await db.query("DELETE FROM books WHERE user_id = $1", [id]);
              await db.query("DELETE FROM noisbnnotes WHERE user_id = $1", [id]);
              await db.query("DELETE FROM noisbnbooks WHERE user_id = $1", [id]);
              await db.query("DELETE FROM users WHERE id = $1", [id]);

              req.session.destroy(); // Logs user out

              res.redirect("/");

              // res.status(200).send("Deleted successfully");
            } else {
              res.render("delete.ejs", { error: "Wrong Password!",
                formData: { password, secretWord }
              });
            }
          }
        });
        
      } else {
        res.render("delete.ejs", { error: "User does not exist!" });
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      return res.render("delete.ejs", { error: "Error deleting account, please try again." });
    }
  } else {
    res.redirect("/login-form");
  }
});

// ===============================================================================================================

// Display details of each selected book
app.get("/display/:source_table/:id", async (req, res) => {
  if (req.isAuthenticated()) {
    try {
      const { source_table, id } = req.params;

      let query;

      if (source_table === "with_isbn") {
        query = `
              SELECT 
              books.*,
              notes.summary,
              notes.note,
              TO_CHAR(created_at AT TIME ZONE u.time_zone, 'YYYY/MM/DD HH12:MI AM') AS formatted_timestamp
              FROM books
              LEFT JOIN notes ON books.id = notes.book_id 
              LEFT JOIN users u ON books.user_id = u.id
              WHERE books.id = $1
              `;
      } else {
        query = `
              SELECT 
              noisbnbooks.*,
              noisbnnotes.summary,
              noisbnnotes.note,
              TO_CHAR(created_at AT TIME ZONE u.time_zone, 'YYYY/MM/DD HH12:MI AM') AS formatted_timestamp
              FROM noisbnbooks 
              LEFT JOIN noisbnnotes ON noisbnbooks.id = noisbnnotes.book_id 
              LEFT JOIN users u ON noisbnbooks.user_id = u.id
              WHERE noisbnbooks.id = $1
              `;
      }
  
      const result = await db.query(query, [id]);
      
  
      res.render("display.ejs", { item: result.rows, source_table });
    } catch (error) {
      console.error(error);
      return res.render("display.ejs", { error: "An error occured, please try again later." });
    }
  } else {
    res.redirect("/login-form");
  }
});

// ===========================================================================================================

// Visitors Display view of each selected book
app.get("/visitor-display/:source_table/:id", async (req, res) => {
  try {
    const currentPage = req.query.currentPage;
    const { source_table, id } = req.params;

    let query;

    if (source_table === "with_isbn") {
      query = `SELECT 
              books.*,
              notes.*,
              users.id AS user_id,
              users.first_name AS first_name,
              users.last_name AS last_name
            FROM books 
            LEFT JOIN notes ON books.id = notes.book_id 
            LEFT JOIN users ON books.user_id = users.id
            WHERE books.id = $1`;
    } else {
      query = `SELECT 
              noisbnbooks.*,
              noisbnnotes.*,
              users.id AS user_id,
              users.first_name AS first_name,
              users.last_name AS last_name
            FROM noisbnbooks 
            LEFT JOIN noisbnnotes ON noisbnbooks.id = noisbnnotes.book_id 
            LEFT JOIN users ON noisbnbooks.user_id = users.id
            WHERE noisbnbooks.id = $1`;
    }

    const result = await db.query(query, [id]);


    res.render("visitor-display.ejs", { item: result.rows[0], source_table, currentPage });
  } catch (error) {
    console.error(error);
    return res.render("visitor-display.ejs", { error: "An error occured, please try again later." });
  }
});

// ============================================================================================================

// Edit selected book
app.get("/edit/:source_table/:id", async (req, res) => {
  if (req.isAuthenticated()) {
    try {
      const { source_table, id } = req.params;

      let query;

      let filePath;

      if (source_table === "with_isbn") {
        query = `SELECT * FROM books LEFT JOIN notes ON notes.book_id = books.id WHERE id = $1`;
      } else {
        query = `SELECT * FROM noisbnbooks LEFT JOIN noisbnnotes ON noisbnnotes.book_id = noisbnbooks.id WHERE id = $1`;
      }

      const result = await db.query(query, [id]);

      const  previousCover = await db.query("SELECT book_cover FROM noisbnbooks WHERE id = $1", [id]);
      
      if (source_table === "without_isbn") {
        filePath = previousCover.rows[0].book_cover;
      }
  
      res.render("edit.ejs", { item: result.rows, source_table, filePath });
    } catch (error) {
      console.error(error);
      return res.render("edit.ejs", { error: "An error occured, please try again later." });
    }
  } else {
    res.redirect("/login-form");
  }
});

// ============================================================================================================

// Update selected book's details to the Database
app.post("/edit-book/:source_table/:id", upload.single("book_cover"), async (req, res) => {
  try {
    const { source_table, id } = req.params;
    
    // Books with ISBNs
    if (source_table === "with_isbn") {
      const bookTitle = req.body.editTitle;
      const bookIsbn = req.body.editIsbn;
      const bookRating = req.body.editRating;
      const bookSummary = req.body.editSummary.replace(/\\n/g, '\n');
      const bookNote = req.body.editNote.replace(/\\n/g, '\n'); // Convert a plain \n to an actual newline character

      const coverUrl = `https://covers.openlibrary.org/b/isbn/${bookIsbn}-M.jpg?default=false`;

      const result = await db.query("SELECT * FROM books JOIN notes ON books.id = notes.book_id WHERE id = $1", [id]);

      if (isNaN(bookRating)) { 
        res.render("edit.ejs", { item: result.rows, source_table, error: "Please enter a number on Rating!" });
        return; // Stop execution
      } else if (bookRating > 10) {
        res.render("edit.ejs", { item: result.rows, source_table, error: "Rating must not be greater than 10!"});
        return; // Stop execution
      }
    
      await db.query("UPDATE books SET title = $1, isbn = $2, rating = $3, book_cover = $4 WHERE id = $5", 
      [bookTitle, bookIsbn, bookRating, coverUrl, id]);
      
      await db.query("UPDATE notes SET note = $1, summary = $2 WHERE book_id = $3", [bookNote, bookSummary, id]);
    
      res.redirect("/profile");
    } else {
      // Books without ISBNs

      const bookTitle = req.body.editTitle;
      const bookRating = req.body.editRating;
      const bookSummary = req.body.editSummary.replace(/\\n/g, '\n');
      const bookNote = req.body.editNote.replace(/\\n/g, '\n'); // Convert a plain \n to an actual newline character

      let filePath;

      if (req.file) {
        filePath = `/uploads/${req.file.filename}`; // Newly uploaded image
      } else {
        const previousCover = await db.query("SELECT book_cover FROM noisbnbooks WHERE id = $1", [id]);
        filePath = previousCover.rows[0].book_cover; // Stored image from Database
      }

      const result = await db.query(
        "SELECT * FROM noisbnbooks JOIN noisbnnotes ON noisbnbooks.id = noisbnnotes.book_id WHERE id = $1", 
        [id]
      );

      if (isNaN(bookRating)) { 
        res.render("edit.ejs", { item: result.rows, filePath, source_table, error: "Please enter a number on Rating!" });
        return; // Stop execution
      } else if (bookRating > 10) {
        res.render("edit.ejs", { item: result.rows, filePath, source_table, error: "Rating must not be greater than 10!"});
        return; // Stop execution
      }
      
    
      await db.query("UPDATE noisbnbooks SET title = $1, rating = $2, book_cover = $3 WHERE id = $4", 
      [bookTitle, bookRating, filePath, id]);
      
      await db.query("UPDATE noisbnnotes SET summary = $1, note = $2 WHERE book_id = $3", 
      [bookSummary, bookNote, id]);
    
      res.redirect("/profile");
    }
  } catch (error) {
    console.error(error);
    return res.render("edit.ejs", { errorMsg: "An error occured, please try again later." }); 
  }
});

// ============================================================================================================

// Delete Book
app.get("/delete/:source_table/:id", async (req, res) => {
  try {
    const { source_table, id } = req.params;

    if (source_table === "with_isbn") {
      await db.query("DELETE FROM notes WHERE book_id = $1", [id])

      await db.query("DELETE FROM books WHERE id = $1", [id]);
    } else {
      await db.query("DELETE FROM noisbnnotes WHERE book_id = $1", [id])

      await db.query("DELETE FROM noisbnbooks WHERE id = $1", [id]);
    }

    res.redirect("/profile");
  } catch (error) {
    console.error(error);
    return res.render("display.ejs", { error: "An error occured, please try again later." });
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