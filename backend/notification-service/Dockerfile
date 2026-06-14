FROM maven:3.9-eclipse-temurin-21-alpine AS build

WORKDIR /app

COPY pom.xml .
COPY api-service/pom.xml ./api-service/
COPY ai-service/pom.xml ./ai-service/
COPY notification-service/pom.xml ./notification-service/
COPY common/pom.xml ./common/

COPY notification-service/src ./notification-service/src
COPY common/src ./common/src

RUN mvn clean package -pl ./notification-service -am -DskipTests -B


FROM eclipse-temurin:21-jre-alpine AS backend

WORKDIR /app

COPY --from=build /app/notification-service/target/notification-service-*.jar app.jar

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 8082

ENTRYPOINT ["java", "-jar", "app.jar"]