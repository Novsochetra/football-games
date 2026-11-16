// SPOTLIGHT SOLO v2: the world as a pure function of the global time (SPEC.md §3 "The route", "The prints and the
// falls", "The torn route"; §10.4 item 21). Every decal, print, fallen body, trophy spot and gash is rebuilt from here
// in each shot's init, so there is no mutable cross-shot state and every shot seeks exactly.
// Field world px, 10 px = 1 m; the goal line is x 1180, the goal centre z 257, the penalty spot (1070, 257).

import { POSES, P, RIVAL_KIT, RIVAL_KIT_B, RIVAL_KIT_C, type Pose } from '../../art/puppet';
import { StrobePrint, type PrintDef } from './print';
import { CURTAIN } from './common';

const D = Math.PI / 180;

/** The route's fixed points (§3 table). */
export const ROUTE = {
  snap: { x: 840, z: 262 },
  wall: { x0: 905, x1: 918, z0: 236, z1: 292 },
  footlight: { x: 760, z: 262, h: 10 },
  ignition: { x: 846, z: 262 },
  cutA: { x: 884, z: 264 },
  slideB: { x0: 965, x1: 912, z: 288 },
  hurdle: { takeoff: 926, apex: 936, landing: 946, z: 286, ballApexH: 14 },
  carpet: { x0: 918, x1: 948, z: 288 },
  vC: { x: 975, z: 270 },
  gateD: { x: 1010, z: 262 },
  ride: { x0: 1016, x1: 1066, z0: 262, z1: 257 },
} as const;
/** The mark: the penalty spot where the sole stops the ball (shot 9, g 13.6). */
export const MARK = { x: 1070, z: 257 } as const;
/** The keeper: set on his line, blasted off his feet at the relight, seated on the goal line (g 15.22-15.62). */
export const KEEPER = { set: { x: 1172, z: 257 }, seated: { x: 1180, z: 257 }, blastAt: CURTAIN + 0.02, landAt: CURTAIN + 0.25, settleAt: CURTAIN + 0.42 } as const;

// ---------------------------------------------------------------- the four prints (StrobePrint defs)

const fall = (t: number, pose: Pose, x: number, z: number, h: number, rot = 0) => ({ t, pose, x, z, h, rot });
/** The hip heights (world px) of the rest poses lying on the turf. */
const LYING = 3;

export const PRINT_DEFS: readonly PrintDef[] = [
  {
    id: 'A', kit: RIVAL_KIT, popAt: 7.35, printName: 'corkscrew', printPose: P({ ...POSES.corkscrew, spin: 1.2 * Math.PI }),
    print: { x: 892, z: 254, h: 4 + 9, rot: 0 },
    fall: [
      fall(7.2, POSES.lungeCommit, 890, 256, 9),
      fall(7.35, P({ ...POSES.corkscrew, spin: 1.2 * Math.PI }), 892, 254, 13),
      fall(7.45, P({ ...POSES.corkscrew, spin: 1.5 * Math.PI }), 894, 254, 8),
      fall(7.55, POSES.faceDown, 896, 254, LYING),
    ],
    landAt: 7.55, restName: 'faceDown', trophyAt: 7.6, shatterAt: CURTAIN + 0.02,
  },
  {
    id: 'B', kit: RIVAL_KIT_B, popAt: 9.8, printName: 'slideSpin', printPose: P({ ...POSES.slideSpin, spin: 2.2 }),
    print: { x: 908, z: 290, h: 3 + 6, rot: 0 },
    fall: [
      fall(9.6, POSES.slideTackle, 918, 288, 4),
      fall(9.8, P({ ...POSES.slideSpin, spin: 2.2 }), 908, 290, 9),
      fall(9.95, P({ ...POSES.slideSpin, spin: 4.4 }), 910, 291, 6),
      fall(10.1, POSES.sprawl, 912, 292, LYING),
    ],
    landAt: 10.1, restName: 'sprawl', trophyAt: 10.0, shatterAt: CURTAIN + 0.02,
  },
  {
    id: 'C', kit: RIVAL_KIT_C, popAt: 11.35, printName: 'splitFreeze', printPose: POSES.splitFreeze,
    print: { x: 990, z: 276, h: 6, rot: 0 },
    fall: [
      fall(11.2, POSES.lungeCommit, 986, 274, 9),
      fall(11.35, POSES.splitFreeze, 990, 276, 6),
      fall(11.55, POSES.sideTopple, 990, 278, LYING),
    ],
    landAt: 11.55, restName: 'sideTopple', trophyAt: 11.6, shatterAt: CURTAIN + 0.02,
  },
  {
    id: 'D', kit: RIVAL_KIT, tower: true, popAt: 13.1, printName: 'tumble', printPose: POSES.tumble,
    print: { x: 996, z: 272, h: 6 + 9, rot: 0 },
    fall: [
      fall(12.8, POSES.kneeBuckle, 1008, 262, 9),
      fall(12.83, POSES.kneeBuckle2, 1006, 263, 8),
      fall(13.1, POSES.tumble, 996, 272, 15),
      fall(13.3, P({ ...POSES.tumble, spin: 0.9 }), 990, 270, 7),
      fall(13.4, POSES.sprawl, 986, 268, LYING),
    ],
    landAt: 13.4, restName: 'sprawl', trophyAt: 13.2, shatterAt: CURTAIN + 0.02,
  },
];
/** The four StrobePrints, A-D (pure functions of the global time). */
export const PRINTS = PRINT_DEFS.map((d) => new StrobePrint(d));
export const printOf = (id: 'A' | 'B' | 'C' | 'D') => PRINTS[['A', 'B', 'C', 'D'].indexOf(id)];

// ---------------------------------------------------------------- the trophy spots

/** Each defender's trophy spot: on from trophyAt until the relight swallows it (the curtain drop). */
export const TROPHIES = PRINT_DEFS.map((d) => ({ id: d.id, at: d.trophyAt, x: d.print.x, z: d.print.z, off: CURTAIN + 0.02 }));

// ---------------------------------------------------------------- the torn route (gashes)

export type GashKind = 'claw' | 'furrow' | 'carpet' | 'spiral' | 'line' | 'brake' | 'star';
export interface Gash {
  id: string;
  kind: GashKind;
  /** Start (field px) and direction on the ground (rad, 0 = +x toward the goal, +pi/2 = +z toward the near touchline). */
  x: number;
  z: number;
  dir: number;
  /** Length (world px) and the number of claws. */
  len: number;
  claws: number;
  /** Born (global): it tears open over 0.05 s (a furrow or carpet grows to `grow` s). */
  born: number;
  grow?: number;
  /** UV shafts (0 = none: B's furrow has no light). */
  shafts: number;
  /** Position in the fuse (0 = A's spot first ... the fuse races toward his feet), -1 = not part of it. */
  fuse: number;
}

const g = (id: string, kind: GashKind, x: number, z: number, dir: number, len: number, claws: number, born: number, shafts: number, fuse: number, grow?: number): Gash =>
  ({ id, kind, x, z, dir, len, claws, born, shafts, fuse, grow });

/** The torn route, in birth order (§3): 12+ sites; they stay for the rest of the film and become the fuse in 9c. */
export const GASHES: readonly Gash[] = [
  g('ignition', 'claw', 846, 262, 0, 8, 3, 5.7, 5, -1),
  g('cutA', 'claw', 884, 264, 0.6, 10, 3, 7.2, 6, 0),
  g('stride1', 'claw', 888, 258, -0.1, 5, 2, 7.25, 3, 1),
  g('stride2', 'claw', 895, 266, 0.1, 5, 2, 7.4, 3, 1),
  g('stride3', 'claw', 902, 258, -0.1, 5, 2, 7.55, 3, 1),
  g('stride4', 'claw', 909, 266, 0.1, 5, 2, 7.7, 3, 2),
  g('stride5', 'claw', 916, 260, 0, 5, 2, 7.85, 3, 2),
  g('furrowB', 'furrow', 965, 288, Math.PI, 53, 1, 8.0, 0, -1, 1.95),
  g('carpetB', 'carpet', 918, 288, 0, 30, 1, 9.6, 4, 3, 0.35),
  g('landing', 'claw', 946, 286, 0.2, 8, 3, 9.75, 4, 3),
  g('spiralC', 'spiral', 975, 270, 0, 6, 1, 11.2, 3, 4),
  g('vGouge1', 'claw', 969, 272, -0.7, 6, 1, 11.2, 2, 4),
  g('vGouge2', 'claw', 969, 268, 0.7, 6, 1, 11.2, 2, 4),
  g('splitC', 'furrow', 990, 276, Math.PI / 2, 7, 2, 11.25, 0, -1, 0.2),
  g('nutmeg', 'line', 1010, 262, 0, 12, 4, 12.8, 5, 5),
  g('tap1', 'claw', 1030, 261, 0, 4, 2, 13.0, 2, 6),
  g('tap2', 'claw', 1045, 259, 0, 4, 2, 13.2, 2, 6),
  g('tap3', 'claw', 1058, 258, 0, 4, 2, 13.4, 2, 7),
  g('brake', 'brake', 1064, 257, 0, 6, 2, 13.55, 3, 7),
  g('star', 'star', 1070, 257, 0, 3, 4, 13.6, 4, 7),
];

/** The fuse (9c): the torn route erupts segment by segment from A's spot toward his feet, 8 segments 0.06 s apart. */
export const FUSE = { t0: CURTAIN, gap: 0.06, segments: 8 } as const;

/** 0..1: how hard gash `gs` is erupting at global gt (a 0.18 s burst from its fuse segment's time; 0 when not in it). */
export function fuseAt(gs: Gash, gt: number): number {
  if (gs.fuse < 0) return 0;
  const at = FUSE.t0 + gs.fuse * FUSE.gap;
  const u = (gt - at) / 0.18;
  return u < 0 || u >= 1 ? 0 : 1 - u;
}

// ---------------------------------------------------------------- worldAt

export interface WorldState {
  gt: number;
  gashes: { gash: Gash; age: number; open: number; erupt: number }[];
  prints: ReturnType<StrobePrint['at']>[];
  trophies: { id: string; x: number; z: number; age: number }[];
  /** 0 before the relight, 0..1 through it (0.2 s), 1 after. */
  relight: number;
  keeper: { phase: 'set' | 'blasted' | 'seated'; x: number; z: number; u: number };
}

/** What exists at global time gt (shots draw from this; nothing is carried between shots). */
export function worldAt(gt: number): WorldState {
  const gashes = GASHES.filter((gs) => gt >= gs.born).map((gs) => ({
    gash: gs,
    age: gt - gs.born,
    open: Math.min(1, (gt - gs.born) / Math.max(0.05, gs.grow ?? 0.05)),
    erupt: fuseAt(gs, gt),
  }));
  const prints = PRINTS.map((p) => p.at(gt));
  const trophies = TROPHIES.filter((tr) => gt >= tr.at && gt < tr.off).map((tr) => ({ id: tr.id, x: tr.x, z: tr.z, age: gt - tr.at }));
  const relight = Math.min(1, Math.max(0, (gt - CURTAIN) / 0.2));
  const K = KEEPER;
  const keeper =
    gt < K.blastAt
      ? { phase: 'set' as const, x: K.set.x, z: K.set.z, u: 0 }
      : gt < K.landAt
        ? { phase: 'blasted' as const, x: K.set.x + (K.seated.x - K.set.x) * ((gt - K.blastAt) / (K.landAt - K.blastAt)), z: K.set.z, u: (gt - K.blastAt) / (K.landAt - K.blastAt) }
        : { phase: 'seated' as const, x: K.seated.x, z: K.seated.z, u: 1 };
  return { gt, gashes, prints, trophies, relight, keeper };
}

/** Degrees helper for shots. */
export const DEG = D;

/** The brief's soloWorld (§10.4 item 21) as one object. */
export const soloWorld = { ROUTE, PRINTS, GASHES, TROPHIES, KEEPER, MARK, FUSE, worldAt, fuseAt } as const;
