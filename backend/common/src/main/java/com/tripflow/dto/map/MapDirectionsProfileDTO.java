package com.tripflow.dto.map;

public enum MapDirectionsProfileDTO {
    DRIVING("driving"),
    DRIVING_TRAFFIC("driving"),
    WALKING("walking"),
    CYCLING("cycling");

    private final String providerProfile;

    MapDirectionsProfileDTO(String providerProfile) {
        this.providerProfile = providerProfile;
    }

    public String providerProfile() {
        return this.providerProfile;
    }
}
