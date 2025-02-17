<script setup>
import { useCompanyStore } from "@/stores/companyStore";
const store = useCompanyStore();
const companyData = store.companyData;
const data = companyData?.data || {}; // Evita errori se i dati non sono disponibili

const fields = [
  { label: "Dettagli Aziendali", key: "companyDetails.companyName" },
  { label: "Modulo Legale", key: "legalForm.detailedLegalForm.description" },
  { label: "Stato dell'Azienda", key: "companyStatus.activityStatus.description" },
  { label: "Data Azienda", key: "companyDates.registrationDate" },
  { label: "Indirizzo", key: "address.streetName", format: (value) => `${value}, ${data.address?.town}` },
  { label: "Commerciale", key: "marketable.isMarketable" },
  { label: "Rami", key: "branches.numberOfBranches" },
  { label: "Classificazione Ateco", key: "atecoClassification.ateco.description" },
  { label: "Classificazione Internazionale", key: "internationalClassification.nace.description" },
  { label: "Ecofin", key: "ecofin.turnover" },
  { label: "Dipendenti", key: "employees.employee" },
  { label: "Risultati Operativi", key: "operatingResults.ebitda" },
  { label: "Statistiche Dipendenti", key: "employeesStatistic.permanentContract" },
  { label: "Innovativa PMI e SU", key: "innovativeSmeAndSu.isInnovativeStartUp" },
  { label: "Posta", key: "mail.email" },
  { label: "Contatti", key: "contacts.telephoneNumber" },
  { label: "Web e Social", key: "webAndSocial.website" },
  { label: "PEC", key: "pec" },
  { label: "Gare d'Appalto Pubbliche", key: "publicTenders[0].year" },
  { label: "Commercio Estero", key: "foreignTrade.isImporter" },
  { label: "Dirigenti", key: "managers[0].name" },
  { label: "Azionisti", key: "shareholders[0].shareholdersInformation[0].companyName" },
  { label: "Gruppi Aziendali", key: "corporateGroups.groupName" },
  { label: "Sussidiarie", key: "subsidiaries" },
  { label: "Affiliazione Aziende", key: "affiliationCompanies" },
  { label: "Registro Artigiano Business", key: "artisanBusinessRegistry.belongsToArtisanBusinessRegistry" },
  { label: "Certificazione SOA", key: "soaCertification.hasSoaCertification" },
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
