# 2025W1-HansRoslinger

<p align="center">
  <img src="Documentation/Images/HandoverDocument/Sean Roslinger.png" alt="alt text" width="300"/>
</p>

# Table of Contents

### Overview

- [Team Members](#team-members)
- [Overview](#what-is-hansroslinger)
- [How It Works](#how-does-hansroslinger-work)
- [What is this repository](#what-is-this-repository)
- [Repository Structure](#repository-structure)
- [Tech Stack](#tech-stack)

### Development

- [Getting Started](#how-to-run-hansroslinger-for-development)
- [Deployment](#deployment)
- [Links to external infrastructure](#links-to-external-infrastructure)
- [Handover Document](#handover-document)
- [License](#license)

# Overview

## Team Members

| Name               | Student Email                | Personal Email                |
| ------------------ | ---------------------------- | ----------------------------- |
| Jiale Hu           | ahuu0017@student.monash.edu  | jl.alexh@gmail.com            |
| Max Craig          | mcra0009@student.monash.edu  | maxcraig112@gmail.com         |
| Mayank Bajpai      | mbaj0004@student.monash.edu  | mayankbajpaix@gmail.com       |
| Ranusha Liyanage   | rliy0007@student.monash.edu  | ranushal.112@gmail.com        |
| Shehara Hewawasam  | shew0028@student.monash.edu  | sheharh2005@gmail.com         |
| Nathan Michailidis | nmic0005@student.monash.edu  | nathan.michailidis@gmail.com  |
| Harkirat Singh     | hlam0035@student.monash.edu  | harkiratsingh135790@gmail.com |
| Tejeshvi Sagwal    | tsag0005@student.monash.edu  | tejeshvisagwal7197@gmail.com  |
| Connor Macdougall  | cmac0046@student.monash.edu  | connoramacdougall@gmail.com   |
| Liam Chui          | lchu0032@student.monash.edu  | Liamchui88@gmail.com          |
| Bhanu Wijekoon     | bwij0005@student.moanash.edu | bhanu_wij@hotmail.com         |
| Agamjot Singh      | asin0114@student.monash.edu  | contactagam004@gmail.com      |

## What is HansRoslinger?

HansRoslinger is a modern gesture-based presentation application designed to replace the boring, old powerpoint slide with an engaging presentation experience. Instead of clicking from one slide to another, HansRoslinger allows presenters to interact with their data in real-time, allowing for a more engaging audience experience.

## How does HansRoslinger work?

HansRoslinger is a Meteor.js application with a NoSQL MongoDB database. React is used as a frontend framework and Meteor.js is used to handle middleware and backend capabilities, providing pub/sub capabilities and MongoDB integration.

HansRoslinger uses Mediapipe API (https://ai.google.dev/edge/mediapipe/solutions/guide), specifically its gesture-recognition technology to detect and classify gestures through a video feed, allowing this software to reflect changes to a presentation/dataset based on these gestures. This processing is client-side, meaning that frontend work comprises most of this application with limited backend services to handle requirements such as authentication and database management.

## What is this repository?

This is a mono-repository containing both the frontend and backend for the HansRoslinger application. This includes the development local MongoDB server which is managed by Meteor.js. The production MongoDB database is hosted on MongoDB Atlas.

## Repository Structure

```
2025W1-HansRoslinger/
├── .github/                 # Github configuration (Github Actions - CI/CD Pipelines)
├── .vscode/                 # VSCode configuration
├── Documentation/           # Documentation for HansRoslinger
├── HansRoslinger/          # Main application code
|    ├─ .meteor/            # Meteor config
|    ├─ client/             # Client side code
|    ├─ GCP                 # Google Cloud Provider configuration
|    ├─ imports             # Imported content
|    ├─ public              # Public assets
|    ├─ server              # Server side code
|    ├─ tests               # Application tests - Unit tests and Integration tests
|    ├─ package.json        # Application dependency management
|    └── package-lock.json   # Application dependency management
├── terraform/              # Terraform for Infrastructure-As-Code
└── Dockerfile              # Dockerfile to compose docker image for deployment
```

## Tech Stack

**Frontend:** React, Mediapipe
**Backend:** Meteor.js (Node.js)
**Database:** MongoDB (Local + Atlas)
**Hosting:** Google Cloud Run
**Other Tools:** Docker (optional), GitHub Actions (if used for CI/CD)

# Development

## Prerequisites

- Node.js (v18 or higher) - (`https://nodejs.org/en/download`)
- Meteor.js (latest) - (`https://v2-docs.meteor.com/install.html`)
- MongoDB Shell (MongoSh) - (`https://www.mongodb.com/docs/mongodb-shell/install/`)
- A webcam (for gesture recognition)

## How to run HansRoslinger for development

1. Ensure you are in the right directory:
   `cd .\HansRoslinger` (assuming you are at the root directory of the repository)
2. Start the code:
   `meteor`

This will start a server at `http://localhost:3000`

## Deployment

Our application is deployed using Google Cloud Services in the form of a Cloud Run using request based billing. For more information, see `Documentation/Handover Document.md`.

## Links to external infrastructure

**Note:** You will require explicit access to view/use these external services, please not that substainial use of services do most money, so be careful!

[MongoDB Atlas Project](https://cloud.mongodb.com/v2#/org/68909a50a210527643b70cdd/projects)
[Google Cloud Project](https://console.cloud.google.com/storage/overview;tab=overview?inv=1&invt=Ab4tKw&project=hansroslinger-468011)

## Handover Document

The Milestone 3 submission specifies that the Handover Document should be at the `root of the repository`, however because of the structure of our existing repository we have chosen to place it in our `Documentation` folder in order to align with our existing convention.

Please refer to the following documents if you would like to view it

- [Markdown Document](https://github.com/Monash-FIT3170/2025W1-HansRoslinger/blob/main/Documentation/Handover%20Document.md)
- [PDF](https://github.com/Monash-FIT3170/2025W1-HansRoslinger/blob/main/Documentation/Handover%20Document.pdf)

Please note that the markdown document may not render the Images in the github `Preview` mode, however it does work on an IDE editing. Please refer to the PDF for a Handover Document with Images.

## Maintenance Document

The Milestone 4 submission specifies that the Maintenance Document should be at the `root of the repository`, however because of the structure of our existing repository we have chosen to place it in our `Documentation` folder in order to align with our existing convention.

Please refer to the following documents if you would like to view it

- [Markdown Document](https://github.com/Monash-FIT3170/2025W1-HansRoslinger/blob/main/Documentation/Maintenance%20Plan.md)
- [PDF](https://github.com/Monash-FIT3170/2025W1-HansRoslinger/blob/main/Documentation/Maintenance%20Plan.pdf)

Please note that the markdown document may not render the Images in the github `Preview` mode, however it does work on an IDE editing. Please refer to the PDF for a Maintenance Document with Images.

## License

This repository is licensed under the MIT License. See `LICENSE`.
