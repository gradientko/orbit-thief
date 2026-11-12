# orbit-thief

A rotating-space-station timing puzzle built with JavaScript and PHP.

The station never stops moving.

Modules orbit around the central hub at different speeds and directions.

You may transfer between connected modules only when their docking angles are close enough.

## Core mechanic

Every module has:

```text
ring
angle
speed
guarded state
```

Each turn advances orbital geometry.

A transfer is allowed only when two connected modules are within their docking tolerance.

Example:

```text
Hab angle:   122°
Vault angle: 136°

difference: 14°
window: OPEN
```

But one turn later:

```text
Hab angle:   134°
Vault angle: 127°

difference: 7°
still open
```

or:

```text
difference: 31°
window: CLOSED
```

## Objective

Each mission has:

```text
start module
vault module
exit module
```

You must:

```text
reach vault
↓
steal data core
↓
return to exit
```

before the turn limit or alert meter ends the run.

## Emergency dash

You have limited fuel.

A dash lets you force a transfer even when two modules are not currently aligned.

Cost:

```text
1 fuel
+10 alert
```

Use it when the orbit timing would otherwise trap you.

## Security

Guarded modules increase alert more than ordinary modules.

Waiting also slowly increases alert.

When alert reaches:

```text
100%
```

the station locks down.

## Missions

```text
1. Outer Ring
2. Split Orbit
3. Crossing Windows
4. Security Spin
5. Final Rotation
```

Each mission introduces:

- more rings
- more modules
- different orbital speeds
- more guarded sectors
- tighter route planning
- less emergency fuel

## Canvas view

The station is rendered using HTML Canvas.

The interface shows:

- orbital rings
- modules
- guarded nodes
- current position
- links
- currently aligned docking connections
- central hub

The geometry updates after every turn.

## Stack

### JavaScript

Handles:

- orbital movement
- angular calculations
- docking windows
- route validation
- alert
- fuel
- score
- Canvas rendering
- mission progression

### PHP

Handles session records:

```text
runs
wins
best score
best turns
best fuel left
```

No database is required.

## Project structure

```text
orbit-thief/
├── index.php
├── score.php
├── assets/
│   ├── app.js
│   └── style.css
├── README.md
└── LICENSE
```

## Run

```bash
php -S localhost:8000
```

Open:

```text
http://localhost:8000
```

## GitHub Pages

The browser simulation itself is JavaScript, but GitHub Pages cannot execute `score.php`.

Use PHP-capable hosting if you want session records.

## License

MIT
