// =============================
// 🔐 PROTEÇÃO DE ACESSO
// =============================
if (localStorage.getItem("logado") !== "true") {
  window.location.href = "login.html";
}

// =============================
// 📍 ENDEREÇO FIXO DA FARMÁCIA
// =============================
const ORIGEM = "Rua Sinfrônio Nazare, 13A - Sousa/PB";

// =============================
// 💰 FORMATAÇÃO DE PREÇO
// =============================
function formatarPreco(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

// =============================
// 📦 CARREGAR PEDIDOS (KANBAN)
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
// 🔄 MUDAR STATUS
// =============================
function mudarStatus(index, novoStatus) {
  let pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];

  pedidos[index].status = novoStatus;

  localStorage.setItem("pedidos", JSON.stringify(pedidos));

  carregarPedidos();
  carregarRotas();
}

// =============================
// 📦 MARCAR COMO RECEBIDO
// =============================
function marcarRecebido(index) {
  alert("Pedido entregue com sucesso ao cliente!");
}

// =============================
// ❌ ENCERRAR PEDIDO (SALVA HISTÓRICO)
// =============================
function encerrarPedido(index) {
  let pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
  let concluidos = JSON.parse(localStorage.getItem("pedidosConcluidos")) || [];

  if (!confirm("Deseja encerrar este pedido?")) return;

  const pedidoEncerrado = pedidos[index];

  concluidos.push({
    ...pedidoEncerrado,
    encerradoEm: new Date().toLocaleString()
  });

  localStorage.setItem("pedidosConcluidos", JSON.stringify(concluidos));

  pedidos.splice(index, 1);
  localStorage.setItem("pedidos", JSON.stringify(pedidos));

  carregarPedidos();
  carregarRotas();
  atualizarResumo();
}

// =============================
// 🗺️ ROTAS DE ENTREGA
// =============================
function carregarRotas() {
  const pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
  const rotas = document.getElementById("rotas");

  if (!rotas) return;

  rotas.innerHTML = "";

  pedidos.forEach(pedido => {
    if (pedido.status !== "enviado") return;

    const div = document.createElement("div");
    div.className = "card";

    const destino = pedido.endereco;

    const linkMapa = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(ORIGEM)}&destination=${encodeURIComponent(destino)}&travelmode=driving`;

    div.innerHTML = `
      <h3>Pedido #${pedido.numero}</h3>
      <p><strong>Destino:</strong> ${destino}</p>

      <a href="${linkMapa}" target="_blank" class="btn-whatsapp">
        🗺️ Ver Rota
      </a>
    `;

    rotas.appendChild(div);
  });
}

// =============================
// 📊 RESUMO DO DIA
// =============================
function atualizarResumo() {
  const resumo = document.getElementById("resumo-dia");

  if (!resumo) return;

  const concluidos = JSON.parse(localStorage.getItem("pedidosConcluidos")) || [];

  const hoje = new Date().toLocaleDateString();

  const pedidosHoje = concluidos.filter(p =>
    p.encerradoEm.startsWith(hoje)
  );

  resumo.innerText = `📊 Pedidos concluídos hoje: ${pedidosHoje.length}`;
}

// =============================
// 🚪 LOGOUT COM ANIMAÇÃO
// =============================
function logout() {
  document.body.classList.add("fade-out");

  setTimeout(() => {
    localStorage.removeItem("logado");
    window.location.href = "login.html";
  }, 400);
}


let chatSelecionado = null;

// ================= LISTAR CHATS =================
function carregarChats() {
  const lista = document.getElementById("lista-chats");
  if (!lista) return;

  const chats = JSON.parse(localStorage.getItem("chats")) || {};

  lista.innerHTML = "";

  Object.keys(chats).forEach(id => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerText = `Cliente ${id.slice(-4)}`;

    div.onclick = () => {
      chatSelecionado = id;
      carregarMensagensAdmin();
    };

    lista.appendChild(div);
  });
}

// ================= CARREGAR MENSAGENS =================
function carregarMensagensAdmin() {
  const container = document.getElementById("chat-admin-mensagens");
  if (!container || !chatSelecionado) return;

  const chats = JSON.parse(localStorage.getItem("chats")) || {};
  const mensagens = chats[chatSelecionado]?.mensagens || [];

  container.innerHTML = "";

  mensagens.forEach(msg => {
    const div = document.createElement("div");
    div.classList.add("msg", msg.tipo);
    div.innerText = msg.texto;
    container.appendChild(div);
  });

  container.scrollTop = container.scrollHeight;
}

// ================= RESPONDER =================
function responderChat() {
  const input = document.getElementById("admin-input");
  const texto = input.value.trim();

  if (!texto || !chatSelecionado) return;

  let chats = JSON.parse(localStorage.getItem("chats")) || {};

  chats[chatSelecionado].mensagens.push({
    tipo: "admin",
    texto,
    data: new Date().toLocaleTimeString()
  });

  localStorage.setItem("chats", JSON.stringify(chats));

  input.value = "";

  carregarMensagensAdmin();
}

function encerrarChat() {
  if (!chatSelecionado) {
    alert("Selecione um chat primeiro!");
    return;
  }

  if (!confirm("Deseja encerrar esta conversa?")) return;

  let chats = JSON.parse(localStorage.getItem("chats")) || {};

  // 🧹 remove o chat inteiro
  delete chats[chatSelecionado];

  localStorage.setItem("chats", JSON.stringify(chats));

  // limpa tela
  chatSelecionado = null;
  document.getElementById("chat-admin-mensagens").innerHTML = "";

  carregarChats();
}


// ================= AUTO UPDATE =================
setInterval(() => {
  carregarChats();
  carregarMensagensAdmin();
}, 1500);



// =============================
// 🔄 AUTO ATUALIZAÇÃO
// =============================
setInterval(() => {
  carregarPedidos();
  carregarRotas();
  atualizarResumo();
}, 5000);

// =============================
// 🚀 INIT
// =============================
document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("fade-in");

  carregarPedidos();
  carregarRotas();
  atualizarResumo();
});
