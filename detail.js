const modal = document.getElementById("productModal");
const modalBody = document.getElementById("modalBody");
const saveBtn = document.getElementById("saveBtn");
var file = document.getElementById("saveBtn");
var previewImageUrl = "";
var categoryWithBrands = []
var categories = []
var brandsByCategory = []

var selectedProdcut;
function viewDetail(p) {
    selectedProdcut = p;
    modal.style.display = "block";
    modalBody.innerHTML = `
  <input type="hidden" id="modalSKU" value="${p[SKU]}">  
  <img src="${p[IMAGE]}" id="modalImage"><br>
  <input type="file" accept="image/*" capture="environment" id="cameraInput" onchange="previewImage();"><br>

  <label>Tên sản phẩm</label>
  <input type="text" id="modalName" value="${p[NAME]}">

  <label>Giá lẻ ${p[UNIT] ? `(${p[UNIT]})` : ''}</label>
  <input type="number" id="modalUnitPrice" value="${p[UNIT_PRICE]}">

  ${derivePackType(p[UNIT])
            ? `<label>Giá ${derivePackType(p[UNIT])}</label>
       <input type="number" id="modalPackPrice" value="${p[PACK_PRICE]}">`
            : ''}

  ${deriveBoxType(p[UNIT])
            ? `<label>Giá ${deriveBoxType(p[UNIT])}</label>
       <input type="number" id="modalBoxPrice" value="${p[BOX_PRICE]}">`
            : ''}

  <label>Ghi chú</label>
  <textarea id="modalDescription">${p[DESCRIPTION] || ""}</textarea>

  <label>Danh mục</label>
  <select id="modalCategory"></select></br>

  <label>Thương hiệu</label>
  <select id="modalBrand"></select>
    `;

    fetchCategoryAndBrand();
}

function deriveBoxType(unit) {
    if (unit === UNIT_KG) {
        return UNIT_SACK;
    } else if (CATEGORY_BY_PIECE_OR_KG.includes(selectedProdcut[CATEGORY])) {
        return UNIT_KG;
    } else if ([UNIT_100GRAM, UNIT_LITER, UNIT_500ML].includes(unit)) {
        return null;
    } else {
        return UNIT_CARTON;
    }
}

function derivePackType(unit) {
    if (VOLUMN_UNIT.includes(unit)) {
        return null;
    } else if (CATEGORY_BY_PIECE_OR_KG.includes(selectedProdcut[CATEGORY])) {
        return null;
    } else {
        return UNIT_PACK;
    }
}

function previewImage() {
    const file = document.getElementById('cameraInput').files[0];
    previewImageUrl = URL.createObjectURL(file);
    document.getElementById('modalImage').src = previewImageUrl;
}

async function uploadToImgbb() {
    const file = document.getElementById('cameraInput').files[0];
    if (!file) return Promise.resolve();

    const compressedBlob = await compressImage(file);

    const formData = new FormData();
    formData.append('key', IMGDB_API_KEY);
    formData.append('image', compressedBlob);

    const res = await fetch(IMGDB_URL, {
        method: 'POST',
        body: formData
    });

    const data = await res.json();
    if (data.success) {
        return data.data.url;
    } else {
        throw new Error('Failed to upload image to imgbb');
    }
}

function compressImage(file, maxSize = 600, quality = 0.5) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => {
            const img = new Image();
            img.onload = () => {
                let w = img.width;
                let h = img.height;

                // Resize theo maxSize
                if (w > h && w > maxSize) {
                    h *= maxSize / w;
                    w = maxSize;
                } else if (h > maxSize) {
                    w *= maxSize / h;
                    h = maxSize;
                }

                const canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, w, h);

                canvas.toBlob(blob => {
                    resolve(blob);
                }, 'image/jpeg', quality);
            };
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}


// Close modal
function closeModal() {
    modal.style.display = "none";
}

async function updateProduct() {
    try {
        showLoading();

        var imageUrl = await uploadToImgbb(file);
        updateProductObject(imageUrl);
        fetchUpdateProduct();
        reflectProductHTML();
    } catch (error) {
        console.error('Error updating product:', error);
    } finally {
        hideLoading();
    }
    closeModal();
}

function updateProductObject(imageUrl) {
    if (imageUrl) {
        selectedProdcut[IMAGE] = imageUrl;
    }
    selectedProdcut[SKU] = document.getElementById("modalSKU").value;
    selectedProdcut[NAME] = document.getElementById("modalName").value;
    selectedProdcut[UNIT_PRICE] =
        document.getElementById("modalUnitPrice") ? document.getElementById("modalUnitPrice").value : "";
    selectedProdcut[PACK_PRICE] =
        document.getElementById("modalPackPrice") ? document.getElementById("modalPackPrice").value : "";
    selectedProdcut[BOX_PRICE] =
        document.getElementById("modalBoxPrice") ? document.getElementById("modalBoxPrice").value : "";
    selectedProdcut[DESCRIPTION] = document.getElementById("modalDescription").value;
}

function createDataToUpdate() {
    return [
        selectedProdcut[SKU],
        selectedProdcut[NAME],
        selectedProdcut[CATEGORY],
        selectedProdcut[BRAND],
        selectedProdcut[UNIT_PRICE],
        selectedProdcut[PACK_PRICE],
        selectedProdcut[BOX_PRICE],
        selectedProdcut[IMAGE],
        selectedProdcut[UNIT],
        selectedProdcut[DESCRIPTION],
        new Date().toLocaleString('vi-VN')
    ];
}

function fetchUpdateProduct() {
    var data = createDataToUpdate();
    fetch(PRODUCT_EXC_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action: 'update',
            key: data[0],
            values: data
        })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error();
            }
            return response.json();
        })
        .then(data => {
            console.log('Data', data);
        })
        .catch(error => {
            console.error("cors error or network issue");
        });
}

function reflectProductHTML() {
    // Update the product in the products array
    const index = products.findIndex(prod => prod[SKU] === selectedProdcut[SKU]);
    if (index !== -1) {
        document.getElementsByClassName('product-card')[index].innerHTML = renderProductCard(selectedProdcut);
    }
}

const spinner = document.getElementById('loadingSpinner');

function showLoading() {
    spinner.classList.remove('hidden');
}

function hideLoading() {
    spinner.classList.add('hidden');
}

function fetchCategoryAndBrand() {
    if (categoryWithBrands.length > 0) {
        return;
    }
    // document.getElementById('productGrid').innerHTML = "";
    fetch(sheetUrl(CATEGORY_SHEET_NAME))
        .then(res => res.text())
        .then(text => {
            categoryWithBrands = handleFetchData(text);
            renderCategoryAndBrand(selectedProdcut)
        });
}

function renderCategoryAndBrand(p) {
    const categorySelect = document.getElementById("modalCategory");
    const brandSelect = document.getElementById("modalBrand");

    // Danh mục duy nhất
    categories = [...new Set(categoryWithBrands.map(obj => obj[CATEGORY]))];
    categorySelect.innerHTML = categories.map(c =>
        `<option value="${c}" ${c === p[CATEGORY] ? 'selected' : ''}>${c}</option>`
    ).join("");

    // // Render thương hiệu theo danh mục hiện tại
    // const currentCategory = p[CATEGORY];
    // renderBrandOptions(currentCategory, p[BRAND]);

    // // Khi người dùng đổi danh mục → cập nhật thương hiệu tương ứng
    // categorySelect.addEventListener("change", (e) => {
    //     renderBrandOptions(e.target.value);
    // });

    // function renderBrandOptions(category, selectedBrand = "") {
    //     const brands = categoryWithBrands[category] ? Array.from(categoryWithBrands[category]) : [];
    //     brandSelect.innerHTML = brands.length
    //         ? brands.map(b => `<option value="${b}" ${b === selectedBrand ? 'selected' : ''}>${b}</option>`).join("")
    //         : `<option value="">(Không có thương hiệu)</option>`;
    // }
}


function addProduct() {
    modal.style.display = "block";
    modalBody.innerHTML = generateDetailHTML();
    fetchCategoryAndBrand();
}

function generateDetailHTML() {
    return `
        <img src="" id="modalImage"><br>
        <input type="file" accept="image/*" capture="environment" id="cameraInput" onchange="previewImage();"><br>

        <label>Tên sản phẩm</label>
        <input type="text" id="modalName" value="">

        <label>Giá lẻ </label>
        <input type="number" id="modalUnitPrice" value="">

        <label>Ghi chú</label>
        <textarea id="modalDescription"></textarea>`;
}