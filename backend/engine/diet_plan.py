from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple

from .nutrition import check_basic_nutrition, NutritionResult


@dataclass(frozen=True)
class DietAssessment:
    # chosen meals by the algorithm for a day
    chosen_meals: Tuple[str, ...]
    # waste predictions for those meals (optional)
    issues: Tuple[str, ...]
    meets_basic_guidelines: bool
    nutrition_score: float


def build_healthy_alternatives(all_meals: List[str]) -> List[str]:
    """Simple preference ordering for healthier options.

    This is intentionally heuristic until a real nutrition dataset exists.
    """

    def key(m: str) -> int:
        ml = (m or "").lower()
        if "vegetarian" in ml or "lasagna" in ml:
            return 0
        if "chicken" in ml:
            return 1
        if "fish" in ml:
            return 2
        if "pizza" in ml:
            return 3
        if "pasta" in ml or "bolognese" in ml or "carbonara" in ml or "alfredo" in ml:
            return 4
        return 10

    return sorted(all_meals, key=key)


def choose_meals_for_day(
    menu_candidates: List[str],
    max_meals: int = 3,
    target_should_meet: bool = True,
) -> DietAssessment:

    """Pick a set of meals that satisfy basic nutrition heuristics.

    - menu_candidates: a list of meal names for the day (could include pasta-only)
    - max_meals: number of meals to choose from the candidates

    If nutrition cannot be satisfied, we still return the best-scoring set.
    """

    # Normalize & dedupe
    candidates = []
    seen = set()
    for m in menu_candidates:
        if m and m not in seen:
            seen.add(m)
            candidates.append(m)

    candidates = build_healthy_alternatives(candidates)

    best: Optional[NutritionResult] = None
    best_set: Tuple[str, ...] = tuple()

    # Try combinations of size 1..max_meals by greedy slicing for speed.
    # (No combinatorial explosion.)
    sizes_to_try = list(range(1, min(max_meals, len(candidates)) + 1))

    for size in sizes_to_try:
        trial = tuple(candidates[:size])

        res = check_basic_nutrition(list(trial))
        if best is None:
            best = res
            best_set = trial
            continue

        # Prefer meeting guidelines; if neither meets, pick higher score
        if target_should_meet:
            if res.meets_basic_guidelines and not best.meets_basic_guidelines:
                best = res
                best_set = trial
            elif res.meets_basic_guidelines and best.meets_basic_guidelines:
                if res.score > best.score:
                    best = res
                    best_set = trial
            else:
                if res.score > best.score:
                    best = res
                    best_set = trial
        else:
            if res.score > best.score:
                best = res
                best_set = trial

        if res.meets_basic_guidelines and target_should_meet:
            # good enough; stop early
            break

    if best is None:
        best = check_basic_nutrition([])

    # Prefer higher-scoring balanced sets, but add a deterministic tie-breaker
    # so we don't always end up with the same 1st/2nd choices.
    chosen = best_set if best_set else tuple(candidates[:max_meals])

    # Small tie-breaker: compute a light heuristic directly from nutrition totals
    # (keeps logic simple; nutrition.py already has coarse nutrition numbers).
    nutrition_score = best.score
    try:
        from .nutrition import get_meal_nutrition

        totals_fiber = 0.0
        totals_protein = 0.0
        for m in chosen:
            n = get_meal_nutrition(m)
            if n:
                totals_fiber += n.fiber_g
                totals_protein += n.protein_g
        nutrition_score = nutrition_score + 0.0005 * totals_fiber + 0.0005 * totals_protein
    except Exception:
        # fallback to original best.score
        pass

    return DietAssessment(
        chosen_meals=chosen,
        issues=tuple(best.issues),
        meets_basic_guidelines=best.meets_basic_guidelines,
        nutrition_score=nutrition_score,
    )


