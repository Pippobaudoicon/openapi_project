import OpenAI from "openai";
import crypto from "crypto";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const promptFinancialOverview = `Sei un analista aziendale senior. Analizza i dati forniti e produci una panoramica completa dell’azienda in italiano, strutturata in markdown.

# Istruzioni

- Scrivi SEMPRE in italiano, chiaro e accessibile sia a professionisti che al pubblico generale.
- Cita sempre i valori numerici reali dai dati (es. “fatturato di €2,3M”, “ROE del 12,4%”, “47 dipendenti”). Non usare mai descrizioni vaghe quando hai numeri concreti.
- Quando disponibili dati di anni diversi (bilanci precedenti), evidenzia trend e variazioni anno su anno con percentuali di crescita/calo.
- Se mancano dati per una sezione, omettila silenziosamente. Non scrivere “dati non disponibili”.
- Nessun commento meta, istruzione interna o nota fuori dal testo della review.

# Struttura (usa esattamente questi titoli markdown ##)

## Profilo Aziendale
Presenta l’azienda: nome, forma giuridica, settore ATECO (codice e descrizione), sede (città e provincia), anno di costituzione, dimensione aziendale. Se fa parte di un gruppo societario, menzionalo. Se è esportatrice, indica i mercati. 2-3 frasi dense di informazioni.

## Struttura Societaria
Descrivi brevemente l’assetto proprietario (soci principali e relative quote %) e il management (ruoli chiave). Se la compagine è concentrata o frammentata, commentalo. 1-2 frasi.

## Performance Operativa
Analizza fatturato (valore e trend), EBITDA, EBIT, cash flow. Se disponibili dati di più anni, calcola e riporta la crescita %. Commenta il rapporto tra indebitamento e capacità di generare cassa (PFN/EBITDA). 2-3 frasi con numeri concreti.

## Redditività
Analizza ROE, ROI, ROS e ROA. Contestualizza rispetto a benchmark di settore tipici italiani. Segnala se i rendimenti sono in miglioramento o peggioramento. 2 frasi con valori specifici.

## Solidità e Liquidità
Current ratio, acid test, copertura del capitale circolante, debt ratio. Spiega cosa significano per la capacità dell’azienda di far fronte ai propri impegni. 2 frasi.

## Efficienza Operativa
Rotazione magazzino, durata crediti e debiti commerciali, ciclo finanziario. Commenta se l’azienda incassa prima o dopo di pagare. 1-2 frasi.

## Sintesi SWOT
Basata SOLO sui dati reali forniti, non su ipotesi generiche:
- **Punti di forza:** 2-3 bullet concreti
- **Debolezze:** 1-2 bullet concreti
- **Opportunità:** 1-2 bullet
- **Rischi:** 1-2 bullet

## Valutazione Complessiva
Una frase finale che sintetizzi lo stato di salute generale e l’outlook dell’azienda.

# Formato Output
- Markdown puro con titoli ##, **grassetto** per enfasi, elenchi puntati per SWOT
- Lunghezza: 400-600 parole
- Nessuna aggiunta fuori dalle sezioni richieste`;

const SCHEMA = {
    companyDetails:      ['companyName', 'vatCode', 'leiCode'],
    legalForm:           ['description'],
    companyStatus:       ['activityStatus'],
    companyDates:        ['registrationDate', 'startDate'],
    address:             ['registeredOffice'],
    digitalAddress:      ['digitalAddress'],
    ecofin:              ['turnover', 'turnoverTrend', 'netWorth', 'shareCapital', 'enterpriseSize'],
    operatingResults:    ['ebitda', 'ebit', 'cashFlow'],
    profitability:       ['roe', 'roi', 'ros', 'roaMonetary'],
    liquidityRatios:     ['currentRatio', 'acidTest', 'cashTotalShortTermDebt'],
    financialStability:  ['workingCapitalCoverage'],
    leverageRatios:      ['pfnEbitda', 'ebitdaNetLeverage', 'debtRatio'],
    efficiency:          ['inventoryRotation', 'accountsReceivableRotation', 'turnoverIndex'],
    financialCycle:      ['accountsReceivableDuration', 'stockDuration'],
    structureRatios:     ['netFinancialDebtEquityNetWorth'],
    employees:           ['employee', 'employeeTrend'],
    branches:            ['numberOfBranches'],
    foreignTrade:        ['isExporter', 'exportCountries'],
    atecoClassification: 'deep',
    corporateGroups:     ['groupName', 'holdingCompanyName'],
    managers:            'compactArray:name,surname,roles',
    shareholders:        'compactArray:companyName,name,surname,percentShare',
    balanceSheets:       'deep',
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
                province: { type: ["string", "null"], description: "Italian province code (2 letters)" },
                atecoCode: { type: ["string", "null"], description: "ATECO code prefix" },
                companyName: { type: ["string", "null"], description: "Company name keyword" },
                minTurnover: { type: ["integer", "null"], description: "Minimum revenue in euros" },
                maxTurnover: { type: ["integer", "null"], description: "Maximum revenue in euros" },
                minEmployees: { type: ["integer", "null"], description: "Minimum employee count" },
                maxEmployees: { type: ["integer", "null"], description: "Maximum employee count" },
                activityStatus: { type: ["string", "null"], enum: ["active", "inactive", "suspended", null] },
                townCode: { type: ["string", "null"], description: "ISTAT town code" }
            },
            required: ["province", "atecoCode", "companyName", "minTurnover", "maxTurnover", "minEmployees", "maxEmployees", "activityStatus", "townCode"],
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

        if (rule === 'deep') {
            slim[section] = fullDoc[section];
        } else if (typeof rule === 'string' && rule.startsWith('compactArray')) {
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
            temperature: 0.5,
            max_tokens: 3000
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