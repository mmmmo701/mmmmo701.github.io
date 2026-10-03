/* NashHack — a tiny roguelike in the spirit of NetHack where every fight is a
   2x2 zero-sum game. You pick a row, the monster picks a column, and the cell
   says who takes damage. Each monster plays a fixed strategy; all of them can
   be exploited except the Nash Knight and the boss. Mounted into #nashhack. */
(function () {
    'use strict';

    var W = 41, H = 15, FLOORS = 5, MAX_HP = 20, POTION = 6;
    var ROWS = ['Strike', 'Feint'];
    var COLS = ['Lunge', 'Block'];
    var VERBS = ['lunges', 'blocks'];
    var DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    var KEYS = {
        ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1],
        h: [-1, 0], l: [1, 0], k: [0, -1], j: [0, 1],
        a: [-1, 0], d: [1, 0], w: [0, -1], s: [0, 1]
    };

    function rnd(n) { return Math.floor(Math.random() * n); }
    function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
    function at(list, x, y) {
        for (var i = 0; i < list.length; i++) if (list[i].x === x && list[i].y === y) return list[i];
        return null;
    }

    /* --- Game theory ----------------------------------------------------- */

    // M[i][j] is the player's payoff: the row player maximises, the monster
    // minimises. Returns the game value v and q = P(monster plays column 0).
    function solve(M) {
        for (var i = 0; i < 2; i++) for (var j = 0; j < 2; j++) {
            var x = M[i][j];
            if (x <= M[i][1 - j] && x >= M[1 - i][j]) return { saddle: true, q: j === 0 ? 1 : 0, v: x };
        }
        var d = M[0][0] - M[0][1] - M[1][0] + M[1][1];
        return { saddle: false, q: (M[1][1] - M[0][1]) / d, v: (M[0][0] * M[1][1] - M[0][1] * M[1][0]) / d };
    }

    function coin() { return rnd(2); }
    function greedy(m) {
        return Math.min(m.M[0][1], m.M[1][1]) < Math.min(m.M[0][0], m.M[1][0]) ? 1 : 0;
    }
    function mirror(m) { return m.hist.length ? m.hist[m.hist.length - 1][0] : rnd(2); }
    function fictitious(m) {
        var c = [1, 1];
        m.hist.forEach(function (h) { c[h[0]]++; });
        var e0 = c[0] * m.M[0][0] + c[1] * m.M[1][0];
        var e1 = c[0] * m.M[0][1] + c[1] * m.M[1][1];
        return e0 === e1 ? rnd(2) : (e0 < e1 ? 0 : 1);
    }
    function nash(m) { return Math.random() < solve(m.M).q ? 0 : 1; }

    var KINDS = {
        r: { name: 'Uniform Rat', hint: 'Flips a fair coin every round.', hp: 4, from: 1, pick: coin },
        g: { name: 'Greedy Goblin', hint: 'Always picks the column holding the cell that is worst for you.', hp: 5, from: 1, pick: greedy },
        m: { name: 'Mirror Mimic', hint: 'Echoes your last move: after a Strike it Lunges, after a Feint it Blocks.', hp: 6, from: 1, pick: mirror },
        f: { name: 'Fictitious Phantom', hint: 'Best-responds to how often you have played each row so far.', hp: 7, from: 2, pick: fictitious },
        k: { name: 'Nash Knight', hint: 'Plays its minimax mixed strategy. It cannot be exploited.', hp: 7, from: 3, pick: nash, fair: true },
        A: { name: 'The Ackermann', hint: 'Grows faster than you can recurse. Plays perfect minimax.', hp: 14, from: 99, pick: nash, fair: true }
    };

    // Exploitable monsters get games that may be slightly unfavourable at
    // equilibrium (you must exploit them); fair ones get a mixed game you win
    // slowly if you play well. No cell is 0, so every round hurts someone and
    // a fight can never stall.
    function cell() { var v = 1 + rnd(4); return Math.random() < 0.5 ? v : -v; }
    function makeMatrix(kind) {
        var lo = kind.fair ? 0.3 : -0.25, hi = kind.fair ? 1.2 : 1;
        for (;;) {
            var M = [[cell(), cell()], [cell(), cell()]];
            var flat = M[0].concat(M[1]);
            if (Math.min.apply(null, flat) >= 0 || Math.max.apply(null, flat) <= 0) continue;
            var s = solve(M);
            if (kind.fair && s.saddle) continue;
            if (s.v >= lo && s.v <= hi) return M;
        }
    }

    /* --- Dungeon --------------------------------------------------------- */

    function bfs(map, sx, sy) {
        var dist = [], q = [[sx, sy]], x, y;
        for (y = 0; y < H; y++) { dist.push([]); for (x = 0; x < W; x++) dist[y].push(-1); }
        dist[sy][sx] = 0;
        while (q.length) {
            var c = q.shift();
            DIRS.forEach(function (d) {
                var nx = c[0] + d[0], ny = c[1] + d[1];
                if (map[ny][nx] === '.' && dist[ny][nx] < 0) { dist[ny][nx] = dist[c[1]][c[0]] + 1; q.push([nx, ny]); }
            });
        }
        return dist;
    }

    function enterFloor() {
        var map = [], cells = [], x, y;
        for (y = 0; y < H; y++) { map.push([]); for (x = 0; x < W; x++) map[y].push('#'); }

        // Drunkard's walk, favouring sideways steps because the map is wide.
        var want = Math.floor((W - 2) * (H - 2) * 0.4);
        x = W >> 1; y = H >> 1;
        while (cells.length < want) {
            if (map[y][x] === '#') { map[y][x] = '.'; cells.push([x, y]); }
            var d = DIRS[Math.random() < 0.6 ? rnd(2) : 2 + rnd(2)];
            x = clamp(x + d[0], 1, W - 2);
            y = clamp(y + d[1], 1, H - 2);
        }

        var start = cells[rnd(cells.length)];
        var dist = bfs(map, start[0], start[1]);
        var far = cells.reduce(function (a, c) { return dist[c[1]][c[0]] > dist[a[1]][a[0]] ? c : a; });
        var last = S.depth === FLOORS;
        var mons = [], items = [];

        function freeCell() {
            for (var t = 0; ; t++) {
                var c = cells[rnd(cells.length)];
                if ((dist[c[1]][c[0]] >= 5 || t > 500) && c !== far && c !== start &&
                    !at(mons, c[0], c[1]) && !at(items, c[0], c[1])) return c;
            }
        }
        function spawn(k, c) {
            var hp = k === 'A' ? KINDS.A.hp : KINDS[k].hp + S.depth - 1;
            mons.push({ k: k, x: c[0], y: c[1], hp: hp, max: hp, M: null, hist: [], stun: 0 });
        }

        var pool = Object.keys(KINDS).filter(function (k) { return KINDS[k].from <= S.depth; });
        var n = last ? 3 : 2 + S.depth;
        for (var i = 0; i < n; i++) spawn(pool[rnd(pool.length)], freeCell());
        if (last) spawn('A', far);
        for (i = 0; i < 1 + (S.depth >= 3 ? 1 : 0); i++) { var c = freeCell(); items.push({ x: c[0], y: c[1] }); }

        S.map = map;
        S.px = start[0]; S.py = start[1];
        S.stairs = last ? null : far;
        S.mons = mons;
        S.items = items;
        S.seen = map.map(function (row) { return row.map(function () { return false; }); });
        reveal();
    }

    // Characters are taller than wide, so sight reaches further sideways.
    function visible(x, y) {
        var dx = x - S.px, dy = y - S.py;
        return dx * dx * 0.45 + dy * dy <= 25;
    }
    function reveal() {
        for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) if (visible(x, y)) S.seen[y][x] = true;
    }

    /* --- Turns ----------------------------------------------------------- */

    var S = { mode: 'title' };

    function say(msg) { S.msg = msg; }

    function newGame() {
        S = { mode: 'map', depth: 1, hp: MAX_HP, kills: 0 };
        enterFloor();
        say('You enter the dungeon. Find the > to descend.');
    }

    function move(dx, dy) {
        var nx = S.px + dx, ny = S.py + dy;
        if (S.map[ny][nx] === '#') return;
        var m = at(S.mons, nx, ny);
        if (m) { startFight(m); return; }

        S.px = nx; S.py = ny;
        say('');
        var it = at(S.items, nx, ny);
        if (it) {
            S.items.splice(S.items.indexOf(it), 1);
            S.hp = Math.min(MAX_HP, S.hp + POTION);
            say('You quaff a potion. It tastes like a fixed point.');
        }
        if (S.stairs && nx === S.stairs[0] && ny === S.stairs[1]) {
            S.depth++;
            S.hp = Math.min(MAX_HP, S.hp + 3);
            enterFloor();
            say(S.depth === FLOORS ? 'Floor ' + FLOORS + '. Something enormous is recursing nearby.' : 'You descend to floor ' + S.depth + '.');
            return;
        }
        monstersAct();
        reveal();
    }

    function monstersAct() {
        for (var i = 0; i < S.mons.length; i++) {
            var m = S.mons[i];
            if (m.stun > 0) { m.stun--; continue; }
            var dx = S.px - m.x, dy = S.py - m.y, tries = [];
            if (Math.abs(dx) + Math.abs(dy) <= 7) {
                var sx = [Math.sign(dx), 0], sy = [0, Math.sign(dy)];
                tries = Math.abs(dx) >= Math.abs(dy) ? [sx, sy] : [sy, sx];
            } else if (Math.random() < 0.3) {
                tries = [DIRS[rnd(4)]];
            }
            for (var t = 0; t < tries.length; t++) {
                if (!tries[t][0] && !tries[t][1]) continue;
                var nx = m.x + tries[t][0], ny = m.y + tries[t][1];
                if (nx === S.px && ny === S.py) { startFight(m); return; }
                if (S.map[ny][nx] === '.' && !at(S.mons, nx, ny)) { m.x = nx; m.y = ny; break; }
            }
        }
    }

    function startFight(m) {
        if (!m.M) m.M = makeMatrix(KINDS[m.k]);
        S.foe = m;
        S.mode = 'fight';
        S.last = null;
        say('The ' + KINDS[m.k].name + ' engages you!');
    }

    function play(r) {
        var m = S.foe, kind = KINDS[m.k], c = kind.pick(m), v = m.M[r][c];
        m.hist.push([r, c]);
        S.last = [r, c];
        var msg = 'You ' + ROWS[r].toLowerCase() + ', it ' + VERBS[c] + '. ';
        if (v > 0) { m.hp -= v; msg += 'It takes ' + v + '.'; }
        else if (v < 0) { S.hp += v; msg += 'You take ' + (-v) + '.'; }
        else msg += 'Nothing happens.';

        if (m.hp <= 0) {
            S.mons.splice(S.mons.indexOf(m), 1);
            S.kills++;
            if (m.k === 'A') { S.mode = 'won'; return; }
            S.mode = 'map';
            msg += ' The ' + kind.name + ' is defeated.';
            if (Math.random() < 0.3 && !at(S.items, m.x, m.y)) { S.items.push({ x: m.x, y: m.y }); msg += ' It drops a potion.'; }
        } else if (S.hp <= 0) {
            S.mode = 'dead';
        }
        say(msg);
    }

    function flee() {
        S.hp -= 1;
        S.foe.stun = 3;
        S.mode = S.hp <= 0 ? 'dead' : 'map';
        say('You flee, taking 1 damage. The ' + KINDS[S.foe.k].name + ' is dazed.');
    }

    /* --- Rendering ------------------------------------------------------- */

    var root = document.getElementById('nashhack');
    if (!root) return;

    function cellHTML(x, y) {
        if (x === S.px && y === S.py) return '<span class="nh-p">@</span>';
        if (!S.seen[y][x]) return ' ';
        var vis = visible(x, y), m = vis && at(S.mons, x, y);
        if (m) return '<span class="nh-m nh-is-' + m.k + '">' + m.k + '</span>';
        if (at(S.items, x, y)) return '<span class="nh-i">!</span>';
        if (S.stairs && x === S.stairs[0] && y === S.stairs[1]) return '<span class="nh-s">&gt;</span>';
        var ch = S.map[y][x];
        return '<span class="' + (ch === '#' ? 'nh-w' : 'nh-f') + (vis ? '' : ' nh-dim') + '">' + ch + '</span>';
    }

    function mapHTML() {
        var rows = [];
        for (var y = 0; y < H; y++) {
            var row = '';
            for (var x = 0; x < W; x++) row += cellHTML(x, y);
            rows.push(row);
        }
        return '<pre class="nh-map" aria-label="Dungeon map">' + rows.join('\n') + '</pre>' +
            '<div class="nh-help">Move with arrows, WASD or hjkl. Walk into a monster to fight it. ' +
            '<span class="nh-s">&gt;</span> stairs · <span class="nh-i">!</span> potion</div>' +
            '<div class="nh-pad">' +
            '<button type="button" data-act="move" data-dx="0" data-dy="-1" aria-label="Up">↑</button>' +
            '<button type="button" data-act="move" data-dx="-1" data-dy="0" aria-label="Left">←</button>' +
            '<button type="button" data-act="move" data-dx="0" data-dy="1" aria-label="Down">↓</button>' +
            '<button type="button" data-act="move" data-dx="1" data-dy="0" aria-label="Right">→</button>' +
            '</div>';
    }

    function fightHTML() {
        var m = S.foe, kind = KINDS[m.k], h = '';
        h += '<div class="nh-foe"><span class="nh-m nh-' + m.k + '">' + m.k + '</span> <b>' + kind.name +
            '</b> · HP ' + Math.max(0, m.hp) + '/' + m.max + '</div>';
        h += '<div class="nh-hint">' + kind.hint + '</div>';
        h += '<table class="nh-matrix"><tr><th></th><th>' + COLS[0] + '</th><th>' + COLS[1] + '</th></tr>';
        for (var r = 0; r < 2; r++) {
            h += '<tr><th><button type="button" data-act="row" data-r="' + r + '">' + (r + 1) + ' · ' + ROWS[r] + '</button></th>';
            for (var c = 0; c < 2; c++) {
                var v = m.M[r][c];
                var cls = (v > 0 ? 'nh-pos' : v < 0 ? 'nh-neg' : '') +
                    (S.last && S.last[0] === r && S.last[1] === c ? ' nh-last' : '');
                h += '<td class="' + cls + '">' + (v > 0 ? '+' + v : v < 0 ? '−' + (-v) : '0') + '</td>';
            }
            h += '</tr>';
        }
        h += '</table>';
        h += '<div class="nh-help">You pick a row, it picks a column. +n: it loses n HP · −n: you lose n HP.</div>';
        if (m.hist.length) {
            h += '<div class="nh-help">History: ' + m.hist.slice(-10).map(function (p) {
                return ROWS[p[0]][0] + '/' + COLS[p[1]][0];
            }).join(' ') + '</div>';
        }
        h += '<div class="nh-pad"><button type="button" data-act="flee">F · Flee (−1 HP)</button></div>';
        return h;
    }

    function cardHTML(title, body, label) {
        return '<div class="nh-card"><div class="nh-big">' + title + '</div><p>' + body + '</p>' +
            '<button type="button" data-act="start">' + label + '</button>' +
            '<div class="nh-help">or press Enter</div></div>';
    }

    function render() {
        var hadFocus = root.contains(document.activeElement);
        var h = '';
        if (S.mode !== 'title') {
            h += '<div class="nh-status"><span>HP <b>' + Math.max(0, S.hp) + '/' + MAX_HP + '</b>' +
                '<span class="nh-bar"><span style="width:' + (100 * Math.max(0, S.hp) / MAX_HP) + '%"></span></span></span>' +
                '<span>Floor <b>' + S.depth + '/' + FLOORS + '</b></span><span>Kills <b>' + S.kills + '</b></span></div>';
        }
        if (S.mode === 'title') {
            h += cardHTML('NashHack', 'Five floors, a dozen monsters, and no dice. Only payoff matrices.', 'Start');
        } else if (S.mode === 'map') {
            h += mapHTML();
        } else if (S.mode === 'fight') {
            h += fightHTML();
        } else if (S.mode === 'dead') {
            h += cardHTML('You diverged', 'You fell on floor ' + S.depth + ' after ' + S.kills + ' kills. ' + S.msg, 'Try again');
        } else {
            h += cardHTML('Halted', 'The Ackermann has been reduced to a base case. You win with ' + S.hp +
                ' HP and ' + S.kills + ' kills.', 'Play again');
        }
        if (S.mode === 'map' || S.mode === 'fight') h += '<div class="nh-log" aria-live="polite">' + (S.msg || '&nbsp;') + '</div>';
        root.innerHTML = h;
        // Re-rendering removes the focused button; keep keyboard focus in the game.
        if (hadFocus && !root.contains(document.activeElement)) root.focus({ preventScroll: true });
    }

    root.addEventListener('click', function (e) {
        var b = e.target.closest('button[data-act]');
        if (!b) return;
        var act = b.getAttribute('data-act');
        if (act === 'start') newGame();
        else if (act === 'move' && S.mode === 'map') move(+b.getAttribute('data-dx'), +b.getAttribute('data-dy'));
        else if (act === 'row' && S.mode === 'fight') play(+b.getAttribute('data-r'));
        else if (act === 'flee' && S.mode === 'fight') flee();
        render();
    });

    root.addEventListener('keydown', function (e) {
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        var k = e.key.length === 1 ? e.key.toLowerCase() : e.key, handled = true;
        if (S.mode === 'map' && KEYS[k]) move(KEYS[k][0], KEYS[k][1]);
        else if (S.mode === 'fight' && (k === '1' || k === '2')) play(+k - 1);
        else if (S.mode === 'fight' && k === 'f') flee();
        else if (S.mode !== 'map' && S.mode !== 'fight' && (k === 'Enter' || k === ' ')) newGame();
        else handled = false;
        if (handled) { e.preventDefault(); render(); }
    });

    render();
})();
