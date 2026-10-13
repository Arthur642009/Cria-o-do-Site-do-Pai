const ADMIN_EMAIL = "admin@morada.com.br";
const ADMIN_PASSWORD = "morada123";
const form = document.querySelector("#login-form");
const error = document.querySelector("#login-error");
document.querySelector("#toggle-password").addEventListener("click", () => {
  const p = document.querySelector("#password");
  p.type = p.type === "password" ? "text" : "password";
});
document.querySelector("#admin-hint").addEventListener("click", (e) => {
  e.preventDefault();
  document.querySelector("#email").value = ADMIN_EMAIL;
  document.querySelector("#password").value = ADMIN_PASSWORD;
  error.textContent = "Credenciais de demonstração preenchidas.";
});
document.querySelector("#forgot-password").addEventListener("click", (e) => {
  e.preventDefault();
  error.textContent =
    "Entre em contato com suporte@morada.com.br para recuperar seu acesso.";
});
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.querySelector("#email").value.trim().toLowerCase();
  const password = document.querySelector("#password").value;
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    sessionStorage.setItem(
      "morada-admin",
      JSON.stringify({ email, name: "Equipe Morada" })
    );
    location.href = "admin.html";
  } else {
    error.textContent =
      "E-mail ou senha inválidos. Confira seus dados e tente novamente.";
  }
});
