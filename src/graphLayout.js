export const VIEWBOX_WIDTH = 740;
export const VIEWBOX_HEIGHT = 400;
export const VIEWBOX = `0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`;

const COLUMNS = 5;
const COL_GAP = 140;
const ROW_GAP = 130;
const ORIGIN_X = 90;
const ORIGIN_Y = 70;

export function buildGraph(spaces) {
  const nodes = spaces.map((space, index) => {
    const col = index % COLUMNS;
    const row = Math.floor(index / COLUMNS);
    return { id: space.id, space, x: ORIGIN_X + col * COL_GAP, y: ORIGIN_Y + row * ROW_GAP };
  });

  const edges = [];
  nodes.forEach((node, index) => {
    const right = nodes[index + 1];
    if (right && (index + 1) % COLUMNS !== 0) {
      edges.push({ from: node.id, to: right.id, x1: node.x, y1: node.y, x2: right.x, y2: right.y });
    }
    const down = nodes[index + COLUMNS];
    if (down) {
      edges.push({ from: node.id, to: down.id, x1: node.x, y1: node.y, x2: down.x, y2: down.y });
    }
  });

  return { nodes, edges };
}
