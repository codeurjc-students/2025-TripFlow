package com.tripflow.integration.utils;

import java.time.Duration;
import java.util.List;
import java.util.Properties;
import java.util.UUID;
import java.util.function.Predicate;

import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.kafka.support.serializer.JsonDeserializer;

public final class KafkaTestUtils {
    private KafkaTestUtils() {}

    public static <T> KafkaConsumer<String, T> createConsumer(
        String bootstrapServers,
        String topic,
        Class<T> payloadType
    ) {
        Properties props = new Properties();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ConsumerConfig.GROUP_ID_CONFIG, "test-" + UUID.randomUUID());
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "latest");
        props.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, "true");
        props.put(JsonDeserializer.TRUSTED_PACKAGES, "com.tripflow.kafka.messages");
        props.put(JsonDeserializer.USE_TYPE_INFO_HEADERS, "false");

        KafkaConsumer<String, T> consumer = new KafkaConsumer<>(
            props,
            new StringDeserializer(),
            new JsonDeserializer<>(payloadType, false)
        );
        consumer.subscribe(List.of(topic));
        awaitAssignment(consumer, Duration.ofSeconds(5));
        return consumer;
    }

    public static <T> T pollForMessage(
        KafkaConsumer<String, T> consumer,
        Predicate<T> predicate,
        Duration timeout
    ) {
        long deadline = System.currentTimeMillis() + timeout.toMillis();
        while (System.currentTimeMillis() < deadline) {
            ConsumerRecords<String, T> records = consumer.poll(Duration.ofMillis(200));
            if (records.isEmpty()) {
                continue;
            }
            for (var record : records) {
                T value = record.value();
                if (predicate.test(value)) {
                    return value;
                }
            }
        }
        return null;
    }

    private static void awaitAssignment(KafkaConsumer<String, ?> consumer, Duration timeout) {
        long deadline = System.currentTimeMillis() + timeout.toMillis();
        while (consumer.assignment().isEmpty() && System.currentTimeMillis() < deadline) {
            consumer.poll(Duration.ofMillis(200));
        }
    }
}
