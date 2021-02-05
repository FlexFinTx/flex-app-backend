import { driver } from '@transmute/did-key-ed25519';
import {
  contexts,
  documentLoaderFactory,
} from '@transmute/jsonld-document-loader';
import { IContextMap } from '@transmute/jsonld-document-loader/dist/types';
import SchemaOrg_Context from './Schema.Org.json';

const SchemaOrg: IContextMap = {
  ['https://schema.org']: SchemaOrg_Context,
};

const documentLoader = documentLoaderFactory.pluginFactory
  .build({
    contexts: {
      ...contexts.W3C_Verifiable_Credentials,
      ...contexts.W3ID_Security_Vocabulary,
    },
  })
  .addContext(contexts.W3C_Decentralized_Identifiers)
  .addContext(contexts.W3C_Open_Digital_Rights_Langauge)
  .addContext(SchemaOrg)
  .addResolver({
    ['did:key:z6']: {
      resolve: async (did: string) => {
        const { didDocument } = await driver.resolve(did);
        return didDocument;
      },
    },
  })
  .buildDocumentLoader();

export default documentLoader;
