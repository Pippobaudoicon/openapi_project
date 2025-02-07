import { defineStore } from "pinia";

export const useCompanyStore = defineStore("company", {
  state: () => ({
    companyData: null,
  }),
  actions: {
    setCompanyData(data) {
      this.companyData = data;
    }
  }
});