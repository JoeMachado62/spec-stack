import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' }
});

// Attach token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('spec_stack_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401s globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('spec_stack_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// === Auth ===
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (data) => api.put('/auth/profile', data),
    storeApiKeys: (data) => api.post('/auth/api-keys', data),
};

// === Projects ===
export const projectsAPI = {
    list: () => api.get('/projects'),
    create: (data) => api.post('/projects', data),
    get: (id) => api.get(`/projects/${id}`),
    update: (id, data) => api.put(`/projects/${id}`, data),
    delete: (id) => api.delete(`/projects/${id}`),
};

// === Specifications ===
export const specsAPI = {
    get: (specId) => api.get(`/specs/${specId}`),
    processStage1: (specId, data) => api.post(`/specs/${specId}/stage/1`, data),
    processStage2: (specId, data) => api.post(`/specs/${specId}/stage/2`, data),
    processStage3: (specId, data) => api.post(`/specs/${specId}/stage/3`, data),
    processStage4: (specId) => api.post(`/specs/${specId}/stage/4`),
    updateStage: (specId, stageNum, data) => api.patch(`/specs/${specId}/stage/${stageNum}`, { data }),
    uploadDocuments: (specId, files) => {
        const formData = new FormData();
        files.forEach(f => formData.append('files', f));
        return api.post(`/specs/${specId}/documents`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
    updateFlowchart: (specId, data) => api.put(`/specs/${specId}/flowchart`, data),
    export: (specId, format) => api.get(`/specs/${specId}/export/${format}`, { responseType: 'blob' }),
};

// === Examples ===
export const examplesAPI = {
    list: (params) => api.get('/examples', { params }),
    get: (id) => api.get(`/examples/${id}`),
};

// === Execution ===
export const executionAPI = {
    listModels: () => api.get('/execution/models'),
    runSpec: (specId, data) => api.post(`/execution/${specId}/run`, data),
};

export default api;

