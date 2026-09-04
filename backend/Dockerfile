FROM node:24.16-alpine AS base
WORKDIR /app

# ============================================
# STAGE 1: Dependencies
# ============================================
FROM base AS deps

COPY package.json package-lock.json* ./

# Install ALL dependencies (including devDependencies for tests)
RUN npm ci

# ============================================
# STAGE 2: Builder
# ============================================
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Optional build step
# RUN npm run build

# ============================================
# STAGE 3: Test Image
# Used ONLY in CI
# ============================================
FROM base AS test

ENV NODE_ENV=test

COPY --from=deps /app/node_modules ./node_modules
COPY . .

#CMD ["npm", "test"]
CMD ["node", "index.js"]

# ============================================
# STAGE 4: Production Runner
# Minimal production image
# ============================================
FROM base AS runner

ENV NODE_ENV=production

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy package files
COPY package.json package-lock.json* ./

# Install ONLY production dependencies
RUN npm ci ----only=production && npm cache clean --force

# Copy app source
COPY --from=builder /app ./

# Remove unnecessary files
RUN rm -rf node_modules/.cache

# Set ownership
RUN chown -R appuser:appgroup /app

USER appuser

#CMD ["npm", "run", "start"]
CMD ["node", "index.js"]

# # ============================================
# # STAGE 2: Test (CI/CD target - production-ready)
# # This stage can run tests AND be promoted to production
# # ============================================
# FROM base AS test

# # Create non-root user
# RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# # Copy dependencies (includes dev deps for testing)
# COPY --from=deps /app/node_modules ./node_modules
# COPY --from=deps /app/package*.json ./

# # Copy application code
# COPY . .

# # Set ownership
# RUN chown -R appuser:appgroup /app

# # Can run as root for tests, switch to appuser for production
# # USER appuser

# # Environment can be overridden at runtime
# ENV NODE_ENV=production

# # Default command (can be overridden)
# # CI will run: docker run $IMAGE npm test
# # Production will run: docker run $IMAGE npm start
# CMD ["npm", "run", "start"]

# # ============================================
# # STAGE 3: Runner (Optional - pure production image)
# # Not used in your CI workflow, but available for manual builds
# # ============================================
# FROM base AS runner

# # Create non-root user
# RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# # Install ONLY production dependencies
# COPY package.json package-lock.json* ./
# RUN npm ci --only=production && npm cache clean --force

# # Copy application code
# COPY . .

# # Set ownership
# RUN chown -R appuser:appgroup /app

# USER appuser

# ENV NODE_ENV=production

# CMD ["npm", "run", "start"]
