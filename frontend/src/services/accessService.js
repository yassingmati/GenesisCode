import API_CONFIG from '../config/api';

const HEADERS = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};

const handleResponse = async (res) => {
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(data.message || 'Access check failed');
    }
    return data;
};

export const AccessService = {
    /**
     * Check access for a specific context (Path, Level, or Exercise)
     * @param {string} pathId - Required
     * @param {string} [levelId] - Optional
     * @param {string} [exerciseId] - Optional
     * @returns {Promise<{success: boolean, access: object}>}
     */
    checkAccess: async (pathId, levelId = null, exerciseId = null) => {
        if (!pathId) throw new Error('PathID is required');

        const params = new URLSearchParams();
        params.append('pathId', pathId);
        if (levelId) params.append('levelId', levelId);
        if (exerciseId) params.append('exerciseId', exerciseId);

        const url = `${API_CONFIG.BASE_URL}/api/access/check?${params.toString()}`;

        try {
            const res = await fetch(url, {
                method: 'GET',
                headers: HEADERS()
            });
            return handleResponse(res);
        } catch (error) {
            console.error('Access verification error:', error);
            // Return a safe default structure on error to prevent crashes
            return { success: false, access: { hasAccess: false, reason: 'error' } };
        }
    }
};

export default AccessService;
