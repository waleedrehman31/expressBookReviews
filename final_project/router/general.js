const { json } = require("express");
const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require("axios");
const http = require("http");

public_users.post("/register", (req, res) => {
	//Write your code here
	const username = req.body.username;
	const password = req.body.password;
	if (!username || !password) {
		if (!isValid(username)) {
			users.push({ username: username, password: password });
			return res
				.status(200)
				.json({ message: "User successfully registred. Now you can login" });
		} else {
			return res.status(404).json({ message: "User already exists!" });
		}
	}
	return res.status(404).json({ message: "Unable to register user." });
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
	//Write your code here

	return res.status(300).send(JSON.stringify(books));
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
	//Write your code here
	const isbn = req.params.isbn;
	let book = books[isbn];
	if (book) {
		return res.status(300).send(JSON.stringify(book));
	} else {
		return res.status(404).json({ message: "book not found using isbn" });
	}
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
	//Write your code here
	let a = req.params.author;
	const newAuthorArray = [];
	Object.values(books).map((book) => {
		if (book.author === a) {
			newAuthorArray.push(book);
		}
	});

	if (newAuthorArray) {
		return res.status(300).send(JSON.stringify(newAuthorArray));
	} else {
		return res.status(404).json({ message: "book not found using author" });
	}
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
	//Write your code here
	const title = req.params.title;
	let bookWithTitle = [];
	Object.values(books).map((book) => {
		if (book.title === title) {
			bookWithTitle.push(book);
		}
	});

	if (bookWithTitle) {
		return res.status(300).send(JSON.stringify(bookWithTitle));
	} else {
		return res.status(404).json({ message: "book not found using title" });
	}
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
	//Write your code here
	const isbn = req.params.isbn;
	if (isbn) {
		Object.entries(books).map((book) => {
			if (book[0] === isbn) {
				res.status(300).send(book[1].reviews);
			}
		});
	} else {
		return res.status(404).json({ message: "no book review found using isbn" });
	}
});

const axiosAction = {
	// getting the list of books available in the shop using callback
	getAllBooks: async () => {
		http.get("http://localhost:4000/", (res) => {
			let data = "";
			res.on("error", (e) => {
				console.error(err.response ? err.response.data : err.message);
			});
			res.on("data", (chunk) => {
				data += chunk;
			});

			res.on("end", () => {
				console.log(
					"\n\n======================All Books======================",
				);
				console.log(JSON.parse(data));
			});
		});
	},

	// getting the list of book by isbn using promise
	getBookByisbn: (isbn) => {
		axios
			.get("http://localhost:4000/isbn/" + isbn)
			.then((res) => {
				console.log(
					`\n\n======================Get book by isbn: ${isbn}======================`,
				);
				console.log(res.data);
			})
			.catch((err) => {
				console.error(err.response ? err.response.data : err.message);
			});
	},

	// getting the list of book by author
	getBookByauthor: async (author) => {
		try {
			const { data } = await axios.get(
				"http://localhost:4000/author/" + author,
			);
			console.log(
				`\n\n======================Get book by author: ${author}======================`,
			);
			console.log(data);
		} catch (error) {
			console.error(error.response ? error.response.data : error.message);
		}
	},

	//   getting the list of book by title
	getBookBytitle: async (title) => {
		try {
			const { data } = await axios.get("http://localhost:4000/title/" + title);
			console.log(
				`\n\n======================Get book by title ${title}======================`,
			);
			console.log(data);
		} catch (error) {
			console.error(error.response ? error.response.data : error.message);
		}
	},
};

axiosAction.getAllBooks();
axiosAction.getBookByisbn(1);
axiosAction.getBookByauthor("Hans Christian Andersen");
axiosAction.getBookBytitle("The Epic Of Gilgamesh");

module.exports.general = public_users;
