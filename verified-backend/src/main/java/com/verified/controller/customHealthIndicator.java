package com.verified.controller;


import org.jspecify.annotations.Nullable;
import org.springframework.boot.health.contributor.Health;
import org.springframework.boot.health.contributor.HealthIndicator;
import org.springframework.stereotype.Component;
@Component
public class HealthController implements HealthIndicator {

    @Override
    public Health health() {
        return Health.up()
                .withDetail("custom", "running")
                .build();
    }
}
