/**
 * Checks if the provided data was created in the current year
 * @param {Object} data - The data object to check
 * @param {Date} data.createdAt - The creation date of the data
 * @returns {boolean} - True if data was created in current year, false otherwise
 */
export const isDataCurrentYear = (data) => {
    if (!data) return false;
    const currentYear = new Date().getFullYear();
    const dataYear = new Date(data.createdAt).getFullYear();
    return currentYear === dataYear;
};

export const getTimestamps = () => {
    const now = new Date();
    return {
        createdAt: now,
        expiresAt: new Date(now.getFullYear(), now.getMonth() + 12, now.getDate()) // expires in 1 year
    };
};
