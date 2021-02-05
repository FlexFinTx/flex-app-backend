import { Ed25519Signature2018 } from '@transmute/ed25519-signature-2018';
import {Ed25519KeyPair} from "@transmute/did-key-ed25519";
import * as vcjs from '@transmute/vc.js';
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { Server } from 'http';
import documentLoader from "./documentLoader";

const PORT = 9000;

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.post('/createCredential', async (req, res) => {
    let {key, credential} = req.body;


    const keyToUse = new Ed25519KeyPair(key);

    keyToUse.id = keyToUse.controller + keyToUse.id;

    const suite = new Ed25519Signature2018({
        key: keyToUse,
        date: new Date().toISOString()
    })

    const vc = await vcjs.ld.issue({
        credential,
        suite,
        documentLoader
    })

    return res.json(vc);
})

app.post('/verifyCredential', async (req, res) => {
    let {credential} = req.body;

    const verify = await vcjs.ld.verifyCredential({
        credential,
        suite: new Ed25519Signature2018({}),
        documentLoader
    })

    return res.json({
        verified: verify.verified
    })
})

app.post("/createPresentation", async (req, res) => {
    let {credentials, key, holder, pr, id} = req.body;

    const keyToUse = Ed25519KeyPair.from(key);

    keyToUse.id = keyToUse.controller + keyToUse.id;

    const suite = new Ed25519Signature2018({
        key: keyToUse,
        date: new Date().toISOString()
    })

    const vp = await vcjs.ld.createPresentation({
        verifiableCredential: credentials,
        id,
        holder,
        documentLoader
    })

    const signedVp = await vcjs.ld.signPresentation({
        presentation: vp,
        domain: pr.domain,
        challenge: pr.challenge,
        suite,
        documentLoader
    })

    return res.json(signedVp);
})

let server: Server;

server = app.listen(PORT, () => {
    console.log(`Flex App Backend listening on port ${PORT}`)
})

// Webpack
type ModuleId = string | number;

interface WebpackHotModule {
  hot?: {
    data: any;
    accept(
      dependencies: string[],
      callback?: (updatedDependencies: ModuleId[]) => void
    ): void;
    accept(dependency: string, callback?: () => void): void;
    accept(errHandler?: (err: Error) => void): void;
    dispose(callback: (data: any) => void): void;
  };
}

declare const module: WebpackHotModule;

if (module.hot) {
  module.hot.accept();
  module.hot.dispose(() => server.close());
}