
'use strict';

// ========================================
// CONFIGURAÇÃO DOS NÍVEIS
// ========================================

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

// ========================================
// SÍMBOLOS DAS CARTAS
// ========================================

const simbolos = [
  '◆', '●', '▲', '★', '♥', '✿',
  '☀', '♫', '☂', '☕', '♣', '♦'
];

// Chave utilizada para armazenar os recordes.
const CHAVE_RECORDES = 'memoryChallengeRecordes';

// ========================================
// ESTADO CENTRAL DO JOGO
// ========================================

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

// ========================================
// ELEMENTOS HTML
// ========================================

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

  nomeNivelPartida: document.querySelector('#nome-nivel-partida'),
  quantidadePares: document.querySelector('#quantidade-pares'),

  resultadoTempo: document.querySelector('#resultado-tempo'),
  resultadoJogadas: document.querySelector('#resultado-jogadas'),
  resultadoRecorde: document.querySelector('#resultado-recorde'),

  mensagemRecorde: document.querySelector('#mensagem-recorde'),
  descricaoResultado: document.querySelector('#descricao-resultado'),
  nivelResultado: document.querySelector('#nivel-resultado'),

  botoesNivel: document.querySelectorAll('.opcao-nivel'),

  botaoIniciar: document.querySelector('#botao-iniciar'),
  botaoReiniciar: document.querySelector('#botao-reiniciar'),
  botaoJogarNovamente: document.querySelector('#botao-jogar-novamente'),
  botaoVoltarInicio: document.querySelector('#botao-voltar-inicio'),
  botaoVoltarMenu: document.querySelector('#botao-voltar-menu')
};

// ========================================
// ARMAZENAMENTO DOS RECORDES
// ========================================

// Recupera os recordes armazenados no navegador.
function carregarRecordes() {
  try {
    const dados = localStorage.getItem(CHAVE_RECORDES);

    if (!dados) {
      return {};
    }

    const recordes = JSON.parse(dados);

    return recordes && typeof recordes === 'object'
      ? recordes
      : {};

  } catch (erro) {
    console.error('Erro ao carregar recordes:', erro);
    return {};
  }
}

// Salva os recordes no localStorage.
function salvarRecordes(recordes) {
  try {
    localStorage.setItem(
      CHAVE_RECORDES,
      JSON.stringify(recordes)
    );

    return true;

  } catch (erro) {
    console.error('Erro ao salvar recordes:', erro);

    elementos.status.textContent =
      'Não foi possível salvar o recorde neste navegador.';

    return false;
  }
}

// Atualiza os recordes apresentados na tela inicial.
function atualizarRecordesNaTela() {
  const recordes = carregarRecordes();

  Object.keys(niveis).forEach((chaveNivel) => {
    const elementoRecorde = document.querySelector(
      `#recorde-${chaveNivel}`
    );

    if (!elementoRecorde) {
      return;
    }

    const tempoRecorde = recordes[chaveNivel];

    elementoRecorde.textContent =
      Number.isInteger(tempoRecorde) && tempoRecorde >= 0
        ? formatarTempo(tempoRecorde)
        : '--:--';
  });
}

// ========================================
// SELEÇÃO DOS NÍVEIS
// ========================================

function selecionarNivel(nivelSelecionado) {
  if (!niveis[nivelSelecionado]) {
    return;
  }

  // Atualiza o nível atual.
  estadoJogo.nivelAtual = nivelSelecionado;

  // Atualiza o destaque visual dos botões.
  elementos.botoesNivel.forEach((botao) => {
    const selecionado =
      botao.dataset.nivel === nivelSelecionado;

    botao.classList.toggle(
      'selecionado',
      selecionado
    );

    botao.setAttribute(
      'aria-pressed',
      String(selecionado)
    );
  });
}

// ========================================
// EMBARALHAMENTO DAS CARTAS
// ========================================

// Embaralha as cartas utilizando Fisher-Yates.
function embaralharCartas() {
  const quantidadePares =
    niveis[estadoJogo.nivelAtual].pares;

  const simbolosDoNivel =
    simbolos.slice(0, quantidadePares);

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

// ========================================
// CRONÔMETRO
// ========================================

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
    if (!estadoJogo.iniciado) {
      return;
    }

    estadoJogo.segundos++;

    elementos.tempo.textContent =
      formatarTempo(estadoJogo.segundos);

  }, 1000);
}

// Interrompe o cronômetro.
function pararCronometro() {
  clearInterval(estadoJogo.intervalo);

  estadoJogo.intervalo = null;
}

// ========================================
// INDICADORES DA PARTIDA
// ========================================

function atualizarIndicadores() {
  const totalPares =
    niveis[estadoJogo.nivelAtual].pares;

  elementos.jogadas.textContent =
    estadoJogo.jogadas;

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

// ========================================
// RENDERIZAÇÃO DO TABULEIRO
// ========================================

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

// ========================================
// INICIAR OU REINICIAR PARTIDA
// ========================================

function iniciarPartida() {
  // Interrompe temporizadores anteriores.
  pararCronometro();

  clearTimeout(estadoJogo.temporizadorVirada);

  estadoJogo.temporizadorVirada = null;

  // Reseta os dados da partida.
  estadoJogo.cartas = embaralharCartas();

  estadoJogo.cartasViradas = [];

  estadoJogo.paresEncontrados = 0;
  estadoJogo.jogadas = 0;
  estadoJogo.segundos = 0;

  estadoJogo.bloqueado = false;
  estadoJogo.iniciado = true;
  estadoJogo.novoRecorde = false;

  const nivel = niveis[estadoJogo.nivelAtual];

  // Atualiza informações do nível.
  elementos.nomeNivelPartida.textContent =
    `Nível ${nivel.nome.toLowerCase()}`;

  elementos.quantidadePares.textContent =
    `${nivel.pares} pares`;

  // Atualiza a visibilidade das telas.
  elementos.telaInicial.hidden = true;
  elementos.telaFinal.hidden = true;
  elementos.areaPartida.hidden = false;

  elementos.status.textContent =
    'Partida em andamento';

  // Atualiza indicadores e tabuleiro.
  atualizarIndicadores();

  renderizarTabuleiro();

  // Inicia o cronômetro.
  iniciarCronometro();
}

// ========================================
// VIRAR CARTAS
// ========================================

function virarCarta(idCarta) {

  // Impede jogadas durante comparações ou partidas encerradas.
  if (
    estadoJogo.bloqueado ||
    !estadoJogo.iniciado
  ) {
    return;
  }

  const cartaSelecionada = estadoJogo.cartas.find(
    (carta) => carta.id === idCarta
  );

  // Impede selecionar cartas inexistentes ou encontradas.
  if (!cartaSelecionada || cartaSelecionada.encontrada) {
    return;
  }

  // Impede selecionar a mesma carta duas vezes.
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

  if (!botaoCarta) {
    return;
  }

  // Revela o símbolo.
  botaoCarta.textContent =
    cartaSelecionada.simbolo;

  botaoCarta.classList.add('virada');

  botaoCarta.setAttribute(
    'aria-label',
    `Carta ${idCarta + 1}, símbolo ${cartaSelecionada.simbolo}`
  );

  estadoJogo.cartasViradas.push(cartaSelecionada);

  // Quando duas cartas são viradas, verifica o resultado.
  if (estadoJogo.cartasViradas.length === 2) {
    estadoJogo.jogadas++;

    atualizarIndicadores();

    verificarPar();
  }
}

// ========================================
// VERIFICAR PARES
// ========================================

function verificarPar() {
  const [
    primeiraCarta,
    segundaCarta
  ] = estadoJogo.cartasViradas;

  // Verifica se os símbolos são iguais.
  if (primeiraCarta.simbolo === segundaCarta.simbolo) {
    marcarParEncontrado(
      primeiraCarta,
      segundaCarta
    );

    return;
  }

  // Bloqueia novas jogadas durante a comparação.
  estadoJogo.bloqueado = true;

  elementos.status.textContent =
    'Não foi dessa vez. Tente novamente!';

  // Aguarda antes de esconder as cartas.
  estadoJogo.temporizadorVirada = setTimeout(() => {

    // Confirma se a partida ainda está ativa.
    if (!estadoJogo.iniciado) {
      return;
    }

    esconderCartas();

    estadoJogo.bloqueado = false;

    elementos.status.textContent =
      'Partida em andamento';

    estadoJogo.temporizadorVirada = null;

  }, 850);
}

// ========================================
// REGISTRAR PAR ENCONTRADO
// ========================================

function marcarParEncontrado(primeiraCarta, segundaCarta) {

  primeiraCarta.encontrada = true;
  segundaCarta.encontrada = true;

  estadoJogo.paresEncontrados++;

  [primeiraCarta, segundaCarta].forEach((carta) => {

    const botao = elementos.tabuleiro.querySelector(
      `[data-id="${carta.id}"]`
    );

    if (!botao) {
      return;
    }

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

  // Verifica se todos os pares foram encontrados.
  if (
    estadoJogo.paresEncontrados ===
    niveis[estadoJogo.nivelAtual].pares
  ) {
    finalizarPartida();
  }
}

// ========================================
// ESCONDER CARTAS
// ========================================

function esconderCartas() {
  estadoJogo.cartasViradas.forEach((carta) => {

    const botao = elementos.tabuleiro.querySelector(
      `[data-id="${carta.id}"]`
    );

    if (!botao) {
      return;
    }

    botao.textContent = '';

    botao.classList.remove('virada');

    botao.setAttribute(
      'aria-label',
      `Carta ${carta.id + 1}, fechada`
    );
  });

  estadoJogo.cartasViradas = [];
}

// ========================================
// FINALIZAR PARTIDA
// ========================================

function finalizarPartida() {

  estadoJogo.iniciado = false;

  estadoJogo.bloqueado = false;

  pararCronometro();

  clearTimeout(estadoJogo.temporizadorVirada);

  estadoJogo.temporizadorVirada = null;

  const recordes = carregarRecordes();

  const recordeAnterior =
    recordes[estadoJogo.nivelAtual];

  // Verifica se o jogador conseguiu um novo recorde.
  estadoJogo.novoRecorde =
    !Number.isInteger(recordeAnterior) ||
    recordeAnterior < 0 ||
    estadoJogo.segundos < recordeAnterior;

  if (estadoJogo.novoRecorde) {
    recordes[estadoJogo.nivelAtual] =
      estadoJogo.segundos;

    salvarRecordes(recordes);
  }

  // Atualiza os resultados.
  elementos.resultadoTempo.textContent =
    formatarTempo(estadoJogo.segundos);

  elementos.resultadoJogadas.textContent =
    estadoJogo.jogadas;

  const melhorTempo = recordes[estadoJogo.nivelAtual];

  elementos.resultadoRecorde.textContent =
    Number.isInteger(melhorTempo)
      ? formatarTempo(melhorTempo)
      : '--:--';

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

  // Exibe a tela final.
  elementos.areaPartida.hidden = true;

  elementos.telaFinal.hidden = false;

  elementos.status.textContent =
    'Desafio concluído';

  atualizarRecordesNaTela();
}

// ========================================
// VOLTAR AO MENU INICIAL
// ========================================

function voltarParaInicio() {

  // Interrompe o cronômetro.
  pararCronometro();

  // Cancela qualquer comparação pendente.
  clearTimeout(estadoJogo.temporizadorVirada);

  estadoJogo.temporizadorVirada = null;

  // Finaliza a partida atual.
  estadoJogo.iniciado = false;

  estadoJogo.bloqueado = false;

  estadoJogo.cartasViradas = [];

  // Limpa o tabuleiro.
  elementos.tabuleiro.textContent = '';

  // Retorna à tela inicial.
  elementos.areaPartida.hidden = true;

  elementos.telaFinal.hidden = true;

  elementos.telaInicial.hidden = false;

  elementos.status.textContent =
    'Pronto para jogar?';

  // Atualiza os recordes sem apagá-los.
  atualizarRecordesNaTela();
}

// ========================================
// EVENTOS DOS BOTÕES
// ========================================

// Iniciar partida.
elementos.botaoIniciar.addEventListener(
  'click',
  iniciarPartida
);

// Reiniciar partida mantendo o nível selecionado.
elementos.botaoReiniciar.addEventListener(
  'click',
  iniciarPartida
);

// Jogar novamente mantendo o nível selecionado.
elementos.botaoJogarNovamente.addEventListener(
  'click',
  iniciarPartida
);

// Voltar ao menu pela tela de resultado.
elementos.botaoVoltarInicio.addEventListener(
  'click',
  voltarParaInicio
);

// Voltar ao menu durante a partida.
elementos.botaoVoltarMenu.addEventListener(
  'click',
  voltarParaInicio
);

// ========================================
// EVENTOS DE SELEÇÃO DOS NÍVEIS
// ========================================

elementos.botoesNivel.forEach((botao) => {

  botao.addEventListener('click', () => {

    selecionarNivel(botao.dataset.nivel);

  });

});

// ========================================
// INICIALIZAÇÃO DO JOGO
// ========================================

// Define o nível inicial.
selecionarNivel('iniciante');

// Carrega os recordes salvos.
atualizarRecordesNaTela();
