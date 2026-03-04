import { create } from 'zustand';
import { authAPI, projectsAPI, specsAPI } from '../services/api';

// === Auth Store ===
export const useAuthStore = create((set) => ({
    user: null,
    token: localStorage.getItem('spec_stack_token'),
    isAuthenticated: !!localStorage.getItem('spec_stack_token'),
    loading: false,
    error: null,

    login: async (email, password) => {
        set({ loading: true, error: null });
        try {
            const { data } = await authAPI.login({ email, password });
            localStorage.setItem('spec_stack_token', data.token);
            set({ user: data.user, token: data.token, isAuthenticated: true, loading: false });
            return data;
        } catch (err) {
            const error = err.response?.data?.error || 'Login failed';
            set({ error, loading: false });
            throw err;
        }
    },

    register: async (email, password, name, business_type) => {
        set({ loading: true, error: null });
        try {
            const { data } = await authAPI.register({ email, password, name, business_type });
            localStorage.setItem('spec_stack_token', data.token);
            set({ user: data.user, token: data.token, isAuthenticated: true, loading: false });
            return data;
        } catch (err) {
            const error = err.response?.data?.error || 'Registration failed';
            set({ error, loading: false });
            throw err;
        }
    },

    fetchProfile: async () => {
        try {
            const { data } = await authAPI.getProfile();
            set({ user: data.user, isAuthenticated: true });
        } catch {
            set({ user: null, isAuthenticated: false });
            localStorage.removeItem('spec_stack_token');
        }
    },

    logout: () => {
        localStorage.removeItem('spec_stack_token');
        set({ user: null, token: null, isAuthenticated: false });
    },

    clearError: () => set({ error: null }),
}));

// === Projects Store ===
export const useProjectStore = create((set) => ({
    projects: [],
    currentProject: null,
    loading: false,
    error: null,

    fetchProjects: async () => {
        set({ loading: true });
        try {
            const { data } = await projectsAPI.list();
            set({ projects: data.projects, loading: false });
        } catch (err) {
            set({ error: err.response?.data?.error, loading: false });
        }
    },

    createProject: async (projectData) => {
        set({ loading: true });
        try {
            const { data } = await projectsAPI.create(projectData);
            set((state) => ({
                projects: [{ ...data.project, specifications: [data.specification] }, ...state.projects],
                currentProject: data.project,
                loading: false
            }));
            return data;
        } catch (err) {
            set({ error: err.response?.data?.error, loading: false });
            throw err;
        }
    },

    fetchProject: async (id) => {
        set({ loading: true });
        try {
            const { data } = await projectsAPI.get(id);
            set({ currentProject: data.project, loading: false });
            return data.project;
        } catch (err) {
            set({ error: err.response?.data?.error, loading: false });
            throw err;
        }
    },

    deleteProject: async (id) => {
        try {
            await projectsAPI.delete(id);
            set((state) => ({
                projects: state.projects.filter(p => p.project_id !== id)
            }));
        } catch (err) {
            set({ error: err.response?.data?.error });
        }
    },

    setCurrentProject: (project) => set({ currentProject: project }),
    clearError: () => set({ error: null }),
}));

// === Specification Store ===
export const useSpecStore = create((set, get) => ({
    specification: null,
    completenessScore: 0,
    gaps: [],
    loading: false,
    stageLoading: false,
    error: null,

    fetchSpecification: async (specId) => {
        set({ loading: true });
        try {
            const { data } = await specsAPI.get(specId);
            set({
                specification: data.specification,
                completenessScore: data.completeness_score,
                gaps: data.gaps,
                loading: false
            });
            return data;
        } catch (err) {
            set({ error: err.response?.data?.error, loading: false });
            throw err;
        }
    },

    processStage1: async (specId, rawInput, businessType) => {
        set({ stageLoading: true, error: null });
        try {
            const { data } = await specsAPI.processStage1(specId, { raw_input: rawInput, business_type: businessType });
            set((state) => ({
                specification: {
                    ...state.specification,
                    stage_1_prompt: data.stage_1,
                    current_stage: 2,
                    completeness_score: data.completeness_score
                },
                completenessScore: data.completeness_score,
                stageLoading: false
            }));
            return data;
        } catch (err) {
            set({ error: err.response?.data?.error || 'Failed to process your idea.', stageLoading: false });
            throw err;
        }
    },

    processStage2: async (specId, additionalContext, interviewAnswers) => {
        set({ stageLoading: true, error: null });
        try {
            const { data } = await specsAPI.processStage2(specId, {
                additional_context: additionalContext,
                interview_answers: interviewAnswers
            });
            set((state) => ({
                specification: {
                    ...state.specification,
                    stage_2_context: data.stage_2,
                    current_stage: 3,
                    completeness_score: data.completeness_score
                },
                completenessScore: data.completeness_score,
                stageLoading: false
            }));
            return data;
        } catch (err) {
            set({ error: err.response?.data?.error || 'Failed to build context.', stageLoading: false });
            throw err;
        }
    },

    processStage3: async (specId, tradeoffAnswers, worstCaseResponse) => {
        set({ stageLoading: true, error: null });
        try {
            const { data } = await specsAPI.processStage3(specId, {
                tradeoff_answers: tradeoffAnswers,
                worst_case_response: worstCaseResponse
            });
            set((state) => ({
                specification: {
                    ...state.specification,
                    stage_3_intent: data.stage_3,
                    current_stage: 4,
                    completeness_score: data.completeness_score
                },
                completenessScore: data.completeness_score,
                stageLoading: false
            }));
            return data;
        } catch (err) {
            set({ error: err.response?.data?.error || 'Failed to build intent.', stageLoading: false });
            throw err;
        }
    },

    processStage4: async (specId) => {
        set({ stageLoading: true, error: null });
        try {
            const { data } = await specsAPI.processStage4(specId);
            set((state) => ({
                specification: {
                    ...state.specification,
                    stage_4_spec: data.stage_4,
                    visual_flowchart: data.visual_flowchart,
                    completeness_score: data.completeness_score
                },
                completenessScore: data.completeness_score,
                gaps: data.gaps,
                stageLoading: false
            }));
            return data;
        } catch (err) {
            set({ error: err.response?.data?.error || 'Failed to generate specification.', stageLoading: false });
            throw err;
        }
    },

    updateStageData: async (specId, stageNum, data) => {
        set({ stageLoading: true, error: null });
        try {
            const { data: result } = await specsAPI.updateStage(specId, stageNum, data);
            const stageField = `stage_${stageNum === 1 ? '1_prompt' : stageNum === 2 ? '2_context' : stageNum === 3 ? '3_intent' : '4_spec'}`;
            set((state) => ({
                specification: {
                    ...state.specification,
                    [stageField]: result[`stage_${stageNum}`],
                    completeness_score: result.completeness_score,
                },
                completenessScore: result.completeness_score,
                stageLoading: false,
            }));
            return result;
        } catch (err) {
            set({ error: err.response?.data?.error || 'Failed to update.', stageLoading: false });
            throw err;
        }
    },

    uploadDocuments: async (specId, files) => {
        set({ stageLoading: true, error: null });
        try {
            const { data } = await specsAPI.uploadDocuments(specId, files);
            set({ stageLoading: false });
            return data;
        } catch (err) {
            set({ error: err.response?.data?.error || 'Failed to upload.', stageLoading: false });
            throw err;
        }
    },

    scrapeUrl: async (specId, url) => {
        set({ stageLoading: true, error: null });
        try {
            const { data } = await specsAPI.scrapeUrl(specId, url);
            set({ stageLoading: false });
            return data;
        } catch (err) {
            set({ error: err.response?.data?.error || 'Failed to scrape URL.', stageLoading: false });
            throw err;
        }
    },

    clearError: () => set({ error: null }),
    resetSpec: () => set({ specification: null, completenessScore: 0, gaps: [] }),
}));
