const BOOK_COLLECTION_KEY = "books";
const KEYWORD_KEY = "keyword";

const RENDER_EVENT_KEYWORD = "render";
const RENDER_EVENT = new Event(RENDER_EVENT_KEYWORD);
/**
 * fungsi yang dijalankan ketika mengklik tab nav pada header
 */
let toggleTabHeader = (elm) => {
  // men-reset class active
  document.querySelectorAll(".tab-nav>li").forEach((elm) => {
    elm.classList.remove("active");
  });
  document.querySelectorAll(".header-container").forEach((elm) => {
    elm.classList.remove("active");
  });

  // menambahkan class 'active' pada element yang sedang aktif
  elm.classList.add("active");
  document.querySelector(`#${elm.dataset.ref}`).classList.add("active");
};

/**
 * fungsi untuk mengambil data pada form
 */
const getFormBookValue = (e) => {
  const formData = new FormData(e);
  const formProps = Object.fromEntries(formData);

  let id =
    formProps["form-book-id"] == ""
      ? generateId()
      : parseInt(formProps["form-book-id"]);
  let title = formProps["form-book-title"];
  let author = formProps["form-book-author"];
  let year = formProps["form-book-year"];
  let isComplete = formProps["form-book-is-completed"] == "1";
  let image = formProps["form-book-image"];

  return createBookObject(id, title, author, year, isComplete, image);
};

/**
 * fungsi untuk men-set nilai pada form
 */
const setFormBookValue = (bookObject) => {
  document.getElementById("form-book-id").value = bookObject.id;
  document.getElementById("form-book-title").value = bookObject.title;
  document.getElementById("form-book-author").value = bookObject.author;
  document.getElementById("form-book-year").value = bookObject.year;
  document.getElementById("form-book-is-completed").value =
    bookObject.isComplete ? "1" : "0";
  document.getElementById("form-book-image").value = bookObject.image;
};

/**
 * fungsi untuk mereset nilai form
 */
const resetForm = () => {
  document.getElementById("form-book").reset();
  document.getElementById("search").reset();

  sessionStorage.removeItem(KEYWORD_KEY);
  document.body.dispatchEvent(RENDER_EVENT);
};

/**
 * fungsi mengambil semua koleksi data buku pada local storage
 */
const getBooksLocalStorage = () =>
  JSON.parse(localStorage.getItem(BOOK_COLLECTION_KEY)) ?? [];

/**
 * fungsi mengambil 1 data buku sesudai dengan id
 */
const getBookLocalStorageById = (id) => {
  const books = getBooksLocalStorage();
  const index = books.findIndex((_book) => _book.id == id);
  return index > -1 ? books[index] : undefined;
};

/**
 * fungsi menyimpan data koleksi buku pada local storage
 */
const setBooksLocalStorage = (books = []) =>
  localStorage.setItem(BOOK_COLLECTION_KEY, JSON.stringify(books));

/**
 * fungsi mengambil keyword pencarian pada session storage
 */
const getKeywordSessionStorage = () =>
  sessionStorage.getItem(KEYWORD_KEY) ?? "";

/**
 * fungsi menyimpan keyword pencarian pada session storage
 */
const setKeywordSessionStorage = (keyword) =>
  sessionStorage.setItem(KEYWORD_KEY, keyword);

/**
 * fungsi untuk menangani saat form di-submit
 */
const onFormSubmitHandler = (event) => {
  event.preventDefault();
  // data buku yang di submit
  let bookObject = getFormBookValue(event.target);
  // data buku json di local storage diubah menjadi array
  let books = getBooksLocalStorage();
  // memasukan data buku yang di submit kedalam koleksi
  // dimulai dari mencari apakah id buku pernah dimasukan
  const index = books.findIndex((_book) => _book.id === bookObject.id);
  // jika id di temukan, data buku di index tersebut akan diupdate
  if (index > -1) books[index] = bookObject;
  //jika tidak, data buku ditambahkan
  else books.push(bookObject);
  // koleksi buku disimpan lagi kedalam local storage
  setBooksLocalStorage(books);
  //menampilkan pesan
  alert("Book are saved !");
  resetForm();
};

/**
 * fungsi yang menghandle pencarian
 */
const onSearchSubmitHandler = (event) => {
  event.preventDefault();

  const formData = new FormData(event.currentTarget);
  const formProps = Object.fromEntries(formData);

  setKeywordSessionStorage(formProps["keyword"]);
  setTimeout(() => {
    document.body.dispatchEvent(RENDER_EVENT);
  }, 100);
};

/**
 * fungsi yang menghandle tombol switch
 */
const switchHandler = (e) => {
  const id = e.currentTarget.dataset.ref;
  let isAccept = confirm("Are you sure to move this book ?");
  if (isAccept) {
    const books = getBooksLocalStorage();
    const index = books.findIndex((_book) => _book.id == id);
    books[index]["isComplete"] = !books[index]["isComplete"];
    setBooksLocalStorage(books);
    document.body.dispatchEvent(RENDER_EVENT);
    alert("Book are moved !");
  }
};

/**
 * fungsi yang menghandle tombol edit
 */
const editHandler = (e) => {
  const id = e.currentTarget.dataset.ref;
  const bookObject = getBookLocalStorageById(id);
  setFormBookValue(bookObject);
  document
    .getElementById("form-book")
    .scrollIntoView({ behavior: "smooth", block: "end" });
  document.body.dispatchEvent(RENDER_EVENT);
};

/**
 * fungsi yang menghandle tombol delete
 */
const deleteHandler = (e) => {
  const id = e.currentTarget.dataset.ref;
  let isAccept = confirm("Are you sure to delete this book ?");
  if (isAccept) {
    const books = getBooksLocalStorage();
    const index = books.findIndex((_book) => _book.id == id);
    books.splice(index, 1);
    setBooksLocalStorage(books);
    document.body.dispatchEvent(RENDER_EVENT);
    alert("Book are deleted !");
  }
};

/**
 * fungsi untuk merender data
 */
const renderEventHandler = (ev) => {
  console.log("Event " + ev.type + " telah dijalankan");
  const books = getBooksLocalStorage();
  const keyword = getKeywordSessionStorage();

  console.log("keyword : ", keyword);

  const keywordRegex = new RegExp(keyword, "gi");

  console.log("keywordRegex : ", keywordRegex);

  document.getElementById("readed-book-collection").innerHTML = "";
  document.getElementById("unreaded-book-collection").innerHTML = "";

  let readedBook = books
    .filter((book) => book.isComplete)
    .filter((book) => keywordRegex.test(book.title));

  let unReadedBook = books
    .filter((book) => !book.isComplete)
    .filter((book) => keywordRegex.test(book.title));

  if (readedBook.length > 0) {
    readedBook.forEach((book) => {
      document
        .getElementById("readed-book-collection")
        .appendChild(
          createBookElement(book, switchHandler, editHandler, deleteHandler)
        );
    });
  } else {
    document
      .getElementById("readed-book-collection")
      .appendChild(createBufferCollection());
  }

  if (unReadedBook.length > 0) {
    unReadedBook.forEach((book) => {
      document
        .getElementById("unreaded-book-collection")
        .appendChild(
          createBookElement(book, switchHandler, editHandler, deleteHandler)
        );
    });
  } else {
    document
      .getElementById("unreaded-book-collection")
      .appendChild(createBufferCollection());
  }
};

onDomOnLoad(() => {
  if (getBooksLocalStorage().length <= 0) {
    readTextFile("assets/data/default.json", function (text) {
      let dataDefault = JSON.parse(text);
      setBooksLocalStorage(dataDefault);
    });
  }
});

/**
 * fungsi yang dijalankan ketika dom sudah diload semuanya
 */
onDomReady(() => {
  document.querySelectorAll(".tab-nav>li").forEach((elm, idx) => {
    elm.addEventListener("click", (e) => {
      toggleTabHeader(e.target);
    });
  });

  document
    .getElementById("form-book")
    .addEventListener("submit", (e) => onFormSubmitHandler(e));

  document
    .getElementById("search")
    .addEventListener("submit", (e) => onSearchSubmitHandler(e));

  document.querySelectorAll(".btn-reset").forEach((elm) => {
    elm.addEventListener("click", resetForm);
  });

  document.body.addEventListener(RENDER_EVENT_KEYWORD, renderEventHandler);
  document.body.dispatchEvent(RENDER_EVENT);
});
