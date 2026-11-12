(() => {
  const canvas = document.getElementById("stationCanvas");
  const ctx = canvas.getContext("2d");

  const ui = {
    missionStat: document.getElementById("missionStat"),
    turnStat: document.getElementById("turnStat"),
    fuelStat: document.getElementById("fuelStat"),
    alertStat: document.getElementById("alertStat"),
    missionName: document.getElementById("missionName"),
    message: document.getElementById("message"),
    statusPill: document.getElementById("statusPill"),
    currentModule: document.getElementById("currentModule"),
    objectiveText: document.getElementById("objectiveText"),
    windowText: document.getElementById("windowText"),
    currentSide: document.getElementById("currentSide"),
    coreSide: document.getElementById("coreSide"),
    securitySide: document.getElementById("securitySide"),
    scoreSide: document.getElementById("scoreSide"),
    routes: document.getElementById("routes"),
    waitBtn: document.getElementById("waitBtn"),
    dashBtn: document.getElementById("dashBtn"),
    newRunBtn: document.getElementById("newRunBtn"),
    runsRecord: document.getElementById("runsRecord"),
    winsRecord: document.getElementById("winsRecord"),
    scoreRecord: document.getElementById("scoreRecord"),
    turnsRecord: document.getElementById("turnsRecord"),
    fuelRecord: document.getElementById("fuelRecord")
  };

  const missions = [
    {
      name: "Outer Ring",
      maxTurns: 18,
      fuel: 3,
      start: "Dock",
      vault: "Vault",
      exit: "Dock",
      modules: [
        { id:"Dock", ring:0, angle:180, speed:0, guarded:false },
        { id:"Hab", ring:1, angle:205, speed:12, guarded:false },
        { id:"Lab", ring:1, angle:40, speed:12, guarded:true },
        { id:"Vault", ring:2, angle:120, speed:-9, guarded:true },
        { id:"Relay", ring:2, angle:300, speed:-9, guarded:false }
      ],
      links: [["Dock","Hab"],["Dock","Lab"],["Hab","Vault"],["Hab","Relay"],["Lab","Vault"],["Relay","Vault"]]
    },
    {
      name: "Split Orbit",
      maxTurns: 20,
      fuel: 3,
      start: "Dock",
      vault: "Archive",
      exit: "Dock",
      modules: [
        { id:"Dock", ring:0, angle:180, speed:0, guarded:false },
        { id:"A1", ring:1, angle:210, speed:15, guarded:false },
        { id:"A2", ring:1, angle:30, speed:15, guarded:true },
        { id:"B1", ring:2, angle:75, speed:-10, guarded:false },
        { id:"B2", ring:2, angle:255, speed:-10, guarded:true },
        { id:"Archive", ring:3, angle:160, speed:7, guarded:true }
      ],
      links: [["Dock","A1"],["Dock","A2"],["A1","B1"],["A1","B2"],["A2","B1"],["A2","B2"],["B1","Archive"],["B2","Archive"]]
    },
    {
      name: "Crossing Windows",
      maxTurns: 22,
      fuel: 2,
      start: "Dock",
      vault: "Core",
      exit: "Dock",
      modules: [
        { id:"Dock", ring:0, angle:180, speed:0, guarded:false },
        { id:"North", ring:1, angle:270, speed:18, guarded:false },
        { id:"South", ring:1, angle:90, speed:18, guarded:true },
        { id:"Red", ring:2, angle:10, speed:-13, guarded:true },
        { id:"Blue", ring:2, angle:190, speed:-13, guarded:false },
        { id:"Core", ring:3, angle:105, speed:8, guarded:true }
      ],
      links: [["Dock","North"],["Dock","South"],["North","Red"],["North","Blue"],["South","Red"],["South","Blue"],["Red","Core"],["Blue","Core"]]
    },
    {
      name: "Security Spin",
      maxTurns: 24,
      fuel: 2,
      start: "Dock",
      vault: "Blackbox",
      exit: "Dock",
      modules: [
        { id:"Dock", ring:0, angle:180, speed:0, guarded:false },
        { id:"Gate", ring:1, angle:190, speed:20, guarded:true },
        { id:"Store", ring:1, angle:15, speed:20, guarded:false },
        { id:"Ops", ring:2, angle:80, speed:-16, guarded:true },
        { id:"Cold", ring:2, angle:260, speed:-16, guarded:false },
        { id:"Blackbox", ring:3, angle:210, speed:11, guarded:true },
        { id:"Safe", ring:3, angle:30, speed:11, guarded:false }
      ],
      links: [["Dock","Gate"],["Dock","Store"],["Gate","Ops"],["Gate","Cold"],["Store","Ops"],["Store","Cold"],["Ops","Blackbox"],["Ops","Safe"],["Cold","Blackbox"],["Cold","Safe"],["Safe","Blackbox"]]
    },
    {
      name: "Final Rotation",
      maxTurns: 26,
      fuel: 2,
      start: "Dock",
      vault: "Crown",
      exit: "Dock",
      modules: [
        { id:"Dock", ring:0, angle:180, speed:0, guarded:false },
        { id:"R1", ring:1, angle:200, speed:21, guarded:false },
        { id:"R2", ring:1, angle:20, speed:21, guarded:true },
        { id:"S1", ring:2, angle:60, speed:-17, guarded:true },
        { id:"S2", ring:2, angle:180, speed:-17, guarded:false },
        { id:"S3", ring:2, angle:300, speed:-17, guarded:true },
        { id:"T1", ring:3, angle:120, speed:12, guarded:false },
        { id:"T2", ring:3, angle:300, speed:12, guarded:true },
        { id:"Crown", ring:4, angle:225, speed:-7, guarded:true }
      ],
      links: [["Dock","R1"],["Dock","R2"],["R1","S1"],["R1","S2"],["R2","S2"],["R2","S3"],["S1","T1"],["S2","T1"],["S2","T2"],["S3","T2"],["T1","Crown"],["T2","Crown"]]
    }
  ];

  let state;

  function createState() {
    return {
      missionIndex: 0,
      turn: 0,
      alert: 0,
      score: 0,
      fuel: missions[0].fuel,
      current: missions[0].start,
      hasCore: false,
      status: "playing",
      message: "Wait for the docking windows, then move between aligned modules.",
      settled: false,
      angles: Object.fromEntries(missions[0].modules.map(m => [m.id, m.angle]))
    };
  }

  function mission() {
    return missions[state.missionIndex];
  }

  function resetMissionAngles() {
    state.angles = Object.fromEntries(mission().modules.map(m => [m.id, m.angle]));
  }

  function moduleById(id) {
    return mission().modules.find(m => m.id === id);
  }

  function linked(a, b) {
    return mission().links.some(([x,y]) => (x===a && y===b) || (x===b && y===a));
  }

  function nextCandidates() {
    return mission().modules.filter(m => m.id !== state.current && linked(state.current, m.id));
  }

  function angularDistance(a, b) {
    let d = Math.abs((a - b) % 360);
    if (d > 180) d = 360 - d;
    return d;
  }

  function dockingTolerance(a, b) {
    const ma = moduleById(a);
    const mb = moduleById(b);

    if (!ma || !mb) return 0;

    if (ma.ring === 0 || mb.ring === 0) {
      return 24;
    }

    return 18;
  }

  function canDock(a, b) {
    return angularDistance(state.angles[a], state.angles[b]) <= dockingTolerance(a,b);
  }

  function advanceOrbits() {
    for (const m of mission().modules) {
      state.angles[m.id] = normalizeAngle(state.angles[m.id] + m.speed);
    }
  }

  function normalizeAngle(a) {
    return ((a % 360) + 360) % 360;
  }

  function waitTurn() {
    if (state.status !== "playing") return;

    state.turn++;
    advanceOrbits();
    state.alert = clamp(state.alert + (state.alert >= 60 ? 4 : 1), 0, 100);
    state.score = Math.max(0, state.score - 3);

    if (state.alert >= 100) {
      lose("Security triangulated your position.");
      return;
    }

    if (state.turn >= mission().maxTurns) {
      lose("The docking schedule expired before you escaped.");
      return;
    }

    state.message = "Orbit advanced. Recheck the docking windows.";
    render();
  }

  function moveTo(target, forced = false) {
    if (state.status !== "playing") return;
    if (!linked(state.current, target)) return;

    const aligned = canDock(state.current, target);

    if (!aligned && !forced) {
      state.message = "Those modules are not aligned yet.";
      render();
      return;
    }

    if (!aligned && forced) {
      if (state.fuel <= 0) {
        state.message = "No emergency fuel remains.";
        render();
        return;
      }

      state.fuel--;
      state.alert = clamp(state.alert + 10, 0, 100);
    }

    state.turn++;
    state.current = target;

    const mod = moduleById(target);

    if (mod.guarded) {
      state.alert = clamp(state.alert + 12, 0, 100);
    } else {
      state.alert = clamp(state.alert + 3, 0, 100);
    }

    state.score += aligned ? 25 : 10;

    if (!state.hasCore && target === mission().vault) {
      state.hasCore = true;
      state.score += 120;
      state.alert = clamp(state.alert + 15, 0, 100);
      state.message = "Data core acquired. Return to Dock.";
    } else if (state.hasCore && target === mission().exit) {
      completeMission();
      return;
    } else {
      state.message = aligned
        ? `Transferred into ${target}.`
        : `Emergency-dashed into ${target}.`;
    }

    advanceOrbits();

    if (state.alert >= 100) {
      lose("Security locked the station before you could escape.");
      return;
    }

    if (state.turn >= mission().maxTurns) {
      lose("The mission timer expired.");
      return;
    }

    render();
  }

  function completeMission() {
    state.score += Math.max(0, 300 - state.turn * 8 + state.fuel * 20 - state.alert * 2);

    if (state.missionIndex >= missions.length - 1) {
      state.status = "won";
      state.message = "The Crown core is yours. You clear the station before the rings realign.";
      settleRun(true);
      render();
      return;
    }

    state.missionIndex++;
    state.turn = 0;
    state.alert = Math.max(0, state.alert - 30);
    state.fuel = mission().fuel;
    state.current = mission().start;
    state.hasCore = false;
    resetMissionAngles();
    state.message = `Mission ${state.missionIndex + 1}: ${mission().name}. New orbital geometry loaded.`;
    render();
  }

  function lose(message) {
    state.status = "lost";
    state.message = message;
    settleRun(false);
    render();
  }

  async function settleRun(won) {
    if (state.settled) return;
    state.settled = true;

    try {
      const response = await fetch("score.php", {
        method: "POST",
        headers: {"content-type":"application/json"},
        body: JSON.stringify({
          won,
          score: Math.max(0, Math.round(state.score)),
          turns: state.turn,
          fuel: state.fuel
        })
      });

      const data = await response.json();

      if (data.ok && data.stats) {
        ui.runsRecord.textContent = data.stats.runs;
        ui.winsRecord.textContent = data.stats.wins;
        ui.scoreRecord.textContent = data.stats.best_score;
        ui.turnsRecord.textContent = data.stats.best_turns ?? "—";
        ui.fuelRecord.textContent = data.stats.best_fuel;
      }
    } catch {
      // Game remains playable if score persistence fails.
    }
  }

  function render() {
    ui.missionStat.textContent = `${state.missionIndex + 1}/${missions.length}`;
    ui.turnStat.textContent = state.turn;
    ui.fuelStat.textContent = state.fuel;
    ui.alertStat.textContent = `${Math.round(state.alert)}%`;
    ui.missionName.textContent = `MISSION ${state.missionIndex + 1} · ${mission().name.toUpperCase()}`;
    ui.message.textContent = state.message;
    ui.statusPill.textContent = state.status.toUpperCase();
    ui.statusPill.className = `status-pill ${state.status}`;
    ui.currentModule.textContent = state.current;
    ui.currentSide.textContent = state.current;
    ui.objectiveText.textContent = state.hasCore ? `Return to ${mission().exit}` : `Reach ${mission().vault}`;
    ui.coreSide.textContent = state.hasCore ? "stolen" : "not stolen";
    ui.securitySide.textContent = `${Math.round(state.alert)}%`;
    ui.scoreSide.textContent = Math.max(0, Math.round(state.score));

    const candidates = nextCandidates();
    const aligned = candidates.filter(m => canDock(state.current, m.id)).map(m => m.id);
    ui.windowText.textContent = aligned.length ? aligned.join(", ") : "none";

    ui.waitBtn.disabled = state.status !== "playing";
    ui.dashBtn.disabled = state.status !== "playing" || state.fuel <= 0;

    renderRoutes(candidates);
    drawStation();
  }

  function renderRoutes(candidates) {
    ui.routes.innerHTML = "";

    const title = document.createElement("span");
    title.className = "eyebrow";
    title.textContent = "CONNECTED MODULES";
    ui.routes.appendChild(title);

    const wrap = document.createElement("div");

    for (const m of candidates) {
      const aligned = canDock(state.current, m.id);
      const button = document.createElement("button");
      button.type = "button";
      button.className = aligned ? "route aligned" : "route";
      button.innerHTML = `
        <strong>${m.id}</strong>
        <span>${aligned ? "dock window open" : `${Math.round(angularDistance(state.angles[state.current], state.angles[m.id]))}° apart`}</span>
      `;
      button.addEventListener("click", () => moveTo(m.id, false));
      wrap.appendChild(button);
    }

    ui.routes.appendChild(wrap);
  }

  function dashToBestCandidate() {
    if (state.status !== "playing" || state.fuel <= 0) return;

    const candidates = nextCandidates();
    if (!candidates.length) return;

    const target = [...candidates].sort((a,b) =>
      angularDistance(state.angles[state.current], state.angles[a.id]) -
      angularDistance(state.angles[state.current], state.angles[b.id])
    )[0];

    moveTo(target.id, true);
  }

  function drawStation() {
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    ctx.clearRect(0,0,w,h);
    ctx.fillStyle = "#071018";
    ctx.fillRect(0,0,w,h);

    drawStars(w,h);

    const maxRing = Math.max(...mission().modules.map(m => m.ring));
    const ringGap = Math.min(82, 235 / Math.max(1,maxRing));

    for (let r=1; r<=maxRing; r++) {
      ctx.strokeStyle = "#1d2d38";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx,cy,r*ringGap,0,Math.PI*2);
      ctx.stroke();
    }

    drawLinks(cx,cy,ringGap);

    ctx.fillStyle = "#1b2b35";
    ctx.beginPath();
    ctx.arc(cx,cy,42,0,Math.PI*2);
    ctx.fill();

    ctx.fillStyle = "#88b7c9";
    ctx.font = "900 11px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("HUB",cx,cy+4);

    for (const mod of mission().modules) {
      const pos = modulePosition(mod,cx,cy,ringGap);
      const isCurrent = mod.id === state.current;
      const isVault = mod.id === mission().vault;
      const isExit = mod.id === mission().exit;
      const guarded = mod.guarded;

      ctx.fillStyle = isCurrent ? "#d9eff8" : guarded ? "#3b2028" : "#14212a";
      ctx.strokeStyle = isCurrent ? "#77c9e2" : isVault ? "#8d6bd1" : isExit ? "#4e9e75" : "#32434f";
      ctx.lineWidth = isCurrent ? 4 : 2;

      ctx.beginPath();
      ctx.arc(pos.x,pos.y,isCurrent?26:22,0,Math.PI*2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isCurrent ? "#1b4b5e" : "#dbe4ea";
      ctx.font = "800 11px system-ui";
      ctx.textAlign = "center";
      ctx.fillText(mod.id,pos.x,pos.y+4);

      if (guarded) {
        ctx.fillStyle = "#e6798a";
        ctx.font = "900 9px system-ui";
        ctx.fillText("SEC",pos.x,pos.y+37);
      }
    }
  }

  function drawLinks(cx,cy,ringGap) {
    for (const [a,b] of mission().links) {
      const ma = moduleById(a);
      const mb = moduleById(b);
      const pa = modulePosition(ma,cx,cy,ringGap);
      const pb = modulePosition(mb,cx,cy,ringGap);
      const aligned = canDock(a,b);

      ctx.strokeStyle = aligned ? "rgba(104,203,231,.34)" : "rgba(76,92,104,.20)";
      ctx.lineWidth = aligned ? 3 : 1;
      ctx.beginPath();
      ctx.moveTo(pa.x,pa.y);
      ctx.lineTo(pb.x,pb.y);
      ctx.stroke();
    }
  }

  function modulePosition(mod,cx,cy,ringGap) {
    if (mod.ring === 0) {
      return {x:cx-60,y:cy};
    }

    const angle = state.angles[mod.id] * Math.PI / 180;
    const radius = mod.ring * ringGap;

    return {
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius
    };
  }

  function drawStars(w,h) {
    for (let i=0;i<70;i++) {
      const x = (i * 137) % w;
      const y = (i * 83) % h;
      const s = 1 + (i % 2);
      ctx.fillStyle = i % 3 === 0 ? "#2d4350" : "#1c2b34";
      ctx.fillRect(x,y,s,s);
    }
  }

  function clamp(v,min,max) {
    return Math.max(min,Math.min(max,v));
  }

  function resetRun() {
    state = createState();
    render();
  }

  ui.waitBtn.addEventListener("click", waitTurn);
  ui.dashBtn.addEventListener("click", dashToBestCandidate);
  ui.newRunBtn.addEventListener("click", resetRun);

  resetRun();
})();
