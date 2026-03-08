const API_URL = 'https://api.escuelajs.co/api/v1/products';

// State
let products = [];

// DOM Elements
const tableBody = document.getElementById('table-body');
const searchInput = document.getElementById('search-input');
const pageSizeSelect = document.getElementById('page-size');
const paginationDiv = document.getElementById('pagination');

// Sort Buttons
const sortPriceAscBtn = document.getElementById('sort-price-asc');
const sortPriceDescBtn = document.getElementById('sort-price-desc');
const sortNameAscBtn = document.getElementById('sort-name-asc');
const sortNameDescBtn = document.getElementById('sort-name-desc');

let currentPage = 1;
let itemsPerPage = 5;
let filteredProducts = [];
let sortOption = null; // { field: 'price'|'title', direction: 'asc'|'desc' }

// 1. Viet ham getall
async function getAll() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch data');
        products = await response.json();
        // Initial render matches search (empty)
        processData();
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

// 2. Phan tim kiem theo title & 3. Chia trang & 4. Sap xep
function processData() {
    const searchTerm = searchInput.value.toLowerCase();

    // Filter
    filteredProducts = products.filter(product =>
        product.title.toLowerCase().includes(searchTerm)
    );

    // Sort
    if (sortOption) {
        filteredProducts.sort((a, b) => {
            if (sortOption.field === 'price') {
                return sortOption.direction === 'asc' ? a.price - b.price : b.price - a.price;
            } else if (sortOption.field === 'title') {
                const titleA = a.title.toLowerCase();
                const titleB = b.title.toLowerCase();
                if (titleA < titleB) return sortOption.direction === 'asc' ? -1 : 1;
                if (titleA > titleB) return sortOption.direction === 'asc' ? 1 : -1;
                return 0;
            }
        });
    }

    // Paginate
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = filteredProducts.slice(startIndex, endIndex);

    renderTable(paginatedItems);
    renderPagination();
    updateSortUI();
}

// Event Listeners
searchInput.addEventListener('input', () => {
    currentPage = 1;
    processData();
});

pageSizeSelect.addEventListener('change', (e) => {
    itemsPerPage = parseInt(e.target.value);
    currentPage = 1;
    processData();
});

// Sort Event Listeners
function handleSort(field, direction) {
    if (sortOption && sortOption.field === field && sortOption.direction === direction) {
        sortOption = null;
    } else {
        sortOption = { field, direction };
    }
    processData();
}

sortPriceAscBtn.addEventListener('click', () => handleSort('price', 'asc'));
sortPriceDescBtn.addEventListener('click', () => handleSort('price', 'desc'));
sortNameAscBtn.addEventListener('click', () => handleSort('title', 'asc'));
sortNameDescBtn.addEventListener('click', () => handleSort('title', 'desc'));

function updateSortUI() {
    [sortPriceAscBtn, sortPriceDescBtn, sortNameAscBtn, sortNameDescBtn].forEach(btn => btn.classList.remove('active'));

    if (sortOption) {
        if (sortOption.field === 'price' && sortOption.direction === 'asc') sortPriceAscBtn.classList.add('active');
        if (sortOption.field === 'price' && sortOption.direction === 'desc') sortPriceDescBtn.classList.add('active');
        if (sortOption.field === 'title' && sortOption.direction === 'asc') sortNameAscBtn.classList.add('active');
        if (sortOption.field === 'title' && sortOption.direction === 'desc') sortNameDescBtn.classList.add('active');
    }
}

function renderPagination() {
    paginationDiv.innerHTML = '';
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    if (totalPages <= 1) return;

    // Previous Button
    const prevBtn = document.createElement('button');
    prevBtn.textContent = 'Prev';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            processData();
        }
    });
    paginationDiv.appendChild(prevBtn);

    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);

    if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        if (i === currentPage) btn.classList.add('active');
        btn.addEventListener('click', () => {
            currentPage = i;
            processData();
        });
        paginationDiv.appendChild(btn);
    }

    // Next Button
    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Next';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            processData();
        }
    });
    paginationDiv.appendChild(nextBtn);
}

function renderTable(data) {
    tableBody.innerHTML = '';

    data.forEach(product => {
        const row = document.createElement('tr');


        let imageUrl = '';
        if (Array.isArray(product.images) && product.images.length > 0) {

            let img = product.images[0];
            if (img.startsWith('["') && img.endsWith('"]')) {
                img = JSON.parse(img)[0];
            } else if (img.startsWith('[') && img.endsWith(']')) {

                try {
                    img = JSON.parse(img)[0];
                } catch (e) {
                    img = product.images[0];
                }
            }
            imageUrl = img;
        } else {
            imageUrl = product.category.image;
        }

        row.innerHTML = `
            <td>${product.id}</td>
            <td><img src="${imageUrl}" alt="${product.title}" class="product-img"></td>
            <td>${product.title}</td>
            <td>$${product.price}</td>
            <td>${product.category.name}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Init
getAll();
