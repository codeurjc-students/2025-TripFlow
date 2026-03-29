package com.tripflow.unit;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.lang.reflect.Method;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tripflow.config.MapTilerProperties;
import com.tripflow.config.MapsProperties;
import com.tripflow.dto.map.MapSuggestQueryDTO;
import com.tripflow.dto.map.MapSuggestResponseDTO;
import com.tripflow.service.map.MapsCacheService;
import com.tripflow.service.map.MapsHttpClientFactory;
import com.tripflow.service.map.provider.search.MapTilerSearchProvider;

@Tag("unit")
public class MapTilerSearchProviderRadiusFilterTest {

    private MapTilerSearchProvider provider;

    @BeforeEach
    public void setUp() {
        MapsHttpClientFactory httpFactory = Mockito.mock(MapsHttpClientFactory.class);
        Mockito.when(httpFactory.createRestTemplate()).thenReturn(Mockito.mock(RestTemplate.class));

        MapTilerProperties mapTilerProperties = new MapTilerProperties();
        MapsProperties mapsProperties = new MapsProperties();
        MapsCacheService mapsCacheService = null;

        this.provider = new MapTilerSearchProvider(
            httpFactory,
            new ObjectMapper(),
            mapTilerProperties,
            mapsProperties,
            mapsCacheService
        );
    }

    @Test
    @DisplayName("parseSuggestResponse should keep only points inside requested radius")
    public void testParseSuggestResponseAppliesStrictRadiusFilter() throws Exception {
        String payload = """
            {
              "features": [
                {
                  "id": "in",
                  "text": "Near",
                  "place_name": "Near point",
                  "place_type": ["poi"],
                  "center": [-3.7038, 40.4168]
                },
                {
                  "id": "out",
                  "text": "Far",
                  "place_name": "Far point",
                  "place_type": ["poi"],
                  "center": [-3.8038, 40.5168]
                }
              ]
            }
            """;

        MapSuggestQueryDTO query = new MapSuggestQueryDTO(
            "",
            null,
            10,
            null,
            null,
            null,
            40.4168,
            -3.7038,
            5,
            null,
            null
        );

        Method contextBuilder = MapTilerSearchProvider.class.getDeclaredMethod("buildSuggestContext", MapSuggestQueryDTO.class);
        contextBuilder.setAccessible(true);
        Object context = contextBuilder.invoke(this.provider, query);

        Method parseMethod = MapTilerSearchProvider.class.getDeclaredMethod("parseSuggestResponse", String.class, context.getClass());
        parseMethod.setAccessible(true);
        MapSuggestResponseDTO response = (MapSuggestResponseDTO) parseMethod.invoke(this.provider, payload, context);

        assertEquals(1, response.suggestions().size());
        assertEquals("in", response.suggestions().getFirst().id());
    }
}
