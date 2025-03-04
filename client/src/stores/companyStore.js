import { defineStore } from "pinia";

export const useCompanyStore = defineStore("company", {
  state: () => ({
    companyData: JSON.parse(localStorage.getItem('companyData')) || null,
    credit: JSON.parse(localStorage.getItem('credit')) || null,
    email: localStorage.getItem('email') || ''
  }),
  actions: {
    setCompanyData(data) {
      this.companyData = data;
      localStorage.setItem('companyData', JSON.stringify(data));
    },
    clearCompanyData() {
      this.companyData = null;
      localStorage.removeItem('companyData');
    },
    setCredit(data) {
      this.credit = data; 
      localStorage.setItem('credit', JSON.stringify(data));
    },
    setEmail(email) {
      this.email = email;
      localStorage.setItem('email', email);
    }
  }
});
