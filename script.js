// =============================
// 🛒 CARRINHO
// =============================
let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

// =============================
// 💰 FORMATAÇÃO
// =============================
function formatarPreco(valor) {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

// =============================
// 💾 SALVAR CARRINHO
// =============================
function salvarCarrinho() {
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
}

// =============================
// ➕ ADICIONAR PRODUTO
// =============================
function adicionarCarrinho(nome, preco) {
    const item = carrinho.find(p => p.nome === nome);

    if (item) {
        item.quantidade++;
    } else {
        carrinho.push({ nome, preco, quantidade: 1 });
    }

    salvarCarrinho();
    atualizarCarrinho();
}

// =============================
// ➕➖ ALTERAR QUANTIDADE
// =============================
function alterarQuantidade(index, delta) {
    carrinho[index].quantidade += delta;

    if (carrinho[index].quantidade <= 0) {
        carrinho.splice(index, 1);
    }

    salvarCarrinho();
    atualizarCarrinho();
}

// =============================
// 🚚 FRETE
// =============================
function calcularFrete(subtotal) {
    if (subtotal === 0) return 0;
    if (subtotal >= 50) return 0;
    return 5;
}

// =============================
// 🛒 ATUALIZAR CARRINHO
// =============================
function atualizarCarrinho() {
    const lista = document.getElementById("carrinho-itens");
    const totalEl = document.getElementById("total");
    const freteEl = document.getElementById("frete");

    if (!lista) return;

    lista.innerHTML = "";

    let subtotal = 0;

    carrinho.forEach((item, index) => {
        subtotal += item.preco * item.quantidade;

        const div = document.createElement("div");
        div.className = "carrinho-item";

        div.innerHTML = `
      <span>${item.nome}</span>

      <div class="quantidade">
        <button onclick="alterarQuantidade(${index}, -1)">-</button>
        <span>${item.quantidade}</span>
        <button onclick="alterarQuantidade(${index}, 1)">+</button>
      </div>

      <strong>${formatarPreco(item.preco * item.quantidade)}</strong>
    `;

        lista.appendChild(div);
    });

    const frete = calcularFrete(subtotal);
    const total = subtotal + frete;

    if (freteEl) {
        freteEl.innerText = subtotal > 0
            ? `Entrega: ${frete === 0 ? "Grátis" : formatarPreco(frete)}`
            : "";
    }

    if (totalEl) {
        totalEl.innerText = subtotal > 0
            ? `Total: ${formatarPreco(total)}`
            : "Total: R$ 0,00";
    }

    // salvar estado
    salvarCarrinho();
}

// =============================
// 📦 GERAR NÚMERO DE PEDIDO
// =============================
function gerarNumeroPedido() {
    return Math.floor(Math.random() * 100000);
}

// =============================
// 💾 SALVAR PEDIDO
// =============================
function salvarPedido(pedido) {
    let pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
    pedidos.push(pedido);
    localStorage.setItem("pedidos", JSON.stringify(pedidos));
}

// =============================
// 📦 ENVIAR PEDIDO
// =============================
function enviarPedido() {
    if (carrinho.length === 0) return;

    const endereco = document.getElementById("endereco").value.trim();
    const pagamento = document.getElementById("pagamento").value;
    const troco = document.getElementById("troco").value;

    if (!endereco) return alert("Informe o endereço!");
    if (!pagamento) return alert("Selecione o pagamento!");

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

    salvarPedido(pedido);

    carrinho = [];
    salvarCarrinho();
    atualizarCarrinho();

    alert(`Pedido #${numeroPedido} enviado com sucesso!`);

    fecharCarrinho();
}

// =============================
// 📲 FINALIZAR NO WHATSAPP
// =============================
function finalizarCompra() {
    let pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];

    if (pedidos.length === 0) {
        return alert("Nenhum pedido enviado ainda!");
    }

    const pedido = pedidos[pedidos.length - 1];

    let mensagem = `🧾 Pedido #${pedido.numero}\n\n`;

    pedido.itens.forEach(item => {
        mensagem += `- ${item.nome} x${item.quantidade}\n`;
    });

    mensagem += `\nTotal: ${formatarPreco(pedido.total)}`;
    mensagem += `\nEndereço: ${pedido.endereco}`;
    mensagem += `\nPagamento: ${pedido.pagamento}`;

    if (pedido.troco) {
        mensagem += `\nTroco para: ${formatarPreco(Number(pedido.troco))}`;
    }

    const url = `https://wa.me/558335211803?text=${encodeURIComponent(mensagem)}`;
    window.open(url, "_blank");
}

// =============================
// 💬 CHAT CLIENTE (TEMPO REAL)
// =============================

let chatId = localStorage.getItem("chatId");

if (!chatId) {
    chatId = "chat_" + Date.now();
    localStorage.setItem("chatId", chatId);
}

function toggleChat() {
    const chat = document.getElementById("chat-body");
    chat.style.display = chat.style.display === "flex" ? "none" : "flex";
}

function enviarMensagem() {
    const input = document.getElementById("chat-input");
    const texto = input.value.trim();

    if (!texto) return;

    let chats = JSON.parse(localStorage.getItem("chats")) || {};

    if (!chats[chatId]) {
        chats[chatId] = { mensagens: [] };
    }

    chats[chatId].mensagens.push({
        tipo: "cliente",
        texto,
        data: new Date().toLocaleTimeString()
    });

    localStorage.setItem("chats", JSON.stringify(chats));

    input.value = "";
    carregarChat();
}

function carregarChat() {
    const container = document.getElementById("chat-mensagens");
    if (!container) return;

    let chats = JSON.parse(localStorage.getItem("chats")) || {};

    // 🔥 SE CHAT FOI ENCERRADO
    if (!chats[chatId]) {
        container.innerHTML = `
      <div class="msg loja">
        Atendimento encerrado. Se precisar, envie uma nova mensagem 😊
      </div>
    `;
        return;
    }

    let mensagens = chats[chatId].mensagens;

    container.innerHTML = "";

    mensagens.forEach(msg => {
        const div = document.createElement("div");
        div.classList.add("msg", msg.tipo);
        div.innerText = msg.texto;
        container.appendChild(div);
    });

    container.scrollTop = container.scrollHeight;
}


// 🔄 atualizar chat automaticamente
setInterval(carregarChat, 1500);

// =============================
// 🚀 INIT
// =============================
document.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("fade-in");

    atualizarCarrinho();
    carregarChat();
});
