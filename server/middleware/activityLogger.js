import Activity from '../models/Activity.js';

// Usage: logActivity({ type, action, getDescription, getMetadata })
export function logActivity({ type, action, getDescription, getMetadata = () => ({}) }) {
  return async (req, res, next) => {
    const originalJson = res.json;
    res.json = function (data) {
      if (res.statusCode < 400 && req.user && req.user._id) {
        Activity.log({
          userId: req.user._id,
          type,
          action,
          description: typeof getDescription === 'function' ? getDescription(req, data) : getDescription,
          metadata: typeof getMetadata === 'function' ? getMetadata(req, data) : getMetadata,
          req
        }).catch(err => {
          console.error('Failed to log activity from back-end:', err);
        });
      }
      return originalJson.call(this, data);
    };
    next();
  };
}

// Description helpers
export const getSearchDescription = (req) => {
  const { q, provincia, codice_ateco, fatturato_min, fatturato_max, dipendenti_min, dipendenti_max } = req.query;
  let desc = 'Performed company search';
  if (q) desc += ` for "${q}"`;
  if (provincia) desc += ` in ${provincia}`;
  if (codice_ateco) desc += ` with ATECO ${codice_ateco}`;
  if (fatturato_min) desc += ` with minimum revenue ${fatturato_min}`;
  if (fatturato_max) desc += ` with maximum revenue ${fatturato_max}`;
  if (dipendenti_min) desc += ` with minimum employees ${dipendenti_min}`;
  if (dipendenti_max) desc += ` with maximum employees ${dipendenti_max}`;
  return desc;
};

export const getCompanyDescription = (req) => `Retrieved company data for P.IVA ${req.params.piva}`;
export const getVisureDescription = (req) => `Requested visure for P.IVA ${req.params.piva || req.body.piva}`;
export const getBilancioDescription = (req) => `Requested bilancio ottico for P.IVA ${req.params.piva || req.body.piva}`;
export const getLoginDescription = (req) => `User logged in from ${req.ip}`;
export const getLogoutDescription = (req) => `User logged out from ${req.ip}`;
export const getRegisterDescription = (req) => `User registered with email ${req.body.email}`;
export const getChangePasswordDescription = (req) => `User changed password for email ${req.user.email}`;
export const getForgotPasswordDescription = (req) => `User requested password reset for email ${req.body.email}`;
export const getResetPasswordDescription = (req) => `User reset password for email ${req.user.email}`;

// Metadata extractors
export const getSearchMetadata = (req) => ({
    searchParams: req.query,
    endpoint: req.originalUrl
});

export const getCompanyMetadata = (req) => ({
    piva: req.params.piva,
    searchType: req.originalUrl.includes('advanced') ? 'advanced' : 
                req.originalUrl.includes('full') ? 'full' : 'closed',
    endpoint: req.originalUrl
});

export const getVisureMetadata = (req) => ({
    piva: req.params.piva || req.body.piva,
    endpoint: req.originalUrl
});

export const getLoginMetadata = (req) => ({
    userId: req.user.id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    timestamp: new Date().toISOString()
});

export const getLogoutMetadata = (req) => ({
    userId: req.user.id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    timestamp: new Date().toISOString()
});

export const getRegisterMetadata = (req) => ({
    userId: req.user.id,
    email: req.body.email,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    timestamp: new Date().toISOString()
});

export const getChangePasswordMetadata = (req) => ({
    userId: req.user.id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    timestamp: new Date().toISOString()
});

export const getForgotPasswordMetadata = (req) => ({
    userId: req.user.id,
    email: req.body.email,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    timestamp: new Date().toISOString()
});

export const getResetPasswordMetadata = (req) => ({
    userId: req.user.id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    timestamp: new Date().toISOString()
});
