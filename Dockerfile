# Stage 1: Build the Meteor app
FROM node:20 AS builder

# Install Meteor
RUN curl https://install.meteor.com/ | sh

# Create app directory
WORKDIR /app

# Copy app source code
ADD ./HansRoslinger /app

# Set PATH to include Meteor
ENV PATH="/root/.meteor:$PATH"

# Install Meteor dependencies and build the app
RUN npm ci
# RUN meteor build --directory /app-build --architecture os.linux.x86_64 --allow-superuser
ENV PORT=8080
ENV ROOT_URL=http://127.0.0.1
ENV MONGO_URL=mongodb+srv://mbaj0004:wf6Mhxe6qbRHcz5P@hansroslinger.l7tcaoi.mongodb.net/?retryWrites=true&w=majority&appName=HansRoslinger

EXPOSE 8080

CMD ["meteor", "run", "-p", "8080", "--allow-superuser"]

# Stage 2: Create final runtime image
# FROM node:20

# # Set environment variables
# ENV PORT=8080
# ENV ROOT_URL=http://127.0.0.1
# ENV MONGO_URL=mongodb+srv://mbaj0004:wf6Mhxe6qbRHcz5P@hansroslinger.l7tcaoi.mongodb.net/?retryWrites=true&w=majority&appName=HansRoslinger

# # Create app directory in the runtime container
# WORKDIR /opt/HansRoslinger/app

# # Copy built app from builder
# COPY --from=builder /app-build/bundle /opt/HansRoslinger/app

# # Install production node modules for server
# WORKDIR /opt/HansRoslinger/app/programs/server
# RUN npm install

# # Back to app root to run
# WORKDIR /opt/HansRoslinger/app

# # Expose the port
# EXPOSE 8080

# # Start the app
# CMD ["node", "main.js"]
