
'use strict';

// Configuração dos níveis de dificuldade.
const niveis = {
  iniciante: {
    nome: 'Iniciante',
    pares: 6
  },
  intermediario: {
    nome: 'Intermediário',
    pares: 8
  },
  especialista: {
    nome: 'Especialista',
    pares: 12
  }
};

// Símbolos utilizados nas cartas.
const simbolos = [
  '◆', '●', '▲', '★', '♥', '✿',
  '☀', '♫', '☂', '☕', '♣', '♦'
];

// Chave utilizada para armazenar os recordes.
const CHAVE_RECORDES = 'memoryChallengeRecordes';

// Estado central da partida.
const estadoJogo = {
  cartas: [],
  cartasViradas: [],
  paresEncontrados: 0,
  jogadas: 0,
  segundos: 0,
  intervalo: null,
  temporizadorVirada: null,
  bloqueado: false,
  iniciado: false,
  nivelAtual: 'iniciante',
  novoRecorde: false
};

// Elementos HTML utilizados pelo JavaScript.
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
  selecaoNivel: document.querySelector('#selecao-nivel'),

  nomeNivelPartida: document.querySelector('#nome-nivel-partida'),
  quantidadePares: document.querySelector('#quantidade-pares'),

  resultadoTempo: document.querySelector('#resultado-tempo'),
  resultadoJogadas: document.querySelector('#resultado-jogadas'),
  resultadoRecorde: document.querySelector('#resultado-recorde'),

  mensagemRecorde: document.querySelector('#mensagem-recorde'),
  descricaoResultado: document.querySelector('#descricao-resultado'),
  nivelResultado: document.querySelector('#nivel-resultado'),

  botaoIniciar: document.querySelector('#botao-iniciar'),
  botaoReiniciar: document.querySelector('#botao-reiniciar'),
  botaoJogarNovamente: document.querySelector('#botao-jogar-novamente'),
  botaoVoltarInicio: document.querySelector('#botao-voltar-inicio')
};

// Recupera os recordes armazenados no navegador.
function carregarRecordes() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_RECORDES)) || {};
  } catch (erro) {
    return {};
  }
}

// Salva os recordes no localStorage.
function salvarRecordes(recordes) {
  try {
    localStorage.setItem(CHAVE_RECORDES, JSON.stringify(recordes));
  } catch (erro) {
    elementos.status.textContent =
      'Não foi possível salvar o recorde neste navegador.';
  }
}

// Atualiza os recordes apresentados na tela inicial.
function atualizarRecordesNaTela() {
  const recordes = carregarRecordes();

  Object.keys(niveis).forEach((chaveNivel) => {
    const elementoRecorde = document.querySelector(
      `#recorde-${chaveNivel}`
    );

    const tempoRecorde = recordes[chaveNivel];

    elementoRecorde.textContent = Number.isInteger(tempoRecorde)
      ? formatarTempo(tempoRecorde)
      : '--:--';
  });
}

// Embaralha as cartas utilizando o algoritmo Fisher-Yates.
function embaralharCartas() {
  const quantidadePares = niveis[estadoJogo.nivelAtual].pares;

  const simbolosDoNivel = simbolos.slice(0, quantidadePares);

  const cartasEmbaralhadas = [
    ...simbolosDoNivel,
    ...simbolosDoNivel
  ];

  for (
    let indice = cartasEmbaralhadas.length - 1;
    indice > 0;
    indice--
  ) {
    const indiceAleatorio = Math.floor(
      Math.random() * (indice + 1)
    );

    [
      cartasEmbaralhadas[indice],
      cartasEmbaralhadas[indiceAleatorio]
    ] = [
      cartasEmbaralhadas[indiceAleatorio],
      cartasEmbaralhadas[indice]
    ];
  }

  return cartasEmbaralhadas.map((simbolo, indice) => ({
    id: indice,
    simbolo: simbolo,
    encontrada: false
  }));
}

// Converte segundos para o formato MM:SS.
function formatarTempo(segundos) {
  const minutos = Math.floor(segundos / 60)
    .toString()
    .padStart(2, '0');

  const restante = (segundos % 60)
    .toString()
    .padStart(2, '0');

  return `${minutos}:${restante}`;
}

// Inicia o cronômetro.
function iniciarCronometro() {
  clearInterval(estadoJogo.intervalo);

  estadoJogo.intervalo = setInterval(() => {
    estadoJogo.segundos++;

    elementos.tempo.textContent =
      formatarTempo(estadoJogo.segundos);

  }, 1000);
}

// Atualiza os indicadores da partida.
function atualizarIndicadores() {
  const totalPares = niveis[estadoJogo.nivelAtual].pares;

  elementos.jogadas.textContent = estadoJogo.jogadas;

  elementos.pares.textContent =
    `${estadoJogo.paresEncontrados}/${totalPares}`;

  elementos.tempo.textContent =
    formatarTempo(estadoJogo.segundos);

  elementos.textoProgresso.textContent =
    `${estadoJogo.paresEncontrados} de ${totalPares} pares`;

  elementos.progresso.style.width =
    `${(estadoJogo.paresEncontrados / totalPares) * 100}%`;

  elementos.barraProgresso.setAttribute(
    'aria-valuemax',
    totalPares
  );

  elementos.barraProgresso.setAttribute(
    'aria-valuenow',
    estadoJogo.paresEncontrados
  );
}

// Cria as cartas dinamicamente no HTML.
function renderizarTabuleiro() {
  elementos.tabuleiro.textContent = '';

  elementos.tabuleiro.classList.toggle(
    'tabuleiro-grande',
    estadoJogo.cartas.length === 24
  );

  estadoJogo.cartas.forEach((carta) => {
    const botaoCarta = document.createElement('button');

    botaoCarta.type = 'button';
    botaoCarta.classList.add('carta');

    botaoCarta.dataset.id = carta.id;

    botaoCarta.setAttribute(
      'aria-label',
      `Carta ${carta.id + 1}, fechada`
    );

    botaoCarta.addEventListener('click', () => {
      virarCarta(carta.id);
    });

    elementos.tabuleiro.appendChild(botaoCarta);
  });
}

// Inicia ou reinicia uma partida.
function iniciarPartida() {
  clearInterval(estadoJogo.intervalo);
  clearTimeout(estadoJogo.temporizadorVirada);

  estadoJogo.nivelAtual = elementos.selecaoNivel.value;

  estadoJogo.cartas = embaralharCartas();
  estadoJogo.cartasViradas = [];

  estadoJogo.paresEncontrados = 0;
  estadoJogo.jogadas = 0;
  estadoJogo.segundos = 0;

  estadoJogo.bloqueado = false;
  estadoJogo.iniciado = true;
  estadoJogo.novoRecorde = false;

  const nivel = niveis[estadoJogo.nivelAtual];

  elementos.nomeNivelPartida.textContent =
    `Nível ${nivel.nome.toLowerCase()}`;

  elementos.quantidadePares.textContent =
    `${nivel.pares} pares`;

  elementos.telaInicial.hidden = true;
  elementos.telaFinal.hidden = true;
  elementos.areaPartida.hidden = false;

  elementos.status.textContent = 'Partida em andamento';

  atualizarIndicadores();
  renderizarTabuleiro();
  iniciarCronometro();
}

// Vira uma carta selecionada pelo jogador.
function virarCarta(idCarta) {
  if (estadoJogo.bloqueado || !estadoJogo.iniciado) {
    return;
  }

  const cartaSelecionada = estadoJogo.cartas.find(
    (carta) => carta.id === idCarta
  );

  if (!cartaSelecionada || cartaSelecionada.encontrada) {
    return;
  }

  if (
    estadoJogo.cartasViradas.some(
      (carta) => carta.id === idCarta
    )
  ) {
    return;
  }

  const botaoCarta = elementos.tabuleiro.querySelector(
    `[data-id="${idCarta}"]`
  );

  botaoCarta.textContent = cartaSelecionada.simbolo;

  botaoCarta.classList.add('virada');

  botaoCarta.setAttribute(
    'aria-label',
    `Carta ${idCarta + 1}, símbolo ${cartaSelecionada.simbolo}`
  );

  estadoJogo.cartasViradas.push(cartaSelecionada);

  if (estadoJogo.cartasViradas.length === 2) {
    estadoJogo.jogadas++;

    atualizarIndicadores();
    verificarPar();
  }
}

// Verifica se as duas cartas selecionadas são iguais.
function verificarPar() {
  const [
    primeiraCarta,
    segundaCarta
  ] = estadoJogo.cartasViradas;

  if (primeiraCarta.simbolo === segundaCarta.simbolo) {
    marcarParEncontrado(primeiraCarta, segundaCarta);
    return;
  }

  estadoJogo.bloqueado = true;

  elementos.status.textContent =
    'Não foi dessa vez. Tente novamente!';

  estadoJogo.temporizadorVirada = setTimeout(() => {
    esconderCartas();

    estadoJogo.bloqueado = false;

    elementos.status.textContent =
      'Partida em andamento';

    estadoJogo.temporizadorVirada = null;

  }, 850);
}

// Registra um par encontrado.
function marcarParEncontrado(primeiraCarta, segundaCarta) {
  primeiraCarta.encontrada = true;
  segundaCarta.encontrada = true;

  estadoJogo.paresEncontrados++;

  [primeiraCarta, segundaCarta].forEach((carta) => {
    const botao = elementos.tabuleiro.querySelector(
      `[data-id="${carta.id}"]`
    );

    botao.classList.remove('virada');
    botao.classList.add('encontrada');

    botao.disabled = true;

    botao.setAttribute(
      'aria-label',
      `Par encontrado: ${carta.simbolo}`
    );
  });

  estadoJogo.cartasViradas = [];

  atualizarIndicadores();

  if (
    estadoJogo.paresEncontrados ===
    niveis[estadoJogo.nivelAtual].pares
  ) {
    finalizarPartida();
  }
}

// Esconde as cartas quando os símbolos são diferentes.
function esconderCartas() {
  estadoJogo.cartasViradas.forEach((carta) => {
    const botao = elementos.tabuleiro.querySelector(
      `[data-id="${carta.id}"]`
    );

    botao.textContent = '';

    botao.classList.remove('virada');

    botao.setAttribute(
      'aria-label',
      `Carta ${carta.id + 1}, fechada`
    );
  });

  estadoJogo.cartasViradas = [];
}

// Finaliza a partida e verifica o recorde.
function finalizarPartida() {
  estadoJogo.iniciado = false;

  clearInterval(estadoJogo.intervalo);

  const recordes = carregarRecordes();

  const recordeAnterior =
    recordes[estadoJogo.nivelAtual];

  estadoJogo.novoRecorde =
    !Number.isInteger(recordeAnterior) ||
    estadoJogo.segundos < recordeAnterior;

  if (estadoJogo.novoRecorde) {
    recordes[estadoJogo.nivelAtual] =
      estadoJogo.segundos;

    salvarRecordes(recordes);
  }

  elementos.resultadoTempo.textContent =
    formatarTempo(estadoJogo.segundos);

  elementos.resultadoJogadas.textContent =
    estadoJogo.jogadas;

  elementos.resultadoRecorde.textContent =
    formatarTempo(recordes[estadoJogo.nivelAtual]);

  elementos.mensagemRecorde.textContent =
    estadoJogo.novoRecorde
      ? 'NOVO RECORDE!'
      : 'DESAFIO CONCLUÍDO';

  elementos.descricaoResultado.textContent =
    estadoJogo.novoRecorde
      ? 'Parabéns! Você conquistou o melhor tempo deste nível.'
      : 'Todos os pares foram encontrados. Continue tentando superar seu recorde!';

  elementos.nivelResultado.textContent =
    `Nível ${niveis[estadoJogo.nivelAtual].nome}`;

  elementos.areaPartida.hidden = true;
  elementos.telaFinal.hidden = false;

  elementos.status.textContent =
    'Desafio concluído';

  atualizarRecordesNaTela();
}

// Volta para a tela inicial sem apagar os recordes.
function voltarParaInicio() {
  clearInterval(estadoJogo.intervalo);
  clearTimeout(estadoJogo.temporizadorVirada);

  estadoJogo.iniciado = false;
  estadoJogo.bloqueado = false;

  elementos.areaPartida.hidden = true;
  elementos.telaFinal.hidden = true;
  elementos.telaInicial.hidden = false;

  elementos.status.textContent =
    'Pronto para jogar?';

  atualizarRecordesNaTela();
}

// Eventos dos botões e controles.
elementos.botaoIniciar.addEventListener(
  'click',
  iniciarPartida
);

elementos.botaoReiniciar.addEventListener(
  'click',
  iniciarPartida
);

elementos.botaoJogarNovamente.addEventListener(
  'click',
  iniciarPartida
);

elementos.botaoVoltarInicio.addEventListener(
  'click',
  voltarParaInicio
);

elementos.selecaoNivel.addEventListener(
  'change',
  atualizarRecordesNaTela
);

// Carrega os recordes quando a página é aberta.
atualizarRecordesNaTela();
