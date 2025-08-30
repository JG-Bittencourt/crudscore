// ===============================
// uiTeams.js
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  // Seções e Menu
  const sections = document.querySelectorAll("section");
  const menuLinks = document.querySelectorAll(".menu li a");

  // ==========================================================
// ========== INÍCIO DO NOVO CÓDIGO PARA COLAR ==========
// ==========================================================

  // Seletores da Home (MODIFICADO)
  const ctxHome = document.getElementById("homeChart").getContext("2d");
  const selectCriterio = document.getElementById("select-criterio");
  const selectOrdem = document.getElementById("select-ordem");

  // Seletores da aba Times
 
  const teamCardsContainer = document.getElementById("team-cards");


  // Seletores do formulário
  const formCadastrar = document.getElementById("form-cadastrar");

  // Estado dos gráficos (MODIFICADO)
  let homeChart;

  // ===============================
  // Helpers
  // ===============================
  const loadData = () => {
    let times = soccer.loadTimes();
    if (times.length === 0) {
      soccer.resetTimes();
      times = soccer.loadTimes();
    }
    return times;
  };

  // A função clearCharts foi removida por não ser mais necessária aqui.

  // ===============================
  // Renderização da Home (NOVA VERSÃO)
  // ===============================
  const updateHomeChart = () => {
    // 1. Pega os valores selecionados pelo usuário
    const criterio = selectCriterio.value;
    const ordem = selectOrdem.value;

    // 2. Carrega os dados dos times
    let times = loadData();

    // 3. Ordena o array de times de acordo com a seleção
    times.sort((a, b) => {
        let valueA, valueB;

        // Caso especial para "Saldo de Gols", que precisa ser calculado
        if (criterio === "goalDifference") {
            valueA = a.dataTime.goalsScored - a.dataTime.goalsConceded;
            valueB = b.dataTime.goalsScored - b.dataTime.goalsConceded;
        } else {
            // Pega o valor diretamente do objeto (ex: vitorias, derrotas, etc)
            valueA = a.dataTime[criterio];
            valueB = b.dataTime[criterio];
        }

        // Faz a ordenação: maior para menor (desc) ou menor para maior (asc)
        if (ordem === 'desc') {
            return valueB - valueA;
        } else {
            return valueA - valueB;
        }
    });

    // 4. Prepara os dados para o gráfico após a ordenação
    const labels = times.map(t => t.name);
    const data = times.map(t => {
        if (criterio === "goalDifference") {
            return t.dataTime.goalsScored - t.dataTime.goalsConceded;
        }
        return t.dataTime[criterio];
    });
    
    // Pega o texto da opção selecionada para usar como título do gráfico
    const chartLabel = selectCriterio.options[selectCriterio.selectedIndex].text;

    // 5. Destrói o gráfico antigo, se ele existir, para desenhar um novo
    if (homeChart) {
        homeChart.destroy();
    }

    // 6. Cria o novo gráfico
    homeChart = new Chart(ctxHome, {
        type: "bar", // O tipo ainda é 'bar'
        data: {
            labels: labels,
            datasets: [{
                label: chartLabel,
                data: data,
                backgroundColor: "rgba(75, 192, 192, 0.95)",
            }]
        },
        options: {
            // ESTA É A MÁGICA PARA O GRÁFICO FICAR NA HORIZONTAL
            indexAxis: 'y', 
            
            plugins: {
                legend: {
                    labels: {
                        color: "white",
                        font: { size: 15, weight: "bold" }
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: "white", font: { size: 15 } }
                },
                y: {
                    ticks: { color: "white", font: { size: 15 } }
                }
            }
        }
    });
  };

// ==========================================================
// ========== FIM DO NOVO CÓDIGO PARA COLAR ==========
// ==========================================================
  
  // ===============================
  // Renderização de um time específico
  // ===============================
 // ===============================
  // Renderização dos DETALHES de um time (NOVA VERSÃO)
  // ===============================
  let chartTeamResults, chartTeamGoals; // Variáveis para os novos gráficos

  const renderTeamDetails = (teamId) => {
    const times = loadData();
    const team = times.find(t => t.id === teamId);
    if (!team) return;

    // Seleciona o container de texto
    const teamDetailsText = document.getElementById("team-details-text");

    // Preenche com todas as informações do time
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

    // Destrói gráficos antigos se existirem
    if (chartTeamResults) chartTeamResults.destroy();
    if (chartTeamGoals) chartTeamGoals.destroy();

    // Cria o primeiro gráfico: Vitórias, Empates e Derrotas
    const ctxResults = document.getElementById("chartTeamResults").getContext("2d");
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
        plugins: {
          legend: { display: true, position: 'bottom', labels: { color: 'white' } },
          title: { display: true, text: 'Resultados', color: 'white' }
        }
      }
    });

    // Cria o segundo gráfico: Gols Pró e Contra
    const ctxGoals = document.getElementById("chartTeamGoals").getContext("2d");
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
        plugins: {
          legend: { display: true, position: 'bottom', labels: { color: 'white' } },
          title: { display: true, text: 'Gols', color: 'white' }
        }
      }
    });
  };

  // ===============================
  // Renderização dos cards de times
  // ===============================
  const renderTeamCards = () => {
    const times = loadData();
    const modal = document.getElementById("edit-modal");
    const updateForm = document.getElementById("form-update");

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

      // --- LÓGICA DO BOTÃO ATUALIZAR (MODIFICADA) ---
      card.querySelector(".update").addEventListener("click", () => {
        // Preenche o formulário do modal com os dados atuais do time
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
        
        // Exibe o modal
        modal.style.display = "block";
      });

      // --- LÓGICA DO BOTÃO DELETAR (SEM MUDANÇAS) ---
      card.querySelector(".delete").addEventListener("click", () => {
        if (!confirm(`Deseja deletar o time ${team.name}?`)) return;
        const updatedTimes = soccer.deleteTime(loadData(), team.id);
        soccer.saveTimes(updatedTimes);
        renderTeamCards();
        updateHomeChart();
        teamInfo.innerHTML = "<p>Selecione um time para ver estatísticas</p>";
        if (chartTeamBalance) chartTeamBalance.destroy();
      });

      card.addEventListener("click", (e) => {
        // Impede que o clique nos botões dispare este evento
        if (e.target.classList.contains('btn')) return;
        renderTeamDetails(team.id);
      });
      teamCardsContainer.appendChild(card);
    });
  };

// ===============================
  // Lógica do Modal de Edição
  // ===============================
  const modal = document.getElementById("edit-modal");
  const updateForm = document.getElementById("form-update");
  const closeButton = document.querySelector(".close-button");

  // Fecha o modal ao clicar no X
  closeButton.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Fecha o modal ao clicar fora dele
  window.addEventListener("click", (event) => {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  });

  // Salva as alterações do formulário de edição
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
        victories: victories,
        draws: draws,
        defeats: defeats,
        games: victories + draws + defeats, // Recalcula os jogos
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
    
    // Atualiza o gráfico de detalhes se o time editado estiver selecionado
    const selectedTeamInfo = document.querySelector("#time-info h2");
    if (selectedTeamInfo && selectedTeamInfo.textContent === updates.name) {
        renderTeamDetails(teamId);
    }
  });

 
// Cadastro de Time (VERSÃO 100% CORRETA E FUNCIONAL)
// ===============================

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
    const searchUrl = `https://free-api-live-football-data.p.rapidapi.com/football-teams-search?search=${timeName}`;
    const searchResponse = await fetch(searchUrl, options);
    const searchData = await searchResponse.json();

    if (!searchData.response.suggestions || searchData.response.suggestions.length === 0) {
      throw new Error(`Time "${timeName}" não encontrado na base de dados da API de logos.`);
    }
    const teamId = searchData.response.suggestions[0].id;

    const logoUrlEndpoint = `https://free-api-live-football-data.p.rapidapi.com/football-team-logo?teamid=${teamId}`;
    const logoResponse = await fetch(logoUrlEndpoint, options);
    const logoData = await logoResponse.json();
    
    if (logoData.response.url) {
      logoUrl = logoData.response.url;
    }

    // ========= MUDANÇA AQUI: LENDO OS NOVOS DADOS DO FORMULÁRIO =========
    const victories = parseInt(document.getElementById("timeVictories").value, 10);
    const defeats = parseInt(document.getElementById("timeDefeats").value, 10);
    const draws = parseInt(document.getElementById("timeDraws").value, 10)
    const goalsScored = parseInt(document.getElementById("timeGoalsScored").value, 10);
    const goalsConceded = parseInt(document.getElementById("timeGoalsConceded").value, 10);
    const games = victories + defeats + draws; // Calculamos o total de jogos

    const times = loadData();
    const newTime = {
      name: document.getElementById("timeName").value,
      foundation: parseInt(document.getElementById("timeFoundation").value, 10),
      nickname: document.getElementById("timeNickname").value,
      bestPlayer: document.getElementById("timeBestPlayer").value,
      color: document.getElementById("timeColor").value,
      badge: logoUrl,
      // Usando os dados do formulário em vez de valores zerados
      dataTime: { 
        games: games, 
        victories: victories, 
        draws: draws,
        defeats: defeats, 
        goalsScored: goalsScored, 
        goalsConceded: goalsConceded
      }
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

  // ===============================
  // <-- LINHAS NOVAS ADICIONADAS AQUI
  // Conectam os menus de seleção à função que atualiza o gráfico
  // ===============================
  selectCriterio.addEventListener("change", updateHomeChart);
  selectOrdem.addEventListener("change", updateHomeChart);


  // ===============================
  // Navegação do Menu
  // ===============================
  menuLinks.forEach(link => {
    link.addEventListener("click", () => {
      const sectionId = link.getAttribute("data-section");

      menuLinks.forEach(l => l.classList.remove("active"));
      link.classList.add("active");

      sections.forEach(sec => sec.classList.remove("active"));
      document.getElementById(sectionId).classList.add("active");

      // <-- MUDANÇA AQUI: Chamando a nova função quando o usuário clica em "Home"
      if (sectionId === "home") updateHomeChart(); 
      
      if (sectionId === "times") {
        renderTeamCards();
        teamInfo.innerHTML = "<p>Selecione um time para ver estatísticas</p>";
        if (chartTeamBalance) chartTeamBalance.destroy();
      }
    });
  });

  // ===============================
  // Inicialização
  // ===============================
  // <-- MUDANÇA AQUI: Chamando a nova função quando a página carrega
  updateHomeChart(); 
  renderTeamCards();

});
