import { useCallback, useState } from 'react';
import type { ElementStyle } from './useElementStyle';

const MAX_SNAPSHOTS = 10;

/**
 * Per-node undo history for node styling. Each node id keeps its own stack of at
 * most `max` previous style snapshots; the oldest is dropped once the cap is hit.
 *
 * Usage: before applying a new style to a node, `record` the style it had; to
 * undo, `undo` pops and returns the most recent snapshot to re-apply.
 */
export function useStyleHistory(max: number = MAX_SNAPSHOTS) {
  const [stacks, setStacks] = useState<Record<string, ElementStyle[]>>({});

  const record = useCallback(
    (nodeId: string, snapshot: ElementStyle) => {
      setStacks((prev) => {
        const stack = prev[nodeId] ?? [];
        return { ...prev, [nodeId]: [...stack, snapshot].slice(-max) };
      });
    },
    [max]
  );

  const undo = useCallback(
    (nodeId: string): ElementStyle | undefined => {
      const stack = stacks[nodeId];
      if (!stack || stack.length === 0) return undefined;
      setStacks((prev) => {
        const current = prev[nodeId] ?? [];
        return { ...prev, [nodeId]: current.slice(0, -1) };
      });
      return stack[stack.length - 1];
    },
    [stacks]
  );

  const canUndo = useCallback(
    (nodeId?: string | null) => !!nodeId && (stacks[nodeId]?.length ?? 0) > 0,
    [stacks]
  );

  return { record, undo, canUndo };
}
