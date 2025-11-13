# Packet Routing Simulator

## Overview
An interactive, browser-based visualization tool that demonstrates how data packets travel through a network using Dijkstra's shortest path algorithm. Built for Computer Networks education and demonstrations.

## Recent Changes (November 13, 2025)
- Initial implementation of complete Packet Routing Simulator
- Canvas-based network visualization with 5-7 nodes
- Dijkstra's shortest path algorithm implementation
- Smooth packet animation along calculated routes
- Interactive node selection and random network generation
- Comprehensive tooltips and visual feedback
- Professional UI with IBM Plex Sans typography

## Project Architecture

### Frontend-Only Application
This is a pure client-side application with no backend API requirements. All logic runs in the browser.

**Technology Stack:**
- React with TypeScript for UI components
- HTML5 Canvas API for network visualization
- Tailwind CSS + Shadcn UI for styling
- Wouter for routing

### Key Components

**Main Simulator Page** (`client/src/pages/simulator.tsx`)
- Network graph rendering on Canvas
- Dijkstra's shortest path algorithm
- Packet animation engine
- Interactive controls (node selection, send packet, random network)
- Hover tooltips
- Real-time status messages

**Data Structures** (`shared/schema.ts`)
- `NetworkNode`: Represents computers and routers with position and type
- `NetworkEdge`: Represents connections with cost/delay values
- `Network`: Complete network topology
- `PathSegment`: Calculated route segments
- `SimulationState`: Current simulation status

### Features

1. **Network Visualization**
   - Canvas-based rendering of nodes and edges
   - Color-coded nodes: Green (source), Blue (destination), Gray (routers)
   - Edge cost labels with readable backgrounds
   - Responsive hover effects

2. **Dijkstra's Algorithm**
   - Finds shortest path between source and destination
   - Uses edge costs as weights
   - Displays total route cost

3. **Packet Animation**
   - Smooth 2.5-second animation along the shortest path
   - Orange packet with glow effect
   - Path highlighting during transmission
   - Success message on delivery

4. **Interactive Controls**
   - Source and destination node dropdowns
   - Send Packet button (calculates and animates)
   - Random Network generator (creates new topologies)
   - All controls disabled during animation

5. **Visual Feedback**
   - Hover tooltips showing node information
   - Color legend explaining node types
   - Status messages for calculation and delivery
   - Highlighted active paths

## Design Guidelines

**Typography:** IBM Plex Sans for technical clarity
**Layout:** Horizontal layout with header, canvas area, and status footer
**Spacing:** Consistent padding using Tailwind units (p-4, p-6, gap-4)
**Colors:** Semantic color coding for educational clarity

## Running the Application

```bash
npm run dev
```

The application starts on port 5000 and runs entirely in the browser. No database or backend services required.

## Code Organization

- `/client/src/pages/simulator.tsx` - Main simulator component
- `/shared/schema.ts` - TypeScript interfaces for network data
- `/client/src/index.css` - Design system tokens
- `tailwind.config.ts` - Font and color configuration

## Educational Value

This simulator demonstrates:
- Graph theory concepts (nodes, edges, weights)
- Dijkstra's shortest path algorithm
- Network routing fundamentals
- Computer networks packet transmission
- Visual algorithm representation

Perfect for Computer Networks courses, algorithm demonstrations, or interactive learning materials.
