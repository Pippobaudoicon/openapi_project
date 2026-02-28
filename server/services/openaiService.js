import OpenAI from "openai";
import crypto from "crypto";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

//TODO make this configurable
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

// Allowed parameters for IT-search — LLM output is restricted to these
const ALLOWED_SEARCH_PARAMS = [
    'province', 'atecoCode', 'companyName', 'minTurnover', 'maxTurnover',
    'minEmployees', 'maxEmployees', 'activityStatus', 'townCode'
];

const parseQueryPrompt = `You are a search query parser for an Italian company database API.
Convert natural language queries (Italian or English) into structured API search parameters.

Available parameters:
- province: Italian province abbreviation (e.g. "MI" for Milano, "RM" for Roma, "TO" for Torino, "NA" for Napoli)
- atecoCode: ATECO economic activity code (e.g. "62" for software, "46" for wholesale, "41" for construction)
- companyName: Company name to search for (full words only)
- minTurnover / maxTurnover: Revenue range in euros (integer)
- minEmployees / maxEmployees: Employee count range (integer)
- activityStatus: Company status — "active", "inactive", "suspended"
- townCode: ISTAT town code (6 digits)

Rules:
- Only output parameters you are confident about from the query
- For Italian city/region names, map to the correct province code
- For sectors/industries, map to the closest ATECO code prefix
- Revenue values should be in euros (e.g. "1 milione" = 1000000)
- Always include an "interpretation" field describing what you understood in Italian
- If the query is too vague, return minimal params with a helpful interpretation`;

const parseQuerySchema = {
    type: "object",
    properties: {
        params: {
            type: "object",
            properties: {
                province: { type: "string", description: "Italian province code (2 letters)" },
                atecoCode: { type: "string", description: "ATECO code prefix" },
                companyName: { type: "string", description: "Company name keyword" },
                minTurnover: { type: "integer", description: "Minimum revenue in euros" },
                maxTurnover: { type: "integer", description: "Maximum revenue in euros" },
                minEmployees: { type: "integer", description: "Minimum employee count" },
                maxEmployees: { type: "integer", description: "Maximum employee count" },
                activityStatus: { type: "string", enum: ["active", "inactive", "suspended"] },
                townCode: { type: "string", description: "ISTAT town code" }
            },
            additionalProperties: false
        },
        interpretation: { type: "string", description: "Human-readable description of what was parsed, in Italian" }
    },
    required: ["params", "interpretation"],
    additionalProperties: false
};

export async function parseNaturalLanguageQuery(query) {
    const queryHash = crypto.createHash('sha256').update(query.toLowerCase().trim()).digest('hex');

    // Check cache
    const { default: CompanySearch } = await import('../models/CompanySearch.js');
    const cached = await CompanySearch.findOne({
        searchKey: `parse:${queryHash}`,
        searchType: 'search'
    });
    if (cached?.data) {
        return { ...cached.data, cached: true };
    }

    const response = await client.chat.completions.create({
        model: "gpt-4.1-nano-2025-04-14",
        messages: [
            { role: "system", content: parseQueryPrompt },
            { role: "user", content: query }
        ],
        response_format: {
            type: "json_schema",
            json_schema: {
                name: "search_params",
                strict: true,
                schema: parseQuerySchema
            }
        },
        temperature: 0.3,
        max_tokens: 500
    });

    const parsed = JSON.parse(response.choices[0].message.content);

    // Whitelist validation — strip any params not in allowed list
    const cleanParams = {};
    for (const [key, value] of Object.entries(parsed.params || {})) {
        if (ALLOWED_SEARCH_PARAMS.includes(key) && value !== null && value !== undefined && value !== '') {
            cleanParams[key] = value;
        }
    }

    const result = {
        params: cleanParams,
        interpretation: parsed.interpretation || ''
    };

    // Cache the parse result
    await CompanySearch.updateOne(
        { searchKey: `parse:${queryHash}`, searchType: 'search' },
        { $set: { data: result, parameters: { query }, createdAt: new Date() } },
        { upsert: true }
    );

    return result;
}

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

export async function getLLMOverview(companyData, userId = null, relatedActivityId = null) {
    try {
        const response = await client.chat.completions.create({
            model: "gpt-4.1-nano-2025-04-14",
            messages: [
                {
                    role: "system",
                    content: promptFinancialOverview
                },
                {
                    role: "user", 
                    content: JSON.stringify(companyData)
                }
            ],
            temperature: 0.7,
            max_tokens: 2000
        });
        
        const result = response.choices[0]?.message?.content;
        const usage = response.usage;
        
        // Track OpenAI credits if user ID is provided
        if (userId && usage) {
            try {
                const { trackOpenAICredit } = await import('../middleware/creditTracker.js');
                await trackOpenAICredit({
                    userId,
                    model: "gpt-4.1-nano-2025-04-14",
                    promptTokens: usage.prompt_tokens || 0,
                    completionTokens: usage.completion_tokens || 0,
                    description: `Financial overview generation for company data`,
                    metadata: {
                        companyName: companyData.companyName || 'Unknown',
                        dataSize: JSON.stringify(companyData).length
                    },
                    relatedActivityId
                });
            } catch (creditError) {
                console.error('Failed to track OpenAI credits:', creditError);
                // Don't throw here as we still want to return the LLM result
            }
        }
        
        return result;
    } catch (error) {
        console.error('Error communicating with LLM:', error);
        throw new Error('Failed to get LLM overview.');
    }
}