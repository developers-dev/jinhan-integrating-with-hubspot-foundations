require('dotenv').config();

const express = require('express');
const axios = require('axios');
const path = require('node:path');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const API_BASE_URL = 'https://api.hubapi.com';
const OBJECT_TYPE = process.env.HUBSPOT_CUSTOM_OBJECT_TYPE;
const PRIVATE_APP_ACCESS_TOKEN = process.env.HUBSPOT_PRIVATE_APP_ACCESS_TOKEN;
const OBJECT_PROPERTIES = ['campaign_name', 'channel', 'status'];
const CONTACT_PROPERTY = 'contact_email';

app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

function configurationError() {
  if (!PRIVATE_APP_ACCESS_TOKEN || !OBJECT_TYPE) {
    return 'Set HUBSPOT_PRIVATE_APP_ACCESS_TOKEN and HUBSPOT_CUSTOM_OBJECT_TYPE in your local .env file.';
  }
  return null;
}

function hubspotConfigError() {
  return configurationError();
}

function hubspotErrorMessage(error) {
  const status = error.response?.status;
  if (status === 401 || status === 403) {
    return 'HubSpot rejected the request. Check the private app token and its CRM object scopes.';
  }
  if (status === 404) {
    return 'The custom object type was not found. Check HUBSPOT_CUSTOM_OBJECT_TYPE in .env.';
  }
  return 'HubSpot could not complete the request. Check the local server output and try again.';
}

function requestConfig() {
  return {
    headers: {
      Authorization: `Bearer ${PRIVATE_APP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
  };
}

app.get('/', async (req, res) => {
  const configError = hubspotConfigError();
  if (configError) {
    return res.status(503).render('homepage', {
      title: 'Campaign Briefs | HubSpot',
      records: [],
      error: configError,
    });
  }

  try {
    const response = await axios.get(
      `${API_BASE_URL}/crm/v3/objects/${encodeURIComponent(OBJECT_TYPE)}`,
      {
        ...requestConfig(),
        params: { properties: OBJECT_PROPERTIES.join(','), associations: 'contacts', limit: 100 },
      },
    );

    return res.render('homepage', {
      title: 'Campaign Briefs | HubSpot',
      records: response.data.results || [],
      error: null,
    });
  } catch (error) {
    console.error('HubSpot custom object list request failed:', error.response?.status || error.message);
    return res.status(502).render('homepage', {
      title: 'Campaign Briefs | HubSpot',
      records: [],
      error: hubspotErrorMessage(error),
    });
  }
});

app.get('/update-cobj', (req, res) => {
  return res.render('updates', {
    title: 'Update Custom Object Form | Integrating With HubSpot I Practicum',
    error: null,
    form: {},
  });
});

app.post('/update-cobj', async (req, res) => {
  const configError = hubspotConfigError();
  if (configError) {
    return res.status(503).render('updates', {
      title: 'Update Custom Object Form | Integrating With HubSpot I Practicum',
      error: configError,
      form: req.body,
    });
  }

  const properties = Object.fromEntries(
    OBJECT_PROPERTIES.map((property) => [property, String(req.body[property] || '').trim()]),
  );
  const contactEmail = String(req.body[CONTACT_PROPERTY] || '').trim();
  if (Object.values(properties).some((value) => value.length === 0) || !contactEmail) {
    return res.status(400).render('updates', {
      title: 'Update Custom Object Form | Integrating With HubSpot I Practicum',
      error: 'Complete all three campaign fields and enter the email address of an existing contact.',
      form: req.body,
    });
  }

  try {
    const contactResponse = await axios.post(
      `${API_BASE_URL}/crm/v3/objects/contacts/search`,
      {
        filterGroups: [{ filters: [{ propertyName: 'email', operator: 'EQ', value: contactEmail }] }],
        properties: ['email'],
        limit: 1,
      },
      requestConfig(),
    );
    const contact = contactResponse.data.results?.[0];
    if (!contact) {
      return res.status(404).render('updates', {
        title: 'Update Custom Object Form | Integrating With HubSpot I Practicum',
        error: 'No contact with that email address exists in the developer test account. Check the email and try again.',
        form: req.body,
      });
    }

    const createResponse = await axios.post(
      `${API_BASE_URL}/crm/v3/objects/${encodeURIComponent(OBJECT_TYPE)}`,
      { properties },
      requestConfig(),
    );
    const recordId = createResponse.data.id;
    try {
      await axios.put(
        `${API_BASE_URL}/crm/v4/objects/${encodeURIComponent(OBJECT_TYPE)}/${encodeURIComponent(recordId)}/associations/default/contacts/${encodeURIComponent(contact.id)}`,
        undefined,
        requestConfig(),
      );
    } catch (associationError) {
      console.error('HubSpot custom object association failed:', associationError.response?.status || associationError.message);
      return res.status(502).render('updates', {
        title: 'Update Custom Object Form | Integrating With HubSpot I Practicum',
        error: `The campaign brief was created (record ID ${recordId}), but the contact association failed. Check the app scopes before retrying.`,
        form: req.body,
      });
    }
    return res.redirect('/');
  } catch (error) {
    console.error('HubSpot custom object create request failed:', error.response?.status || error.message);
    return res.status(502).render('updates', {
      title: 'Update Custom Object Form | Integrating With HubSpot I Practicum',
      error: hubspotErrorMessage(error),
      form: req.body,
    });
  }
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Listening on http://localhost:${PORT}`);
});
