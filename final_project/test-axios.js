const assert = require('node:assert/strict');
const {
  getAllBooks,
  getBooksByISBN,
  getBooksByAuthor,
  getBooksByTitle
} = require('./router/general.js');

async function main() {
  const [all, isbn, author, title] = await Promise.all([
    getAllBooks(),
    getBooksByISBN('1'),
    getBooksByAuthor('Unknown'),
    getBooksByTitle('Things Fall Apart')
  ]);

  assert.equal(Object.keys(all).length, 10);
  assert.equal(isbn.title, 'Things Fall Apart');
  assert.deepEqual(Object.keys(author).sort(), ['4', '5', '6', '7']);
  assert.equal(title['1'].author, 'Chinua Achebe');

  console.log('PASS: Axios retrieves all 10 books.');
  console.log('PASS: Axios searches by ISBN.');
  console.log('PASS: Axios retrieves all 4 books by Unknown.');
  console.log('PASS: Axios searches by title.');
  console.log('PASS: All four concurrent requests completed.');
}

main().catch((error) => {
  console.error('FAIL:', error.message);
  process.exitCode = 1;
});
