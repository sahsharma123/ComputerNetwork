import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Network as NetworkIcon, Play, Shuffle, Info } from "lucide-react";
import type { Network, NetworkNode, NetworkEdge, PathSegment, SimulationState } from "@shared/schema";

/**
 * DIJKSTRA'S SHORTEST PATH ALGORITHM
 * Finds the shortest path between source and destination nodes
 * using edge costs as weights
 */
function dijkstra(
  network: Network,
  sourceId: string,
  destId: string
): PathSegment[] {
  const distances = new Map<string, number>();
  const previous = new Map<string, string | null>();
  const unvisited = new Set<string>();

  // Initialize distances
  network.nodes.forEach((node) => {
    distances.set(node.id, node.id === sourceId ? 0 : Infinity);
    previous.set(node.id, null);
    unvisited.add(node.id);
  });

  // Main algorithm loop
  while (unvisited.size > 0) {
    // Find node with minimum distance
    let currentNode: string | null = null;
    let minDistance = Infinity;

    unvisited.forEach((nodeId) => {
      const dist = distances.get(nodeId)!;
      if (dist < minDistance) {
        minDistance = dist;
        currentNode = nodeId;
      }
    });

    if (!currentNode || minDistance === Infinity) break;
    if (currentNode === destId) break;

    unvisited.delete(currentNode);

    // Update distances to neighbors
    network.edges.forEach((edge) => {
      if (edge.from === currentNode) {
        const neighbor = edge.to;
        if (unvisited.has(neighbor)) {
          const newDist = distances.get(currentNode!)! + edge.cost;
          if (newDist < distances.get(neighbor)!) {
            distances.set(neighbor, newDist);
            previous.set(neighbor, currentNode);
          }
        }
      }
      if (edge.to === currentNode) {
        const neighbor = edge.from;
        if (unvisited.has(neighbor)) {
          const newDist = distances.get(currentNode!)! + edge.cost;
          if (newDist < distances.get(neighbor)!) {
            distances.set(neighbor, newDist);
            previous.set(neighbor, currentNode);
          }
        }
      }
    });
  }

  // Reconstruct path
  const path: PathSegment[] = [];
  let current = destId;

  while (previous.get(current) !== null) {
    const prev = previous.get(current)!;
    const edge = network.edges.find(
      (e) =>
        (e.from === prev && e.to === current) ||
        (e.to === prev && e.from === current)
    );

    if (edge) {
      const fromNode = network.nodes.find((n) => n.id === prev)!;
      const toNode = network.nodes.find((n) => n.id === current)!;
      path.unshift({ from: fromNode, to: toNode, edge });
    }
    current = prev;
  }

  return path;
}

/**
 * RANDOM NETWORK GENERATOR
 * Creates a connected network with random node positions and edge costs
 * Uses rejection sampling to ensure minimum spacing between nodes
 */
function generateRandomNetwork(nodeCount: number = 7): Network {
  const nodes: NetworkNode[] = [];
  const edges: NetworkEdge[] = [];
  const labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const minDistance = 100; // Minimum distance between nodes

  // Generate nodes with guaranteed spacing using rejection sampling
  for (let i = 0; i < nodeCount; i++) {
    let attempts = 0;
    let validPosition = false;
    let x = 0;
    let y = 0;

    while (!validPosition && attempts < 100) {
      x = 100 + Math.random() * 700;
      y = 80 + Math.random() * 400;
      
      // Check distance from all existing nodes
      validPosition = nodes.every((node) => {
        const dx = node.x - x;
        const dy = node.y - y;
        return Math.sqrt(dx * dx + dy * dy) >= minDistance;
      });
      
      attempts++;
    }

    nodes.push({
      id: labels[i],
      label: labels[i],
      x,
      y,
      type: 'router',
    });
  }

  // Create a spanning tree to ensure connectivity
  for (let i = 1; i < nodes.length; i++) {
    const j = Math.floor(Math.random() * i);
    edges.push({
      from: nodes[i].id,
      to: nodes[j].id,
      cost: Math.floor(Math.random() * 15) + 5,
    });
  }

  // Add random additional edges
  const additionalEdges = Math.floor(Math.random() * 3) + 2;
  for (let i = 0; i < additionalEdges; i++) {
    const from = nodes[Math.floor(Math.random() * nodes.length)];
    const to = nodes[Math.floor(Math.random() * nodes.length)];

    if (from.id !== to.id) {
      const exists = edges.some(
        (e) =>
          (e.from === from.id && e.to === to.id) ||
          (e.to === from.id && e.from === to.id)
      );

      if (!exists) {
        edges.push({
          from: from.id,
          to: to.id,
          cost: Math.floor(Math.random() * 15) + 5,
        });
      }
    }
  }

  return { nodes, edges };
}

/**
 * DEFAULT NETWORK CONFIGURATION
 * A well-structured initial network for demonstration
 */
function getDefaultNetwork(): Network {
  return {
    nodes: [
      { id: 'A', label: 'A', x: 150, y: 250, type: 'router' },
      { id: 'B', label: 'B', x: 300, y: 150, type: 'router' },
      { id: 'C', label: 'C', x: 300, y: 350, type: 'router' },
      { id: 'D', label: 'D', x: 500, y: 100, type: 'router' },
      { id: 'E', label: 'E', x: 500, y: 300, type: 'router' },
      { id: 'F', label: 'F', x: 700, y: 200, type: 'router' },
    ],
    edges: [
      { from: 'A', to: 'B', cost: 7 },
      { from: 'A', to: 'C', cost: 9 },
      { from: 'B', to: 'D', cost: 10 },
      { from: 'B', to: 'C', cost: 10 },
      { from: 'C', to: 'E', cost: 2 },
      { from: 'D', to: 'F', cost: 15 },
      { from: 'D', to: 'E', cost: 6 },
      { from: 'E', to: 'F', cost: 7 },
    ],
  };
}

/**
 * MAIN PACKET ROUTING SIMULATOR COMPONENT
 */
export default function PacketRoutingSimulator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [network, setNetwork] = useState<Network>(getDefaultNetwork());
  const [state, setState] = useState<SimulationState>({
    sourceNodeId: null,
    destinationNodeId: null,
    path: [],
    isAnimating: false,
    isComplete: false,
    message: '',
  });
  const [hoveredNode, setHoveredNode] = useState<NetworkNode | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const animationRef = useRef<number | null>(null);

  /**
   * CANVAS RENDERING ENGINE
   * Draws the network graph with nodes, edges, and animations
   */
  const renderNetwork = useCallback(
    (packetProgress: number = 0) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw edges (links)
      network.edges.forEach((edge) => {
        const fromNode = network.nodes.find((n) => n.id === edge.from);
        const toNode = network.nodes.find((n) => n.id === edge.to);
        if (!fromNode || !toNode) return;

        const isInPath = state.path.some(
          (seg) =>
            (seg.from.id === edge.from && seg.to.id === edge.to) ||
            (seg.from.id === edge.to && seg.to.id === edge.from)
        );

        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        ctx.strokeStyle = isInPath ? '#3b82f6' : '#9ca3af';
        ctx.lineWidth = isInPath ? 4 : 2;
        ctx.stroke();

        // Draw cost label with background
        const midX = (fromNode.x + toNode.x) / 2;
        const midY = (fromNode.y + toNode.y) / 2;
        const costText = edge.cost.toString();

        ctx.font = '600 13px IBM Plex Sans, sans-serif';
        const metrics = ctx.measureText(costText);
        const padding = 4;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.fillRect(
          midX - metrics.width / 2 - padding,
          midY - 8 - padding,
          metrics.width + padding * 2,
          16 + padding * 2
        );

        ctx.strokeStyle = '#d1d5db';
        ctx.lineWidth = 1;
        ctx.strokeRect(
          midX - metrics.width / 2 - padding,
          midY - 8 - padding,
          metrics.width + padding * 2,
          16 + padding * 2
        );

        ctx.fillStyle = '#374151';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(costText, midX, midY);
      });

      // Draw nodes
      network.nodes.forEach((node) => {
        const isSource = node.id === state.sourceNodeId;
        const isDestination = node.id === state.destinationNodeId;
        const isHovered = hoveredNode?.id === node.id;

        // Node circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, isHovered ? 26 : 24, 0, 2 * Math.PI);

        if (isSource) {
          ctx.fillStyle = '#10b981';
        } else if (isDestination) {
          ctx.fillStyle = '#3b82f6';
        } else {
          ctx.fillStyle = '#6b7280';
        }
        ctx.fill();

        ctx.strokeStyle = isHovered ? '#1f2937' : '#374151';
        ctx.lineWidth = isHovered ? 3 : 2;
        ctx.stroke();

        // Node label
        ctx.font = '600 14px IBM Plex Sans, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.label, node.x, node.y);
      });

      // Draw packet animation
      if (state.isAnimating && state.path.length > 0 && packetProgress > 0) {
        const totalSegments = state.path.length;
        const segmentProgress = packetProgress * totalSegments;
        const currentSegmentIndex = Math.floor(segmentProgress);
        const segmentFraction = segmentProgress - currentSegmentIndex;

        if (currentSegmentIndex < state.path.length) {
          const segment = state.path[currentSegmentIndex];
          const x =
            segment.from.x + (segment.to.x - segment.from.x) * segmentFraction;
          const y =
            segment.from.y + (segment.to.y - segment.from.y) * segmentFraction;

          // Packet glow effect
          ctx.beginPath();
          ctx.arc(x, y, 16, 0, 2 * Math.PI);
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, 16);
          gradient.addColorStop(0, 'rgba(249, 115, 22, 0.8)');
          gradient.addColorStop(1, 'rgba(249, 115, 22, 0)');
          ctx.fillStyle = gradient;
          ctx.fill();

          // Packet core
          ctx.beginPath();
          ctx.arc(x, y, 10, 0, 2 * Math.PI);
          ctx.fillStyle = '#f97316';
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }
    },
    [network, state, hoveredNode]
  );

  /**
   * PACKET ANIMATION CONTROLLER
   * Manages the smooth movement of packets along the calculated path
   */
  const animatePacket = useCallback(() => {
    const duration = 2500; // 2.5 seconds total
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      renderNetwork(progress);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Clear animation ref to allow future animations
        animationRef.current = null;
        setState((prev) => ({
          ...prev,
          isAnimating: false,
          isComplete: true,
          message: 'Packet Delivered Successfully! ✓',
        }));
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [renderNetwork]);

  /**
   * SEND PACKET HANDLER
   * Calculates shortest path using Dijkstra's algorithm and triggers animation via state
   */
  const handleSendPacket = () => {
    if (!state.sourceNodeId || !state.destinationNodeId) return;
    if (state.sourceNodeId === state.destinationNodeId) {
      setState((prev) => ({
        ...prev,
        message: 'Source and destination must be different nodes',
        isComplete: false,
      }));
      return;
    }

    // Calculate shortest path
    const path = dijkstra(network, state.sourceNodeId, state.destinationNodeId);

    if (path.length === 0) {
      setState((prev) => ({
        ...prev,
        message: 'No path found between selected nodes',
        isComplete: false,
      }));
      return;
    }

    const totalCost = path.reduce((sum, seg) => sum + seg.edge.cost, 0);

    // Set state to trigger animation via useEffect
    setState((prev) => ({
      ...prev,
      path,
      isAnimating: true,
      isComplete: false,
      message: `Calculating route using Dijkstra's Algorithm... Total cost: ${totalCost}`,
    }));
  };

  /**
   * RANDOM NETWORK GENERATOR HANDLER
   */
  const handleGenerateRandom = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const newNetwork = generateRandomNetwork();
    setNetwork(newNetwork);
    setState({
      sourceNodeId: null,
      destinationNodeId: null,
      path: [],
      isAnimating: false,
      isComplete: false,
      message: 'New network generated. Select source and destination nodes.',
    });
  };

  /**
   * MOUSE INTERACTION HANDLERS
   * Provides hover tooltips and interactive feedback
   */
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMousePos({ x: e.clientX, y: e.clientY });

    const hovered = network.nodes.find((node) => {
      const dx = node.x - x;
      const dy = node.y - y;
      return Math.sqrt(dx * dx + dy * dy) <= 24;
    });

    setHoveredNode(hovered || null);
  };

  const handleCanvasMouseLeave = () => {
    setHoveredNode(null);
  };

  // Re-render when network or state changes
  useEffect(() => {
    renderNetwork();
  }, [renderNetwork]);

  // Start animation when state changes to isAnimating=true
  useEffect(() => {
    if (state.isAnimating && state.path.length > 0) {
      // Cancel any existing animation before starting a new one
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }

      // Small delay for visual feedback before animation starts
      const timeoutId = setTimeout(() => {
        animatePacket();
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [state.isAnimating, state.path, animatePacket]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="h-16 border-b bg-card flex items-center px-6">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <NetworkIcon className="w-7 h-7 text-primary" data-testid="icon-network" />
            <h1 className="text-2xl font-semibold text-foreground" data-testid="text-title">
              Packet Routing Simulator
            </h1>
          </div>
          <Badge variant="secondary" className="text-xs" data-testid="badge-algorithm">
            <Info className="w-3 h-3 mr-1" />
            Dijkstra's Algorithm
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Control Panel */}
          <Card className="p-6">
            <div className="flex flex-wrap items-end gap-4">
              {/* Source Node Selection */}
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium text-foreground mb-2 block" htmlFor="source-select">
                  Source Node
                </label>
                <Select
                  value={state.sourceNodeId || ''}
                  onValueChange={(value) =>
                    setState((prev) => ({ ...prev, sourceNodeId: value }))
                  }
                  disabled={state.isAnimating}
                >
                  <SelectTrigger id="source-select" data-testid="select-source">
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    {network.nodes.map((node) => (
                      <SelectItem key={node.id} value={node.id} data-testid={`option-source-${node.id}`}>
                        Node {node.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Destination Node Selection */}
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium text-foreground mb-2 block" htmlFor="dest-select">
                  Destination Node
                </label>
                <Select
                  value={state.destinationNodeId || ''}
                  onValueChange={(value) =>
                    setState((prev) => ({ ...prev, destinationNodeId: value }))
                  }
                  disabled={state.isAnimating}
                >
                  <SelectTrigger id="dest-select" data-testid="select-destination">
                    <SelectValue placeholder="Select destination" />
                  </SelectTrigger>
                  <SelectContent>
                    {network.nodes.map((node) => (
                      <SelectItem key={node.id} value={node.id} data-testid={`option-destination-${node.id}`}>
                        Node {node.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={handleSendPacket}
                  disabled={!state.sourceNodeId || !state.destinationNodeId || state.isAnimating}
                  className="gap-2"
                  data-testid="button-send-packet"
                >
                  <Play className="w-4 h-4" />
                  Send Packet
                </Button>
                <Button
                  variant="outline"
                  onClick={handleGenerateRandom}
                  disabled={state.isAnimating}
                  className="gap-2"
                  data-testid="button-generate-network"
                >
                  <Shuffle className="w-4 h-4" />
                  Random Network
                </Button>
              </div>
            </div>
          </Card>

          {/* Canvas Visualization */}
          <Card className="p-6 relative">
            <canvas
              ref={canvasRef}
              width={900}
              height={550}
              className="w-full border-2 rounded-lg bg-white dark:bg-card"
              onMouseMove={handleCanvasMouseMove}
              onMouseLeave={handleCanvasMouseLeave}
              data-testid="canvas-network"
            />

            {/* Node Hover Tooltip */}
            {hoveredNode && (
              <div
                className="fixed pointer-events-none z-50 bg-popover text-popover-foreground px-3 py-2 rounded-md shadow-lg text-sm"
                style={{
                  left: mousePos.x + 15,
                  top: mousePos.y + 15,
                }}
                data-testid={`tooltip-node-${hoveredNode.id}`}
              >
                <div className="font-medium">Node: {hoveredNode.label}</div>
                <div className="text-xs text-muted-foreground">
                  {hoveredNode.id === state.sourceNodeId && 'Source'}
                  {hoveredNode.id === state.destinationNodeId && 'Destination'}
                  {hoveredNode.id !== state.sourceNodeId &&
                    hoveredNode.id !== state.destinationNodeId &&
                    'Router'}
                </div>
              </div>
            )}

            {/* Color Legend */}
            <div className="absolute top-8 right-8 bg-card border rounded-md p-3 space-y-2" data-testid="legend">
              <div className="text-xs font-medium text-foreground mb-2">Legend</div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#10b981]"></div>
                <span className="text-xs text-muted-foreground">Source</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#3b82f6]"></div>
                <span className="text-xs text-muted-foreground">Destination</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#6b7280]"></div>
                <span className="text-xs text-muted-foreground">Router</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#f97316]"></div>
                <span className="text-xs text-muted-foreground">Packet</span>
              </div>
            </div>
          </Card>

          {/* Status Footer */}
          {state.message && (
            <div
              className={`p-4 rounded-md text-sm font-medium animate-in fade-in ${
                state.isComplete
                  ? 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400'
                  : 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400'
              }`}
              data-testid="message-status"
            >
              {state.message}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
