export const formatRelativeTime = (isoStringOrDate: string | Date): string => {
    const date = typeof isoStringOrDate === 'string' ? new Date(isoStringOrDate) : isoStringOrDate;
    const now = new Date();
    
    // Reset time part for day comparison
    const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const diffTime = endOfNow.getTime() - startDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    const timeFormat: Intl.DateTimeFormatOptions = {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    };

    if (diffDays === 0) {
        return `Hoy ${date.toLocaleTimeString('en-US', timeFormat)}`;
    }
    if (diffDays === 1) {
        return `Ayer ${date.toLocaleTimeString('en-US', timeFormat)}`;
    }
    if (diffDays > 1 && diffDays < 7) {
        return `Hace ${diffDays} días`;
    }
    return date.toLocaleDateString('es-CO');
};
