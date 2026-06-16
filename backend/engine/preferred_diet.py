from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple

from .nutrition import check_basic_nutrition
from .diet_plan import build_healthy_alternatives


@dataclass(frozen=True)
class PreferredDietResult:
    chosen_meals: Tuple[str, ...]
    nutrition_ok: bool
    issues: Tuple[str, ...]
    score: float


def preferred_to_main_category(preferred: str) -> Optional[str]:
    if not preferred:
        return None
    p = preferred.lower()
    if any(k in p for k in ["pasta", "bolognese", "carbonara", "alfredo", "makaron", "spaghetti", "napoli"]):
        return "pasta"
    if any(k in p for k in ["chicken", "kotop"]):
        return "chicken"
    if any(k in p for k in ["fish", "psari"]):
        return "fish"
    if "pizza" in p:
        return "pizza"
    if any(k in p for k in ["lasagna", "vegetarian", "vegan"]):
        return "vegetarian"
    if "beef" in p or "mosx" in p:
        return "beef"
    return None


def choose_meals_with_preferences(
    menu_candidates: List[str],
    preferred_foods: List[str],
    max_meals: int = 3,
) -> PreferredDietResult:
    """Pick a meal subset while prioritizing user preferred foods.

    This is intentionally heuristic:
    - We first order candidates so that meals matching preferred categories come first.
    - Then we run check_basic_nutrition and select the best-scoring subset.
    """

    candidates = [m for m in menu_candidates if m]
    if not candidates:
        empty = check_basic_nutrition([])
        return PreferredDietResult(chosen_meals=tuple(), nutrition_ok=empty.meets_basic_guidelines, issues=tuple(empty.issues), score=empty.score)

    preferred_categories = [preferred_to_main_category(p) for p in (preferred_foods or [])]
    preferred_categories = [c for c in preferred_categories if c]

    def pref_key(m: str) -> int:
        ml = (m or "").lower()
        if any(cat == "pasta" and any(k in ml for k in ["pasta", "bolognese", "carbonara", "alfredo", "napoli", "makaron", "spaghetti"]) for cat in preferred_categories):
            return 0
        if any(cat == "chicken" and any(k in ml for k in ["chicken", "kotop"]) for cat in preferred_categories):
            return 1
        if any(cat == "fish" and any(k in ml for k in ["fish", "psari"]) for cat in preferred_categories):
            return 2
        if any(cat == "pizza" and "pizza" in ml for _ in preferred_categories):
            return 3
        if any(cat == "vegetarian" and any(k in ml for k in ["vegetarian", "lasagna", "vegan"]) for cat in preferred_categories):
            return 4
        if any(cat == "beef" and ("beef" in ml or "mosx" in ml) for cat in preferred_categories):
            return 5
        return 10

    # diversify within healthier ordering, but keep preferences at front
    candidates_sorted = sorted(set(candidates), key=lambda m: (pref_key(m), build_healthy_alternatives([m])[0] if False else 0))

    # simple: try size 1..max_meals picking prefix subsets from sorted list
    best = None
    best_set: Tuple[str, ...] = tuple()

    sizes = list(range(1, min(max_meals, len(candidates_sorted)) + 1))
    for size in sizes:
        trial = tuple(candidates_sorted[:size])
        res = check_basic_nutrition(list(trial))
        if best is None:
            best = res
            best_set = trial
            continue

        # prefer meeting guidelines, then higher score
        if res.meets_basic_guidelines and not best.meets_basic_guidelines:
            best = res
            best_set = trial
        elif res.meets_basic_guidelines and best.meets_basic_guidelines and res.score > best.score:
            best = res
            best_set = trial
        elif (not res.meets_basic_guidelines) and (not best.meets_basic_guidelines) and res.score > best.score:
            best = res
            best_set = trial

        if res.meets_basic_guidelines:
            break

    if best is None:
        best = check_basic_nutrition([])

    return PreferredDietResult(
        chosen_meals=best_set,
        nutrition_ok=best.meets_basic_guidelines,
        issues=tuple(best.issues),
        score=best.score,
    )

