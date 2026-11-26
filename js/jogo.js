'use strict';

// Símbolos que formam os seis pares do jogo.
const simbolos = ['◆', '●', '▲', '★', '♥', '✿'];

// Estado central da partida: os dados ficam reunidos neste objeto.
const estadoJogo = {
  cartas: [],
  cartasViradas: [],
  paresEncontrados: 0,
  jogadas: 0,
  segundos: 0,
  intervalo: null,
  bloqueado: false,
  iniciado: false
};

// Elementos da página que serão atualizados pelo JavaScript.
const elementos = {
  telaInicial: document.querySelector('#tela-inicial'),
  areaPartida: document.querySelector('#area-partida'),
  telaFinal: document.querySelector('#tela-final'),
  tabuleiro: document.querySelector('#tabuleiro'),
  tempo: document.querySelector('#tempo'),
  jogadas: document.querySelector('#jogadas'),
  pares: document.querySelector('#pares'),
  progresso: document.querySelector('#progresso'),
  textoProgresso: document.querySelector('#texto-progresso'),
  barraProgresso: document.querySelector('#barra-progresso'),
  status: document.querySelector('#status-partida'),
  resultadoTempo: document.querySelector('#resultado-tempo'),
  resultadoJogadas: document.querySelector('#resultado-jogadas'),
  botaoIniciar: document.querySelector('#botao-iniciar'),
  botaoReiniciar: document.querySelector('#botao-reiniciar'),
  botaoJogarNovamente: document.querySelector('#botao-jogar-novamente')
};

// Embaralha os símbolos usando o algoritmo Fisher-Yates.
function embaralharCartas() {
  const cartasEmbaralhadas = [...simbolos, ...simbolos];

  for (let indice = cartasEmbaralhadas.length - 1; indice > 0; indice--) {
    const indiceAleatorio = Math.floor(Math.random() * (indice + 1));
    [cartasEmbaralhadas[indice], cartasEmbaralhadas[indiceAleatorio]] =
      [cartasEmbaralhadas[indiceAleatorio], cartasEmbaralhadas[indice]];
  }

  return cartasEmbaralhadas.map((simbolo, indice) => ({
    id: indice,
    simbolo,
    encontrada: false
  }));
}

// Converte os segundos em minutos e segundos no formato 00:00.
function formatarTempo(segundos) {
  const minutos = Math.floor(segundos / 60).toString().padStart(2, '0');
  const restante = (segundos % 60).toString().padStart(2, '0');
  return `${minutos}:${restante}`;
}

// Atualiza o cronômetro enquanto a partida está em andamento.
function iniciarCronometro() {
  clearInterval(estadoJogo.intervalo);
  estadoJogo.intervalo = setInterval(() => {
    estadoJogo.segundos++;
    elementos.tempo.textContent = formatarTempo(estadoJogo.segundos);
  }, 1000);
}

// Atualiza os números e a barra de progresso da partida.
function atualizarIndicadores() {
  elementos.jogadas.textContent = estadoJogo.jogadas;
  elementos.pares.textContent = `${estadoJogo.paresEncontrados}/6`;
  elementos.tempo.textContent = formatarTempo(estadoJogo.segundos);
  elementos.textoProgresso.textContent = `${estadoJogo.paresEncontrados} de 6 pares`;
  elementos.progresso.style.width = `${(estadoJogo.paresEncontrados / 6) * 100}%`;
  elementos.barraProgresso.setAttribute('aria-valuenow', estadoJogo.paresEncontrados);
}

// Cria as cartas no HTML e associa um evento a cada uma.
function renderizarTabuleiro() {
  elementos.tabuleiro.textContent = '';

  estadoJogo.cartas.forEach((carta) => {
    const botaoCarta = document.createElement('button');
    botaoCarta.type = 'button';
    botaoCarta.classList.add('carta');
    botaoCarta.dataset.id = carta.id;
    botaoCarta.setAttribute('aria-label', `Carta ${carta.id + 1}, fechada`);
    botaoCarta.addEventListener('click', () => virarCarta(carta.id));
    elementos.tabuleiro.appendChild(botaoCarta);
  });
}

// Inicia uma partida nova, zerando o estado sem recarregar a página.
function iniciarPartida() {
  clearInterval(estadoJogo.intervalo);
  estadoJogo.cartas = embaralharCartas();
  estadoJogo.cartasViradas = [];
  estadoJogo.paresEncontrados = 0;
  estadoJogo.jogadas = 0;
  estadoJogo.segundos = 0;
  estadoJogo.bloqueado = false;
  estadoJogo.iniciado = true;

  elementos.telaInicial.hidden = true;
  elementos.telaFinal.hidden = true;
  elementos.areaPartida.hidden = false;
  elementos.status.textContent = 'Partida em andamento';

  atualizarIndicadores();
  renderizarTabuleiro();
  iniciarCronometro();
}

// Revela uma carta selecionada pelo jogador.
function virarCarta(idCarta) {
  if (estadoJogo.bloqueado || !estadoJogo.iniciado) return;

  const cartaSelecionada = estadoJogo.cartas.find((carta) => carta.id === idCarta);
  if (!cartaSelecionada || cartaSelecionada.encontrada) return;
  if (estadoJogo.cartasViradas.some((carta) => carta.id === idCarta)) return;

  const botaoCarta = elementos.tabuleiro.querySelector(`[data-id="${idCarta}"]`);
  botaoCarta.textContent = cartaSelecionada.simbolo;
  botaoCarta.classList.add('virada');
  botaoCarta.setAttribute('aria-label', `Carta ${idCarta + 1}, símbolo ${cartaSelecionada.simbolo}`);
  estadoJogo.cartasViradas.push(cartaSelecionada);

  if (estadoJogo.cartasViradas.length === 2) {
    estadoJogo.jogadas++;
    atualizarIndicadores();
    verificarPar();
  }
}

// Compara as duas cartas viradas e decide se formam um par.
function verificarPar() {
  const [primeiraCarta, segundaCarta] = estadoJogo.cartasViradas;

  if (primeiraCarta.simbolo === segundaCarta.simbolo) {
    marcarParEncontrado(primeiraCarta, segundaCarta);
    return;
  }

  estadoJogo.bloqueado = true;
  elementos.status.textContent = 'Tente novamente!';
  setTimeout(() => {
    esconderCartas();
    estadoJogo.bloqueado = false;
    elementos.status.textContent = 'Partida em andamento';
  }, 850);
}

// Marca as cartas correspondentes e atualiza o progresso.
function marcarParEncontrado(primeiraCarta, segundaCarta) {
  primeiraCarta.encontrada = true;
  segundaCarta.encontrada = true;
  estadoJogo.paresEncontrados++;

  [primeiraCarta, segundaCarta].forEach((carta) => {
    const botao = elementos.tabuleiro.querySelector(`[data-id="${carta.id}"]`);
    botao.classList.remove('virada');
    botao.classList.add('encontrada');
    botao.disabled = true;
    botao.setAttribute('aria-label', `Par encontrado: ${carta.simbolo}`);
  });

  estadoJogo.cartasViradas = [];
  atualizarIndicadores();

  if (estadoJogo.paresEncontrados === simbolos.length) {
    finalizarPartida();
  }
}

// Esconde as cartas quando a combinação não corresponde.
function esconderCartas() {
  estadoJogo.cartasViradas.forEach((carta) => {
    const botao = elementos.tabuleiro.querySelector(`[data-id="${carta.id}"]`);
    botao.textContent = '';
    botao.classList.remove('virada');
    botao.setAttribute('aria-label', `Carta ${carta.id + 1}, fechada`);
  });
  estadoJogo.cartasViradas = [];
}

// Encerra a partida e apresenta o resultado final.
function finalizarPartida() {
  estadoJogo.iniciado = false;
  clearInterval(estadoJogo.intervalo);
  elementos.resultadoTempo.textContent = formatarTempo(estadoJogo.segundos);
  elementos.resultadoJogadas.textContent = estadoJogo.jogadas;
  elementos.areaPartida.hidden = true;
  elementos.telaFinal.hidden = false;
  elementos.status.textContent = 'Desafio concluído';
}

// Eventos dos botões: não utilizamos onclick diretamente no HTML.
elementos.botaoIniciar.addEventListener('click', iniciarPartida);
elementos.botaoReiniciar.addEventListener('click', iniciarPartida);
elementos.botaoJogarNovamente.addEventListener('click', iniciarPartida);
