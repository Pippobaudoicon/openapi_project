<script setup>
import { useCompanyStore } from "@/stores/companyStore";
const store = useCompanyStore();
const companyData = store.companyData;
const data = companyData?.data || {}; // Evita errori se i dati non sono disponibili
console.log(data);
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
  { label: "Stato impresa presso l'Agenzia delle Entrate", key: "activityStatus" },
  { label: "Data Iscrizione alla Camera di Commercio", key: "registrationDate" },
  { label: "Indirizzo PEC e Domicilio Digitale", key: "pec" },
  { label: "Codice Natura Giuridica", key: "detailedLegalForm.code" },
  { 
    label: "Codice REA e Codice Descrizione ATECO", 
    key: "atecoClassification",
    format: (value) => value?.ateco ? `${value.ateco.code} - ${value.ateco.description}` : "N/A"  
  },
  { 
    label: "Capitale Sociale", 
    key: "balanceSheets.last.shareCapital",
    format: (value) => value ? `${value.toLocaleString('it-IT')} €` : "N/A"
  },
  { 
    label: "Data Chiusura Bilancio ultimi anni", 
    key: "balanceSheets.all",
    format: (value) => {
      if (!Array.isArray(value) || value.length === 0) {
        return "N/A"; // Se non ci sono bilanci
      }

      // Ottieni le date di chiusura dei bilanci
      const dates = value
        .filter(entry => entry.balanceSheetDate) // Filtra solo gli anni con una data di chiusura
        .map(entry => entry.balanceSheetDate); // Estrai la data di chiusura

      return dates.length > 0 ? dates.join(" | ") : "N/A"; // Unisci le date con " | " o mostra "N/A"
    }
  },
  { 
    label: "Fatturato (storico fino a 7 anni)", 
    key: "balanceSheets.all",
    format: (value) => {
      if (!Array.isArray(value)) return "N/A";
      
      return value
        .filter(entry => entry.year >= 2017 && entry.turnover) // Considera solo anni con fatturato
        .map(entry => `${entry.year}: €${entry.turnover.toLocaleString('it-IT')}`)
        .join(" | "); // Unisce gli elementi come stringa
    }
  },
  { 
    label: "Utile (storico fino a 7 anni)", 
    key: "balanceSheets.all",
    format: (value) => {
      if (!Array.isArray(value)) {
        return "N/A"; // Se non ci sono dati
      }

      // Filtra gli anni con un valore di netWorth e che siano recenti (ad esempio, fino a 7 anni)
      const years = value
        .filter(entry => entry.netWorth && entry.year >= 2017) // Considera solo gli anni con un valore di utile
        .map(entry => `${entry.year}: €${entry.netWorth.toLocaleString('it-IT')}`); // Format annuale utile

      return years.length > 0 ? years.join(" | ") : "N/A"; // Unisci i valori o restituisci "N/A"
    }
  },
  { 
    label: "Totale Attivo Stato Patrimoniale", 
    key: "balanceSheets.all",
    format: (value) => {
      if (!Array.isArray(value)) return "N/A";
      
      const totalAssetsSum = value
        .filter(entry => entry.year >= 2017 && entry.totalAssets) // Considera solo anni con valore
        .reduce((sum, entry) => sum + entry.totalAssets, 0);
      
      return totalAssetsSum ? `€${totalAssetsSum.toLocaleString('it-IT')}` : "N/A";
    }
  },
  { 
    label: "Dipendenti",
    key: "balanceSheets.all",
    format: (value) => {
      if (!Array.isArray(value) || value.length === 0) return "N/A";
      
      // Ottieni il numero di dipendenti dal primo elemento di all
      const firstBalanceSheet = value[0];
      return firstBalanceSheet?.employees ? firstBalanceSheet.employees : "N/A";
    }
  },
  { 
    label: "Totale Costo del Personale", 
    key: "balanceSheets.last.totalStaffCost",
    format: (value) => { 
      return value ? `€${value.toLocaleString('it-IT')}` : "N/A"; 
    }
  },
  { 
    label: "RAL Annuale Medio", 
    key: "balanceSheets.last.totalStaffCost",
    format: (value) => {
      const totalStaffCost = value; // Totale Costo del Personale
      const employees = data.balanceSheets?.last?.employees; // Numero di dipendenti

      if (totalStaffCost == null || employees == null || employees === 0) {
        return "N/A"; // Se i dati non sono disponibili
      }

      // Calcolo del RAL Annuale Medio
      const ralAnnual = totalStaffCost / employees;
      return `€${ralAnnual.toLocaleString('it-IT')}`; // Restituisce il risultato formattato
    }
  },
  { 
    label: "Soci", 
    key: "shareHolders",
    format: (value) => {
      if (!Array.isArray(value) || value.length === 0) {
        return "N/A"; // Se non ci sono soci
      }

      return value
        .map(socio => {
          const companyName = socio.companyName || "N/A";
          const percentShare = socio.percentShare ? `${socio.percentShare}%` : "N/A";
          const taxCode = socio.taxCode || "N/A"; // Aggiungi la partita IVA

          return `${companyName} (${percentShare}) - ${taxCode}`;
        })
        .join(" | "); // Unisci i soci separati da " | "
    }
  },
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
    <div class="text-6xl italic-font light-blue-txt w-full text-center py-6">
      Company Advanced
    </div>
    <div class="px-0 md:px-6 h-custom overflow-auto">
      <div v-for="field in fields" :key="field.key" class="flex flex-col md:flex-row">
        <div class="uppercase basis-2/6 text-sm px-5 py-3 dark-gray-bkg text-white border-b-1 border-white">
          {{ field.label }}
        </div>
        <div class="px-5 py-3 grow basis-custom text-sm bg-white border-gray">
            {{ getValue(field) }}
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.border-gray {
  border-bottom: 1px solid #EFEFEF;
}
.h-custom {
  height: 55vh;
}
.basis-custom {
  flex-basis: min-content;
}
</style>
