"""Shared quiz XP tier helpers: 1st=full, 2nd=half, 3rd=10%, then 0."""


def quiz_xp_for_pass_attempt(points_reward, previous_attempts_count):
    """
    XP for the first successful pass of a quiz.

    previous_attempts_count = attempts already recorded BEFORE this pass.
    With default points_reward=50 → 50 / 25 / 5 / 0.
    """
    reward = int(points_reward or 0)
    if reward <= 0:
        return 0
    if previous_attempts_count == 0:
        return reward
    if previous_attempts_count == 1:
        return max(1, reward // 2)
    if previous_attempts_count == 2:
        return max(1, reward // 10)
    return 0
