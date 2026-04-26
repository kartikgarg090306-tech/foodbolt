const API = "http://localhost:5000";

let cart = JSON.parse(localStorage.getItem("cart")) || [];

/* ================= USER ================= */
function showUser() {
  let u = JSON.parse(localStorage.getItem("user"));
  let el = document.getElementById("user");

  if (el && u) {
    el.innerText = `👤 ${u.name} | ₹${u.wallet}`;
  }
}

/* ================= REGISTER ================= */
async function register() {
  let name = document.getElementById("name").value;
  let password = document.getElementById("password").value;
  let phone = document.getElementById("phone").value;
  let address = document.getElementById("address").value;

  let res = await fetch(API + "/register", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({name, password, phone, address})
  });

  let data = await res.json();
  alert(data.message);
}

/* ================= LOGIN ================= */
async function login() {
  let name = document.getElementById("name").value;
  let password = document.getElementById("password").value;

  let res = await fetch(API + "/login", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({name, password})
  });

  let data = await res.json();
  alert(data.message);

  if (data.user) {
    localStorage.setItem("user", JSON.stringify(data.user));
    window.location = "index.html";
  }
}

function logout() {
  localStorage.clear();
  window.location = "login.html";
}

/* ================= RESTAURANTS ================= */
async function loadRestaurants() {
  let div = document.getElementById("restaurants");
  if (!div) return;

  let res = await fetch(API + "/restaurants");
  let data = await res.json();

  div.innerHTML = "";

  data.forEach(r => {
   div.innerHTML += `
<div class="card">
  <div class="img-box">
    <img src="${r.image}">
  </div>
  <h3>${r.name}</h3>
  <p>⭐ ${r.rating} / 5</p>
  <button class="btn" onclick="openMenu(${r.id})">View Menu</button>
</div>`;
  });
}

function openMenu(id) {
  localStorage.setItem("restaurant", id);
  window.location = "menu.html";
}

/* ================= MENU ================= */
async function loadMenu() {
  let div = document.getElementById("menu");
  if (!div) return;

  let id = localStorage.getItem("restaurant");

  let res = await fetch(API + "/food/" + id);
  let data = await res.json();

  div.innerHTML = "";

  data.forEach(i => {
    div.innerHTML += `
<div class="card">
  <h3>${i.name}</h3>
  <p>${i.description}</p>
  <p>₹${i.price}</p>
  <input type="number" id="qty-${i.id}" value="0" min="0">
  <button class="btn" onclick="addToCart(${i.id},'${i.name}',${i.price})">
    Add to Cart 🛒
  </button>
</div>`;
  });
  if (cart.length > 0) {
  let btn = document.getElementById("cartBtnContainer");
  if (btn) btn.style.display = "block";
}
}

/* ================= CART ================= */
function addToCart(id, name, price) {
  let qty = parseInt(document.getElementById(`qty-${id}`).value);

  if (!qty || qty <= 0) {
    return alert("Please select quantity first");
  }

  let item = cart.find(i => i.id === id);

  if (item) item.qty += qty;
  else cart.push({id, name, price, qty});

  localStorage.setItem("cart", JSON.stringify(cart));

  alert("Added to cart 🛒");

  // 🔥 SHOW BUTTON
  let btn = document.getElementById("cartBtnContainer");
  if (btn) btn.style.display = "block";
}

function loadCart() {
  let div = document.getElementById("cart");
  if (!div) return;

  let total = 0;
  div.innerHTML = "";

  cart.forEach((i, index) => {
    total += i.price * i.qty;

    div.innerHTML += `
    <div class="card">
      <h4>${i.name}</h4>
      <input value="${i.qty}" onchange="updateQty(${index},this.value)">
      <p>₹${i.price}</p>
      <button onclick="removeItem(${index})">Remove</button>
    </div>`;
  });

  document.getElementById("total").innerText = "₹" + total;
}

function updateQty(index, qty) {
  cart[index].qty = parseInt(qty);
  if (cart[index].qty <= 0) cart.splice(index, 1);

  localStorage.setItem("cart", JSON.stringify(cart));
  loadCart();
}

function removeItem(index) {
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  loadCart();
}

function clearCart() {
  cart = [];
  localStorage.removeItem("cart");
  loadCart();
}

/* ================= ORDER ================= */
async function placeOrder() {
  let u = JSON.parse(localStorage.getItem("user"));

  if (!u) return alert("Login first");

  let total = 0;
  cart.forEach(i => total += i.price * i.qty);

  let res = await fetch(API + "/order", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({userId: u.id, total})
  });

  let data = await res.json();

  alert(data.message);

  if (data.user) {
    localStorage.setItem("user", JSON.stringify(data.user));
    cart = [];
    localStorage.removeItem("cart");
    window.location = "index.html";
  }
}

/* ================= ORDERS ================= */
async function loadOrders() {
  let div = document.getElementById("orders");
  if (!div) return;

  let u = JSON.parse(localStorage.getItem("user"));
  if (!u) return alert("Login first");

  let res = await fetch(API + "/orders/" + u.id);
  let data = await res.json();

  div.innerHTML = "";

  if (data.length === 0) {
    div.innerHTML = "<p>No orders yet 😢</p>";
    return;
  }

  data.forEach(o => {
    div.innerHTML += `
      <div class="card">
        <h3>Order #${o.id}</h3>
        <p>Total: ₹${o.total}</p>
        <p>Date: ${new Date(o.created_at).toLocaleString()}</p>
      </div>
    `;
  });
}
function goHome() {
  window.location = "index.html";
}

function goOrders() {
  window.location = "order.html";
}

function goLogin() {
  window.location = "login.html";
}
/* ================= INIT ================= */
window.onload = () => {
  showUser();
  loadRestaurants();
  loadMenu();
  loadCart();
  loadOrders();
};