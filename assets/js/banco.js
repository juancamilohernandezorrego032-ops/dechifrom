let user = JSON.parse(localStorage.getItem("user"));

if (!user) window.location.href = "../index.html";

let cart = [];
let currentAction = "";

// PRODUCTOS CON IMÁGENES
const products = [
  { name: "AirPods Pro", price: 200, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80" },
  { name: "iPhone 15", price: 800, image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=300&q=80" },
  { name: "MacBook Air", price: 1500, image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=300&q=80" },
  { name: "Keychron K2", price: 100, image: "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=300&q=80" },
  { name: "SmartWatch", price: 350, image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=300&q=80" },
  { name: "Cámara DSLR", price: 1200, image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=300&q=80" },
  { name: "Monitor 4K", price: 450, image: "https://images.unsplash.com/photo-1527443154391-507e9dc6c5cc?auto=format&fit=crop&w=300&q=80" },
  { name: "Tablet Pro", price: 600, image: "https://images.unsplash.com/photo-1544228428-c11438a0c2c3?auto=format&fit=crop&w=300&q=80" }
];

// INIT
function initStyles() {
    if (user && user.settings) {
        if (user.settings.bg) {
            document.body.style.background = `linear-gradient(rgba(10, 15, 30, 0.4), rgba(10, 15, 30, 0.7)), url('${user.settings.bg}') center/cover fixed`;
        }
        if (user.settings.color) {
            // Aplicar variables CSS
            document.documentElement.style.setProperty('--primary', user.settings.color);
            document.documentElement.style.setProperty('--accent', user.settings.color);
            document.documentElement.style.setProperty('--primary-vivid', user.settings.color);
            
            // Custom styles dinámicos si existe algun override extra 
            const avatar = document.querySelector('.avatar-lg');
            if(avatar) avatar.style.background = `linear-gradient(135deg, ${user.settings.color}, #ffffff)`;
        }
    }
}

document.getElementById("username").textContent = user.name;
initStyles();

function updateUI() {
  // Balance con animación / formato
  const balanceEl = document.getElementById("balance");
  const fmtBalance = Number(user.balance).toLocaleString('es-CO');
  balanceEl.textContent = fmtBalance;

  // Actualizar historial
  const historyEl = document.getElementById("history");
  historyEl.innerHTML = "";
  
  if (user.history.length === 0) {
    historyEl.innerHTML = `<p class="text-muted" style="text-align:center; padding:20px;">No hay movimientos recientes</p>`;
  }

  user.history.slice().reverse().forEach(m => {
    const li = document.createElement("li");
    const icon = m.type.includes("Depósito") ? "fa-arrow-down" : 
                 m.type.includes("Retiro") ? "fa-arrow-up" : 
                 m.type.includes("Compra") ? "fa-cart-shopping" : "fa-arrow-right-arrow-left";
    
    li.innerHTML = `
      <div style="display:flex; align-items:center; gap:15px">
        <div class="icon-box glass" style="width:40px; height:40px; display:flex; align-items:center; justify-content:center; border-radius:12px">
            <i class="fa-solid ${icon}" style="font-size:0.9rem"></i>
        </div>
        <div>
            <strong style="display:block; font-size:0.95rem">${m.type}</strong>
            <small style="color:var(--text-muted); font-size:0.75rem">${m.date || 'Reciente'}</small>
        </div>
      </div>
      <strong class="${m.type.includes("Depósito") ? 'text-vivid' : ''}">
        ${m.type.includes("Depósito") ? '+' : '-'}$${m.amount.toLocaleString()}
      </strong>
    `;
    historyEl.appendChild(li);
  });

  // Carrito
  const cartEl = document.getElementById("cart");
  cartEl.innerHTML = "";
  if (cart.length === 0) {
    cartEl.innerHTML = `<p class="text-muted" style="font-size:0.85rem">Tu carrito está vacío</p>`;
  }

  cart.forEach((p, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span><i class="fa-solid fa-tag" style="margin-right:10px; opacity:0.5; color: var(--accent)"></i> ${p.name}</span>
      <strong>$${p.price.toLocaleString('es-CO')}</strong>
    `;
    cartEl.appendChild(li);
  });

  localStorage.setItem("user", JSON.stringify(user));
}

// TOAST NOTIFICATIONS SYSTEM
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-circle-exclamation' : 'fa-info-circle';
  toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
  
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// RENDERIZAR TIENDA
function renderShop() {
    const shopEl = document.getElementById("shop");
    shopEl.innerHTML = "";
    products.forEach(p => {
      const div = document.createElement("div");
      div.className = "product animate-fade-in";
      div.innerHTML = `
        <div class="product-img-wrapper">
          <img src="${p.image}" alt="${p.name}" class="product-img">
        </div>
        <h4>${p.name}</h4>
        <p>$${p.price.toLocaleString('es-CO')}</p>
        <button onclick="addToCart('${p.name}', ${p.price})">Agregar</button>
      `;
      shopEl.appendChild(div);
    });
}

function addToCart(name, price) {
  cart.push({ name, price });
  showToast(`${name} agregado al carrito`, 'success');
  updateUI();
}

function buy() {
  const total = cart.reduce((sum, p) => sum + p.price, 0);

  if (cart.length === 0) return;
  if (user.balance < total) {
    showToast("No tienes saldo suficiente", "error");
    return;
  }

  user.balance -= total;
  user.history.push({
    type: "Compra en Tienda Market",
    amount: total,
    date: new Date().toLocaleString('es-CO', { hour12: true, month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })
  });

  cart = [];
  updateUI();
  showToast("¡Compra realizada con éxito!", "success");
  
  // Feedback visual
  const btn = document.querySelector('.btn-primary');
  const originalText = btn.innerHTML;
  btn.innerHTML = '<i class="fa-solid fa-check"></i> Compra Exitosa';
  setTimeout(() => btn.innerHTML = originalText, 2000);
}

// MODAL
function openModal(action) {
  currentAction = action;
  const modal = document.getElementById("modal");
  const title = document.getElementById("modal-title");
  const toUserContainer = document.getElementById("toUserContainer");

  modal.style.display = "block";
  title.textContent = action === "deposit" ? "Depositar Fondos" :
                      action === "withdraw" ? "Retirar Fondos" : "Enviar Dinero";
  
  toUserContainer.style.display = action === "transfer" ? "flex" : "none";
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
  document.getElementById("amount").value = "";
  document.getElementById("toUser").value = "";
}

function confirmAction() {
  const amount = Number(document.getElementById("amount").value);
  const toUser = document.getElementById("toUser").value;

  if (amount <= 0) return showToast("Monto inválido", "error");

  const dateStr = new Date().toLocaleString('es-CO', { hour12: true, month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' });

  if (currentAction === "deposit") {
    user.balance += amount;
    user.history.push({ type: "Depósito", amount, date: dateStr });
    showToast(`Depósito de $${amount.toLocaleString('es-CO')} exitoso`, "success");
  }

  if (currentAction === "withdraw") {
    if (user.balance < amount) return showToast("Saldo insuficiente", "error");
    user.balance -= amount;
    user.history.push({ type: "Retiro", amount, date: dateStr });
    showToast(`Retiro de $${amount.toLocaleString('es-CO')} exitoso`, "success");
  }

  if (currentAction === "transfer") {
    if (!toUser) return showToast("Usuario destino requerido", "error");
    if (user.balance < amount) return showToast("Saldo insuficiente", "error");

    user.balance -= amount;
    user.history.push({
      type: `Transferencia a ${toUser}`,
      amount,
      date: dateStr
    });
    showToast(`Transferencia a ${toUser} por $${amount.toLocaleString('es-CO')} enviada`, "success");
  }

  updateUI();
  closeModal();
}

// Cerrar modal al clickear fuera
window.onclick = function(event) {
  const modal = document.getElementById("modal");
  if (event.target == modal) closeModal();
}

renderShop();
updateUI();