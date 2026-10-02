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

const DATA_PATH = "/data";

const state = {
  seasons: [],
  competitions: [],
  groups: [],
  teams: [],
  players: [],
  teamGroups: [],
  teamPlayers: [],
  matches: [],
  standings: []
};

/**
 * Carga todos los JSON de la aplicación.
 */
async function loadData() {
  const [
    seasons,
    competitions,
    groups,
    teams,
    players,
    teamGroups,
    teamPlayers,
    matches,
    standings
  ] = await Promise.all([
    fetch(`${DATA_PATH}/seasons.json`).then(response => response.json()),
    fetch(`${DATA_PATH}/competitions.json`).then(response => response.json()),
    fetch(`${DATA_PATH}/groups.json`).then(response => response.json()),
    fetch(`${DATA_PATH}/teams.json`).then(response => response.json()),
    fetch(`${DATA_PATH}/players.json`).then(response => response.json()),
    fetch(`${DATA_PATH}/team-groups.json`).then(response => response.json()),
    fetch(`${DATA_PATH}/team-players.json`).then(response => response.json()),
    fetch(`${DATA_PATH}/matches.json`).then(response => response.json())
  ]);

  state.seasons = seasons;
  state.competitions = competitions;
  state.groups = groups;
  state.teams = teams;
  state.players = players;
  state.teamGroups = teamGroups;
  state.teamPlayers = teamPlayers;
  state.matches = matches;
  state.standings = standings;
}

// -----------------------------------------------------------------------------
// Renderizado
// -----------------------------------------------------------------------------

/**
 * Devuelve la temporada actual.
 */
function getCurrentSeason() {
  return state.seasons.find(season => season.current);
}

function getCompetition(competitionId) {
  return state.competitions.find(
    competition => competition.id === competitionId
  );
}

function getGroup(groupId) {
  return state.groups.find(group => group.id === groupId);
}

function getTeam(teamId) {
  return state.teams.find(team => team.id === teamId);
}

function renderCompetitions() {
  const container = document.querySelector("#competition-list");

  if (!container) return;

  const season = getCurrentSeason();

  const seasonGroups = state.groups.filter(
    group => group.seasonId === season.id
  );

  const competitionIds = [
    ...new Set(seasonGroups.map(group => group.competitionId))
  ];

  container.innerHTML = competitionIds
    .map(competitionId => {
      const competition = getCompetition(competitionId);

      const groups = seasonGroups.filter(
        group => group.competitionId === competitionId
      );

      return `
        <article class="competition-card">
          <div class="competition-card-icon">⚽</div>
          <div>
              <h3>${competition.name}</h3>
              <p>
                ${groups.length} grupos disponibles
              </p>

              <span class="competition-groups">
                ${groups
                  .map(
                    group => `
                      <button
                        class="group-button"
                        type="button"
                        data-group-id="${group.id}"
                        data-season-id="${group.seasonId}"
                        data-competition-id="${group.competitionId}"
                      >
                        ${group.name}
                      </button>
                    `
                  )
                  .join("")}
              </span>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderGroupData(groupId) {
  const group = getGroup(groupId);

  if (!group) return;

  const competition = getCompetition(group.competitionId);

  document.querySelector(
    "#standings-competition-label"
  ).textContent = competition.name;

  document.querySelector(
    "#standings-group-label"
  ).textContent = group.name;

  renderStandings(groupId);
  renderResults(groupId);
  renderTeams(groupId);
}

function renderResults(groupId = null) {
  const container = document.querySelector("#results-list");

  if (!container) return;

  const season = getCurrentSeason();

  let matches = state.matches.filter(
    match =>
      match.seasonId === season.id &&
      match.status === "finished"
  );

  if (groupId) {
    matches = matches.filter(match => match.groupId === groupId);
  }

  matches = matches
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);

  container.innerHTML = matches
    .map(match => {
      const homeTeam = getTeam(match.homeTeamId);
      const awayTeam = getTeam(match.awayTeamId);

      return `
        <article class="result-card">
          <span class="result-matchday">
            Jornada ${match.matchday}
          </span>

          <div class="result-teams">
            <span>${homeTeam.name}</span>

            <strong>
              ${match.homeScore} - ${match.awayScore}
            </strong>

            <span>${awayTeam.name}</span>
          </div>

          <time datetime="${match.date}">
            ${formatDate(match.date)}
          </time>
        </article>
      `;
    })
    .join("");
}

function calculateStandings(groupId) {
  const season = getCurrentSeason();

  const relations = state.teamGroups.filter(
    relation =>
      relation.seasonId === season.id &&
      relation.groupId === groupId
  );

  const standings = relations.map(relation => {
    const team = getTeam(relation.teamId);

    return {
      teamId: team.id,
      teamName: team.name,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0
    };
  });

  const standingsMap = new Map(
    standings.map(team => [team.teamId, team])
  );

  const matches = state.matches.filter(
    match =>
      match.seasonId === season.id &&
      match.groupId === groupId &&
      match.status === "finished"
  );

  for (const match of matches) {
    const home = standingsMap.get(match.homeTeamId);
    const away = standingsMap.get(match.awayTeamId);

    if (!home || !away) {
      continue;
    }

    home.played++;
    away.played++;

    home.goalsFor += match.homeScore;
    home.goalsAgainst += match.awayScore;

    away.goalsFor += match.awayScore;
    away.goalsAgainst += match.homeScore;

    if (match.homeScore > match.awayScore) {
      home.wins++;
      away.losses++;

      home.points += 3;
    } else if (match.homeScore < match.awayScore) {
      away.wins++;
      home.losses++;

      away.points += 3;
    } else {
      home.draws++;
      away.draws++;

      home.points++;
      away.points++;
    }
  }

  for (const team of standings) {
    team.goalDifference =
      team.goalsFor - team.goalsAgainst;
  }

  standings.sort((a, b) => {
    if (b.points !== a.points) {
      return b.points - a.points;
    }

    if (b.goalDifference !== a.goalDifference) {
      return b.goalDifference - a.goalDifference;
    }

    if (b.goalsFor !== a.goalsFor) {
      return b.goalsFor - a.goalsFor;
    }

    return a.teamName.localeCompare(b.teamName, "es");
  });

  standings.forEach((team, index) => {
    team.position = index + 1;
  });

  return standings;
}

function renderStandings(groupId) {
  const tbody = document.querySelector("#standings-body");

  if (!tbody) return;

  const standings = calculateStandings(groupId);

  tbody.innerHTML = standings
    .map(team => `
      <tr>
        <td>${team.position}</td>

        <td>
          <strong>${team.teamName}</strong>
        </td>

        <td>${team.played}</td>
        <td>${team.wins}</td>
        <td>${team.draws}</td>
        <td>${team.losses}</td>
        <td>${team.goalsFor}</td>
        <td>${team.goalsAgainst}</td>
        <td>${team.goalDifference > 0
          ? `+${team.goalDifference}`
          : team.goalDifference}</td>
        <td>
          <strong>${team.points}</strong>
        </td>
      </tr>
    `)
    .join("");
}

function renderTeams(groupId) {
  const container = document.querySelector("#teams-list");
  const group = getGroup(groupId);

  if (!container) return;

  const season = getCurrentSeason();

  const relations = state.teamGroups.filter(
    relation =>
      relation.seasonId === season.id &&
      relation.groupId === groupId
  );

  container.innerHTML = relations
    .map(relation => {
      const team = getTeam(relation.teamId);

      return `
        <article class="team-card" data-team-id="${team.id}" data-group-id="${groupId}"
          data-season-id="${season.id}"
          data-competition-id="${group.competitionId}" style="cursor: pointer;">
          <div class="team-logo">
            ${
              team.logo
                ? `<img src="${team.logo}" alt="" height="46" width="46" />`
                : `<span>${getTeamInitials(team.name)}</span>`
            }
          </div>

          <div>
            <h3>${team.name}</h3>
            <p>
              ${team.city}, ${team.province}
            </p>
          </div>
        </article>
      `;
    })
    .join("");
}

function openTeamModal({
  teamId,
  groupId,
  seasonId,
  competitionId
}) {

  const team = getTeam(teamId);
  const group = getGroup(groupId);
  const competition = getCompetition(competitionId);

  if (!team) {
    return;
  }

  const modal = document.querySelector("#team-modal");

  document.querySelector("#team-modal-logo").src =
    team.logo || "";

  document.querySelector("#team-modal-logo").alt =
    `Escudo de ${team.name}`;

  document.querySelector("#team-modal-name").textContent =
    team.name;

  document.querySelector("#team-modal-location").textContent =
    `${team.city} · ${team.province}`;

  document.querySelector("#team-modal-city").textContent =
    team.city || "-";

  document.querySelector("#team-modal-province").textContent =
    team.province || "-";

  document.querySelector("#team-modal-competition-info").textContent =
    competition?.name || "-";

  document.querySelector("#team-modal-group").textContent =
    group?.name || "-";


  renderTeamSquad({
    teamId,
    seasonId
  });

  modal.showModal();
}

function renderTeamSquad({ teamId, seasonId }) {
  const container = document.querySelector("#team-modal-squad");

  const relations = state.teamPlayers.filter(
    (relation) => relation.teamId === teamId && relation.seasonId === seasonId,
  );

  const players = relations.map((relation) => {
      const player = state.players.find(
        (player) => player.id === relation.playerId,
      );

      if (!player) {
        return null;
      }

      return {
        ...player,
        shirtNumber: relation.shirtNumber,
      };
    })
    .filter(Boolean);

  container.innerHTML = players
    .map(
      (player) => `
      <article class="player-card">

        <span class="player-card__number">
          ${player.shirtNumber ?? "-"}
        </span>

        <div class="player-card__info">
          <strong>${player.name}</strong>
          <span>${player.position}</span>
        </div>

      </article>
    `,
    )
    .join("");
}

function getTeamInitials(name) {
  return name
    .split(" ")
    .slice(0, 2)
    .map(word => word.charAt(0))
    .join("");
}

function formatDate(date) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(date));
}

// -----------------------------------------------------------------------------
// Navegación móvil
// -----------------------------------------------------------------------------

function setupNavigation() {
  const toggle = document.querySelector(".menu-toggle");
  const navigation = document.querySelector("#main-navigation");

  if (!toggle || !navigation) return;

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";

    toggle.setAttribute("aria-expanded", String(!isOpen));

    navigation.classList.toggle("is-open", !isOpen);
  });
}

// -----------------------------------------------------------------------------
// Inicialización
// -----------------------------------------------------------------------------

async function init() {
  try{
    await loadData();
    const season = getCurrentSeason();
    document.querySelector(
      "#current-season-label"
    ).textContent = `Temporada ${season.name}`;

    renderCompetitions();
    setupNavigation();

    // Grupo inicial que mostramos al cargar la web.
    const firstGroup = state.groups.find(
      group => group.seasonId === season.id
    );

    if (firstGroup) {
      renderGroupData(firstGroup.id);
    }
    
  } catch (error) {
    console.log(error);
  }
  
}

init();

document.addEventListener("click", function (event) {
  // Comprobamos si lo que el usuario clickeó es nuestro botón de grupo
  const button = event.target.closest(".group-button");
  const teamCard = event.target.closest(".team-card");
  const closeButton = document.querySelector("#team-modal-close");

  if (button) {
    // Si existe el botón, extraemos los datos directamente de su dataset
    const groupId = button.dataset.groupId;

    // Aquí puedes llamar a cualquier otra función interna de tu código
    renderGroupData(groupId);
  } else if (teamCard) {
    // Ha clickado en la informacion del club, redirigimos al listener para abrir modal
    document.dispatchEvent(
      new CustomEvent("team:selected", {
        detail: {
          teamId: teamCard.dataset.teamId,
          groupId: teamCard.dataset.groupId,
          seasonId: teamCard.dataset.seasonId,
          competitionId: teamCard.dataset.competitionId,
        },
      }),
    );
  } else if (closeButton) {
    const modal = document.querySelector("#team-modal");
    if (event.target.id === 'team-modal-close') {
      modal.close();
    }
  }
});

document.addEventListener("team:selected", event => {
    const {
      teamId,
      groupId,
      seasonId,
      competitionId
    } = event.detail;

    openTeamModal({
      teamId,
      groupId,
      seasonId,
      competitionId
    });

});
