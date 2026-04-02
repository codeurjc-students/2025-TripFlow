package com.tripflow.unit;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.lang.reflect.Field;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.tripflow.config.OpenRouteServiceProperties;

public class OpenRouteServicePropertiesTest {

    @Test
    @DisplayName("Normalizes base URL by appending /directions when missing")
    public void testAppendsDirectionsSuffix() throws Exception {
        OpenRouteServiceProperties properties = new OpenRouteServiceProperties();
        this.setDirectionsBaseUrl(properties, "https://api.openrouteservice.org/v2");

        assertEquals("https://api.openrouteservice.org/v2/directions", properties.getDirectionsBaseUrl());
    }

    @Test
    @DisplayName("Keeps URL when /directions suffix already exists")
    public void testKeepsDirectionsSuffix() throws Exception {
        OpenRouteServiceProperties properties = new OpenRouteServiceProperties();
        this.setDirectionsBaseUrl(properties, "https://api.openrouteservice.org/v2/directions");

        assertEquals("https://api.openrouteservice.org/v2/directions", properties.getDirectionsBaseUrl());
    }

    @Test
    @DisplayName("Trims trailing slash before using directions base URL")
    public void testTrimsTrailingSlash() throws Exception {
        OpenRouteServiceProperties properties = new OpenRouteServiceProperties();
        this.setDirectionsBaseUrl(properties, "https://api.openrouteservice.org/v2/directions/");

        assertEquals("https://api.openrouteservice.org/v2/directions", properties.getDirectionsBaseUrl());
    }

    private void setDirectionsBaseUrl(OpenRouteServiceProperties properties, String value) throws Exception {
        Field field = OpenRouteServiceProperties.class.getDeclaredField("directionsBaseUrl");
        field.setAccessible(true);
        field.set(properties, value);
    }
}
