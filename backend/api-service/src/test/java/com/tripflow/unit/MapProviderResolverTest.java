package com.tripflow.unit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.web.server.ResponseStatusException;

import com.tripflow.config.MapTilerProperties;
import com.tripflow.config.MapsProperties;
import com.tripflow.config.OpenRouteServiceProperties;
import com.tripflow.service.map.dispatch.MapProviderResolver;

@Tag("unit")
public class MapProviderResolverTest {

    @Mock
    private MapsProperties mapsProperties;

    @Mock
    private MapTilerProperties mapTilerProperties;

    @Mock
    private OpenRouteServiceProperties openRouteServiceProperties;

    private MapProviderResolver resolver;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        this.resolver = new MapProviderResolver(
            this.mapsProperties,
            this.mapTilerProperties,
            this.openRouteServiceProperties
        );
    }

    @Test
    @DisplayName("Search provider resolution should not require ORS key")
    public void testResolveSearchProviderDoesNotRequireOrsKey() {
        when(this.mapsProperties.isEnabled()).thenReturn(true);
        when(this.mapsProperties.getProvider()).thenReturn(MapProviderResolver.PROVIDER_MAPTILER);
        when(this.mapTilerProperties.getApiKey()).thenReturn("maptiler-key");
        when(this.openRouteServiceProperties.getApiKey()).thenReturn("");

        String provider = this.resolver.resolveSearchProvider();

        assertEquals(MapProviderResolver.PROVIDER_MAPTILER, provider);
    }

    @Test
    @DisplayName("Routing provider resolution should require ORS key")
    public void testResolveRoutingProviderRequiresOrsKey() {
        when(this.mapsProperties.isEnabled()).thenReturn(true);
        when(this.mapsProperties.getProvider()).thenReturn(MapProviderResolver.PROVIDER_MAPTILER);
        when(this.openRouteServiceProperties.getApiKey()).thenReturn("");

        assertThrows(ResponseStatusException.class, () -> this.resolver.resolveRoutingProvider());
    }
}
