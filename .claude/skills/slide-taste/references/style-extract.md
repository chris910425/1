# Style extraction: reference → theme

For when the user shares a website, slide template, poster or artwork and says "make a template like
this". Adapted from Taste Skill's research method (describe a direction as idea, composition, type,
palette, pictures) and Impeccable's `extract` / `document` (write the system down before using it).
Works from screenshots: this workspace cannot browse most websites, so ask for screenshots (several
scrolled ones for a website, every slide for a template).

## 1. Save it

Copy the image to `inspiration/` (`templates/` for slide templates, `styles/` for art and moods,
websites by name) and add a row to `inspiration/README.md`: source, what the user liked, plan.

## 2. Measure and describe (write the answers down)

1. **Palette:** `python3 .claude/skills/slide-taste/scripts/palette.py <image> [--crop x0,y0,x1,y1]`
   (crop away phone UI and borders). Decide roles: ground, surface (one step from ground), ink, muted,
   accent, plus a dark variant if the reference has dark slides. Check ink and muted ≥ 4.5:1 on their
   grounds; an accent used for text needs it too.
2. **Type:** describe what you see (serif / sans / slab / script; contrast; width; weight; case;
   tracking). Pick the closest free Google Fonts for display and body, and a 繁體 partner (Noto Sans TC,
   Noto Serif TC, LXGW WenKai TC, or one already in `brand/fonts.css`). For PowerPoint, also name the
   Windows fallback (Microsoft JhengHei, Arial, Georgia…). Show the user a sample when unsure.
3. **Grid and composition:** margins, title position, column split (1:1, 1:2, 2:3), where pictures
   sit (full-bleed, side panel, inset), how text meets pictures (scrim, panel, colour block).
4. **Signature details:** the 2–4 moves that make it recognisable (the orange number block, the
   arch-cropped photos, the double-rule frame, the dark swirl centre). These must survive into the
   theme; everything else may simplify.
5. **Slide types present:** cover, contents, divider, statement, split, big number, timeline, chart,
   team, quote, closing. List which the reference shows and which the theme must add.
6. **Pictures:** what kind (photography, illustration, 3D, texture), grade (mono, duotone, warm),
   crop shapes. Decide the source: the user's photos (`assets/photos/`), recreations with
   placeholders, or AI images the user generates from prompts you write (see
   `inspiration/styles/tide-prompts.md` for the format). Never put someone else's artwork on the public
   Pages site.

## 3. Build it

- **HTML:** add the theme to `frontend-slides/brand/tokens.css` (light + dark, `tone-dark` if
  needed), a section in `BRAND.md`, any new layout classes in `components/layouts.css`, and a sample
  deck in `brand/themes/<name>.html` showing every slide type with placeholder content that follows
  the reference closely (the user expects recreations to be really similar: same colour combination,
  layouts and elements). Rebuild the gallery theme buttons.
- **PowerPoint:** run PPT Master's Create Template route with the reference and the theme decisions,
  kind `style` (look only) or `layout`/`deck` (look + reusable layouts), so `ppt-master` decks can use
  it. Keep the same palette and fonts as the HTML theme.

## 4. Check it

Render the sample deck with `scripts/render.sh`, put the contact sheet next to the reference, and
compare: palette, type, grid, signature details. Fix what drifts, then run one critique ROUND
(`references/critique.md`). Publish a preview for the user and ask what to change.
