import React, { useState, useEffect, useMemo, useRef } from "react";
import { Play, Pause, RotateCcw, X, Users, Target, Calendar, MapPin, Plus, Trash2, ArrowRight, BarChart3, Video, Star, Download, Upload, List } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const FONT_STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Work+Sans:wght@400;500;600&family=JetBrains+Mono:wght@500;700&display=swap');
.font-display { font-family: 'Oswald', sans-serif; }
.font-body { font-family: 'Work Sans', sans-serif; }
.font-mono { font-family: 'JetBrains Mono', monospace; }
`;

const COLORS = {
  bg: "#10161d",
  surface: "#1a2330",
  surfaceLight: "#232f3f",
  line: "#2d3a4a",
  gold: "#f2b705",
  teal: "#2bb673",
  coral: "#e8604a",
  amber: "#e0a940",
  text: "#edeff2",
  muted: "#8a93a0",
};

const INITIAL = {
  us: [
    { num: 1, name: "GK 中村", pos: "GK", onCourt: true, sub: 0, total: 0, stints: [] },
    { num: 4, name: "佐藤", pos: "LW", onCourt: true, sub: 0, total: 0, stints: [] },
    { num: 7, name: "田中", pos: "LB", onCourt: true, sub: 0, total: 0, stints: [] },
    { num: 9, name: "鈴木", pos: "CB", onCourt: true, sub: 0, total: 0, stints: [] },
    { num: 11, name: "高橋", pos: "RB", onCourt: true, sub: 0, total: 0, stints: [] },
    { num: 14, name: "伊藤", pos: "RW", onCourt: true, sub: 0, total: 0, stints: [] },
    { num: 20, name: "渡辺", pos: "PV", onCourt: true, sub: 0, total: 0, stints: [] },
    { num: 2, name: "GK 山本", pos: "GK", onCourt: false, sub: null, total: 0, stints: [] },
    { num: 5, name: "小林", pos: "LB", onCourt: false, sub: null, total: 0, stints: [] },
    { num: 8, name: "加藤", pos: "CB", onCourt: false, sub: null, total: 0, stints: [] },
    { num: 12, name: "吉田", pos: "RW", onCourt: false, sub: null, total: 0, stints: [] },
    { num: 17, name: "山田", pos: "PV", onCourt: false, sub: null, total: 0, stints: [] },
  ],
  them: [
    { num: 1, name: "", pos: "GK", onCourt: true, sub: 0, total: 0, stints: [] },
    { num: 6, name: "", pos: "LW", onCourt: true, sub: 0, total: 0, stints: [] },
    { num: 10, name: "", pos: "LB", onCourt: true, sub: 0, total: 0, stints: [] },
    { num: 13, name: "", pos: "CB", onCourt: true, sub: 0, total: 0, stints: [] },
    { num: 15, name: "", pos: "RB", onCourt: true, sub: 0, total: 0, stints: [] },
    { num: 19, name: "", pos: "RW", onCourt: true, sub: 0, total: 0, stints: [] },
    { num: 22, name: "", pos: "PV", onCourt: true, sub: 0, total: 0, stints: [] },
    { num: 3, name: "", pos: "GK", onCourt: false, sub: null, total: 0, stints: [] },
    { num: 8, name: "", pos: "-", onCourt: false, sub: null, total: 0, stints: [] },
    { num: 16, name: "", pos: "-", onCourt: false, sub: null, total: 0, stints: [] },
  ],
};

const DEFAULT_TEAM_NAMES = { us: "チームA", them: "チームB" };

// シュートを打った場所:9m以内5ゾーン+9m以遠3ゾーン(実コートに近いレイアウト、ラベルは画面に出さない)
const INNER_ZONE_NAMES = ["左サイドエリア", "左45カットイン/ポストエリア", "センターカットイン/ポストエリア", "右45カットイン/ポストエリア", "右サイドエリア"];
const OUTER_ZONE_NAMES = ["左45ロングシュートエリア", "センターロングシュートエリア", "右45ロングシュートエリア"];

// コート図の座標(入力画面・詳細表示の両方で共通利用)
const COURT_ZONE_POSITIONS = [
  { name: INNER_ZONE_NAMES[0], x: 10, y: 16, w: 18, h: 20 },
  { name: INNER_ZONE_NAMES[1], x: 28, y: 27, w: 20, h: 20 },
  { name: INNER_ZONE_NAMES[2], x: 50, y: 22, w: 20, h: 20 },
  { name: INNER_ZONE_NAMES[3], x: 72, y: 27, w: 20, h: 20 },
  { name: INNER_ZONE_NAMES[4], x: 90, y: 16, w: 18, h: 20 },
  { name: OUTER_ZONE_NAMES[0], x: 22, y: 60, w: 26, h: 30 },
  { name: OUTER_ZONE_NAMES[1], x: 50, y: 68, w: 26, h: 30 },
  { name: OUTER_ZONE_NAMES[2], x: 78, y: 60, w: 26, h: 30 },
];

// ゴールのコース:枠内3x3(短縮コード)+ 枠外(周囲の簡易ゾーン)
const GOAL_ZONES = [
  { code: "TL", label: "上左" }, { code: "TM", label: "上中" }, { code: "TR", label: "上右" },
  { code: "ML", label: "中左" }, { code: "C", label: "中央" }, { code: "MR", label: "中右" },
  { code: "BL", label: "下左" }, { code: "BM", label: "下中" }, { code: "BR", label: "下右" },
];
const OFF_TARGET_ZONES = [
  { code: "OTL", label: "上左外" }, { code: "OT", label: "上外" }, { code: "OTR", label: "上右外" },
  { code: "OL", label: "左外" }, { code: "OW", label: "大きく外れ" }, { code: "OR", label: "右外" },
  { code: "OBL", label: "下左外" }, { code: "OB", label: "下外" }, { code: "OBR", label: "下右外" },
];

// シュートの種類
const SHOT_TYPES = ["ディスタンスシュート", "カットイン", "サイドシュート", "ポストシュート", "7m", "速攻", "エンプティー"];

// 場面(オフェンスの状況)
const SITUATIONS = ["セットオフェンス", "1次速攻", "2次速攻", "3次速攻", "リスタート"];

// ターンオーバーの種類
const TURNOVER_TYPES = ["ステップ", "パスミス", "キャッチミス", "チャージ", "ドリブルミス", "キック", "ラインクロス"];

// OF/DF固定ペア(登録制)。試合前に組み合わせを決めておき、一括交代ボタンで入れ替える想定
const PAIRS_INITIAL = {
  us: [
    { id: "p1", a: 9, b: 8 },   // CB: 鈴木(OF) ⇄ 加藤(DF)
    { id: "p2", a: 20, b: 17 }, // PV: 渡辺(OF) ⇄ 山田(DF)
  ],
  them: [],
};

function parseYouTubeId(url) {
  if (!url) return "";
  const trimmed = url.trim();
  const m = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{6,})/);
  if (m) return m[1];
  if (/^[a-zA-Z0-9_-]{6,}$/.test(trimmed)) return trimmed;
  return "";
}

// "1:23:45" や "32:10" のような時間表記を秒数に変換する
function parseTimeToSeconds(str) {
  if (!str) return 0;
  const parts = String(str).split(":").map((s) => Number(s.trim()));
  if (parts.some((n) => isNaN(n))) return 0;
  let sec = 0;
  for (const p of parts) sec = sec * 60 + p;
  return Math.max(0, sec);
}

function fmt(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}
function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// ローカルストレージへの保存(実際にブラウザにインストールして使うWebアプリのため、
// リロードしても試合データが消えないようにする)
const STORAGE_KEY = "handball_app_match_v1";
const ARCHIVE_KEY = "courteye_archive_v1"; // 過去の試合を溜めていくアーカイブ(同じ端末内)

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function loadArchive() {
  try {
    const raw = localStorage.getItem(ARCHIVE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function HandballLiveInput() {
  const saved = loadSaved();
  const [step, setStep] = useState(saved?.step ?? "setup"); // setup | live | dashboard | archive
  const [archive, setArchive] = useState(() => loadArchive());
  const [scoutingOpponent, setScoutingOpponent] = useState(null);
  const [dashboardTab, setDashboardTab] = useState("summary"); // summary | players | timeline
  const [dashboardTeamView, setDashboardTeamView] = useState("us");
  const [playerDetailOpen, setPlayerDetailOpen] = useState(null); // { team, num, name }
  const [kpiDetailOpen, setKpiDetailOpen] = useState(null); // "shotPct" | "savePct" | "turnover"
  const [matchMemo, setMatchMemo] = useState(saved?.matchMemo ?? "");
  const [playerMemos, setPlayerMemos] = useState(saved?.playerMemos ?? {}); // { "us_9": "メモ..." }
  const [kpiSituationDrill, setKpiSituationDrill] = useState(null); // 選択中の場面(ドリルダウン先)
  const [matchInfo, setMatchInfo] = useState(saved?.matchInfo ?? { date: "", venue: "", videoUrl: "", videoOffsetText: "0:00", videoOffset2Text: "0:00", halfBoundaryText: "30:00", videoLeadSec: 5 });
  const [videoSeekSec, setVideoSeekSec] = useState(0);
  const [videoSeekKey, setVideoSeekKey] = useState(0);
  const [roster, setRoster] = useState(saved?.roster ?? INITIAL);
  const [teamNames, setTeamNames] = useState(saved?.teamNames ?? DEFAULT_TEAM_NAMES);
  const [pairs, setPairs] = useState(saved?.pairs ?? PAIRS_INITIAL);
  const [team, setTeam] = useState("us"); // which team's roster is shown for input
  const [score, setScore] = useState(saved?.score ?? { us: 0, them: 0 });
  const [elapsed, setElapsed] = useState(saved?.elapsed ?? 0);
  const [running, setRunning] = useState(false);
  const [events, setEvents] = useState(saved?.events ?? []); // {id, ts, team, cat, type, label, playerNum, playerName}
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState(null);
  const [subPicking, setSubPicking] = useState(false);
  const [shotDetailOpen, setShotDetailOpen] = useState(false);
  const [turnoverDetailOpen, setTurnoverDetailOpen] = useState(false);
  const [situationOpen, setSituationOpen] = useState(false);
  const [pendingShot, setPendingShot] = useState(null); // { cat, type, label, playerNum, playerName, location, course, situation }
  const [pairEditOpen, setPairEditOpen] = useState(false);
  const [newPairA, setNewPairA] = useState("");
  const [newPairB, setNewPairB] = useState("");
  const [toast, setToast] = useState("");
  const [showOnlyMarked, setShowOnlyMarked] = useState(false);
  const [timeEditOpen, setTimeEditOpen] = useState(false);
  const [timeEditMin, setTimeEditMin] = useState("0");
  const [timeEditSec, setTimeEditSec] = useState("0");
  const toastTimer = useRef(null);
  const fileInputRef = useRef(null);

  // 試合データが変わるたびにローカルストレージへ自動保存(リロードしても消えない)
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ step, matchInfo, roster, teamNames, pairs, score, elapsed, events, matchMemo, playerMemos })
      );
    } catch {
      // 保存に失敗しても致命的ではないため何もしない
    }
  }, [step, matchInfo, roster, teamNames, pairs, score, elapsed, events, matchMemo, playerMemos]);

  // 今の試合データをアーカイブ(過去の試合一覧)に追加保存する
  function archiveCurrentMatch() {
    const hasData = events.length > 0 || score.us > 0 || score.them > 0;
    if (!hasData) return;
    const record = {
      id: `m_${Date.now()}`,
      savedAt: new Date().toISOString(),
      matchInfo, roster, teamNames, pairs, score, elapsed, events, matchMemo, playerMemos,
    };
    setArchive((arc) => {
      const next = [record, ...arc];
      try {
        localStorage.setItem(ARCHIVE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }

  function deleteArchivedMatch(id) {
    setArchive((arc) => {
      const next = arc.filter((m) => m.id !== id);
      try {
        localStorage.setItem(ARCHIVE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }

  function loadArchivedMatch(record) {
    setMatchInfo(record.matchInfo ?? { date: "", venue: "", videoUrl: "", videoOffsetText: "0:00", videoOffset2Text: "0:00", halfBoundaryText: "30:00", videoLeadSec: 5 });
    setRoster(record.roster ?? INITIAL);
    setTeamNames(record.teamNames ?? DEFAULT_TEAM_NAMES);
    setPairs(record.pairs ?? PAIRS_INITIAL);
    setScore(record.score ?? { us: 0, them: 0 });
    setElapsed(record.elapsed ?? 0);
    setEvents(record.events ?? []);
    setMatchMemo(record.matchMemo ?? "");
    setPlayerMemos(record.playerMemos ?? {});
    setHistory([]);
    setStep("dashboard");
  }

  function clearSavedMatch() {
    archiveCurrentMatch(); // 新しい試合を始める前に、今の試合を自動でアーカイブに残す
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setStep("setup");
    setMatchInfo({ date: "", venue: "", videoUrl: "", videoOffsetText: "0:00", videoOffset2Text: "0:00", halfBoundaryText: "30:00", videoLeadSec: 5 });
    setRoster(INITIAL);
    setTeamNames(DEFAULT_TEAM_NAMES);
    setPairs(PAIRS_INITIAL);
    setScore({ us: 0, them: 0 });
    setElapsed(0);
    setEvents([]);
    setMatchMemo("");
    setPlayerMemos({});
    setHistory([]);
  }

  // 試合データをJSONファイルとして書き出す(他の端末・他の人と共有するため)
  function exportMatchData() {
    const data = { matchInfo, roster, teamNames, pairs, score, elapsed, events, matchMemo, playerMemos, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const dateStr = (matchInfo.date || "no-date").replaceAll("-", "");
    const safeUs = (teamNames.us || "us").replace(/[^\w\u3040-\u30FF\u4E00-\u9FFF]/g, "");
    const safeThem = (teamNames.them || "them").replace(/[^\w\u3040-\u30FF\u4E00-\u9FFF]/g, "");
    a.href = url;
    a.download = `courteye_${dateStr}_${safeUs}vs${safeThem}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("データを書き出しました");
  }

  // 書き出したJSONファイルを読み込んで、その試合データを復元する
  function importMatchData(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        setMatchInfo(data.matchInfo ?? { date: "", venue: "", videoUrl: "", videoOffsetText: "0:00", videoOffset2Text: "0:00", halfBoundaryText: "30:00", videoLeadSec: 5 });
        setRoster(data.roster ?? INITIAL);
        setTeamNames(data.teamNames ?? DEFAULT_TEAM_NAMES);
        setPairs(data.pairs ?? PAIRS_INITIAL);
        setScore(data.score ?? { us: 0, them: 0 });
        setElapsed(data.elapsed ?? 0);
        setEvents(data.events ?? []);
        setMatchMemo(data.matchMemo ?? "");
        setPlayerMemos(data.playerMemos ?? {});
        setHistory([]);
        showToast("データを読み込みました");
        setStep("dashboard");
      } catch {
        window.alert("ファイルの読み込みに失敗しました。正しいCourtEyeのデータファイル(.json)か確認してください。");
      }
    };
    reader.readAsText(file);
  }

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  // モーダル/ボトムシートが開いている間は、ページを先頭に固定し背景スクロールをロックする
  // (背景がスクロールした状態のまま fixed オーバーレイを開くと、上部が見切れて操作できなくなることがあるための対策)
  useEffect(() => {
    const anyModalOpen =
      !!selected || subPicking || shotDetailOpen || situationOpen || turnoverDetailOpen || pairEditOpen || !!playerDetailOpen || !!kpiDetailOpen || timeEditOpen;
    if (anyModalOpen) {
      window.scrollTo(0, 0);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selected, subPicking, shotDetailOpen, situationOpen, turnoverDetailOpen, pairEditOpen, playerDetailOpen, kpiDetailOpen, timeEditOpen]);

  const statsByTeam = useMemo(() => {
    const base = () => ({ made: 0, attempts: 0, turnovers: 0, twoMin: 0, warnings: 0, savedByGK: 0, concededGoals: 0 });
    const s = { us: base(), them: base() };
    for (const e of events) {
      const own = s[e.team];
      const opp = s[e.team === "us" ? "them" : "us"];
      if (e.cat === "shot") {
        own.attempts++;
        if (e.type === "goal") { own.made++; opp.concededGoals++; }
        if (e.type === "saved") opp.savedByGK++;
      }
      if (e.cat === "turnover") own.turnovers++;
      if (e.cat === "twoMin") own.twoMin++;
      if (e.cat === "warning") own.warnings++;
    }
    for (const t of ["us", "them"]) {
      s[t].shotPct = s[t].attempts ? Math.round((s[t].made / s[t].attempts) * 100) : null;
      const faced = s[t].savedByGK + s[t].concededGoals;
      s[t].savePct = faced ? Math.round((s[t].savedByGK / faced) * 100) : null;
      const toTotal = s[t].attempts + s[t].turnovers;
      s[t].turnoverPct = toTotal ? Math.round((s[t].turnovers / toTotal) * 100) : null;
    }
    return s;
  }, [events]);

  // 選手別スタッツ(両チーム、実データから集計)
  const playerStatsByTeam = useMemo(() => {
    const allGoals = events.filter((e) => e.cat === "shot" && e.type === "goal");
    const build = (t) =>
      roster[t].map((p) => {
        const mine = events.filter((e) => e.team === t && e.playerNum === p.num);
        const goals = mine.filter((e) => e.cat === "shot" && e.type === "goal").length;
        const shots = mine.filter((e) => e.cat === "shot").length;
        const turnovers = mine.filter((e) => e.cat === "turnover").length;
        const warnings = mine.filter((e) => e.cat === "warning").length;
        const twoMin = mine.filter((e) => e.cat === "twoMin").length;
        const playSec = p.total + (p.onCourt && p.sub != null ? elapsed - p.sub : 0);
        const allStints = [...(p.stints || []), ...(p.onCourt && p.sub != null ? [{ start: p.sub, end: elapsed }] : [])];
        // プラスマイナス:この選手の出場区間中に、自チームが決めた/相手が決めた得点の差
        let plusMinus = 0;
        for (const g of allGoals) {
          const onCourtAtGoal = allStints.some((s) => g.ts >= s.start && g.ts <= s.end);
          if (!onCourtAtGoal) continue;
          plusMinus += g.team === t ? 1 : -1;
        }
        return { ...p, goals, shots, turnovers, warnings, twoMin, playSec, allStints, plusMinus };
      });
    return { us: build("us"), them: build("them") };
  }, [roster, events, elapsed]);

  // GKスタッツ(相手の被シュートを、そのチームのGK陣でプレー時間の割合に応じて按分)
  const gkStatsByTeam = useMemo(() => {
    const build = (t) => {
      const opp = t === "us" ? "them" : "us";
      const oppShots = events.filter((e) => e.team === opp && e.cat === "shot" && (e.type === "goal" || e.type === "saved"));
      const facedTotal = oppShots.length;
      const savesTotal = oppShots.filter((e) => e.type === "saved").length;
      const gks = playerStatsByTeam[t].filter((p) => p.pos === "GK");
      const totalGkTime = gks.reduce((sum, g) => sum + g.playSec, 0) || 1;
      return gks.map((g) => {
        const share = g.playSec / totalGkTime;
        return {
          ...g,
          shotsFaced: Math.round(facedTotal * share),
          saves: Math.round(savesTotal * share),
        };
      });
    };
    return { us: build("us"), them: build("them") };
  }, [playerStatsByTeam, events]);

  // 得点経過(両チームの得点イベントから累積スコアの推移を作成)
  const scoreProgression = useMemo(() => {
    const goals = events
      .filter((e) => e.cat === "shot" && e.type === "goal")
      .slice()
      .sort((a, b) => a.ts - b.ts);
    let us = 0, them = 0;
    const points = [{ sec: 0, us: 0, them: 0 }];
    for (const g of goals) {
      if (g.team === "us") us++; else them++;
      points.push({ sec: g.ts, us, them });
    }
    points.push({ sec: elapsed, us, them });
    return points;
  }, [events, elapsed]);

  // 場面(situation)別の内訳:シュート成功率・GKセーブ率・ターンオーバー率
  const situationBreakdown = useMemo(() => {
    const build = (metric) => {
      return SITUATIONS.map((s) => {
        const row = { situation: s };
        for (const t of ["us", "them"]) {
          if (metric === "turnover") {
            const mine = events.filter((e) => e.team === t && e.situation === s && (e.cat === "shot" || e.cat === "turnover"));
            const to = mine.filter((e) => e.cat === "turnover").length;
            const att = mine.filter((e) => e.cat === "shot").length;
            const total = to + att;
            row[t] = { count: to, pct: total ? Math.round((to / total) * 100) : null };
          } else if (metric === "savePct") {
            const opp = t === "us" ? "them" : "us";
            const mine = events.filter((e) => e.team === opp && e.situation === s && e.cat === "shot" && (e.type === "goal" || e.type === "saved"));
            const saves = mine.filter((e) => e.type === "saved").length;
            row[t] = { count: saves, pct: mine.length ? Math.round((saves / mine.length) * 100) : null };
          } else {
            const mine = events.filter((e) => e.team === t && e.situation === s && e.cat === "shot");
            const made = mine.filter((e) => e.type === "goal").length;
            row[t] = { count: made, pct: mine.length ? Math.round((made / mine.length) * 100) : null };
          }
        }
        return row;
      });
    };
    return { shotPct: build("shotPct"), savePct: build("savePct"), turnover: build("turnover") };
  }, [events]);

  // 特定の場面(situation)に絞った内訳(シュートの種類 or ターンオーバーの種類)
  const drillBreakdown = useMemo(() => {
    if (!kpiSituationDrill) return [];
    if (kpiDetailOpen === "turnover") {
      return TURNOVER_TYPES.map((type) => {
        const row = { type };
        for (const t of ["us", "them"]) {
          const mine = events.filter((e) => e.team === t && e.cat === "turnover" && e.situation === kpiSituationDrill && e.turnoverType === type);
          row[t] = { count: mine.length };
        }
        return row;
      }).filter((row) => row.us.count > 0 || row.them.count > 0);
    }
    return SHOT_TYPES.map((type) => {
      const row = { type };
      for (const t of ["us", "them"]) {
        const teamForShots = kpiDetailOpen === "savePct" ? (t === "us" ? "them" : "us") : t;
        const mine = events.filter((e) => e.team === teamForShots && e.cat === "shot" && e.situation === kpiSituationDrill && e.shotType === type);
        const made = mine.filter((e) => e.type === (kpiDetailOpen === "savePct" ? "saved" : "goal")).length;
        row[t] = { count: made, attempts: mine.length, pct: mine.length ? Math.round((made / mine.length) * 100) : null };
      }
      return row;
    }).filter((row) => row.us.attempts > 0 || row.them.attempts > 0);
  }, [events, kpiSituationDrill, kpiDetailOpen]);

  const videoId = parseYouTubeId(matchInfo.videoUrl);

  function jumpToVideo(ts) {
    const boundary = parseTimeToSeconds(matchInfo.halfBoundaryText);
    const isSecondHalf = boundary > 0 && ts >= boundary;
    const offset = isSecondHalf ? parseTimeToSeconds(matchInfo.videoOffset2Text) : parseTimeToSeconds(matchInfo.videoOffsetText);
    const lead = Number(matchInfo.videoLeadSec) || 0;
    const sec = Math.max(0, Math.floor(ts + offset - lead));
    setVideoSeekSec(sec);
    setVideoSeekKey((k) => k + 1);
    setDashboardTab("video");
  }

  function toggleMark(id) {
    setEvents((ev) => ev.map((e) => (e.id === id ? { ...e, marked: !e.marked } : e)));
  }

  function adjustElapsed(deltaSec) {
    setElapsed((e) => Math.max(0, e + deltaSec));
    showToast(`${deltaSec > 0 ? "+" : ""}${deltaSec}秒 調整しました`);
  }

  function openTimeEdit() {
    setTimeEditMin(String(Math.floor(elapsed / 60)));
    setTimeEditSec(String(elapsed % 60));
    setTimeEditOpen(true);
  }

  function applyTimeEdit() {
    const m = Math.max(0, Number(timeEditMin) || 0);
    const s = Math.max(0, Math.min(59, Number(timeEditSec) || 0));
    setElapsed(m * 60 + s);
    setTimeEditOpen(false);
    showToast("試合時間を設定しました");
  }

  function showToast(msg) {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 1400);
  }

  function pushHistory() {
    setHistory((h) => [...h, clone({ roster, score, events })].slice(-30));
  }

  function undo() {
    setHistory((h) => {
      if (h.length === 0) return h;
      const prev = h[h.length - 1];
      setRoster(prev.roster);
      setScore(prev.score);
      setEvents(prev.events);
      showToast("元に戻しました");
      return h.slice(0, -1);
    });
  }

  function logEvent(cat, type, label, playerNum, playerName, extra = {}) {
    pushHistory();
    setEvents((ev) => [
      { id: Date.now() + Math.random(), ts: elapsed, team, cat, type, label, playerNum, playerName, ...extra },
      ...ev,
    ]);
    if (cat === "shot" && type === "goal") {
      setScore((s) => ({ ...s, [team]: s[team] + 1 }));
    }
    setSelected(null);
    setShotDetailOpen(false);
    setSituationOpen(false);
    setTurnoverDetailOpen(false);
    setPendingShot(null);
    showToast(`[${teamNames[team]}] ${label}`);
  }

  function swapOne(t, num, players) {
    const p = players.find((pl) => pl.num === num);
    if (!p) return p;
    if (p.onCourt) {
      const gained = p.sub != null ? elapsed - p.sub : 0;
      const stints = p.sub != null ? [...(p.stints || []), { start: p.sub, end: elapsed }] : (p.stints || []);
      return { ...p, onCourt: false, sub: null, total: p.total + gained, stints };
    }
    return { ...p, onCourt: true, sub: elapsed };
  }

  function swapPair(pair) {
    pushHistory();
    setRoster((r) => ({
      ...r,
      [team]: r[team].map((p) => {
        if (p.num === pair.a || p.num === pair.b) return swapOne(team, p.num, r[team]);
        return p;
      }),
    }));
    showToast(`#${pair.a} ⇄ #${pair.b} を交代しました`);
  }

  function swapAllPairs() {
    if (!pairs[team] || pairs[team].length === 0) return;
    pushHistory();
    setRoster((r) => {
      const nums = new Set(pairs[team].flatMap((pr) => [pr.a, pr.b]));
      return {
        ...r,
        [team]: r[team].map((p) => (nums.has(p.num) ? swapOne(team, p.num, r[team]) : p)),
      };
    });
    showToast("登録ペアを一括交代しました");
  }

  function addPair() {
    const a = Number(newPairA), b = Number(newPairB);
    if (!a || !b || a === b) return;
    setPairs((ps) => ({
      ...ps,
      [team]: [...(ps[team] || []), { id: `p_${Date.now()}`, a, b }],
    }));
    setNewPairA("");
    setNewPairB("");
  }

  function removePair(id) {
    setPairs((ps) => ({ ...ps, [team]: ps[team].filter((p) => p.id !== id) }));
  }

  function updatePlayerField(t, idx, field, value) {
    setRoster((r) => ({
      ...r,
      [t]: r[t].map((p, i) => (i === idx ? { ...p, [field]: field === "num" ? (value === "" ? "" : Number(value)) : value } : p)),
    }));
  }

  function toggleStarter(t, idx) {
    setRoster((r) => ({
      ...r,
      [t]: r[t].map((p, i) => {
        if (i !== idx) return p;
        const onCourt = !p.onCourt;
        return { ...p, onCourt, sub: onCourt ? 0 : null };
      }),
    }));
  }

  function addPlayerRow(t) {
    setRoster((r) => ({ ...r, [t]: [...r[t], { num: "", name: "", pos: "-", onCourt: false, sub: null, total: 0, stints: [] }] }));
  }

  function removePlayerRow(t, idx) {
    setRoster((r) => ({ ...r, [t]: r[t].filter((_, i) => i !== idx) }));
  }

  function doSub(outNum, inNum) {
    pushHistory();
    setRoster((r) => ({
      ...r,
      [team]: r[team].map((p) => {
        if (p.num === outNum) {
          const gained = p.sub != null ? elapsed - p.sub : 0;
          const stints = p.sub != null ? [...(p.stints || []), { start: p.sub, end: elapsed }] : (p.stints || []);
          return { ...p, onCourt: false, sub: null, total: p.total + gained, stints };
        }
        if (p.num === inNum) return { ...p, onCourt: true, sub: elapsed };
        return p;
      }),
    }));
    setSubPicking(false);
    setSelected(null);
    showToast("交代しました");
  }

  const players = roster[team];
  const onCourt = players.filter((p) => p.onCourt);
  const bench = players.filter((p) => !p.onCourt);

  const actionButtons = [
    { cat: "shot", type: "goal", label: "得点", color: COLORS.teal },
    { cat: "shot", type: "miss", label: "枠外", color: COLORS.muted },
    { cat: "shot", type: "blocked", label: "ブロック", color: COLORS.muted },
    { cat: "shot", type: "saved", label: "セーブ", color: COLORS.muted },
    { cat: "turnover", type: "turnover", label: "ターンオーバー", color: COLORS.coral },
    { cat: "warning", type: "warning", label: "警告", color: COLORS.amber },
    { cat: "twoMin", type: "twoMin", label: "2分退場", color: COLORS.coral },
  ];

  if (step === "setup") {
    const POS_OPTIONS = ["GK", "LW", "LB", "CB", "RB", "RW", "PV", "-"];
    return (
      <div className="font-body min-h-screen w-full flex flex-col" style={{ background: COLORS.bg, color: COLORS.text }}>
        <style>{FONT_STYLE}</style>

        <div className="sticky top-0 z-10 px-4 pt-5 pb-4 flex items-center justify-between" style={{ background: COLORS.surface, borderBottom: `1px solid ${COLORS.line}` }}>
          <div>
            <div className="font-display font-bold text-2xl">試合設定</div>
            <div className="text-xs mt-1" style={{ color: COLORS.muted }}>チーム名・選手・日時を入力してから試合を開始します</div>
          </div>
          {(events.length > 0 || score.us > 0 || score.them > 0) && (
            <button
              onClick={() => { if (window.confirm("保存されている試合データを消して、新しい試合を始めますか?")) clearSavedMatch(); }}
              className="text-[10px] px-2 py-1 rounded flex-shrink-0"
              style={{ background: COLORS.surfaceLight, color: COLORS.coral, border: `1px solid ${COLORS.line}` }}
            >
              新しい試合を始める
            </button>
          )}
        </div>

        <div className="px-4 pt-2 space-y-2">
          <div className="text-[10px] rounded-lg px-3 py-2" style={{ background: COLORS.surfaceLight, color: COLORS.muted }}>
            💾 入力したデータはこの端末に自動保存されます。ページを閉じても消えません。
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setStep("archive")}
              className="flex-1 flex items-center justify-center gap-1 text-xs font-display font-semibold py-2 rounded-lg"
              style={{ background: COLORS.gold, color: COLORS.bg }}
            >
              <List size={13} /> 試合一覧を見る({archive.length})
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportMatchData}
              className="flex-1 flex items-center justify-center gap-1 text-xs font-display font-semibold py-2 rounded-lg"
              style={{ background: COLORS.surfaceLight, color: COLORS.gold, border: `1px solid ${COLORS.line}` }}
            >
              <Download size={13} /> データを書き出す
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-1 text-xs font-display font-semibold py-2 rounded-lg"
              style={{ background: COLORS.surfaceLight, color: COLORS.teal, border: `1px solid ${COLORS.line}` }}
            >
              <Upload size={13} /> データを読み込む
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) importMatchData(file);
                e.target.value = "";
              }}
            />
          </div>
          <div className="text-[9px] px-1" style={{ color: COLORS.muted }}>
            「書き出す」で試合データをファイル(.json)として保存でき、他の人にLINE等で送って「読み込む」で共有できます。試合ごとにファイルを残しておけば、複数試合のアーカイブとしても使えます。
          </div>
        </div>

        <div className="p-4 space-y-5 pb-28">
          {/* Date / Venue */}
          <div className="rounded-lg p-3 grid grid-cols-2 gap-3" style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}` }}>
            <div>
              <div className="flex items-center gap-1 text-xs mb-1" style={{ color: COLORS.muted }}><Calendar size={12} /> 日付</div>
              <input
                type="date"
                value={matchInfo.date}
                onChange={(e) => setMatchInfo((m) => ({ ...m, date: e.target.value }))}
                className="w-full rounded-md px-2 py-1.5 text-sm"
                style={{ background: COLORS.surfaceLight, color: COLORS.text, border: `1px solid ${COLORS.line}` }}
              />
            </div>
            <div>
              <div className="flex items-center gap-1 text-xs mb-1" style={{ color: COLORS.muted }}><MapPin size={12} /> 場所</div>
              <input
                type="text"
                value={matchInfo.venue}
                onChange={(e) => setMatchInfo((m) => ({ ...m, venue: e.target.value }))}
                placeholder="〇〇市立体育館"
                className="w-full rounded-md px-2 py-1.5 text-sm"
                style={{ background: COLORS.surfaceLight, color: COLORS.text, border: `1px solid ${COLORS.line}` }}
              />
            </div>
          </div>

          {/* YouTube video link */}
          <div className="rounded-lg p-3" style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}` }}>
            <div className="flex items-center gap-1 text-xs mb-1" style={{ color: COLORS.muted }}><Video size={12} /> 試合動画のYouTube URL(任意)</div>
            <input
              type="text"
              value={matchInfo.videoUrl}
              onChange={(e) => setMatchInfo((m) => ({ ...m, videoUrl: e.target.value }))}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full rounded-md px-2 py-1.5 text-sm mb-2"
              style={{ background: COLORS.surfaceLight, color: COLORS.text, border: `1px solid ${COLORS.line}` }}
            />
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: COLORS.muted }}>前半スローオフの動画内時間</span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0:30"
                value={matchInfo.videoOffsetText}
                onChange={(e) => setMatchInfo((m) => ({ ...m, videoOffsetText: e.target.value }))}
                className="w-24 rounded-md px-2 py-1 text-sm font-mono"
                style={{ background: COLORS.surfaceLight, color: COLORS.text, border: `1px solid ${COLORS.line}` }}
              />
            </div>
            <div className="text-[10px] mt-1 mb-2" style={{ color: COLORS.muted }}>
              動画を見て、前半のスローオフの瞬間が動画の何分何秒かを「分:秒」で入力してください(例:0:30、1:05:20 のように時:分:秒でもOK)
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: COLORS.muted }}>後半スローオフの動画内時間</span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="32:10"
                value={matchInfo.videoOffset2Text}
                onChange={(e) => setMatchInfo((m) => ({ ...m, videoOffset2Text: e.target.value }))}
                className="w-24 rounded-md px-2 py-1 text-sm font-mono"
                style={{ background: COLORS.surfaceLight, color: COLORS.text, border: `1px solid ${COLORS.line}` }}
              />
            </div>
            <div className="text-[10px] mt-1 mb-2" style={{ color: COLORS.muted }}>
              ハーフタイムの休憩中も動画を止めずに撮り続けている場合、前半と後半でズレが変わります。動画を見て、後半のスローオフが何分何秒かを入れてください。
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: COLORS.muted }}>前半終了時点(試合クロック)</span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="30:00"
                value={matchInfo.halfBoundaryText}
                onChange={(e) => setMatchInfo((m) => ({ ...m, halfBoundaryText: e.target.value }))}
                className="w-24 rounded-md px-2 py-1 text-sm font-mono"
                style={{ background: COLORS.surfaceLight, color: COLORS.text, border: `1px solid ${COLORS.line}` }}
              />
            </div>
            <div className="text-[10px] mt-1 mb-2" style={{ color: COLORS.muted }}>
              この試合クロックの時間より後のイベントは「後半スローオフの動画内時間」を使ってジャンプします。標準は30:00です。
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: COLORS.muted }}>ジャンプ時に何秒前から再生するか</span>
              <input
                type="number"
                value={matchInfo.videoLeadSec}
                onChange={(e) => setMatchInfo((m) => ({ ...m, videoLeadSec: e.target.value }))}
                className="w-20 rounded-md px-2 py-1 text-sm"
                style={{ background: COLORS.surfaceLight, color: COLORS.text, border: `1px solid ${COLORS.line}` }}
              />
            </div>
            <div className="text-[10px] mt-1" style={{ color: COLORS.muted }}>
              イベントから動画へジャンプする時、記録した瞬間より何秒前から再生するか(プレーの一連の流れを見るため)
            </div>
          </div>

          {/* Teams */}
          {["us", "them"].map((t) => (
            <div key={t} className="rounded-lg p-3" style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}` }}>
              <input
                value={teamNames[t]}
                onChange={(e) => setTeamNames((n) => ({ ...n, [t]: e.target.value }))}
                className="font-display font-bold text-lg bg-transparent outline-none mb-3 w-full"
                style={{ color: COLORS.gold }}
                placeholder={t === "us" ? "チームA" : "チームB"}
              />

              <div className="space-y-2">
                <div className="grid gap-2 text-[10px] px-1" style={{ color: COLORS.muted, gridTemplateColumns: "44px 1fr 64px 56px 28px" }}>
                  <span>背番号</span><span>選手名</span><span>Pos</span><span>スタメン</span><span></span>
                </div>
                {roster[t].map((p, idx) => (
                  <div key={idx} className="grid gap-2 items-center" style={{ gridTemplateColumns: "44px 1fr 64px 56px 28px" }}>
                    <input
                      type="number"
                      value={p.num}
                      onChange={(e) => updatePlayerField(t, idx, "num", e.target.value)}
                      className="rounded-md px-1.5 py-1.5 text-sm font-mono text-center"
                      style={{ background: COLORS.surfaceLight, color: COLORS.text, border: `1px solid ${COLORS.line}` }}
                    />
                    <input
                      type="text"
                      value={p.name}
                      onChange={(e) => updatePlayerField(t, idx, "name", e.target.value)}
                      placeholder="選手名"
                      className="rounded-md px-2 py-1.5 text-sm"
                      style={{ background: COLORS.surfaceLight, color: COLORS.text, border: `1px solid ${COLORS.line}` }}
                    />
                    <select
                      value={p.pos}
                      onChange={(e) => updatePlayerField(t, idx, "pos", e.target.value)}
                      className="rounded-md px-1 py-1.5 text-xs"
                      style={{ background: COLORS.surfaceLight, color: COLORS.text, border: `1px solid ${COLORS.line}` }}
                    >
                      {POS_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                    <button
                      onClick={() => toggleStarter(t, idx)}
                      className="rounded-md py-1.5 text-xs font-display font-semibold"
                      style={{ background: p.onCourt ? COLORS.teal : COLORS.surfaceLight, color: p.onCourt ? COLORS.bg : COLORS.muted, border: `1px solid ${COLORS.line}` }}
                    >
                      {p.onCourt ? "◎" : "-"}
                    </button>
                    <button onClick={() => removePlayerRow(t, idx)} style={{ color: COLORS.coral }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={() => addPlayerRow(t)}
                className="mt-3 flex items-center gap-1 text-xs font-display font-semibold px-3 py-1.5 rounded-lg"
                style={{ background: COLORS.surfaceLight, color: COLORS.text, border: `1px solid ${COLORS.line}` }}
              >
                <Plus size={12} /> 選手を追加
              </button>
            </div>
          ))}
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4" style={{ background: COLORS.surface, borderTop: `1px solid ${COLORS.line}` }}>
          <button
            onClick={() => setStep("live")}
            className="w-full rounded-lg py-3 font-display font-bold text-base flex items-center justify-center gap-2"
            style={{ background: COLORS.gold, color: COLORS.bg }}
          >
            試合開始 <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  if (step === "archive") {
    const wins = archive.filter((m) => m.score.us > m.score.them).length;
    const draws = archive.filter((m) => m.score.us === m.score.them).length;
    const losses = archive.filter((m) => m.score.us < m.score.them).length;

    return (
      <div className="font-body min-h-screen w-full flex flex-col" style={{ background: COLORS.bg, color: COLORS.text }}>
        <style>{FONT_STYLE}</style>

        <div className="sticky top-0 z-10 px-4 pt-5 pb-4 flex items-center justify-between" style={{ background: COLORS.surface, borderBottom: `1px solid ${COLORS.line}` }}>
          <div>
            <div className="font-display font-bold text-2xl">試合一覧</div>
            <div className="text-xs mt-1" style={{ color: COLORS.muted }}>この端末に保存されている過去の試合</div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button onClick={() => { setScoutingOpponent(null); setStep("scouting"); }} className="text-xs font-display font-semibold px-2 py-1 rounded" style={{ background: COLORS.gold, color: COLORS.bg }}>
              スカウティング
            </button>
            <button onClick={() => setStep("setup")} className="text-xs underline" style={{ color: COLORS.muted }}>
              試合設定に戻る
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {archive.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {[
                ["試合数", archive.length],
                ["勝", wins],
                ["分", draws],
                ["敗", losses],
              ].map(([label, val]) => (
                <div key={label} className="rounded-lg p-2 text-center" style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}` }}>
                  <div className="font-mono font-bold text-lg" style={{ color: COLORS.gold }}>{val}</div>
                  <div className="text-[9px]" style={{ color: COLORS.muted }}>{label}</div>
                </div>
              ))}
            </div>
          )}

          {archive.length === 0 ? (
            <div className="rounded-lg p-6 text-center" style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}` }}>
              <div className="text-sm" style={{ color: COLORS.muted }}>
                まだ保存された試合がありません。「新しい試合を始める」を押すと、今の試合が自動でここに追加されます。
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {archive.map((m) => {
                const result = m.score.us > m.score.them ? "win" : m.score.us < m.score.them ? "lose" : "draw";
                return (
                  <div key={m.id} className="rounded-lg p-3 flex items-center justify-between" style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}` }}>
                    <button onClick={() => loadArchivedMatch(m)} className="flex-1 text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-[9px] font-display font-bold px-1.5 py-0.5 rounded"
                          style={{
                            background: result === "win" ? COLORS.teal : result === "lose" ? COLORS.coral : COLORS.surfaceLight,
                            color: result === "draw" ? COLORS.muted : COLORS.bg,
                          }}
                        >
                          {result === "win" ? "勝" : result === "lose" ? "敗" : "分"}
                        </span>
                        <span className="text-[10px]" style={{ color: COLORS.muted }}>
                          {m.matchInfo?.date || "日付未設定"} {m.matchInfo?.venue && `・ ${m.matchInfo.venue}`}
                        </span>
                      </div>
                      <div className="font-display font-semibold text-sm">
                        {m.teamNames?.us} <span style={{ color: COLORS.gold }}>{m.score.us} - {m.score.them}</span> {m.teamNames?.them}
                      </div>
                    </button>
                    <button
                      onClick={() => { if (window.confirm("この試合データを削除しますか?")) deleteArchivedMatch(m.id); }}
                      className="flex-shrink-0 ml-2 p-2"
                      style={{ color: COLORS.coral }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (step === "scouting") {
    const opponentGroups = {};
    for (const m of archive) {
      const name = m.teamNames?.them;
      if (!name) continue;
      if (!opponentGroups[name]) opponentGroups[name] = [];
      opponentGroups[name].push(m);
    }
    const opponentNames = Object.keys(opponentGroups).sort((a, b) => opponentGroups[b].length - opponentGroups[a].length);

    if (!scoutingOpponent) {
      return (
        <div className="font-body min-h-screen w-full flex flex-col" style={{ background: COLORS.bg, color: COLORS.text }}>
          <style>{FONT_STYLE}</style>
          <div className="sticky top-0 z-10 px-4 pt-5 pb-4 flex items-center justify-between" style={{ background: COLORS.surface, borderBottom: `1px solid ${COLORS.line}` }}>
            <div>
              <div className="font-display font-bold text-2xl">スカウティング</div>
              <div className="text-xs mt-1" style={{ color: COLORS.muted }}>対戦したことのある相手を選んでください</div>
            </div>
            <button onClick={() => setStep("archive")} className="text-xs underline flex-shrink-0" style={{ color: COLORS.muted }}>
              試合一覧に戻る
            </button>
          </div>
          <div className="p-4 space-y-2">
            {opponentNames.length === 0 && (
              <div className="rounded-lg p-6 text-center" style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}` }}>
                <div className="text-sm" style={{ color: COLORS.muted }}>まだアーカイブされた試合がありません。試合を終えて「新しい試合を始める」を押すと、ここに相手が表示されるようになります。</div>
              </div>
            )}
            {opponentNames.map((name) => (
              <button
                key={name}
                onClick={() => setScoutingOpponent(name)}
                className="w-full rounded-lg p-3 flex items-center justify-between"
                style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}` }}
              >
                <span className="font-display font-semibold text-sm">{name}</span>
                <span className="text-xs" style={{ color: COLORS.muted }}>{opponentGroups[name].length}試合</span>
              </button>
            ))}
          </div>
        </div>
      );
    }

    // --- 選択した相手チームのデータを横断集計 ---
    const matches = opponentGroups[scoutingOpponent] || [];
    const wins = matches.filter((m) => m.score.us > m.score.them).length;
    const draws = matches.filter((m) => m.score.us === m.score.them).length;
    const losses = matches.filter((m) => m.score.us < m.score.them).length;
    const avgUs = matches.length ? (matches.reduce((s, m) => s + m.score.us, 0) / matches.length).toFixed(1) : "-";
    const avgThem = matches.length ? (matches.reduce((s, m) => s + m.score.them, 0) / matches.length).toFixed(1) : "-";

    const allShots = matches.flatMap((m) =>
      (m.events || []).filter((e) => e.team === "them" && e.cat === "shot").map((e) => ({ ...e, _match: m }))
    );
    const totalMade = allShots.filter((e) => e.type === "goal").length;
    const overallShotPct = allShots.length ? Math.round((totalMade / allShots.length) * 100) : null;

    function groupBy(arr, keyFn) {
      const map = {};
      for (const item of arr) {
        const k = keyFn(item);
        if (!k) continue;
        if (!map[k]) map[k] = [];
        map[k].push(item);
      }
      return map;
    }

    const byLocation = groupBy(allShots, (e) => e.location);
    const locationRows = Object.entries(byLocation)
      .map(([loc, arr]) => ({
        loc,
        attempts: arr.length,
        made: arr.filter((e) => e.type === "goal").length,
        saved: arr.filter((e) => e.type === "saved").length,
      }))
      .map((r) => ({ ...r, shotPct: Math.round((r.made / r.attempts) * 100), savePct: (r.made + r.saved) ? Math.round((r.saved / (r.made + r.saved)) * 100) : null }))
      .sort((a, b) => b.attempts - a.attempts);

    const byShotType = groupBy(allShots, (e) => e.shotType);
    const shotTypeRows = Object.entries(byShotType)
      .map(([type, arr]) => ({ type, attempts: arr.length, made: arr.filter((e) => e.type === "goal").length }))
      .map((r) => ({ ...r, pct: Math.round((r.made / r.attempts) * 100) }))
      .sort((a, b) => b.attempts - a.attempts);

    const byPosition = groupBy(allShots, (e) => {
      const p = e._match.roster?.them?.find((pl) => pl.num === e.playerNum);
      return p?.pos || null;
    });
    const positionRows = Object.entries(byPosition)
      .map(([pos, arr]) => ({
        pos,
        attempts: arr.length,
        made: arr.filter((e) => e.type === "goal").length,
        saved: arr.filter((e) => e.type === "saved").length,
      }))
      .map((r) => ({ ...r, shotPct: Math.round((r.made / r.attempts) * 100), savePct: (r.made + r.saved) ? Math.round((r.saved / (r.made + r.saved)) * 100) : null }))
      .sort((a, b) => b.made - a.made);

    const byPlayer = groupBy(allShots, (e) => e.playerName ? `${e.playerName}` : (e.playerNum != null ? `#${e.playerNum}` : null));
    const playerRows = Object.entries(byPlayer)
      .map(([name, arr]) => ({
        name,
        num: arr[0]?.playerNum,
        matchesPlayed: new Set(arr.map((e) => e._match.id)).size,
        attempts: arr.length,
        made: arr.filter((e) => e.type === "goal").length,
      }))
      .map((r) => ({ ...r, pct: Math.round((r.made / r.attempts) * 100) }))
      .sort((a, b) => b.made - a.made)
      .slice(0, 6);

    return (
      <div className="font-body min-h-screen w-full flex flex-col" style={{ background: COLORS.bg, color: COLORS.text }}>
        <style>{FONT_STYLE}</style>
        <div className="sticky top-0 z-10 px-4 pt-5 pb-4 flex items-center justify-between" style={{ background: COLORS.surface, borderBottom: `1px solid ${COLORS.line}` }}>
          <div>
            <div className="font-display font-bold text-xl">{scoutingOpponent}</div>
            <div className="text-xs mt-1" style={{ color: COLORS.muted }}>過去{matches.length}試合分のスカウティングレポート</div>
          </div>
          <button onClick={() => setScoutingOpponent(null)} className="text-xs underline flex-shrink-0" style={{ color: COLORS.muted }}>
            相手を選び直す
          </button>
        </div>

        <div className="p-4 space-y-5">
          {/* 対戦成績 */}
          <div className="grid grid-cols-5 gap-2">
            {[
              ["試合数", matches.length],
              ["勝", wins],
              ["分", draws],
              ["敗", losses],
              ["平均得失点", `${avgUs}-${avgThem}`],
            ].map(([label, val]) => (
              <div key={label} className="rounded-lg p-2 text-center" style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}` }}>
                <div className="font-mono font-bold text-sm" style={{ color: COLORS.gold }}>{val}</div>
                <div className="text-[8px]" style={{ color: COLORS.muted }}>{label}</div>
              </div>
            ))}
          </div>

          {/* シュート傾向 */}
          <div>
            <div className="font-display font-bold text-sm mb-2" style={{ color: COLORS.gold }}>
              シュート傾向(全体成功率 {overallShotPct !== null ? `${overallShotPct}%` : "—"} / {totalMade}-{allShots.length})
            </div>
            <div className="rounded-lg p-3 mb-2" style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}` }}>
              <div className="text-[10px] uppercase tracking-widest mb-2" style={{ color: COLORS.muted }}>よく打つ場所(打った場所別)</div>
              <div className="space-y-1.5">
                {locationRows.length === 0 && <div className="text-xs" style={{ color: COLORS.muted }}>データがありません</div>}
                {locationRows.slice(0, 6).map((r) => (
                  <div key={r.loc} className="flex items-center justify-between text-xs">
                    <span>{r.loc}</span>
                    <span className="font-mono" style={{ color: COLORS.muted }}>{r.made}/{r.attempts}本 ({r.shotPct}%)</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-lg p-3" style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}` }}>
              <div className="text-[10px] uppercase tracking-widest mb-2" style={{ color: COLORS.muted }}>シュートの種類別</div>
              <div className="space-y-1.5">
                {shotTypeRows.length === 0 && <div className="text-xs" style={{ color: COLORS.muted }}>データがありません</div>}
                {shotTypeRows.map((r) => (
                  <div key={r.type} className="flex items-center justify-between text-xs">
                    <span>{r.type}</span>
                    <span className="font-mono" style={{ color: COLORS.muted }}>{r.made}/{r.attempts}本 ({r.pct}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 失点傾向 */}
          <div>
            <div className="font-display font-bold text-sm mb-2" style={{ color: COLORS.coral }}>失点傾向(この相手に対する自チームの守備)</div>
            <div className="rounded-lg p-3 mb-2" style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}` }}>
              <div className="text-[10px] uppercase tracking-widest mb-2" style={{ color: COLORS.muted }}>場所別のセーブ率(自チームGK)</div>
              <div className="space-y-1.5">
                {locationRows.length === 0 && <div className="text-xs" style={{ color: COLORS.muted }}>データがありません</div>}
                {locationRows.map((r) => (
                  <div key={r.loc} className="flex items-center justify-between text-xs">
                    <span>{r.loc}</span>
                    <span className="font-mono" style={{ color: r.savePct !== null && r.savePct < 40 ? COLORS.coral : COLORS.muted }}>
                      {r.savePct !== null ? `セーブ率 ${r.savePct}%` : "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-lg p-3" style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}` }}>
              <div className="text-[10px] uppercase tracking-widest mb-2" style={{ color: COLORS.muted }}>ポジション別(相手のどのポジションに決められているか)</div>
              <div className="space-y-1.5">
                {positionRows.length === 0 && <div className="text-xs" style={{ color: COLORS.muted }}>データがありません(相手ロスターにポジションが未設定の可能性があります)</div>}
                {positionRows.map((r) => (
                  <div key={r.pos} className="flex items-center justify-between text-xs">
                    <span>{r.pos}</span>
                    <span className="font-mono" style={{ color: COLORS.muted }}>被{r.made}点 ({r.attempts}本中) セーブ率{r.savePct !== null ? `${r.savePct}%` : "—"}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 要注意選手 */}
          <div>
            <div className="font-display font-bold text-sm mb-2" style={{ color: COLORS.gold }}>要注意選手</div>
            <div className="rounded-lg overflow-hidden" style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}` }}>
              {playerRows.length === 0 && <div className="text-xs p-3" style={{ color: COLORS.muted }}>データがありません</div>}
              {playerRows.map((p, i) => (
                <div key={p.name} className="flex items-center justify-between px-3 py-2" style={{ borderTop: i > 0 ? `1px solid ${COLORS.line}` : "none" }}>
                  <div>
                    <span className="font-display font-bold text-sm" style={{ color: COLORS.gold }}>{i + 1}.</span>{" "}
                    <span className="text-sm">{p.name}</span>
                    <span className="text-[10px] ml-2" style={{ color: COLORS.muted }}>({p.matchesPlayed}試合出現)</span>
                  </div>
                  <span className="font-mono text-xs" style={{ color: COLORS.muted }}>{p.made}得点 ({p.made}/{p.attempts}, {p.pct}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === "dashboard") {
    const oppOf = (t) => (t === "us" ? "them" : "us");
    return (
      <div className="font-body h-screen w-full relative" style={{ background: COLORS.bg, color: COLORS.text }}>
        <style>{FONT_STYLE}</style>
        <div className="h-full w-full overflow-y-auto">

        {/* Header */}
        <div className="px-4 pt-5 pb-4" style={{ borderBottom: `1px solid ${COLORS.line}`, background: COLORS.surface }}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px]" style={{ color: COLORS.muted }}>
              {matchInfo.date || "日付未設定"} {matchInfo.venue && `・ ${matchInfo.venue}`}
            </span>
            <button onClick={() => setStep("live")} className="text-[10px] underline" style={{ color: COLORS.muted }}>
              試合入力に戻る
            </button>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="font-display font-bold text-xl">{teamNames.us} vs {teamNames.them}</div>
            <div className="flex items-center gap-3">
              <div className="text-center">
                <div className="font-display font-bold text-3xl" style={{ color: COLORS.gold }}>{score.us}</div>
                <div className="text-[9px] truncate max-w-[10ch] mx-auto" style={{ color: COLORS.muted }}>{teamNames.us}</div>
              </div>
              <div className="font-display text-xl" style={{ color: COLORS.muted }}>–</div>
              <div className="text-center">
                <div className="font-display font-bold text-3xl">{score.them}</div>
                <div className="text-[9px] truncate max-w-[10ch] mx-auto" style={{ color: COLORS.muted }}>{teamNames.them}</div>
              </div>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            {[["summary", "サマリー"], ["players", "選手別スタッツ"], ["timeline", "出場時間タイムライン"], ["video", "動画"], ["report", "レポート"]].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setDashboardTab(key)}
                className="font-display font-semibold text-sm px-4 py-2 rounded-lg"
                style={{ background: dashboardTab === key ? COLORS.gold : COLORS.surfaceLight, color: dashboardTab === key ? COLORS.bg : COLORS.muted }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4">
          {dashboardTab === "summary" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {[
                  ["シュート成功率", `${statsByTeam.us.shotPct ?? "—"}% (${statsByTeam.us.made}/${statsByTeam.us.attempts})`, `${statsByTeam.them.shotPct ?? "—"}% (${statsByTeam.them.made}/${statsByTeam.them.attempts})`, "shotPct"],
                  ["GKセーブ率", `${statsByTeam.us.savePct ?? "—"}% (${statsByTeam.us.savedByGK}/${statsByTeam.us.savedByGK + statsByTeam.us.concededGoals})`, `${statsByTeam.them.savePct ?? "—"}% (${statsByTeam.them.savedByGK}/${statsByTeam.them.savedByGK + statsByTeam.them.concededGoals})`, "savePct"],
                  ["ターンオーバー", `${statsByTeam.us.turnoverPct ?? 0}% (${statsByTeam.us.turnovers}/${statsByTeam.us.attempts + statsByTeam.us.turnovers})`, `${statsByTeam.them.turnoverPct ?? 0}% (${statsByTeam.them.turnovers}/${statsByTeam.them.attempts + statsByTeam.them.turnovers})`, "turnover"],
                  ["警告 / 2分退場", `${statsByTeam.us.warnings} / ${statsByTeam.us.twoMin}`, `${statsByTeam.them.warnings} / ${statsByTeam.them.twoMin}`, null],
                ].map(([label, us, them, metricKey]) => (
                  <button
                    key={label}
                    onClick={() => metricKey && setKpiDetailOpen(metricKey)}
                    className="rounded-lg p-3 text-left"
                    style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, cursor: metricKey ? "pointer" : "default" }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-[10px] uppercase tracking-widest" style={{ color: COLORS.muted }}>{label}</div>
                      {metricKey && <span className="text-[9px]" style={{ color: COLORS.gold }}>場面別 ›</span>}
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="font-mono font-bold text-lg" style={{ color: COLORS.gold }}>{us}</div>
                        <div className="text-[9px] truncate max-w-[9ch]" style={{ color: COLORS.muted }}>{teamNames.us}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-lg">{them}</div>
                        <div className="text-[9px] truncate max-w-[9ch]" style={{ color: COLORS.muted }}>{teamNames.them}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="rounded-lg p-3" style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}` }}>
                <div className="text-xs uppercase tracking-widest mb-2" style={{ color: COLORS.muted }}>得点経過</div>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={scoreProgression} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid stroke={COLORS.line} strokeDasharray="3 3" />
                    <XAxis dataKey="sec" tick={{ fill: COLORS.muted, fontSize: 10 }} tickFormatter={(v) => fmt(v)} stroke={COLORS.line} />
                    <YAxis tick={{ fill: COLORS.muted, fontSize: 10 }} stroke={COLORS.line} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ background: COLORS.surfaceLight, border: `1px solid ${COLORS.line}`, borderRadius: 8 }}
                      labelStyle={{ color: COLORS.text }}
                      formatter={(v, n) => [v, n === "us" ? teamNames.us : teamNames.them]}
                      labelFormatter={(v) => fmt(v)}
                    />
                    <Line type="monotone" dataKey="us" stroke={COLORS.gold} strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="them" stroke={COLORS.muted} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
                <div className="flex items-center gap-4 mt-2 text-xs" style={{ color: COLORS.muted }}>
                  <span className="flex items-center gap-1"><span className="w-3 h-0.5 inline-block" style={{ background: COLORS.gold }} /> {teamNames.us}</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-0.5 inline-block" style={{ background: COLORS.muted }} /> {teamNames.them}</span>
                </div>
              </div>

              <div className="rounded-lg p-3" style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}` }}>
                <div className="text-xs uppercase tracking-widest mb-2" style={{ color: COLORS.muted }}>コーチメモ(試合全体)</div>
                <textarea
                  value={matchMemo}
                  onChange={(e) => setMatchMemo(e.target.value)}
                  placeholder="例:後半、ターンオーバーが増加。速攻の判断を早くする練習を来週入れたい。"
                  className="w-full bg-transparent outline-none text-sm resize-none"
                  style={{ color: COLORS.text }}
                  rows={3}
                />
              </div>
            </div>
          )}

          {dashboardTab === "players" && (
            <div className="space-y-5">
              {["us", "them"].map((t) => (
                <div key={t}>
                  <div className="font-display font-bold text-sm mb-2" style={{ color: COLORS.gold }}>{teamNames[t]}</div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                    {gkStatsByTeam[t].map((g) => {
                      const pct = g.shotsFaced ? Math.round((g.saves / g.shotsFaced) * 100) : null;
                      return (
                        <div key={g.num} className="rounded-lg p-3 flex items-center justify-between" style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}` }}>
                          <div>
                            <div className="font-display font-bold text-sm">#{g.num} {g.name}</div>
                            <div className="text-[10px] mt-0.5" style={{ color: COLORS.muted }}>出場 {fmt(g.playSec)}</div>
                          </div>
                          <div className="flex gap-3 text-center">
                            <div><div className="font-mono font-bold text-base">{g.shotsFaced}</div><div className="text-[8px]" style={{ color: COLORS.muted }}>被シュート</div></div>
                            <div><div className="font-mono font-bold text-base" style={{ color: COLORS.teal }}>{g.saves}</div><div className="text-[8px]" style={{ color: COLORS.muted }}>セーブ</div></div>
                            <div><div className="font-mono font-bold text-base" style={{ color: COLORS.gold }}>{pct !== null ? `${pct}%` : "—"}</div><div className="text-[8px]" style={{ color: COLORS.muted }}>セーブ率</div></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="rounded-lg overflow-x-auto" style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}` }}>
                    <table className="w-full text-xs">
                      <thead>
                        <tr style={{ background: COLORS.surfaceLight, color: COLORS.muted }}>
                          {["#", "選手", "Pos", "得点", "シュート", "TO(ミス率)", "警告", "2分退場", "出場時間", "±"].map((h) => (
                            <th key={h} className="text-left px-2 py-1.5 font-display font-semibold text-[10px] uppercase">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {playerStatsByTeam[t].map((p) => (
                          <tr
                            key={p.num}
                            onClick={() => setPlayerDetailOpen({ team: t, num: p.num, name: p.name })}
                            style={{ borderTop: `1px solid ${COLORS.line}`, cursor: "pointer" }}
                          >
                            <td className="px-2 py-1.5 font-display font-bold" style={{ color: COLORS.gold }}>{p.num}</td>
                            <td className="px-2 py-1.5 underline">{p.name}</td>
                            <td className="px-2 py-1.5" style={{ color: COLORS.muted }}>{p.pos}</td>
                            <td className="px-2 py-1.5 font-mono">{p.goals}</td>
                            <td className="px-2 py-1.5 font-mono" style={{ color: COLORS.muted }}>{p.shots}</td>
                            <td className="px-2 py-1.5 font-mono" style={{ color: p.turnovers ? COLORS.coral : COLORS.muted }}>
                              {p.turnovers}
                              {(p.shots + p.turnovers) > 0 && (
                                <span className="text-[9px] ml-1" style={{ color: COLORS.muted }}>
                                  ({Math.round((p.turnovers / (p.shots + p.turnovers)) * 100)}%)
                                </span>
                              )}
                            </td>
                            <td className="px-2 py-1.5 font-mono" style={{ color: p.warnings ? COLORS.amber : COLORS.muted }}>{p.warnings}</td>
                            <td className="px-2 py-1.5 font-mono" style={{ color: p.twoMin ? COLORS.coral : COLORS.muted }}>{p.twoMin}</td>
                            <td className="px-2 py-1.5 font-mono" style={{ color: COLORS.teal }}>{fmt(p.playSec)}</td>
                            <td className="px-2 py-1.5 font-mono font-bold" style={{ color: p.plusMinus > 0 ? COLORS.teal : p.plusMinus < 0 ? COLORS.coral : COLORS.muted }}>
                              {p.plusMinus > 0 ? `+${p.plusMinus}` : p.plusMinus}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}

          {dashboardTab === "timeline" && (
            <div>
              <div className="mb-3 inline-flex p-1 rounded-lg gap-1" style={{ background: COLORS.surfaceLight }}>
                {["us", "them"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setDashboardTeamView(t)}
                    className="font-display font-semibold text-sm rounded-md px-4 py-1.5"
                    style={{ background: dashboardTeamView === t ? COLORS.gold : "transparent", color: dashboardTeamView === t ? COLORS.bg : COLORS.muted }}
                  >
                    {teamNames[t]}
                  </button>
                ))}
              </div>

              <div className="rounded-lg p-3" style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}` }}>
                <div className="flex text-[9px] mb-2 px-[78px] justify-between" style={{ color: COLORS.muted }}>
                  <span>0:00</span><span>{fmt(elapsed / 2)}</span><span>{fmt(elapsed)}</span>
                </div>
                <div className="space-y-2">
                  {playerStatsByTeam[dashboardTeamView]
                    .filter((p) => p.playSec > 0)
                    .map((p) => (
                      <div key={p.num} className="flex items-center gap-2">
                        <div className="w-[72px] flex-shrink-0 text-right">
                          <span className="font-display font-bold text-xs" style={{ color: COLORS.gold }}>{p.num}</span>
                          <span className="text-[10px] ml-1">{p.name}</span>
                        </div>
                        <div className="relative flex-1 h-4 rounded" style={{ background: COLORS.surfaceLight }}>
                          {p.allStints.map((seg, i) => (
                            <div
                              key={i}
                              className="absolute inset-y-0 rounded"
                              style={{
                                left: `${elapsed ? (seg.start / elapsed) * 100 : 0}%`,
                                width: `${elapsed ? ((seg.end - seg.start) / elapsed) * 100 : 0}%`,
                                background: COLORS.teal,
                              }}
                            />
                          ))}
                        </div>
                        <div className="w-10 flex-shrink-0 text-right font-mono text-[10px]" style={{ color: COLORS.muted }}>
                          {fmt(p.playSec)}
                        </div>
                      </div>
                    ))}
                  {playerStatsByTeam[dashboardTeamView].filter((p) => p.playSec > 0).length === 0 && (
                    <div className="text-xs py-4 text-center" style={{ color: COLORS.muted }}>まだ出場記録がありません</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {dashboardTab === "video" && (
            <div className="space-y-3">
              {videoId ? (
                <>
                  <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${COLORS.line}`, aspectRatio: "16 / 9" }}>
                    <iframe
                      key={videoSeekKey}
                      src={`https://www.youtube.com/embed/${videoId}?start=${videoSeekSec}&autoplay=1`}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title="match video"
                    />
                  </div>
                  <div className="text-xs" style={{ color: COLORS.muted }}>
                    現在の再生位置: {fmt(videoSeekSec)}
                  </div>
                  <div className="flex items-center gap-2 text-xs" style={{ color: COLORS.muted }}>
                    <span>頭出し(何秒前から再生):</span>
                    <input
                      type="number"
                      value={matchInfo.videoLeadSec}
                      onChange={(e) => setMatchInfo((m) => ({ ...m, videoLeadSec: e.target.value }))}
                      className="w-16 rounded-md px-2 py-1"
                      style={{ background: COLORS.surfaceLight, color: COLORS.text, border: `1px solid ${COLORS.line}` }}
                    />
                    <span>秒</span>
                  </div>
                  <div className="rounded-lg p-3" style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}` }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs uppercase tracking-widest" style={{ color: COLORS.muted }}>イベントから動画へジャンプ</div>
                      <button
                        onClick={() => setShowOnlyMarked((v) => !v)}
                        className="flex items-center gap-1 text-[10px] font-display font-semibold px-2 py-1 rounded"
                        style={{ background: showOnlyMarked ? COLORS.gold : COLORS.surfaceLight, color: showOnlyMarked ? COLORS.bg : COLORS.gold }}
                      >
                        <Star size={10} fill={showOnlyMarked ? COLORS.bg : "none"} /> ★のみ
                      </button>
                    </div>
                    <div className="space-y-1.5 max-h-64 overflow-y-auto">
                      {events.slice().reverse().filter((e) => !showOnlyMarked || e.marked).map((e) => (
                        <button
                          key={e.id}
                          onClick={() => jumpToVideo(e.ts)}
                          className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-xs text-left"
                          style={{ background: e.marked ? "rgba(242,183,5,0.12)" : COLORS.surfaceLight, border: e.marked ? `1px solid ${COLORS.gold}` : "1px solid transparent" }}
                        >
                          <span className="flex items-center gap-1">
                            {e.marked && <Star size={11} fill={COLORS.gold} color={COLORS.gold} />}
                            <span className="text-[9px] mr-1 px-1 rounded" style={{ background: COLORS.surface, color: COLORS.muted }}>{teamNames[e.team]}</span>
                            #{e.playerNum} {e.playerName} — {e.label}
                          </span>
                          <span className="flex items-center gap-1 font-mono" style={{ color: COLORS.gold }}>
                            <Video size={11} /> {fmt(e.ts)}
                          </span>
                        </button>
                      ))}
                      {events.filter((e) => !showOnlyMarked || e.marked).length === 0 && <div className="text-xs text-center py-4" style={{ color: COLORS.muted }}>まだイベントがありません</div>}
                    </div>
                  </div>
                </>
              ) : (
                <div className="rounded-lg p-6 text-center" style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}` }}>
                  <div className="text-sm mb-2" style={{ color: COLORS.muted }}>動画が登録されていません</div>
                  <button onClick={() => setStep("setup")} className="text-xs underline" style={{ color: COLORS.gold }}>
                    試合設定でYouTube URLを登録する
                  </button>
                </div>
              )}
            </div>
          )}

          {dashboardTab === "report" && (() => {
            const topScorer = (t) => playerStatsByTeam[t].reduce((best, p) => (!best || p.goals > best.goals ? p : best), null);
            const bestPM = (t) => playerStatsByTeam[t].reduce((best, p) => (!best || p.plusMinus > best.plusMinus ? p : best), null);
            const memoEntries = Object.entries(playerMemos).filter(([, v]) => v && v.trim());
            const findPlayer = (key) => {
              const [t, numStr] = key.split("_");
              const num = Number(numStr);
              return playerStatsByTeam[t]?.find((p) => p.num === num);
            };
            const copyReport = () => {
              const lines = [
                `${teamNames.us} vs ${teamNames.them}`,
                `${matchInfo.date || ""} ${matchInfo.venue || ""}`,
                `スコア: ${score.us} - ${score.them}`,
                "",
                `シュート成功率: ${teamNames.us} ${statsByTeam.us.shotPct ?? "—"}%(${statsByTeam.us.made}/${statsByTeam.us.attempts}) / ${teamNames.them} ${statsByTeam.them.shotPct ?? "—"}%(${statsByTeam.them.made}/${statsByTeam.them.attempts})`,
                `GKセーブ率: ${teamNames.us} ${statsByTeam.us.savePct ?? "—"}% / ${teamNames.them} ${statsByTeam.them.savePct ?? "—"}%`,
                `ターンオーバー: ${teamNames.us} ${statsByTeam.us.turnovers}回 / ${teamNames.them} ${statsByTeam.them.turnovers}回`,
                "",
                matchMemo ? `コーチメモ: ${matchMemo}` : "",
                ...memoEntries.map(([key, v]) => {
                  const p = findPlayer(key);
                  return p ? `#${p.num} ${p.name}: ${v}` : "";
                }),
              ].filter(Boolean);
              navigator.clipboard?.writeText(lines.join("\n"));
              showToast("レポートをコピーしました");
            };
            return (
              <div className="space-y-4">
                <div className="flex gap-2 print:hidden">
                  <button onClick={() => window.print()} className="flex-1 rounded-lg py-2.5 font-display font-semibold text-sm" style={{ background: COLORS.gold, color: COLORS.bg }}>
                    印刷 / PDF保存
                  </button>
                  <button onClick={copyReport} className="flex-1 rounded-lg py-2.5 font-display font-semibold text-sm" style={{ background: COLORS.surfaceLight, color: COLORS.text, border: `1px solid ${COLORS.line}` }}>
                    テキストをコピー
                  </button>
                </div>

                <div className="rounded-lg p-4" style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}` }}>
                  <div className="font-display font-bold text-lg mb-1">{teamNames.us} vs {teamNames.them}</div>
                  <div className="text-xs mb-3" style={{ color: COLORS.muted }}>{matchInfo.date || "日付未設定"} {matchInfo.venue && `・ ${matchInfo.venue}`}</div>
                  <div className="font-display font-bold text-3xl mb-4" style={{ color: COLORS.gold }}>{score.us} - {score.them}</div>

                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[
                      ["シュート成功率", `${statsByTeam.us.shotPct ?? "—"}%`, `${statsByTeam.them.shotPct ?? "—"}%`],
                      ["GKセーブ率", `${statsByTeam.us.savePct ?? "—"}%`, `${statsByTeam.them.savePct ?? "—"}%`],
                      ["ターンオーバー", `${statsByTeam.us.turnovers}`, `${statsByTeam.them.turnovers}`],
                    ].map(([label, us, them]) => (
                      <div key={label} className="text-center">
                        <div className="text-[9px] mb-1" style={{ color: COLORS.muted }}>{label}</div>
                        <div className="font-mono font-bold text-sm" style={{ color: COLORS.gold }}>{us}</div>
                        <div className="font-mono font-bold text-sm">{them}</div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {["us", "them"].map((t) => {
                      const ts = topScorer(t), tpm = bestPM(t);
                      return (
                        <div key={t} className="rounded-lg p-3" style={{ background: COLORS.surfaceLight }}>
                          <div className="text-[10px] font-display font-semibold mb-1" style={{ color: COLORS.gold }}>{teamNames[t]}</div>
                          {ts && ts.goals > 0 && <div className="text-xs" style={{ color: COLORS.muted }}>得点王: #{ts.num} {ts.name}({ts.goals}点)</div>}
                          {tpm && tpm.plusMinus !== 0 && (
                            <div className="text-xs" style={{ color: COLORS.muted }}>
                              最高±: #{tpm.num} {tpm.name}({tpm.plusMinus > 0 ? `+${tpm.plusMinus}` : tpm.plusMinus})
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {matchMemo && (
                    <div className="rounded-lg p-3 mb-3" style={{ background: COLORS.surfaceLight }}>
                      <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: COLORS.muted }}>コーチメモ</div>
                      <div className="text-xs whitespace-pre-wrap">{matchMemo}</div>
                    </div>
                  )}

                  {memoEntries.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-[10px] uppercase tracking-widest" style={{ color: COLORS.muted }}>選手個別メモ</div>
                      {memoEntries.map(([key, v]) => {
                        const p = findPlayer(key);
                        if (!p) return null;
                        return (
                          <div key={key} className="rounded-lg p-2.5" style={{ background: COLORS.surfaceLight }}>
                            <div className="text-xs font-display font-semibold mb-0.5">#{p.num} {p.name}</div>
                            <div className="text-xs whitespace-pre-wrap" style={{ color: COLORS.muted }}>{v}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>

        </div>

        {/* Player detail modal */}
        {playerDetailOpen && (
          <div className="fixed inset-0 z-30 flex items-end md:items-center md:justify-center" onClick={() => setPlayerDetailOpen(null)}>
            <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.55)" }} />
            <div
              className="relative w-full md:max-w-md rounded-t-2xl md:rounded-2xl p-4 pb-6 z-10"
              style={{ background: COLORS.surface, borderTop: `1px solid ${COLORS.line}`, maxHeight: "80vh", overflowY: "auto" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="font-display font-bold text-lg">
                  <span style={{ color: COLORS.gold }}>#{playerDetailOpen.num}</span> {playerDetailOpen.name}
                </div>
                <button onClick={() => setPlayerDetailOpen(null)}><X size={20} /></button>
              </div>
              <div className="text-xs mb-3" style={{ color: COLORS.muted }}>シュート・ターンオーバーの詳細記録(任意入力があった分のみ)</div>

              {(() => {
                const shotEvents = events.filter((e) => e.team === playerDetailOpen.team && e.playerNum === playerDetailOpen.num && e.cat === "shot");
                const made = shotEvents.filter((e) => e.type === "goal").length;
                const pct = shotEvents.length ? Math.round((made / shotEvents.length) * 100) : null;
                const locationCounts = {};
                const courseCounts = {};
                for (const e of shotEvents) {
                  if (e.location) locationCounts[e.location] = (locationCounts[e.location] || 0) + 1;
                  if (e.course) {
                    const k = `${e.courseType}:${e.course}`;
                    courseCounts[k] = (courseCounts[k] || 0) + 1;
                  }
                }
                return (
                  <>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="rounded-lg p-3 text-center" style={{ background: COLORS.surfaceLight }}>
                        <div className="font-mono font-bold text-2xl" style={{ color: COLORS.gold }}>
                          {pct !== null ? `${pct}%` : "—"}
                          <span className="text-sm ml-2" style={{ color: COLORS.muted }}>({made}/{shotEvents.length})</span>
                        </div>
                        <div className="text-[10px]" style={{ color: COLORS.muted }}>シュート成功率</div>
                      </div>
                      {(() => {
                        const pStat = playerStatsByTeam[playerDetailOpen.team].find((pp) => pp.num === playerDetailOpen.num);
                        const pm = pStat ? pStat.plusMinus : 0;
                        return (
                          <div className="rounded-lg p-3 text-center" style={{ background: COLORS.surfaceLight }}>
                            <div className="font-mono font-bold text-2xl" style={{ color: pm > 0 ? COLORS.teal : pm < 0 ? COLORS.coral : COLORS.muted }}>
                              {pm > 0 ? `+${pm}` : pm}
                            </div>
                            <div className="text-[10px]" style={{ color: COLORS.muted }}>プラスマイナス(出場中の得失点差)</div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* シュート位置の図(数字が積み上がる) */}
                    <div className="mb-4">
                      <div className="text-xs uppercase tracking-widest mb-2" style={{ color: COLORS.muted }}>シュート位置</div>
                      <div className="relative w-full rounded-lg overflow-hidden" style={{ aspectRatio: "4 / 3", background: "#0d1319", border: `1px solid ${COLORS.line}` }}>
                        <svg viewBox="0 0 200 150" preserveAspectRatio="none" className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }}>
                          <rect x="80" y="2" width="40" height="6" fill={COLORS.gold} />
                          <path d="M 65 8 A 35 35 0 0 0 135 8" fill="none" stroke={COLORS.muted} strokeWidth="1.5" />
                          <path d="M 30 8 A 70 70 0 0 0 170 8" fill="none" stroke={COLORS.muted} strokeWidth="1.5" strokeDasharray="5 4" />
                          <line x1="4" y1="8" x2="4" y2="146" stroke={COLORS.line} strokeWidth="1.5" />
                          <line x1="196" y1="8" x2="196" y2="146" stroke={COLORS.line} strokeWidth="1.5" />
                        </svg>
                        {COURT_ZONE_POSITIONS.map((z) => {
                          const count = locationCounts[z.name] || 0;
                          return (
                            <div
                              key={z.name}
                              className="absolute rounded-md flex items-center justify-center font-mono font-bold"
                              style={{
                                left: `${z.x}%`, top: `${z.y}%`, transform: "translate(-50%, -50%)",
                                width: `${z.w}%`, height: `${z.h}%`,
                                background: count ? "rgba(242,183,5,0.25)" : "rgba(35,47,63,0.85)",
                                border: `1px solid ${count ? COLORS.gold : COLORS.line}`,
                                color: count ? COLORS.gold : COLORS.muted,
                                fontSize: "11px",
                              }}
                            >
                              {count > 0 ? count : ""}
                            </div>
                          );
                        })}
                      </div>
                      {(locationCounts["エンプティー"] || locationCounts["7m"]) && (
                        <div className="flex gap-2 mt-2 text-xs" style={{ color: COLORS.muted }}>
                          {locationCounts["エンプティー"] && <span>エンプティー: {locationCounts["エンプティー"]}</span>}
                          {locationCounts["7m"] && <span>7m: {locationCounts["7m"]}</span>}
                        </div>
                      )}
                    </div>

                    {/* シュートコースの図(数字が積み上がる) */}
                    <div className="mb-5">
                      <div className="text-xs uppercase tracking-widest mb-2" style={{ color: COLORS.muted }}>シュートコース</div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-[10px] mb-1 text-center" style={{ color: COLORS.teal }}>枠内</div>
                          <div className="grid grid-cols-3 gap-1">
                            {GOAL_ZONES.map((z) => {
                              const count = courseCounts[`in:${z.code}`] || 0;
                              return (
                                <div key={z.code} className="aspect-square rounded-md flex items-center justify-center font-mono font-bold text-sm"
                                  style={{ background: count ? "rgba(43,182,115,0.25)" : COLORS.surfaceLight, border: `1px solid ${count ? COLORS.teal : COLORS.line}`, color: count ? COLORS.teal : COLORS.muted }}>
                                  {count > 0 ? count : ""}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] mb-1 text-center" style={{ color: COLORS.coral }}>枠外</div>
                          <div className="grid grid-cols-3 gap-1">
                            {OFF_TARGET_ZONES.map((z) => {
                              const count = courseCounts[`out:${z.code}`] || 0;
                              return (
                                <div key={z.code} className="aspect-square rounded-md flex items-center justify-center font-mono font-bold text-sm"
                                  style={{ background: count ? "rgba(232,96,74,0.25)" : COLORS.surfaceLight, border: `1px solid ${count ? COLORS.coral : COLORS.line}`, color: count ? COLORS.coral : COLORS.muted }}>
                                  {count > 0 ? count : ""}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}

              <div className="rounded-lg p-3 mb-4" style={{ background: COLORS.surfaceLight }}>
                <div className="text-xs uppercase tracking-widest mb-2" style={{ color: COLORS.muted }}>コーチメモ(この選手)</div>
                <textarea
                  value={playerMemos[`${playerDetailOpen.team}_${playerDetailOpen.num}`] || ""}
                  onChange={(e) =>
                    setPlayerMemos((m) => ({ ...m, [`${playerDetailOpen.team}_${playerDetailOpen.num}`]: e.target.value }))
                  }
                  placeholder="例:1対1の守備は良かった。左45からのシュート精度を課題に。"
                  className="w-full bg-transparent outline-none text-xs resize-none"
                  style={{ color: COLORS.text }}
                  rows={2}
                />
              </div>

              <div className="text-xs uppercase tracking-widest mb-2" style={{ color: COLORS.muted }}>記録一覧</div>
              <div className="space-y-1.5">
                {events
                  .filter((e) => e.team === playerDetailOpen.team && e.playerNum === playerDetailOpen.num && (e.cat === "shot" || e.cat === "turnover"))
                  .map((e) => (
                    <div key={e.id} className="rounded-lg px-3 py-2 text-xs" style={{ background: COLORS.surfaceLight }}>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-display font-semibold">{e.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono" style={{ color: COLORS.muted }}>{fmt(e.ts)}</span>
                          {videoId && (
                            <button
                              onClick={() => { jumpToVideo(e.ts); setPlayerDetailOpen(null); }}
                              className="flex items-center gap-0.5 px-1.5 py-0.5 rounded"
                              style={{ background: COLORS.surface, color: COLORS.gold }}
                            >
                              <Video size={10} /> 動画
                            </button>
                          )}
                        </div>
                      </div>
                      <div style={{ color: COLORS.muted }}>
                        {[
                          e.situation,
                          e.turnoverType,
                          e.shotType,
                          e.location,
                          e.course ? `→${(e.courseType === "out" ? OFF_TARGET_ZONES : GOAL_ZONES).find((z) => z.code === e.course)?.label || e.course}` : null,
                        ].filter(Boolean).join(" / ") || "詳細情報なし"}
                      </div>
                    </div>
                  ))}
                {events.filter((e) => e.team === playerDetailOpen.team && e.playerNum === playerDetailOpen.num && (e.cat === "shot" || e.cat === "turnover")).length === 0 && (
                  <div className="text-xs text-center py-6" style={{ color: COLORS.muted }}>まだ記録がありません</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* KPI situation breakdown modal */}
        {kpiDetailOpen && (
          <div className="fixed inset-0 z-30 flex items-end md:items-center md:justify-center" onClick={() => { setKpiDetailOpen(null); setKpiSituationDrill(null); }}>
            <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.55)" }} />
            <div
              className="relative w-full md:max-w-md rounded-t-2xl md:rounded-2xl p-4 pb-6 z-10"
              style={{ background: COLORS.surface, borderTop: `1px solid ${COLORS.line}`, maxHeight: "80vh", overflowY: "auto" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="font-display font-bold text-lg flex items-center gap-2">
                  {kpiSituationDrill && (
                    <button onClick={() => setKpiSituationDrill(null)} style={{ color: COLORS.muted }}>
                      <ArrowRight size={16} style={{ transform: "rotate(180deg)" }} />
                    </button>
                  )}
                  {kpiDetailOpen === "shotPct" ? "シュート成功率" : kpiDetailOpen === "savePct" ? "GKセーブ率" : "ターンオーバー"}
                  {kpiSituationDrill ? ` — ${kpiSituationDrill}` : " — 場面別"}
                </div>
                <button onClick={() => { setKpiDetailOpen(null); setKpiSituationDrill(null); }}><X size={20} /></button>
              </div>

              {!kpiSituationDrill && (
                <div className="space-y-2">
                  {situationBreakdown[kpiDetailOpen].map((row) => (
                    <button
                      key={row.situation}
                      onClick={() => setKpiSituationDrill(row.situation)}
                      className="w-full text-left rounded-lg p-3"
                      style={{ background: COLORS.surfaceLight }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-display font-semibold">{row.situation}</div>
                        <span className="text-[9px]" style={{ color: COLORS.gold }}>種類別 ›</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <div className="font-mono font-bold text-base" style={{ color: COLORS.gold }}>
                            {row.us.pct !== null ? `${row.us.pct}%` : "—"}
                            <span className="text-[10px] ml-1" style={{ color: COLORS.muted }}>({row.us.count})</span>
                          </div>
                          <div className="text-[9px] truncate" style={{ color: COLORS.muted }}>{teamNames.us}</div>
                        </div>
                        <div>
                          <div className="font-mono font-bold text-base">
                            {row.them.pct !== null ? `${row.them.pct}%` : "—"}
                            <span className="text-[10px] ml-1" style={{ color: COLORS.muted }}>({row.them.count})</span>
                          </div>
                          <div className="text-[9px] truncate" style={{ color: COLORS.muted }}>{teamNames.them}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {kpiSituationDrill && (
                <div className="space-y-2">
                  <div className="text-xs uppercase tracking-widest mb-1" style={{ color: COLORS.muted }}>
                    {kpiDetailOpen === "turnover" ? "ターンオーバーの種類別" : "シュートの種類別"}
                  </div>
                  {drillBreakdown.length === 0 && (
                    <div className="text-xs text-center py-6" style={{ color: COLORS.muted }}>この場面の詳細記録がありません</div>
                  )}
                  {drillBreakdown.map((row) => (
                    <div key={row.type} className="rounded-lg p-3" style={{ background: COLORS.surfaceLight }}>
                      <div className="text-xs font-display font-semibold mb-2">{row.type}</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <div className="font-mono font-bold text-base" style={{ color: COLORS.gold }}>
                            {kpiDetailOpen === "turnover" ? row.us.count : (row.us.pct !== null ? `${row.us.pct}%` : "—")}
                            {kpiDetailOpen !== "turnover" && (
                              <span className="text-[10px] ml-1" style={{ color: COLORS.muted }}>({row.us.count}/{row.us.attempts})</span>
                            )}
                          </div>
                          <div className="text-[9px] truncate" style={{ color: COLORS.muted }}>{teamNames.us}</div>
                        </div>
                        <div>
                          <div className="font-mono font-bold text-base">
                            {kpiDetailOpen === "turnover" ? row.them.count : (row.them.pct !== null ? `${row.them.pct}%` : "—")}
                            {kpiDetailOpen !== "turnover" && (
                              <span className="text-[10px] ml-1" style={{ color: COLORS.muted }}>({row.them.count}/{row.them.attempts})</span>
                            )}
                          </div>
                          <div className="text-[9px] truncate" style={{ color: COLORS.muted }}>{teamNames.them}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="font-body h-screen w-full relative" style={{ background: COLORS.bg, color: COLORS.text }}>
      <style>{FONT_STYLE}</style>
      <div className="h-full w-full flex flex-col overflow-y-auto">

      {/* Scoreboard header */}
      <div className="sticky top-0 z-20 px-4 pt-4 pb-3" style={{ background: COLORS.surface, borderBottom: `1px solid ${COLORS.line}` }}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px]" style={{ color: COLORS.muted }}>
            {matchInfo.date || "日付未設定"} {matchInfo.venue && `・ ${matchInfo.venue}`}
          </span>
          <div className="flex items-center gap-3">
            <button onClick={() => setStep("setup")} className="text-[10px] underline" style={{ color: COLORS.muted }}>
              試合設定に戻る
            </button>
            <button
              onClick={() => { setRunning(false); setStep("dashboard"); }}
              className="flex items-center gap-1 text-[10px] font-display font-semibold px-2 py-1 rounded"
              style={{ background: COLORS.gold, color: COLORS.bg }}
            >
              <BarChart3 size={11} /> 分析へ
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <input
              value={teamNames.us}
              onChange={(e) => setTeamNames((n) => ({ ...n, us: e.target.value }))}
              className="text-xs tracking-widest uppercase bg-transparent text-center w-full outline-none"
              style={{ color: COLORS.muted }}
              placeholder="チームA"
            />
            <div className="font-display font-bold text-5xl leading-none" style={{ color: COLORS.gold }}>{score.us}</div>
          </div>
          <div className="flex flex-col items-center px-3">
            <button onClick={openTimeEdit} className="font-mono text-2xl underline decoration-dotted">{fmt(elapsed)}</button>
            <button onClick={() => setRunning((r) => !r)} className="mt-1 rounded-full p-2" style={{ background: running ? COLORS.coral : COLORS.teal }}>
              {running ? <Pause size={16} color="#10161d" /> : <Play size={16} color="#10161d" />}
            </button>
          </div>
          <div className="text-center flex-1">
            <input
              value={teamNames.them}
              onChange={(e) => setTeamNames((n) => ({ ...n, them: e.target.value }))}
              className="text-xs tracking-widest uppercase bg-transparent text-center w-full outline-none"
              style={{ color: COLORS.muted }}
              placeholder="チームB"
            />
            <div className="font-display font-bold text-5xl leading-none">{score.them}</div>
          </div>
        </div>

        {/* Team toggle */}
        <div className="mt-3 grid grid-cols-2 gap-1 p-1 rounded-lg" style={{ background: COLORS.surfaceLight }}>
          {["us", "them"].map((t) => (
            <button
              key={t}
              onClick={() => setTeam(t)}
              className="font-display font-semibold text-sm rounded-md py-2"
              style={{
                background: team === t ? COLORS.gold : "transparent",
                color: team === t ? COLORS.bg : COLORS.muted,
              }}
            >
              {teamNames[t]}を入力中
            </button>
          ))}
        </div>
      </div>

      {/* Stats: two-column comparison */}
      <div className="px-4 py-3">
        <div className="grid grid-cols-2 gap-2">
          {["us", "them"].map((t) => (
            <div key={t} className="rounded-lg p-2" style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}` }}>
              <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: COLORS.muted }}>{teamNames[t]}</div>
              <div className="grid grid-cols-2 gap-1">
                {[
                  ["シュート成功率", statsByTeam[t].shotPct !== null ? `${statsByTeam[t].shotPct}%` : "—"],
                  ["GKセーブ率", statsByTeam[t].savePct !== null ? `${statsByTeam[t].savePct}%` : "—"],
                  ["ターンオーバー", statsByTeam[t].turnovers],
                  ["2分退場", statsByTeam[t].twoMin],
                ].map(([label, val]) => (
                  <div key={label} className="text-center py-1">
                    <div className="font-mono font-bold text-sm" style={{ color: COLORS.gold }}>{val}</div>
                    <div className="text-[9px]" style={{ color: COLORS.muted }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* OF/DF pairs */}
      <div className="px-4 pt-1 pb-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase tracking-widest" style={{ color: COLORS.muted }}>OF/DF 登録ペア</span>
          <div className="flex gap-2">
            {pairs[team] && pairs[team].length > 0 && (
              <button
                onClick={swapAllPairs}
                className="font-display font-semibold text-xs px-3 py-1.5 rounded-lg"
                style={{ background: COLORS.gold, color: COLORS.bg }}
              >
                全ペア一括交代
              </button>
            )}
            <button
              onClick={() => setPairEditOpen(true)}
              className="font-display font-semibold text-xs px-3 py-1.5 rounded-lg"
              style={{ background: COLORS.surfaceLight, color: COLORS.text, border: `1px solid ${COLORS.line}` }}
            >
              ペア編集
            </button>
          </div>
        </div>
        {pairs[team] && pairs[team].length > 0 ? (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {pairs[team].map((pr) => (
              <button
                key={pr.id}
                onClick={() => swapPair(pr)}
                className="rounded-lg px-3 py-2 flex-shrink-0 flex items-center gap-1.5"
                style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}` }}
              >
                <span className="font-mono text-sm" style={{ color: COLORS.gold }}>#{pr.a}</span>
                <span className="text-xs" style={{ color: COLORS.muted }}>⇄</span>
                <span className="font-mono text-sm">#{pr.b}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-xs py-2" style={{ color: COLORS.muted }}>
            登録ペアがありません。「ペア編集」から追加できます。
          </div>
        )}
      </div>

      {/* Court players (of selected team) */}
      <div className="px-4 pt-2">
        <div className="flex items-center gap-2 mb-2">
          <Target size={14} style={{ color: COLORS.muted }} />
          <span className="text-xs uppercase tracking-widest" style={{ color: COLORS.muted }}>
            コート上 — {teamNames[team]}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {onCourt.map((p) => {
            const time = p.total + (p.onCourt && p.sub != null ? elapsed - p.sub : 0);
            return (
              <button
                key={p.num}
                onClick={() => setSelected(p)}
                className="rounded-xl p-3 text-left active:scale-95 transition-transform"
                style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}` }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-2xl" style={{ color: COLORS.gold }}>{p.num}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: COLORS.surfaceLight, color: COLORS.muted }}>{p.pos}</span>
                </div>
                {p.name && <div className="font-body text-sm mt-1">{p.name}</div>}
                <div className="font-mono text-xs mt-1" style={{ color: COLORS.teal }}>{fmt(time)}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bench */}
      <div className="px-4 pt-5">
        <div className="flex items-center gap-2 mb-2">
          <Users size={14} style={{ color: COLORS.muted }} />
          <span className="text-xs uppercase tracking-widest" style={{ color: COLORS.muted }}>ベンチ — {teamNames[team]}</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {bench.map((p) => (
            <div key={p.num} className="rounded-lg px-3 py-2 flex-shrink-0" style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}` }}>
              <div className="font-display font-bold text-lg text-center" style={{ color: COLORS.muted }}>{p.num}</div>
              {p.name && <div className="text-[10px] text-center whitespace-nowrap">{p.name}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Event log */}
      <div className="px-4 pt-5 pb-28 flex-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase tracking-widest" style={{ color: COLORS.muted }}>イベントログ</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowOnlyMarked((v) => !v)}
              className="flex items-center gap-1 text-xs font-display font-semibold px-2 py-1 rounded"
              style={{ background: showOnlyMarked ? COLORS.gold : COLORS.surfaceLight, color: showOnlyMarked ? COLORS.bg : COLORS.gold }}
            >
              <Star size={12} fill={showOnlyMarked ? COLORS.bg : "none"} /> ハーフタイム用のみ
            </button>
            <button onClick={undo} disabled={history.length === 0} className="flex items-center gap-1 text-xs font-display font-semibold px-2 py-1 rounded" style={{ background: COLORS.surfaceLight, color: history.length ? COLORS.coral : COLORS.muted }}>
              <RotateCcw size={12} /> 元に戻す
            </button>
          </div>
        </div>
        <div className="space-y-1.5">
          {events.length === 0 && (
            <div className="text-sm py-6 text-center" style={{ color: COLORS.muted }}>
              まだイベントがありません。上のタブでチームを選び、選手をタップして記録を開始しましょう。
            </div>
          )}
          {showOnlyMarked && events.filter((e) => e.marked).length === 0 && (
            <div className="text-sm py-6 text-center" style={{ color: COLORS.muted }}>
              ★マークされたイベントはまだありません
            </div>
          )}
          {events
            .filter((e) => !showOnlyMarked || e.marked)
            .slice(0, showOnlyMarked ? undefined : 8)
            .map((e) => (
            <div key={e.id} className="flex items-center justify-between rounded-lg px-3 py-2 text-sm" style={{ background: e.marked ? "rgba(242,183,5,0.12)" : COLORS.surface, border: e.marked ? `1px solid ${COLORS.gold}` : "1px solid transparent" }}>
              <button onClick={() => toggleMark(e.id)} className="flex-shrink-0 mr-1" style={{ color: e.marked ? COLORS.gold : COLORS.muted }}>
                <Star size={14} fill={e.marked ? COLORS.gold : "none"} />
              </button>
              <span className="font-mono text-xs" style={{ color: COLORS.muted }}>{fmt(e.ts)}</span>
              <span className="flex-1 px-3">
                <span className="text-[10px] mr-1 px-1 rounded" style={{ background: COLORS.surfaceLight, color: COLORS.muted }}>{teamNames[e.team]}</span>
                #{e.playerNum} {e.playerName} — {e.label}
                {(e.location || e.course || e.shotType || e.situation || e.turnoverType) && (
                  <span className="text-xs ml-1" style={{ color: COLORS.muted }}>
                    ({[
                      e.situation,
                      e.turnoverType,
                      e.shotType,
                      e.location,
                      e.course ? `→${(e.courseType === "out" ? OFF_TARGET_ZONES : GOAL_ZONES).find((z) => z.code === e.course)?.label || e.course}` : null,
                    ].filter(Boolean).join(" / ")})
                  </span>
                )}
              </span>
              {videoId && (
                <button onClick={() => jumpToVideo(e.ts)} className="flex-shrink-0 flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px]" style={{ background: COLORS.surfaceLight, color: COLORS.gold }}>
                  <Video size={10} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      </div>

      {/* Action sheet */}
      {selected && !subPicking && !shotDetailOpen && !situationOpen && !turnoverDetailOpen && (
        <div className="fixed inset-0 z-30 flex items-end" onClick={() => setSelected(null)}>
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.55)" }} />
          <div className="relative w-full rounded-t-2xl p-4 pb-6 z-10" style={{ background: COLORS.surface, borderTop: `1px solid ${COLORS.line}` }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <div className="font-display font-bold text-xl">
                <span style={{ color: COLORS.gold }}>#{selected.num}</span> {selected.name || teamNames[team]}
              </div>
              <button onClick={() => setSelected(null)}><X size={20} /></button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {actionButtons.map((b) => (
                <button
                  key={b.label}
                  onClick={() =>
                    b.cat === "shot" || b.cat === "turnover"
                      ? (setPendingShot({ cat: b.cat, type: b.type, label: b.label, playerNum: selected.num, playerName: selected.name, location: null, course: null, situation: null }),
                        setSituationOpen(true))
                      : logEvent(b.cat, b.type, b.label, selected.num, selected.name)
                  }
                  className="rounded-lg py-3 font-display font-semibold text-sm active:scale-95 transition-transform"
                  style={{ background: COLORS.surfaceLight, color: b.color, border: `1px solid ${COLORS.line}` }}
                >
                  {b.label}
                </button>
              ))}
              <button onClick={() => setSubPicking(true)} className="rounded-lg py-3 font-display font-semibold text-sm col-span-2" style={{ background: COLORS.gold, color: COLORS.bg }}>
                交代する
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Time edit sheet */}
      {timeEditOpen && (
        <div className="fixed inset-0 z-30 flex items-end" onClick={() => setTimeEditOpen(false)}>
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.55)" }} />
          <div
            className="relative w-full rounded-t-2xl p-4 pb-6 z-10"
            style={{ background: COLORS.surface, borderTop: `1px solid ${COLORS.line}` }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="font-display font-bold text-lg">試合時間を修正</div>
              <button onClick={() => setTimeEditOpen(false)}><X size={20} /></button>
            </div>

            <div className="text-xs uppercase tracking-widest mb-2" style={{ color: COLORS.muted }}>クイック調整</div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[-60, -30, -10, 10, 30, 60].map((d) => (
                <button
                  key={d}
                  onClick={() => adjustElapsed(d)}
                  className="rounded-lg py-2.5 text-sm font-display font-semibold"
                  style={{ background: COLORS.surfaceLight, color: d < 0 ? COLORS.coral : COLORS.teal, border: `1px solid ${COLORS.line}` }}
                >
                  {d > 0 ? `+${d}秒` : `${d}秒`}
                </button>
              ))}
            </div>

            <div className="text-xs uppercase tracking-widest mb-2" style={{ color: COLORS.muted }}>時間を直接指定</div>
            <div className="flex items-center gap-2 mb-4">
              <input
                type="number"
                value={timeEditMin}
                onChange={(e) => setTimeEditMin(e.target.value)}
                className="w-20 rounded-md px-2 py-2 text-center font-mono text-lg"
                style={{ background: COLORS.surfaceLight, color: COLORS.text, border: `1px solid ${COLORS.line}` }}
              />
              <span className="text-sm" style={{ color: COLORS.muted }}>分</span>
              <input
                type="number"
                value={timeEditSec}
                onChange={(e) => setTimeEditSec(e.target.value)}
                className="w-20 rounded-md px-2 py-2 text-center font-mono text-lg"
                style={{ background: COLORS.surfaceLight, color: COLORS.text, border: `1px solid ${COLORS.line}` }}
              />
              <span className="text-sm" style={{ color: COLORS.muted }}>秒</span>
            </div>

            <button
              onClick={applyTimeEdit}
              className="w-full rounded-lg py-3 font-display font-bold text-base"
              style={{ background: COLORS.gold, color: COLORS.bg }}
            >
              この時間に設定する
            </button>
            <div className="text-[10px] mt-2" style={{ color: COLORS.muted }}>
              ※ 時間を変更しても、すでに記録したイベントの時刻は変わりません。今から先の記録に影響します。
            </div>
          </div>
        </div>
      )}

      {/* Situation sheet (mandatory: must pick one to proceed) */}
      {situationOpen && pendingShot && (
        <div className="fixed inset-0 z-30 flex items-end">
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.55)" }} />
          <div
            className="relative w-full rounded-t-2xl p-4 pb-6 z-10"
            style={{ background: COLORS.surface, borderTop: `1px solid ${COLORS.line}` }}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="font-display font-bold text-lg">
                <span style={{ color: COLORS.gold }}>#{pendingShot.playerNum}</span> {pendingShot.label}
              </div>
              <button
                onClick={() => { setSituationOpen(false); setPendingShot(null); }}
                style={{ color: COLORS.muted }}
              >
                <X size={20} />
              </button>
            </div>
            <div className="text-xs mb-4" style={{ color: COLORS.muted }}>場面を選んでください(必須)</div>
            <div className="grid grid-cols-1 gap-2">
              {SITUATIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    if (pendingShot.cat === "shot") {
                      setPendingShot((p) => ({ ...p, situation: s }));
                      setSituationOpen(false);
                      setShotDetailOpen(true);
                    } else if (pendingShot.cat === "turnover") {
                      setPendingShot((p) => ({ ...p, situation: s }));
                      setSituationOpen(false);
                      setTurnoverDetailOpen(true);
                    } else {
                      setSituationOpen(false);
                      logEvent(pendingShot.cat, pendingShot.type, pendingShot.label, pendingShot.playerNum, pendingShot.playerName, { situation: s });
                    }
                  }}
                  className="rounded-lg py-3 font-display font-semibold text-sm"
                  style={{ background: COLORS.surfaceLight, color: COLORS.text, border: `1px solid ${COLORS.line}` }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Turnover type sheet (optional) */}
      {turnoverDetailOpen && pendingShot && (
        <div className="fixed inset-0 z-30 flex items-end" onClick={() => setTurnoverDetailOpen(false)}>
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.55)" }} />
          <div
            className="relative w-full rounded-t-2xl p-4 pb-6 z-10"
            style={{ background: COLORS.surface, borderTop: `1px solid ${COLORS.line}` }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="font-display font-bold text-lg">
                <span style={{ color: COLORS.gold }}>#{pendingShot.playerNum}</span> {pendingShot.label}
              </div>
              <button onClick={() => setTurnoverDetailOpen(false)}><X size={20} /></button>
            </div>
            <button
              onClick={() => logEvent(pendingShot.cat, pendingShot.type, pendingShot.label, pendingShot.playerNum, pendingShot.playerName, { situation: pendingShot.situation })}
              className="text-xs underline mb-4"
              style={{ color: COLORS.muted }}
            >
              種類を選ばずこのまま記録する
            </button>

            <div className="text-xs uppercase tracking-widest mb-2" style={{ color: COLORS.muted }}>ターンオーバーの種類(任意)</div>
            <div className="flex flex-wrap gap-2 mb-5">
              {TURNOVER_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setPendingShot((p) => ({ ...p, turnoverType: p.turnoverType === t ? null : t }))}
                  className="rounded-full px-3 py-1.5 text-xs font-display font-semibold"
                  style={{
                    background: pendingShot.turnoverType === t ? COLORS.coral : COLORS.surfaceLight,
                    color: pendingShot.turnoverType === t ? COLORS.bg : COLORS.text,
                    border: `1px solid ${COLORS.line}`,
                  }}
                >
                  {t}
                </button>
              ))}
            </div>

            <button
              onClick={() =>
                logEvent(pendingShot.cat, pendingShot.type, pendingShot.label, pendingShot.playerNum, pendingShot.playerName, {
                  situation: pendingShot.situation,
                  turnoverType: pendingShot.turnoverType,
                })
              }
              className="w-full rounded-lg py-3 font-display font-bold text-base"
              style={{ background: COLORS.gold, color: COLORS.bg }}
            >
              この内容で記録する
            </button>
          </div>
        </div>
      )}

      {/* Shot detail sheet (optional: location & course & type) */}
      {shotDetailOpen && pendingShot && (
        <div className="fixed inset-0 z-30 flex items-end" onClick={() => setShotDetailOpen(false)}>
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.55)" }} />
          <div
            className="relative w-full rounded-t-2xl p-4 pb-6 z-10"
            style={{ background: COLORS.surface, borderTop: `1px solid ${COLORS.line}`, maxHeight: "88vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="font-display font-bold text-lg">
                <span style={{ color: COLORS.gold }}>#{pendingShot.playerNum}</span> {pendingShot.label}
              </div>
              <button onClick={() => setShotDetailOpen(false)}><X size={20} /></button>
            </div>
            <button
              onClick={() => logEvent(pendingShot.cat, pendingShot.type, pendingShot.label, pendingShot.playerNum, pendingShot.playerName, { situation: pendingShot.situation })}
              className="text-xs underline mb-4"
              style={{ color: COLORS.muted }}
            >
              何も選ばずこのまま記録する
            </button>

            {/* 打った場所:9m以内5ゾーン+9m以遠3ゾーン(実コート風・ラベルなし) */}
            <div className="mb-5">
              <div className="text-xs uppercase tracking-widest mb-2" style={{ color: COLORS.muted }}>打った場所(任意)</div>
              <div className="relative w-full rounded-lg overflow-hidden" style={{ aspectRatio: "4 / 3", background: "#0d1319", border: `1px solid ${COLORS.line}` }}>
                {/* 装飾:コートライン(シンプルな固定SVG、ズレの心配がない標準的な弧のみ使用) */}
                <svg viewBox="0 0 200 150" preserveAspectRatio="none" className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }}>
                  <rect x="80" y="2" width="40" height="6" fill={COLORS.gold} />
                  <path d="M 65 8 A 35 35 0 0 0 135 8" fill="none" stroke={COLORS.muted} strokeWidth="1.5" />
                  <path d="M 30 8 A 70 70 0 0 0 170 8" fill="none" stroke={COLORS.muted} strokeWidth="1.5" strokeDasharray="5 4" />
                  <line x1="4" y1="8" x2="4" y2="146" stroke={COLORS.line} strokeWidth="1.5" />
                  <line x1="196" y1="8" x2="196" y2="146" stroke={COLORS.line} strokeWidth="1.5" />
                </svg>

                {/* 9m以内5ゾーン + 9m以遠3ゾーン(共通座標を使用) */}
                {COURT_ZONE_POSITIONS.map((z) => (
                  <button
                    key={z.name}
                    onClick={() => setPendingShot((p) => ({ ...p, location: p.location === z.name ? null : z.name }))}
                    className="absolute rounded-md"
                    style={{
                      left: `${z.x}%`, top: `${z.y}%`, transform: "translate(-50%, -50%)",
                      width: `${z.w}%`, height: `${z.h}%`,
                      background: pendingShot.location === z.name ? COLORS.gold : "rgba(35,47,63,0.85)",
                      border: `1px solid ${COLORS.line}`,
                    }}
                  />
                ))}
              </div>
              <div className="text-center text-xs mt-2" style={{ color: pendingShot.location ? COLORS.gold : COLORS.muted }}>
                {pendingShot.location ? `選択中: ${pendingShot.location}` : "コート図をタップして選択(ラベルは表示されません)"}
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  onClick={() => setPendingShot((p) => ({ ...p, location: p.location === "エンプティー" ? null : "エンプティー" }))}
                  className="rounded-lg py-2 text-xs font-display font-semibold"
                  style={{
                    background: pendingShot.location === "エンプティー" ? COLORS.gold : COLORS.surfaceLight,
                    color: pendingShot.location === "エンプティー" ? COLORS.bg : COLORS.text,
                    border: `1px solid ${COLORS.line}`,
                  }}
                >
                  エンプティー
                </button>
                <button
                  onClick={() => setPendingShot((p) => ({ ...p, location: p.location === "7m" ? null : "7m" }))}
                  className="rounded-lg py-2 text-xs font-display font-semibold"
                  style={{
                    background: pendingShot.location === "7m" ? COLORS.gold : COLORS.surfaceLight,
                    color: pendingShot.location === "7m" ? COLORS.bg : COLORS.text,
                    border: `1px solid ${COLORS.line}`,
                  }}
                >
                  7m
                </button>
              </div>
            </div>

            {/* シュートコース:枠内 + 枠外(短縮コード表示) */}
            <div className="mb-5">
              <div className="text-xs uppercase tracking-widest mb-2" style={{ color: COLORS.muted }}>シュートコース(任意)</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[10px] mb-1 text-center" style={{ color: COLORS.teal }}>枠内</div>
                  <div className="grid grid-cols-3 gap-1">
                    {GOAL_ZONES.map((z) => (
                      <button
                        key={`in-${z.code}`}
                        onClick={() =>
                          setPendingShot((p) => ({
                            ...p,
                            course: p.course === z.code && p.courseType === "in" ? null : z.code,
                            courseType: p.course === z.code && p.courseType === "in" ? null : "in",
                          }))
                        }
                        className="aspect-square rounded-md text-[10px] font-display font-semibold leading-tight px-0.5"
                        style={{
                          background: pendingShot.course === z.code && pendingShot.courseType === "in" ? COLORS.teal : COLORS.surfaceLight,
                          color: pendingShot.course === z.code && pendingShot.courseType === "in" ? COLORS.bg : COLORS.text,
                          border: `1px solid ${COLORS.line}`,
                        }}
                      >
                        {z.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] mb-1 text-center" style={{ color: COLORS.coral }}>枠外</div>
                  <div className="grid grid-cols-3 gap-1">
                    {OFF_TARGET_ZONES.map((z) => (
                      <button
                        key={`out-${z.code}`}
                        onClick={() =>
                          setPendingShot((p) => ({
                            ...p,
                            course: p.course === z.code && p.courseType === "out" ? null : z.code,
                            courseType: p.course === z.code && p.courseType === "out" ? null : "out",
                          }))
                        }
                        className="aspect-square rounded-md text-[9px] font-display font-semibold leading-tight px-0.5"
                        style={{
                          background: pendingShot.course === z.code && pendingShot.courseType === "out" ? COLORS.coral : COLORS.surfaceLight,
                          color: pendingShot.course === z.code && pendingShot.courseType === "out" ? COLORS.bg : COLORS.text,
                          border: `1px solid ${COLORS.line}`,
                        }}
                      >
                        {z.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="text-center text-xs mt-1" style={{ color: COLORS.muted }}>
                {pendingShot.course ? `選択中: ${(pendingShot.courseType === "in" ? GOAL_ZONES : OFF_TARGET_ZONES).find((z) => z.code === pendingShot.course)?.label}` : ""}
              </div>
            </div>

            {/* シュートの種類 */}
            <div className="mb-5">
              <div className="text-xs uppercase tracking-widest mb-2" style={{ color: COLORS.muted }}>シュートの種類(任意)</div>
              <div className="flex flex-wrap gap-2">
                {SHOT_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setPendingShot((p) => ({ ...p, shotType: p.shotType === t ? null : t }))}
                    className="rounded-full px-3 py-1.5 text-xs font-display font-semibold"
                    style={{
                      background: pendingShot.shotType === t ? COLORS.gold : COLORS.surfaceLight,
                      color: pendingShot.shotType === t ? COLORS.bg : COLORS.text,
                      border: `1px solid ${COLORS.line}`,
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() =>
                logEvent(pendingShot.cat, pendingShot.type, pendingShot.label, pendingShot.playerNum, pendingShot.playerName, {
                  location: pendingShot.location,
                  course: pendingShot.course,
                  courseType: pendingShot.courseType,
                  shotType: pendingShot.shotType,
                  situation: pendingShot.situation,
                })
              }
              className="w-full rounded-lg py-3 font-display font-bold text-base"
              style={{ background: COLORS.gold, color: COLORS.bg }}
            >
              この内容で記録する
            </button>
          </div>
        </div>
      )}

      {/* Sub picking sheet */}
      {selected && subPicking && (
        <div className="fixed inset-0 z-30 flex items-end" onClick={() => setSubPicking(false)}>
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.55)" }} />
          <div className="relative w-full rounded-t-2xl p-4 pb-6 z-10" style={{ background: COLORS.surface, borderTop: `1px solid ${COLORS.line}` }} onClick={(e) => e.stopPropagation()}>
            <div className="font-display font-bold text-lg mb-3">#{selected.num} と交代する選手</div>
            <div className="grid grid-cols-3 gap-2">
              {bench.map((p) => (
                <button key={p.num} onClick={() => doSub(selected.num, p.num)} className="rounded-lg py-3 text-center" style={{ background: COLORS.surfaceLight, border: `1px solid ${COLORS.line}` }}>
                  <div className="font-display font-bold text-lg" style={{ color: COLORS.gold }}>{p.num}</div>
                  {p.name && <div className="text-xs">{p.name}</div>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pair edit sheet */}
      {pairEditOpen && (
        <div className="fixed inset-0 z-30 flex items-end" onClick={() => setPairEditOpen(false)}>
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.55)" }} />
          <div
            className="relative w-full rounded-t-2xl p-4 pb-6 z-10"
            style={{ background: COLORS.surface, borderTop: `1px solid ${COLORS.line}`, maxHeight: "80vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="font-display font-bold text-xl">OF/DF ペア編集 — {teamNames[team]}</div>
              <button onClick={() => setPairEditOpen(false)}><X size={20} /></button>
            </div>

            <div className="space-y-2 mb-4">
              {(pairs[team] || []).length === 0 && (
                <div className="text-sm" style={{ color: COLORS.muted }}>まだペアがありません。</div>
              )}
              {(pairs[team] || []).map((pr) => {
                const pa = players.find((p) => p.num === pr.a);
                const pb = players.find((p) => p.num === pr.b);
                return (
                  <div key={pr.id} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: COLORS.surfaceLight }}>
                    <span className="text-sm">
                      #{pr.a} {pa?.name} <span style={{ color: COLORS.muted }}>⇄</span> #{pr.b} {pb?.name}
                    </span>
                    <button onClick={() => removePair(pr.id)} className="text-xs font-display font-semibold" style={{ color: COLORS.coral }}>
                      削除
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="rounded-lg p-3" style={{ background: COLORS.surfaceLight, border: `1px solid ${COLORS.line}` }}>
              <div className="text-xs uppercase tracking-widest mb-2" style={{ color: COLORS.muted }}>新しいペアを追加</div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <select
                  value={newPairA}
                  onChange={(e) => setNewPairA(e.target.value)}
                  className="rounded-lg px-2 py-2 text-sm"
                  style={{ background: COLORS.surface, color: COLORS.text, border: `1px solid ${COLORS.line}` }}
                >
                  <option value="">選手A</option>
                  {players.map((p) => (
                    <option key={p.num} value={p.num}>#{p.num} {p.name}</option>
                  ))}
                </select>
                <select
                  value={newPairB}
                  onChange={(e) => setNewPairB(e.target.value)}
                  className="rounded-lg px-2 py-2 text-sm"
                  style={{ background: COLORS.surface, color: COLORS.text, border: `1px solid ${COLORS.line}` }}
                >
                  <option value="">選手B</option>
                  {players.map((p) => (
                    <option key={p.num} value={p.num}>#{p.num} {p.name}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={addPair}
                disabled={!newPairA || !newPairB || newPairA === newPairB}
                className="w-full rounded-lg py-2 font-display font-semibold text-sm"
                style={{
                  background: newPairA && newPairB && newPairA !== newPairB ? COLORS.gold : COLORS.surface,
                  color: newPairA && newPairB && newPairA !== newPairB ? COLORS.bg : COLORS.muted,
                }}
              >
                ＋ ペアを追加
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-full font-display font-semibold text-sm" style={{ background: COLORS.gold, color: COLORS.bg }}>
          {toast}
        </div>
      )}
    </div>
  );
}
