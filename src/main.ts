// Boot: canvas + post-FX setup, fixed-step loop, input, and the QC (review) panel.

import { PostFX, FxState } from './engine/post';
import { Camera, VW, VH } from './engine/camera';
import { Particles } from './engine/particles';
import { Sfx } from './engine/audio';
import { Rng } from './engine/math';
import { loadHero } from './art/heroSprite';
import { loadHeroJump } from './art/heroJump';
import { buildStadium } from './art/stadium';
import type { Env } from './cinematic/timeline';
import { STEP } from './cinematic/timeline';
import { Game } from './game/game';
import { SPECIALS, type SpecialId } from './cinematic/specials';

const BLURBS: Record<SpecialId, string> = {
  zenith: 'No.10 flicks the ball into the sky, leaps after it, and volleys it down from in front of the full moon like a falling star.',
  crescent: 'Back to goal, No.10 flips upside down under a high cross. The stadium turns over with him, and his boot carves a crescent of crimson fire that carries the ball into the net.',
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

  // The jump frames live in a module singleton (heroJump()); preload them with the face sprite.
  const [hero] = await Promise.all([loadHero(), loadHeroJump()]);
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

  const titleEl = $('title');
  const kindEl = $('kind');
  const blurbEl = $('blurb');
  SPECIALS.forEach((d) => {
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

  const ui = {
    sync() {
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
  };

  let initial: SpecialId = 'crescent';
  try {
    const saved = localStorage.getItem('special');
    if (saved === 'zenith' || saved === 'crescent') initial = saved;
  } catch {
    /* ignore */
  }
  if (params.has('special')) initial = params.get('special') as SpecialId;
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
