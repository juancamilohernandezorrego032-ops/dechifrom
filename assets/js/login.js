document.addEventListener('DOMContentLoaded', () => {
    console.log("Sistema de Acceso Iniciado...");

    // ELEMENTOS DEL DOM
    const loginForm = document.getElementById('loginForm');
    const btnSignIn = document.getElementById('btnSignIn');

    // EVENTO: LOGIN
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const userValue = document.getElementById('username').value;
        const passwordValue = document.getElementById('password').value;
        
        // Simulación de proceso de autenticación
        btnSignIn.innerText = "Verificando...";
        btnSignIn.disabled = true;
        
        setTimeout(() => {
            if (userValue && passwordValue) {
                // GUARDAR DATOS DEL USUARIO
                const userData = {
                    name: userValue,
                    balance: 2847500,
                    history: [
                        { type: "Depósito inicial", amount: 2847500, date: new Date().toLocaleString() }
                    ]
                };
                localStorage.setItem("user", JSON.stringify(userData));

                btnSignIn.innerText = "ACCESO CONCEDIDO";
                
                // REDIRECCIÓN A LA PÁGINA DEL BANCO (MISMA CARPETA)
                setTimeout(() => {
                    window.location.href = "views/banco.html";
                }, 800);
            } else {
                alert("Por favor, completa todos los campos.");
                btnSignIn.innerText = "SIGN IN";
                btnSignIn.disabled = false;
            }
        }, 1500);
    });
});
