import OpenAI from "openai";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const outputLanguage = 'italian';
//REVIEW better prompt using least amount of tokens
const promptFinancialOverview = `Sei un Chief Financial Officer (CFO) senior: analizza e fornisci una sintesi strutturata, concisa e facilmente comprensibile dei dati aziendali e delle performance pubbliche forniti (inclusi dati finanziari, indici, gestione, assetto proprietario, operatività). La review deve essere accessibile sia ad addetti ai lavori che al pubblico generico, non solo agli esperti, e spiegare il significato dei dati in modo chiaro.
    Scrivi la review seguendo questa struttura (in italiano semplice, chiaro e diretto):
    - Incipit iniziale che parla dell'azienda
    - Per ogni sezione, inizia con un ragionamento basato sui dati e sul contesto (benchmark di settore, trend, eventi particolari, ecc.), specificando perché i dati sono rilevanti o degni di nota.
    - Dopo il ragionamento, fornisci un riassunto conciso in linguaggio accessibile a tutti, che chiarisca cosa significano quei dati per lo stato attuale dell’azienda.
    - Includi tutte le sezioni seguenti (usa i titoli riportati in markdown, come da esempio):
        - Performance (EBITDA, flusso di cassa, leva finanziaria/indebitamento)
        - Redditività (ROE, ROI, ROS)
        - Liquidità
        - Efficienza
        - Posizionamento Strategico
    - Dopo queste, fornisci una “Sintesi SWOT” (Strengths, Weaknesses, Opportunities, Threats), scritta in punti elenco chiari e brevi (1–2 per area).
    - Termina la review con una frase riassuntiva e rassicurante che riassuma lo stato generale o l’outlook della società.
    - Se per una sezione mancano dati, segnalalo e riassumi solo le aree disponibili, mantenendo chiarezza e semplicità.
    - Non fornire commenti meta, istruzioni interne, né note fuori dal testo della review.

    # Output Format

    - IMPORTANTE: Scrivi in ${outputLanguage}
    - Fornisci la risposta come testo markdown, usando i seguenti titoli: "Performance", "Redditività", "Liquidità", "Efficienza", "Posizionamento Strategico", "Sintesi SWOT" e una frase finale conclusiva.
    - Ogni sezione: 1–2 frasi di ragionamento/interpretazione dati + 1 frase riassuntiva semplice.
    - SWOT sintetica: 1–2 bullet per “Punti di forza”, “Debolezze”, “Opportunità”, “Minacce”.
    - Frase finale: massima chiarezza e brevità.
    - Lunghezza totale: 250–400 parole.
    - Nessun commento aggiuntivo o nota fuori dal testo richiesto.

    # Esempio

    Performance  
    Analizzando indicatori come EBITDA, flussi di cassa e livello di indebitamento, si nota una tendenza positiva, supportata da vendite stabili e una gestione attenta dei costi. I dati mostrano che il debito resta gestibile rispetto agli standard di settore.  
    In sintesi, la società mantiene risultati operativi affidabili e una posizione finanziaria solida.

    Redditività  
    Gli indici ROE, ROI e ROS, confrontati con le medie di settore, risultano in crescita grazie a politiche di investimento mirate e a una buona efficienza interna. Questo suggerisce che l’azienda sta riuscendo a valorizzare il capitale investito.  
    In conclusione, la redditività rimane soddisfacente e competitiva per il contesto di mercato.

    Liquidità  
    I dati indicano una posizione di liquidità equilibrata, con disponibilità adeguata a coprire obbligazioni e spese correnti. Eventuali oscillazioni sono dovute a operazioni straordinarie pianificate.  
    Nel complesso, l’azienda può far fronte regolarmente alle sue necessità finanziarie.

    Efficienza  
    La gestione delle risorse appare efficiente: i tempi di incasso e pagamento sono allineati alle best practice del settore, e i costi operativi sotto controllo. L’azienda evita sprechi e riduce rischi di inefficienza.  
    Pertanto, l’impresa dimostra agilità e attenzione nella gestione quotidiana.

    Posizionamento Strategico  
    L’espansione sui mercati e l’innovazione di prodotto rafforzano la posizione rispetto ai concorrenti. Vengono costantemente monitorate opportunità di crescita e possibili minacce esterne.  
    In breve, l’azienda mostra una visione strategica e flessibilità.

    Sintesi SWOT  
    - **Punti di forza:** Gestione solida della liquidità; efficienza elevata  
    - **Debolezze:** Dipendenza da un segmento di clientela  
    - **Opportunità:** Diversificazione dei mercati; digitalizzazione dei processi  
    - **Minacce:** Pressioni competitive crescenti; incertezza economica globale

    Nel complesso, l’azienda si dimostra resiliente e pronta ad affrontare le sfide future.

    # Note

    - Assicurati che ogni sezione inizi sempre dal ragionamento sui dati, seguito dalla sintesi chiara.
    - Adatta il linguaggio perché sia comprensibile sia ad addetti ai lavori sia al pubblico generale, evitando tecnicismi inutili.
    - Se mancano dati, segnalalo e concentrati sulle sezioni disponibili, mantenendo coerenza e chiarezza del testo.
    - Nessuna aggiunta al di fuori delle sezioni richieste.
    `;

const SCHEMA = {
    companyDetails:    ['companyName', 'vatCode', 'leiCode'],
    ecofin:            ['turnover', 'turnoverTrend', 'netWorth', 'shareCapital', 'enterpriseSize'],
    operatingResults:  ['ebitda', 'ebit', 'cashFlow'],
    profitability:     ['roe', 'roi', 'ros', 'roaMonetary'],
    liquidityRatios:   ['currentRatio', 'acidTest', 'cashTotalShortTermDebt'],
    financialStability:['workingCapitalCoverage'],
    leverageRatios:    ['pfnEbitda', 'ebitdaNetLeverage', 'debtRatio'],
    efficiency:        ['inventoryRotation', 'accountsReceivableRotation', 'turnoverIndex'],
    financialCycle:    ['accountsReceivableDuration', 'stockDuration'],
    structureRatios:   ['netFinancialDebtEquityNetWorth'],
    employees:         ['employee', 'employeeTrend'],
    branches:          ['numberOfBranches'],
    foreignTrade:      ['isExporter', 'exportCountries'],
    atecoClassification: ['ateco', 'secondaryAteco'],
    corporateGroups:   ['groupName', 'holdingCompanyName'],
    managers:          'compactArray:name,surname,roles',
    shareholders:      'compactArray:companyName,percentShare'
};

const pick = (obj, keys) =>
    keys.reduce((o, k) => (obj?.[k] !== undefined ? { ...o, [k]: obj[k] } : o), {});

const compactArray = (arr, props) =>
    Array.isArray(arr) ? arr.map(el => pick(el, props)) : [];

export function stripCompanyData(fullDoc) {
    const slim = {};
    for (const [section, rule] of Object.entries(SCHEMA)) {
        if (!fullDoc?.[section]) continue;

        if (typeof rule === 'string' && rule.startsWith('compactArray')) {
            const props = rule.split(':')[1].split(',');
            slim[section] = compactArray(fullDoc[section], props);
        } else {
            slim[section] = pick(fullDoc[section], rule);
        }
    }
    return slim;
}

export async function getLLMOverview(companyData) {
    try {
        const response = await client.responses.create({
            model: "gpt-4.1-nano-2025-04-14",
            input: `${promptFinancialOverview} : ${JSON.stringify(companyData)}`,
        });
        return response.output_text;
    } catch (error) {
        console.error('Error communicating with LLM:', error);
        throw new Error('Failed to get LLM overview.');
    }
}