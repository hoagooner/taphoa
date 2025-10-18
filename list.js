var products = [];
var categories = [];
function fetchProducts() {
  document.getElementById('productGrid').innerHTML = "";
  fetch(sheetUrl(PRODUCT_SHEET_NAME))
    .then(res => res.text()) 
    .then(text => {

      products = handleFetchData(text);
      renderProducts(products);

      categories = ["Tất cả", ...getTopCategories(products)];
      renderCategories(categories);
    });
}
fetchProducts();

function handleFetchData(text) {
  const jsonString = text.match(/setResponse\((.*)\);/s)[1];
  const data = JSON.parse(jsonString);

  const cols = data.table.cols.map(c => c.label);
  const rows = data.table.rows.map(r => r.c.map(cell => (cell ? cell.v : null)));

  return rows.map(row => {
    const obj = {};
    row.forEach((val, i) => {
      obj[cols[i]] = val;
    });
    if (obj.hasOwnProperty(IMAGE) && (obj[IMAGE] == null || obj[IMAGE] == "")) {
      obj[IMAGE] = DEFAULT_IMAGE_URL;
    }
    return obj;
  });
}

function getTopCategories(products) {
  const categoryCount = {};
  products.forEach(p => {
    categoryCount[p[CATEGORY]] = (categoryCount[p[CATEGORY]] || 0) + 1;
  });
  const topCategories = Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, CATEGORY_DISPLAY_NUMBER)
    .map(entry => entry[0]);

  return topCategories;
}

function renderProducts(products) {
  const grid = document.getElementById('productGrid');
  grid.innerHTML = "";
  // products = groupAndSortByCategory(products);
  groupAndSortByCategory(products);
  grid.innerHTML = products.map(p => {
    if (p[SKU]) {
      return `
      <div class="product-card">
        ${renderProductCard(p)}
      </div>`
    }
  }
  ).join('');

  // Add event listeners for product cards
  document.querySelectorAll('.product-card').forEach((card, index) => {
    card.addEventListener('click', () => {
      viewDetail(products[index]);
    });
  });
}

function groupAndSortByCategory(products) {
  const grouped = products.reduce((acc, p) => {
    if (!p[CATEGORY]) return acc;
    if (!acc[p[CATEGORY]]) acc[p[CATEGORY]] = [];
    acc[p[CATEGORY]].push(p);
    return acc;
  }, {});

  var sortedGroups = Object.entries(grouped)
    .sort((a, b) => b[1].length - a[1].length);

  const productSortedByCategory = sortedGroups.flatMap(([_, items]) => items);
  products.length = 0;
  products.push(...productSortedByCategory);

  return sortedGroups;
}

function renderProductCard(p, temporaryImageUrl) {
  return `
      <div class="tag">${p[BRAND]}</div>
      <img src="${temporaryImageUrl ? temporaryImageUrl : p[IMAGE]}" alt="${p[NAME]}">
      <div class="product-name">${p[NAME]}</div>
      <div class="product-price">
        <div><span class="price-label">Lẻ:</span> ${p[UNIT_PRICE] ? p[UNIT_PRICE] : ""}₫</div>
        ${p[PACK_PRICE] ? `<div><span class="price-label">Lốc:</span> ${p[PACK_PRICE]}₫</div>` : ''}
        ${p[BOX_PRICE] ? `<div><span class="price-label">Thùng/bao:</span> ${p[BOX_PRICE]}₫</div>` : ''}
      </div>`
}

document.getElementById('searchInput').addEventListener('input', e => {
  if (activeCategoryButton) {
    activeCategoryButton.classList.remove("active");
  }
  const keyword = e.target.value.toLowerCase();
  const filtered = products.filter(p => normalizeString(p[NAME].toLowerCase()).includes(normalizeString(keyword.toLowerCase())));
  renderProducts(filtered);
});


var activeCategoryButton = null;
var selectedCategory = null;
const categoryButtons = document.getElementById("categoryButtons");
function renderCategories(categories) {

  categories.forEach(category => {
    const btn = document.createElement("button");
    btn.textContent = category;
    btn.addEventListener("click", () => {
      if (category == selectedCategory) {
        filterByCategory("Tất cả");
        activeCategoryButton.classList.remove("active");
      } else {
        filterByCategory(category);
        if (activeCategoryButton) {
          activeCategoryButton.classList.remove("active");
        }
        btn.classList.add("active");
        activeCategoryButton = btn;
      }
      selectedCategory = category;
    });
    categoryButtons.appendChild(btn);
  });
}

function filterByCategory(category) {
  var filtered
  if (category === "Tất cả") {
    filtered = products
  } else {
    filtered = products.filter(p => normalizeString(p[CATEGORY].toLowerCase()).includes(normalizeString(category.toLowerCase())));
  }
  renderProducts(filtered);
}

function normalizeString(str) {
  return str
    .normalize("NFD")                 // tách ký tự + dấu
    .replace(/[\u0300-\u036f]/g, "")  // bỏ dấu
    .toLowerCase();                   // chuyển về lowercase
}