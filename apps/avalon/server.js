const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const MANAGER_PASSWORD = process.env.MANAGER_PASSWORD;
if (!MANAGER_PASSWORD) throw new Error("Set MANAGER_PASSWORD before starting the server");

const ROLES = {
  merlin: { side: "town", name: "Merlin" },
  percival: { side: "town", name: "Percival" },
  royal: { side: "town", name: "Royal" },
  mafia_minion: { side: "mafia", name: "Mafia Minion" },
  mordred: { side: "mafia", name: "Mordred" },
  morgana: { side: "mafia", name: "Morgana" },
  assassin: { side: "mafia", name: "Assassin" },
  oberon: { side: "mafia", name: "Oberon" },
};

const words = [
  "بیمارستان",
  "دامداری",
  "داروخانه",
  "کلیسا",
  "مسجد",
  "عطاری",
  "اسلحه‌فروشی",
  "آتش‌نشانی",
  "پلیس",
  "پست خونه",
  "کتابخانه",
  "مدرسه",
  "دانشگاه",
  "سینما",
  "تئاتر",
  "موزه",
  "پارک",
  "شهرداری",
  "بازار",
  "ایستگاه مترو",
  "فرودگاه",
  "ترمینال مسافربری",
  "رستوران",
  "کافه",
  "فروشگاه",
  "سوپرمارکت",
  "پمپ بنزین",
  "کارواش",
  "تعویض روغنی",
  "فروشگاه لوازم خانگی",
  "موبایل‌فروشی",
  "جواهر فروشی",
  "قالی‌فروشی",
  "پوشاک",
  "آرایشگاه مردانه",
  "آرایشگاه زنانه",
  "خشکشویی",
  "قالی‌شویی",
  "نانوایی",
  "قنادی",
  "میوه‌فروشی",
  "سبزی‌فروشی",
  "آب‌میوه و بستنی",
  "رستوران سنتی",
  "فست‌فود",
  "قهوه‌خانه",
  "هتل",
  "استخر",
  "سالن بدنسازی",
  "آزمایشگاه پاتوبیولوژی",
  "رادیولوژی و سونوگرافی",
  "دندانپزشکی",
  "دفتر پیشخوان دولت",
  "بانک",
  "صرافی",
  "املاک",
  "برقکاری",
  "لوله‌کشی",
  "نجاری",
  "آهنگری",
  "کافینت",
  "چاپخانه",
  "آژانس تبلیغاتی",
  "تاکسی تلفنی",
  "لاستیک‌فروشی",
  "فروشگاه دوچرخه",
  "گل‌فروشی",
  "دامپزشکی",
  "آرایشگاه حیوانات",
  "پت‌شاپ",
  "فروشگاه ماهی",
  "آکواریوم",
  "عینک‌فروشی",
  "ساعت‌فروشی",
  "خیاطی",
  "هایپرمارکت",
  "برج ایفل",
  "برج پیزا",
  "برج میلاد",
  "برج آزادی",
  "چشم لندن",
  "میدان تایمز",
  "دیوار چین",
  "تاج محل",
  "کولوسئوم",
  "اهرام ثلاثه",
  "جزیره استقلال",
  "میدان ترافالگار",
  "پل گلدن گیت",
  "اپرای سیدنی",
  "کاخ کرملین",
  "برج خلیفه",
  "مکعب مکه",
  "کعبه",
  "مسجد الحرام",
  "مسجد الاقصی",
  "اسسی",
  "کلاس جلیلی",
  "اتاق فضلی",
  "رایانش",
  "اتاق بایت",
  "لوپ جلو دانشکده",
  "لاو گاردن",
  "جکوز",
  "شریف پلاس",
  "ناصرخان",
  "پایگاه بسیج",
  "خونه ی عرفان",
  "کمد سهیل",
  "زیرزمین فاطمه",
  "زندان",
  "دیوونه خونه",
  "اسسی",
  "کلاس جلیلی",
  "اتاق فضلی",
  "رایانش",
  "اتاق بایت",
  "لوپ جلو دانشکده",
  "لاو گاردن",
  "جکوز",
  "شریف پلاس",
  "ناصرخان",
  "پایگاه بسیج",
  "خونه ی عرفان",
  "کمد سهیل",
  "زیرزمین فاطمه",
  "زندان",
  "دیوونه خونه",
  "اسسی",
  "کلاس جلیلی",
  "اتاق فضلی",
  "رایانش",
  "اتاق بایت",
  "لوپ جلو دانشکده",
  "لاو گاردن",
  "جکوز",
  "شریف پلاس",
  "ناصرخان",
  "پایگاه بسیج",
  "خونه ی عرفان",
  "کمد سهیل",
  "زیرزمین فاطمه",
  "زندان",
  "دیوونه خونه",
  "اسسی",
  "کلاس جلیلی",
  "اتاق فضلی",
  "رایانش",
  "اتاق بایت",
  "لوپ جلو دانشکده",
  "لاو گاردن",
  "جکوز",
  "شریف پلاس",
  "ناصرخان",
  "پایگاه بسیج",
  "خونه ی عرفان",
  "کمد سهیل",
  "زیرزمین فاطمه",
  "زندان",
  "دیوونه خونه",
  "اسسی",
  "کلاس جلیلی",
  "اتاق فضلی",
  "رایانش",
  "اتاق بایت",
  "لوپ جلو دانشکده",
  "لاو گاردن",
  "جکوز",
  "شریف پلاس",
  "ناصرخان",
  "پایگاه بسیج",
  "خونه ی عرفان",
  "کمد سهیل",
  "زیرزمین فاطمه",
  "زندان",
  "دیوونه خونه",
  "اسسی",
  "کلاس جلیلی",
  "اتاق فضلی",
  "رایانش",
  "اتاق بایت",
  "لوپ جلو دانشکده",
  "لاو گاردن",
  "جکوز",
  "شریف پلاس",
  "ناصرخان",
  "پایگاه بسیج",
  "خونه ی عرفان",
  "کمد سهیل",
  "زیرزمین فاطمه",
  "زندان",
  "دیوونه خونه",
  "اسسی",
  "کلاس جلیلی",
  "اتاق فضلی",
  "رایانش",
  "اتاق بایت",
  "لوپ جلو دانشکده",
  "لاو گاردن",
  "جکوز",
  "شریف پلاس",
  "ناصرخان",
  "پایگاه بسیج",
  "خونه ی عرفان",
  "کمد سهیل",
  "زیرزمین فاطمه",
  "زندان",
  "دیوونه خونه",
  "اسسی",
  "کلاس جلیلی",
  "اتاق فضلی",
  "رایانش",
  "اتاق بایت",
  "لوپ جلو دانشکده",
  "لاو گاردن",
  "جکوز",
  "شریف پلاس",
  "ناصرخان",
  "پایگاه بسیج",
  "خونه ی عرفان",
  "کمد سهیل",
  "زیرزمین فاطمه",
  "زندان",
  "دیوونه خونه",
  "اسسی",
  "کلاس جلیلی",
  "اتاق فضلی",
  "رایانش",
  "اتاق بایت",
  "لوپ جلو دانشکده",
  "لاو گاردن",
  "جکوز",
  "شریف پلاس",
  "ناصرخان",
  "پایگاه بسیج",
  "خونه ی عرفان",
  "کمد سهیل",
  "زیرزمین فاطمه",
  "زندان",
  "دیوونه خونه",
  "اسسی",
  "کلاس جلیلی",
  "اتاق فضلی",
  "رایانش",
  "اتاق بایت",
  "لوپ جلو دانشکده",
  "لاو گاردن",
  "جکوز",
  "شریف پلاس",
  "ناصرخان",
  "پایگاه بسیج",
  "خونه ی عرفان",
  "کمد سهیل",
  "زیرزمین فاطمه",
  "زندان",
  "دیوونه خونه",
  "اسسی",
  "کلاس جلیلی",
  "اتاق فضلی",
  "رایانش",
  "اتاق بایت",
  "لوپ جلو دانشکده",
  "لاو گاردن",
  "جکوز",
  "شریف پلاس",
  "ناصرخان",
  "پایگاه بسیج",
  "خونه ی عرفان",
  "کمد سهیل",
  "زیرزمین فاطمه",
  "زندان",
  "دیوونه خونه",
  "اسسی",
  "کلاس جلیلی",
  "اتاق فضلی",
  "رایانش",
  "اتاق بایت",
  "لوپ جلو دانشکده",
  "لاو گاردن",
  "جکوز",
  "شریف پلاس",
  "ناصرخان",
  "پایگاه بسیج",
  "خونه ی عرفان",
  "کمد سهیل",
  "زیرزمین فاطمه",
  "زندان",
  "دیوونه خونه",
  "اسسی",
  "کلاس جلیلی",
  "اتاق فضلی",
  "رایانش",
  "اتاق بایت",
  "لوپ جلو دانشکده",
  "لاو گاردن",
  "جکوز",
  "شریف پلاس",
  "ناصرخان",
  "پایگاه بسیج",
  "خونه ی عرفان",
  "کمد سهیل",
  "زیرزمین فاطمه",
  "زندان",
  "دیوونه خونه",
  "اسسی",
  "کلاس جلیلی",
  "اتاق فضلی",
  "رایانش",
  "اتاق بایت",
  "لوپ جلو دانشکده",
  "لاو گاردن",
  "جکوز",
  "شریف پلاس",
  "ناصرخان",
  "پایگاه بسیج",
  "خونه ی عرفان",
  "کمد سهیل",
  "زیرزمین فاطمه",
  "زندان",
  "دیوونه خونه",
  "اسسی",
  "کلاس جلیلی",
  "اتاق فضلی",
  "رایانش",
  "اتاق بایت",
  "لوپ جلو دانشکده",
  "لاو گاردن",
  "جکوز",
  "شریف پلاس",
  "ناصرخان",
  "پایگاه بسیج",
  "خونه ی عرفان",
  "کمد سهیل",
  "زیرزمین فاطمه",
  "زندان",
  "دیوونه خونه",
  "اسسی",
  "کلاس جلیلی",
  "اتاق فضلی",
  "رایانش",
  "اتاق بایت",
  "لوپ جلو دانشکده",
  "لاو گاردن",
  "جکوز",
  "شریف پلاس",
  "ناصرخان",
  "پایگاه بسیج",
  "خونه ی عرفان",
  "کمد سهیل",
  "زیرزمین فاطمه",
  "زندان",
  "دیوونه خونه",
  "اسسی",
  "کلاس جلیلی",
  "اتاق فضلی",
  "رایانش",
  "اتاق بایت",
  "لوپ جلو دانشکده",
  "لاو گاردن",
  "جکوز",
  "شریف پلاس",
  "ناصرخان",
  "پایگاه بسیج",
  "خونه ی عرفان",
  "کمد سهیل",
  "زیرزمین فاطمه",
  "زندان",
  "دیوونه خونه",
  "جواهر فروشی",
  "بیب",
  "کمد علی",
  "اتاق خواب ترامپ",
  "کاخ سفید",
  "ناو ابراهیم",
  "کشتی صبا",
  "سورتمه",
  "تله کابین",
  "خونه",
  "تل آویل",
  "تهران",
  "دوبی",
  "بانک",
  "بیمارستان",
  "داروخونه",
  "مدرسه",
  "دانشگاه",
  "سوپرمارکت",
  "استخر",
  "پارک جنگلی",
  "شهربازی",
  "پاساژ",
  "هتل",
  "ویلا",
  "آمریکا",
  "ایران",
  "اسرائیل",
  "ترکیه",
  "تهران",
  "مشهد",
  "شیراز",
  "اصفهان",
  "مکان",
  "کارواش",
  "پارکینگ",
  "بندر",
  "خیاطی",
  "خرازی",
  "کفاشی",
  "مسجد",
  "کلیسا",
  "قبرستون",
  "سردخونه",
  "آسیا",
  "آمریکای شمالی",
  "آمریکای جنوبی",
  "آفریقا",
  "اروپا",
  "استرالیا",
  "آلمان",
  "انگلیس",
  "فرانسه",
  "ایتالیا",
  "کیش",
  "روسیه",
  "چین",
  "ژاپن",
  "قزوین",
  "تبریز",
  "جواهر فروشی",
  "لباس فروشی",
  "نمایشگاه ماشین",
  "موزه",
  "کتابخونه",
  "بار",
  "کاباره",
  "آرایشگاه",
  "رستوران",
  "کافی‌شاپ",
  "گیم‌نت",
  "اسکیپ روم",
  "استادیوم",
  "غار",
  "کوه",
  "تونل",
  "بزرگراه",
  "آپارتمان",
  "طباخی",
  "جگرکی",
  "شیرینی فروشی",
  "پیست اسکی",
  "پیست کارتینگ",
  "زمین گلف",
  "آبشار",
  "سفارت",
  "وزارت",
  "کاخ سفید",
  "بیت رهبری",
  "زمین",
  "زمین بسکتبال",
  "زمین والیبال",
  "باغ وحش",
  "جنگل",
  "باغ",
  "حرم",
  "آکواریوم",
  "خونه سالمندان",
  "مهدکودک",
  "فرودگاه",
  "ترمینال",
  "مترو",
  "ایستگاه اتوبوس",
  "دریا",
  "دریاچه",
  "ساحل",
  "دادگاه",
  "کلانتری",
  "زندان",
  "پلیس‌راه",
  "مرز"
]

function getRandomWord() {
  const randomIndex = Math.floor(Math.random() * words.length);
  return words[randomIndex];
}

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

const state = {
  phase: "lobby",
  players: new Map(),
  disconnectedPlayers: new Map(),
  roleCounts: {},
  missions: [],
  roles: {},
  missionHistory: [],
  currentMissionIndex: 0,
  leaderIndex: 0,
  proposedTeam: [],
  teamVotes: {},
  missionVotes: {},
  missionVoteDeadline: null,
  chat: [],
  townWins: 0,
  mafiaWins: 0,
  voteTimeSeconds: 60,
  consecutiveRejections: 0,
  pendingTeam: [],
};

function getPlayerList() {
  return Array.from(state.players.values()).map((p) => ({
    id: p.id,
    name: p.name,
    isManager: p.isManager,
  }));
}

function getPublicState() {
  const players = getPlayerList();
  const base = {
    phase: state.phase,
    players,
    roleCounts: state.roleCounts,
    missions: state.missions,
    missionHistory: state.missionHistory,
    currentMissionIndex: state.currentMissionIndex,
    leaderIndex: state.leaderIndex,
    proposedTeam: state.proposedTeam,
    pendingTeam: state.pendingTeam || [],
    teamVotes: state.teamVotes,
    townWins: state.townWins,
    mafiaWins: state.mafiaWins,
    chat: state.chat.slice(-100),
    voteTimeSeconds: state.voteTimeSeconds,
  };
  if (state.phase === "team_vote") {
    base.teamVoteDeadline = state.teamVoteDeadline;
  }
  if (state.phase === "mission_vote") {
    base.missionVoteDeadline = state.missionVoteDeadline;
  }
  if (state.phase === "mission_result") {
    base.lastMissionFails = state.lastMissionFails;
    base.lastMissionSuccess = state.lastMissionSuccess;
  }
  if (state.phase === "assassin") {
    base.assassinGuessPlayerIds = state.assassinGuessPlayerIds || [];
  }
  if (state.phase === "game_over") {
    base.winner = state.winner;
    base.assassinGuessedCorrectly = state.assassinGuessedCorrectly;
  }
  return base;
}

function getPlayerState(playerId) {
  const base = getPublicState();
  const role = state.roles[playerId];
  if (role) base.myRole = role;
  const p = state.players.get(playerId);
  if (p && p.isManager) base.isManager = true;

  if (state.phase === "roles" || state.phase === "team_selection" || state.phase === "team_vote" || state.phase === "mission_vote" || state.phase === "mission_result" || state.phase === "assassin" || state.phase === "game_over") {
    const roleInfo = ROLES[role];
    if (roleInfo) {
      if (role === "merlin") {
        base.merlinSees = Array.from(state.players.keys()).filter((id) => {
          const r = state.roles[id];
          if (!r || id === playerId) return false;
          const info = ROLES[r];
          return info.side === "mafia" && r !== "mordred";
        }).map((id) => state.players.get(id)?.name).filter(Boolean);
      }
      if (role === "percival") {
        const merlinId = Object.entries(state.roles).find(([, r]) => r === "merlin")?.[0];
        const morganaId = Object.entries(state.roles).find(([, r]) => r === "morgana")?.[0];
        base.percivalSees = [merlinId, morganaId].filter(Boolean).map((id) => state.players.get(id)?.name).filter(Boolean);
      }
      if (roleInfo.side === "mafia" && role !== "oberon") {
        // base.mafiaSees = Array.from(state.players.keys()).filter((id) => {
        //   const r = state.roles[id];
        //   if (!r || id === playerId) return false;
        //   const info = ROLES[r];
        //   return info.side === "mafia" && r !== "oberon";
        // }).map((id) => state.players.get(id)?.name).filter(Boolean);
        base.mafiaSees = state.word
      }
    }
  }

  if (state.phase === "mission_vote" && state.missionVotes[playerId] !== undefined) {
    base.myMissionVote = state.missionVotes[playerId];
  }
  if (state.phase === "team_vote" && state.teamVotes[playerId] !== undefined) {
    base.myTeamVote = state.teamVotes[playerId];
  }
  const me = state.players.get(playerId);
  if (me) base.myName = me.name;
  return base;
}

function logChat(msg) {
  state.chat.push({ time: new Date().toISOString(), msg });
  broadcastState();
}

function buildRoleDeck() {
  const deck = [];
  for (const [roleKey, count] of Object.entries(state.roleCounts)) {
    if (ROLES[roleKey] && count > 0) {
      for (let i = 0; i < count; i++) deck.push(roleKey);
    }
  }
  return deck;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function startGame() {
  const playerIds = Array.from(state.players.keys());
  if (playerIds.length < 5) {
    logChat("[System] Need at least 5 players to start.");
    return;
  }
  const deck = buildRoleDeck();
  if (deck.length !== playerIds.length) {
    logChat(`[System] Role count (${deck.length}) must equal player count (${playerIds.length}).`);
    return;
  }
  const shuffled = shuffle(deck);
  state.roles = {};
  playerIds.forEach((id, i) => {
    state.roles[id] = shuffled[i];
  });
  state.phase = "roles";
  state.missionHistory = [];
  state.currentMissionIndex = 0;
  state.leaderIndex = 0;
  state.townWins = 0;
  state.mafiaWins = 0;
  state.proposedTeam = [];
  state.pendingTeam = [];
  state.teamVotes = {};
  state.missionVotes = {};
  state.consecutiveRejections = 0;
  state.word = getRandomWord();
  logChat("[System] Game started. Roles have been distributed.");
  broadcastState();
  setTimeout(() => {
    if (state.phase === "roles") {
      state.phase = "team_selection";
      state.proposedTeam = [];
      state.teamVotes = {};
      const leaderId = playerIds[state.leaderIndex];
      logChat(`[System] ${state.players.get(leaderId)?.name} is the mission leader. Select your team.`);
      broadcastState();
    }
  }, 15000);
}

function advanceToTeamSelection() {
  const playerIds = Array.from(state.players.keys());
  state.phase = "team_selection";
  state.proposedTeam = [];
  state.pendingTeam = [];
  state.teamVotes = {};
  const leaderId = playerIds[state.leaderIndex];
  logChat(`[System] ${state.players.get(leaderId)?.name} is the mission leader. Select your team.`);
  broadcastState();
}

function runTeamVote() {
  state.phase = "team_vote";
  state.teamVotes = {};
  state.teamVoteDeadline = Date.now() + state.voteTimeSeconds * 1000;
  logChat(`[System] Vote on the proposed team. You have ${state.voteTimeSeconds} seconds.`);
  broadcastState();
  state.teamVoteTimer = setTimeout(() => {
    if (state.phase === "team_vote") countTeamVotes();
  }, state.voteTimeSeconds * 1000);
}

function countTeamVotes() {
  if (state.teamVoteTimer) { clearTimeout(state.teamVoteTimer); state.teamVoteTimer = null; }
  const parts = [];
  state.players.forEach((p, id) => {
    const v = state.teamVotes[id];
    const word = v === true ? "approved" : "rejected";
    parts.push(p.name + " " + word);
  });
  logChat("[System] Team vote: " + parts.join(", ") + ".");
  const votes = Object.values(state.teamVotes);
  const approved = votes.filter((v) => v === true).length;
  const total = state.players.size;
  const needed = Math.floor(total / 2) + 1;
  if (approved >= needed) {
    state.consecutiveRejections = 0;
    state.phase = "mission_vote";
    state.missionVotes = {};
    state.missionVoteDeadline = Date.now() + state.voteTimeSeconds * 1000;
    logChat("[System] Team approved. Mission members: choose SUCCEED or FAIL. You have " + state.voteTimeSeconds + " seconds.");
    if (state.missionVoteTimer) clearTimeout(state.missionVoteTimer);
    state.missionVoteTimer = setTimeout(() => {
      if (state.phase === "mission_vote") resolveMission();
    }, state.voteTimeSeconds * 1000);
  } else {
    state.consecutiveRejections = (state.consecutiveRejections || 0) + 1;
    state.leaderIndex = (state.leaderIndex + 1) % state.players.size;
    advanceToTeamSelection();
    logChat("[System] Team rejected. Next leader will propose a new team.");
  }
  broadcastState();
}

function resolveMission() {
  if (state.missionVoteTimer) { clearTimeout(state.missionVoteTimer); state.missionVoteTimer = null; }
  const mission = state.missions[state.currentMissionIndex];
  if (!mission) return;
  const fails = Object.entries(state.missionVotes).filter(([, v]) => v === "fail").length;
  const success = fails < mission.failsRequired;
  state.lastMissionFails = fails;
  state.lastMissionSuccess = success;
  state.missionHistory.push({ missionIndex: state.currentMissionIndex, success, fails });
  if (success) state.townWins++;
  else state.mafiaWins++;
  state.phase = "mission_result";
  logChat(`[System] Mission ${state.currentMissionIndex + 1}: ${fails} fail(s). ${success ? "SUCCESS" : "FAILED"}.`);
  broadcastState();
  setTimeout(() => {
    if (state.townWins >= 3) {
      state.phase = "assassin";
      state.assassinGuessPlayerIds = [];
      logChat("[System] Town has won 3 missions. Assassin, guess Merlin!");
      broadcastState();
      return;
    }
    if (state.mafiaWins >= 3) {
      state.phase = "game_over";
      state.winner = "mafia";
      logChat("[System] Mafia has won 3 missions. Game over!");
      broadcastState();
      return;
    }
    state.currentMissionIndex++;
    state.leaderIndex = (state.leaderIndex + 1) % state.players.size;
    state.consecutiveRejections = 0;
    advanceToTeamSelection();
  }, 8000);
}

function checkMissionVotesComplete() {
  const mission = state.missions[state.currentMissionIndex];
  if (!mission) return;
  const team = state.proposedTeam;
  const voted = team.filter((id) => state.missionVotes[id] !== undefined).length;
  if (voted === team.length) {
    resolveMission();
  }
}

function broadcastState() {
  state.players.forEach((_, id) => {
    io.to(id).emit("state", getPlayerState(id));
  });
}

io.on("connection", (socket) => {
  socket.emit("state", { phase: "login", chat: state.chat.slice(-50) });

  socket.on("join", (name) => {
    if (!name || typeof name !== "string") return;
    const username = String(name).trim().slice(0, 32);
    if (!username) return;
    const reconnected = state.disconnectedPlayers.get(username);
    if (reconnected) {
      state.disconnectedPlayers.delete(username);
      state.players.set(socket.id, { id: socket.id, name: username, isManager: reconnected.isManager });
      if (reconnected.role) state.roles[socket.id] = reconnected.role;
      logChat(`[System] ${username} reconnected.`);
    } else {
      state.players.set(socket.id, { id: socket.id, name: username, isManager: false });
      logChat(`[System] ${username} joined.`);
    }
    broadcastState();
  });

  socket.on("manager_login", (password) => {
    if (password === MANAGER_PASSWORD) {
      const p = state.players.get(socket.id);
      if (p) {
        p.isManager = true;
        logChat(`[System] ${p.name} is now the game manager.`);
        broadcastState();
      }
    }
  });

  socket.on("set_role_count", (data) => {
    const p = state.players.get(socket.id);
    if (!p?.isManager || state.phase !== "setup") return;
    const { role, count } = data;
    if (ROLES[role] != null && Number.isInteger(count) && count >= 0) {
      state.roleCounts[role] = count;
      broadcastState();
    }
  });

  socket.on("set_missions", (missions) => {
    const p = state.players.get(socket.id);
    if (!p?.isManager || state.phase !== "setup") return;
    if (Array.isArray(missions)) {
      state.missions = missions.filter((m) => m && Number.isInteger(m.participants) && Number.isInteger(m.failsRequired) && m.participants > 0 && m.failsRequired >= 0);
      broadcastState();
    }
  });

  socket.on("set_vote_time", (seconds) => {
    const p = state.players.get(socket.id);
    if (!p?.isManager || state.phase !== "setup") return;
    const s = parseInt(seconds, 10);
    if (!isNaN(s) && s >= 10 && s <= 300) {
      state.voteTimeSeconds = s;
      broadcastState();
    }
  });

  socket.on("set_phase", (phase) => {
    const p = state.players.get(socket.id);
    if (!p?.isManager) return;
    if (phase === "setup") {
      state.phase = "setup";
      state.roleCounts = {};
      if (!state.missions.length) state.missions = [{ participants: 2, failsRequired: 1 }, { participants: 2, failsRequired: 1 }, { participants: 2, failsRequired: 1 }, { participants: 3, failsRequired: 1 }, { participants: 3, failsRequired: 1 }];
      state.roles = {};
      state.missionHistory = [];
      state.proposedTeam = [];
      state.teamVotes = {};
      state.missionVotes = {};
      logChat("[System] Entering setup. Manager can configure roles and missions.");
    } else if (phase === "lobby") {
      state.phase = "lobby";
      state.disconnectedPlayers.clear();
      state.missionHistory = [];
      state.proposedTeam = [];
      state.teamVotes = {};
      state.missionVotes = {};
      logChat("[System] Back to lobby. Waiting for players.");
    }
    broadcastState();
  });

  socket.on("start_game", () => {
    const p = state.players.get(socket.id);
    if (!p?.isManager) return;
    if (state.phase === "lobby" || state.phase === "setup") {
      startGame();
    }
  });

  socket.on("reset_game", () => {
    const p = state.players.get(socket.id);
    if (!p?.isManager) return;
    state.phase = "lobby";
    state.roles = {};
    state.disconnectedPlayers.clear();
    state.missions = state.missions.length ? state.missions : [];
    state.missionHistory = [];
    state.currentMissionIndex = 0;
    state.leaderIndex = 0;
    state.proposedTeam = [];
    state.pendingTeam = [];
    state.teamVotes = {};
    state.missionVotes = {};
    state.townWins = 0;
    state.mafiaWins = 0;
    state.consecutiveRejections = 0;
    logChat("[System] Game reset by manager.");
    broadcastState();
  });

  socket.on("update_pending_team", (teamPlayerIds) => {
    if (state.phase !== "team_selection") return;
    const playerIds = Array.from(state.players.keys());
    const leaderId = playerIds[state.leaderIndex];
    if (socket.id !== leaderId) return;
    const mission = state.missions[state.currentMissionIndex];
    if (!mission) return;
    if (Array.isArray(teamPlayerIds) && teamPlayerIds.length <= mission.participants && teamPlayerIds.every((id) => state.players.has(id))) {
      state.pendingTeam = teamPlayerIds;
      broadcastState();
    }
  });

  socket.on("propose_team", (teamPlayerIds) => {
    if (state.phase !== "team_selection") return;
    const playerIds = Array.from(state.players.keys());
    const leaderId = playerIds[state.leaderIndex];
    if (socket.id !== leaderId) return;
    const mission = state.missions[state.currentMissionIndex];
    if (!mission) return;
    const valid = Array.isArray(teamPlayerIds) && teamPlayerIds.length === mission.participants && teamPlayerIds.every((id) => state.players.has(id));
    if (valid) {
      state.proposedTeam = teamPlayerIds;
      state.pendingTeam = [];
      if (state.consecutiveRejections >= 4) {
        state.consecutiveRejections = 0;
        state.phase = "mission_vote";
        state.missionVotes = {};
        state.missionVoteDeadline = Date.now() + state.voteTimeSeconds * 1000;
        logChat("[System] Fifth team in a row — auto-approved. Mission members: choose SUCCEED or FAIL. You have " + state.voteTimeSeconds + " seconds.");
        if (state.missionVoteTimer) clearTimeout(state.missionVoteTimer);
        state.missionVoteTimer = setTimeout(() => {
          if (state.phase === "mission_vote") resolveMission();
        }, state.voteTimeSeconds * 1000);
      } else {
        runTeamVote();
      }
    }
    broadcastState();
  });

  socket.on("team_vote", (approve) => {
    if (state.phase !== "team_vote") return;
    state.teamVotes[socket.id] = !!approve;
    const voted = Object.keys(state.teamVotes).length;
    if (voted === state.players.size) {
      countTeamVotes();
    }
    broadcastState();
  });

  socket.on("mission_vote", (choice) => {
    if (state.phase !== "mission_vote") return;
    if (!state.proposedTeam.includes(socket.id)) return;
    if (choice !== "succeed" && choice !== "fail") return;
    state.missionVotes[socket.id] = choice;
    broadcastState();
    checkMissionVotesComplete();
  });

  socket.on("assassin_guess", (targetPlayerId) => {
    if (state.phase !== "assassin") return;
    const myRole = state.roles[socket.id];
    if (myRole !== "assassin") return;
    if (!state.assassinGuessPlayerIds) state.assassinGuessPlayerIds = [];
    if (!state.assassinGuessPlayerIds.includes(targetPlayerId)) {
      state.assassinGuessPlayerIds.push(targetPlayerId);
    }
    if (state.roles[targetPlayerId] === "merlin") {
      state.phase = "game_over";
      state.winner = "mafia";
      state.assassinGuessedCorrectly = true;
      logChat("[System] Assassin guessed Merlin! Mafia wins!");
    } else {
      state.phase = "game_over";
      state.winner = "town";
      state.assassinGuessedCorrectly = false;
      logChat("[System] Assassin guessed wrong. Town wins!");
    }
    broadcastState();
  });

  socket.on("chat", (text) => {
    const p = state.players.get(socket.id);
    if (!p || !text) return;
    const msg = `[${p.name}] ${String(text).slice(0, 200)}`;
    logChat(msg);
  });

  socket.on("disconnect", () => {
    const p = state.players.get(socket.id);
    if (p) {
      state.disconnectedPlayers.set(p.name, { name: p.name, isManager: p.isManager, role: state.roles[socket.id] });
      logChat(`[System] ${p.name} disconnected. Reconnect with the same name to rejoin.`);
    }
    state.players.delete(socket.id);
    delete state.roles[socket.id];
    broadcastState();
  });
});

const PORT = process.env.PORT || 13579;
server.listen(PORT, () => {
  console.log("Avalon server on http://localhost:" + PORT);
});
