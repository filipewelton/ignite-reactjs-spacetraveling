import prismic from '@prismicio/client';

import sm from '../../sm.json';

export function getPrismicClient(): prismic.Client {
  const client = prismic.createClient(sm.apiEndpoint, {
    accessToken: process.env?.PRISMIC_ACCESS_TOKEN,
  });

  return client;
}
