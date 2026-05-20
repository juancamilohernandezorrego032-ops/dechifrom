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

function loadInversiones() {
    let user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;
    
    const tbody = document.getElementById("inv-table-body");
    tbody.innerHTML = "";

    // Filtramos para buscar elementos que hayan sido compras en la tienda market o similar.
    // Guardamos el índice original para poder eliminarlo de forma segura del vector real.
    const compras = user.history.map((m, index) => ({...m, originalIndex: index}))
                                .filter(m => typeof m.type === "string" && m.type.toLowerCase().includes("compra"));

    if (compras.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#a1a1aa; padding:40px;">No posees bienes o compras activas para administrar y mostrar en el mapa.</td></tr>`;
        return;
    }

    // Listar las compras
    compras.reverse().forEach(c => {
        const tr = document.createElement("tr");
        const formattedDate = c.date || new Date().toLocaleString();
        
        tr.innerHTML = `
            <td style="color:#a1a1aa;">${formattedDate}</td>
            <td style="font-weight:bold;"><i class="fa-solid fa-barcode" style="margin-right:10px; color:var(--admin-accent)"></i> ${c.type}</td>
            <td style="font-family:monospace; font-size:1.1rem; font-weight:bold; color:#22c55e">
                $${c.amount.toLocaleString('es-CO')}
            </td>
            <td>
                <button class="btn-delete" onclick="eliminarCompra(${c.originalIndex}, ${c.amount})">
                    <i class="fa-solid fa-trash"></i> Cancelar y Reembolsar
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.eliminarCompra = function(index, amount) {
    if(confirm(`¿Estás seguro de cancelar esta compra u operación? 
Esta acción DEVOLVERÁ $${amount.toLocaleString('es-CO')} a tu billetera principal.`)) {
        
        // Refrescamos siempre el localStorage justo antes para no tener data sucia
        let currentUser = JSON.parse(localStorage.getItem('user'));
        if (!currentUser) return;

        // Se le retorna el dinero al saldo general
        currentUser.balance += amount;
        
        // Removemos de la historia ese objeto específico
        currentUser.history.splice(index, 1);
        
        // Le agregamos un comprobante de reintegro en el banco
        currentUser.history.push({
            type: "Reembolso por Operación Cancelada",
            amount: amount,
            date: new Date().toLocaleString('es-CO', { hour12: true, month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })
        });
        
        localStorage.setItem("user", JSON.stringify(currentUser));
        
        showToast("¡Monto reembolsado al banco exitosamente!", "success");
        loadInversiones(); 
    }
};

document.addEventListener('DOMContentLoaded', loadInversiones);
