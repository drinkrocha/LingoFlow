const form = document.getElementById("form");
const input = document.getElementById("input");
const from = document.getElementById("from");
const to = document.getElementById("to");
const chat = document.getElementById("chat");
const status = document.getElementById("status");
const send = document.getElementById("send");
const swap = document.getElementById("swap");

swap.addEventListener("click", () => {
  const origem = from.value;
  from.value = to.value;
  to.value = origem === "auto" ? "pt" : origem;
});

form.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const texto = input.value.trim();
  if (!texto) return;

  send.disabled = true;
  send.textContent = "Traduzindo...";
  status.textContent = "Conectando ao tradutor...";

  try {
    const origem = from.value === "auto" ? "autodetect" : from.value;

    const url = new URL(
      "https://api.mymemory.translated.net/get"
    );

    url.searchParams.set("q", texto);
    url.searchParams.set(
      "langpair",
      origem + "|" + to.value
    );

    const resposta = await fetch(url);

    if (!resposta.ok) {
      throw new Error("Falha na conexão");
    }

    const dados = await resposta.json();

    if (dados.responseStatus !== 200) {
      throw new Error(
        dados.responseDetails || "Tradução indisponível"
      );
    }

    const traducao = dados.responseData.translatedText;

    const aviso = chat.querySelector(".notice");
    if (aviso) aviso.remove();

    adicionarMensagem(texto, "original", "Original");
    adicionarMensagem(traducao, "translated", "Tradução");

    input.value = "";
    status.textContent = "Tradução concluída!";

  } catch (erro) {
    status.textContent = "Erro: " + erro.message;
  } finally {
    send.disabled = false;
    send.textContent = "Traduzir ➤";
  }
});

function adicionarMensagem(texto, tipo, titulo) {
  const bolha = document.createElement("div");
  bolha.className = "bubble " + tipo;

  const rotulo = document.createElement("small");
  rotulo.textContent = titulo;

  const conteudo = document.createElement("div");
  conteudo.textContent = texto;

  bolha.append(rotulo, conteudo);

  if (tipo === "translated") {
    const acoes = document.createElement("div");
    acoes.className = "actions";

    const copiar = document.createElement("button");
    copiar.textContent = "Copiar";
    copiar.onclick = async () => {
      await navigator.clipboard.writeText(texto);
      status.textContent = "Texto copiado!";
    };

    const ouvir = document.createElement("button");
    ouvir.textContent = "🔊 Ouvir";
    ouvir.onclick = () => {
      speechSynthesis.cancel();
      const voz = new SpeechSynthesisUtterance(texto);
      voz.lang = to.value;
      speechSynthesis.speak(voz);
    };

    const whatsapp = document.createElement("button");
    whatsapp.textContent = "WhatsApp";
    whatsapp.onclick = () => {
      window.open(
        "https://wa.me/?text=" + encodeURIComponent(texto),
        "_blank"
      );
    };

    acoes.append(copiar, ouvir, whatsapp);
    bolha.appendChild(acoes);
  }

  chat.appendChild(bolha);
  chat.scrollTop = chat.scrollHeight;
}
