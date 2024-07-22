const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!isValid(username)) {
            // Add the new user to the users array
            users.push({ "username": username, "password": password });
            return res.status(200).send(JSON.stringify({ message: "User successfully registered. Now you can login" }) + "\n");
        } else {
            return res.status(404).send(JSON.stringify({ message: "User already exists!" }) + "\n");
        }
    }
    // Return error if username or password is missing
    return res.status(404).send(JSON.stringify({ message: "Unable to register user." }) + "\n");
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try {
        let allBooks = await res.send(JSON.stringify(books, null, 4));
        res.send(allBooks);
    }
    catch (err) {
        res.status(500).send(err);
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    try {
        const isbn = req.params.isbn;
        let bookByIsbn = await res.send(JSON.stringify(books[isbn]) + "\n");
        res.send(bookByIsbn);
    }
    catch (err) {
        res.status(500).send(err);
    }
});

// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    try {

        let booksByAuthor = await (() => {
            let author = req.params.author;
            let booksByAuthor = [];

            for (let [isbn, book] of Object.entries(books)) {
                if (book.author === author) {
                    booksByAuthor.push(book);
                }
            }
        })();

        if (booksByAuthor.length > 0) {
            res.send(JSON.stringify(booksByAuthor) + "\n");
        }
        else {
            res.status(404).send(JSON.stringify({ message: "Author not found" }) + "\n");
        }
    }
    catch (err) {
        res.status(500).send(err);
    }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    try {

        let booksByTitle = await (() => {
            let title = req.params.title;
            let booksByTitle = [];

            for (let [isbn, book] of Object.entries(books)) {
                if (book.title === title) {
                    booksByTitle.push(book);
                }
            } 
        })();

        if (booksByTitle.length > 0) {
            res.send(JSON.stringify(booksByTitle) + "\n");
        }
        else {
            res.status(404).send(JSON.stringify({ message: "Title not found" }) + "\n");
        }
    }
    catch (err) {
        res.status(500).send(err);
    }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    res.send(JSON.stringify(books[isbn].reviews) + "\n");
});

module.exports.general = public_users;
