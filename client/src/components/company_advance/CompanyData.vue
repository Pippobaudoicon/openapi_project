<script setup>
import { useCompanyStore } from "@/stores/companyStore";
const store = useCompanyStore();
const companyData = store.companyData;
const data = companyData?.data || {}; // Evita errori se i dati non sono disponibili

const fields = [
  { label: "Denominazione sociale completa", key: "companyName" },
  { label: "Codice Fiscale e Partita IVA", key: "taxCode" },
  { 
    label: "Sede Legale", 
    key: "address",
    format: (value) => value?.registeredOffice? `${value.registeredOffice.streetName}, ${value.registeredOffice.town}, ${value.registeredOffice.province} ${value.registeredOffice.zipCode}` : "N/A"
  },
  { label: "Codice Sdi", key: "sdiCode" },
  { label: "Id", key: "id" },
  { 
    label: "Coordinate GPS", 
    key: "address.registeredOffice.gps.coordinates", 
    format: (value) => value?.length === 2 ? `${value[1]}, ${value[0]}` : "N/A"
  },
  { label: "Camera di Commercio (CCIAA) di Iscrizione", key: "cciaa" },
  { label: "Stato impresa presso l'Agenzia delle Entrate", key: "taxAgencyStatus" },
  { label: "Data Iscrizione alla Camera di Commercio", key: "registrationDate" },
  { label: "Indirizzo PEC e Domicilio Digitale", key: "pec" },
  { label: "Codice Natura Giuridica", key: "legalNatureCode" },
  { 
    label: "Codice REA e Codice Descrizione ATECO", 
    key: "atecoClassification",
    format: (value) => value?.ateco ? `${value.ateco.code} - ${value.ateco.description}` : "N/A"  
  },
  { label: "Capitale Sociale", key: "shareCapital" },
  { label: "Data Chiusura Bilancio ultimi anni", key: "balanceClosureDate" },
  { label: "Fatturato (storico fino a 7 anni)", key: "revenueHistory" },
  { label: "Utile (storico fino a 7 anni)", key: "profitHistory" },
  { label: "Totale Attivo Stato Patrimoniale", key: "totalAssets" },
  { label: "Dipendenti", key: "employees" },
  { label: "Totale Costo del Personale", key: "totalPersonnelCost" },
  { label: "RAL Annuale Medio", key: "averageAnnualSalary" },
  { label: "Soci", key: "partners" },
  { label: "Appartenenza ad un Gruppo IVA", key: "vatGroupMembership" }
];

const getValue = (field) => {
  const keys = field.key.split(".");
  let value = data;
  for (const key of keys) {
    if (value && value.hasOwnProperty(key)) {
      value = value[key];
    } else {
      return "N/A";
    }
  }
  return field.format ? field.format(value) : value || "N/A";
};
</script>

<template>
  <div>
    <div class="text-7xl italic-font light-blue-txt w-full text-center py-6">
      Company Advanced
    </div>
    <div class="px-6 h-custom overflow-auto">
      <div v-for="field in fields" :key="field.key" class="flex">
        <div class="uppercase basis-2/6 px-6 py-4 dark-gray-bkg text-white border-b-1 border-white">
          {{ field.label }}
        </div>
        <div class="px-6 py-4 grow bg-white border-gray">
            {{ getValue(field) }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.border-gray {
  border-bottom: 1px solid #EFEFEF;
}
.h-custom {
  height: 65vh;
}
</style>
