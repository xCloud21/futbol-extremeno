import './style.css';

/*
 * Fútbol Extremeño
 *
 * main.js contiene la lógica de la aplicación.
 * El esqueleto principal de la web está en index.html.
 *
 * Por ahora usamos datos de ejemplo. Más adelante estos datos podrán
 * proceder de archivos JSON, una API REST o una base de datos.
 */

// -----------------------------------------------------------------------------
// Datos de ejemplo
// -----------------------------------------------------------------------------

const competitions = [
  {
    name: 'Primera Extremeña',
    description: 'Competición regional de fútbol extremeño.',
    teams: 16,
  },
  {
    name: 'Segunda Extremeña',
    description: 'Competición regional y grupos territoriales.',
    teams: 32,
  },
];

const results = [
  {
    home: 'Equipo Ejemplo',
    homeScore: 2,
    away: 'CF Sierra',
    awayScore: 1,
  },
  {
    home: 'AD Vegas',
    homeScore: 0,
    away: 'CD Extremadura',
    awayScore: 0,
  },
  {
    home: 'CF Sierra',
    homeScore: 3,
    away: 'AD Vegas',
    awayScore: 2,
  },
];

const standings = [
  { position: 1, team: 'Equipo Ejemplo', played: 10, won: 7, drawn: 2, lost: 1, gf: 21, ga: 8, points: 23 },
  { position: 2, team: 'CD Extremadura', played: 10, won: 6, drawn: 3, lost: 1, gf: 18, ga: 9, points: 21 },
  { position: 3, team: 'CF Sierra', played: 10, won: 5, drawn: 2, lost: 3, gf: 16, ga: 12, points: 17 },
  { position: 4, team: 'AD Vegas', played: 10, won: 4, drawn: 2, lost: 4, gf: 14, ga: 13, points: 14 },
];

const teams = [
  {
    name: 'Equipo Ejemplo',
    location: 'Extremadura',
  },
  {
    name: 'CD Extremadura',
    location: 'Extremadura',
  },
  {
    name: 'CF Sierra',
    location: 'Extremadura',
  },
  {
    name: 'AD Vegas',
    location: 'Extremadura',
  },
];

// -----------------------------------------------------------------------------
// DOM
// -----------------------------------------------------------------------------

const competitionList = document.querySelector('#competition-list');
const resultsList = document.querySelector('#results-list');
const standingsBody = document.querySelector('#standings-body');
const teamsList = document.querySelector('#teams-list');

const menuToggle = document.querySelector('.menu-toggle');
const mainNavigation = document.querySelector('#main-navigation');

// -----------------------------------------------------------------------------
// Renderizado
// -----------------------------------------------------------------------------

function renderCompetitions() {
  competitionList.innerHTML = competitions
    .map(
      (competition) => `
        <article class="competition-card">
          <div class="competition-card-icon">⚽</div>
          <div>
            <h3>${competition.name}</h3>
            <p>${competition.description}</p>
            <span>${competition.teams} equipos</span>
          </div>
        </article>
      `,
    )
    .join('');
}

function renderResults() {
  resultsList.innerHTML = results
    .map(
      (result) => `
        <article class="result-card">
          <div class="team-name team-name-home">${result.home}</div>

          <div class="score">
            <strong>${result.homeScore}</strong>
            <span>-</span>
            <strong>${result.awayScore}</strong>
          </div>

          <div class="team-name team-name-away">${result.away}</div>
        </article>
      `,
    )
    .join('');
}

function renderStandings() {
  standingsBody.innerHTML = standings
    .map(
      (team) => `
        <tr>
          <td>${team.position}</td>
          <td class="team-cell">${team.team}</td>
          <td>${team.played}</td>
          <td>${team.won}</td>
          <td>${team.drawn}</td>
          <td>${team.lost}</td>
          <td>${team.gf}</td>
          <td>${team.ga}</td>
          <td><strong>${team.points}</strong></td>
        </tr>
      `,
    )
    .join('');
}

function renderTeams() {
  teamsList.innerHTML = teams
    .map(
      (team) => `
        <article class="team-card">
          <div class="team-badge">⚽</div>
          <div>
            <h3>${team.name}</h3>
            <p>${team.location}</p>
          </div>
        </article>
      `,
    )
    .join('');
}

// -----------------------------------------------------------------------------
// Navegación móvil
// -----------------------------------------------------------------------------

function setupNavigation() {
  if (!menuToggle || !mainNavigation) return;

  menuToggle.addEventListener('click', () => {
    const isOpen = mainNavigation.classList.toggle('is-open');

    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute(
      'aria-label',
      isOpen ? 'Cerrar menú' : 'Abrir menú',
    );
  });

  mainNavigation.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mainNavigation.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Abrir menú');
    });
  });
}

// -----------------------------------------------------------------------------
// Inicialización
// -----------------------------------------------------------------------------

function init() {
  renderCompetitions();
  renderResults();
  renderStandings();
  renderTeams();
  setupNavigation();
}

init();
