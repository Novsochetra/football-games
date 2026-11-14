// Dev-only: renders every pose for every kit so character art can be reviewed at a glance.
import { HERO_KIT, RIVAL_KIT, KEEPER_KIT, POSES, renderPuppet } from '../art/puppet';

const only = new URLSearchParams(location.search).get('only');
const names = (only ? only.split(',') : Object.keys(POSES)) as (keyof typeof POSES)[];
const kits = [HERO_KIT, RIVAL_KIT, KEEPER_KIT].slice(0, parseInt(new URLSearchParams(location.search).get('kits') || '3'));
const params0 = new URLSearchParams(location.search);
const D = parseFloat(params0.get('d') || '1');
const cell = 150 * D;
const c = document.getElementById('c') as HTMLCanvasElement;
const params = new URLSearchParams(location.search);
const k = parseFloat(params.get('k') || '1');
c.width = names.length * cell;
c.height = kits.length * cell + 20;
const g = c.getContext('2d')!;
g.imageSmoothingEnabled = false;
g.fillStyle = '#3a3358';
g.fillRect(0, 0, c.width, c.height);
names.forEach((n, i) => {
  g.fillStyle = '#fff';
  g.fillText(n, i * cell + 4, 12);
  kits.forEach((kit, j) => {
    const r = renderPuppet(kit, POSES[n], { k, facing: (parseInt(new URLSearchParams(location.search).get('facing') || '1') as 1 | -1) });
    g.drawImage(r.cv, i * cell + cell / 2 - r.ox * D, 20 + j * cell + cell / 2 - r.oy * D + 10, r.cv.width * D, r.cv.height * D);
  });
});
document.title = 'ready';
