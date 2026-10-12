# AlignUI integration

Official sources: [base documentation](https://alignui.com/docs/v1.2/ui/button), [installation](https://alignui.com/docs/v1.2/installation), [CLI](https://github.com/alignui/cli), [base license](https://www.alignui.com/license). Public documentation was inspected on 2026-10-13. Base Components are MIT; authenticated PRO blocks, sector templates, and Figma products are separate and were not accessed.

## Installed inventory

All 49 public UI documentation entries and four utility entries from the v1.2 sidebar are available as source. There are 52 UI source files, the shared tab observer hook, and four utility files. `alignui-inventory.json` records each official URL and its installed files.

The inventory covers buttons/groups/compact/fancy/link buttons, avatars/groups, badges/status/tags/banners, table, divider, keyboard hints, progress/circle, rating SVG assets, alert/notification/toast/toast-alert/tooltip, checkbox/color picker/calendar/digit input/upload/file icons/hint/input/label/radio/select/slider/switch/textarea, accordion/breadcrumb/segmented/horizontal and vertical tabs, steppers/pagination, command menu/drawer/dropdown/modal/popover. The rating page provides SVG assets rather than a standalone rating root; those actual exports are preserved. The public inventory does not provide separate card/skeleton/time-picker components, so summary cards are application-specific semantic compositions and loading uses shared feedback.

## Tokens and imports

AlignUI CLI 0.0.19 generated `src/styles/globals.css` with blue primary, gray neutral, OKLCH, CSS-first Tailwind v4 tokens, no prefix, and no Tailwind JS config. Tailwind/PostCSS are already installed explicitly through npm. The CLI's final dependency subprocess encountered this host's missing global npm executable after successful CSS generation; the same required packages were installed using npm-cli.js. On a normal Node/npm setup, `npm run alignui:tokens` runs the official workflow. It overwrites CSS: review the diff and restore the tw-animate-css import, local Inter font, focus and reduced-motion additions afterwards.

Use direct imports, for example `import * as Button from '@/components/ui/button'`. No competing UI library is installed. Radix, React Aria, Sonner, DayPicker, cmdk and the remaining supporting packages are required by AlignUI's own public components. Remix Icon is the officially recommended icon library.

## Compatibility changes

Original variants, tokens and composition are retained. Components using React hooks receive a client directive for Next.js. The official observer source lives at `src/hooks/use-tab-observer.tsx`, matching its upstream import path. Utility sources remain at `src/utils` to avoid changing upstream imports. The calendar's legacy DayPicker class/chevron slot names are migrated to DayPicker 10; styles retain the AlignUI conventions. TanStack Table v9 is composed with AlignUI Table using the native feature registration API. Added animations come from tw-animate-css.

Legacy comma-separated grid templates were migrated to Tailwind 4 underscore syntax in alert, banner, accordion, vertical tabs, and vertical stepper. Calendar navigation placement and selected-day selectors were adapted to DayPicker 10's DOM structure. These are compatibility corrections to the existing AlignUI layouts.

The class-based Tailwind dark variant is explicitly configured so next-themes selections affect both AlignUI's dark token values and dark utility overrides. Application status/amount text uses darker official palette shades in light mode and lighter shades in dark mode for readable contrast.

## Updating

1. Review official v1.2 component documentation and the version you intend to adopt. Preserve the MIT notice and source headers.
2. Compare each documented installation block with the inventory file and copy updated sources into the existing paths. Copy additional helper blocks too; do not copy example usage as implementation.
3. Install actual documented dependencies with npm and check peer compatibility. Do not assume a component registry/add-all CLI: the public workflow is source copy plus the token CLI.
4. Review PRO access separately with the owner's valid license. Do not fetch restricted material or substitute another system.
5. Re-run type, lint, format, unit, production build, and browser checks. Review local compatibility edits during every update.

## Known dependency audit finding

The original AlignUI CLI and Next.js ESLint audit findings include eight high-severity entries caused by unpatched `braces <=3.0.3` through fast-glob/micromatch ([GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)). After adding release tooling, the full audit reports 20 development-tool findings (18 high, 2 moderate), including dependencies bundled with the release plugin's npm version. Production audit reports zero findings. Compatible audit fixes were attempted; the remaining findings require upstream updates. Do not run these glob tools on untrusted patterns or force npm's suggested downgrade to an unrelated Next.js version. CI audits production dependencies. This remains an outstanding security maintenance item.
