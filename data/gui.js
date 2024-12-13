// data/gui.js
import { getCurrentUser, signOutUser, getUserData, loginWithEmail, registerWithEmail, signInWithGooglePopup, onAuthChange, placeOrder } from './authentication.js'

let cart = [];
let productsArray = [];
let allProducts = [];
let allCategories = new Set();
let bodyData = {};
let selectedProductIndex = null;

// Attach feather icons
feather.replace();

// 🎀 UI TOGGLES
window.toggleAuthModal = function () {
    const m = document.getElementById('auth-modal');
    m.style.display = (m.style.display === 'flex') ? 'none' : 'flex'
}

window.toggleCartModal = function () {
    const m = document.getElementById('cart-modal');
    m.style.display = (m.style.display === 'flex') ? 'none' : 'flex';
    updateCartDisplay()
}

window.toggleOptionsModal = function () {
    const m = document.getElementById('options-modal');
    m.style.display = (m.style.display === 'flex') ? 'none' : 'flex'
}

window.showOptionsModal = function (i) {
    selectedProductIndex = i;
    const p = productsArray[i];
    const o = document.getElementById('options-modal-content');
    const t = document.getElementById('options-modal-title');
    t.textContent = `Select Options for ${p.name}`;
    o.innerHTML = '';
    if (p.variants && p.variants.length > 0) {
        p.variants.forEach((v, x) => {
            const vid = `variant-option-${x}`;
            const vr = document.createElement('div');
            vr.className = 'form-check mb-2';
            vr.innerHTML = `<input class="form-check-input" type="radio" name="variant" id="${vid}" value="${x}" ${x === 0 ? 'checked' : ''}><label class="form-check-label" for="${vid}">${v.name} - $${v.price.toFixed(2)}</label>`;
            o.appendChild(vr)
        })
    } else {
        const vr = document.createElement('div');
        vr.textContent = "No variants available. You'll be adding the main product.";
        o.appendChild(vr)
    }
    document.getElementById('variant-quantity').value = 1;
    toggleOptionsModal()
}

window.addToCart = function (i) {
    showOptionsModal(i)
}

document.getElementById('confirm-options-btn').addEventListener('click', () => {
    if (selectedProductIndex === null) return;
    const p = productsArray[selectedProductIndex];
    const q = parseInt(document.getElementById('variant-quantity').value, 10) || 1;
    let sv = null;
    if (p.variants && p.variants.length > 0) {
        const c = document.querySelector('input[name="variant"]:checked');
        if (c) {
            const vi = parseInt(c.value, 10);
            sv = p.variants[vi]
        }
    }
    const i = { name: sv ? `${p.name} - ${sv.name}` : p.name, image: sv ? sv.image : p.image, price: sv ? sv.price : p.price, quantity: q };
    cart.push(i);
    Swal.fire({ title: 'Item Added!', text: `${i.name} (x${q}) has been added to your cart.`, icon: 'success', confirmButtonText: 'Continue Shopping' });
    updateCartDisplay();
    toggleOptionsModal();
    selectedProductIndex = null
})

function updateCartDisplay() {
    const c = document.getElementById('cart-content');
    c.innerHTML = '';
    if (cart.length === 0) {
        c.innerHTML = '<p>Your cart is empty.</p>';
        return
    }
    cart.forEach(i => {
        const d = document.createElement('div');
        d.className = 'cart-item';
        d.innerHTML = `<img src="${i.image}" alt="${i.name}"><span>${i.name} - $${i.price.toFixed(2)} (x${i.quantity})</span>`;
        c.appendChild(d)
    })
}

window.showOffer = function () {
    Swal.fire({
        title: bodyData.specialOfferTitle,
        text: bodyData.specialOfferText,
        icon: 'info',
        confirmButtonText: 'Shop Now'
    })
}

document.getElementById('checkout-btn').addEventListener('click', async () => {
    const u = getCurrentUser();
    if (!u) {
        Swal.fire({
            title: 'Not Logged In',
            text: 'Please log in or register to checkout.',
            icon: 'info',
            confirmButtonText: 'OK'
        });
        return
    }
    if (cart.length === 0) {
        Swal.fire('Your cart is empty.');
        return
    }
    try {
        await placeOrder(cart);
        Swal.fire('Checkout successful! Your order will ship in 7-10 days with free shipping.');
        cart = [];
        updateCartDisplay();
        toggleCartModal()
    } catch (e) {
        Swal.fire('Error', e.message, 'error')
    }
})

const showLoginBtn = document.getElementById('show-login')
const showRegisterBtn = document.getElementById('show-register')
const loginForm = document.getElementById('login-form')
const registerForm = document.getElementById('register-form')

showLoginBtn.addEventListener('click', () => {
    loginForm.style.display = 'block';
    registerForm.style.display = 'none'
})

showRegisterBtn.addEventListener('click', () => {
    loginForm.style.display = 'none';
    registerForm.style.display = 'block'
})

const loginBtn = document.getElementById('login-btn')
const registerBtn = document.getElementById('register-btn')

registerBtn.addEventListener('click', async () => {
    const e = document.getElementById('registerEmail').value;
    const p = document.getElementById('registerPassword').value;
    try {
        await registerWithEmail(e, p);
        Swal.fire('Registration successful! 🎉');
        toggleAuthModal();
        updateUserStatus()
    } catch (er) {
        Swal.fire('Error', er.message, 'error')
    }
})

loginBtn.addEventListener('click', async () => {
    const e = document.getElementById('loginEmail').value;
    const p = document.getElementById('loginPassword').value;
    try {
        await loginWithEmail(e, p);
        Swal.fire('Login successful! 🎉');
        toggleAuthModal();
        updateUserStatus()
    } catch (er) {
        Swal.fire('Error', er.message, 'error')
    }
})

const googleBtn = document.getElementById('google-signin-btn')
googleBtn.addEventListener('click', async () => {
    try {
        await signInWithGooglePopup();
        Swal.fire('Google sign-in successful! 🎉');
        toggleAuthModal();
        updateUserStatus()
    } catch (er) {
        Swal.fire('Error', er.message, 'error')
    }
})

async function updateUserStatus() {
    const s = document.getElementById('user-status');
    const a = document.getElementById('user-avatar');
    const loginLogoutBtn = document.getElementById('login-logout-btn');
    const u = getCurrentUser();
    if (u) {
        s.textContent = `Logged in as ${u.email}`;
        const d = await getUserData(u.uid);
        if (d && d.avatarColor) {
            const c = d.avatarColor;
            a.style.backgroundColor = c;
            a.style.display = 'flex'
        } else {
            a.style.display = 'none'
        }

        const hiddenEmail = document.getElementById('hiddenUserEmail');
        if (hiddenEmail) {
            hiddenEmail.value = u.email;
        }

        loginLogoutBtn.textContent = "Logout";
        loginLogoutBtn.onclick = async () => {
            try {
                await signOutUser();
                Swal.fire('Logout successful! 🎉');
                updateUserStatus();
            } catch (er) {
                Swal.fire('Error', er.message, 'error');
            }
        };

    } else {
        s.textContent = '';
        a.style.display = 'none'
        loginLogoutBtn.textContent = "Login/Register";
        loginLogoutBtn.onclick = () => {
            toggleAuthModal();
        };
    }
}

// Listen for auth changes
onAuthChange(() => {
    updateUserStatus();
});

// CONTACT FORM VALIDATION
document.getElementById('contact-form').addEventListener('submit', function (e) {
    const u = getCurrentUser();
    if (!u) {
        e.preventDefault();
        Swal.fire({
            title: 'Not Signed In',
            text: 'You must be signed in to submit a contact request.',
            icon: 'warning',
            confirmButtonText: 'OK'
        });
        return;
    }

    const selectedCategory = this.querySelector('input[name="category"]:checked');
    if (!selectedCategory) {
        e.preventDefault();
        Swal.fire({
            title: 'Category Required',
            text: 'Please select a category before submitting your message.',
            icon: 'warning',
            confirmButtonText: 'OK'
        });
        return;
    }

    const subjectInput = this.querySelector('input[name="_subject"]');
    subjectInput.value = `Contact Request - ${selectedCategory.value}`;
})

// CATEGORY & PRODUCT FILTER FUNCTIONS
export function renderCategoryFilters(allCats, resetCallback, filterCallback) {
    const container = document.getElementById('category-filters');
    container.innerHTML = '';
    allCats.forEach(cat => {
        const id = `cat-filter-${cat}`;
        const cb = document.createElement('div');
        cb.className = 'form-check form-check-inline m-2';
        cb.innerHTML = `
            <input class="form-check-input" type="checkbox" id="${id}" value="${cat}">
            <label class="form-check-label" for="${id}">${cat}</label>
        `;
        container.appendChild(cb);
    });

    const filterBtn = document.createElement('button');
    filterBtn.className = 'primary-btn m-2';
    filterBtn.textContent = 'Filter';
    filterBtn.addEventListener('click', filterCallback);
    container.appendChild(filterBtn);

    const resetBtn = document.createElement('button');
    resetBtn.className = 'btn btn-light m-2';
    resetBtn.textContent = 'Reset Filters';
    resetBtn.addEventListener('click', resetCallback);
    container.appendChild(resetBtn);
}

export function applyCategoryFilter() {
    const selectedCats = Array.from(document.querySelectorAll('#category-filters input[type="checkbox"]:checked'))
        .map(cb => cb.value);
    if (selectedCats.length === 0) {
        renderProducts(allProducts);
        return;
    }

    const filtered = allProducts.filter(p => {
        return p.categories.some(cat => selectedCats.includes(cat));
    });
    renderProducts(filtered);
}

export function renderProducts(products) {
    const pl = document.getElementById('product-list');
    pl.innerHTML = '';
    productsArray = products;
    products.forEach((p) => {
        const c = document.createElement('div');
        c.classList.add('col-md-4');
        c.innerHTML = `
            <div class="product-card">
                <img src="${p.image}" alt="${p.name}">
                <div class="p-3">
                    <h5>${p.name}</h5>
                    <p>${p.description}</p>
                    <p><strong>$${p.price.toFixed(2)}</strong></p>
                    <p><em>Ships in 7-10 days depending...</em></p>
                    <button class="primary-btn w-100" onclick="addToCart(${allProducts.indexOf(p)})">Add to Cart</button>
                </div>
            </div>`;
        pl.appendChild(c)
    })
}

// These setter functions allow load.js to set data retrieved from fetch
export function setAllProducts(products) {
    allProducts = products;
}
export function setAllCategories(categories) {
    allCategories = categories;
}
export function setBodyData(data) {
    bodyData = data;
    document.getElementById('hero-heading').textContent = data.heroTitle;
    document.getElementById('hero-text').textContent = data.heroText;
    document.getElementById('about-text').textContent = data.aboutText;
    document.getElementById('contact-description').textContent = data.contactDescription;
    document.getElementById('contact-mission').textContent = data.mission;
}

// Reset and filter callbacks:
export function resetFilters() {
    document.querySelectorAll('#category-filters input[type="checkbox"]').forEach(cb => cb.checked = false);
    renderProducts(allProducts);
}
