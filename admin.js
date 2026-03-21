
// PROTEÇÃO DE ACESSO
if (localStorage.getItem("logado") !== "true") {
  window.location.href = "login.html";
}
function logout() {
  document.body.classList.add("fade-out");

  setTimeout(() => {
    localStorage.removeItem("logado");
    window.location.href = "login.html";
  }, 400);
}
document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("fade-in");
});


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
// CARREGAR PEDIDOS
// =============================
function carregarPedidos() {
  const pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];

  const recebidos = document.getElementById("recebidos");
  const preparacao = document.getElementById("preparacao");
  const enviados = document.getElementById("enviados");

  if (!recebidos || !preparacao || !enviados) return;

  recebidos.innerHTML = "";
  preparacao.innerHTML = "";
  enviados.innerHTML = "";

  pedidos.forEach((pedido, index) => {
    const div = document.createElement("div");
    div.className = "card";

    let itens = "";
    pedido.itens.forEach(item => {
      itens += `<p>${item.nome} x${item.quantidade}</p>`;
    });

    div.innerHTML = `
      <h3>Pedido #${pedido.numero}</h3>
      <p><strong>Data:</strong> ${pedido.data}</p>

      <div style="margin:10px 0;">
        ${itens}
      </div>

      <p><strong>Total:</strong> ${formatarPreco(pedido.total)}</p>
      <p><strong>Pagamento:</strong> ${pedido.pagamento}</p>
      <p><strong>Endereço:</strong> ${pedido.endereco}</p>

      ${pedido.troco ? `<p><strong>Troco:</strong> ${formatarPreco(Number(pedido.troco))}</p>` : ""}

      ${pedido.status === "recebido" ? `
        <button onclick="mudarStatus(${index}, 'preparacao')">
          Iniciar Preparação
        </button>
      ` : ""}

      ${pedido.status === "preparacao" ? `
        <button onclick="mudarStatus(${index}, 'enviado')">
          Enviar Pedido
        </button>
      ` : ""}

      ${pedido.status === "enviado" ? `
        <button onclick="marcarRecebido(${index})" style="background:#22c55e;">
          Cliente Recebeu
        </button>

        <button onclick="encerrarPedido(${index})" style="background:#ef4444;">
          Encerrar Pedido
        </button>
      ` : ""}
    `;

    // DISTRIBUIR NAS COLUNAS
    if (pedido.status === "recebido") {
      recebidos.appendChild(div);
    } else if (pedido.status === "preparacao") {
      preparacao.appendChild(div);
    } else if (pedido.status === "enviado") {
      enviados.appendChild(div);
    }
  });
}

// =============================
// MUDAR STATUS
// =============================
function mudarStatus(index, novoStatus) {
  let pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];

  pedidos[index].status = novoStatus;

  localStorage.setItem("pedidos", JSON.stringify(pedidos));

  carregarPedidos();
}

// =============================
// MARCAR COMO RECEBIDO
// =============================
function marcarRecebido(index) {
  alert("Pedido entregue com sucesso ao cliente!");
}

// =============================
// ENCERRAR PEDIDO
// =============================
function encerrarPedido(index) {
  let pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
  let concluidos = JSON.parse(localStorage.getItem("pedidosConcluidos")) || [];

  if (!confirm("Deseja encerrar este pedido?")) return;

  const pedidoEncerrado = pedidos[index];

  // salva como concluído
  concluidos.push({
    ...pedidoEncerrado,
    encerradoEm: new Date().toLocaleString()
  });

  localStorage.setItem("pedidosConcluidos", JSON.stringify(concluidos));

  // remove da lista ativa
  pedidos.splice(index, 1);
  localStorage.setItem("pedidos", JSON.stringify(pedidos));

  carregarPedidos();
  atualizarResumo();
}

function atualizarResumo() {
  const resumo = document.getElementById("resumo-dia");

  if (!resumo) return;

  const concluidos = JSON.parse(localStorage.getItem("pedidosConcluidos")) || [];

  const hoje = new Date().toLocaleDateString();

  const pedidosHoje = concluidos.filter(pedido =>
    pedido.encerradoEm.startsWith(hoje)
  );

  resumo.innerText = `📊 Pedidos concluídos hoje: ${pedidosHoje.length}`;
}

document.addEventListener("DOMContentLoaded", () => {
  carregarPedidos();
  atualizarResumo();
});

setInterval(() => {
  carregarPedidos();
  atualizarResumo();
}, 5000);


// =============================
// AUTO ATUALIZAÇÃO
// =============================
setInterval(carregarPedidos, 5000);

// =============================
// INIT
// =============================
document.addEventListener("DOMContentLoaded", carregarPedidos);
