const productView = document.querySelector('.product-section');
const searchTxt = document.querySelector('#searchTxt');
const searchForm = document.querySelector('#searchForm');
const sortBy = document.querySelector('#sortby');
const categoryView = document.querySelector('.categories_list');
const filterTrigger = document.querySelector('.filter');
const filterContent = document.querySelector('.filter-content');
const overlay = document.querySelector('.overlay');
const main = document.querySelector('.main');
const favourite = document.querySelector('.favourite-holder');

let books = [];
const productCategories = new Set();
const favouriteBooks = getFavourites() || [];

renderFavourites(favouriteBooks);
fetchBooks();

function getFavourites() {
  return JSON.parse(localStorage.getItem('favourites'));
}

function fetchCategories() {
  books.forEach((book) => {
    productCategories.add(book.category);
  });
  const htmlCategories = [...productCategories].map(
    (category) =>
      `<div class="category">
          <input type="radio" id="${category}" name="category" value="${category}" />
          <label for="${category}">${category}</label>
        </div>
        `
  );
  const allOption = `
  <div class="category">
    <input type="radio" checked id="all" name="category" value="all" />
    <label for="all">All</label>
  </div>
  `;
  htmlCategories.unshift(allOption);
  categoryView.innerHTML = htmlCategories.join('');
}

async function fetchBooks() {
  const results = await fetch('data/product.json');
  const { products } = await results.json();
  books = products;
  fetchCategories();
  renderBooks(books);
}

function renderBooks(books) {
  const html = books.map((book) => renderCard(book)).join('');
  productView.innerHTML = html;
}

function renderCard(book) {
  return `
        <div class="product">
          <div class="product-img">
            <img
              src="${book.img}"
              alt="image of ${book.name}"
            />
          </div>
          <div class="product-info">
            <h6>${book.category}</h6>
            <h2>${book.name}</h2>
            <h5>${book.author}</h5>
            <h3>$${book.price}</h3>
            <button data-product-id="${book.id}">Add to favourites</button>
          </div>
        </div>
        `;
}

function searchBooks(e) {
  const q = e.target.value;
  const regEx = new RegExp(`${q}`, 'gi');
  const filteredBooks = books.filter((book) => {
    return (
      book.name.match(regEx) ||
      book.category.match(regEx) ||
      book.author.match(regEx)
    );
  });
  renderBooks(filteredBooks);
}

function sortBooksBy(e) {
  const selectedSort = e.target.value;
  const filteredBooks = sortBooks(selectedSort, [...books]);
  renderBooks(filteredBooks);
}

function sortBooks(sortBy, eBooks) {
  if (!sortBy) return eBooks;
  if (sortBy === 'low') {
    return eBooks.sort((a, b) => a.price - b.price);
  }
  if (sortBy === 'high') {
    return eBooks.sort((a, b) => b.price - a.price);
  }
  return eBooks.sort((a, b) =>
    a[sortBy].toLowerCase() > b[sortBy].toLowerCase() ? 1 : -1
  );
}

function filterBooks(category) {
  const filteredBooks = books.filter((book) => {
    return book.category === category;
  });
  if (category === 'all') {
    renderBooks(books);
  } else renderBooks(filteredBooks);
}

function getProduct(event) {
  const { productId } = event.target?.dataset;
  if (productId) {
    addToFavourites(productId);
  }
}

function addToFavourites(productId) {
  const product = books.find((book) => book.id === +productId);
  favouriteBooks.push(product);
  renderFavourites(favouriteBooks);
  localStorage.setItem('favourites', JSON.stringify(favouriteBooks));
}

function renderFavourites(favouriteBooks) {
  favourite.textContent = favouriteBooks.length;
}

function filterByCategory(event) {
  const selectedCategory = event.target.value;
  filterBooks(selectedCategory);
}

function debounce(fn, delay, immediate) {
  let timeout;

  return function () {
    let context = this,
      args = arguments;

    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(function () {
      timeout = null;
      if (!immediate) {
        fn.apply(context, args);
      }
    }, delay);
    if (callNow) {
      fn.apply(context, args);
    }
  };
}

const searchDebounce = debounce(searchBooks, 500);

searchTxt.addEventListener('input', searchDebounce);

searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  searchBooks(searchTxt.value);
});

sortBy.addEventListener('change', sortBooksBy);

productView.addEventListener('click', getProduct);

categoryView.addEventListener('change', filterByCategory);

filterTrigger.addEventListener('click', () => {
  filterContent.classList.add('open');
  overlay.classList.add('open');
  main.classList.add('open');
});

overlay.addEventListener('click', () => {
  filterContent.classList.remove('open');
  overlay.classList.remove('open');
  main.classList.remove('open');
});
