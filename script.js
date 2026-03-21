// =============================
// FORMATAÇÃO DE PREÇO
// =============================
function formatarPreco(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

// =============================
// CARRINHO (LOCALSTORAGE)
// =============================
let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

function salvarCarrinho() {
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
}

// =============================
// GERAR NÚMERO DO PEDIDO
// =============================
function gerarNumeroPedido() {
  let numero = localStorage.getItem("numeroPedido") || 1;
  localStorage.setItem("numeroPedido", Number(numero) + 1);
  return numero;
}

// =============================
// SALVAR PEDIDO
// =============================
function salvarPedido(pedido) {
  let pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
  pedidos.push(pedido);
  localStorage.setItem("pedidos", JSON.stringify(pedidos));
}

// =============================
// ADICIONAR PRODUTO
// =============================
function adicionarAoCarrinho(med) {
  const itemExistente = carrinho.find(item => item.id === med.id);

  if (itemExistente) {
    itemExistente.quantidade++;
  } else {
    carrinho.push({ ...med, quantidade: 1 });
  }

  salvarCarrinho();
  atualizarCarrinho();
}

// =============================
// ALTERAR QUANTIDADE
// =============================
function alterarQuantidade(index, tipo) {
  if (tipo === "mais") {
    carrinho[index].quantidade++;
  } else {
    carrinho[index].quantidade--;

    if (carrinho[index].quantidade <= 0) {
      carrinho.splice(index, 1);
    }
  }

  salvarCarrinho();
  atualizarCarrinho();
}

// =============================
// FRETE AUTOMÁTICO
// =============================
function calcularFrete(subtotal) {
  if (subtotal >= 50) return 0;
  if (subtotal >= 20) return 5;
  return 8;
}

// =============================
// TROCO DINÂMICO
// =============================
function verificarPagamento() {
  const pagamento = document.getElementById("pagamento").value;
  const trocoInput = document.getElementById("troco");

  if (!trocoInput) return;

  if (pagamento === "Dinheiro") {
    trocoInput.style.display = "block";
  } else {
    trocoInput.style.display = "none";
    trocoInput.value = "";
  }
}

// =============================
// ATUALIZAR CARRINHO
// =============================
function atualizarCarrinho() {
  const contador = document.getElementById("cart-count");
  const lista = document.getElementById("carrinho-itens");
  const subtotalEl = document.getElementById("carrinho-subtotal");
  const freteEl = document.getElementById("carrinho-frete");
  const totalEl = document.getElementById("carrinho-total");
  const btnFinalizar = document.querySelector(".btn-finalizar");

  if (!lista || !totalEl) return;

  lista.innerHTML = "";

  let subtotal = 0;
  let totalItens = 0;

  carrinho.forEach((item, index) => {
    const subtotalItem = item.preco * item.quantidade;

    subtotal += subtotalItem;
    totalItens += item.quantidade;

    const div = document.createElement("div");
    div.className = "carrinho-item";

    div.innerHTML = `
      <div>
        <strong>${item.nome}</strong><br>
        ${item.quantidade}x ${formatarPreco(item.preco)}<br>
        <small>Subtotal: ${formatarPreco(subtotalItem)}</small>
      </div>

      <div class="quantidade">
        <button onclick="alterarQuantidade(${index}, 'menos')">➖</button>
        <span>${item.quantidade}</span>
        <button onclick="alterarQuantidade(${index}, 'mais')">➕</button>
      </div>
    `;

    lista.appendChild(div);
  });

  // 🔥 LÓGICA CORRETA
  let frete = 0;
  let total = 0;

  if (carrinho.length > 0) {
    frete = calcularFrete(subtotal);
    total = subtotal + frete;
  }

  // SUBTOTAL
  if (subtotalEl) {
    subtotalEl.innerText = carrinho.length === 0 
      ? "R$ 0,00" 
      : formatarPreco(subtotal);
  }

  // FRETE
  if (freteEl) {
    freteEl.innerText = carrinho.length === 0 
      ? "-" 
      : (frete === 0 ? "Grátis" : formatarPreco(frete));
  }

  // TOTAL
  if (totalEl) {
    totalEl.innerText = carrinho.length === 0 
      ? "R$ 0,00" 
      : formatarPreco(total);
  }

  // CONTADOR
  if (contador) contador.innerText = totalItens;

  // BOTÃO FINALIZAR
  if (btnFinalizar) {
    btnFinalizar.style.display = carrinho.length === 0 ? "none" : "block";
  }
}

// =============================
// MODAL
// =============================
function abrirCarrinho() {
  document.getElementById("carrinho-modal").style.display = "flex";
}

function fecharCarrinho() {
  document.getElementById("carrinho-modal").style.display = "none";
}

// =============================
// FINALIZAR COMPRA
// =============================
function finalizarCompra() {
  if (carrinho.length === 0) return;

  const endereco = document.getElementById("endereco").value.trim();
  const pagamento = document.getElementById("pagamento").value;
  const troco = document.getElementById("troco").value;

  if (!endereco) {
    alert("Informe o endereço!");
    return;
  }

  if (!pagamento) {
    alert("Selecione o pagamento!");
    return;
  }

  const numeroPedido = gerarNumeroPedido();

  let mensagem = `🧾 *Pedido #${numeroPedido}*\n`;
  mensagem += "🛒 *Farmácia do Bem*\n\n";

  let subtotal = 0;

  carrinho.forEach(item => {
    const subtotalItem = item.preco * item.quantidade;

    mensagem += `- ${item.nome} x${item.quantidade}\n`;
    mensagem += `  ${formatarPreco(subtotalItem)}\n`;

    subtotal += subtotalItem;
  });

  const frete = calcularFrete(subtotal);
  const total = subtotal + frete;

  mensagem += `\nSubtotal: ${formatarPreco(subtotal)}`;
  mensagem += `\nEntrega: ${frete === 0 ? "Grátis" : formatarPreco(frete)}`;
  mensagem += `\nTotal: ${formatarPreco(total)}`;

  mensagem += `\n\n📍 Endereço: ${endereco}`;
  mensagem += `\n💳 Pagamento: ${pagamento}`;

  if (pagamento === "Dinheiro" && troco) {
    mensagem += `\n💵 Troco para: ${formatarPreco(Number(troco))}`;
  }

  // 💾 SALVAR PEDIDO
const pedido = {
  numero: numeroPedido,
  itens: carrinho,
  subtotal,
  frete,
  total,
  endereco,
  pagamento,
  troco: pagamento === "Dinheiro" ? troco : null,
  status: "recebido", // 🔥 NOVO
  data: new Date().toLocaleString()
};


  salvarPedido(pedido);

  // 🔄 LIMPAR CARRINHO
  carrinho = [];
  salvarCarrinho();
  atualizarCarrinho();

  // 📲 WHATSAPP
  const url = `https://wa.me/558335211803?text=${encodeURIComponent(mensagem)}`;
  window.open(url, "_blank");
}

// =============================
// CARREGAR MEDICAMENTOS
// =============================
function carregarMedicamentos() {
  const container = document.getElementById("lista-medicamentos");

  if (!container || typeof listaMedicamentos === "undefined") return;

  container.innerHTML = "";

  listaMedicamentos.forEach(med => {
    const card = document.createElement("div");
    card.className = "card";

    const mensagem = `Olá, gostaria de comprar ${med.nome}`;

    card.innerHTML = `
      <img src="${med.imagem}" alt="${med.nome}">
      <h3>${med.nome}</h3>
      <p class="preco">${formatarPreco(med.preco)}</p>

      <button onclick='adicionarAoCarrinho(${JSON.stringify(med)})' class="btn-carrinho">
        Adicionar 🛒
      </button>

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

// =============================
// HEADER SCROLL
// =============================
window.addEventListener("scroll", () => {
  const header = document.querySelector("header");
  if (!header) return;

  header.classList.toggle("scrolled", window.scrollY > 50);
});


function enviarPedido() {
  if (carrinho.length === 0) return;

  const endereco = document.getElementById("endereco").value.trim();
  const pagamento = document.getElementById("pagamento").value;
  const troco = document.getElementById("troco").value;

  if (!endereco) {
    alert("Informe o endereço!");
    return;
  }

  if (!pagamento) {
    alert("Selecione o pagamento!");
    return;
  }

  const numeroPedido = gerarNumeroPedido();

  let subtotal = 0;

  carrinho.forEach(item => {
    subtotal += item.preco * item.quantidade;
  });

  const frete = calcularFrete(subtotal);
  const total = subtotal + frete;

  const pedido = {
    numero: numeroPedido,
    itens: carrinho,
    subtotal,
    frete,
    total,
    endereco,
    pagamento,
    troco: pagamento === "Dinheiro" ? troco : null,
    status: "recebido",
    data: new Date().toLocaleString()
  };

  // 💾 SALVAR
  salvarPedido(pedido);

  // 🧹 LIMPAR CARRINHO
  carrinho = [];
  salvarCarrinho();
  atualizarCarrinho();

  // 🔔 FEEDBACK
  alert(`Pedido #${numeroPedido} enviado com sucesso!`);

  fecharCarrinho();
}


// =============================
// INIT
// =============================
document.addEventListener("DOMContentLoaded", () => {
  carregarMedicamentos();
  atualizarCarrinho();
});
