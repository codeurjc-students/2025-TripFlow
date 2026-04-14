package com.tripflow.service.map.provider.search;

import java.util.List;

import org.springframework.stereotype.Service;

import com.tripflow.dto.map.MapCoordinateDTO;
import com.tripflow.dto.map.MapPlaceDTO;
import com.tripflow.dto.map.MapRetrieveQueryDTO;
import com.tripflow.dto.map.MapSuggestQueryDTO;
import com.tripflow.dto.map.MapSuggestResponseDTO;
import com.tripflow.dto.map.MapSuggestionDTO;

@Service
public class MockMapsSearchProvider implements MapsSearchProvider {

    private static final String MOCK_ID = "mock-place-id";
    private static final MapCoordinateDTO MOCK_CENTER = new MapCoordinateDTO(40.4138, -3.6921);

    @Override
    public MapSuggestResponseDTO suggest(MapSuggestQueryDTO query) {
        return new MapSuggestResponseDTO(List.of(
            new MapSuggestionDTO(
                MOCK_ID,
                "Museo del Prado",
                "C. de Ruiz de Alarcon 23, Madrid, Spain",
                "Madrid, Spain",
                "poi",
                MOCK_CENTER,
                List.of("museum")
            )
        ));
    }

    @Override
    public MapPlaceDTO retrieve(String id, MapRetrieveQueryDTO query) {
        String placeId = (id == null || id.isBlank()) ? MOCK_ID : id;

        return new MapPlaceDTO(
            placeId,
            "Museo del Prado",
            "C. de Ruiz de Alarcon 23, Madrid, Spain",
            "Madrid, Spain",
            "poi",
            MOCK_CENTER,
            List.of("museum")
        );
    }
}
