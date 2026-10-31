export const formatMinutes = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

export const capitalise = (text) => text.charAt(0).toUpperCase() + text.slice(1);

export const progressBar = (current, total, length = 10) => {
    const filled = Math.min(length, Math.max(0, Math.round((current / total) * length)));
    return '▰'.repeat(filled) + '▱'.repeat(length - filled);
};