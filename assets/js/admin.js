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

document.addEventListener('DOMContentLoaded', () => {
    
    const btnAdminLogin = document.getElementById('btnAdminLogin');
    if(btnAdminLogin) {
        btnAdminLogin.addEventListener('click', () => {
            const pass = document.getElementById('adminPass').value;
            
            // Validar contraseña
            if (pass === 'admin123') {
                showToast("Acceso Concedido. Desencriptando datos...", "success");
                
                // Animación de entrada al dashboard
                setTimeout(() => {
                    document.getElementById('login-screen').classList.add('hidden');
                    document.getElementById('admin-dashboard').classList.remove('hidden');
                    loadAdminData();
                }, 1000);
            } else {
                showToast("Contraseña incorrecta. Intento bloqueado.", "error");
            }
        });
    }

});

function loadAdminData() {
    // 1. Obtener datos globales (Actualmente basado en nuestra 'BBDD' local user)
    let user = JSON.parse(localStorage.getItem("user"));
    
    if (!user) {
        // Objeto dummy si está vacío
        user = {
            name: "Ninguno",
            balance: 0,
            history: []
        };
    }

    // Calcular estadísticas
    let volume = 0;
    user.history.forEach(m => { volume += m.amount; });

    document.getElementById("stat-liquidity").textContent = "$" + (user.balance).toLocaleString('es-CO');
    document.getElementById("stat-volume").textContent = "$" + volume.toLocaleString('es-CO');

    // Cargar Historial en Tabla
    const tbody = document.getElementById("admin-table-body");
    tbody.innerHTML = "";

    if (user.history.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 20px; color: #a1a1aa;">No hay transacciones registradas en el sistema.</td></tr>`;
        return;
    }

    // Mostrar de más reciente a más antigua
    user.history.slice().reverse().forEach(m => {
        const tr = document.createElement("tr");
        
        let typeClass = "";
        let inOutFormat = "";
        
        if (m.type.includes("Depósito")) {
            typeClass = "badge-in";
            inOutFormat = "Ingreso";
        } else {
            typeClass = "badge-out";
            inOutFormat = "Egreso";
        }

        const formattedDate = m.date || new Date().toLocaleString();
        
        tr.innerHTML = `
            <td style="color: #a1a1aa;">${formattedDate}</td>
            <td style="font-weight: 600;">${user.name}</td>
            <td>${m.type}</td>
            <td style="font-weight: 600; font-family: monospace; font-size: 1.1rem;">$${m.amount.toLocaleString('es-CO')}</td>
            <td><span class="badge ${typeClass}">${inOutFormat}</span></td>
        `;
        tbody.appendChild(tr);
    });
}

function logoutAdmin() {
    document.getElementById('admin-dashboard').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('adminPass').value = '';
    showToast("Sesión cerrada por seguridad.", "success");
}
