function login() {
  const usuario = document.getElementById("usuario").value;
  const senha = document.getElementById("senha").value;
  const erro = document.getElementById("erro");

  if (usuario === "admin" && senha === "1234") {
    localStorage.setItem("logado", "true");

    // ✨ animação
    document.body.classList.add("fade-out");

    setTimeout(() => {
      window.location.href = "admin.html";
    }, 400);

  } else {
    erro.innerText = "Usuário ou senha inválidos!";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("fade-in");
});
