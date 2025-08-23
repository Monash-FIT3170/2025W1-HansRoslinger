# Stage 1: Build the Meteor app
FROM node:20 AS builder

# Install Meteor
RUN curl https://install.meteor.com/ | sh

WORKDIR /app

# Copy app source code
ADD ./HansRoslinger /app

ENV PATH="/root/.meteor:$PATH"

RUN npm ci
RUN meteor build --directory /app-build --architecture os.linux.x86_64 --allow-superuser


# Stage 2: Runtime image
FROM node:20

# Install nginx + supervisor (to run multiple processes)
RUN apt-get update && apt-get install -y nginx supervisor && rm -rf /var/lib/apt/lists/*

# Set environment variables
ENV PORT=3000
ENV ROOT_URL=http://127.0.0.1

# Create app directory
WORKDIR /opt/HansRoslinger/app

# Copy built app
COPY --from=builder /app-build/bundle /opt/HansRoslinger/app

# Install server dependencies
WORKDIR /opt/HansRoslinger/app/programs/server
RUN npm install

# Back to app root
WORKDIR /opt/HansRoslinger/app

# Configure nginx as reverse proxy
RUN rm /etc/nginx/sites-enabled/default
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Configure supervisor to run both Nginx + Meteor
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Expose Cloud Run’s port
EXPOSE 8080

# Start both processes
CMD ["/usr/bin/supervisord", "-n"]