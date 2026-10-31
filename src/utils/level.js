// Placeholder: 1 minute studied = 1 XP, and each level costs a bit more than the last
const xpForLevel = (level) => 60 + level * 30;

export const getLevelInfo = (totalXp) => {
    let level = 0;
    let remaining = totalXp;

    while (remaining >= xpForLevel(level)) {
        remaining -= xpForLevel(level);
        level++;
    }

    return { level, current: remaining, needed: xpForLevel(level) };
};