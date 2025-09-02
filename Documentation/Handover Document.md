# Purpose of this Document

Blah Blah

# Table of Contents

- What is HansRoslinger?
- Technology Stack
  - Frontend Stack
  - Backend Stack
- Installation Guides
- Troubleshooting

# What is HansRoslinger?

HansRoslinger is a gestured-based presentation tool that allows individuals to create, upload and present datasets and images, with the unique ability of being able to present with their webcam positioned behind the data being presented, and being able to manipulate the data using built-in custom gestures.

# Technology Stack

HansRoslinger has been primariliy developed using the meteor full stack framework, which combines a number of different front end and back end frameworks to deliver an end to end web application.

## Frontend Stack

HansRoslinger makes use of the React library in combination with Material UI (MUI) for the definition and use of UI component.

More information can be found about React [here](https://react.dev/).
More information can be found about Material UI [here](https://mui.com/).

## Backend Stack

All of the backend logic written for HansRoslinger is contained within the Meteor application in the form of TypeScript. TypeScript provides the benefit of strong in-time type hinting, which has improved troubleshooting as we developed this software.

More Information can be found about typescript [here](https://www.typescriptlang.org/).

## Database

### In Code

All persistent data for HansRoslinger (excluding user authentication information such as JWT which is stored in cookies) is stored in a NoSQL MongoDB database.

MongoDB Collections are defined directly in Meteor, [example](https://github.com/Monash-FIT3170/2025W1-HansRoslinger/blob/1f1a180703a791b4bee73e65a5fc6f0f034dd272/HansRoslinger/imports/api/database/dataset/dataset.ts).

They are then published on start up of the server component of Meteor, [example](https://github.com/Monash-FIT3170/2025W1-HansRoslinger/blob/main/HansRoslinger/server/main.ts#L7-L9)

And subsribed to directly in the client side backend logic in order to upload and retrieve documents from, [example](https://github.com/Monash-FIT3170/2025W1-HansRoslinger/blob/1f1a180703a791b4bee73e65a5fc6f0f034dd272/HansRoslinger/imports/ui/App.tsx#L10-L12)

### MongoDB Atlas

MongoDB Atlas is used to host our database online, With the free tier allowing us to store 512MB worth of documents

- If you expect more space being required in the future you may need to look into payed plans, or enterprise systems

More information about MongoDB [here](https://www.mongodb.com/).

In order to connect to MongoDB Atlas we make use of a connection URL which specifies a path to our database, as well as sensitive login information for the account. This is stored via a Github Secret.

You can look into how this MongoDB Atlas database is connected to meteor through this guide [here](https://docs.meteor.com/api/collections.html#mongo_url).

## Github/CICD

We utilise Github in to track developmnet, as well as to store documentation and run CICD workflows

Documentation is found in this directory

CICD Workflows are found under .github and involve the following

- eslint which validates syntax for TypeScript and React (.tsx) files
- prettier which provides auto-linting when a PR is merged to main
- deploy which deploys the Meteor application to CloudRun, more information is available in the #Deployment section

We also have configured a pull request template in order to standardise the process of creating a pull request

## Deployment

Our application is deployed using Google Cloud Services, with the following steps being followed in order to deploy the application.

1. A DockerFile specifies the instructions to build the application into a container
2. A github workflow has been created which can be manually triggered (however this can be automated if needed) to deploy to GCP.

The steps executed to the pipeline are the following

1. Authenticate to the HansRoslinger GCP Project
2. Build the Docker Image and publish it to Google Artifact Registry
3. Deploy a CloudRun application using the provided Google Artifact Registry Image

If deployed successfully the HansRoslinger application should be accessible via this URL

`https://hans-roslinger-961228355326.australia-southeast1.run.app/`


### Routing to Unique Domain Name
UPDATE
assuming don't use same service provider (namecheap we're using)
1. setup name servers in name cheap to point to google domain services
2. authenticate that you own the said domain in google domain services
3. update records in domain specification in google (once oyu authenticate in google you can control in google). You can then point to cloudrun
  - setup A and AAAA DNS record

# Installation Guides

Follow these steps in order to set up the required software for HansRoslinger

1. Install Meteor using the [following step](https://docs.meteor.com/about/install.html)
2. CD Into HansRoslinger directory and run `meteor npm install` to install all dependencies
3. [Install MongoSH](https://www.mongodb.com/docs/mongodb-shell/install/) in order to perform local development with MongoDB
4. [Install Gcloud CLI](https://cloud.google.com/sdk/docs/install) in order to perform testing with GCP

# Troubleshooting

The following are a list of common issues that we encountered while developing HansRoslinger.

## Incorrect Node Version

Make sure you've downloaded the latest version of node as react-router requires at least `>=20.0.0`. Run `node -v` to check your version, if it is too low, uninstall node and then install from this website [https://nodejs.org/en/download](vscode-file://vscode-app/c:/Users/maxcr/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html).

## Module not found error

If a module not found error occurs when you are trying to run meteor, even after you have

- Validated that the import path is correct
- Validated that the data you are importing is being exported from the file

If you delete the `package-lock.json` file and then run `meteor npm install` from the `HansRoslinger` directory that should fix the issue

## Meteor stuck on `Extracting meteor-tool@1.4.0-1`

This issue can cause meteor to spend sometimes multiple hours extracting tools, and sometimes even then it doesn't work.

[This Github Issue describes the fix](https://github.com/meteor/meteor/issues/7688#issuecomment-360987929)

1. Update git
2. run `npx meteor uninstall`, `npm uninstall -g meteor` or `choco uninstall meteor` depending on how you initially downloaded meteor
3. check that the `%appdata%/Local/.meteor` folder is removed (press Windows Key + R and type `%appdata%` to get to this directory)
4. remove the `HansRoslinger/.meteor/local` directory
5. remove the versions-file in `HansRoslinger/.meteor`
6. remove the `HansRoslinger/node_modules` directory
7. run `npx meteor install`, `npm install -g meteor --foreground-script` or `choco install meteor` depending on how you initially downloaded meteor
8. in the `HansRoslinger` folder, run meteor npm install
9. in the `HansRoslinger` folder, run meteor
10. This should hopefully have fixed the issue
