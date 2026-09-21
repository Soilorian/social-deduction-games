let socket;
let timerInterval = null;
const ROLE_NAMES = {
  merlin: "Merlin",
  percival: "Percival",
  royal: "Royal",
  mafia_minion: "Mafia Minion",
  mordred: "Mordred",
  morgana: "Morgana",
  assassin: "Assassin",
  oberon: "Oberon",
};

let currentState = { phase: "login", players: [] };

function show(id) {
  document.getElementById(id).classList.remove("hidden");
}
function hide(id) {
  document.getElementById(id).classList.add("hidden");
}

function join() {
  const name = document.getElementById("name").value.trim();
  if (!name) return;
  socket.emit("join", name);
}

function managerLogin() {
  const pass = document.getElementById("managerPass").value;
  socket.emit("manager_login", pass);
}

function showSetup() {
  socket.emit("set_phase", "setup");
}
function goLobby() {
  socket.emit("set_phase", "lobby");
}
function startGame() {
  socket.emit("start_game");
}
function resetGame() {
  socket.emit("reset_game");
}

function setRoleCount(role, count) {
  socket.emit("set_role_count", { role, count: parseInt(count, 10) });
}
function setVoteTime() {
  const s = parseInt(document.getElementById("voteTime").value, 10);
  socket.emit("set_vote_time", s);
}
function setMissions() {
  const missions = [];
  document.querySelectorAll(".mission-row").forEach((row) => {
    const parts = row.querySelector('input[data-key="participants"]');
    const fails = row.querySelector('input[data-key="fails"]');
    if (parts && fails) missions.push({ participants: parseInt(parts.value, 10) || 0, failsRequired: parseInt(fails.value, 10) || 0 });
  });
  socket.emit("set_missions", missions);
}
function addMission() {
  const container = document.getElementById("missionsConfig");
  const div = document.createElement("div");
  div.className = "mission-row";
  div.innerHTML = '<span>Mission ' + (container.children.length + 1) + '</span> Participants: <input type="number" data-key="participants" min="1" value="2"> Fails required: <input type="number" data-key="fails" min="0" value="1">';
  container.appendChild(div);
  setMissions();
}

function confirmTeam() {
  const ids = currentState.pendingTeam || [];
  const mission = currentState.missions[currentState.currentMissionIndex];
  if (mission && ids.length === mission.participants) {
    socket.emit("propose_team", ids);
  }
}
function teamVote(approve) {
  socket.emit("team_vote", approve);
}
function missionVote(choice) {
  socket.emit("mission_vote", choice);
}
function assassinGuess(playerId) {
  socket.emit("assassin_guess", playerId);
}
function sendChat() {
  const text = document.getElementById("chatText").value.trim();
  if (!text) return;
  socket.emit("chat", text);
  document.getElementById("chatText").value = "";
}

function updateVoteTimerDisplay() {
  var s = currentState;
  if (!s) return;
  var teamEl = document.getElementById("teamVoteTimer");
  var missionEl = document.getElementById("missionVoteTimer");
  if (s.phase === "team_vote" && s.teamVoteDeadline && teamEl) {
    var left = Math.max(0, Math.ceil((s.teamVoteDeadline - Date.now()) / 1000));
    teamEl.textContent = left > 0 ? "Time left: " + left + "s" : "";
  }
  if (s.phase === "mission_vote" && s.missionVoteDeadline && missionEl && (s.proposedTeam || []).indexOf(socket.id) >= 0 && !s.myMissionVote) {
    var leftM = Math.max(0, Math.ceil((s.missionVoteDeadline - Date.now()) / 1000));
    missionEl.textContent = leftM > 0 ? "Time left: " + leftM + "s" : "";
  }
}

function render(state) {
  currentState = state;
  if (state.phase === "login") {
    show("login");
    hide("game");
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    return;
  }
  hide("login");
  show("game");

  var nameBar = document.getElementById("myNameBar");
  if (nameBar) nameBar.textContent = state.myName ? "You: " + state.myName : "";

  const players = state.players || [];
  const list = document.getElementById("players");
  list.innerHTML = players.map((p) => '<li>' + escapeHtml(p.name) + (p.isManager ? ' <span class="badge manager">Manager</span>' : '') + '</li>').join("");

  const isManager = state.isManager === true;
  if (isManager) {
    show("managerArea");
  } else {
    hide("managerArea");
  }

  if (state.phase === "setup") {
    show("setupPanel");
    const rc = document.getElementById("roleCounts");
    const roles = Object.keys(ROLE_NAMES);
    if (!rc.dataset.rendered || rc.dataset.rendered === "0") {
      rc.innerHTML = roles.map((role) => '<div class="role-row"><label>' + ROLE_NAMES[role] + '</label><input type="number" data-role="' + role + '" min="0" value="' + (state.roleCounts && state.roleCounts[role] || 0) + '"></div>').join("");
      rc.dataset.rendered = "1";
    } else {
      roles.forEach((role) => {
        const input = rc.querySelector('input[data-role="' + role + '"]');
        if (input) input.value = state.roleCounts && state.roleCounts[role] || 0;
      });
    }
    const mc = document.getElementById("missionsConfig");
    const missions = state.missions || [];
    mc.innerHTML = "";
    missions.forEach((m, i) => {
      const div = document.createElement("div");
      div.className = "mission-row";
      div.innerHTML = '<span>Mission ' + (i + 1) + '</span> Participants: <input type="number" data-key="participants" min="1" value="' + m.participants + '"> Fails required: <input type="number" data-key="fails" min="0" value="' + m.failsRequired + '">';
      mc.appendChild(div);
    });
    if (missions.length === 0) {
      [1, 2, 2, 3, 3].forEach((p, i) => {
        const div = document.createElement("div");
        div.className = "mission-row";
        div.innerHTML = '<span>Mission ' + (i + 1) + '</span> Participants: <input type="number" data-key="participants" min="1" value="' + p + '"> Fails required: <input type="number" data-key="fails" min="0" value="1">';
        mc.appendChild(div);
      });
      setTimeout(setMissions, 0);
    }
    hide("phaseRoles");
    hide("phaseTeamSelection");
    hide("phaseTeamVote");
    hide("phaseMissionVote");
    hide("phaseMissionResult");
    hide("phaseAssassin");
    hide("phaseGameOver");
  } else {
    hide("setupPanel");
  }

  if (state.phase === "lobby") {
    hide("phaseRoles");
    hide("phaseTeamSelection");
    hide("phaseTeamVote");
    hide("phaseMissionVote");
    hide("phaseMissionResult");
    hide("phaseAssassin");
    hide("phaseGameOver");
  }

  const inGamePhases = ["roles", "team_selection", "team_vote", "mission_vote", "mission_result", "assassin", "game_over"];
  if (inGamePhases.includes(state.phase) && state.myRole) {
    show("phaseRoles");
    document.getElementById("myRole").textContent = ROLE_NAMES[state.myRole] || state.myRole;
    const merlinEl = document.getElementById("merlinSees");
    if (state.merlinSees && state.merlinSees.length) {
      // merlinEl.textContent = "You see (evils, not Mordred): " + state.merlinSees.join(", ");
      merlinEl.textContent = "You are the spy!";
      show("merlinSees");
    } else {
      hide("merlinSees");
    }
    const percivalEl = document.getElementById("percivalSees");
    if (state.percivalSees && state.percivalSees.length) {
      percivalEl.textContent = "You see (Merlin and Morgana, unknown who): " + state.percivalSees.join(", ");
      show("percivalSees");
    } else {
      hide("percivalSees");
    }
    const mafiaEl = document.getElementById("mafiaSees");
    if (state.mafiaSees && state.mafiaSees) {
      // mafiaEl.textContent = "Mafia: " + state.mafiaSees.join(", ");
      mafiaEl.textContent = "word: " + state.mafiaSees;
      show("mafiaSees");
    } else {
      hide("mafiaSees");
    }
  } else {
    hide("phaseRoles");
  }
  if (state.phase === "roles") {
    hide("phaseTeamSelection");
    hide("phaseTeamVote");
    hide("phaseMissionVote");
    hide("phaseMissionResult");
    hide("phaseAssassin");
    hide("phaseGameOver");
  }

  if (state.phase === "team_selection") {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    const mission = state.missions && state.missions[state.currentMissionIndex];
    const playerIds = players.map((p) => p.id);
    const leaderId = playerIds[state.leaderIndex];
    const leader = players.find((p) => p.id === leaderId);
    document.getElementById("leaderName").textContent = leader ? leader.name + " is the leader." : "";
    document.getElementById("missionNum").textContent = (state.currentMissionIndex || 0) + 1;
    document.getElementById("missionSize").textContent = mission ? mission.participants : 0;
    const list = document.getElementById("teamSelectList");
    list.innerHTML = "";
    const pending = state.pendingTeam || [];
    const isLeader = players.some((p) => p.id === socket.id) && playerIds[state.leaderIndex] === socket.id;
    const maxParticipants = mission ? mission.participants : 0;
    players.forEach((p) => {
      const li = document.createElement("li");
      li.dataset.id = p.id;
      li.textContent = p.name;
      if (isLeader) {
        li.onclick = () => {
          var current = (currentState.pendingTeam || []).slice();
          var idx = current.indexOf(p.id);
          if (idx >= 0) {
            current.splice(idx, 1);
          } else if (current.length < maxParticipants) {
            current.push(p.id);
          }
          socket.emit("update_pending_team", current);
        };
      }
      if (pending.indexOf(p.id) >= 0) li.classList.add("selected");
      list.appendChild(li);
    });
    document.getElementById("confirmTeamBtn").disabled = !isLeader || pending.length !== maxParticipants;
    show("phaseTeamSelection");
    hide("phaseTeamVote");
    hide("phaseMissionVote");
    hide("phaseMissionResult");
    hide("phaseAssassin");
    hide("phaseGameOver");
  }

  if (state.phase === "team_vote") {
    const proposed = state.proposedTeam || [];
    const names = (proposed || []).map((id) => (players.find((p) => p.id === id) || {}).name).filter(Boolean);
    document.getElementById("teamVoteList").textContent = "Team: " + names.join(", ");
    var voted = state.myTeamVote !== undefined;
    document.getElementById("teamVoteBtns").classList.toggle("hidden", voted);
    document.getElementById("teamVoteDone").classList.toggle("hidden", !voted);
    if (voted) document.getElementById("teamVoteDone").textContent = "You voted " + (state.myTeamVote ? "Approve" : "Reject") + ".";
    if (voted) document.getElementById("teamVoteTimer").textContent = "";
    if (!timerInterval) { timerInterval = setInterval(updateVoteTimerDisplay, 1000); }
    updateVoteTimerDisplay();
    show("phaseTeamVote");
    hide("phaseTeamSelection");
    hide("phaseMissionVote");
    hide("phaseMissionResult");
    hide("phaseAssassin");
    hide("phaseGameOver");
  }
  if (state.phase !== "team_vote" && state.phase !== "mission_vote" && timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  if (state.phase === "mission_vote") {
    const onMission = (state.proposedTeam || []).includes(socket.id);
    var missionVoted = onMission && state.myMissionVote;
    document.querySelector("#phaseMissionVote .mission-cards").style.display = (onMission && !missionVoted) ? "block" : "none";
    document.getElementById("missionVoteWaiting").classList.toggle("hidden", onMission);
    if (missionVoted) {
      document.getElementById("missionVoteTimer").textContent = "You chose: " + state.myMissionVote + ".";
    }
    if (!timerInterval) { timerInterval = setInterval(updateVoteTimerDisplay, 1000); }
    updateVoteTimerDisplay();
    show("phaseMissionVote");
    hide("phaseTeamSelection");
    hide("phaseTeamVote");
    hide("phaseMissionResult");
    hide("phaseAssassin");
    hide("phaseGameOver");
  }

  if (state.phase === "mission_result") {
    document.getElementById("missionResultText").textContent = "Fails: " + (state.lastMissionFails ?? "—") + ". " + (state.lastMissionSuccess ? "Mission succeeded!" : "Mission failed!");
    document.getElementById("townWins").textContent = state.townWins ?? 0;
    document.getElementById("mafiaWins").textContent = state.mafiaWins ?? 0;
    show("phaseMissionResult");
    hide("phaseTeamSelection");
    hide("phaseTeamVote");
    hide("phaseMissionVote");
    hide("phaseAssassin");
    hide("phaseGameOver");
  }

  if (state.phase === "assassin") {
    const list = document.getElementById("assassinGuessList");
    list.innerHTML = "";
    const myRole = state.myRole;
    if (myRole === "assassin") {
      players.forEach((p) => {
        const li = document.createElement("li");
        li.dataset.id = p.id;
        li.textContent = p.name;
        li.onclick = () => assassinGuess(p.id);
        list.appendChild(li);
      });
    } else {
      document.getElementById("assassinPrompt").textContent = "Waiting for the Assassin to guess Merlin...";
    }
    show("phaseAssassin");
    hide("phaseTeamSelection");
    hide("phaseTeamVote");
    hide("phaseMissionVote");
    hide("phaseMissionResult");
    hide("phaseGameOver");
  }

  if (state.phase === "game_over") {
    document.getElementById("winnerText").textContent = state.winner === "town" ? "Town wins!" : "Mafia wins!" + (state.assassinGuessedCorrectly ? " (Assassin guessed Merlin.)" : "");
    show("phaseGameOver");
    hide("phaseTeamSelection");
    hide("phaseTeamVote");
    hide("phaseMissionVote");
    hide("phaseMissionResult");
    hide("phaseAssassin");
  }

  const chatEl = document.getElementById("chat");
  const chat = state.chat || [];
  chatEl.innerHTML = chat.map((c) => "<div>" + escapeHtml(typeof c === "string" ? c : c.msg) + "</div>").join("");
  chatEl.scrollTop = chatEl.scrollHeight;
}

function escapeHtml(s) {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

function bindHandlers() {
  var el;
  if ((el = document.getElementById("btnJoin"))) el.addEventListener("click", join);
  if ((el = document.getElementById("btnManagerLogin"))) el.addEventListener("click", managerLogin);
  if ((el = document.getElementById("btnSetup"))) el.addEventListener("click", showSetup);
  if ((el = document.getElementById("btnLobby"))) el.addEventListener("click", goLobby);
  if ((el = document.getElementById("btnStartGame"))) el.addEventListener("click", startGame);
  if ((el = document.getElementById("btnReset"))) el.addEventListener("click", resetGame);
  if ((el = document.getElementById("btnVoteTime"))) el.addEventListener("click", setVoteTime);
  if ((el = document.getElementById("btnAddMission"))) el.addEventListener("click", addMission);
  if ((el = document.getElementById("confirmTeamBtn"))) el.addEventListener("click", confirmTeam);
  if ((el = document.getElementById("btnTeamApprove"))) el.addEventListener("click", function() { teamVote(true); });
  if ((el = document.getElementById("btnTeamReject"))) el.addEventListener("click", function() { teamVote(false); });
  if ((el = document.getElementById("btnMissionSucceed"))) el.addEventListener("click", function() { missionVote("succeed"); });
  if ((el = document.getElementById("btnMissionFail"))) el.addEventListener("click", function() { missionVote("fail"); });
  if ((el = document.getElementById("btnSendChat"))) el.addEventListener("click", sendChat);
  if ((el = document.getElementById("chatText"))) el.addEventListener("keydown", function(e) { if (e.key === "Enter") sendChat(); });
  var rc = document.getElementById("roleCounts");
  if (rc) rc.addEventListener("change", function(e) { var inp = e.target; if (inp.dataset.role) setRoleCount(inp.dataset.role, inp.value); });
  var mc = document.getElementById("missionsConfig");
  if (mc) mc.addEventListener("change", function() { setMissions(); });
}

document.addEventListener("DOMContentLoaded", function() {
  if (typeof io === "undefined") {
    console.error("Socket.IO not loaded. Serve the page from the Node server (npm start).");
    return;
  }
  socket = io();
  socket.on("state", render);
  socket.on("connect", function() {});
  bindHandlers();
});
