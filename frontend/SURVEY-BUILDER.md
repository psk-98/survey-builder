# Survey builder

A React Flow editor built into the supplied TanStack Start starter.

## Run

Use Node 22.12+ (or a newer supported LTS release).

```sh
npm ci
npm run dev
```

Open http://localhost:3000. This editor does not require environment variables. The original archive’s private `.env.local` is intentionally not included.

## Use

- One Start is provided and cannot be deleted. Add as many End blocks as needed; End blocks can be edited and deleted.
- Click Text, Options, or End in the toolkit to add a block at the center of the visible canvas.
- Select a block to edit its title, message, or choices in the right panel.
- Drag blocks to position them; drag between handles to connect them.
- Each option has its own outgoing handle, allowing separate branches.
- Connecting an already connected output replaces that output’s previous connection.
- Self-links and cycles are rejected. Start has no incoming connections and End has no outgoing connections.
- Select a connection and press Delete or Backspace to remove it. Text, Options, and End blocks can also be deleted.
- View JSON opens a live snapshot. Export JSON downloads it.

Changes are held in memory for this first iteration. Refreshing resets the example survey. JSON import, persistent storage, respondent preview, and execution are not implemented yet.

## JSON contract — version 1

```json
{
  "schemaVersion": 1,
  "title": "Customer experience",
  "startNodeId": "start",
  "nodes": [
    {
      "id": "start",
      "type": "start",
      "position": { "x": 60, "y": 180 },
      "data": { "label": "Welcome", "content": "Hello!", "options": [] }
    },
    {
      "id": "end",
      "type": "end",
      "position": { "x": 400, "y": 180 },
      "data": { "label": "Thank you", "content": "All done.", "options": [] }
    }
  ],
  "edges": [
    { "id": "start-end", "source": "start", "target": "end", "sourceHandle": "next" }
  ]
}
```

Node types: `start`, `text`, `options`, `end`. Options contain `{ id, label }` objects. Option IDs use short names such as `option_1`, `option_2`, and `option_3`, scoped to each block. Adding a choice uses the next number above the existing highest number, so deleting a middle choice cannot create a duplicate. Existing options are never renumbered when labels change or choices are removed. A deleted highest number may be reused; its old connection is removed on deletion. The source node ID plus option ID uniquely identifies a branch. On edges leaving an Options node, `sourceHandle` is the option ID. Other outgoing edges use `next`. Removing an option also removes its connection.

Array order reflects the editor’s insertion order, not survey execution order. Use `startNodeId` and directed edges for traversal or a later topological sort; canvas positions are presentation data only. Branches do not define a unique linear order. Check paths validates every choice, detects dead ends and loops, and flags blocks unreachable from Start. Every branch must eventually reach an End. Multiple branches may share an End or use separate Ends. Click an issue to select its block. The checker updates live after edits. Incomplete drafts may still be exported; the JSON preview labels them as drafts with path issues. The export schema remains unchanged.

Implementation: `src/components/survey/model.ts` defines the export and graph rules. `SurveyBuilder.tsx` handles the canvas and editing; `survey.css` contains the editor styles.

## Checks

```sh
npx tsc --noEmit
npm run build
node --experimental-strip-types --test tests/survey.test.mjs
```
