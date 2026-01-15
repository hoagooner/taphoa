// ==============================
// Column names in the Google Sheets (Sheet1/product data)
// ==============================
const SKU = "SKU";
const NAME = "Tên sản phẩm";
const CATEGORY = "Danh mục";
const BRAND = "Thương hiệu";
const IMAGE = "Hình ảnh";
const DESCRIPTION = "Ghi chú";
const DATE_ADDED = "Cập nhật";
// ==============================
const DEFAULT_IMAGE_URL = "/images/no-image.jpg";
const EMPTY_PRODUCT = {
    [SKU]: "",
    [NAME]: "",
    [CATEGORY]: "",
    [BRAND]: "",
    [IMAGE]: DEFAULT_IMAGE_URL,
    [DESCRIPTION]: "",
    previewImageUrl: ""
};

// ==============================
// Units
// ==============================
const UNIT_BOTTLE = "chai";        // Bottle
const UNIT_CAN = "lon";            // Can
const UNIT_BOX = "hộp";            // Box
const UNIT_PACKET = "gói";         // Packet
const UNIT_ROLL = "cuộn";          // Roll
const UNIT_RICE_CUP = "lon gạo";   // Rice Cup
const UNIT_KG = "kg";              // Kilogram
const UNIT_100GRAM = "lạng";       // Tael (Vietnamese weight unit)
const UNIT_LITER = "lít";          // Liter
const UNIT_500ML = "500ml";        // Milliliter
const UNIT_ITEM = "cái";           // Item / Piece
const UNIT_SACK = "bao";           // Sack / Bag
const UNIT_BAG = "bịch";           // Bag / Pouch
const UNIT_PACK = "lốc";           // Pack
const UNIT_CARTON = "thùng";       // Carton / Box
// ==============================
const SODA = ["Nước ngọt", "Nước yến", "Nước khoáng", "Nước suối", "Nước tăng lực", "Nước", "Yến sào", "Sữa"];
// ==============================
// Weight & Volume Units
// ==============================
const VOLUMN_UNIT = [UNIT_100GRAM, UNIT_KG, UNIT_LITER, UNIT_500ML];
const CATEGORY_BY_PIECE_OR_KG = ["Trứng gà", "Trứng vịt"];

const CATEGORY_DISPLAY_NUMBER = 15;

// ==============================
// Get Product/category List
// ==============================
const SHEET_ID = "1pc9zuB3fkrSWypGQaVECfCLBLXC2B6FOkBW1eXZnZyM";
const PRODUCT_SHEET_NAME = "products";
const UNIT_SHEET_NAME = "unit";
const CATEGORY_SHEET_NAME = "category";
const sheetUrl = (sheetName) => `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${sheetName}`;
// ==============================

// ==============================
// Update Product
// ==============================
const DEPLOYMENT_ID = "AKfycbzOFugf1Sl-dM4B86tAv6OY72FeIu-BsH1niU065nHujrDFN0eKZEA_zql0t92qEP1q"
const PRODUCT_EXC_URL = `https://script.google.com/macros/s/${DEPLOYMENT_ID}/exec`;
// ==============================

// ==============================
// imgdb
// ==============================
const IMGDB_API_KEY = "2fd8a5a89f7fc056b4297bebeb4dc9d9";
const IMGDB_URL = "https://api.imgbb.com/1/upload"
// ==============================