import { Strategy } from "./strategy";
import { Context, SnakeDirection, Snake, Position } from "./context";
import { LazyGraph } from "./lib/lazy-graph/LazyGraph";

const gridSize = 18;

export class CustomStrategy implements Strategy {
  /**
   * General strategy: Just find the shortest path from the current position to the fruit.
   * In the first 500 moves, it is rather unlikely that this will yield
   * in a situation where all paths are blocked by the snake.
   */
  step(context: Context): SnakeDirection {
    // This executes the a* algorithm to find the optimal path to the next fruit.
    const pathToFood = graph.findPath({
      startNode: context,
      isEnd: (s) =>
        hashPosition(s.snake.parts[0]) === hashPosition(context.fruit),
      estimateCost: (s) => {
        const currentHead = s.snake.parts[0];
        const xDist = Math.abs(currentHead.x - context.fruit.x);
        const xDistReverse = gridSize - xDist;

        const yDist = Math.abs(currentHead.y - context.fruit.y);
        const yDistReverse = gridSize - yDist;
        return Math.min(xDist, xDistReverse) + Math.min(yDist, yDistReverse);
      },
      // If this path is longer than 50 moves, fail the search, to prevent
      // browser freezes.
      maxCosts: 50,
    });

    if (pathToFood.isFail()) {
      console.log("Error - no path found!");
      return SnakeDirection.left;
    } else {
      const firstStep = pathToFood.getPath()[1].data;
      const currentHead = context.snake.parts[0];
      const nextHead = firstStep.snake.parts[0];
      if (nextHead.x === currentHead.x + 1) {
        return SnakeDirection.right;
      }
      if (nextHead.x === currentHead.x + 1 - gridSize) {
        return SnakeDirection.right;
      }

      if (nextHead.x === currentHead.x - 1) {
        return SnakeDirection.left;
      }
      if (nextHead.x === currentHead.x - 1 + gridSize) {
        return SnakeDirection.left;
      }

      if (nextHead.y === currentHead.y + 1) {
        return SnakeDirection.down;
      }
      if (nextHead.y === currentHead.y + 1 - gridSize) {
        return SnakeDirection.down;
      }

      if (nextHead.y === currentHead.y - 1) {
        return SnakeDirection.up;
      }
      if (nextHead.y === currentHead.y - 1 + gridSize) {
        return SnakeDirection.up;
      }

      return SnakeDirection.left;
    }
  }
}

const graph = new LazyGraph<Context>({
  // Get possible next head positions for current state
  // No matter if the position is viable for finding the target
  getNeighbours: (context) => {
    const snakeParts = context.snake.parts;
    const { x: headX, y: headY } = snakeParts[0];

    const candidates = [
      { x: headX + 1, y: headY },
      { x: headX, y: headY + 1 },
      { x: headX - 1, y: headY },
      { x: headX, y: headY - 1 },
    ];

    for (const c of candidates) {
      if (c.x < 0) c.x = gridSize - 1;
      if (c.y < 0) c.y = gridSize - 1;
      if (c.y === gridSize) c.y = 0;
      if (c.x === gridSize) c.x = 0;
    }

    const newSnakeTail = snakeParts.slice(0, -1);

    const obstacleHashes = context.obstacles.map(hashPosition);
    const snakeTailHashes = snakeParts.map(hashPosition);

    const validCandidates = candidates.filter((c) => {
      const hash = hashPosition(c);
      return !obstacleHashes.includes(hash) && !snakeTailHashes.includes(hash);
    });

    const newStates = validCandidates.map(
      (c): Context => {
        return {
          ...context,
          snake: {
            ...context.snake,
            parts: [c, ...newSnakeTail],
          },
        };
      }
    );

    return newStates;
  },
  // Only account for the first 6 parts of the snake for
  // comparing different states
  hashData: (context) =>
    context.snake.parts.slice(0, 5).map(hashPosition).join(" --- "),
});

function hashPosition(p: Position) {
  return `${p.x}-${p.y}`;
}
