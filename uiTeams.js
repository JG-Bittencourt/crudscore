// ===============================
// uiTeams.js
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  // Seções e Menu
  const sections = document.querySelectorAll("section");
  const menuLinks = document.querySelectorAll(".menu li a");

  // Seletores da Home 
  const ctxHome = document.getElementById("homeChart").getContext("2d");
  const selectCriterio = document.getElementById("select-criterio");
  const selectOrdem = document.getElementById("select-ordem");

  // Seletores da aba Times
  const teamCardsContainer = document.getElementById("team-cards");
  const teamDetailsText = document.getElementById("team-details-text");
  const chartResultsCanvas = document.getElementById("chartTeamResults");
  const chartGoalsCanvas = document.getElementById("chartTeamGoals");

  // Seletores dos formulários
  const formCadastrar = document.getElementById("form-cadastrar");
  const modal = document.getElementById("edit-modal");
  const updateForm = document.getElementById("form-update");
  const closeButton = document.querySelector(".close-button");

  // Seletores do Filtro
  const filterCriteria = document.getElementById("filter-criteria");
  const filterValue = document.getElementById("filter-value");
  const filterButton = document.getElementById("filter-button");
  const clearFilterButton = document.getElementById("clear-filter-button");

  // Botão Reset
  const resetButton = document.getElementById("reset-data-button");

  // Estado dos gráficos e seleção
  let homeChart, chartTeamResults, chartTeamGoals;
  let currentSelectedTeamId = null;

  // ============= Helpers ===============
  const loadData = () => {
    let times = soccer.loadTimes();
    if (times.length === 0) {
      soccer.resetTimes();
      times = soccer.loadTimes();
    }
    return times;
  };

  // ============== Renderização da Home =======================
  const updateHomeChart = () => {
    const criterio = selectCriterio.value;
    const ordem = selectOrdem.value;
    let times = loadData();

    times.sort((a, b) => {
      let valueA, valueB;
      if (criterio === "goalDifference") {
        valueA = a.dataTime.goalsScored - a.dataTime.goalsConceded;
        valueB = b.dataTime.goalsScored - b.dataTime.goalsConceded;
      } else {
        valueA = a.dataTime[criterio];
        valueB = b.dataTime[criterio];
      }
      
      if (ordem === 'asc') {
        return valueA - valueB;
      } else {
        return valueB - valueA;
      }
    });

    const labels = times.map(t => t.name);
    const data = times.map(t => {
      if (criterio === "goalDifference") {
        return t.dataTime.goalsScored - t.dataTime.goalsConceded;
      }
      return t.dataTime[criterio];
    });
    
    const chartLabel = selectCriterio.options[selectCriterio.selectedIndex].text;

    if (homeChart) homeChart.destroy();

    homeChart = new Chart(ctxHome, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [{
          label: chartLabel,
          data: data,
          backgroundColor: "rgba(44, 189, 189, 1)",
          barThickness: 25
        }]
      },
      options: {
        indexAxis: 'y',
        plugins: {
          legend: { labels: { color: "white", font: { size: 15, weight: "bold" } } }
        },
        scales: {
          x: { ticks: { color: "white", font: { size: 15 } } },
          y: { ticks: { color: "white", font: { size: 15 } } }
        }
      }
    });
  };

  // ==================== Renderização dos DETALHES de um time ===============================
  const renderTeamDetails = (teamId) => {
    currentSelectedTeamId = teamId;
    const times = loadData();
    const team = times.find(t => t.id === teamId);
    if (!team) return;

    teamDetailsText.innerHTML = `
      <h2>${team.name}</h2>
      <p><b>Ano de Fundação:</b> ${team.foundation}</p>
      <p><b>Apelido:</b> ${team.nickname}</p>
      <p><b>Maior Ídolo:</b> ${team.bestPlayer}</p>
      <p><b>Cores:</b> ${team.color}</p>
      <hr style="margin: 10px 0;">
      <p><b>Total de Jogos:</b> ${team.dataTime.games}</p>
      <p><b>Vitórias:</b> ${team.dataTime.victories}</p>
      <p><b>Empates:</b> ${team.dataTime.draws}</p>
      <p><b>Derrotas:</b> ${team.dataTime.defeats}</p>
      <p><b>Gols Marcados:</b> ${team.dataTime.goalsScored}</p>
      <p><b>Gols Sofridos:</b> ${team.dataTime.goalsConceded}</p>
      <p><b>Saldo de Gols:</b> ${team.dataTime.goalsScored - team.dataTime.goalsConceded}</p>
    `;

    if (chartTeamResults) chartTeamResults.destroy();
    if (chartTeamGoals) chartTeamGoals.destroy();

    const ctxResults = chartResultsCanvas.getContext("2d");
    chartTeamResults = new Chart(ctxResults, {
      type: "doughnut",
      data: {
        labels: ["Vitórias", "Empates", "Derrotas"],
        datasets: [{
          data: [team.dataTime.victories, team.dataTime.draws, team.dataTime.defeats],
          backgroundColor: ["#2ecc71", "#f1c40f", "#e74c3c"]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'bottom', labels: { color: 'white' } },
          title: { display: true, text: 'Resultados', color: 'white' }
        }
      }
    });

    const ctxGoals = chartGoalsCanvas.getContext("2d");
    chartTeamGoals = new Chart(ctxGoals, {
      type: "doughnut",
      data: {
        labels: ["Gols Pró", "Gols Contra"],
        datasets: [{
          data: [team.dataTime.goalsScored, team.dataTime.goalsConceded],
          backgroundColor: ["#3498db", "#95a5a6"]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'bottom', labels: { color: 'white' } },
          title: { display: true, text: 'Gols', color: 'white' }
        }
      }
    });
  };

  const clearTeamDetails = () => {
      currentSelectedTeamId = null;
      teamDetailsText.innerHTML = "<p>Selecione um time para ver as estatísticas.</p>";
      if (chartTeamResults) chartTeamResults.destroy();
      if (chartTeamGoals) chartTeamGoals.destroy();
  };

  // ========================= Renderização dos cards de times ==========================
  const renderTeamCards = (timesToRender) => {
    const times = timesToRender || loadData();
    teamCardsContainer.innerHTML = "";

    times.forEach(team => {
      const card = document.createElement("div");
      card.classList.add("team-card");

      card.innerHTML = `
        <img src="${team.badge || 'https://via.placeholder.com/100'}" alt="${team.name}" class="team-logo">
        <h3>${team.name}</h3>
        <p>${team.nickname}</p>
        <div class="team-actions">
          <button class="btn update">🔄 Atualizar</button>
          <button class="btn delete">🗑️ Deletar</button>
        </div>
      `;

      card.querySelector(".update").addEventListener("click", () => {
        document.getElementById("update-team-id").value = team.id;
        document.getElementById("update-timeName").value = team.name;
        document.getElementById("update-timeFoundation").value = team.foundation;
        document.getElementById("update-timeNickname").value = team.nickname;
        document.getElementById("update-timeBestPlayer").value = team.bestPlayer;
        document.getElementById("update-timeColor").value = team.color;
        document.getElementById("update-timeVictories").value = team.dataTime.victories;
        document.getElementById("update-timeDraws").value = team.dataTime.draws;
        document.getElementById("update-timeDefeats").value = team.dataTime.defeats;
        document.getElementById("update-timeGoalsScored").value = team.dataTime.goalsScored;
        document.getElementById("update-timeGoalsConceded").value = team.dataTime.goalsConceded;
        modal.style.display = "block";
      });

      card.querySelector(".delete").addEventListener("click", () => {
        if (!confirm(`Deseja deletar o time ${team.name}?`)) return;
        
        if(currentSelectedTeamId === team.id) {
            clearTeamDetails();
        }

        const updatedTimes = soccer.deleteTime(loadData(), team.id);
        soccer.saveTimes(updatedTimes);
        renderTeamCards();
        updateHomeChart();
      });

      card.addEventListener("click", (e) => {
        if (e.target.classList.contains('btn')) return;
        renderTeamDetails(team.id);
      });
      teamCardsContainer.appendChild(card);
    });
  };

  // ======================= Lógica do Modal de Edição ==========================
  closeButton.addEventListener("click", () => modal.style.display = "none");
  window.addEventListener("click", (event) => {
    if (event.target == modal) modal.style.display = "none";
  });

  updateForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const teamId = parseInt(document.getElementById("update-team-id").value);
    const victories = parseInt(document.getElementById("update-timeVictories").value);
    const draws = parseInt(document.getElementById("update-timeDraws").value);
    const defeats = parseInt(document.getElementById("update-timeDefeats").value);

    const updates = {
      name: document.getElementById("update-timeName").value,
      foundation: parseInt(document.getElementById("update-timeFoundation").value),
      nickname: document.getElementById("update-timeNickname").value,
      bestPlayer: document.getElementById("update-timeBestPlayer").value,
      color: document.getElementById("update-timeColor").value,
      dataTime: {
        victories,
        draws,
        defeats,
        games: victories + draws + defeats,
        goalsScored: parseInt(document.getElementById("update-timeGoalsScored").value),
        goalsConceded: parseInt(document.getElementById("update-timeGoalsConceded").value)
      }
    };
    
    const times = loadData();
    const updatedTimes = soccer.updateTimes(times, teamId, updates);
    soccer.saveTimes(updatedTimes);

    modal.style.display = "none";
    renderTeamCards();
    updateHomeChart();
    
    if (currentSelectedTeamId === teamId) {
        renderTeamDetails(teamId);
    }
  });

  // ================ Cadastro de Time (REVERTIDO PARA API ANTIGA) ===============
  formCadastrar.addEventListener("submit", async (e) => {
    e.preventDefault();

    const timeName = document.getElementById("timeName").value;
    const submitButton = formCadastrar.querySelector('input[type="submit"]');
    submitButton.value = "Buscando logo, aguarde...";
    submitButton.disabled = true;

    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': '73d575bf0cmshf6967d0d6b59b7ap1239cdjsna97c30493525',
        'x-rapidapi-host': 'free-api-live-football-data.p.rapidapi.com'
      }
    };

    let logoUrl = 'https://via.placeholder.com/100';

    try {
      // ETAPA 1: Buscar o ID do time pelo nome
      const searchUrl = `https://free-api-live-football-data.p.rapidapi.com/football-teams-search?search=${timeName}`;
      const searchResponse = await fetch(searchUrl, options);
      const searchData = await searchResponse.json();

      if (!searchData.response.suggestions || searchData.response.suggestions.length === 0) {
        throw new Error(`Time "${timeName}" não encontrado na base de dados da API.`);
      }
      const teamId = searchData.response.suggestions[0].id;

      // ETAPA 2: Buscar o logo usando o ID
      const logoUrlEndpoint = `https://free-api-live-football-data.p.rapidapi.com/football-team-logo?teamid=${teamId}`;
      const logoResponse = await fetch(logoUrlEndpoint, options);
      const logoData = await logoResponse.json();
      
      if (logoData.response.url) {
        logoUrl = logoData.response.url;
      }
      
      // ETAPA 3: Criar e salvar o time
      const victories = parseInt(document.getElementById("timeVictories").value, 10);
      const defeats = parseInt(document.getElementById("timeDefeats").value, 10);
      const draws = parseInt(document.getElementById("timeDraws").value, 10);
      const goalsScored = parseInt(document.getElementById("timeGoalsScored").value, 10);
      const goalsConceded = parseInt(document.getElementById("timeGoalsConceded").value, 10);
      const games = victories + defeats + draws;

      const times = loadData();
      const newTime = {
        name: document.getElementById("timeName").value,
        foundation: parseInt(document.getElementById("timeFoundation").value, 10),
        nickname: document.getElementById("timeNickname").value,
        bestPlayer: document.getElementById("timeBestPlayer").value,
        color: document.getElementById("timeColor").value,
        badge: logoUrl,
        dataTime: { games, victories, draws, defeats, goalsScored, goalsConceded }
      };

      const updated = soccer.addTimes(times, newTime);
      soccer.saveTimes(updated);

      alert("✅ Time cadastrado com sucesso!");
      formCadastrar.reset();
      renderTeamCards();
      updateHomeChart();

    } catch (error) {
      console.error("Erro no cadastro do time:", error);
      alert(`❌ Falha ao cadastrar o time. Motivo: ${error.message}`);
    } finally {
      submitButton.value = "Cadastrar";
      submitButton.disabled = false;
    }
  });

  // ======================= Lógica do Filtro de Times =========================
  filterCriteria.addEventListener("change", () => {
    const criteria = filterCriteria.value;
    if (criteria === 'all') {
      filterValue.classList.add('hidden');
      filterButton.classList.add('hidden');
      clearFilterButton.classList.add('hidden');
      renderTeamCards();
      clearTeamDetails();
    } else {
      filterValue.classList.remove('hidden');
      filterButton.classList.remove('hidden');
      clearFilterButton.classList.remove('hidden');
      filterValue.focus();
    }
  });

  filterButton.addEventListener("click", () => {
    const criteria = filterCriteria.value;
    const value = filterValue.value;

    if (!value) {
      alert("Por favor, digite um valor para filtrar.");
      return;
    }

    const allTimes = loadData();
    const filteredTimes = soccer.listTimesByField(allTimes, criteria, value);

    if (filteredTimes.length === 0) {
      alert(`Nenhum time encontrado com ${criteria} = "${value}".`);
    }

    renderTeamCards(filteredTimes);
    clearTeamDetails();
  });

  clearFilterButton.addEventListener("click", () => {
    filterCriteria.value = 'all';
    filterValue.value = '';
    filterValue.classList.add('hidden');
    filterButton.classList.add('hidden');
    clearFilterButton.classList.add('hidden');
    renderTeamCards();
    clearTeamDetails();
  });

  // ======================= Botão Reset =======================
  if(resetButton){
    resetButton.addEventListener("click", () => {
      if (confirm("Você tem certeza que deseja apagar TODOS os times e recomeçar com os dados iniciais?")) {
          soccer.clearTimes();
          alert("Dados resetados! A página será recarregada.");
          window.location.reload();
      }
    });
  }

  // ================== Event Listeners de Filtros e Menu ===================
  selectCriterio.addEventListener("change", updateHomeChart);
  selectOrdem.addEventListener("change", updateHomeChart);

  menuLinks.forEach(link => {
    link.addEventListener("click", () => {
      const sectionId = link.getAttribute("data-section");

      menuLinks.forEach(l => l.classList.remove("active"));
      link.classList.add("active");

      sections.forEach(sec => sec.classList.remove("active"));
      document.getElementById(sectionId).classList.add("active");

      if (sectionId === "home") {
        updateHomeChart();
      }
      if (sectionId === "times") {
        renderTeamCards();
        clearTeamDetails();
      }
    });
  });

  // =============== Inicialização ====================
  updateHomeChart(); 
  renderTeamCards();
});
