# Meet in the Middle Feature

This feature allows users to find the optimal meeting location between two points using Mapbox's isochrone analysis and places search.

## How It Works

1. **Location Selection**: Users select two locations (User A and User B)
   - Use current location via geolocation
   - Search for locations using Mapbox Geocoding API
   - Manual map selection

2. **Isochrone Generation**: The system generates travel time areas for both users
   - Configurable travel modes (driving, walking, cycling)
   - Multiple time intervals (15, 30, 45, 60 minutes)
   - Visual overlap area calculation

3. **Place Discovery**: Search for meeting spots within the overlap area
   - Filter by category (restaurants, cafes, parks, etc.)
   - Sort by distance, rating, or relevance
   - Real-time search with debouncing

4. **Navigation**: Get directions to the selected meeting spot
   - Turn-by-turn directions for both users
   - Multiple travel modes
   - Route optimization

## Components

### Core Components
- `MeetInMiddleMap`: Main orchestrator component
- `LocationSelector`: Dual location input with search and geolocation
- `IsochroneLayer`: Visual representation of travel time areas
- `MeetingSpotSelector`: Place discovery and selection
- `NavigationPanel`: Directions and route information

### Hooks
- `useGeolocation`: Handle current location detection
- `useIsochrone`: Generate and manage isochrone data
- `usePlacesSearch`: Search for places within overlap areas
- `useDirections`: Get navigation routes

### Services
- `mapboxService`: Wrapper for all Mapbox API calls

## API Endpoints Used

- **Geocoding API**: Location search and reverse geocoding
- **Isochrone API**: Travel time area generation
- **Places API**: Nearby places search (via Geocoding API)
- **Directions API**: Route calculation and navigation

## Environment Variables

```env
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_access_token
```

## Usage

1. Navigate to `/meet` page
2. Select locations for User A and User B
3. Choose travel preferences and generate isochrones
4. Browse and select a meeting spot
5. Get directions to the meeting location

## Features

- ✅ Dual location selection
- ✅ Real-time location search
- ✅ Current location detection
- ✅ Isochrone visualization
- ✅ Place discovery with filtering
- ✅ Multi-mode navigation
- ✅ Responsive design
- ✅ Dark mode support
- ✅ Accessibility features

## Future Enhancements

- [ ] Save meeting preferences
- [ ] Share meeting details
- [ ] Calendar integration
- [ ] Real-time collaboration
- [ ] Advanced filtering options
- [ ] Route optimization
- [ ] Traffic-aware routing
