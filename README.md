# Express Book Review

Backend application for the IBM online bookstore final project.

Original repository:
https://github.com/ibm-developer-skills-network/expressBookReviews

## Features
- List all books and search by ISBN, author, or title.
- Read book reviews.
- Register users with bcrypt password hashing.
- Log in using sessions and JWT.
- Add, update, and delete the authenticated user's own review.
- Run asynchronous queries with Axios and async/await.

## Run
Open PowerShell in the final_project directory.
Install dependencies: npm.cmd ci
Start the server: npm.cmd start
Server URL: http://localhost:5000

## Verification
Keep the server running.
Open another PowerShell window in final_project.
Run: node .\test-axios.js
This verifies four concurrent Axios queries.

## API
GET / - List all books
GET /isbn/:isbn - Search by ISBN
GET /author/:author - Search by author
GET /title/:title - Search by title
GET /review/:isbn - Read reviews
POST /register - Register
POST /customer/login - Log in
PUT /customer/auth/review/:isbn - Add or update own review
DELETE /customer/auth/review/:isbn - Delete own review

Registration and login accept username and password in JSON.
Review updates accept review in JSON.
Authenticated requests require the login session cookie.

## Assignment evidence
Commands and actual responses for tasks 1-10 are in final_project/evidence.
Task 11 functions are in final_project/router/general.js.
Demonstration JSON inputs are in final_project/test-data.
Session cookies are excluded from Git.

## Data and limitations
The original IBM booksdb.js is preserved.
Keys 1-10 serve as ISBN identifiers for this assignment.
Users, sessions, and review changes are stored in memory.
They reset when the server restarts.
This project is intended for local educational use.

Optional environment variables:
PORT, JWT_SECRET, SESSION_SECRET, BOOK_API_URL.
