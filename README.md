# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

# Google OAuth CDK Project

Brief description of your project.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory with your AWS credentials:

   ```bash
   AWS_ACCESS_KEY_ID=your_access_key_id
   AWS_SECRET_ACCESS_KEY=your_secret_access_key
   ```

3. Deploy the stack:

   ```bash
   npx cdk deploy
   ```

4. Destroy the stack:
   ```bash
   npx cdk destroy
   ```

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `npx cdk deploy` deploy this stack to your default AWS account/region
- `npx cdk diff` compare deployed stack with current state
- `npx cdk synth` emits the synthesized CloudFormation template
