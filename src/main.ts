// Boot: canvas + post-FX setup, fixed-step loop, input, and the QC (review) panel.

import { PostFX, FxState } from './engine/post';
import { Camera, VW, VH } from './engine/camera';
import { Particles } from './engine/particles';
import { Sfx } from './engine/audio';
import { Rng } from './engine/math';
import { loadHero } from './art/heroSprite';
import { loadHeroJump } from './art/heroJump';
import { loadHeroKick } from './art/heroKick';
import { loadStudioAnims } from './art/studioAnim';
import { buildStadium } from './art/stadium';
import type { Env } from './cinematic/timeline';
import { STEP } from './cinematic/timeline';
import { Game } from './game/game';
import { visibleSpecials, type SpecialId } from './cinematic/specials';

const BLURBS: Record<SpecialId, string> = {
  solo: 'Four defenders wall off the box. The floodlights crash off, one follow-spot finds No.10, and his feet play a drum solo: a step-over, a sole lift over a slide tackle, an elastico and a nutmeg, every touch on the beat, every beat leaving a violet print of light.',
  solo2: 'Four giants stomp at No.10 and the whole stadium stomps with them. He raises his arm and SNAPS: the floodlights blow out, and in the black only the ball and his eyes glow. Then he goes: every skill rips the turf open with ultraviolet light, the strobe photographs each defender mid-defeat, and at the end the crowd stomps on his beat, the stadium slams back on and he taps it past the fallen keeper.',
  zenith: 'No.10 flicks the ball into the sky, leaps after it, and volleys it down from in front of the full moon like a falling star.',
  crescent: 'Back to goal, No.10 flips upside down under a high cross. The stadium turns over with him, and his boot carves a crescent of crimson fire that carries the ball into the net.',
  gale: 'The keeper laughs at No.10 from 30 m. He grabs the wind out of the stadium, hammers the ball through the sound barrier, and when the keeper stops it dead, the thunder catches up and smashes it in, shoving the whole goal off its line.',
  gale2: 'The keeper laughs at No.10 from 30 m. He grabs the wind out of the stadium, hammers the ball through the sound barrier, and when the keeper stops it dead, the thunder catches up and smashes it in, shoving the whole goal off its line.',
  meridian: 'No.10 looks one way and passes the other. Without looking, he rolls the ball with the outside of his boot through three needle-eye gaps into No.7\'s stride. The stadium drains to manga ink, and when No.7 touches the ball the colour washes back along the thread.',
  meridian2: 'No.10 taps under his eye and draws a line across the sky to his friend. Without looking, he lofts the ball with the outside of his boot into a great jade arc, 26 m up at floodlight height. An eye of light opens in the night, the biggest defender grabs the thread, and No.10 strums the air: TWANG. The needle falls onto No.7\'s run and he scores with a flying header while the net rings like a harp.',
};

async function boot() {
  try {
    await Promise.race([
      Promise.all([document.fonts.load('40px "Anton"'), document.fonts.load('12px "Silkscreen"')]),
      new Promise((r) => setTimeout(r, 2500)),
    ]);
  } catch {
    /* fall back to system fonts */
  }

  const view = document.getElementById('view') as HTMLCanvasElement;
  const stage = document.getElementById('stage') as HTMLElement;
  const src = document.createElement('canvas');
  const ctx = src.getContext('2d', { alpha: false })!;
  let post = PostFX.create(view);
  let usePost = !!post;
  let ctx2dView: CanvasRenderingContext2D | null = null;
  if (!post) {
    ctx2dView = view.getContext('2d');
  }

  // The jump and flick/volley frames live in module singletons (heroJump(), heroKick()); preload them with the face sprite.
  const [hero] = await Promise.all([loadHero(), loadHeroJump(), loadHeroKick(), loadStudioAnims()]);
  const art = { hero, stadium: buildStadium() };
  const fx = new FxState();
  const cam = new Camera();
  const env: Env = {
    ctx,
    S: 1,
    cam,
    fx,
    parts: new Particles(),
    sfx: new Sfx(),
    art,
    rng: new Rng(1),
    frng(salt = 0) {
      // During a special, flicker follows the cinematic clock so a frame looks the same however it was reached.
      const ft = !game ? 0 : game.phase === 'special' ? Math.floor(game.special.globalTime * 30 + 1e-6) : Math.floor(game.time * 30);
      return new Rng((ft * 7919 + salt * 104729) | 0);
    },
    screen() {
      ctx.setTransform(env.S, 0, 0, env.S, 0, 0);
      ctx.imageSmoothingEnabled = false;
    },
    world() {
      cam.apply(ctx, env.S);
      ctx.imageSmoothingEnabled = false;
    },
  };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssW = stage.clientWidth;
    let w = Math.round(cssW * dpr);
    w = Math.min(w, 1920);
    w = Math.max(320, w);
    const h = Math.round((w * VH) / VW);
    for (const c of [view, src]) {
      if (c.width !== w || c.height !== h) {
        c.width = w;
        c.height = h;
      }
    }
    env.S = w / VW;
  };
  resize();
  new ResizeObserver(resize).observe(stage);

  const game = new Game(env);
  (window as any).__game = game;

  // ---------------------------------------------------------------- QC state
  let speed = 1;
  let paused = false;
  let stepOnce = false;

  // ---------------------------------------------------------------- loop
  let last = performance.now();
  let acc = 0;
  const frame = (now: number) => {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    if (!paused) acc += dt * speed;
    if (stepOnce) {
      acc += STEP;
      stepOnce = false;
    }
    while (acc >= STEP) {
      game.update(STEP);
      acc -= STEP;
    }
    game.render();
    if (usePost && post) {
      post.render(src, fx, game.phase === 'special' ? game.special.globalTime : game.time);
    } else if (ctx2dView) {
      ctx2dView.drawImage(src, 0, 0);
      if (fx.flash > 0) {
        ctx2dView.fillStyle = `rgba(255,255,255,${fx.flash})`;
        ctx2dView.fillRect(0, 0, view.width, view.height);
      }
    }
    ui.sync();
    requestAnimationFrame(frame);
  };

  // ---------------------------------------------------------------- UI
  const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
  const shotsEl = $('shots');
  const scrub = $<HTMLInputElement>('scrub');
  const timeEl = $('time');
  const shotNameEl = $('shotname');
  const pauseBtn = $<HTMLButtonElement>('btn-pause');
  const pickEl = $('specials');
  let special = game.special;

  const buildShotChips = () => {
    shotsEl.replaceChildren();
    special.shots.forEach((s, i) => {
      const b = document.createElement('button');
      b.className = 'chip';
      b.type = 'button';
      b.id = `shot-${i + 1}`;
      b.textContent = `${i + 1} ${s.name}`;
      b.title = `Jump to shot ${i + 1} (key ${i + 1})`;
      b.onclick = () => jumpShot(i);
      shotsEl.appendChild(b);
    });
    scrub.max = String(special.total);
  };

  const selectSpecial = (id: SpecialId) => {
    game.select(id);
    special = game.special;
    buildShotChips();
    document.querySelectorAll<HTMLInputElement>('input[name="special"]').forEach((r) => (r.checked = r.value === id));
    titleEl.textContent = game.def.name;
    kindEl.textContent = `${game.def.kind.toUpperCase()} · No.10`;
    blurbEl.textContent = BLURBS[id];
    try {
      localStorage.setItem('special', id);
    } catch {
      /* storage unavailable: selection just isn't remembered */
    }
  };

  // Work-in-progress specials show with ?all, or in the preview build (VITE_SHOW_ALL=1).
  const VISIBLE = visibleSpecials(new URLSearchParams(location.search).has('all') || import.meta.env.VITE_SHOW_ALL === '1');
  const titleEl = $('title');
  const kindEl = $('kind');
  const blurbEl = $('blurb');
  VISIBLE.forEach((d) => {
    const id = `sp-${d.id}`;
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'special';
    input.id = id;
    input.value = d.id;
    const label = document.createElement('label');
    label.htmlFor = id;
    label.textContent = d.name;
    input.addEventListener('change', () => selectSpecial(d.id));
    pickEl.append(input, label);
  });

  const jumpShot = (i: number) => {
    if (game.phase !== 'special') game.unleash(i);
    else special.start(i);
  };

  // FlashBudget (v2 set): red ticks under the scrubber where the photosensitivity guard had to clamp an event.
  const flashMarks = document.createElement('div');
  flashMarks.style.cssText = 'position:absolute;height:3px;pointer-events:none';
  scrub.parentElement!.style.position = 'relative';
  scrub.parentElement!.appendChild(flashMarks);
  let flashSeen = -1;
  const ui = {
    sync() {
      const ev = special.budget?.events ?? [];
      if (ev.length !== flashSeen) {
        flashSeen = ev.length;
        flashMarks.style.left = `${scrub.offsetLeft}px`;
        flashMarks.style.top = `${scrub.offsetTop + scrub.offsetHeight - 2}px`;
        flashMarks.style.width = `${scrub.offsetWidth}px`;
        flashMarks.replaceChildren(
          ...ev.filter((e) => e.clamped).map((e) => {
            const m = document.createElement('i');
            m.style.cssText = `position:absolute;top:0;width:2px;height:3px;background:#ff3030;left:${(100 * e.t) / special.total}%`;
            m.title = `FlashBudget clamped a ${e.kind} event at ${e.t.toFixed(2)} s`;
            return m;
          }),
        );
      }
      const inSpecial = game.phase === 'special';
      const gt = inSpecial ? special.globalTime : 0;
      if (document.activeElement !== scrub) scrub.value = String(gt);
      timeEl.textContent = inSpecial ? `${gt.toFixed(2)}s / ${special.total.toFixed(2)}s` : `— / ${special.total.toFixed(2)}s`;
      shotNameEl.textContent = inSpecial
        ? `Shot ${special.idx + 1} · ${special.shot.name}`
        : game.field.mode === 'command'
          ? 'Command window: press Space or tap'
          : game.field.mode === 'result'
            ? 'Result'
            : 'Field';
      shotsEl.querySelectorAll('.chip').forEach((el, i) => el.classList.toggle('on', inSpecial && i === special.idx));
      pauseBtn.textContent = paused ? 'Resume' : 'Pause';
      pauseBtn.setAttribute('aria-pressed', String(paused));
    },
  };

  scrub.addEventListener('input', () => {
    if (game.phase !== 'special') game.unleash(0);
    special.seek(parseFloat(scrub.value));
  });

  $('btn-special').onclick = () => game.unleash(0);
  $('btn-kickoff').onclick = () => game.kickoff();
  pauseBtn.onclick = () => (paused = !paused);
  $('btn-step').onclick = () => {
    paused = true;
    stepOnce = true;
  };
  document.querySelectorAll<HTMLInputElement>('input[name="speed"]').forEach((r) => {
    r.addEventListener('change', () => (speed = parseFloat(r.value)));
  });
  $<HTMLInputElement>('opt-fx').addEventListener('change', (e) => (usePost = (e.target as HTMLInputElement).checked && !!post));
  $<HTMLInputElement>('opt-audio').addEventListener('change', (e) => {
    env.sfx.unlock();
    env.sfx.setEnabled((e.target as HTMLInputElement).checked);
  });
  $<HTMLInputElement>('opt-auto').addEventListener('change', (e) => (game.autoplay = (e.target as HTMLInputElement).checked));

  view.addEventListener('pointerdown', () => game.confirm());
  window.addEventListener('keydown', (e) => {
    if ((e.target as HTMLElement)?.tagName === 'INPUT' && (e.target as HTMLInputElement).type === 'range') return;
    const k = e.key.toLowerCase();
    if (k === ' ' || k === 'enter') {
      e.preventDefault();
      game.confirm();
    } else if (k === 'r') game.unleash(0);
    else if (k === 'k') game.kickoff();
    else if (k === 'p') paused = !paused;
    else if (k === '.') {
      paused = true;
      stepOnce = true;
    } else if (/^[1-9]$/.test(k) && +k <= special.shots.length) jumpShot(+k - 1);
  });

  // Dev review hooks (local server only): ?seek=<seconds>&pause opens the special at that time.
  const params = new URLSearchParams(location.search);
  if (params.has('nofx')) usePost = false;
  (window as any).__qc = {
    seek(t: number) {
      if (game.phase !== 'special') game.unleash(0);
      special.seek(t);
      paused = true;
    },
    /** Select a special, then freeze at `local` seconds into shot `i` (0-based). */
    seekShot(id: SpecialId, i: number, local: number) {
      if (game.def.id !== id) selectSpecial(id);
      if (game.phase !== 'special') game.unleash(0);
      special.seek(special.startOf(i) + local);
      paused = true;
    },
    select: selectSpecial,
    play() {
      paused = false;
    },
    /** FlashBudget (v2 specials): the full-frame events recorded so far ({ t, kind, clamped }); [] for the others. */
    flashEvents() {
      return special.budget?.events.map((e) => ({ ...e })) ?? [];
    },
    /**
     * MERIDIAN v2's halftone check: toneProbe(true) makes every halftone (fx.tone) impact frame also measure the share of
     * the frame inside the threshold band (PostFX.toneProbe); toneEvents() returns [{ t, frac }] (frac <= 0.25 to pass).
     */
    toneProbe(on = true) {
      PostFX.toneProbe = on;
      if (on) PostFX.toneLog = [];
    },
    toneEvents() {
      return PostFX.toneLog.map((e) => ({ ...e }));
    },
  };

  let initial: SpecialId = 'crescent';
  try {
    const saved = localStorage.getItem('special');
    if (saved && VISIBLE.some((d) => d.id === saved)) initial = saved as SpecialId;
  } catch {
    /* ignore */
  }
  const qs = params.get('special');
  if (qs && VISIBLE.some((d) => d.id === qs)) initial = qs as SpecialId;
  selectSpecial(initial);
  if (params.has('seek')) {
    game.unleash(0);
    special.seek(parseFloat(params.get('seek')!));
    paused = params.has('pause');
  }
  requestAnimationFrame(frame);
  document.body.classList.add('ready');
}

boot();
