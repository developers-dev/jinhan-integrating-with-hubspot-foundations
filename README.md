# Integrating With HubSpot I: Foundations Practicum

This project reads and creates campaign brief custom object records through the HubSpot CRM API. It uses a developer test account and a local private app token stored outside Git.

## HubSpot test account

Developer test account: **to be added after account setup**  
Custom object list: **to be added after the custom object is created**

The final custom object list link must use this format:

```text
https://app.hubspot.com/contacts/<test-account-id>/objects/<custom-object-id>/views/all/list
```

## Requirements

- Node.js and npm
- A HubSpot developer test account
- A private app in that test account with these scopes:
  - `crm.schemas.custom`
  - `crm.objects.custom.read`
  - `crm.objects.custom.write`
  - `crm.objects.contacts.read`
  - `crm.objects.contacts.write`
- A custom object with these properties: `campaign_name`, `channel`, and `status`

Do not commit a private app token. The local `.env` file is ignored by Git.

## Configure and run

1. Copy `.env.example` to `.env`.
2. Set `HUBSPOT_PRIVATE_APP_ACCESS_TOKEN`, `HUBSPOT_CUSTOM_OBJECT_TYPE`, and `HUBSPOT_TEST_ACCOUNT_ID` in `.env`.
3. Install dependencies with `npm install`.
4. Run `node index.js` and open `http://localhost:3000`.

The homepage lists the custom object records. Select **Add to this table** to create another record.

## Routes and templates

- `GET /`: retrieves custom object records and renders `views/homepage.pug`.
- `GET /update-cobj`: renders the record form in `views/updates.pug`.
- `POST /update-cobj`: creates a custom object record and redirects to `/`.

## Practicum checklist

- [ ] Create a HubSpot developer test account.
- [ ] Create the custom object and three properties.
- [ ] Create at least three custom object records and associate them with contact records.
- [ ] Add the test account's custom object list link above.
- [ ] Run the app locally and verify listing and record creation.
- [ ] Merge `working-branch` into `main` on GitHub.
- [ ] Submit the public fork URL through the HubSpot Academy practical exercise. Do not use the upload option.
