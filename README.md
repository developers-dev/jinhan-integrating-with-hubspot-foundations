# Integrating With HubSpot I: Foundations Practicum

This project reads and creates campaign brief custom object records through the HubSpot CRM API. It uses a developer test account and a local Service Key stored outside Git. HubSpot no longer allows newly created accounts to create legacy private apps.

## HubSpot test account

Developer test account: [Jinhan Integrating Foundations Practicum](https://app.hubspot.com/contacts/247934099/objects/2-271517172/views/all/list)  
Custom object list: [Campaign Briefs](https://app.hubspot.com/contacts/247934099/objects/2-271517172/views/all/list)

The final custom object list link must use this format:

```text
https://app.hubspot.com/contacts/<test-account-id>/objects/<custom-object-id>/views/all/list
```

## Requirements

- Node.js and npm
- A HubSpot developer test account
- A HubSpot Service Key with these scopes:
  - `crm.schemas.custom.read`
  - `crm.schemas.custom.write`
  - `crm.objects.custom.read`
  - `crm.objects.custom.write`
  - `crm.objects.contacts.read`
  - `crm.objects.contacts.write`
- A custom object with these properties: `campaign_name`, `channel`, and `status`

Do not commit a Service Key. The local `.env` file is ignored by Git.

## Configure and run

1. Copy `.env.example` to `.env`.
2. Set `HUBSPOT_ACCESS_TOKEN`, `HUBSPOT_CUSTOM_OBJECT_TYPE`, and `HUBSPOT_TEST_ACCOUNT_ID` in `.env`.
3. Install dependencies with `npm install`.
4. Run `node index.js` and open `http://localhost:3000`.

The homepage lists the custom object records. Select **Add to this table** to create another record.
The form requires an existing contact email; after creating a campaign brief, the app associates that record with the matching contact.

## Routes and templates

- `GET /`: retrieves custom object records and renders `views/homepage.pug`.
- `GET /update-cobj`: renders the record form in `views/updates.pug`.
- `POST /update-cobj`: finds the contact by email, creates a custom object record, associates it with the contact, and redirects to `/`.

## Practicum checklist

- [x] Create a HubSpot developer test account.
- [x] Create the custom object and three properties.
- [x] Create at least three custom object records and associate them with contact records.
- [x] Add the test account's custom object list link above.
- [x] Run the app locally and verify listing and record creation.
- [ ] Merge `working-branch` into `main` on GitHub.
- [ ] Submit the public fork URL through the HubSpot Academy practical exercise. Do not use the upload option.
