
"use strict";

// Naija Bites — interactive website functionality

const menuItems = {
    jollof: { name: "Party Jollof Rice", price: 3500 },
    suya: { name: "Suya Special", price: 4500 },
    soup: { name: "Soup & Swallow", price: 4000 },
    bowl: { name: "Rice Bowl Special", price: 3000 }
};

const cart = {};

// Elements
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
const cartNav = document.getElementById("cartNav");
const cartCount = document.getElementById("cartCount");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const checkoutBtn = document.getElementById("checkoutBtn");
const clearCartBtn = document.getElementById("clearCart");
const header = document.querySelector(".site-header");

// Format prices in Nigerian naira.
function formatNaira(amount) {
    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 0
    }).format(amount);
}

// Mobile navigation
menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");

    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Close navigation" : "Open navigation"
    );
});

navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMobileMenu);
});

function closeMobileMenu() {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
}

// Header shadow after scrolling
function updateHeader() {
    header.classList.toggle("scrolled", window.scrollY > 10);
}

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

// Menu filters
const filterButtons = document.querySelectorAll(".filter-btn");
const foodCards = document.querySelectorAll(".food-card");

filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const selectedCategory = button.dataset.filter;

        filterButtons.forEach((item) => {
            item.classList.toggle("active", item === button);
        });

        foodCards.forEach((card) => {
            const matches =
                selectedCategory === "all" ||
                card.dataset.category === selectedCategory;

            card.classList.toggle("hidden", !matches);
        });
    });
});

// Add food to the cart
document.querySelectorAll(".add-button").forEach((button) => {
    button.addEventListener("click", () => {
        const id = button.dataset.id;

        if (!menuItems[id]) return;

        cart[id] = (cart[id] || 0) + 1;
        renderCart();

        const originalText = button.innerHTML;
        button.innerHTML = 'Added <span>✓</span>';
        button.disabled = true;

        window.setTimeout(() => {
            button.innerHTML = originalText;
            button.disabled = false;
        }, 700);
    });
});

// Render the cart and calculate the total
function renderCart() {
    const entries = Object.entries(cart).filter(([, quantity]) => quantity > 0);

    const totalQuantity = entries.reduce(
        (sum, [, quantity]) => sum + quantity,
        0
    );

    const totalPrice = entries.reduce((sum, [id, quantity]) => {
        return sum + menuItems[id].price * quantity;
    }, 0);

    cartCount.textContent = totalQuantity;
    cartTotal.textContent = formatNaira(totalPrice);

    if (entries.length === 0) {
        cartItems.innerHTML = `
      <p class="empty-cart">
        Your order is empty for now. Add something delicious from the menu above.
      </p>
    `;
        return;
    }

    cartItems.innerHTML = entries.map(([id, quantity]) => {
        const item = menuItems[id];
        const itemTotal = item.price * quantity;

        return `
      <article class="cart-item">
        <div>
          <h3>${item.name}</h3>
          <p class="item-price">${formatNaira(item.price)} each</p>

          <div class="cart-item-controls">
            <button class="quantity-btn" data-action="decrease"
              data-id="${id}" aria-label="Decrease ${item.name} quantity">−</button>

            <span class="quantity">${quantity}</span>

            <button class="quantity-btn" data-action="increase"
              data-id="${id}" aria-label="Increase ${item.name} quantity">+</button>

            <button class="remove-item" data-action="remove"
              data-id="${id}">Remove</button>
          </div>
        </div>

        <strong class="cart-item-total">${formatNaira(itemTotal)}</strong>
      </article>
    `;
    }).join("");
}

// Handle cart quantity changes and item removal
cartItems.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const { action, id } = button.dataset;
    if (!menuItems[id] || !(id in cart)) return;

    if (action === "increase") {
        cart[id] += 1;
    } else if (action === "decrease") {
        cart[id] -= 1;

        if (cart[id] <= 0) {
            delete cart[id];
        }
    } else if (action === "remove") {
        delete cart[id];
    }

    renderCart();
});

// Clear the entire cart
clearCartBtn.addEventListener("click", () => {
    Object.keys(cart).forEach((id) => delete cart[id]);
    renderCart();
});

// Scroll to the cart when "Your Order" is clicked
cartNav.addEventListener("click", () => {
    closeMobileMenu();
    document.getElementById("cart").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
});

// WhatsApp checkout
checkoutBtn.addEventListener("click", () => {
    const entries = Object.entries(cart).filter(([, quantity]) => quantity > 0);

    if (entries.length === 0) {
        alert("Your cart is empty! Add a meal from the menu first.");
        return;
    }

    const phoneInput = prompt(
        "Enter the restaurant's WhatsApp number with country code, numbers only.\n\nExample format for Nigeria: 2348012345678\n\nUse the restaurant's real number, not this example."
    );

    if (phoneInput === null) return;

    const phone = phoneInput.replace(/[\s()+-]/g, "");

    if (!/^\d{10,15}$/.test(phone)) {
        alert("Please enter a valid WhatsApp number using digits only.");
        return;
    }

    const orderLines = entries.map(([id, quantity]) => {
        const item = menuItems[id];
        return `• ${item.name} x ${quantity} — ${formatNaira(item.price * quantity)}`;
    });

    const total = entries.reduce((sum, [id, quantity]) => {
        return sum + menuItems[id].price * quantity;
    }, 0);

    const message = [
        "Hello Naija Bites! I'd like to place an order:",
        "",
        ...orderLines,
        "",
        `Subtotal: ${formatNaira(total)}`,
        "",
        "Please confirm availability, delivery options and the final cost. Thank you!"
    ].join("\n");

    const whatsappURL =
        `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    window.open(whatsappURL, "_blank", "noopener,noreferrer");
});

// Scroll reveal animations
const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    revealElements.forEach((element) => {
        revealObserver.observe(element);
    });
} else {
    revealElements.forEach((element) => {
        element.classList.add("visible");
    });
}

// Automatically update the footer year
document.getElementById("year").textContent = new Date().getFullYear();

// Initial cart display
renderCart();
