// Importa os produtos
import products from './products.js';

// Elementos do DOM
const form = document.getElementById('form-agendamento');
const lista = document.getElementById('lista-agendamentos');
const productsList = document.getElementById('products-list');

// =======================
// COOKIES
// =======================
function salvarCookie(nome, valor, dias = 30) {
  const data = new Date();
  data.setTime(data.getTime() + (dias * 24 * 60 * 60 * 1000));
  const expira = "expires=" + data.toUTCString();
  document.cookie = `${nome}=${encodeURIComponent(valor)};${expira};path=/`;
}

function lerCookie(nome) {
  const nomeEq = nome + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i].trim();
    if (c.indexOf(nomeEq) === 0) {
      return decodeURIComponent(c.substring(nomeEq.length, c.length));
    }
  }
  return null;
}

// =======================
// AGENDAMENTOS
// =======================
let agendamentos = [];
const cookieSalvo = lerCookie('agendamentos');
if (cookieSalvo) {
  try {
    agendamentos = JSON.parse(cookieSalvo);
  } catch (e) {
    console.error("Erro ao ler os cookies:", e);
    agendamentos = [];
  }
}

function atualizarLista() {
  lista.innerHTML = '';
  agendamentos.forEach((item, index) => {
    const li = document.createElement('li');
    li.textContent = `${item.nomeCliente} - ${item.tipoServico} - ${item.data} às ${item.hora} - ${item.pagamento}`;

    const btnRemover = document.createElement('button');
    btnRemover.textContent = '❌';
    btnRemover.style.marginLeft = '10px';
    btnRemover.onclick = () => {
      agendamentos.splice(index, 1);
      salvarCookie('agendamentos', JSON.stringify(agendamentos));
      atualizarLista();
    };

    li.appendChild(btnRemover);
    lista.appendChild(li);
  });
}

// =======================
// WHATSAPP
// =======================
function isMobile() {
  return /Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);
}

function getWhatsAppLink(numeroWhatsApp, mensagem) {
  const encodedMessage = encodeURIComponent(mensagem);
  return isMobile()
    ? `https://api.whatsapp.com/send/?phone=${numeroWhatsApp}&text=${encodedMessage}&type=phone_number&app_absent=0`
    : `https://web.whatsapp.com/send?phone=${numeroWhatsApp}&text=${encodedMessage}`;
}

// =======================
// SUBMIT FORM
// =======================
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const nomeCliente = form.nomeCliente.value.trim();
  const tipoServico = form.tipoServico.value.trim();
  const data = form.data.value;
  const hora = form.hora.value;
  const pagamento = form.pagamento.value;

  if (!nomeCliente || !tipoServico || !data || !hora || !pagamento) {
    alert("Preencha todos os campos!");
    return;
  }

  const jaAgendado = agendamentos.some((ag) => ag.data === data && ag.hora === hora);

  if (jaAgendado) {
    alert("Este horário já está agendado. Por favor, escolha outro.");
    return;
  }

  agendamentos.push({ nomeCliente, tipoServico, data, hora, pagamento });
  salvarCookie('agendamentos', JSON.stringify(agendamentos));
  atualizarLista();
  form.reset();

  // Envia para o WhatsApp
  const numeroWhatsApp = '5532985060990'; // Substitua pelo seu número
  const mensagem = `Olá! Gostaria de agendar o serviço:\n\n👤 Nome: ${nomeCliente}\n🛠️ Serviço: ${tipoServico}\n📅 Data: ${data}\n⏰ Hora: ${hora}\n💳 Pagamento: ${pagamento}`;
  const link = getWhatsAppLink(numeroWhatsApp, mensagem);

  window.open(link, '_blank');

  alert("Agendamento enviado pelo WhatsApp com sucesso!");
});

atualizarLista();

// =======================
// EXIBIR PRODUTOS
// =======================
function exibirProdutos() {
  products.forEach(produto => {
    const card = document.createElement('div');
    card.classList.add('produto-card');

    const btnAgendar = document.createElement('button');
    btnAgendar.textContent = 'Agendar';

    // Preenche o campo tipoServico com o nome do produto
    btnAgendar.addEventListener('click', () => {
      form.tipoServico.value = produto.name;
      form.nomeCliente.focus(); // foca no campo de nome do cliente
    });

    card.innerHTML = `
      <img src="${produto.img}" alt="${produto.name}" class="produto-img">
      <h4>${produto.name}</h4>
      <p>R$ ${produto.price.toFixed(2)}</p>
    `;
    card.appendChild(btnAgendar);
    productsList.appendChild(card);
  });
}

exibirProdutos();
