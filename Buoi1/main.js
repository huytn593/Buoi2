// Bài tập buổi 1
// Câu 1: Constructor Function
function Product(name, category, price, quantity, isAvailable) {
    this.name = name;
    this.category = category;
    this.price = price;
    this.quantity = quantity;
    this.isAvailable = isAvailable;
}

// Câu 2: Khởi tạo dữ liệu (Biến toàn cục để các hàm đều dùng được)
const products = [
    new Product("MacBook Pro M2", "Electronics", 35000000, 5, true),
    new Product("iPhone 15", "Electronics", 28000000, 0, true),
    new Product("Samsung Galaxy S24", "Electronics", 31000000, 10, true),
    new Product("Logitech Mouse", "Accessories", 1500000, 50, true),
    new Product("Mechanical Keyboard", "Accessories", 2500000, 0, false),
    new Product("Dell Monitor", "Electronics", 8000000, 12, true)
];

function display(title, data) {
    const outputDiv = document.getElementById('output');
    
    let content = "";
    if (typeof data === 'object') {
        content = JSON.stringify(data, null, 4); 
    } else {
        content = data;
    }

    outputDiv.innerHTML = `<span class="highlight">--- ${title} ---</span>\n\n${content}`;
}

function showAllProducts() {
    display("Câu 2: Toàn bộ danh sách sản phẩm", products);
}

function showNamePrice() {
    // Câu 3
    const result = products.map(p => ({ name: p.name, price: p.price }));
    display("Câu 3: Chỉ lấy Tên và Giá", result);
}

function filterInStock() {
    // Câu 4
    const result = products.filter(p => p.quantity > 0);
    display("Câu 4: Các sản phẩm còn hàng (Quantity > 0)", result);
}

function checkExpensive() {
    // Câu 5
    const hasExpensive = products.some(p => p.price > 30000000);
    display("Câu 5: Có sản phẩm nào trên 30 triệu không?", hasExpensive ? "CÓ" : "KHÔNG");
}

function checkAccessories() {
    // Câu 6
    const accessories = products.filter(p => p.category === 'Accessories');
    const allAvailable = accessories.every(p => p.isAvailable === true);
    display("Câu 6: Tất cả Accessories có đang bán không?", 
            allAvailable ? "Đúng, tất cả đang bán" : "Sai, có cái ngừng bán");
}

function calcTotalValue() {
    // Câu 7
    const total = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    const money = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total);
    display("Câu 7: Tổng giá trị kho hàng", money);
}

function loopForOf() {
    // Câu 8
    let logText = "";
    for (const p of products) {
        const status = p.isAvailable ? "Đang bán" : "Ngừng bán";
        logText += `${p.name} - ${p.category} - ${status}\n`;
    }
    display("Câu 8: Duyệt mảng (For...Of)", logText);
}

function loopForIn() {
    // Câu 9
    let logText = "Duyệt properties của sản phẩm đầu tiên:\n";
    const firstProduct = products[0];
    
    for (const key in firstProduct) {
        logText += `Key: ${key} -> Value: ${firstProduct[key]}\n`;
    }
    display("Câu 9: Duyệt đối tượng (For...In)", logText);
}

function getSellingProducts() {
    // Câu 10
    const result = products
        .filter(p => p.isAvailable && p.quantity > 0)
        .map(p => p.name);
    display("Câu 10: Tên SP đang bán & còn hàng", result);
}