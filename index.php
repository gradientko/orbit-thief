<?php
declare(strict_types=1);

session_start();

if (!isset($_SESSION['orbit_thief_stats'])) {
    $_SESSION['orbit_thief_stats'] = [
        'runs' => 0,
        'wins' => 0,
        'best_score' => 0,
        'best_turns' => null,
        'best_fuel' => 0,
    ];
}

$stats = $_SESSION['orbit_thief_stats'];
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Orbit Thief</title>
  <meta name="description" content="A rotating-space-station timing puzzle built with JavaScript and PHP.">
  <link rel="stylesheet" href="assets/style.css">
</head>
<body>
<main class="shell">
  <header class="hero">
    <div>
      <span class="eyebrow">ORBITAL TIMING HEIST</span>
      <h1>Steal the core while the station keeps moving.</h1>
      <p>
        Station modules rotate around the hub. Airlocks align only for brief windows.
        Plan your route, wait for the right docking angle, steal the data core, and escape before security catches up.
      </p>
    </div>
    <button id="newRunBtn" class="text-button" type="button">New run</button>
  </header>

  <section class="top-stats">
    <div><span>Mission</span><strong id="missionStat">1/5</strong></div>
    <div><span>Turns</span><strong id="turnStat">0</strong></div>
    <div><span>Fuel</span><strong id="fuelStat">3</strong></div>
    <div><span>Alert</span><strong id="alertStat">0%</strong></div>
  </section>

  <section class="layout">
    <section class="game-card">
      <div class="game-head">
        <div>
          <span class="eyebrow" id="missionName">MISSION 1 · OUTER RING</span>
          <h2 id="message">Wait for the docking windows, then move between aligned modules.</h2>
        </div>
        <span id="statusPill" class="status-pill playing">PLAYING</span>
      </div>

      <div class="canvas-wrap">
        <canvas id="stationCanvas" width="920" height="620"></canvas>
      </div>

      <section class="readout">
        <div>
          <span class="eyebrow">CURRENT MODULE</span>
          <strong id="currentModule">Dock</strong>
        </div>
        <div>
          <span class="eyebrow">OBJECTIVE</span>
          <strong id="objectiveText">Reach Vault</strong>
        </div>
        <div>
          <span class="eyebrow">DOCK WINDOWS</span>
          <strong id="windowText">Calculating…</strong>
        </div>
      </section>

      <section class="actions">
        <button id="waitBtn" type="button">
          Wait one rotation step
          <span>All orbital modules advance</span>
        </button>
        <button id="dashBtn" type="button">
          Emergency dash
          <span>Force one transfer for 1 fuel</span>
        </button>
      </section>

      <section id="routes" class="routes"></section>
    </section>

    <aside class="side">
      <section class="panel">
        <span class="eyebrow">HEIST STATE</span>
        <dl>
          <div><dt>Current</dt><dd id="currentSide">Dock</dd></div>
          <div><dt>Data core</dt><dd id="coreSide">not stolen</dd></div>
          <div><dt>Security</dt><dd id="securitySide">0%</dd></div>
          <div><dt>Score</dt><dd id="scoreSide">0</dd></div>
        </dl>
      </section>

      <section class="panel">
        <span class="eyebrow">RULE</span>
        <p>
          Each module sits on an orbital ring and advances every turn. You may transfer only when two connected modules
          are within their docking tolerance — unless you spend fuel on an emergency dash.
        </p>
      </section>

      <section class="panel">
        <span class="eyebrow">SECURITY</span>
        <p>
          Waiting is safe but costs time. Moving through guarded modules raises alert.
          High alert makes each additional turn more dangerous, so the best route is about both geometry and timing.
        </p>
      </section>

      <section class="panel">
        <span class="eyebrow">RECORDS</span>
        <dl>
          <div><dt>Runs</dt><dd id="runsRecord"><?= (int)$stats['runs'] ?></dd></div>
          <div><dt>Wins</dt><dd id="winsRecord"><?= (int)$stats['wins'] ?></dd></div>
          <div><dt>Best score</dt><dd id="scoreRecord"><?= (int)$stats['best_score'] ?></dd></div>
          <div><dt>Best turns</dt><dd id="turnsRecord"><?= $stats['best_turns'] ?? '—' ?></dd></div>
          <div><dt>Best fuel left</dt><dd id="fuelRecord"><?= (int)$stats['best_fuel'] ?></dd></div>
        </dl>
      </section>

      <section class="panel">
        <span class="eyebrow">STACK</span>
        <p>
          JavaScript runs orbital movement, transfer timing and Canvas rendering. PHP stores completed-run statistics in the session.
        </p>
      </section>
    </aside>
  </section>

  <footer>
    <span>Canvas · orbital geometry · timing puzzle · PHP session records</span>
    <span>orbit-thief</span>
  </footer>
</main>

<script>
window.ORBIT_THIEF_STATS = <?= json_encode($stats, JSON_UNESCAPED_SLASHES) ?>;
</script>
<script src="assets/app.js" defer></script>
</body>
</html>
