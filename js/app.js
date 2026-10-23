/**
 * LUMIÈRE BEAUTY — LUXURY COSMETICS STORE
 * University Web Development Project
 * Pure Vanilla JavaScript Application Controller
 * No frameworks, no external libraries.
 */

// Application State
const state = {
  cart: [],
  wishlist: [],
  currentRoute: 'home',
  appliedCoupon: null,
  activeCategory: 'all',
  searchQuery: '',
  maxPrice: 6000,
  minRating: 0,
  sortBy: 'featured',
  activeTag: 'all',
  selectedProduct: null,
  selectedShade: null,
  selectedQty: 1,
  orderHistory: []
};

// Initial Sample Orders for Demo Account (if none in localStorage)
const INITIAL_DEMO_ORDERS = [
  {
    id: "LUM-2026-7842",
    date: "2026-10-18",
    items: [
      { name: "Highland Rose Radiant Serum", quantity: 1, price: 3825, shade: "Standard" },
      { name: "Velvet Lip Soufflé - Kasthamandap", quantity: 1, price: 2125, shade: "Kasthamandap Berry" }
    ],
    subtotal: 5950,
    discount: 892,
    shipping: 0,
    total: 5058,
    paymentMethod: "eSewa Mobile Wallet",
    status: "Delivered",
    address: "Durbar Marg, Kathmandu, Ward 1"
  },
  {
    id: "LUM-2026-5129",
    date: "2026-09-04",
    items: [
      { name: "Lumière Silken Mineral Cushion", quantity: 1, price: 4080, shade: "02 Warm Ivory" }
    ],
    subtotal: 4080,
    discount: 0,
    shipping: 0,
    total: 4080,
    paymentMethod: "Cash on Delivery",
    status: "Delivered",
    address: "Lakeside, Pokhara, Gandaki"
  }
];

// ==========================================================================
// LOCAL STORAGE SYNC
// ==========================================================================
function loadFromStorage() {
  try {
    const savedCart = localStorage.getItem('lumiere_cart');
    if (savedCart) state.cart = JSON.parse(savedCart);

    const savedWish = localStorage.getItem('lumiere_wishlist');
    if (savedWish) state.wishlist = JSON.parse(savedWish);

    const savedOrders = localStorage.getItem('lumiere_orders');
    if (savedOrders) {
      state.orderHistory = JSON.parse(savedOrders);
    } else {
      state.orderHistory = [...INITIAL_DEMO_ORDERS];
      localStorage.setItem('lumiere_orders', JSON.stringify(state.orderHistory));
    }

    const savedCoupon = localStorage.getItem('lumiere_coupon');
    if (savedCoupon) state.appliedCoupon = JSON.parse(savedCoupon);
  } catch (err) {
    console.warn("Storage loading failed:", err);
  }
}

function saveToStorage() {
  try {
    localStorage.setItem('lumiere_cart', JSON.stringify(state.cart));
    localStorage.setItem('lumiere_wishlist', JSON.stringify(state.wishlist));
    localStorage.setItem('lumiere_orders', JSON.stringify(state.orderHistory));
    if (state.appliedCoupon) {
      localStorage.setItem('lumiere_coupon', JSON.stringify(state.appliedCoupon));
    } else {
      localStorage.removeItem('lumiere_coupon');
    }
  } catch (err) {
    console.warn("Storage saving failed:", err);
  }
}

// ==========================================================================
// NOTIFICATIONS & TOASTS
// ==========================================================================
function showToast(message, type = 'default') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let icon = 'check_circle';
  if (type === 'error') icon = 'error';
  if (type === 'info') icon = 'info';

  toast.innerHTML = `
    <span class="material-symbols-outlined">${icon}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(15px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// ==========================================================================
// ROUTING & VIEW CONTROLLER
// ==========================================================================
function navigateTo(routeName, param = null) {
  // Update state
  state.currentRoute = routeName;
  window.location.hash = param ? `${routeName}/${param}` : routeName;

  // Toggle active page view
  const pages = document.querySelectorAll('.page-view');
  pages.forEach(page => {
    if (page.getAttribute('data-page') === routeName) {
      page.classList.add('active');
    } else {
      page.classList.remove('active');
    }
  });

  // Update nav links active class
  document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
    const target = link.getAttribute('data-route');
    if (target === routeName) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Close mobile drawer if open
  closeMobileMenu();

  // Route specific initializers
  if (routeName === 'shop') {
    renderShopProducts();
  } else if (routeName === 'product-details' && param) {
    const productId = parseInt(param, 10);
    renderProductDetails(productId);
  } else if (routeName === 'wishlist') {
    renderWishlistPage();
  } else if (routeName === 'cart') {
    renderCartPage();
  } else if (routeName === 'checkout') {
    renderCheckoutSummary();
  } else if (routeName === 'account') {
    renderAccountOrders();
  }
}

function handleHashChange() {
  const hash = window.location.hash.replace('#', '') || 'home';
  const parts = hash.split('/');
  const route = parts[0] || 'home';
  const param = parts[1] || null;

  navigateTo(route, param);
}

// ==========================================================================
// CART FUNCTIONALITY
// ==========================================================================
function addToCart(productId, quantity = 1, shade = null, notify = true) {
  const product = LUMIERE_PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const selectedShadeName = shade || (product.shades.length > 0 ? product.shades[0].name : "Standard");

  // Check if item already exists in cart with matching shade
  const existingIndex = state.cart.findIndex(
    item => item.id === productId && item.shade === selectedShadeName
  );

  if (existingIndex > -1) {
    state.cart[existingIndex].quantity += quantity;
  } else {
    state.cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      shade: selectedShadeName,
      quantity: quantity
    });
  }

  saveToStorage();
  updateHeaderBadges();
  renderCartDrawer();
  if (state.currentRoute === 'cart') renderCartPage();
  if (state.currentRoute === 'checkout') renderCheckoutSummary();

  if (notify) {
    showToast(`Added "${product.name}" (${selectedShadeName}) to Bag`, 'success');
  }
}

function removeFromCart(productId, shade) {
  state.cart = state.cart.filter(item => !(item.id === productId && item.shade === shade));
  saveToStorage();
  updateHeaderBadges();
  renderCartDrawer();
  if (state.currentRoute === 'cart') renderCartPage();
  if (state.currentRoute === 'checkout') renderCheckoutSummary();
  showToast("Item removed from bag", "info");
}

function updateCartQty(productId, shade, change) {
  const item = state.cart.find(i => i.id === productId && i.shade === shade);
  if (!item) return;

  item.quantity += change;
  if (item.quantity <= 0) {
    removeFromCart(productId, shade);
    return;
  }

  saveToStorage();
  updateHeaderBadges();
  renderCartDrawer();
  if (state.currentRoute === 'cart') renderCartPage();
  if (state.currentRoute === 'checkout') renderCheckoutSummary();
}

function calculateCartTotals() {
  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  let discount = 0;
  if (state.appliedCoupon) {
    if (state.appliedCoupon.type === 'percent') {
      discount = Math.round(subtotal * (state.appliedCoupon.value / 100));
    } else if (state.appliedCoupon.type === 'flat') {
      discount = Math.min(subtotal, state.appliedCoupon.value);
    }
  }

  // Free shipping on orders over NPR 4,000, otherwise NPR 200 standard shipping across Nepal
  const shipping = (subtotal === 0 || subtotal >= 4000) ? 0 : 200;
  const grandTotal = Math.max(0, subtotal - discount + shipping);

  return { subtotal, discount, shipping, grandTotal };
}

function renderCartDrawer() {
  const drawerList = document.getElementById('cartDrawerItems');
  const totalsElem = document.getElementById('cartDrawerTotals');
  const emptyElem = document.getElementById('cartDrawerEmpty');
  const progressElem = document.getElementById('freeShipProgress');
  const msgElem = document.getElementById('freeShipMsg');

  if (!drawerList) return;

  const { subtotal, discount, shipping, grandTotal } = calculateCartTotals();

  // Free shipping progress logic (Goal: NPR 4,000)
  if (progressElem && msgElem) {
    if (subtotal >= 4000) {
      progressElem.style.width = '100%';
      msgElem.innerHTML = `<span class="material-symbols-outlined text-[16px] text-secondary">verified</span> <strong>Congratulations!</strong> You have unlocked Free Nepal Delivery!`;
    } else if (subtotal === 0) {
      progressElem.style.width = '0%';
      msgElem.innerHTML = `Free insured delivery on orders over NPR 4,000 across Nepal`;
    } else {
      const remaining = 4000 - subtotal;
      const pct = Math.min(100, Math.round((subtotal / 4000) * 100));
      progressElem.style.width = `${pct}%`;
      msgElem.innerHTML = `Add <strong>${formatNPR(remaining)}</strong> more to enjoy Free Nepal Express shipping!`;
    }
  }

  if (state.cart.length === 0) {
    drawerList.style.display = 'none';
    if (totalsElem) totalsElem.style.display = 'none';
    if (emptyElem) emptyElem.style.display = 'flex';
    return;
  }

  drawerList.style.display = 'flex';
  if (totalsElem) totalsElem.style.display = 'block';
  if (emptyElem) emptyElem.style.display = 'none';

  drawerList.innerHTML = state.cart.map(item => `
    <div class="cart-item-row">
      <div class="cart-item-img">
        <img src="${item.image}" alt="${item.name}" onerror="this.src='./public/assets/aistudio/Image_1_23d43465.png'">
      </div>
      <div class="cart-item-details">
        <div>
          <h4 class="cart-item-name">${item.name}</h4>
          <span class="cart-item-variant">Shade / Ritual: ${item.shade}</span>
        </div>
        <div class="flex items-center justify-between mt-2">
          <div class="stepper-box" style="transform: scale(0.85); transform-origin: left center;">
            <button class="step-btn" onclick="updateCartQty(${item.id}, '${item.shade}', -1)">-</button>
            <span class="step-val">${item.quantity}</span>
            <button class="step-btn" onclick="updateCartQty(${item.id}, '${item.shade}', 1)">+</button>
          </div>
          <span class="cart-item-price">${formatNPR(item.price * item.quantity)}</span>
        </div>
      </div>
      <button class="cart-item-remove-btn" title="Remove" onclick="removeFromCart(${item.id}, '${item.shade}')">
        <span class="material-symbols-outlined text-[18px]">close</span>
      </button>
    </div>
  `).join('');

  if (totalsElem) {
    totalsElem.innerHTML = `
      <div class="cart-totals-breakdown">
        <div class="totals-row">
          <span>Subtotal</span>
          <span>${formatNPR(subtotal)}</span>
        </div>
        ${discount > 0 ? `
        <div class="totals-row text-primary">
          <span>Privilege Discount (${state.appliedCoupon.code})</span>
          <span>-${formatNPR(discount)}</span>
        </div>` : ''}
        <div class="totals-row">
          <span>Nepal Courier Delivery</span>
          <span>${shipping === 0 ? '<strong class="text-secondary">COMPLIMENTARY</strong>' : formatNPR(shipping)}</span>
        </div>
        <div class="totals-row grand-total">
          <span>Estimated Total</span>
          <span class="text-primary">${formatNPR(grandTotal)}</span>
        </div>
      </div>
      <div class="flex gap-2">
        <button class="btn-primary w-full" onclick="closeCartDrawer(); navigateTo('checkout');">
          Proceed to Checkout
        </button>
      </div>
      <p class="text-center text-[10px] text-outline mt-2">Prices inclusive of local VAT & insurance</p>
    `;
  }
}

function renderCartPage() {
  const container = document.getElementById('cartPageContent');
  if (!container) return;

  const { subtotal, discount, shipping, grandTotal } = calculateCartTotals();

  if (state.cart.length === 0) {
    container.innerHTML = `
      <div class="empty-state-box">
        <div class="empty-state-icon">
          <span class="material-symbols-outlined text-[36px]">shopping_bag</span>
        </div>
        <h3 class="font-display text-2xl text-text-main mb-2">Your Shopping Bag is Empty</h3>
        <p class="text-sm text-text-muted max-w-sm mb-6">
          Indulge in our high-altitude Himalayan botanical formulations crafted for lasting natural luminosity.
        </p>
        <button class="btn-primary" onclick="navigateTo('shop')">Explore Shop Atelier</button>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div class="lg:col-span-8 bg-surface p-6 rounded-2xl border border-border shadow-sm">
        <h3 class="font-display text-xl text-text-main mb-4">Shopping Bag (${state.cart.reduce((acc, i) => acc + i.quantity, 0)} Items)</h3>
        <div class="divide-y divide-surface-low">
          ${state.cart.map(item => `
            <div class="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div class="flex items-center gap-4">
                <div class="w-20 h-24 rounded-lg overflow-hidden bg-surface-high flex-shrink-0">
                  <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover">
                </div>
                <div>
                  <h4 class="font-bold text-sm text-text-main">${item.name}</h4>
                  <p class="text-xs text-text-muted mt-0.5">Shade: ${item.shade}</p>
                  <p class="text-xs text-primary font-bold mt-1">${formatNPR(item.price)} each</p>
                </div>
              </div>
              <div class="flex items-center gap-6 self-end sm:self-center">
                <div class="stepper-box">
                  <button class="step-btn" onclick="updateCartQty(${item.id}, '${item.shade}', -1)">-</button>
                  <span class="step-val">${item.quantity}</span>
                  <button class="step-btn" onclick="updateCartQty(${item.id}, '${item.shade}', 1)">+</button>
                </div>
                <span class="font-bold text-primary min-w-[90px] text-right">${formatNPR(item.price * item.quantity)}</span>
                <button class="text-outline hover:text-error" onclick="removeFromCart(${item.id}, '${item.shade}')">
                  <span class="material-symbols-outlined text-[20px]">delete</span>
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="lg:col-span-4 flex flex-col gap-6">
        <div class="bg-surface p-6 rounded-2xl border border-border shadow-sm">
          <h4 class="font-display text-lg mb-4 text-text-main">Order Summary</h4>
          
          <div class="coupon-input-group">
            <input type="text" id="cartPageCouponInput" class="coupon-input" placeholder="Promo code (e.g. GLOW15)">
            <button class="coupon-apply-btn" onclick="applyCouponCode(document.getElementById('cartPageCouponInput').value)">Apply</button>
          </div>
          ${state.appliedCoupon ? `
            <div class="flex items-center justify-between text-xs text-primary bg-primary-subtle p-2 rounded-lg mb-4">
              <span>Code <strong>${state.appliedCoupon.code}</strong> applied (${state.appliedCoupon.label})</span>
              <button class="underline text-error" onclick="removeCoupon()">Remove</button>
            </div>
          ` : ''}

          <div class="cart-totals-breakdown">
            <div class="totals-row">
              <span>Bag Subtotal</span>
              <span>${formatNPR(subtotal)}</span>
            </div>
            ${discount > 0 ? `
            <div class="totals-row text-primary">
              <span>Discount</span>
              <span>-${formatNPR(discount)}</span>
            </div>` : ''}
            <div class="totals-row">
              <span>Delivery (Nepal)</span>
              <span>${shipping === 0 ? '<strong class="text-secondary">Free</strong>' : formatNPR(shipping)}</span>
            </div>
            <div class="totals-row grand-total">
              <span>Grand Total</span>
              <span class="text-primary">${formatNPR(grandTotal)}</span>
            </div>
          </div>

          <button class="btn-primary w-full" onclick="navigateTo('checkout')">
            Proceed to Checkout
          </button>
          <button class="btn-secondary w-full mt-2" onclick="navigateTo('shop')">
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  `;
}

function applyCouponCode(code) {
  if (!code) return;
  const clean = code.trim().toUpperCase();
  if (clean === 'GLOW15') {
    state.appliedCoupon = { code: 'GLOW15', type: 'percent', value: 15, label: '15% Off Privilege' };
    saveToStorage();
    renderCartDrawer();
    if (state.currentRoute === 'cart') renderCartPage();
    if (state.currentRoute === 'checkout') renderCheckoutSummary();
    showToast("Privilege code GLOW15 applied! 15% discount granted.", "success");
  } else if (clean === 'FIRSTGLOW') {
    state.appliedCoupon = { code: 'FIRSTGLOW', type: 'flat', value: 500, label: 'NPR 500 Welcome Voucher' };
    saveToStorage();
    renderCartDrawer();
    if (state.currentRoute === 'cart') renderCartPage();
    if (state.currentRoute === 'checkout') renderCheckoutSummary();
    showToast("Code FIRSTGLOW applied! NPR 500 deducted.", "success");
  } else {
    showToast("Invalid or expired coupon code. Try 'GLOW15'", "error");
  }
}

function removeCoupon() {
  state.appliedCoupon = null;
  saveToStorage();
  renderCartDrawer();
  if (state.currentRoute === 'cart') renderCartPage();
  if (state.currentRoute === 'checkout') renderCheckoutSummary();
  showToast("Coupon removed", "info");
}

function openCartDrawer() {
  renderCartDrawer();
  document.getElementById('cartDrawer').classList.add('open');
  document.getElementById('drawerBackdrop').classList.add('active');
}

function closeCartDrawer() {
  document.getElementById('cartDrawer').classList.remove('open');
  document.getElementById('drawerBackdrop').classList.remove('active');
}

// ==========================================================================
// WISHLIST FUNCTIONALITY
// ==========================================================================
function toggleWishlist(productId) {
  const index = state.wishlist.indexOf(productId);
  const product = LUMIERE_PRODUCTS.find(p => p.id === productId);

  if (index > -1) {
    state.wishlist.splice(index, 1);
    showToast(`Removed from your wishlist`, "info");
  } else {
    state.wishlist.push(productId);
    showToast(`Saved "${product ? product.name : 'Formulation'}" to Wishlist`, "success");
  }

  saveToStorage();
  updateHeaderBadges();
  updateWishlistHeartIcons();
  if (state.currentRoute === 'wishlist') renderWishlistPage();
}

function updateWishlistHeartIcons() {
  document.querySelectorAll('.product-wish-btn').forEach(btn => {
    const pId = parseInt(btn.getAttribute('data-id'), 10);
    const icon = btn.querySelector('.material-symbols-outlined');
    if (state.wishlist.includes(pId)) {
      btn.classList.add('active');
      if (icon) icon.classList.add('filled');
    } else {
      btn.classList.remove('active');
      if (icon) icon.classList.remove('filled');
    }
  });
}

function renderWishlistPage() {
  const container = document.getElementById('wishlistPageContent');
  if (!container) return;

  const wishedProducts = LUMIERE_PRODUCTS.filter(p => state.wishlist.includes(p.id));

  if (wishedProducts.length === 0) {
    container.innerHTML = `
      <div class="empty-state-box">
        <div class="empty-state-icon">
          <span class="material-symbols-outlined text-[36px]">favorite</span>
        </div>
        <h3 class="font-display text-2xl text-text-main mb-2">Your Wishlist is Empty</h3>
        <p class="text-sm text-text-muted max-w-sm mb-6">
          Explore our celebrated bestsellers and save your favorite elixirs for your next beauty ritual.
        </p>
        <button class="btn-primary" onclick="navigateTo('shop')">Discover Bestsellers</button>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="font-display text-2xl text-text-main">Saved Beauty Rituals (${wishedProducts.length})</h3>
        <p class="text-xs text-text-muted">Your privately curated selection of Himalayan botanicals</p>
      </div>
      <button class="btn-secondary" onclick="moveAllWishlistToCart()">
        <span class="material-symbols-outlined text-[18px]">shopping_bag</span>
        Move All to Bag
      </button>
    </div>
    <div class="products-grid">
      ${wishedProducts.map(product => renderProductCardHTML(product)).join('')}
    </div>
  `;

  updateWishlistHeartIcons();
}

function moveAllWishlistToCart() {
  state.wishlist.forEach(id => {
    addToCart(id, 1, null, false);
  });
  state.wishlist = [];
  saveToStorage();
  updateHeaderBadges();
  renderWishlistPage();
  showToast("All wishlist items moved to your shopping bag!", "success");
}

// ==========================================================================
// BADGE COUNTERS
// ==========================================================================
function updateHeaderBadges() {
  const cartBadge = document.getElementById('cartBadgeCount');
  const wishBadge = document.getElementById('wishlistBadgeCount');

  const totalCartCount = state.cart.reduce((acc, item) => acc + item.quantity, 0);

  if (cartBadge) {
    cartBadge.textContent = totalCartCount;
    cartBadge.style.display = totalCartCount > 0 ? 'flex' : 'none';
  }

  if (wishBadge) {
    wishBadge.textContent = state.wishlist.length;
    wishBadge.style.display = state.wishlist.length > 0 ? 'flex' : 'none';
  }
}

// ==========================================================================
// SHOP CATALOG & FILTERS
// ==========================================================================
function renderProductCardHTML(product) {
  const isWished = state.wishlist.includes(product.id);
  return `
    <div class="product-card" data-id="${product.id}">
      <div class="product-thumb-wrap" onclick="navigateTo('product-details', ${product.id})">
        <img class="product-thumb" src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.src='./public/assets/aistudio/Image_1_23d43465.png'">
        ${product.badge ? `
          <div class="product-badge-overlay">
            <span class="badge-tag ${product.badge === 'Best Seller' ? 'primary' : 'secondary'}">${product.badge}</span>
          </div>` : ''}
        <button class="product-wish-btn ${isWished ? 'active' : ''}" data-id="${product.id}" title="Save to Wishlist" onclick="event.stopPropagation(); toggleWishlist(${product.id})">
          <span class="material-symbols-outlined ${isWished ? 'filled' : ''}">favorite</span>
        </button>
        <div class="product-quick-bar">
          <button class="quick-view-action-btn" onclick="event.stopPropagation(); openQuickView(${product.id})">
            <span class="material-symbols-outlined text-[15px]">visibility</span> Quick View
          </button>
          <button class="quick-add-action-btn" onclick="event.stopPropagation(); addToCart(${product.id}, 1)">
            <span class="material-symbols-outlined text-[15px]">shopping_bag</span> Add
          </button>
        </div>
      </div>
      <div class="product-info-wrap">
        <div>
          <div class="product-rating-row">
            <div class="star-rating">
              ${renderStarRatingHTML(product.rating)}
            </div>
            <span class="rating-count">(${product.reviewCount})</span>
          </div>
          <h3 class="product-title" onclick="navigateTo('product-details', ${product.id})">${product.name}</h3>
          <p class="product-sub-desc">${product.subtitle}</p>
        </div>
        <div class="product-price-row">
          <div>
            <span class="current-price">${formatNPR(product.price)}</span>
            ${product.originalPrice > product.price ? `<span class="original-price">${formatNPR(product.originalPrice)}</span>` : ''}
          </div>
          <span class="text-[10px] font-bold text-secondary uppercase tracking-wider">${product.categoryLabel}</span>
        </div>
      </div>
    </div>
  `;
}

function renderStarRatingHTML(rating) {
  let stars = '';
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars += `<span class="material-symbols-outlined filled text-[15px]">star</span>`;
    } else if (rating >= i - 0.5) {
      stars += `<span class="material-symbols-outlined filled text-[15px]">star_half</span>`;
    } else {
      stars += `<span class="material-symbols-outlined text-[15px]">star</span>`;
    }
  }
  return stars;
}

function renderShopProducts() {
  const grid = document.getElementById('shopProductsGrid');
  const countElem = document.getElementById('shopResultsCount');
  if (!grid) return;

  let filtered = [...LUMIERE_PRODUCTS];

  // Category filter
  if (state.activeCategory !== 'all') {
    filtered = filtered.filter(p => p.category === state.activeCategory);
  }

  // Search query
  if (state.searchQuery.trim() !== '') {
    const q = state.searchQuery.toLowerCase().trim();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.subtitle.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.keyIngredients.some(ing => ing.toLowerCase().includes(q))
    );
  }

  // Max price
  filtered = filtered.filter(p => p.price <= state.maxPrice);

  // Min rating
  if (state.minRating > 0) {
    filtered = filtered.filter(p => p.rating >= state.minRating);
  }

  // Active Tag
  if (state.activeTag === 'bestseller') {
    filtered = filtered.filter(p => p.badge === 'Best Seller' || p.isFeatured);
  } else if (state.activeTag === 'sale') {
    filtered = filtered.filter(p => p.originalPrice > p.price);
  } else if (state.activeTag === 'under2500') {
    filtered = filtered.filter(p => p.price <= 2500);
  }

  // Sorting
  if (state.sortBy === 'price-low') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (state.sortBy === 'price-high') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (state.sortBy === 'rating') {
    filtered.sort((a, b) => b.rating - a.rating);
  } else if (state.sortBy === 'name') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  if (countElem) {
    countElem.innerHTML = `Showing <strong>${filtered.length}</strong> of ${LUMIERE_PRODUCTS.length} formulations`;
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full py-12 text-center bg-surface rounded-2xl border border-border p-8">
        <span class="material-symbols-outlined text-[48px] text-outline mb-2">search_off</span>
        <h3 class="font-display text-xl text-text-main mb-1">No Formulations Match Your Criteria</h3>
        <p class="text-sm text-text-muted mb-4">Try relaxing your search terms or resetting the price filter.</p>
        <button class="btn-secondary" onclick="resetShopFilters()">Reset All Filters</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(product => renderProductCardHTML(product)).join('');
  updateWishlistHeartIcons();
}

function resetShopFilters() {
  state.activeCategory = 'all';
  state.searchQuery = '';
  state.maxPrice = 6000;
  state.minRating = 0;
  state.sortBy = 'featured';
  state.activeTag = 'all';

  // Update UI controls
  const searchInput = document.getElementById('shopSearchInput');
  if (searchInput) searchInput.value = '';
  const priceSlider = document.getElementById('priceRangeSlider');
  if (priceSlider) priceSlider.value = 6000;
  const priceDisplay = document.getElementById('priceDisplayVal');
  if (priceDisplay) priceDisplay.textContent = 'NPR 6,000';
  const sortSelect = document.getElementById('shopSortSelect');
  if (sortSelect) sortSelect.value = 'featured';

  document.querySelectorAll('.filter-category-item').forEach(el => {
    el.classList.toggle('active', el.getAttribute('data-cat') === 'all');
  });

  document.querySelectorAll('.filter-chip').forEach(el => {
    el.classList.toggle('active', el.getAttribute('data-tag') === 'all');
  });

  renderShopProducts();
  showToast("All filters reset", "info");
}

// ==========================================================================
// PRODUCT DETAILS PAGE
// ==========================================================================
function renderProductDetails(productId) {
  const product = LUMIERE_PRODUCTS.find(p => p.id === productId);
  if (!product) {
    navigateTo('shop');
    return;
  }

  state.selectedProduct = product;
  state.selectedShade = product.shades.length > 0 ? product.shades[0].name : "Standard";
  state.selectedQty = 1;

  const container = document.getElementById('productDetailsContent');
  if (!container) return;

  const isWished = state.wishlist.includes(product.id);

  container.innerHTML = `
    <!-- Breadcrumb -->
    <div class="breadcrumb-nav">
      <a href="#home">Home</a>
      <span>/</span>
      <a href="#shop">Shop</a>
      <span>/</span>
      <span class="capitalize">${product.categoryLabel}</span>
      <span>/</span>
      <span class="text-primary font-semibold">${product.name}</span>
    </div>

    <div class="product-details-grid">
      <!-- Gallery Column -->
      <div>
        <div class="detail-gallery-main" id="mainGalleryFrame">
          <img id="detailMainImage" src="${product.image}" alt="${product.name}" onerror="this.src='./public/assets/aistudio/Image_1_23d43465.png'">
        </div>
        <div class="detail-thumbnails-row">
          <div class="detail-thumb-item active" onclick="switchDetailImage('${product.image}', this)">
            <img src="${product.image}" alt="Thumbnail 1">
          </div>
          <div class="detail-thumb-item" onclick="switchDetailImage('https://lh3.googleusercontent.com/aida-public/AB6AXuBYDr-aMoZC7yYbG8niRA0axT3MqzIam3CEICNXsDgC9QpKFHmM1VPy5nREyyg0WCZP8q0JmGVSNSkSRbWjLzTS-bQGkL8Lmdoh29c4dpJn8UtL_4pjHxzA0Fn0CaaHCKrXA2ziMalk_zNH2qhlXKJOYwMLIuvHPz5wkiPE7rFvjjjp2USh6V_DZK1Nm9UHZWjyNQ0DPRR6V2-1YtANJoLt19UhcPYx7PlMAsKX_xM0GK9C-bYzKebs', this)">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBYDr-aMoZC7yYbG8niRA0axT3MqzIam3CEICNXsDgC9QpKFHmM1VPy5nREyyg0WCZP8q0JmGVSNSkSRbWjLzTS-bQGkL8Lmdoh29c4dpJn8UtL_4pjHxzA0Fn0CaaHCKrXA2ziMalk_zNH2qhlXKJOYwMLIuvHPz5wkiPE7rFvjjjp2USh6V_DZK1Nm9UHZWjyNQ0DPRR6V2-1YtANJoLt19UhcPYx7PlMAsKX_xM0GK9C-bYzKebs" alt="Thumbnail 2">
          </div>
          <div class="detail-thumb-item" onclick="switchDetailImage('https://lh3.googleusercontent.com/aida-public/AB6AXuDz8N5WSn-0YeP3A8fPIFHPuBve62ht8NWDUkT134zZEq8ocUcJuzIxF_eMVPx0-SlZcwE-GVevzpHMDIPkqg0fgJLsV2hNvw4WlLNDVc9GeOc0G_lf0267EoB5V5eXJN01IkbKuGrTkGEdPDmsMEfY_XCEhRq27HV4cbDqxJgBXHPqo_rDPtBK6f4EwIusoXm4rvRk8wPTc5zasS0XBPG0pF-9Cca1biiSEEhSNJwqfdnoX216xz60', this)">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDz8N5WSn-0YeP3A8fPIFHPuBve62ht8NWDUkT134zZEq8ocUcJuzIxF_eMVPx0-SlZcwE-GVevzpHMDIPkqg0fgJLsV2hNvw4WlLNDVc9GeOc0G_lf0267EoB5V5eXJN01IkbKuGrTkGEdPDmsMEfY_XCEhRq27HV4cbDqxJgBXHPqo_rDPtBK6f4EwIusoXm4rvRk8wPTc5zasS0XBPG0pF-9Cca1biiSEEhSNJwqfdnoX216xz60" alt="Thumbnail 3">
          </div>
        </div>
      </div>

      <!-- Info Column -->
      <div class="detail-info-col">
        <div class="flex items-center gap-2 mb-1">
          <span class="badge-tag primary">${product.categoryLabel}</span>
          ${product.badge ? `<span class="badge-tag secondary">${product.badge}</span>` : ''}
          <span class="text-xs text-success font-semibold flex items-center gap-1">
            <span class="material-symbols-outlined text-[14px]">check_circle</span> In Stock
          </span>
        </div>

        <h1 class="detail-title">${product.name}</h1>
        <p class="text-sm text-text-muted">${product.subtitle}</p>

        <!-- Rating -->
        <div class="flex items-center gap-2 mt-2">
          <div class="star-rating">
            ${renderStarRatingHTML(product.rating)}
          </div>
          <span class="text-xs font-semibold text-text-main">${product.rating.toFixed(1)}</span>
          <span class="text-xs text-text-muted">(${product.reviewCount} Verified Patron Reviews)</span>
        </div>

        <!-- Price -->
        <div class="detail-price-box">
          <span class="detail-price-main">${formatNPR(product.price)}</span>
          ${product.originalPrice > product.price ? `
            <span class="detail-price-old">${formatNPR(product.originalPrice)}</span>
            <span class="badge-tag primary">Save ${product.savePercent || 15}%</span>
          ` : ''}
        </div>

        <p class="text-xs text-text-muted mb-4">Volume / Size: <strong>${product.volume}</strong></p>

        <!-- Shades Selection -->
        ${product.shades.length > 0 ? `
          <div class="shades-picker-wrap">
            <label class="text-xs font-bold uppercase tracking-wider text-text-main">
              Select Shade / Undertone: <span id="activeShadeName" class="text-primary font-normal">${product.shades[0].name}</span>
            </label>
            <div class="shades-swatch-list">
              ${product.shades.map((shade, idx) => `
                <div class="shade-swatch ${idx === 0 ? 'active' : ''}" 
                     style="background-color: ${shade.hex};" 
                     title="${shade.name}" 
                     onclick="selectDetailShade('${shade.name}', this)"></div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Quantity -->
        <div class="qty-stepper-wrap">
          <span class="text-xs font-bold uppercase tracking-wider text-text-main">Quantity:</span>
          <div class="stepper-box">
            <button class="step-btn" onclick="updateDetailQty(-1)">-</button>
            <span class="step-val" id="detailQtyDisplay">1</span>
            <button class="step-btn" onclick="updateDetailQty(1)">+</button>
          </div>
        </div>

        <!-- Actions -->
        <div class="detail-action-buttons">
          <button class="btn-primary flex-1" onclick="addCurrentProductToBag()">
            <span class="material-symbols-outlined text-[18px]">shopping_bag</span>
            Add to Shopping Bag
          </button>
          <button class="btn-secondary" onclick="buyNowCurrentProduct()">
            Buy Now
          </button>
          <button class="btn-outline ${isWished ? 'bg-primary text-white' : ''}" onclick="toggleWishlist(${product.id}); renderProductDetails(${product.id});">
            <span class="material-symbols-outlined text-[18px]">${isWished ? 'favorite' : 'favorite_border'}</span>
          </button>
        </div>

        <!-- Accordion details -->
        <div class="detail-accordion">
          <div class="detail-accordion-item open">
            <div class="detail-accordion-head" onclick="toggleDetailAccordion(this)">
              <span>The Ritual & Description</span>
              <span class="material-symbols-outlined text-[18px]">expand_more</span>
            </div>
            <div class="detail-accordion-body">
              ${product.description}
            </div>
          </div>

          <div class="detail-accordion-item">
            <div class="detail-accordion-head" onclick="toggleDetailAccordion(this)">
              <span>Himalayan Botanicals & Active Ingredients</span>
              <span class="material-symbols-outlined text-[18px]">expand_more</span>
            </div>
            <div class="detail-accordion-body">
              <ul class="list-disc pl-5 space-y-1">
                ${product.keyIngredients.map(ing => `<li><strong>${ing}</strong></li>`).join('')}
              </ul>
              <p class="mt-2 text-xs text-text-muted">100% Leaping Bunny certified cruelty-free. Paraben-free, sulfate-free, mineral oil free.</p>
            </div>
          </div>

          <div class="detail-accordion-item">
            <div class="detail-accordion-head" onclick="toggleDetailAccordion(this)">
              <span>How to Apply</span>
              <span class="material-symbols-outlined text-[18px]">expand_more</span>
            </div>
            <div class="detail-accordion-body">
              ${product.howToUse}
            </div>
          </div>

          <div class="detail-accordion-item">
            <div class="detail-accordion-head" onclick="toggleDetailAccordion(this)">
              <span>Nepal Shipping & 14-Day Exchanges</span>
              <span class="material-symbols-outlined text-[18px]">expand_more</span>
            </div>
            <div class="detail-accordion-body">
              Delivered within 24 hours across Kathmandu Valley and 2-4 business days nationwide. Complimentary insurance and gift coffret packing included with all orders.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Related Formulations -->
    <div class="mt-16 pt-12 border-t border-border">
      <div class="flex items-center justify-between mb-8">
        <div>
          <span class="font-caps text-secondary">Ritual Pairings</span>
          <h3 class="font-display text-2xl text-text-main">Complete Your Luminescence</h3>
        </div>
        <a href="#shop" class="btn-outline" style="padding: 8px 18px; font-size: 11px;">View All</a>
      </div>
      <div class="products-grid">
        ${LUMIERE_PRODUCTS.filter(p => p.id !== product.id && p.category === product.category).slice(0, 4).map(p => renderProductCardHTML(p)).join('')}
      </div>
    </div>
  `;
}

function switchDetailImage(url, thumbElem) {
  const mainImg = document.getElementById('detailMainImage');
  if (mainImg) mainImg.src = url;

  document.querySelectorAll('.detail-thumb-item').forEach(el => el.classList.remove('active'));
  if (thumbElem) thumbElem.classList.add('active');
}

function selectDetailShade(shadeName, swatchElem) {
  state.selectedShade = shadeName;
  const nameDisplay = document.getElementById('activeShadeName');
  if (nameDisplay) nameDisplay.textContent = shadeName;

  document.querySelectorAll('.shade-swatch').forEach(el => el.classList.remove('active'));
  if (swatchElem) swatchElem.classList.add('active');
}

function updateDetailQty(delta) {
  state.selectedQty = Math.max(1, state.selectedQty + delta);
  const qtyElem = document.getElementById('detailQtyDisplay');
  if (qtyElem) qtyElem.textContent = state.selectedQty;
}

function toggleDetailAccordion(headElem) {
  const item = headElem.parentElement;
  item.classList.toggle('open');
}

function addCurrentProductToBag() {
  if (!state.selectedProduct) return;
  addToCart(state.selectedProduct.id, state.selectedQty, state.selectedShade, true);
  openCartDrawer();
}

function buyNowCurrentProduct() {
  if (!state.selectedProduct) return;
  addToCart(state.selectedProduct.id, state.selectedQty, state.selectedShade, false);
  navigateTo('checkout');
}

// ==========================================================================
// QUICK VIEW MODAL
// ==========================================================================
function openQuickView(productId) {
  const product = LUMIERE_PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  state.selectedProduct = product;
  state.selectedShade = product.shades.length > 0 ? product.shades[0].name : "Standard";
  state.selectedQty = 1;

  const modal = document.getElementById('quickViewModal');
  const body = document.getElementById('quickViewModalBody');
  if (!modal || !body) return;

  body.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
      <div class="aspect-[4/5] rounded-xl overflow-hidden bg-surface-high">
        <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover">
      </div>
      <div>
        <span class="badge-tag primary text-[9px]">${product.categoryLabel}</span>
        <h3 class="font-display text-2xl text-text-main mt-1">${product.name}</h3>
        <p class="text-xs text-text-muted mt-1">${product.subtitle}</p>

        <div class="flex items-center gap-2 my-3">
          <span class="text-xl font-bold text-primary">${formatNPR(product.price)}</span>
          ${product.originalPrice > product.price ? `<span class="text-xs text-outline line-through">${formatNPR(product.originalPrice)}</span>` : ''}
        </div>

        <p class="text-xs text-text-muted leading-relaxed line-clamp-3 mb-4">${product.description}</p>

        ${product.shades.length > 0 ? `
          <div class="mb-4">
            <label class="text-[11px] font-bold text-text-main block mb-1">Select Shade:</label>
            <div class="flex gap-2">
              ${product.shades.map((s, idx) => `
                <div class="shade-swatch ${idx === 0 ? 'active' : ''}" style="background-color: ${s.hex}; width: 24px; height: 24px;" title="${s.name}" onclick="selectDetailShade('${s.name}', this)"></div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <div class="flex gap-2 mt-4">
          <button class="btn-primary flex-1 py-3 text-xs" onclick="addCurrentProductToBag(); closeQuickView();">
            Add to Bag
          </button>
          <button class="btn-secondary py-3 text-xs" onclick="closeQuickView(); navigateTo('product-details', ${product.id});">
            Full Details
          </button>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('open');
}

function closeQuickView() {
  const modal = document.getElementById('quickViewModal');
  if (modal) modal.classList.remove('open');
}

// ==========================================================================
// CHECKOUT & DEMO ORDER PLACEMENT
// ==========================================================================
function renderCheckoutSummary() {
  const summaryBox = document.getElementById('checkoutOrderSummary');
  if (!summaryBox) return;

  const { subtotal, discount, shipping, grandTotal } = calculateCartTotals();

  if (state.cart.length === 0) {
    summaryBox.innerHTML = `
      <div class="text-center py-6">
        <p class="text-sm text-text-muted mb-4">No items in your bag for checkout.</p>
        <button class="btn-secondary" onclick="navigateTo('shop')">Explore Shop</button>
      </div>
    `;
    return;
  }

  summaryBox.innerHTML = `
    <h4 class="font-display text-lg mb-4 text-text-main">Order Summary (${state.cart.reduce((a, b) => a + b.quantity, 0)} Items)</h4>
    <div class="space-y-3 max-h-64 overflow-y-auto mb-4 pr-1">
      ${state.cart.map(item => `
        <div class="flex items-center justify-between text-xs">
          <div class="flex items-center gap-2">
            <img src="${item.image}" alt="${item.name}" class="w-10 h-12 object-cover rounded">
            <div>
              <p class="font-bold text-text-main">${item.name}</p>
              <p class="text-text-muted">Qty: ${item.quantity} | ${item.shade}</p>
            </div>
          </div>
          <span class="font-bold text-primary">${formatNPR(item.price * item.quantity)}</span>
        </div>
      `).join('')}
    </div>

    <div class="cart-totals-breakdown pt-3 border-t border-border">
      <div class="totals-row">
        <span>Subtotal</span>
        <span>${formatNPR(subtotal)}</span>
      </div>
      ${discount > 0 ? `
      <div class="totals-row text-primary">
        <span>Discount (${state.appliedCoupon.code})</span>
        <span>-${formatNPR(discount)}</span>
      </div>` : ''}
      <div class="totals-row">
        <span>Nepal Insured Courier</span>
        <span>${shipping === 0 ? '<strong class="text-secondary">Free</strong>' : formatNPR(shipping)}</span>
      </div>
      <div class="totals-row grand-total">
        <span>Total Payable</span>
        <span class="text-primary">${formatNPR(grandTotal)}</span>
      </div>
    </div>
  `;
}

function handleCheckoutSubmit(e) {
  e.preventDefault();

  if (state.cart.length === 0) {
    showToast("Your cart is empty. Please add items before checking out.", "error");
    return;
  }

  // Basic Form Validation
  const fullName = document.getElementById('checkoutName').value.trim();
  const email = document.getElementById('checkoutEmail').value.trim();
  const phone = document.getElementById('checkoutPhone').value.trim();
  const province = document.getElementById('checkoutProvince').value;
  const city = document.getElementById('checkoutCity').value.trim();
  const address = document.getElementById('checkoutAddress').value.trim();
  const paymentMethod = document.querySelector('input[name="payment_method"]:checked')?.value || "eSewa Mobile Wallet";

  if (!fullName || !email || !phone || !city || !address) {
    showToast("Please fill in all required delivery fields.", "error");
    return;
  }

  // Validate Nepal Phone Number (10 digits starting with 98 or 97, or basic 10 digit)
  const phoneClean = phone.replace(/[^0-9]/g, '');
  if (phoneClean.length < 10) {
    showToast("Please enter a valid 10-digit mobile number.", "error");
    return;
  }

  // Create demo order
  const { subtotal, discount, shipping, grandTotal } = calculateCartTotals();
  const orderId = "LUM-2026-" + Math.floor(1000 + Math.random() * 9000);
  const today = new Date().toISOString().split('T')[0];

  const newOrder = {
    id: orderId,
    date: today,
    customerName: fullName,
    email: email,
    phone: phone,
    address: `${address}, ${city}, Province ${province}`,
    paymentMethod: paymentMethod,
    items: [...state.cart],
    subtotal: subtotal,
    discount: discount,
    shipping: shipping,
    total: grandTotal,
    status: "Processing"
  };

  // Show processing feedback
  const submitBtn = document.getElementById('checkoutSubmitBtn');
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = `<span class="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> Securing Order...`;
  submitBtn.disabled = true;

  setTimeout(() => {
    // Add to order history
    state.orderHistory.unshift(newOrder);
    state.cart = [];
    state.appliedCoupon = null;
    saveToStorage();
    updateHeaderBadges();

    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;

    // Render Order Confirmation
    renderOrderConfirmation(newOrder);
    navigateTo('order-confirmation');
    showToast("Order placed successfully! Confirmation generated.", "success");
  }, 1200);
}

function renderOrderConfirmation(order) {
  const container = document.getElementById('orderConfirmationContent');
  if (!container) return;

  container.innerHTML = `
    <div class="order-confirmation-box">
      <div class="order-success-icon">
        <span class="material-symbols-outlined text-[44px]">verified</span>
      </div>
      <span class="font-caps text-secondary">Ritual Confirmed</span>
      <h2 class="font-display text-3xl text-text-main mt-1 mb-2">Thank You, ${order.customerName}</h2>
      <p class="text-sm text-text-muted max-w-md mx-auto mb-6">
        Your order has been placed into our Kathmandu atelier vault. An email notification and tracking details have been dispatched.
      </p>

      <div class="invoice-preview-card">
        <div class="flex items-center justify-between pb-3 border-b border-border">
          <div>
            <span class="text-xs text-text-muted">Order Identifier</span>
            <p class="font-bold text-primary text-base">${order.id}</p>
          </div>
          <div class="text-right">
            <span class="text-xs text-text-muted">Estimated Delivery</span>
            <p class="font-bold text-text-main text-sm">24-48 Hours</p>
          </div>
        </div>

        <div class="py-3 border-b border-border text-xs space-y-1">
          <p><strong>Deliver To:</strong> ${order.customerName} (${order.phone})</p>
          <p><strong>Address:</strong> ${order.address}</p>
          <p><strong>Payment:</strong> ${order.paymentMethod} <span class="demo-payment-badge ml-1">Simulated Demo</span></p>
        </div>

        <div class="py-3 space-y-2 text-xs">
          ${order.items.map(item => `
            <div class="flex justify-between">
              <span>${item.name} (${item.shade}) x ${item.quantity}</span>
              <span class="font-semibold">${formatNPR(item.price * item.quantity)}</span>
            </div>
          `).join('')}
        </div>

        <div class="pt-3 border-t border-border flex justify-between font-bold text-sm text-text-main">
          <span>Total Paid:</span>
          <span class="text-primary">${formatNPR(order.total)}</span>
        </div>
      </div>

      <div class="flex flex-wrap justify-center gap-3">
        <button class="btn-primary" onclick="window.print()">
          <span class="material-symbols-outlined text-[18px]">print</span>
          Print / Save Receipt
        </button>
        <button class="btn-secondary" onclick="navigateTo('account')">
          View in Order History
        </button>
        <button class="btn-outline" onclick="navigateTo('shop')">
          Continue Exploring
        </button>
      </div>

      <p class="text-[11px] text-outline mt-6">
        Academic University Demonstration: No real money was charged and no live parcel dispatched.
      </p>
    </div>
  `;
}

// ==========================================================================
// DEMO ACCOUNT & ORDER HISTORY
// ==========================================================================
function renderAccountOrders() {
  const container = document.getElementById('accountOrderHistoryBody');
  if (!container) return;

  if (state.orderHistory.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="5" class="text-center py-8 text-text-muted">
          No previous orders logged yet. Place a simulated order from our shop!
        </td>
      </tr>
    `;
    return;
  }

  container.innerHTML = state.orderHistory.map(order => `
    <tr>
      <td class="font-bold text-primary">${order.id}</td>
      <td>${order.date}</td>
      <td>
        <div class="space-y-0.5">
          ${order.items.map(i => `<div class="text-xs text-text-muted">• ${i.name} (x${i.quantity})</div>`).join('')}
        </div>
      </td>
      <td class="font-bold text-text-main">${formatNPR(order.total)}</td>
      <td>
        <span class="badge-tag ${order.status === 'Delivered' ? 'secondary' : 'primary'} text-[10px]">
          ${order.status}
        </span>
      </td>
    </tr>
  `).join('');
}

function clearDemoOrders() {
  if (confirm("Reset demo order history?")) {
    state.orderHistory = [];
    saveToStorage();
    renderAccountOrders();
    showToast("Demo orders reset", "info");
  }
}

// ==========================================================================
// CONTACT FORM
// ==========================================================================
function handleContactSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('contactName').value.trim();
  const email = document.getElementById('contactEmail').value.trim();
  const message = document.getElementById('contactMessage').value.trim();

  if (!name || !email || !message) {
    showToast("Please complete all required fields.", "error");
    return;
  }

  showToast(`Thank you, ${name}! Your consultation inquiry has been forwarded to our Durbar Marg concierge.`, "success");
  e.target.reset();
}

// ==========================================================================
// MOBILE MENU CONTROLS
// ==========================================================================
function openMobileMenu() {
  document.getElementById('mobileNavDrawer').classList.add('open');
  document.getElementById('drawerBackdrop').classList.add('active');
}

function closeMobileMenu() {
  document.getElementById('mobileNavDrawer').classList.remove('open');
  document.getElementById('drawerBackdrop').classList.remove('active');
}

// ==========================================================================
// UNIVERSITY PROJECT GUIDE MODAL
// ==========================================================================
function openProjectGuide() {
  const modal = document.getElementById('projectGuideModal');
  if (modal) modal.classList.add('open');
}

function closeProjectGuide() {
  const modal = document.getElementById('projectGuideModal');
  if (modal) modal.classList.remove('open');
}

// ==========================================================================
// COUNTDOWN TIMER
// ==========================================================================
function initCountdown() {
  let sec = 48, min = 36, hr = 14;
  setInterval(() => {
    sec--;
    if (sec < 0) {
      sec = 59;
      min--;
      if (min < 0) {
        min = 59;
        hr = Math.max(0, hr - 1);
      }
    }
    const sElem = document.getElementById('countdownSeconds');
    const mElem = document.getElementById('countdownMinutes');
    const hElem = document.getElementById('countdownHours');
    if (sElem) sElem.innerText = sec < 10 ? '0' + sec : sec;
    if (mElem) mElem.innerText = min < 10 ? '0' + min : min;
    if (hElem) hElem.innerText = hr < 10 ? '0' + hr : hr;
  }, 1000);
}

// ==========================================================================
// APP INITIALIZATION
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  loadFromStorage();
  updateHeaderBadges();
  initCountdown();

  // Route according to window hash or default to home
  handleHashChange();
  window.addEventListener('hashchange', handleHashChange);

  // Global Backdrop Click
  const backdrop = document.getElementById('drawerBackdrop');
  if (backdrop) {
    backdrop.addEventListener('click', () => {
      closeCartDrawer();
      closeMobileMenu();
    });
  }

  // Setup Best Sellers Carousel Prev/Next Buttons
  const bestPrev = document.getElementById('bestPrevBtn');
  const bestNext = document.getElementById('bestNextBtn');
  if (bestPrev && bestNext) {
    bestPrev.addEventListener('click', () => {
      showToast("Displaying signature Highland Rose & Mineral essentials", "info");
    });
    bestNext.addEventListener('click', () => {
      showToast("Displaying Chomolungma Highlighters & Velvet Soufflés", "info");
    });
  }

  // Setup Home Tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const tabCategory = btn.getAttribute('data-tab');
      document.querySelectorAll('.tab-item').forEach(item => {
        if (tabCategory === 'all' || item.getAttribute('data-category') === tabCategory) {
          item.style.display = 'flex';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  // Setup FAQ Accordion Items
  document.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', () => {
      const parent = q.parentElement;
      const isOpen = parent.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(item => item.classList.remove('open'));
      if (!isOpen) parent.classList.add('open');
    });
  });

  // Shop Page Filter Listeners
  const categoryFilters = document.querySelectorAll('.filter-category-item');
  categoryFilters.forEach(item => {
    item.addEventListener('click', () => {
      categoryFilters.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      state.activeCategory = item.getAttribute('data-cat');
      renderShopProducts();
    });
  });

  const priceSlider = document.getElementById('priceRangeSlider');
  const priceDisplay = document.getElementById('priceDisplayVal');
  if (priceSlider && priceDisplay) {
    priceSlider.addEventListener('input', (e) => {
      state.maxPrice = parseInt(e.target.value, 10);
      priceDisplay.textContent = formatNPR(state.maxPrice);
      renderShopProducts();
    });
  }

  const sortSelect = document.getElementById('shopSortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      state.sortBy = e.target.value;
      renderShopProducts();
    });
  }

  const shopSearchInput = document.getElementById('shopSearchInput');
  if (shopSearchInput) {
    shopSearchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      renderShopProducts();
    });
  }

  const headerSearchInput = document.getElementById('headerSearchInput');
  if (headerSearchInput) {
    headerSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        state.searchQuery = headerSearchInput.value;
        navigateTo('shop');
        if (shopSearchInput) shopSearchInput.value = state.searchQuery;
        renderShopProducts();
      }
    });
  }

  // Quick Chips
  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.activeTag = chip.getAttribute('data-tag');
      renderShopProducts();
    });
  });

  // Home Newsletter
  const homeNewsletter = document.getElementById('homeNewsletterForm');
  if (homeNewsletter) {
    homeNewsletter.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('newsletterEmailInput');
      const msg = document.getElementById('newsletterSuccessMsg');
      if (input && input.value) {
        if (msg) msg.classList.remove('hidden');
        showToast("Invitation claimed! Use code GLOW15 at checkout for 15% off.", "success");
        input.value = '';
      }
    });
  }
});
