// ==============================
// Column names in the Google Sheets (Sheet1/product data)
// ==============================
const SKU = "SKU";
const NAME = "Tên sản phẩm";
const CATEGORY = "Danh mục";
const BRAND = "Thương hiệu";
const UNIT_PRICE = "Giá lẻ";
const PACK_PRICE = "Giá lốc";
const BOX_PRICE = "Giá thùng";
const IMAGE = "Hình ảnh";
const UNIT = "Đơn vị";
const DESCRIPTION = "Ghi chú";
const DEFAULT_IMAGE_URL = "/images/no-image.jpg";
// ==============================

// ==============================
// Units
// ==============================
const UNIT_BOTTLE = "chai";        // Bottle
const UNIT_CAN = "lon";            // Can
const UNIT_BOX = "hộp";            // Box
const UNIT_PACKET = "gói";          // Packet
const UNIT_ROLL = "cuộn";          // Roll
const UNIT_RICE_CUP = "lon gạo";    // Rice Cup
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
const PRODUCT_SHEET_NAME = "Sheet1";
const CATEGORY_SHEET_NAME = "Sheet2";
const sheetUrl = (sheetName) => `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${sheetName}`;
// ==============================

// ==============================
// Update Product
// ==============================
const DEPLOYMENT_ID = "AKfycbzMiGT4k-GFXYmcfNsxTqXNAqaGSCB1rlammi2LOFn7YbFqBLW1bOIQEAaSw3c_wu6O"
const PRODUCT_EXC_URL = `https://script.google.com/macros/s/${DEPLOYMENT_ID}/exec`;
// ==============================

// ==============================
// imgdb
// ==============================
const IMGDB_API_KEY = "2fd8a5a89f7fc056b4297bebeb4dc9d9";
const IMGDB_URL = "https://api.imgbb.com/1/upload"
// ==============================