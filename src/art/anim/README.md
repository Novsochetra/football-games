Studio animation strips (Pixel Studio exports): `<name>.png` (frames left to right, facing east),
`<name>.json` (anchors, see src/art/studioAnim.ts) and optionally `<name>_west.png` (mirrored with
readable shirt numbers). Every pair here is loaded at boot and available as `anim('<name>')`.
