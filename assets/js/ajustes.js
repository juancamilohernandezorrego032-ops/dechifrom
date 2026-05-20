function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-circle-exclamation';
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

document.addEventListener('DOMContentLoaded', () => {
    let user = JSON.parse(localStorage.getItem('user'));
    if (!user) window.location.href = "../index.html";

    document.getElementById('sidebar-username').textContent = user.name;
    document.getElementById('config-name').value = user.name;
    
    if (user.settings) {
        if (user.settings.bg) document.getElementById('config-bg').value = user.settings.bg;
        if (user.settings.color) document.getElementById('config-color').value = user.settings.color;
    }

    aplicarOpcionesVisuales();
});

function guardarAjustes() {
    let user = JSON.parse(localStorage.getItem('user'));
    
    // Obtener los datos del formulario
    const newName = document.getElementById('config-name').value.trim();
    const newBg = document.getElementById('config-bg').value.trim();
    const newColor = document.getElementById('config-color').value;

    if (!newName) return showToast("El nombre no puede estar vacío.", "error");

    user.name = newName;
    
    if (!user.settings) user.settings = {};
    user.settings.bg = newBg;
    user.settings.color = newColor;

    // Guardar los ajustes combinados en Base de Datos Local
    localStorage.setItem('user', JSON.stringify(user));
    
    document.getElementById('sidebar-username').textContent = newName;

    // Ejecutar aplicación visual
    aplicarOpcionesVisuales();

    showToast("¡Diseño y Ajustes Modificados con Éxito!", "success");
}

function aplicarOpcionesVisuales() {
    let user = JSON.parse(localStorage.getItem('user'));
    if (user && user.settings) {
        if (user.settings.bg) {
            document.body.style.background = `linear-gradient(rgba(10, 15, 30, 0.4), rgba(10, 15, 30, 0.7)), url('${user.settings.bg}') center/cover fixed`;
        } else {
            document.body.style.background = `linear-gradient(rgba(10, 15, 30, 0.4), rgba(10, 15, 30, 0.7)), url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1920') center/cover fixed`;
        }

        if (user.settings.color) {
            document.documentElement.style.setProperty('--primary', user.settings.color);
            document.documentElement.style.setProperty('--accent', user.settings.color);
            document.documentElement.style.setProperty('--primary-vivid', user.settings.color);
            
            // Re-pintar sidebar avatar color 
            document.getElementById('sidebar-avatar').style.background = `linear-gradient(135deg, ${user.settings.color}, #ffffff)`;
        }
    }
}
