# GeoHub Layout & Design System Audit Report

**Date**: 2026-11-01T17:29:28.677Z  
**Total Screens Audited**: 240  
**Total Violations Found**: 2045  

## Severity Summary
- 🛑 **Blocker**: 0
- ⚠️ **Major**: 1375
- ℹ️ **Minor**: 670
- 💅 **Polish**: 0

---

## Role × Screen Matrix

| Role | Route | 360×740 | 390×844 | 430×932 | 768×1024 | 1280×800 |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **faculty** | `#home` | ❌ Fail (7) | ❌ Fail (7) | ❌ Fail (7) | ❌ Fail (7) | ❌ Fail (7) |
| **faculty** | `#events` | ❌ Fail (5) | ❌ Fail (5) | ❌ Fail (5) | ❌ Fail (5) | ❌ Fail (5) |
| **faculty** | `#operations` | ❌ Fail (3) | ❌ Fail (3) | ❌ Fail (3) | ❌ Fail (3) | ❌ Fail (3) |
| **faculty** | `#members` | ❌ Fail (70) | ❌ Fail (70) | ❌ Fail (70) | ❌ Fail (70) | ❌ Fail (70) |
| **faculty** | `#profile` | ❌ Fail (13) | ❌ Fail (13) | ❌ Fail (13) | ❌ Fail (13) | ❌ Fail (13) |
| **faculty** | `#attendance` | ❌ Fail (5) | ❌ Fail (5) | ❌ Fail (5) | ❌ Fail (5) | ❌ Fail (5) |
| **faculty** | `#reports` | ❌ Fail (6) | ❌ Fail (6) | ❌ Fail (6) | ❌ Fail (6) | ❌ Fail (6) |
| **faculty** | `#approvals` | ❌ Fail (3) | ❌ Fail (3) | ❌ Fail (3) | ❌ Fail (3) | ❌ Fail (3) |
| **faculty** | `#notifications` | ❌ Fail (3) | ❌ Fail (3) | ❌ Fail (3) | ❌ Fail (3) | ❌ Fail (3) |
| **coordinator** | `#home` | ❌ Fail (7) | ❌ Fail (7) | ❌ Fail (7) | ❌ Fail (7) | ❌ Fail (7) |
| **coordinator** | `#events` | ❌ Fail (5) | ❌ Fail (5) | ❌ Fail (5) | ❌ Fail (5) | ❌ Fail (5) |
| **coordinator** | `#operations` | ❌ Fail (3) | ❌ Fail (3) | ❌ Fail (3) | ❌ Fail (3) | ❌ Fail (3) |
| **coordinator** | `#members` | ❌ Fail (70) | ❌ Fail (70) | ❌ Fail (70) | ❌ Fail (70) | ❌ Fail (70) |
| **coordinator** | `#profile` | ❌ Fail (13) | ❌ Fail (13) | ❌ Fail (13) | ❌ Fail (13) | ❌ Fail (13) |
| **coordinator** | `#tasks` | ❌ Fail (3) | ❌ Fail (3) | ❌ Fail (3) | ❌ Fail (3) | ❌ Fail (3) |
| **coordinator** | `#teams` | ❌ Fail (3) | ❌ Fail (3) | ❌ Fail (3) | ❌ Fail (3) | ❌ Fail (3) |
| **coordinator** | `#meetings` | ❌ Fail (5) | ❌ Fail (5) | ❌ Fail (5) | ❌ Fail (5) | ❌ Fail (5) |
| **coordinator** | `#notifications` | ❌ Fail (3) | ❌ Fail (3) | ❌ Fail (3) | ❌ Fail (3) | ❌ Fail (3) |
| **documentation** | `#home` | ❌ Fail (7) | ❌ Fail (7) | ❌ Fail (7) | ❌ Fail (7) | ❌ Fail (7) |
| **documentation** | `#events` | ❌ Fail (5) | ❌ Fail (5) | ❌ Fail (5) | ❌ Fail (5) | ❌ Fail (5) |
| **documentation** | `#operations` | ❌ Fail (3) | ❌ Fail (3) | ❌ Fail (3) | ❌ Fail (3) | ❌ Fail (3) |
| **documentation** | `#archives` | ❌ Fail (3) | ❌ Fail (3) | ❌ Fail (3) | ❌ Fail (3) | ❌ Fail (3) |
| **documentation** | `#profile` | ❌ Fail (12) | ❌ Fail (12) | ❌ Fail (12) | ❌ Fail (12) | ❌ Fail (12) |
| **documentation** | `#doc_studio` | ❌ Fail (6) | ❌ Fail (6) | ❌ Fail (6) | ❌ Fail (6) | ❌ Fail (6) |
| **documentation** | `#forum` | ❌ Fail (7) | ❌ Fail (7) | ❌ Fail (7) | ❌ Fail (7) | ❌ Fail (7) |
| **documentation** | `#notifications` | ❌ Fail (3) | ❌ Fail (3) | ❌ Fail (3) | ❌ Fail (3) | ❌ Fail (3) |
| **treasurer** | `#home` | ❌ Fail (8) | ❌ Fail (8) | ❌ Fail (8) | ❌ Fail (8) | ❌ Fail (8) |
| **treasurer** | `#events` | ❌ Fail (5) | ❌ Fail (5) | ❌ Fail (5) | ❌ Fail (5) | ❌ Fail (5) |
| **treasurer** | `#operations` | ❌ Fail (3) | ❌ Fail (3) | ❌ Fail (3) | ❌ Fail (3) | ❌ Fail (3) |
| **treasurer** | `#finance` | ❌ Fail (6) | ❌ Fail (6) | ❌ Fail (6) | ❌ Fail (6) | ❌ Fail (6) |
| **treasurer** | `#profile` | ❌ Fail (12) | ❌ Fail (12) | ❌ Fail (12) | ❌ Fail (12) | ❌ Fail (12) |
| **treasurer** | `#tasks` | ❌ Fail (3) | ❌ Fail (3) | ❌ Fail (3) | ❌ Fail (3) | ❌ Fail (3) |
| **treasurer** | `#notifications` | ❌ Fail (3) | ❌ Fail (3) | ❌ Fail (3) | ❌ Fail (3) | ❌ Fail (3) |
| **promotion** | `#home` | ❌ Fail (7) | ❌ Fail (7) | ❌ Fail (7) | ❌ Fail (7) | ❌ Fail (7) |
| **promotion** | `#events` | ❌ Fail (5) | ❌ Fail (5) | ❌ Fail (5) | ❌ Fail (5) | ❌ Fail (5) |
| **promotion** | `#operations` | ❌ Fail (3) | ❌ Fail (3) | ❌ Fail (3) | ❌ Fail (3) | ❌ Fail (3) |
| **promotion** | `#campaigns` | ❌ Fail (7) | ❌ Fail (7) | ❌ Fail (7) | ❌ Fail (7) | ❌ Fail (7) |
| **promotion** | `#profile` | ❌ Fail (12) | ❌ Fail (12) | ❌ Fail (12) | ❌ Fail (12) | ❌ Fail (12) |
| **promotion** | `#forum` | ❌ Fail (7) | ❌ Fail (7) | ❌ Fail (7) | ❌ Fail (7) | ❌ Fail (7) |
| **promotion** | `#notifications` | ❌ Fail (3) | ❌ Fail (3) | ❌ Fail (3) | ❌ Fail (3) | ❌ Fail (3) |
| **student** | `#home` | ❌ Fail (14) | ❌ Fail (14) | ❌ Fail (14) | ❌ Fail (14) | ❌ Fail (14) |
| **student** | `#events` | ❌ Fail (5) | ❌ Fail (5) | ❌ Fail (5) | ❌ Fail (5) | ❌ Fail (5) |
| **student** | `#operations` | ❌ Fail (3) | ❌ Fail (3) | ❌ Fail (3) | ❌ Fail (3) | ❌ Fail (3) |
| **student** | `#memories` | ❌ Fail (9) | ❌ Fail (9) | ❌ Fail (9) | ❌ Fail (9) | ❌ Fail (9) |
| **student** | `#profile` | ❌ Fail (12) | ❌ Fail (12) | ❌ Fail (12) | ❌ Fail (12) | ❌ Fail (12) |
| **student** | `#my_qr` | ❌ Fail (3) | ❌ Fail (3) | ❌ Fail (3) | ❌ Fail (3) | ❌ Fail (3) |
| **student** | `#tasks` | ❌ Fail (3) | ❌ Fail (3) | ❌ Fail (3) | ❌ Fail (3) | ❌ Fail (3) |
| **student** | `#notifications` | ❌ Fail (3) | ❌ Fail (3) | ❌ Fail (3) | ❌ Fail (3) | ❌ Fail (3) |

---

## Detailed Violations Log

| ID | Role | Route | Viewport | Rule | Selector | Expected | Actual | Severity |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| VIO-0001 | faculty | `#home` | 360x740 | Font Scale | `div.font-bold.tracking-tight` | One of: 11, 12, 13, 14, 15, 16, 18, 22, 28, 32px | 24px | Major |
| VIO-0002 | faculty | `#home` | 360x740 | Font Scale | `div.font-bold.tracking-tight` | One of: 11, 12, 13, 14, 15, 16, 18, 22, 28, 32px | 24px | Major |
| VIO-0003 | faculty | `#home` | 360x740 | Font Scale | `div.font-bold.tracking-tight` | One of: 11, 12, 13, 14, 15, 16, 18, 22, 28, 32px | 24px | Major |
| VIO-0004 | faculty | `#home` | 360x740 | Icon Sizing (Lucide Tokens) | `svg` | One of 16, 20, 24, 28, 48px | 13x13px | Minor |
| VIO-0005 | faculty | `#home` | 360x740 | Floating Nav Height | `nav.fixed.select-none` | 64px | 58px | Major |
| VIO-0006 | faculty | `#home` | 360x740 | Floating Nav 5 or 6 Slots | `nav.fixed.select-none` | 5 or 6 navigation slots | 2 slots | Major |
| VIO-0007 | faculty | `#home` | 360x740 | Pure White Scaffold Invariant | `body` | #FFFFFF (rgb(255, 255, 255)) | rgb(246, 251, 247) | Major |
| VIO-0008 | faculty | `#events` | 360x740 | Icon Sizing (Lucide Tokens) | `svg` | One of 16, 20, 24, 28, 48px | 12x12px | Minor |
| VIO-0009 | faculty | `#events` | 360x740 | Icon Sizing (Lucide Tokens) | `svg` | One of 16, 20, 24, 28, 48px | 12x12px | Minor |
| VIO-0010 | faculty | `#events` | 360x740 | Floating Nav Height | `nav.fixed.select-none` | 64px | 58px | Major |
| VIO-0011 | faculty | `#events` | 360x740 | Floating Nav 5 or 6 Slots | `nav.fixed.select-none` | 5 or 6 navigation slots | 2 slots | Major |
| VIO-0012 | faculty | `#events` | 360x740 | Pure White Scaffold Invariant | `body` | #FFFFFF (rgb(255, 255, 255)) | rgb(246, 251, 247) | Major |
| VIO-0013 | faculty | `#operations` | 360x740 | Floating Nav Height | `nav.fixed.select-none` | 64px | 58px | Major |
| VIO-0014 | faculty | `#operations` | 360x740 | Floating Nav 5 or 6 Slots | `nav.fixed.select-none` | 5 or 6 navigation slots | 2 slots | Major |
| VIO-0015 | faculty | `#operations` | 360x740 | Pure White Scaffold Invariant | `body` | #FFFFFF (rgb(255, 255, 255)) | rgb(246, 251, 247) | Major |
| VIO-0016 | faculty | `#members` | 360x740 | Font Scale | `span` | One of: 11, 12, 13, 14, 15, 16, 18, 22, 28, 32px | 17px | Major |
| VIO-0017 | faculty | `#members` | 360x740 | Font Scale | `span` | One of: 11, 12, 13, 14, 15, 16, 18, 22, 28, 32px | 17px | Major |
| VIO-0018 | faculty | `#members` | 360x740 | Font Scale | `span` | One of: 11, 12, 13, 14, 15, 16, 18, 22, 28, 32px | 17px | Major |
| VIO-0019 | faculty | `#members` | 360x740 | Font Scale | `span` | One of: 11, 12, 13, 14, 15, 16, 18, 22, 28, 32px | 17px | Major |
| VIO-0020 | faculty | `#members` | 360x740 | Font Scale | `span` | One of: 11, 12, 13, 14, 15, 16, 18, 22, 28, 32px | 17px | Major |
| VIO-0021 | faculty | `#members` | 360x740 | Font Scale | `span` | One of: 11, 12, 13, 14, 15, 16, 18, 22, 28, 32px | 17px | Major |
| VIO-0022 | faculty | `#members` | 360x740 | Font Scale | `span` | One of: 11, 12, 13, 14, 15, 16, 18, 22, 28, 32px | 17px | Major |
| VIO-0023 | faculty | `#members` | 360x740 | Font Scale | `span` | One of: 11, 12, 13, 14, 15, 16, 18, 22, 28, 32px | 17px | Major |
| VIO-0024 | faculty | `#members` | 360x740 | Font Scale | `span` | One of: 11, 12, 13, 14, 15, 16, 18, 22, 28, 32px | 17px | Major |
| VIO-0025 | faculty | `#members` | 360x740 | Font Scale | `span` | One of: 11, 12, 13, 14, 15, 16, 18, 22, 28, 32px | 17px | Major |
| VIO-0026 | faculty | `#members` | 360x740 | Font Scale | `span` | One of: 11, 12, 13, 14, 15, 16, 18, 22, 28, 32px | 17px | Major |
| VIO-0027 | faculty | `#members` | 360x740 | Font Scale | `span` | One of: 11, 12, 13, 14, 15, 16, 18, 22, 28, 32px | 17px | Major |
| VIO-0028 | faculty | `#members` | 360x740 | Font Scale | `span` | One of: 11, 12, 13, 14, 15, 16, 18, 22, 28, 32px | 17px | Major |
| VIO-0029 | faculty | `#members` | 360x740 | Font Scale | `span` | One of: 11, 12, 13, 14, 15, 16, 18, 22, 28, 32px | 17px | Major |
| VIO-0030 | faculty | `#members` | 360x740 | Font Scale | `span` | One of: 11, 12, 13, 14, 15, 16, 18, 22, 28, 32px | 17px | Major |
| VIO-0031 | faculty | `#members` | 360x740 | Font Scale | `span` | One of: 11, 12, 13, 14, 15, 16, 18, 22, 28, 32px | 17px | Major |
| VIO-0032 | faculty | `#members` | 360x740 | Font Scale | `span` | One of: 11, 12, 13, 14, 15, 16, 18, 22, 28, 32px | 17px | Major |
| VIO-0033 | faculty | `#members` | 360x740 | Font Scale | `span` | One of: 11, 12, 13, 14, 15, 16, 18, 22, 28, 32px | 17px | Major |
| VIO-0034 | faculty | `#members` | 360x740 | Font Scale | `span` | One of: 11, 12, 13, 14, 15, 16, 18, 22, 28, 32px | 17px | Major |
| VIO-0035 | faculty | `#members` | 360x740 | Font Scale | `span` | One of: 11, 12, 13, 14, 15, 16, 18, 22, 28, 32px | 17px | Major |
| VIO-0036 | faculty | `#members` | 360x740 | Font Scale | `span` | One of: 11, 12, 13, 14, 15, 16, 18, 22, 28, 32px | 17px | Major |
| VIO-0037 | faculty | `#members` | 360x740 | Font Scale | `span` | One of: 11, 12, 13, 14, 15, 16, 18, 22, 28, 32px | 17px | Major |
| VIO-0038 | faculty | `#members` | 360x740 | Font Scale | `span` | One of: 11, 12, 13, 14, 15, 16, 18, 22, 28, 32px | 17px | Major |
| VIO-0039 | faculty | `#members` | 360x740 | Font Scale | `span` | One of: 11, 12, 13, 14, 15, 16, 18, 22, 28, 32px | 17px | Major |
| VIO-0040 | faculty | `#members` | 360x740 | Font Scale | `span` | One of: 11, 12, 13, 14, 15, 16, 18, 22, 28, 32px | 17px | Major |
| VIO-0041 | faculty | `#members` | 360x740 | Font Scale | `span` | One of: 11, 12, 13, 14, 15, 16, 18, 22, 28, 32px | 17px | Major |
| VIO-0042 | faculty | `#members` | 360x740 | Font Scale | `span` | One of: 11, 12, 13, 14, 15, 16, 18, 22, 28, 32px | 17px | Major |
| VIO-0043 | faculty | `#members` | 360x740 | Font Scale | `span` | One of: 11, 12, 13, 14, 15, 16, 18, 22, 28, 32px | 17px | Major |
| VIO-0044 | faculty | `#members` | 360x740 | Icon Sizing (Lucide Tokens) | `svg` | One of 16, 20, 24, 28, 48px | 12x12px | Minor |
| VIO-0045 | faculty | `#members` | 360x740 | Icon Sizing (Lucide Tokens) | `svg` | One of 16, 20, 24, 28, 48px | 12x12px | Minor |
| VIO-0046 | faculty | `#members` | 360x740 | Icon Sizing (Lucide Tokens) | `svg` | One of 16, 20, 24, 28, 48px | 12x12px | Minor |
| VIO-0047 | faculty | `#members` | 360x740 | Icon Sizing (Lucide Tokens) | `svg` | One of 16, 20, 24, 28, 48px | 12x12px | Minor |
| VIO-0048 | faculty | `#members` | 360x740 | Icon Sizing (Lucide Tokens) | `svg` | One of 16, 20, 24, 28, 48px | 12x12px | Minor |
| VIO-0049 | faculty | `#members` | 360x740 | Icon Sizing (Lucide Tokens) | `svg` | One of 16, 20, 24, 28, 48px | 12x12px | Minor |
| VIO-0050 | faculty | `#members` | 360x740 | Icon Sizing (Lucide Tokens) | `svg` | One of 16, 20, 24, 28, 48px | 12x12px | Minor |
| VIO-0051 | faculty | `#members` | 360x740 | Icon Sizing (Lucide Tokens) | `svg` | One of 16, 20, 24, 28, 48px | 12x12px | Minor |
| VIO-0052 | faculty | `#members` | 360x740 | Icon Sizing (Lucide Tokens) | `svg` | One of 16, 20, 24, 28, 48px | 12x12px | Minor |
| VIO-0053 | faculty | `#members` | 360x740 | Icon Sizing (Lucide Tokens) | `svg` | One of 16, 20, 24, 28, 48px | 12x12px | Minor |
| VIO-0054 | faculty | `#members` | 360x740 | Icon Sizing (Lucide Tokens) | `svg` | One of 16, 20, 24, 28, 48px | 12x12px | Minor |
| VIO-0055 | faculty | `#members` | 360x740 | Icon Sizing (Lucide Tokens) | `svg` | One of 16, 20, 24, 28, 48px | 12x12px | Minor |
| VIO-0056 | faculty | `#members` | 360x740 | Icon Sizing (Lucide Tokens) | `svg` | One of 16, 20, 24, 28, 48px | 12x12px | Minor |
| VIO-0057 | faculty | `#members` | 360x740 | Icon Sizing (Lucide Tokens) | `svg` | One of 16, 20, 24, 28, 48px | 12x12px | Minor |
| VIO-0058 | faculty | `#members` | 360x740 | Icon Sizing (Lucide Tokens) | `svg` | One of 16, 20, 24, 28, 48px | 12x12px | Minor |
| VIO-0059 | faculty | `#members` | 360x740 | Icon Sizing (Lucide Tokens) | `svg` | One of 16, 20, 24, 28, 48px | 12x12px | Minor |
| VIO-0060 | faculty | `#members` | 360x740 | Icon Sizing (Lucide Tokens) | `svg` | One of 16, 20, 24, 28, 48px | 12x12px | Minor |
| VIO-0061 | faculty | `#members` | 360x740 | Icon Sizing (Lucide Tokens) | `svg` | One of 16, 20, 24, 28, 48px | 12x12px | Minor |
| VIO-0062 | faculty | `#members` | 360x740 | Icon Sizing (Lucide Tokens) | `svg` | One of 16, 20, 24, 28, 48px | 12x12px | Minor |
| VIO-0063 | faculty | `#members` | 360x740 | Icon Sizing (Lucide Tokens) | `svg` | One of 16, 20, 24, 28, 48px | 12x12px | Minor |
| VIO-0064 | faculty | `#members` | 360x740 | Icon Sizing (Lucide Tokens) | `svg` | One of 16, 20, 24, 28, 48px | 12x12px | Minor |
| VIO-0065 | faculty | `#members` | 360x740 | Icon Sizing (Lucide Tokens) | `svg` | One of 16, 20, 24, 28, 48px | 12x12px | Minor |
| VIO-0066 | faculty | `#members` | 360x740 | Icon Sizing (Lucide Tokens) | `svg` | One of 16, 20, 24, 28, 48px | 12x12px | Minor |
| VIO-0067 | faculty | `#members` | 360x740 | Icon Sizing (Lucide Tokens) | `svg` | One of 16, 20, 24, 28, 48px | 12x12px | Minor |
| VIO-0068 | faculty | `#members` | 360x740 | Icon Sizing (Lucide Tokens) | `svg` | One of 16, 20, 24, 28, 48px | 12x12px | Minor |
| VIO-0069 | faculty | `#members` | 360x740 | Icon Sizing (Lucide Tokens) | `svg` | One of 16, 20, 24, 28, 48px | 12x12px | Minor |
| VIO-0070 | faculty | `#members` | 360x740 | Icon Sizing (Lucide Tokens) | `svg` | One of 16, 20, 24, 28, 48px | 12x12px | Minor |
| VIO-0071 | faculty | `#members` | 360x740 | Icon Sizing (Lucide Tokens) | `svg` | One of 16, 20, 24, 28, 48px | 12x12px | Minor |
| VIO-0072 | faculty | `#members` | 360x740 | Icon Sizing (Lucide Tokens) | `svg` | One of 16, 20, 24, 28, 48px | 12x12px | Minor |
| VIO-0073 | faculty | `#members` | 360x740 | Icon Sizing (Lucide Tokens) | `svg` | One of 16, 20, 24, 28, 48px | 12x12px | Minor |
| VIO-0074 | faculty | `#members` | 360x740 | Icon Sizing (Lucide Tokens) | `svg` | One of 16, 20, 24, 28, 48px | 12x12px | Minor |
| VIO-0075 | faculty | `#members` | 360x740 | Icon Sizing (Lucide Tokens) | `svg` | One of 16, 20, 24, 28, 48px | 12x12px | Minor |
| VIO-0076 | faculty | `#members` | 360x740 | Icon Sizing (Lucide Tokens) | `svg` | One of 16, 20, 24, 28, 48px | 12x12px | Minor |
| VIO-0077 | faculty | `#members` | 360x740 | Icon Sizing (Lucide Tokens) | `svg` | One of 16, 20, 24, 28, 48px | 12x12px | Minor |
| VIO-0078 | faculty | `#members` | 360x740 | Icon Sizing (Lucide Tokens) | `svg` | One of 16, 20, 24, 28, 48px | 12x12px | Minor |
| VIO-0079 | faculty | `#members` | 360x740 | Icon Sizing (Lucide Tokens) | `svg` | One of 16, 20, 24, 28, 48px | 12x12px | Minor |
| VIO-0080 | faculty | `#members` | 360x740 | Icon Sizing (Lucide Tokens) | `svg` | One of 16, 20, 24, 28, 48px | 12x12px | Minor |
| VIO-0081 | faculty | `#members` | 360x740 | Icon Sizing (Lucide Tokens) | `svg` | One of 16, 20, 24, 28, 48px | 12x12px | Minor |
| VIO-0082 | faculty | `#members` | 360x740 | Icon Sizing (Lucide Tokens) | `svg` | One of 16, 20, 24, 28, 48px | 12x12px | Minor |
| VIO-0083 | faculty | `#members` | 360x740 | Floating Nav Height | `nav.fixed.select-none` | 64px | 58px | Major |
| VIO-0084 | faculty | `#members` | 360x740 | Floating Nav 5 or 6 Slots | `nav.fixed.select-none` | 5 or 6 navigation slots | 2 slots | Major |
| VIO-0085 | faculty | `#members` | 360x740 | Pure White Scaffold Invariant | `body` | #FFFFFF (rgb(255, 255, 255)) | rgb(246, 251, 247) | Major |
| VIO-0086 | faculty | `#profile` | 360x740 | Font Scale | `h1.text-xl.sm:text-2xl` | One of: 11, 12, 13, 14, 15, 16, 18, 22, 28, 32px | 24px | Major |
| VIO-0087 | faculty | `#profile` | 360x740 | Font Scale | `#profile-scholar-identity` | One of: 11, 12, 13, 14, 15, 16, 18, 22, 28, 32px | 26px | Major |
| VIO-0088 | faculty | `#profile` | 360x740 | Font Scale | `span.text-lg.font-extrabold` | One of: 11, 12, 13, 14, 15, 16, 18, 22, 28, 32px | 20px | Major |
| VIO-0089 | faculty | `#profile` | 360x740 | Font Scale | `span.text-lg.font-extrabold` | One of: 11, 12, 13, 14, 15, 16, 18, 22, 28, 32px | 20px | Major |
| VIO-0090 | faculty | `#profile` | 360x740 | Font Scale | `span.text-lg.font-extrabold` | One of: 11, 12, 13, 14, 15, 16, 18, 22, 28, 32px | 20px | Major |
| VIO-0091 | faculty | `#profile` | 360x740 | Font Scale | `#chapter-gate-pass-heading` | One of: 11, 12, 13, 14, 15, 16, 18, 22, 28, 32px | 17px | Major |
| VIO-0092 | faculty | `#profile` | 360x740 | Font Scale | `#academic-dossier-heading` | One of: 11, 12, 13, 14, 15, 16, 18, 22, 28, 32px | 17px | Major |
| VIO-0093 | faculty | `#profile` | 360x740 | Font Scale | `#executive-governance-heading` | One of: 11, 12, 13, 14, 15, 16, 18, 22, 28, 32px | 17px | Major |
| VIO-0094 | faculty | `#profile` | 360x740 | Font Scale | `#account-actions-heading` | One of: 11, 12, 13, 14, 15, 16, 18, 22, 28, 32px | 17px | Major |
| VIO-0095 | faculty | `#profile` | 360x740 | Icon Sizing (Lucide Tokens) | `svg` | One of 16, 20, 24, 28, 48px | 13x13px | Minor |
| VIO-0096 | faculty | `#profile` | 360x740 | Floating Nav Height | `nav.fixed.select-none` | 64px | 58px | Major |
| VIO-0097 | faculty | `#profile` | 360x740 | Floating Nav 5 or 6 Slots | `nav.fixed.select-none` | 5 or 6 navigation slots | 2 slots | Major |
| VIO-0098 | faculty | `#profile` | 360x740 | Pure White Scaffold Invariant | `body` | #FFFFFF (rgb(255, 255, 255)) | rgb(246, 251, 247) | Major |
| VIO-0099 | faculty | `#attendance` | 360x740 | Icon Sizing (Lucide Tokens) | `svg` | One of 16, 20, 24, 28, 48px | 12x12px | Minor |
| VIO-0100 | faculty | `#attendance` | 360x740 | Icon Sizing (Lucide Tokens) | `svg` | One of 16, 20, 24, 28, 48px | 12x12px | Minor |
| VIO-0101 | faculty | `#attendance` | 360x740 | Floating Nav Height | `nav.fixed.select-none` | 64px | 58px | Major |
| VIO-0102 | faculty | `#attendance` | 360x740 | Floating Nav 5 or 6 Slots | `nav.fixed.select-none` | 5 or 6 navigation slots | 2 slots | Major |
| VIO-0103 | faculty | `#attendance` | 360x740 | Pure White Scaffold Invariant | `body` | #FFFFFF (rgb(255, 255, 255)) | rgb(246, 251, 247) | Major |
| VIO-0104 | faculty | `#reports` | 360x740 | Font Scale | `div.font-bold.tracking-tight` | One of: 11, 12, 13, 14, 15, 16, 18, 22, 28, 32px | 24px | Major |
| VIO-0105 | faculty | `#reports` | 360x740 | Font Scale | `div.font-bold.tracking-tight` | One of: 11, 12, 13, 14, 15, 16, 18, 22, 28, 32px | 24px | Major |
| VIO-0106 | faculty | `#reports` | 360x740 | Font Scale | `div.font-bold.tracking-tight` | One of: 11, 12, 13, 14, 15, 16, 18, 22, 28, 32px | 24px | Major |
| VIO-0107 | faculty | `#reports` | 360x740 | Floating Nav Height | `nav.fixed.select-none` | 64px | 58px | Major |
| VIO-0108 | faculty | `#reports` | 360x740 | Floating Nav 5 or 6 Slots | `nav.fixed.select-none` | 5 or 6 navigation slots | 2 slots | Major |
| VIO-0109 | faculty | `#reports` | 360x740 | Pure White Scaffold Invariant | `body` | #FFFFFF (rgb(255, 255, 255)) | rgb(246, 251, 247) | Major |
| VIO-0110 | faculty | `#approvals` | 360x740 | Floating Nav Height | `nav.fixed.select-none` | 64px | 58px | Major |
| VIO-0111 | faculty | `#approvals` | 360x740 | Floating Nav 5 or 6 Slots | `nav.fixed.select-none` | 5 or 6 navigation slots | 2 slots | Major |
| VIO-0112 | faculty | `#approvals` | 360x740 | Pure White Scaffold Invariant | `body` | #FFFFFF (rgb(255, 255, 255)) | rgb(246, 251, 247) | Major |
| VIO-0113 | faculty | `#notifications` | 360x740 | Floating Nav Height | `nav.fixed.select-none` | 64px | 58px | Major |
| VIO-0114 | faculty | `#notifications` | 360x740 | Floating Nav 5 or 6 Slots | `nav.fixed.select-none` | 5 or 6 navigation slots | 2 slots | Major |
| VIO-0115 | faculty | `#notifications` | 360x740 | Pure White Scaffold Invariant | `body` | #FFFFFF (rgb(255, 255, 255)) | rgb(246, 251, 247) | Major |
| VIO-0116 | faculty | `#home` | 390x844 | Font Scale | `div.font-bold.tracking-tight` | One of: 11, 12, 13, 14, 15, 16, 18, 22, 28, 32px | 24px | Major |
| VIO-0117 | faculty | `#home` | 390x844 | Font Scale | `div.font-bold.tracking-tight` | One of: 11, 12, 13, 14, 15, 16, 18, 22, 28, 32px | 24px | Major |
| VIO-0118 | faculty | `#home` | 390x844 | Font Scale | `div.font-bold.tracking-tight` | One of: 11, 12, 13, 14, 15, 16, 18, 22, 28, 32px | 24px | Major |
| VIO-0119 | faculty | `#home` | 390x844 | Icon Sizing (Lucide Tokens) | `svg` | One of 16, 20, 24, 28, 48px | 13x13px | Minor |
| VIO-0120 | faculty | `#home` | 390x844 | Floating Nav Height | `nav.fixed.select-none` | 64px | 58px | Major |
| VIO-0121 | faculty | `#home` | 390x844 | Floating Nav 5 or 6 Slots | `nav.fixed.select-none` | 5 or 6 navigation slots | 2 slots | Major |
| VIO-0122 | faculty | `#home` | 390x844 | Pure White Scaffold Invariant | `body` | #FFFFFF (rgb(255, 255, 255)) | rgb(246, 251, 247) | Major |
| VIO-0123 | faculty | `#events` | 390x844 | Icon Sizing (Lucide Tokens) | `svg` | One of 16, 20, 24, 28, 48px | 12x12px | Minor |
| VIO-0124 | faculty | `#events` | 390x844 | Icon Sizing (Lucide Tokens) | `svg` | One of 16, 20, 24, 28, 48px | 12x12px | Minor |
| VIO-0125 | faculty | `#events` | 390x844 | Floating Nav Height | `nav.fixed.select-none` | 64px | 58px | Major |
| VIO-0126 | faculty | `#events` | 390x844 | Floating Nav 5 or 6 Slots | `nav.fixed.select-none` | 5 or 6 navigation slots | 2 slots | Major |
| VIO-0127 | faculty | `#events` | 390x844 | Pure White Scaffold Invariant | `body` | #FFFFFF (rgb(255, 255, 255)) | rgb(246, 251, 247) | Major |
| VIO-0128 | faculty | `#operations` | 390x844 | Floating Nav Height | `nav.fixed.select-none` | 64px | 58px | Major |
| VIO-0129 | faculty | `#operations` | 390x844 | Floating Nav 5 or 6 Slots | `nav.fixed.select-none` | 5 or 6 navigation slots | 2 slots | Major |
| VIO-0130 | faculty | `#operations` | 390x844 | Pure White Scaffold Invariant | `body` | #FFFFFF (rgb(255, 255, 255)) | rgb(246, 251, 247) | Major |
| VIO-0131 | faculty | `#members` | 390x844 | Font Scale | `span` | One of: 11, 12, 13, 14, 15, 16, 18, 22, 28, 32px | 17px | Major |
| VIO-0132 | faculty | `#members` | 390x844 | Font Scale | `span` | One of: 11, 12, 13, 14, 15, 16, 18, 22, 28, 32px | 17px | Major |
| VIO-0133 | faculty | `#members` | 390x844 | Font Scale | `span` | One of: 11, 12, 13, 14, 15, 16, 18, 22, 28, 32px | 17px | Major |
| VIO-0134 | faculty | `#members` | 390x844 | Font Scale | `span` | One of: 11, 12, 13, 14, 15, 16, 18, 22, 28, 32px | 17px | Major |
| VIO-0135 | faculty | `#members` | 390x844 | Font Scale | `span` | One of: 11, 12, 13, 14, 15, 16, 18, 22, 28, 32px | 17px | Major |
| VIO-0136 | faculty | `#members` | 390x844 | Font Scale | `span` | One of: 11, 12, 13, 14, 15, 16, 18, 22, 28, 32px | 17px | Major |
| VIO-0137 | faculty | `#members` | 390x844 | Font Scale | `span` | One of: 11, 12, 13, 14, 15, 16, 18, 22, 28, 32px | 17px | Major |
| VIO-0138 | faculty | `#members` | 390x844 | Font Scale | `span` | One of: 11, 12, 13, 14, 15, 16, 18, 22, 28, 32px | 17px | Major |
| VIO-0139 | faculty | `#members` | 390x844 | Font Scale | `span` | One of: 11, 12, 13, 14, 15, 16, 18, 22, 28, 32px | 17px | Major |
| VIO-0140 | faculty | `#members` | 390x844 | Font Scale | `span` | One of: 11, 12, 13, 14, 15, 16, 18, 22, 28, 32px | 17px | Major |
| VIO-0141 | faculty | `#members` | 390x844 | Font Scale | `span` | One of: 11, 12, 13, 14, 15, 16, 18, 22, 28, 32px | 17px | Major |
| VIO-0142 | faculty | `#members` | 390x844 | Font Scale | `span` | One of: 11, 12, 13, 14, 15, 16, 18, 22, 28, 32px | 17px | Major |
| VIO-0143 | faculty | `#members` | 390x844 | Font Scale | `span` | One of: 11, 12, 13, 14, 15, 16, 18, 22, 28, 32px | 17px | Major |
| VIO-0144 | faculty | `#members` | 390x844 | Font Scale | `span` | One of: 11, 12, 13, 14, 15, 16, 18, 22, 28, 32px | 17px | Major |
| VIO-0145 | faculty | `#members` | 390x844 | Font Scale | `span` | One of: 11, 12, 13, 14, 15, 16, 18, 22, 28, 32px | 17px | Major |
| VIO-0146 | faculty | `#members` | 390x844 | Font Scale | `span` | One of: 11, 12, 13, 14, 15, 16, 18, 22, 28, 32px | 17px | Major |
| VIO-0147 | faculty | `#members` | 390x844 | Font Scale | `span` | One of: 11, 12, 13, 14, 15, 16, 18, 22, 28, 32px | 17px | Major |
| VIO-0148 | faculty | `#members` | 390x844 | Font Scale | `span` | One of: 11, 12, 13, 14, 15, 16, 18, 22, 28, 32px | 17px | Major |
| VIO-0149 | faculty | `#members` | 390x844 | Font Scale | `span` | One of: 11, 12, 13, 14, 15, 16, 18, 22, 28, 32px | 17px | Major |
| VIO-0150 | faculty | `#members` | 390x844 | Font Scale | `span` | One of: 11, 12, 13, 14, 15, 16, 18, 22, 28, 32px | 17px | Major |

*... and 1895 additional violations documented in layout-audit-report.json.*
