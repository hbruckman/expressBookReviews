const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    //returns boolean
    //write code to check is the username is valid

    // Check if a user with the given username already exists
    // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

// Check if the user with the given username and password exists
const authenticatedUser = (username, password) => {
    // Filter the users array for any user with the same username and password
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}


//only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).send(JSON.stringify({ message: "Error logging in" }) + "\n");
    }

    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });

        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in\n");
    } else {
        return res.status(208).send(JSON.stringify({ message: "Invalid Login. Check username and password" }) + "\n");
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    // Extract review parameter from request URL
    let book = books[isbn];  // Retrieve book object associated with isbn

    if (book) {  // Check if book exists
        const review = req.params.review;
        const user = req.user;
        let entry = book.reviews[user];

        // Update review if provided in request body
        if (entry) {
            book.reviews[user] = review;
            res.send(`Review for book with the isbn ${isbn} updated.\n`);
        }
        else {
            book.reviews.push({user: review});
            res.send(`Review for book with the isbn ${isbn} created.\n`);
        }
    } else {
        // Respond if book with specified isbn is not found
        res.send("Unable to find book!\n");
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
