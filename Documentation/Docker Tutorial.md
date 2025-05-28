# DOCKER TUTORIAL

**by Agamjot Singh**

## Overview

[Docker in 100 Seconds](https://youtu.be/Gjnup-PuquQ)
The above is a basic overview of what docker is, what it can do and a very basic starter setup for docker.

**What is it?**
Docker is a tool used for developing, shipping and running applications. Its main use is to separate applications from your personal workspace so that you can deliver software quickly.

**How does it work?**

When you have a piece of software that you would like to package up, you can create a `DOCKERFILE`, build and publish it as a Docker container which can then be downloaded and ran on another device. Docker runs the application in an isolated environment called a container. A container is a bundled up piece of software that contains all the code and dependencies required for it to run. A container can be ran in Isolation, allowing you to you run many different containers simultaneously on the same machine.

**Why is it useful?**

Docker can be used for fast, consistent delivery of applications and is useful for CI/CD workflows, allowing developers to work in standardized environments. It often fixes the classic issue of "It works on my machine".

## **Docker Architecture**

**Docker Desktop** is a desktop application allowing users to use Docker with an application and interface.

**Docker daemon** (dockerd) listens for Docker API requests and manages Docker objects such as images, containers, networks and volumes.

**Docker client** (docker) is the primary method of interaction with Docker.

When using docker, you create and use images, containers, networks, volumes, plugins and other objects. Images are read-only templates with instructions for creating a Docker container. Images are derived from other images with additional customizations. Containers are a runnable instance of an image.

## **Installation**

Docker can be installed from: [https://docs.docker.com/get-started/get-docker/](https://docs.docker.com/get-started/get-docker/)

1. Choose the version appropriate for your operating system and follow the installation instructions.
2. Docker Desktop launches on startup by default. If you do not want this functionality, you can disable it via the settings in the app.
3. Docker Desktop comes with a tutorial inside the app to get you started. This tutorial is also provided below, with some additional notes.

## Tutorial

1. Make sure Docker Desktop is running in the background, if you don’t you will get errors later on such as `daemon is not running`
2. In the terminal, navigate to folder where you would like to install the repository and execute the following command: *git clone [https://github.com/docker/welcome-to-docker](https://github.com/docker/welcome-to-docker)*
3. Move into the folder via: *cd welcome-to-docker*

   - Check that the Dockerfile was created (the cloned repo already has one, but personal projects will need to have one created for them)
   - The main componet of creating a docker container is creating a Dockerfile. The dockerfile is where you can specify important information such as the dependencies to download, terminal instructions and what ports to expose
   - More information is available below in **What makes up a Dockerfile**

   ![1748412664302](Images/DockerTutorial/docker-dockerfile.png)
4. Once you have created a Dockerfile (in this case one has been provided for you), an image can be built using the command: *docker build \-t welcome-to-docker .*

   - The \-t flag tags your image with a name. (welcome-to-docker in this case).
   - The  . lets Docker know where it can find the Dockerfile. (in this case the same directory you are currently in)

![1748412761544](Images/DockerTutorial/docker-build.png)

*The build docker image*

5. Once the build is complete, an image will appear in the Images tab. Select the image name to see its details.

![1748412918402](Images/DockerTutorial/docker-clicking-on-image-name.png)

*details we see when clicking on the image name*

6. Select Run to run it as a container. In the Optional settings remember to specify a port number (something like 8089).

![1748412973764](Images/DockerTutorial/docker-optional-settings.png)

7. The application will be available at [http://localhost:/](http://localhost:8080/) where xxxx is the port number you specified (8089 in this case).

![1748412997344](Images/DockerTutorial/docker-congratulations.png)

## What makes up a Dockerfile

- A dockerfile contains the instructions to build your docker image. The dockerfile structure contains “INSTRUCTION arguments”
- The dockerfile must begin with the FROM instruction used to specify a base image which is being built upon.
- Dockerfile reference contains more information about the architecture for dockerfile: [Dockerfile reference](https://docs.docker.com/reference/dockerfile/).

In the case of the tutorial, the purpose of each line is outlined below

```
# Start your image with a node base image
FROM node:18-alpine

# The /app directory should act as the main application directory
WORKDIR /app

# Copy the app package and package-lock.json file
COPY package*.json ./

# Copy local directories to the current local directory of our docker image (/app)
COPY ./src ./src
COPY ./public ./public

# Install node packages, install serve, build the app, and remove dependencies at the end
RUN npm install \
    && npm install -g serve \
    && npm run build \
    && rm -fr node_modules

# Expose port 3000. This is the port that the docker container will listen in and recieve requests from.
EXPOSE 3000

# Start the app using serve command
CMD [ "serve", "-s", "build" ]
```

## **Final Remarks**

Docker desktop will contain all your created containers and you can view information about them there.
The following are some webpages with more details about specific docker functionality and behaviour.

- [What&#39;s next | Docker Docs](https://docs.docker.com/get-started/introduction/whats-next/)
- [Get Started](https://docs.docker.com/get-started/)

[image1]: data:image/png;base64,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
