# Stage 1: Build Scala Backend using official Gradle JDK 21 image
FROM gradle:8.7-jdk21-alpine AS builder
WORKDIR /builder

# Copy build configuration, version catalog, and source files
COPY gradle ./gradle
COPY settings.gradle gradle.properties ./
COPY app/build.gradle ./app/
COPY app/src ./app/src

# Build production distribution bundle directly
RUN gradle :app:installDist --no-daemon

# Stage 2: Minimal Runtime Environment using OpenJDK 21 JRE
FROM eclipse-temurin:21-jre-alpine AS runner
WORKDIR /app

EXPOSE 8080

# Copy compiled installation distribution from builder stage
COPY --from=builder /builder/app/build/install/app /app

# Configure default environment variables for HADES Backend
ENV HTTP_PORT=8080 \
    HTTP_INTERFACE=0.0.0.0 \
    AI_SERVICE_URL=http://ai-service:8000 \
    DATABASE_URL=jdbc:postgresql://postgres:5432/hcl_learning \
    DATABASE_USER=hcl \
    DATABASE_PASSWORD=hcl_dev_password \
    JWT_SECRET=hades-super-secret-jwt-signing-key-2026

RUN chmod +x /app/bin/app

ENTRYPOINT ["/app/bin/app"]
