const modal = document.getElementById("productModal");
const modalBody = document.getElementById("modalBody");
const saveBtn = document.getElementById("saveBtn");
var previewImageUrl = "";
var categoryWithBrands = []
var categories = []
var brandsByCategory = []

var selectedProduct = EMPTY_PRODUCT;
async function viewDetail(sku) {
    selectedProduct = getProductBySKU(sku);
    modal.style.display = "block";
    let isSoda = SODA.includes(selectedProduct[CATEGORY]);
    modalBody.innerHTML = `
    <input type="hidden" id="modalSKU" value="${selectedProduct[SKU]}">  
    <img src="${selectedProduct.previewImageUrl ? selectedProduct.previewImageUrl : selectedProduct[IMAGE]}" id="modalImage"
        onclick="openImageViewer(this.src)"><br>
    <input type="file" accept="image/*" capture="environment" id="cameraInput" onchange="previewImage();"><br>

    <div class="row">
        Tên <input type="text" id="modalName" value="${selectedProduct[NAME]}"/>
    </div>
    <div id="priceByUnit"></div>
    <label>Ghi chú</label>
    <textarea id="modalDescription">${selectedProduct[DESCRIPTION] || ""}</textarea>
    `;

    // <label>Danh mục</label>
    // <select id="modalCategory"></select></br>
    // <label>Thương hiệu</label>
    // <select id="modalBrand"></select>
    // fetchCategoryAndBrand();

    // Generate price by unit rows
    generatePriceByUnit();
    saveBtn.onclick = updateProduct;
}

function generatePriceByUnit() {
    for (let i = 1; i <= 5; i++) {
        if (selectedProduct[`price_${i}`] || selectedProduct[`unit_${i}`]) {
            createUnitRow();
            let index = document.getElementById("priceByUnit").children.length;
            document.getElementById(`price_${index}`).value = selectedProduct[`price_${i}`];
            document.getElementById(`unit_${index}`).value = selectedProduct[`unit_${i}`];
        }
    }
    let index = document.getElementById("priceByUnit").children.length;
    if (index === 0) {
        createUnitRow();
    }
}

function getProductBySKU(sku) {
    return products.find(p => p[SKU] == sku);
}

function previewImage() {
    const file = document.getElementById('cameraInput').files[0];
    previewImageUrl = URL.createObjectURL(file);
    document.getElementById('modalImage').src = previewImageUrl;
    selectedProduct.previewImageUrl = previewImageUrl;
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
        var imageUrl = await uploadToImgbb();
        if (validateRequest() == false) {
            hideLoading();
            return;
        }
        setSelectedProduct(imageUrl);
        submitProduct("update");
        reflectProductHTML();
    } catch (error) {
        console.error('Error updating product:', error);
    } finally {
        hideLoading();
    }
    closeModal();
}

function setSelectedProduct(imageUrl) {
    if (imageUrl) {
        selectedProduct[IMAGE] = imageUrl;
    }
    selectedProduct[SKU] =
        document.getElementById("modalSKU") ? document.getElementById("modalSKU").value : "A" + Date.now().toString();
    selectedProduct[NAME] = document.getElementById("modalName").value;
    selectedProduct[DESCRIPTION] = document.getElementById("modalDescription").value;
    if (document.getElementById("modalCategory")) {
        selectedProduct[CATEGORY] = document.getElementById("modalCategory").value;
    }
    if (document.getElementById("modalBrand")) {
        selectedProduct[BRAND] = document.getElementById("modalCategory").value;
    }

    // clear previous price/unit
    for (let i = 1; i <= 5; i++) {
        selectedProduct[`price_${i}`] = "";
        selectedProduct[`unit_${i}`] = "";
    }

    var priceByUnit = document.querySelectorAll("#priceByUnit .row")
    if (priceByUnit.length > 0) {
        priceByUnit.forEach((row, index) => {
            selectedProduct[`price_${index + 1}`] = row.querySelector("input").value;
            selectedProduct[`unit_${index + 1}`] = row.querySelector("select").value;
        });
    }
    return selectedProduct;
}

function buildSubmitPayload() {
    return [
        selectedProduct[SKU],
        selectedProduct[NAME],
        selectedProduct[CATEGORY],
        selectedProduct[BRAND],
        selectedProduct[IMAGE],
        selectedProduct[DESCRIPTION],
        new Date().toLocaleString('vi-VN'),
        selectedProduct['price_1'],
        selectedProduct['unit_1'],
        selectedProduct['price_2'],
        selectedProduct['unit_2'],
        selectedProduct['price_3'],
        selectedProduct['unit_3'],
        selectedProduct['price_4'],
        selectedProduct['unit_4'],
        selectedProduct['price_5'],
        selectedProduct['unit_5']
    ];
}

async function submitProduct(action) {
    try {
        var data = buildSubmitPayload();
        const response = await fetch(PRODUCT_EXC_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: action,
                key: data[0],
                values: data
            })
        })
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        console.log('Data', result);
    } catch (error) {
        console.error('Submit failed:', error);
    }
}

function reflectProductHTML() {
    // Update the product in the products array
    const index = products.findIndex(prod => prod[SKU] === selectedProduct[SKU]);
    if (index !== -1) {
        let card =
            document.querySelector(`.product-card input.product-sku[value="${selectedProduct[SKU]}"]`)
                ?.closest('.product-card')
        card.innerHTML = renderProductCard(selectedProduct);
    } else {
        products.push(selectedProduct);
        document.getElementById('productGrid').insertAdjacentHTML("afterbegin",
            `<div class="product-card" onclick='viewDetail("${selectedProduct[SKU]}")'>
                ${renderProductCard(selectedProduct)}
            </div>`);
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
            renderCategoryAndBrand(selectedProduct)
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

async function addProduct() {
    try {
        showLoading();
        var imageUrl = await uploadToImgbb();
        if (validateRequest() == false) {
            hideLoading();
            return;
        }
        setSelectedProduct(imageUrl);
        submitProduct("append");
        reflectProductHTML();
    } catch (error) {
        console.error('Error updating product:', error);
    } finally {
        hideLoading();
    }
    closeModal();
}

function openNewProductModal() {
    selectedProduct = { ...EMPTY_PRODUCT };
    modal.style.display = "block";
    modalBody.innerHTML = generateDetailHTML();
    saveBtn.onclick = addProduct;
}

function generateDetailHTML() {
    return `
        <img src="" id="modalImage" onclick="openImageViewer(this.src)"><br>
        <input type="file" accept="image/*" capture="environment" id="cameraInput" onchange="previewImage();"><br>
        <div class="row">
            Tên <input type="text" id="modalName" value=""/></div>
        <div id="priceByUnit">
           <div class="row">
                Giá
                <input type="text" id="price_1" value=""/>
                <select id="unit_1">
                    <option value="">Đơn vị</option>
                    ${units.map(unit => `<option value="${unit}">${unit}</option>`).join('')}
                </select>
                <button onclick="createUnitRow()" id="addNewUnit">Thêm</button>
           </div>
        </div>
        <label>Ghi chú</label>
        <textarea id="modalDescription"></textarea>`;
}

function validateRequest() {
    const name = document.getElementById("modalName").value;
    // Tên không được để trống
    if (!name) {
        alert("Vui lòng điền tên sản phẩm.");
        return false;
    }
    // Kiểm tra trùng đơn vị giá
    const selectedUnits = getSelectedValues('#priceByUnit select');
    const duplicateUnits = selectedUnits.filter((item, index) => selectedUnits.indexOf(item) !== index);
    if (duplicateUnits.length > 0) {
        const duplicatedValues = [...new Set(duplicateUnits)];
        alert(`Đơn vị giá bị trùng: ${duplicatedValues.join(', ')}`);
        return false;
    }

    return true;
}

function createUnitRow() {
    var index = document.getElementById("priceByUnit").children.length + 1;
    if (index > 5) {
        alert("Chỉ được thêm tối đa 5 đơn vị giá.");
        return;
    }
    const selectedUnits = getSelectedValues('#priceByUnit select');
    const availableUnits = index === 1
        ? ["Đơn vị", ...units] :
        units.filter(unit => !selectedUnits.includes(unit));
    console.log(selectedUnits);

    var row = document.createElement("div");
    row.className = "row";

    var isFirstUnit = index === 1;
    var rowHTML =
        `Giá
            <input type="text" id="price_${index}" value=""/>
            <select id="unit_${index}">
                ${availableUnits.map(unit => `<option value="${unit}">${unit}</option>`).join('')}
            </select>
            ${isFirstUnit ?
            `<button onclick="createUnitRow()" id="addNewUnit">Thêm</button>`
            : `<button onclick="removeUnit(this)" id="removeUnit">Xóa</button>`}
            
        `
    row.innerHTML = rowHTML;
    document.getElementById("priceByUnit").appendChild(row);
}

function removeUnit(button) {
    const row = button.parentElement;
    row.remove();
}

function getSelectedValues(selector) {
    return Array.from(document.querySelectorAll(selector))
        .map(select => select.value)
        .filter(Boolean);
}

function openImageViewer(src) {
    const modal = document.getElementById("imageViewer");
    const img = document.getElementById("viewerImg");

    img.src = src;
    modal.style.display = "flex";
}

function closeImageViewer() {
    document.getElementById("imageViewer").style.display = "none";
}

function onOverlayClick(e) {
    if (e.target.id === "imageViewer") {
        closeImageViewer();
    }
}