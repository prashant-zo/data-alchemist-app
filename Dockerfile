# ---- Stage 1: Build ----
# Use the official Node.js image with the version you are using (e.g., 20)
# 'alpine' is a lightweight version of Linux, good for smaller image sizes.
FROM node:20-alpine AS build

# Set the working directory inside the container
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package.json and pnpm-lock.yaml to leverage Docker cache
COPY package.json pnpm-lock.yaml ./

# Install all dependencies
RUN pnpm install

# Copy the rest of the application code
COPY . .

# IMPORTANT: Define the build-time argument for your Google API key
ARG GOOGLE_API_KEY
# Set it as an environment variable for the build process
ENV GOOGLE_API_KEY=$GOOGLE_API_KEY

# Build the Next.js application for production
# This will use the GOOGLE_API_KEY if needed during the build
RUN pnpm build


# ---- Stage 2: Production ----
# Use a smaller base image for the final production container
FROM node:20-alpine AS production

# Set the working directory
WORKDIR /app

# Set the environment to production
ENV NODE_ENV=production

# Copy the built application from the 'build' stage
# This includes the .next folder, public folder, and node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules

# Expose the port the Next.js app runs on
EXPOSE 3000

# The command to start the Next.js production server
CMD ["pnpm", "start"]