import { useMemo } from "react";
import { useData } from "../context/DataContext";
import { useStats } from "./useStats";

export function useMilestones() {
  const { state } = useData();
  const stats = useStats();

  return useMemo(() => {
    const evaluated = state.milestones.map((m) => {
      if (m.type === "manual") {
        return { ...m, unlocked: !!m.unlockedAt };
      }

      // Computed milestone — evaluate rule against stats
      if (m.rule) {
        const statValue = stats[m.rule.field];
        let unlocked = false;
        if (m.rule.operator === ">=" && typeof statValue === "number") {
          unlocked = statValue >= m.rule.value;
        }

        // Update description with live value
        let desc = m.desc;
        if (m.rule.field === "totalDistance") {
          desc = unlocked ? `${stats.totalDistance}km and counting` : `${stats.totalDistance}/${m.rule.value}km total distance`;
        } else if (m.rule.field === "totalEvents") {
          desc = `${stats.totalEvents}/${m.rule.value} events`;
        }

        return { ...m, unlocked, desc };
      }

      return { ...m, unlocked: !!m.unlockedAt };
    });

    const unlocked = evaluated.filter((m) => m.unlocked);
    const locked = evaluated.filter((m) => !m.unlocked);

    return { milestones: evaluated, unlocked, locked, unlockedCount: unlocked.length, totalCount: evaluated.length };
  }, [state.milestones, stats]);
}
