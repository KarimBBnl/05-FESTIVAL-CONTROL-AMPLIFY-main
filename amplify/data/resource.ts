import { a, defineData, type ClientSchema } from '@aws-amplify/backend';

const schema = a.schema({
  Event: a
    .model({
      artist: a.string().required(),
      space: a.enum(['MAIN STAGE', 'GARDEN', 'WAREHOUSE', 'RIVER STAGE']),
      time: a.string().required(),
      status: a.enum(['CONFIRMED', 'DELAYED', 'CANCELLED']),
    })
    .authorization((allow) => [allow.publicApiKey()]),
  SeedMarker: a
    .model({
      initialized: a.boolean().required(),
    })
    .authorization((allow) => [allow.publicApiKey()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
