package com.qflow.queue.config;

import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.config.SaslConfigs;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.apache.kafka.common.serialization.StringSerializer;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;

import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableKafka
public class KafkaConfig {

    // =========================================================
    // Kafka Connection
    // =========================================================

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    @Value("${spring.kafka.consumer.group-id:qflow-test-group}")
    private String consumerGroupId;

    @Value("${spring.kafka.consumer.auto-offset-reset:earliest}")
    private String autoOffsetReset;


    // =========================================================
    // Kafka Security
    // =========================================================

    @Value("${spring.kafka.properties.security.protocol:PLAINTEXT}")
    private String securityProtocol;

    @Value("${spring.kafka.properties.sasl.mechanism:PLAIN}")
    private String saslMechanism;

    @Value("${spring.kafka.properties.sasl.jaas.config:}")
    private String saslJaasConfig;


    // =========================================================
    // Common Kafka Configuration
    // =========================================================

    private Map<String, Object> baseKafkaConfig() {

        Map<String, Object> config = new HashMap<>();

        // Bootstrap servers
        config.put(
                ProducerConfig.BOOTSTRAP_SERVERS_CONFIG,
                bootstrapServers
        );

        // Security protocol
        config.put(
                "security.protocol",
                securityProtocol
        );

        // Configure SASL only when using SASL
        if (!"PLAINTEXT".equalsIgnoreCase(securityProtocol)) {

            config.put(
                    SaslConfigs.SASL_MECHANISM,
                    saslMechanism
            );

            config.put(
                    SaslConfigs.SASL_JAAS_CONFIG,
                    saslJaasConfig
            );
        }

        return config;
    }


    // =========================================================
    // PRODUCER
    // =========================================================

    @Bean
    public ProducerFactory<String, String> producerFactory() {

        Map<String, Object> config = baseKafkaConfig();

        config.put(
                ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG,
                StringSerializer.class
        );

        config.put(
                ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG,
                StringSerializer.class
        );

        return new DefaultKafkaProducerFactory<>(config);
    }


    @Bean
    public KafkaTemplate<String, String> kafkaTemplate() {

        return new KafkaTemplate<>(producerFactory());
    }


    // =========================================================
    // CONSUMER
    // =========================================================

    @Bean
    public ConsumerFactory<String, String> consumerFactory() {

        Map<String, Object> config = baseKafkaConfig();

        config.put(
                ConsumerConfig.GROUP_ID_CONFIG,
                consumerGroupId
        );

        config.put(
                ConsumerConfig.AUTO_OFFSET_RESET_CONFIG,
                autoOffsetReset
        );

        config.put(
                ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG,
                StringDeserializer.class
        );

        config.put(
                ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG,
                StringDeserializer.class
        );

        return new DefaultKafkaConsumerFactory<>(config);
    }


    // =========================================================
    // Kafka Listener
    // =========================================================

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, String>
    kafkaListenerContainerFactory() {

        ConcurrentKafkaListenerContainerFactory<String, String> factory =
                new ConcurrentKafkaListenerContainerFactory<>();

        factory.setConsumerFactory(consumerFactory());

        return factory;
    }
}