
# Memory Challenge

Jogo da memória desenvolvido para a avaliação C3 da disciplina de Desenvolvimento Web.

## Sobre o projeto

O Memory Challenge é um jogo interativo desenvolvido com HTML5, CSS3 e JavaScript puro. O objetivo é encontrar todos os pares de cartas iguais no menor tempo possível.

## Níveis de dificuldade

O jogo possui três níveis:

| Nível | Cartas | Pares |
|---|---:|---:|
| Iniciante | 12 | 6 |
| Intermediário | 16 | 8 |
| Especialista | 24 | 12 |

## Como jogar

1. Abra o jogo no navegador.
2. Escolha um nível de dificuldade.
3. Clique em **Iniciar partida**.
4. Vire duas cartas por vez para revelar os símbolos.
5. Quando os símbolos forem iguais, o par permanecerá visível.
6. Quando forem diferentes, as cartas serão escondidas novamente.
7. Encontre todos os pares no menor tempo possível.
8. Utilize **Reiniciar** para começar novamente sem atualizar a página.

Durante a partida, o jogador acompanha:

- Cronômetro.
- Quantidade de jogadas.
- Pares encontrados.
- Barra de progresso.

## Sistema de recordes

Cada nível possui seu próprio recorde, baseado no menor tempo de conclusão.

Os recordes são armazenados no navegador utilizando o `localStorage`, permanecendo disponíveis nas próximas visitas realizadas no mesmo navegador e dispositivo.

## Tecnologias utilizadas

- HTML5
- CSS3
- JavaScript puro (sem bibliotecas ou frameworks)

## Estrutura do projeto

```text
memory-challenge/
├── index.html
├── css/
│   └── estilo.css
├── js/
│   └── jogo.js
└── README.md
```

## Como executar localmente

1. Faça o download ou clone este repositório.
2. Abra a pasta do projeto no Visual Studio Code.
3. Abra o arquivo `index.html` em um navegador.
4. Escolha um nível e inicie a partida.

Não é necessário instalar dependências ou configurar um servidor backend.

## Publicação

O projeto está configurado para publicação pelo GitHub Pages.

**Jogo:**

https://valdineideschunk.github.io/memory-challenge/

**Repositório:**

https://github.com/ValdineideSchunk/memory-challenge

## Uso de inteligência artificial

Foi utilizado o ChatGPT como ferramenta de apoio durante o planejamento e a implementação do projeto, auxiliando na organização da estrutura, na elaboração inicial de exemplos de HTML, CSS e JavaScript e na identificação de possíveis melhorias.

O estudante é responsável pela revisão, pelos testes, pela compreensão e pela versão final do código apresentado.

## Autoria acadêmica

Projeto individual desenvolvido para a avaliação C3 da disciplina de Desenvolvimento Web.
