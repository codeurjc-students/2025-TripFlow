package com.tripflow.integration;

import java.time.Duration;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.TestInstance.Lifecycle;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Import;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.TestPropertySource;
import org.testcontainers.containers.KafkaContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import com.tripflow.integration.config.UnsplashTestConfig;

import io.restassured.RestAssured;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Import({UnsplashTestConfig.class})
@Testcontainers
@ActiveProfiles("dev")
@TestInstance(Lifecycle.PER_CLASS)
@DirtiesContext(classMode = ClassMode.AFTER_CLASS)
@TestPropertySource(properties = {
    "jwt.secret=VGhpcyBpcyBhIHZlcnkgc2VjdXJlIGRldmVsb3BtZW50IHNlY3JldCEyMw==",
    "unsplash.api.key=dummy_test_key",
    "maps.enabled=true",
    "maps.provider=mock",
    "maptiler.api.key=dummy_maptiler_key",
    "admin.email=admin@admin.com",
    "admin.username=admin",
    "admin.password=secure_password",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.jpa.show-sql=false",
    "spring.datasource.hikari.maximum-pool-size=3",
    "origins.frontend=http://localhost",
    "cookie.domain=",
    "cookie.secure=false",
    "cookie.same-site=lax"
})
public abstract class BaseIntegrationTest {

    @Container
    @ServiceConnection
    @SuppressWarnings("resource")
    public static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine")
        .withDatabaseName("tripflow_test")
        .withUsername("test")
        .withPassword("test")
        .withStartupTimeout(Duration.ofSeconds(60))
        .withCommand("postgres -c fsync=off -c synchronous_commit=off");

    @SuppressWarnings("resource")
    public static final KafkaContainer kafka = new KafkaContainer(
        DockerImageName.parse("confluentinc/cp-kafka:7.6.0")
    ).withKraft();

    @LocalServerPort
    protected int port;

    @DynamicPropertySource
    public static void overrideProperties(org.springframework.test.context.DynamicPropertyRegistry registry) {
        kafka.start();
        registry.add("spring.kafka.bootstrap-servers", kafka::getBootstrapServers);
    }

    @BeforeEach
    public void setUp() {
        RestAssured.port = port;
        RestAssured.baseURI = "http://localhost";
        RestAssured.basePath = "/api";
    }

}
