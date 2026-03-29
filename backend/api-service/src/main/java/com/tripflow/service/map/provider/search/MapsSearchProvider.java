package com.tripflow.service.map.provider.search;

import com.tripflow.dto.map.MapPlaceDTO;
import com.tripflow.dto.map.MapRetrieveQueryDTO;
import com.tripflow.dto.map.MapSuggestQueryDTO;
import com.tripflow.dto.map.MapSuggestResponseDTO;

public interface MapsSearchProvider {
    MapSuggestResponseDTO suggest(MapSuggestQueryDTO query);
    MapPlaceDTO retrieve(String id, MapRetrieveQueryDTO query);
}
