/**
 * fungsi yang berjalan pada saat body sedang di load
 */
const onDomOnLoad = (callback) => {
  document.body.addEventListener("load", callback());
};

/**
 * fungsi yang dijalankan ketika dom sudah diload semuanya
 */
const onDomReady = (callback) => {
  if (document.readyState != "loading") callback();
  else if (document.addEventListener)
    document.addEventListener("DOMContentLoaded", callback);
  else
    document.attachEvent("onreadystatechange", function () {
      if (document.readyState == "complete") callback();
    });
};

/**
 * fungsi untuk membuat buffer element saat koleksi buku kosong
 */
const createBufferCollection = () => {
  const message = document.createElement("p");
  message.innerText = "Opss, Its empty.";

  const bufferElement = document.createElement("div");
  bufferElement.classList.add("book-buffer");
  bufferElement.appendChild(message);

  return bufferElement;
};

/**
 * fungsi membuat Id unik
 */
const generateId = () => +Date.now();

/**
 * fungsi membuat object buku
 */
const createBookObject = (id, title, author, year, isComplete, image) => {
  if (!id) id = generateId();
  return {
    id,
    title,
    author,
    year,
    isComplete,
    image,
  };
};

/**
 * fungsi read file json
 */
const readTextFile = (file, callback) => {
  var rawFile = new XMLHttpRequest();
  rawFile.overrideMimeType("application/json");
  rawFile.open("GET", file, true);
  rawFile.onreadystatechange = function () {
    if (rawFile.readyState === 4 && rawFile.status == "200") {
      callback(rawFile.responseText);
    }
  };
  rawFile.send(null);
};

const createElement = (tag, classList, innerText, attributes) => {
  const element = document.createElement(tag);
  if (classList) element.classList = classList;
  if (innerText) element.innerText = innerText;

  for (const key in attributes) {
    if (Object.hasOwnProperty.call(attributes, key)) {
      element.setAttribute(key, attributes[key]);
    }
  }
  return element;
};

const createBookElement = (
  bookObject,
  switchHandler,
  editCallback,
  deleteCallback
) => {
  // membuat element image
  const bookCover = createElement("img", "book-bubble", null, {
    alt: bookObject.title,
    src: bookObject.image,
  });

  bookCover.addEventListener("error", () => {
    const defaultImage = "assets/images/book-cover.png";

    bookCover.src = defaultImage;
    bookCover.alt = "default";
  });

  // membuat element info
  const bookTitle = createElement("h3", "book-title", bookObject.title);
  const bookAuthor = createElement("span", "book-author", bookObject.author);
  const bookYear = createElement("span", "book-released-year", bookObject.year);
  const bookInfo = createElement("div", "book-info", null);
  for (const element of [bookTitle, bookAuthor, bookYear]) {
    bookInfo.appendChild(element);
  }
  // membuat footer
  const btnSwitch = createElement("button", "btn btn-info", null, {
    title: "Change shelf",
  });
  btnSwitch.dataset.ref = bookObject.id;
  if (bookObject.isComplete) {
    btnSwitch.appendChild(createElement("i", "fas fa-eye-slash"));
  } else {
    btnSwitch.appendChild(createElement("i", "fas fa-eye"));
  }
  btnSwitch.addEventListener("click", switchHandler);

  const btnEdit = createElement("button", "btn btn-warning", null, {
    title: "Edit",
  });
  btnEdit.dataset.ref = bookObject.id;
  btnEdit.appendChild(createElement("i", "fas fa-edit"));
  btnEdit.addEventListener("click", editCallback);

  const btnDelete = createElement("button", "btn btn-danger", null, {
    title: "Delete",
  });
  btnDelete.dataset.ref = bookObject.id;
  btnDelete.appendChild(createElement("i", "fas fa-trash"));
  btnDelete.addEventListener("click", deleteCallback);
  const bookFooter = createElement("div", "book-footer", null);
  for (const element of [btnSwitch, btnEdit, btnDelete]) {
    bookFooter.appendChild(element);
  }

  const bookContainer = createElement("div", "book-container");
  bookContainer.appendChild(bookInfo);
  bookContainer.appendChild(bookFooter);

  const bookItem = createElement("div", "book-item");
  bookItem.appendChild(bookCover);
  bookItem.appendChild(bookContainer);

  return bookItem;
};
