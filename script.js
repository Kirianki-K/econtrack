/* script.js */
/**
 * Economics-themed loading animation: animated spinning coin with $ symbol.
 * Shows on page load, hides after DOMContentLoaded.
 */
(function showEconomicsLoader() {
    // Create loader container
    const loader = createElement('div', { id: 'econ-loader' },
        createElement('div', { class: 'econ-coin' },
            createElement('span', { class: 'econ-dollar' }, '$')
        ),
        createElement('div', { class: 'econ-loader-text' }, 'Loading Economics...')
    );
    document.body.appendChild(loader);

    // Hide loader after DOM is ready
    window.addEventListener('DOMContentLoaded', () => {
        loader.style.opacity = '0';
        setTimeout(() => loader.remove(), 600);
    });

    // Inject loader styles
    const loaderStyle = document.createElement('style');
    loaderStyle.textContent = `
        #econ-loader {
            position: fixed;
            z-index: 3000;
            top: 0; left: 0; right: 0; bottom: 0;
            background: linear-gradient(120deg, #f7f7fa 60%, #e3e9f7 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            transition: opacity 0.5s;
        }
        .econ-coin {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: radial-gradient(circle at 30% 30%, #ffe066 70%, #e1b800 100%);
            box-shadow: 0 4px 24px rgba(200,180,60,0.18);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2.7rem;
            position: relative;
            animation: econ-spin 1.2s cubic-bezier(.68,-0.55,.27,1.55) infinite;
        }
        .econ-dollar {
            font-family: 'Segoe UI', Arial, sans-serif;
            color: #fff;
            text-shadow: 0 2px 8px #bfa700, 0 0 2px #fff;
            font-weight: bold;
            font-size: 2.2rem;
            user-select: none;
        }
        .econ-loader-text {
            margin-top: 24px;
            font-size: 1.2rem;
            color: #bfa700;
            letter-spacing: 1px;
            font-weight: 500;
            text-shadow: 0 1px 0 #fff;
        }
        @keyframes econ-spin {
            0% { transform: rotateY(0deg) scale(1); }
            40% { transform: rotateY(180deg) scale(1.08); }
            80% { transform: rotateY(360deg) scale(1); }
            100% { transform: rotateY(360deg) scale(1); }
        }
    `;
    document.head.appendChild(loaderStyle);
})();
// Utility: Create DOM elements easily
function createElement(tag, attrs = {}, ...children) {
    const el = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) {
        if (key.startsWith('on') && typeof value === 'function') {
            el.addEventListener(key.substring(2).toLowerCase(), value);
        } else if (key === 'class') {
            el.className = value;
        } else if (key === 'style' && typeof value === 'object') {
            Object.assign(el.style, value);
        } else {
            el.setAttribute(key, value);
        }
    }
    for (const child of children) {
        if (typeof child === 'string') el.appendChild(document.createTextNode(child));
        else if (child) el.appendChild(child);
    }
    return el;
}

// Notification system
function showNotification(message, type = 'info', duration = 2500) {
    let bar = document.getElementById('status-bar');
    if (!bar) {
        bar = createElement('div', { id: 'status-bar', class: 'status-bar' });
        document.body.appendChild(bar);
    }
    bar.textContent = message;
    bar.className = `status-bar ${type}`;
    bar.style.opacity = '1';
    setTimeout(() => { bar.style.opacity = '0'; }, duration);
}

// Animated cart icon
function showCartIcon(count = 0) {
    let cart = document.getElementById('cart-icon');
    if (!cart) {
        cart = createElement('div', { id: 'cart-icon', class: 'cart-rolling' },
            createElement('span', { class: 'cart-emoji' }, '🛒'),
            createElement('span', { class: 'cart-count' }, count > 0 ? count : '')
        );
        document.body.appendChild(cart);
    }
    cart.querySelector('.cart-count').textContent = count > 0 ? count : '';
    cart.style.display = 'block';
    cart.classList.remove('cart-animate');
    void cart.offsetWidth; // trigger reflow
    cart.classList.add('cart-animate');
    setTimeout(() => { cart.style.display = 'none'; }, 1500);
}

// Modal dialog
function showModal(title, content, onClose) {
    let modal = document.getElementById('modal');
    if (modal) modal.remove();
    modal = createElement('div', { id: 'modal', class: 'modal-bg' },
        createElement('div', { class: 'modal-box' },
            createElement('div', { class: 'modal-header' },
                createElement('span', { class: 'modal-title' }, title),
                createElement('button', { class: 'modal-close', onclick: () => { modal.remove(); onClose && onClose(); } }, '×')
            ),
            createElement('div', { class: 'modal-content' }, content)
        )
    );
    document.body.appendChild(modal);
}

// Table row for sales item
function createSaleRow(item, idx, onEdit, onRemove) {
    return createElement('tr', {},
        createElement('td', {}, item.name),
        createElement('td', {}, item.qty),
        createElement('td', {}, `$${item.price.toFixed(2)}`),
        createElement('td', {}, `$${(item.qty * item.price).toFixed(2)}`),
        createElement('td', { style: { textAlign: 'center' } },
            createElement('button', { class: 'edit-btn', title: 'Edit', onclick: () => onEdit(idx) }, '✏️'),
            createElement('button', { class: 'remove-btn', title: 'Remove', onclick: () => onRemove(idx) }, '🗑️')
        )
    );
}

// Sales table
function renderSalesTable(items, onEdit, onRemove) {
    const rows = items.map((item, idx) => createSaleRow(item, idx, onEdit, onRemove));
    const total = items.reduce((sum, i) => sum + i.qty * i.price, 0);
    return createElement('div', { class: 'sales-table-container' },
        createElement('table', { class: 'sales-table' },
            createElement('thead', {},
                createElement('tr', {},
                    ...['Product', 'Qty', 'Price', 'Subtotal', ''].map(h => createElement('th', {}, h))
                )
            ),
            createElement('tbody', {}, ...rows)
        ),
        createElement('div', { class: 'total-bar' }, `Total: $${total.toFixed(2)}`)
    );
}

// Add/Edit item form
function createItemForm(onSubmit, initial = {}) {
    const nameInput = createElement('input', { type: 'text', placeholder: 'Product name', required: true, value: initial.name || '' });
    const qtyInput = createElement('input', { type: 'number', min: 1, value: initial.qty || 1, required: true });
    const priceInput = createElement('input', { type: 'number', min: 0.01, step: 0.01, placeholder: 'Price', required: true, value: initial.price || '' });
    const form = createElement('form', { class: 'add-item-form', onsubmit: e => {
        e.preventDefault();
        const name = nameInput.value.trim();
        const qty = parseInt(qtyInput.value, 10);
        const price = parseFloat(priceInput.value);
        if (!name || qty < 1 || price < 0.01) {
            showNotification('Please enter valid item details.', 'error');
            return;
        }
        onSubmit({ name, qty, price });
    }},
        nameInput,
        qtyInput,
        priceInput,
        createElement('button', { type: 'submit', class: 'add-btn' }, initial.name ? 'Update' : 'Add')
    );
    return form;
}

// Filter/search bar
function createSearchBar(onSearch) {
    const input = createElement('input', {
        type: 'search',
        placeholder: 'Search products...',
        class: 'search-bar',
        oninput: e => onSearch(e.target.value)
    });
    return input;
}

// Main App
function SalesApp(root) {
    let items = [];
    let filteredItems = [];
    let searchTerm = '';

    function updateFiltered() {
        filteredItems = searchTerm
            ? items.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()))
            : items.slice();
    }

    function render() {
        updateFiltered();
        root.innerHTML = '';
        root.appendChild(createElement('h2', {}, 'Sales App'));
        root.appendChild(
            createItemForm(item => {
                items.push(item);
                showCartIcon(items.length);
                showNotification('Item added!', 'success');
                render();
            })
        );
        root.appendChild(
            createSearchBar(term => {
                searchTerm = term;
                render();
            })
        );
        if (filteredItems.length) {
            root.appendChild(
                renderSalesTable(filteredItems,
                    idx => editItem(idx),
                    idx => removeItem(idx)
                )
            );
            root.appendChild(
                createElement('button', {
                    class: 'clear-btn',
                    onclick: () => {
                        if (confirm('Clear all items?')) {
                            items = [];
                            showNotification('All items cleared.', 'info');
                            render();
                        }
                    }
                }, 'Clear All')
            );
        } else {
            root.appendChild(
                createElement('div', { class: 'empty-msg' }, 'No items yet. Add a product!')
            );
        }
    }

    function editItem(idx) {
        const item = filteredItems[idx];
        const realIdx = items.indexOf(item);
        showModal('Edit Item', createItemForm(updated => {
            items[realIdx] = updated;
            showNotification('Item updated.', 'success');
            document.getElementById('modal').remove();
            render();
        }, item));
    }

    function removeItem(idx) {
        const item = filteredItems[idx];
        items = items.filter(i => i !== item);
        showCartIcon(items.length);
        showNotification('Item removed.', 'info');
        render();
    }

    // Show cart icon on window open
    window.addEventListener('DOMContentLoaded', () => {
        showCartIcon();
        render();
    });
}

// Inject styles
function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
        body {
            font-family: 'Segoe UI', Arial, sans-serif;
            background: linear-gradient(120deg, #f7f7fa 60%, #e3e9f7 100%);
            margin: 0;
            padding: 0;
        }
        #cart-icon {
            position: fixed;
            top: 24px;
            right: 24px;
            z-index: 1000;
            font-size: 2.5rem;
            background: #fff;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            padding: 10px 18px 10px 10px;
            display: none;
            transition: box-shadow 0.2s;
        }
        .cart-emoji { margin-right: 6px; }
        .cart-count {
            background: #e74c3c;
            color: #fff;
            border-radius: 50%;
            font-size: 1.1rem;
            padding: 2px 8px;
            margin-left: 2px;
            vertical-align: top;
        }
        .cart-animate {
            animation: cart-roll 1.2s cubic-bezier(.68,-0.55,.27,1.55);
        }
        @keyframes cart-roll {
            0% { transform: translateX(80px) rotate(-20deg); opacity: 0; }
            40% { transform: translateX(-10px) rotate(10deg); opacity: 1; }
            100% { transform: translateX(0) rotate(0deg); opacity: 1; }
        }
        .status-bar {
            position: fixed;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            min-width: 220px;
            background: #222;
            color: #fff;
            padding: 10px 24px;
            border-radius: 0 0 8px 8px;
            font-size: 1rem;
            opacity: 0;
            transition: opacity 0.4s;
            z-index: 999;
            pointer-events: none;
        }
        .status-bar.success { background: #27ae60; }
        .status-bar.error { background: #e74c3c; }
        .status-bar.info { background: #2980b9; }
        .sales-table-container {
            margin: 32px auto 0 auto;
            max-width: 650px;
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 2px 12px rgba(0,0,0,0.07);
            padding: 24px;
        }
        .sales-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
        }
        .sales-table th, .sales-table td {
            padding: 10px 8px;
            text-align: left;
        }
        .sales-table th {
            background: #f0f4f8;
            font-weight: 600;
        }
        .sales-table tr:nth-child(even) td {
            background: #fafbfc;
        }
        .remove-btn, .edit-btn {
            background: none;
            border: none;
            font-size: 1.1rem;
            cursor: pointer;
            margin: 0 2px;
            padding: 4px 7px;
            border-radius: 4px;
            transition: background 0.2s;
        }
        .remove-btn:hover { background: #ffeaea; }
        .edit-btn:hover { background: #eaf6ff; }
        .add-item-form {
            display: flex;
            gap: 10px;
            margin-bottom: 18px;
            flex-wrap: wrap;
        }
        .add-item-form input {
            padding: 8px;
            border: 1px solid #d0d7de;
            border-radius: 4px;
            font-size: 1rem;
            min-width: 120px;
        }
        .add-btn {
            background: #2980b9;
            color: #fff;
            border: none;
            border-radius: 4px;
            padding: 8px 18px;
            font-size: 1rem;
            cursor: pointer;
            transition: background 0.2s;
        }
        .add-btn:hover {
            background: #1c5d99;
        }
        .clear-btn {
            background: #e74c3c;
            color: #fff;
            border: none;
            border-radius: 4px;
            padding: 8px 18px;
            font-size: 1rem;
            cursor: pointer;
            margin: 16px 0 0 0;
            float: right;
            transition: background 0.2s;
        }
        .clear-btn:hover { background: #c0392b; }
        .total-bar {
            text-align: right;
            font-weight: bold;
            font-size: 1.1rem;
            margin-top: 8px;
        }
        .empty-msg {
            text-align: center;
            color: #888;
            margin-top: 32px;
            font-size: 1.1rem;
        }
        .search-bar {
            width: 100%;
            max-width: 320px;
            margin: 0 0 18px 0;
            padding: 8px;
            border: 1px solid #d0d7de;
            border-radius: 4px;
            font-size: 1rem;
            display: block;
        }
        /* Modal styles */
        .modal-bg {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.18);
            z-index: 2000;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .modal-box {
            background: #fff;
            border-radius: 10px;
            box-shadow: 0 4px 24px rgba(0,0,0,0.13);
            min-width: 320px;
            max-width: 90vw;
            padding: 0 0 18px 0;
            animation: modal-pop 0.25s;
        }
        @keyframes modal-pop {
            0% { transform: scale(0.8); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
        }
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 14px 18px 8px 18px;
            border-bottom: 1px solid #f0f0f0;
        }
        .modal-title {
            font-size: 1.1rem;
            font-weight: 600;
        }
        .modal-close {
            background: none;
            border: none;
            font-size: 1.3rem;
            cursor: pointer;
            color: #888;
            padding: 0 6px;
        }
        .modal-content {
            padding: 18px;
        }
    `;
    document.head.appendChild(style);
}

// Initialize app
injectStyles();