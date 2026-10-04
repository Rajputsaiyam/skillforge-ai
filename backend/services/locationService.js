/**
 * IP Geolocation Service
 * ----------------------
 * Detects user country, region, and city from client IP address.
 * Caches results in memory to avoid repeated external lookups.
 * Provides country-specific localization context for job searches & internships.
 */
const axios = require('axios');

let cachedLocation = null;
let lastLookupTime = 0;
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour cache

async function detectLocationFromIp(clientIp = '') {
  const now = Date.now();
  if (cachedLocation && now - lastLookupTime < CACHE_TTL_MS) {
    return cachedLocation;
  }

  // Check if IP is local/loopback
  const isLocal =
    !clientIp ||
    clientIp === '::1' ||
    clientIp === '127.0.0.1' ||
    clientIp.startsWith('192.168.') ||
    clientIp.startsWith('10.');

  try {
    const url = isLocal
      ? 'https://ipapi.co/json/'
      : `https://ipapi.co/${clientIp}/json/`;

    const res = await axios.get(url, { timeout: 3500 });
    if (res.data && res.data.country_name) {
      cachedLocation = {
        country: res.data.country_name,
        countryCode: res.data.country_code || 'IN',
        city: res.data.city || 'Delhi',
        region: res.data.region || 'Delhi',
        ip: res.data.ip,
        isDetected: true,
      };
      lastLookupTime = now;
      return cachedLocation;
    }
  } catch (err) {
    // Try secondary fallback service
    try {
      const res2 = await axios.get('http://ip-api.com/json', { timeout: 3000 });
      if (res2.data && res2.data.country) {
        cachedLocation = {
          country: res2.data.country,
          countryCode: res2.data.countryCode || 'IN',
          city: res2.data.city || 'Delhi',
          region: res2.data.regionName || 'Delhi',
          ip: res2.data.query,
          isDetected: true,
        };
        lastLookupTime = now;
        return cachedLocation;
      }
    } catch (err2) {
      // Both APIs failed, use regional fallback
    }
  }

  // Graceful fallback (India timezone context)
  return {
    country: 'India',
    countryCode: 'IN',
    city: 'New Delhi',
    region: 'Delhi',
    isDetected: true,
    isFallback: true,
  };
}

module.exports = {
  detectLocationFromIp,
};
