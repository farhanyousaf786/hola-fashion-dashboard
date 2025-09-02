const fetch = globalThis.fetch || require('node-fetch');

const SHIPPO_API_BASE = 'https://api.goshippo.com';

function requireEnv(key) {
  const val = process.env[key];
  if (!val) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return val;
}

// Create a shipment and return rate options
// Expects body: { from: Address, to: Address, parcel: Parcel }
// Address: { name, street1, street2?, city, state, zip, country, phone? }
// Parcel: { length, width, height, distance_unit, weight, mass_unit }
async function getRates(req, res) {
  try {
    const apiKey = requireEnv('SHIPPO_API_KEY');
    const { from, to, parcel } = req.body || {};

    console.log('Shippo getRates request:', { from, to, parcel });

    if (!from || !to || !parcel) {
      return res.status(400).json({ error: 'from, to, and parcel are required' });
    }

    // Validate required address fields
    const validateAddress = (addr, name) => {
      const required = ['name', 'street1', 'city', 'state', 'zip', 'country'];
      const missing = required.filter(field => !addr[field] || addr[field].trim() === '');
      if (missing.length > 0) {
        throw new Error(`${name} address missing required fields: ${missing.join(', ')}`);
      }
    };

    validateAddress(from, 'From');
    validateAddress(to, 'To');

    // Validate parcel fields
    const requiredParcel = ['length', 'width', 'height', 'weight', 'distance_unit', 'mass_unit'];
    const missingParcel = requiredParcel.filter(field => !parcel[field]);
    if (missingParcel.length > 0) {
      return res.status(400).json({ error: `Parcel missing required fields: ${missingParcel.join(', ')}` });
    }

    const shipmentPayload = {
      address_from: from,
      address_to: to,
      parcels: [parcel],
      async: false
    };

    console.log('Shippo API request payload:', JSON.stringify(shipmentPayload, null, 2));

    const response = await fetch(`${SHIPPO_API_BASE}/shipments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `ShippoToken ${apiKey}`
      },
      body: JSON.stringify(shipmentPayload)
    });

    const data = await response.json();
    console.log('Shippo API response:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error('Shippo API error:', data);
      return res.status(response.status).json({ error: data?.detail || 'Failed to get rates', raw: data });
    }

    // Return shipment + rates (sorted by amount ascending if present)
    const rates = Array.isArray(data.rates) ? [...data.rates] : [];
    console.log(`Found ${rates.length} rates`);
    
    // Log any rate validation messages
    if (data.rates) {
      data.rates.forEach((rate, i) => {
        if (rate.messages && rate.messages.length > 0) {
          console.log(`Rate ${i} messages:`, rate.messages);
        }
      });
    }

    rates.sort((a, b) => (parseFloat(a.amount) || 0) - (parseFloat(b.amount) || 0));

    return res.json({ shipment: data, rates });
  } catch (e) {
    console.error('Shippo getRates error:', e);
    return res.status(500).json({ error: e.message || 'Internal server error' });
  }
}

// Purchase a label from a rate
// Expects body: { rate: rateObject } OR { rate_id }
async function buyLabel(req, res) {
  try {
    const apiKey = requireEnv('SHIPPO_API_KEY');
    const { rate, rate_id } = req.body || {};

    const payload = rate ? { rate } : rate_id ? { rate: rate_id } : null;
    if (!payload) {
      return res.status(400).json({ error: 'rate or rate_id required' });
    }

    const response = await fetch(`${SHIPPO_API_BASE}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `ShippoToken ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data?.detail || 'Failed to buy label', raw: data });
    }

    return res.json({
      transaction: data,
      label_url: data?.label_url,
      tracking_number: data?.tracking_number,
      tracking_url_provider: data?.tracking_url_provider,
      carrier: data?.rate?.provider,
      servicelevel: data?.rate?.servicelevel?.name,
      amount: data?.rate?.amount
    });
  } catch (e) {
    console.error('Shippo buyLabel error:', e);
    return res.status(500).json({ error: e.message || 'Internal server error' });
  }
}

module.exports = { getRates, buyLabel };
