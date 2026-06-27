# Crime Scene Clues

A browser-based deduction puzzle prototype inspired by grid logic games and murder mystery reasoning.

Players reconstruct a crime scene by placing suspects and the victim on a grid-based map. Every character has a clue. Every clue is a logical constraint. The case is solved when all characters are placed correctly and the murderer is identified as the only suspect alone with the victim in the same area.

## Project Status

Prototype in active development.

Current focus:

- Playable single-level prototype
- Grid-based deduction rules
- Character placement
- X-marking for eliminated cells
- Board validation
- Murderer resolution
- Reusable level data structure

## Game Concept

Crime Scene Clues combines:

1. Sudoku-like row and column constraints
2. Spatial reasoning based on areas, objects, and adjacency
3. Narrative deduction to identify the murderer

The player does not guess the murderer directly. The murderer is discovered only after the whole scene is reconstructed.

## Core Rules

- One person per row
- One person per column
- Every clue must be true
- People can only stand on occupiable cells
- Some objects can be occupied
- Some objects block placement
- “Beside” means left, right, above, or below
- “Beside” does not include diagonals
- “Beside” requires the person and the referenced object to be in the same area
- The murderer is the only suspect in the same area as the victim

## Current Prototype Level

### Level

Name: Preppers Prototype  
Difficulty: Medium  
Victim: Vivianna

### Areas

- Kitchen
- Living Room
- Bathroom
- Bedroom
- Yard
- Safe Room
- Supply
- Secret Stairs

### Characters and Clues

| Character | Role | Clue |
|---|---|---|
| Angelo | Suspect | There was a box in his area. He was not beside any box. |
| Blake | Suspect | He was in the Bedroom. |
| Carolina | Suspect | There was a man on the bed in her area. |
| Daryl | Suspect | Someone else was beside a shelf in her area. |
| Edna | Suspect | She was in the bottom row. |
| Friedrich | Suspect | He was beside a TV. |
| Greg | Suspect | He was sitting in a chair. |
| Howie | Suspect | He was in the Bathroom. |
| Vivianna | Victim | She was alone with the murderer. |

### Object Categories

Can be occupied:

- Car
- Chair
- Bed

Cannot be occupied:

- TV
- Shelf
- Box
- Table
- Shrub

## Gameplay

The player can:

- Select a character card
- Place a character on the board
- Move a placed character
- Remove a placed character
- Mark cells with X
- Erase marks
- Undo actions
- Reset the board
- Submit the solution
- Receive validation feedback
- Reveal the murderer when the case is solved

## Validation

When the player submits the board, the game checks:

1. Every character is placed
2. Every placed cell exists
3. Every placed cell is occupiable
4. No two characters share the same cell
5. No two characters share the same row
6. No two characters share the same column
7. Every clue is satisfied
8. The victim shares an area with exactly one suspect
9. The murderer can be resolved

If the solution is correct, the game reveals the murderer.

If the solution is incomplete or invalid, the game returns friendly feedback without revealing the full answer.

## Tech Stack

- Vite
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Vitest
- localStorage for local progress

No backend is required for the current prototype.

## Installation

Clone the repository:

```bash
git clone https://github.com/tatosgames/crime-scene-clues.git
cd crime-scene-clues
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

Run lint:

```bash
npm run lint
```

Run tests:

```bash
npm run test
```

Run tests in watch mode:

```bash
npm run test:watch
```

## Project Structure

```txt
src/
  components/
    game/
      Board.tsx
      CharacterCard.tsx
      Legend.tsx
      RuleHelper.tsx
      ToolPanel.tsx
      objectIcons.ts
    ui/
      shadcn components

  game/
    level.ts
    logic.ts
    storage.ts
    types.ts

  pages/
    Index.tsx
    NotFound.tsx

  hooks/
  lib/
```

## Main Modules

### `src/game/types.ts`

Defines the core TypeScript types:

- Level
- AreaDefinition
- BoardObject
- CharacterDefinition
- ClueDefinition
- SolutionDefinition
- GameState
- GameSnapshot
- Tool
- Mark

### `src/game/level.ts`

Contains the current prototype level data.

This includes:

- grid size
- areas
- objects
- characters
- clues
- expected solution

### `src/game/logic.ts`

Contains the current game logic:

- cell parsing
- area lookup
- object lookup
- occupiable cell checks
- beside checks
- clue evaluation
- murderer resolution
- candidate cell listing
- board validation
- character lookup by cell

### `src/game/storage.ts`

Handles local progress persistence through localStorage.

### `src/pages/Index.tsx`

Main playable screen.

It currently manages:

- selected tool
- selected character
- placements
- cell marks
- undo history
- feedback
- solved state
- reset dialog

## Data Model Overview

A level is defined as a structured object:

```ts
type Level = {
  id: string;
  title: string;
  difficulty: "easy" | "medium" | "hard" | "expert";
  grid: {
    rows: number;
    cols: number;
  };
  areas: AreaDefinition[];
  objects: BoardObject[];
  characters: CharacterDefinition[];
  clues: ClueDefinition[];
  solution: SolutionDefinition;
  rules: RuleConfig;
};
```

Cells use the format:

```txt
row,column
```

Example:

```txt
0,0
4,7
8,8
```

Rows and columns are zero-indexed internally.

## Clue Types

Current supported clue types include:

- `in_area`
- `not_in_area`
- `in_row`
- `in_column`
- `on_object`
- `beside_object`
- `not_beside_object`
- `area_contains_object`
- `area_contains_character_matching`
- `same_area_as_character`
- `different_area_than_character`
- `alone_with_victim`

Planned clue types:

- `direction_from_object`
- `direction_from_character`

Important: unsupported clue types should fail loudly during validation instead of silently passing.

## Murderer Resolver

The murderer resolver works like this:

1. Find the victim
2. Find the victim cell
3. Find the victim area
4. Count suspects in the same area
5. If exactly one suspect is in that area, that suspect is the murderer
6. If zero suspects are in that area, the board is invalid
7. If multiple suspects are in that area, the murderer is ambiguous

## Level Authoring Rules

A valid level should define:

- one grid
- one or more areas
- occupiable and non-occupiable objects
- at least two suspects
- exactly one victim
- one or more clues per relevant character
- one complete solution
- one resolved murderer

A valid level solution must satisfy:

- every character is placed
- every placement is inside the grid
- every placement is on an occupiable cell
- no two people share a row
- no two people share a column
- every clue passes
- the victim shares an area with exactly one suspect
- the resolved murderer matches the expected murderer

## Accessibility Goals

The prototype aims to support:

- semantic board structure
- grid and gridcell roles
- accessible cell labels
- visible focus states
- readable text
- non-color-only feedback
- keyboard-friendly interactions
- reduced motion support

## Current Known Technical Debt

The prototype is functional, but these areas should be improved before adding more levels:

1. Split `src/game/logic.ts` into smaller modules:
   - `grid.ts`
   - `clueEvaluator.ts`
   - `boardValidator.ts`
   - `murdererResolver.ts`
   - `candidateEngine.ts`

2. Add unit tests for:
   - valid solution
   - row conflicts
   - column conflicts
   - non-occupiable cells
   - missing characters
   - clue failures
   - murderer ambiguity

3. Move game state management out of `Index.tsx` into a reducer:
   - selected tool
   - selected character
   - placements
   - marks
   - history
   - feedback
   - solved state

4. Expand the candidate engine:
   - candidate cells per character
   - clue-based filtering
   - row and column filtering
   - debug support
   - hint support

5. Add a developer-only debug panel:
   - current placements
   - missing characters
   - row conflicts
   - column conflicts
   - clue pass or fail status
   - victim area
   - suspects in victim area
   - resolved murderer

## Recommended Roadmap

### Milestone 1: Logic Stability

- Add Vitest coverage for the current level
- Make unsupported clue types fail loudly
- Verify that the current solution is valid
- Verify that invalid boards fail correctly

### Milestone 2: Game Engine Refactor

- Split logic into dedicated pure modules
- Add a reducer for game state
- Keep UI components mostly presentational
- Preserve the current gameplay behavior

### Milestone 3: Debug and Authoring Tools

- Add developer-only debug panel
- Add candidate map per character
- Add level validation utilities
- Add authoring checklist

### Milestone 4: UX Polish

- Improve mobile layout
- Add keyboard shortcuts
- Add hover and selected-cell highlights
- Add clearer submit feedback
- Add optional hint system

### Milestone 5: More Levels

- Move level data to JSON files
- Add level selector
- Add difficulty tags
- Add solved progress tracking
- Add multiple original cases

## Design Direction

Use a playful detective board-game style with clean web readability:

- rounded cards
- soft shadows
- warm paper panels
- clear grid lines
- readable labels
- restrained motion
- mobile-first spacing

Avoid copying official or third-party art directly. Use original placeholder visuals, simple icons, emoji, or custom assets.

## Privacy

The current prototype does not require user accounts, analytics, or backend services.

Local progress is saved only in the browser through localStorage.

No personal data is collected by the app itself.

## Credits

Prototype direction: Rising Pixel  
Game design and development support: Luca Contato  
Built with Vite, React, TypeScript, Tailwind CSS, and shadcn/ui

## Disclaimer

This is an original web prototype inspired by deduction puzzle mechanics.

It is not affiliated with, endorsed by, or officially connected to any existing Murdoku publication, brand, author, or rights holder.

Use original assets for public releases.
