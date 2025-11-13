# Packet Routing Simulator - Design Guidelines

## Design Approach
**System-Based Technical Interface** - Drawing inspiration from educational platforms like Observable and technical demo sites, prioritizing clarity and functional elegance over visual ornamentation. This is a utility-focused educational tool where understanding the algorithm takes precedence.

## Typography
- **Primary Font**: 'Inter' or 'IBM Plex Sans' from Google Fonts (clean, technical readability)
- **Title/Header**: 600-700 weight, 28-32px - "Packet Routing Simulator"
- **Labels/Controls**: 500 weight, 14-16px for buttons and form elements
- **Node IDs/Costs**: 600 weight, 12-14px (Canvas text, needs to be readable at scale)
- **Status Messages**: 500 weight, 14px for packet delivery notifications
- **Tooltips**: 400 weight, 13px for node information overlays

## Layout System
**Spacing**: Use Tailwind units of 2, 4, 6, and 8 (p-4, gap-6, m-8). Keep spacing tight and functional.

**Structure**:
- **Header**: Fixed top bar (h-16) with title and key controls, full-width with max-w-7xl container
- **Main Canvas Area**:占dominant viewport space (70-80% height), centered with border treatment
- **Control Panel**: Horizontal bar below header or vertical sidebar (w-64) - choose based on control count
- **Footer Status**: Small fixed bottom strip (h-12) for delivery messages and algorithm status

## Component Library

### Core Canvas Interface
- **Network Canvas**: Large rectangular area with subtle border (border-2), rounded corners (rounded-lg), light neutral background distinct from page
- **Nodes**: Circles (radius 20-25px) with clear stroke width (2-3px), programmatic color coding
- **Links**: Straight lines with 2px stroke, mid-gray when inactive
- **Costs/Labels**: Small text boxes with white/semi-transparent backgrounds positioned along link midpoints
- **Active Path**: Highlighted links with 4px stroke, accent color, animated dashed pattern optional

### Controls
- **Node Selection Dropdowns**: Two side-by-side select elements with labels "Source Node" and "Destination Node"
- **Primary Action Button**: Large "Send Packet" button with strong accent color, prominent placement
- **Secondary Button**: "Generate Random Network" with outline/ghost style
- **Control Group**: Contained in card-like panel (p-6, rounded-lg, border or subtle shadow)

### Feedback Elements
- **Tooltips**: Floating card (p-3, rounded-md, shadow-lg) appearing on node hover, showing "Node: [ID/Name]"
- **Success Message**: Animated fade-in banner or alert (p-4, rounded-md) with success color when packet delivered
- **Legend**: Small reference box showing color meanings (Source=green, Destination=blue, Router=gray) positioned in corner

### Color Coding (Programmatic - for Canvas)
- **Source Node**: Strong green shade (#10B981 or similar)
- **Destination Node**: Strong blue shade (#3B82F6 or similar)  
- **Router Nodes**: Medium gray (#6B7280)
- **Active Path**: Accent color matching Send button
- **Packet Indicator**: Contrasting bright color (orange/red) for visibility

## Animations
**Minimal and Purposeful**:
- **Packet Movement**: Smooth linear interpolation along path segments at consistent speed (2-3 seconds total journey)
- **Path Highlighting**: Instant color change when route calculated, no elaborate transitions
- **Success Message**: Simple 300ms fade-in when delivered
- **Hover States**: Immediate feedback on buttons and nodes, no delays
- **Avoid**: Elaborate node animations, spinning effects, particle systems

## Educational Clarity Features
- **Step Indicator**: Optional small progress display showing "Calculating Route → Sending Packet → Delivered"
- **Algorithm Visualization**: Consider brief text showing "Using Dijkstra's Algorithm" during calculation
- **Cost Display**: Always visible on links, ensure high contrast for readability
- **Clear States**: Distinct visual states for idle, calculating, transmitting, and completed

## Layout Variations
**Option A - Horizontal Layout**: Header with controls, large canvas below, footer status bar
**Option B - Sidebar Layout**: Left sidebar (w-64) with stacked controls, canvas taking remaining space, inline status

Choose Option A for simplicity and wider canvas area.

## Accessibility
- Ensure Canvas text has sufficient size and contrast
- Provide text alternative describing current network state
- Keyboard navigation for dropdown controls and buttons
- Clear focus indicators on interactive elements

**No Images Required** - This is a functional simulator where the Canvas visualization IS the primary content. No hero images or decorative imagery needed.