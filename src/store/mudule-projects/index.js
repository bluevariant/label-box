import { LocalStorage } from "quasar";

export default {
  namespaced: true,
  state: {
    projects: LocalStorage.getItem("projects") || [],
  },
  getters: {
    getAllProjects(state) {
      return state.projects;
    },
  },
  mutations: {
    setProjects(state, projects) {
      state.projects = projects;
      LocalStorage.set("projects", projects);
    },
  },
  actions: {
    setProjects({ commit }, projects) {
      commit("setProjects", projects);
    },
  },
};
