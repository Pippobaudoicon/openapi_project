export const cacheStrategies = {
    company: {
        model: 'CompanySearch',
        validationFn: 'isDataCurrentYear',
        searchParams: ['piva', 'searchType']
    },
    visure: {
        model: 'VisureSearch',
        validationFn: 'isDataCurrentYear',
        searchParams: ['piva', 'searchType', 'status']
    }
};

export const modelMapping = {
    CompanySearch: '../models/CompanySearch.js',
    VisureSearch: '../models/VisureSearch.js'
};

export const validationFunctions = {
    isDataCurrentYear: (data) => {
        const currentYear = new Date().getFullYear();
        const dataYear = new Date(data.createdAt).getFullYear();
        return currentYear === dataYear;
    }
};
