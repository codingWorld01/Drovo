# Design Document

## Overview

This design document outlines the implementation approach for replacing the single "Explore Now" button with two distinct call-to-action buttons: "Search" and "Join Drovo". The design maintains consistency with the existing UI while providing users with clearer navigation options.

## Architecture

### Component Structure
The dual button implementation will be contained within the existing Home component (`frontend/src/pages/Home/Home.jsx`) without requiring additional components. The buttons will replace the current single button in the hero section.

### Layout Approach
- **Container**: A flex container will hold both buttons side by side
- **Button Positioning**: Buttons will be displayed horizontally with appropriate spacing
- **Responsive Design**: On mobile devices, buttons may stack vertically or maintain horizontal layout with adjusted sizing

## Components and Interfaces

### Button Container Component
```jsx
<div className="cta-buttons-container">
  <button className="cta-button primary" onClick={handleSearch}>
    Search
  </button>
  <button className="cta-button secondary" onClick={handleJoinDrovo}>
    Join Drovo
  </button>
</div>
```

### Event Handlers
- **handleSearch**: Implements the search functionality (scrolls to shops section, focuses location input if needed)
- **handleJoinDrovo**: Implements the join functionality (scrolls to shops section to showcase platform value)

### CSS Classes
- **`.cta-buttons-container`**: Flex container for button layout
- **`.cta-button.primary`**: Primary button styling (existing cta-button style)
- **`.cta-button.secondary`**: Secondary button styling (complementary to primary)

## Data Models

No new data models are required. The implementation will use existing state variables:
- `userLocation`: To determine search behavior
- `address`: To check if location is set
- `shopSectionRef`: For scrolling functionality

## Error Handling

### Location-Based Search
- If user clicks "Search" without setting location, highlight the location input field
- Maintain existing error handling for location services
- Preserve current error messages for location-related issues

### Fallback Behavior
- Both buttons will default to scrolling to shops section if other functionality fails
- Maintain existing shop loading and error states

## Testing Strategy

### Unit Tests
- Test button click handlers for correct behavior
- Verify proper scrolling functionality for both buttons
- Test responsive layout on different screen sizes

### Integration Tests
- Test interaction between buttons and existing location functionality
- Verify shop section scrolling works correctly
- Test button behavior with and without user location data

### Visual Tests
- Verify button styling consistency across browsers
- Test responsive design on mobile and desktop
- Ensure proper spacing and alignment

## Implementation Details

### CSS Styling Strategy

#### Button Container
```css
.cta-buttons-container {
  display: flex;
  gap: 15px;
  width: 90%;
  margin-top: 20px;
}
```

#### Primary Button (Search)
- Maintains existing `.cta-button` styling
- Tomato background color (#ff6347)
- Full existing hover effects and transitions

#### Secondary Button (Join Drovo)
```css
.cta-button.secondary {
  background-color: transparent;
  color: tomato;
  border: 2px solid tomato;
}

.cta-button.secondary:hover {
  background-color: tomato;
  color: white;
}
```

#### Responsive Considerations
```css
@media (max-width: 768px) {
  .cta-buttons-container {
    flex-direction: column;
    gap: 10px;
  }
  
  .cta-button {
    width: 100%;
  }
}
```

### Functionality Implementation

#### Search Button Logic
1. Check if user has set location (`address` or `userLocation`)
2. If no location: Focus location input and scroll to it
3. If location set: Scroll directly to shops section
4. Maintain existing shop filtering behavior

#### Join Drovo Button Logic
1. Scroll to shops section to showcase available options
2. Display all shops regardless of location to demonstrate platform value
3. Could be extended in future to trigger registration modal or redirect

### Integration Points

#### Existing Functions to Reuse
- `scrollToShops()`: For both buttons' scroll functionality
- `getCurrentLocation()`: Could be triggered by Search button if no location
- Existing shop filtering logic in `fetchShops()`

#### State Dependencies
- `address`: To determine if location input should be focused
- `userLocation`: To determine search behavior
- `shopSectionRef`: For scrolling functionality

## Design Decisions and Rationales

### Button Placement
- **Decision**: Side-by-side horizontal layout
- **Rationale**: Maintains visual balance and provides equal prominence to both actions

### Styling Approach
- **Decision**: Primary/secondary button pattern
- **Rationale**: "Search" is the main action for finding shops, "Join Drovo" is secondary engagement

### Responsive Strategy
- **Decision**: Stack vertically on mobile
- **Rationale**: Ensures both buttons remain accessible and properly sized on small screens

### Functionality Mapping
- **Decision**: Both buttons scroll to shops section
- **Rationale**: Maintains consistent user flow while providing different contexts for shop discovery

## Future Enhancements

### Join Drovo Button Evolution
- Could trigger registration modal
- Could redirect to signup page
- Could show onboarding flow

### Search Button Enhancement
- Could open advanced search filters
- Could integrate with search functionality beyond location

### Analytics Integration
- Track button click rates
- A/B test button labels and styling
- Monitor user engagement patterns