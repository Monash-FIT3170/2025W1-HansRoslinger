# Hansroslinger Maintenance Plan

# Aim of Plan

The aim of this document is to outline the winding down of HanRoslinger, including

* Steps taken to maintain the current state of the code
* The state of the production system
* Associated Costs

# What is HansRoslinger


HansRoslinger is a gestured-based presentation tool that allows individuals to create, upload and present datasets and images, with the unique ability of being able to present with their webcam positioned behind the data being presented, and being able to manipulate the data using built-in custom gestures.

The purpose of HansRoslinger is to make the process of presenting information as engaging as possible to the audience, and as intuitive as possible to the presenter. Bygone are the days of mindlessly clicking through a powerpoint presentation, with only your voice or a small video of you in the corner. HansRoslinger quite literally puts the presentation right in your fingertips.

<p align="center">
  <img src="images/HandoverDocument/1757038436775.png" alt="alt text" width="500"/>
</p>

HansRoslinger is accessible via a public URL `hansroslinger.website`, or via the Cloud Run URL

`https://hans-roslinger-961228355326.us-central1.run.app`

Please note that the production version is currently deployed in the us-central1 zone, this is because only US regions support domain mapping, which allowed us to use the custom URL. Doing the same with an Australia based region is possible however would incur additional costs

# Maintaing the current state of the codebase

All features of HansRoslinger, including

1. Application code
2. Infrastructure via Terraform
3. Documentation

Is all maintained through the github repository `https://github.com/Monash-FIT3170/2025W1-HansRoslinger`. This repository is owned by the [Monash FIT3170 Github Organisation](https://github.com/Monash-FIT3170), therefore the biggest risk to the integrity of our codebse is whether the maintainers of the repository do not remove it. Therefore the first steps in maintaining the system is to verify that this repository will remain after the unit concludes
