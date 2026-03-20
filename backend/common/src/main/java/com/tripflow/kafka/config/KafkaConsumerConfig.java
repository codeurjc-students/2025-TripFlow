package com.tripflow.kafka.config;

import java.util.HashMap;
import java.util.Map;

import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.config.KafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.listener.ConcurrentMessageListenerContainer;
import org.springframework.kafka.support.serializer.JsonDeserializer;

import com.tripflow.kafka.messages.AIGenerationMessage;
import com.tripflow.kafka.messages.AIRequestMessage;
import com.tripflow.kafka.messages.CollaborationEventMessage;
import com.tripflow.kafka.messages.EmailMessage;
import com.tripflow.kafka.messages.NotificationMessage;

@Configuration
public class KafkaConsumerConfig {
    
    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    public Map<String, Object> consumerConfig() {
        Map<String, Object> props = new HashMap<>();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, JsonDeserializer.class);
        return props;
    }

    public <T> JsonDeserializer<T> jsonDeserializer(Class<T> targetClass) {
        JsonDeserializer<T> deserializer = new JsonDeserializer<>(targetClass);
        deserializer.addTrustedPackages("com.tripflow.kafka.messages");
        return deserializer;
    }

    public <T> KafkaListenerContainerFactory<
        ConcurrentMessageListenerContainer<String, T>> genericFactory(
            Class<T> targetClass
        ) {
            ConcurrentKafkaListenerContainerFactory<String, T>
                factory = new ConcurrentKafkaListenerContainerFactory<>();

            ConsumerFactory<String, T> consumerFactory = new DefaultKafkaConsumerFactory<>(
                consumerConfig(),
                new StringDeserializer(),
                jsonDeserializer(targetClass)
            );

            factory.setConsumerFactory(consumerFactory);
            return factory;
    }

    // [AI Request Configs] ===========================================

    @Bean
    public KafkaListenerContainerFactory<
        ConcurrentMessageListenerContainer<String, AIRequestMessage>> aiRequestFactory() {
            return genericFactory(AIRequestMessage.class);
    }

    // [AI Generation Configs] ========================================

    @Bean
    public KafkaListenerContainerFactory<
        ConcurrentMessageListenerContainer<String, AIGenerationMessage>> aiGenerationFactory() {
            return genericFactory(AIGenerationMessage.class);
    }

    // [Notification Configs] =========================================

    @Bean
    public KafkaListenerContainerFactory<
        ConcurrentMessageListenerContainer<String, NotificationMessage>> notificationFactory() {
            return genericFactory(NotificationMessage.class);
    }

    // [Collaboration Event Configs] =================================

    @Bean
    public KafkaListenerContainerFactory<
        ConcurrentMessageListenerContainer<String, CollaborationEventMessage>> collaborationFactory() {
            return genericFactory(CollaborationEventMessage.class);
    }

    // [Email Configs] ================================================

    @Bean
    public KafkaListenerContainerFactory<
        ConcurrentMessageListenerContainer<String, EmailMessage>> emailFactory() {
            return genericFactory(EmailMessage.class);
    }
}