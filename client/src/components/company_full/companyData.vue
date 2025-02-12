<script setup>
import { useCompanyStore } from "@/stores/companyStore";
const store = useCompanyStore();
const companyData = store.companyData;
const data = companyData?.data || {}; // Evita errori se i dati non sono disponibili

const fields = [
{ label: "Dettagli Aziendali", key: "dettagliAziendali" },
  { label: "Modulo Legale", key: "modulolegale" },
  { label: "Stato dell'Azienda", key: "activityStatus" },
  { label: "Data Azienda", key: "aziendaDate" },
  { label: "Indirizzo", key: "indirizzo" },
  { label: "Commerciale", key: "commerciale" },
  { label: "Rami", key: "rami" },
  { label: "Classificazione Ateco", key: "atecoClassificazione" },
  { label: "Classificazione Internazionale", key: "classificazioneInternazionale" },
  { label: "Ecofin", key: "ecofin" },
  { label: "Dipendenti", key: "dipendenti" },
  { label: "Risultati Operativi", key: "risultatiOperativi" },
  { label: "Statistiche Dipendenti", key: "dipendentiStatistica" },
  { label: "Innovativa PMI e SU", key: "innovativaPMIeSu" },
  { label: "Posta", key: "posta" },
  { label: "Contatti", key: "contatti" },
  { label: "Web e Social", key: "webAndSocial" },
  { label: "PEC", key: "pec" },
  { label: "Gare d'Appalto Pubbliche", key: "gareAppaltoPubbliche" },
  { label: "Commercio Estero", key: "commercioEstero" },
  { label: "Dirigenti", key: "dirigenti" },
  { label: "Azionisti", key: "azionisti" },
  { label: "Gruppi Aziendali", key: "gruppiAziendali" },
  { label: "Sussidiarie", key: "sussidiarie" },
  { label: "Affiliazione Aziende", key: "affiliazioneAziende" },
  { label: "Registro Artigiano Business", key: "artigianoBusinessRegistry" },
  { label: "Certificazione SOA", key: "soaCertificazione" },
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

.<template>
    <div>
      <div class="text-6xl italic-font light-blue-txt w-full text-center py-6">
        Company Full
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
