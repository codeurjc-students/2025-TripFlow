package com.tripflow.unit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

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
public class MapTilerSearchProviderPoiFilterTest {

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
    @DisplayName("parseSuggestResponse should keep valid POI suggestions")
    public void testParseSuggestResponseKeepsUsefulPoiSuggestions() throws Exception {
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
            null
        );

        Method contextBuilder = MapTilerSearchProvider.class.getDeclaredMethod("buildSuggestContext", MapSuggestQueryDTO.class);
        contextBuilder.setAccessible(true);
        Object context = contextBuilder.invoke(this.provider, query);

        Method parseMethod = MapTilerSearchProvider.class.getDeclaredMethod("parseSuggestResponse", String.class, context.getClass());
        parseMethod.setAccessible(true);
        MapSuggestResponseDTO response = (MapSuggestResponseDTO) parseMethod.invoke(this.provider, payload, context);

        assertEquals(2, response.suggestions().size());
        assertEquals("in", response.suggestions().getFirst().id());
    }

    @Test
    @DisplayName("buildSuggestRequestUrl should always request poi type")
    public void testBuildSuggestRequestUrlForcesPoiType() throws Exception {
        MapSuggestQueryDTO query = new MapSuggestQueryDTO(
            "restaurant",
            "es",
            10,
            null,
            null,
            "es",
            40.4168,
            -3.7038,
            10,
            "food"
        );

        Method contextBuilder = MapTilerSearchProvider.class.getDeclaredMethod("buildSuggestContext", MapSuggestQueryDTO.class);
        contextBuilder.setAccessible(true);
        Object context = contextBuilder.invoke(this.provider, query);

        Method requestUrlBuilder = MapTilerSearchProvider.class.getDeclaredMethod("buildSuggestRequestUrl", MapSuggestQueryDTO.class, context.getClass());
        requestUrlBuilder.setAccessible(true);
        String requestUrl = (String) requestUrlBuilder.invoke(this.provider, query, context);

        assertTrue(requestUrl.contains("types=poi"));
    }

    @Test
    @DisplayName("buildSuggestCacheKey should vary with category")
    public void testBuildSuggestCacheKeyIncludesCategory() throws Exception {
        MapSuggestQueryDTO foodQuery = new MapSuggestQueryDTO(
            "restaurant",
            "es",
            10,
            null,
            null,
            "es",
            40.4168,
            -3.7038,
            10,
            "food"
        );
        MapSuggestQueryDTO cultureQuery = new MapSuggestQueryDTO(
            "restaurant",
            "es",
            10,
            null,
            null,
            "es",
            40.4168,
            -3.7038,
            10,
            "culture"
        );

        Method contextBuilder = MapTilerSearchProvider.class.getDeclaredMethod("buildSuggestContext", MapSuggestQueryDTO.class);
        contextBuilder.setAccessible(true);
        Object foodContext = contextBuilder.invoke(this.provider, foodQuery);
        Object cultureContext = contextBuilder.invoke(this.provider, cultureQuery);

        Method cacheKeyBuilder = MapTilerSearchProvider.class.getDeclaredMethod("buildSuggestCacheKey", MapSuggestQueryDTO.class, foodContext.getClass());
        cacheKeyBuilder.setAccessible(true);
        String foodKey = (String) cacheKeyBuilder.invoke(this.provider, foodQuery, foodContext);
        String cultureKey = (String) cacheKeyBuilder.invoke(this.provider, cultureQuery, cultureContext);

        assertNotEquals(foodKey, cultureKey);
    }

    @Test
    @DisplayName("buildEffectiveQuery should combine query and category")
    public void testBuildEffectiveQueryCombinations() throws Exception {
        Method effectiveQueryBuilder = MapTilerSearchProvider.class.getDeclaredMethod("buildEffectiveQuery", MapSuggestQueryDTO.class);
        effectiveQueryBuilder.setAccessible(true);

        String onlyQuery = (String) effectiveQueryBuilder.invoke(this.provider, new MapSuggestQueryDTO(
            "museum", null, 10, null, null, null, null, null, null, null
        ));
        String onlyCategory = (String) effectiveQueryBuilder.invoke(this.provider, new MapSuggestQueryDTO(
            null, null, 10, null, null, null, 40.4168, -3.7038, 10, "culture"
        ));
        String both = (String) effectiveQueryBuilder.invoke(this.provider, new MapSuggestQueryDTO(
            "museum", null, 10, null, null, null, 40.4168, -3.7038, 10, "culture"
        ));
        String none = (String) effectiveQueryBuilder.invoke(this.provider, new MapSuggestQueryDTO(
            null, null, 10, null, null, null, 40.4168, -3.7038, 10, null
        ));

        assertEquals("museum", onlyQuery);
        assertEquals("culture", onlyCategory);
        assertEquals("museum culture", both);
        assertEquals("poi", none);
    }
}
