// Inisialisasi data
let orders = [];
let selectedItems = [];
let itemsList = [];

// Load items from API
async function loadItems() {
    try {
        const response = await fetch('http://localhost:5000/api/items');
        itemsList = await response.json();
        renderItems();
        renderModalItems();
    } catch (error) {
        console.error('Error loading items:', error);
        showToast('Gagal memuat data item', 'error');
    }
}

// Save item to API
async function saveItem(item) {
    try {
        const response = await fetch('http://localhost:5000/api/items', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(item)
        });
        
        if (!response.ok) throw new Error('Failed to save item');
        
        await loadItems();
        showToast('Item berhasil ditambahkan');
    } catch (error) {
        console.error('Error saving item:', error);
        showToast('Gagal menyimpan item', 'error');
    }
}

// Delete item from API
async function deleteItem(itemId) {
    try {
        const response = await fetch(`http://localhost:5000/api/items/${itemId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete item');
        
        await loadItems();
        showToast('Item berhasil dihapus');
    } catch (error) {
        console.error('Error deleting item:', error);
        showToast('Gagal menghapus item', 'error');
    }
}

// Handle form submission untuk item baru
async function handleItemSubmit(event) {
    event.preventDefault();

    const name = document.getElementById('itemName').value;
    const category = document.getElementById('itemCategory').value;
    const price = parseFloat(document.getElementById('itemPrice').value);
    const description = document.getElementById('itemDescription').value;
    const variants = document.getElementById('itemVariants').value
        .split(',')
        .map(v => v.trim())
        .filter(v => v);

    if (!name || !category || isNaN(price) || price <= 0 || !description || variants.length === 0) {
        showToast('Mohon isi semua field dengan benar', 'error');
        return;
    }

    const newItem = {
        id: 'ITEM' + Date.now().toString().slice(-6),
        name,
        category,
        description,
        price,
        variants
    };

    await saveItem(newItem);
    event.target.reset();
}

// Render items dalam grid
function renderItems() {
    const itemsGrid = document.getElementById('items-grid');
    itemsGrid.innerHTML = itemsList.map(item => `
        <div class="bg-white p-4 rounded-lg shadow border hover:shadow-md transition-shadow">
            <div class="flex justify-between items-start">
                <div>
                    <h3 class="text-lg font-semibold text-gray-900">${item.name}</h3>
                    <p class="text-sm text-gray-600 mt-1">${item.description}</p>
                    <p class="text-sm font-medium text-gray-900 mt-2">Rp ${formatNumber(item.price)}</p>
                    <div class="mt-2">
                        <span class="text-xs font-medium text-gray-500">Varian:</span>
                        <div class="flex flex-wrap gap-1 mt-1">
                            ${item.variants.map(variant => 
                                `<span class="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">${variant}</span>`
                            ).join('')}
                        </div>
                    </div>
                </div>
                <button onclick="deleteItem('${item.id}')" 
                    class="text-red-600 hover:text-red-800 focus:outline-none">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Render items in modal
function renderModalItems() {
    const modalItemsGrid = document.getElementById('modal-items-grid');
    if (!modalItemsGrid) return;
    
    modalItemsGrid.innerHTML = itemsList.map(item => `
        <div class="bg-white p-4 rounded-lg shadow border hover:shadow-md transition-shadow">
            <h3 class="text-lg font-semibold text-gray-900">${item.name}</h3>
            <p class="text-sm text-gray-600 mt-1">${item.description}</p>
            <p class="text-sm font-medium text-gray-900 mt-2">Rp ${formatNumber(item.price)}</p>
            <div class="mt-2">
                <span class="text-xs font-medium text-gray-500">Varian:</span>
                <div class="flex flex-wrap gap-1 mt-1">
                    ${item.variants.map(variant => 
                        `<span class="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">${variant}</span>`
                    ).join('')}
                </div>
            </div>
            <button onclick="addToOrder('${item.id}')"
                class="mt-3 w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                Pilih Item
            </button>
        </div>
    `).join('');
}

// Format number to currency
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg text-white ${
        type === 'error' ? 'bg-red-500' : 'bg-green-500'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Load data saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    loadOrders();
    loadItems();
    renderOrders();
    updateProfit();

    // Setup event listeners untuk forms
    document.getElementById('order-form').addEventListener('submit', (e) => {
        handleOrderSubmit(e);
        resetSelectedItems();
    });

    document.getElementById('item-form').addEventListener('submit', handleItemSubmit);
});

// Load orders from localStorage
function loadOrders() {
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
        orders = JSON.parse(savedOrders);
    }
}

// Save orders to localStorage
function saveOrders() {
    localStorage.setItem('orders', JSON.stringify(orders));
}

// Handle order submission
function handleOrderSubmit(event) {
    event.preventDefault();
    
    const customerName = document.getElementById('customerName').value;
    const notes = document.getElementById('notes').value;
    
    if (!customerName || selectedItems.length === 0) {
        showToast('Mohon isi nama pelanggan dan pilih minimal 1 item', 'error');
        return;
    }
    
    const newOrder = {
        id: 'PO' + Date.now().toString().slice(-6),
        customerName,
        items: selectedItems,
        notes,
        total: calculateTotal(),
        date: new Date().toISOString(),
        status: 'pending'
    };
    
    orders.push(newOrder);
    saveOrders();
    renderOrders();
    
    // Reset form
    event.target.reset();
    selectedItems = [];
    renderSelectedItems();
    showToast('Pre order berhasil ditambahkan');
}

// Calculate total price
function calculateTotal() {
    return selectedItems.reduce((total, item) => total + item.price, 0);
}

// Add item to order
function addToOrder(itemId) {
    const item = itemsList.find(item => item.id === itemId);
    if (item) {
        selectedItems.push(item);
        renderSelectedItems();
        showToast('Item ditambahkan ke pre order');
    }
}

// Reset selected items
function resetSelectedItems() {
    selectedItems = [];
    renderSelectedItems();
}

// Render selected items
function renderSelectedItems() {
    const selectedItemsList = document.getElementById('selected-items');
    selectedItemsList.innerHTML = selectedItems.map(item => `
        <div class="flex justify-between items-center py-2 border-b">
            <div>
                <h4 class="font-medium">${item.name}</h4>
                <p class="text-sm text-gray-600">Rp ${formatNumber(item.price)}</p>
            </div>
            <button onclick="removeFromOrder('${item.id}')" class="text-red-600 hover:text-red-800">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
    
    // Update total
    const totalElement = document.getElementById('order-total');
    if (totalElement) {
        totalElement.textContent = `Rp ${formatNumber(calculateTotal())}`;
    }
}

// Remove item from order
function removeFromOrder(itemId) {
    const index = selectedItems.findIndex(item => item.id === itemId);
    if (index !== -1) {
        selectedItems.splice(index, 1);
        renderSelectedItems();
        showToast('Item dihapus dari pre order');
    }
}

// Mark order as complete
function completeOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.status = 'completed';
        saveOrders();
        renderOrders();
        updateProfit();
        showToast('Pre order berhasil diselesaikan');
    }
}

// Render orders
function renderOrders() {
    const pendingOrdersTable = document.getElementById('pending-orders');
    const completedOrdersTable = document.getElementById('completed-orders');
    
    if (pendingOrdersTable) {
        const pendingOrders = orders.filter(order => order.status === 'pending');
        pendingOrdersTable.innerHTML = pendingOrders.map(order => `
            <tr>
                <td class="px-4 py-2">${order.id}</td>
                <td class="px-4 py-2">${order.customerName}</td>
                <td class="px-4 py-2">${order.items.map(item => item.name).join(', ')}</td>
                <td class="px-4 py-2">Rp ${formatNumber(order.total)}</td>
                <td class="px-4 py-2">${new Date(order.date).toLocaleString('id-ID')}</td>
                <td class="px-4 py-2">
                    <button onclick="completeOrder('${order.id}')"
                        class="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">
                        Selesaikan
                    </button>
                </td>
            </tr>
        `).join('');
    }
    
    if (completedOrdersTable) {
        const completedOrders = orders.filter(order => order.status === 'completed');
        completedOrdersTable.innerHTML = completedOrders.map(order => `
            <tr>
                <td class="px-4 py-2">${order.id}</td>
                <td class="px-4 py-2">${order.customerName}</td>
                <td class="px-4 py-2">${order.items.map(item => item.name).join(', ')}</td>
                <td class="px-4 py-2">Rp ${formatNumber(order.total)}</td>
                <td class="px-4 py-2">${new Date(order.date).toLocaleString('id-ID')}</td>
            </tr>
        `).join('');
    }
}

// Update profit calculation
function updateProfit() {
    const completedOrders = orders.filter(order => order.status === 'completed');
    const totalProfit = completedOrders.reduce((sum, order) => sum + order.total, 0);
    const profitElement = document.getElementById('total-profit');
    if (profitElement) {
        profitElement.textContent = `Rp ${formatNumber(totalProfit)}`;
    }
}
