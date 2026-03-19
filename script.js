function mostrarAlerta() {
  alert("Em breve você verá nossas promoções aqui!");
}

// medicamentos
function formatarPreco(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function carregarMedicamentos() {
  const container = document.getElementById("lista-medicamentos");

  if (!container) {
    console.error("Container de medicamentos não encontrado!");
    return;
  }

  container.innerHTML = "";

  listaMedicamentos.forEach(med => {
    const card = document.createElement("div");
    card.classList.add("card");

    const mensagem = `Olá, gostaria de comprar ${med.nome}`;

    card.innerHTML = `
      <img src="${med.imagem}" alt="${med.nome}">
      <h3>${med.nome}</h3>
      <p class="preco">${formatarPreco(med.preco)}</p>
      <a 
        href="https://wa.me/558335211803?text=${encodeURIComponent(mensagem)}"
        target="_blank"
        class="btn-whatsapp"
      >
        Comprar
      </a>
    `;

    container.appendChild(card);
  });
}

// GARANTE QUE O HTML JÁ CARREGOU
document.addEventListener("DOMContentLoaded", () => {
  carregarMedicamentos();
});
