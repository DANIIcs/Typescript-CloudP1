#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { Proyecto1Stack } from '../lib/proyecto1-stack';

const app = new cdk.App();
new Proyecto1Stack(app, 'Proyecto1Stack', {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT || '298526054328',  // Tu cuenta IAM
        region: process.env.CDK_DEFAULT_REGION || 'us-east-1'  // Región predeterminada
    }
});

app.synth();
