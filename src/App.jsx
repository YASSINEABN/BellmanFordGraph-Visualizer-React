import React, { useState, useEffect } from 'react';
import { AlertCircle, Play, Pause, RotateCcw, FastForward, ChevronRight } from 'lucide-react';

// Helper to generate positions in a circle
const getNodePosition = (index, total, radius = 150) => {
  const angle = (2 * Math.PI * index) / total;
  return {
    x: radius * Math.cos(angle) + radius + 50,
    y: radius * Math.sin(angle) + radius + 50,
  };
};

const BellmanFordVisualizer = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [distances, setDistances] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [iteration, setIteration] = useState(0);
  const [currentEdge, setCurrentEdge] = useState(null);
  const [sourceNode, setSourceNode] = useState(0);
  const [newEdge, setNewEdge] = useState({ from: '', to: '', weight: '' });
  const [message, setMessage] = useState('');
  const [activeNodes, setActiveNodes] = useState(new Set());
  const [speed, setSpeed] = useState(1000); // Animation speed in ms
  const [distanceHistory, setDistanceHistory] = useState([]);
  const [currentAction, setCurrentAction] = useState('');

  // Initialize distances
  useEffect(() => {
    if (nodes.length > 0) {
      const initial = new Array(nodes.length).fill(Number.MAX_SAFE_INTEGER);
      setDistances(initial);
      setDistanceHistory([initial]);
    }
  }, [nodes]);

  // Animation step effect
  useEffect(() => {
    let timer;
    if (isRunning) {
      if (currentStep === -1) {
        // Initialize source node
        const newDistances = [...distances];
        newDistances[sourceNode] = 0;
        setDistances(newDistances);
        setDistanceHistory(prev => [...prev, newDistances]);
        setActiveNodes(new Set([sourceNode]));
        setCurrentStep(0);
        setCurrentAction('Initializing source node distance to 0');
      } else {
        timer = setTimeout(() => {
          if (iteration < nodes.length - 1) {
            processNextEdge();
          } else {
            setIsRunning(false);
            setMessage('Algorithm completed!');
            setActiveNodes(new Set());
            setCurrentEdge(null);
            setCurrentAction('Algorithm completed!');
          }
        }, speed);
      }
    }
    return () => clearTimeout(timer);
  }, [isRunning, currentStep, iteration, edges, distances]);

  const processNextEdge = () => {
    const newDistances = [...distances];
    let updated = false;
    let edgeIndex = currentStep % edges.length;

    if (edgeIndex === 0 && currentStep !== 0) {
      setIteration(prev => prev + 1);
    }

    const edge = edges[edgeIndex];
    setCurrentEdge(edgeIndex);
    setActiveNodes(new Set([edge.from, edge.to]));

    if (newDistances[edge.from] !== Number.MAX_SAFE_INTEGER &&
        newDistances[edge.from] + edge.weight < newDistances[edge.to]) {
      newDistances[edge.to] = newDistances[edge.from] + edge.weight;
      updated = true;
      setCurrentAction(`Relaxing edge ${edge.from} → ${edge.to} with weight ${edge.weight}`);
    } else {
      setCurrentAction(`Checking edge ${edge.from} → ${edge.to} (no update needed)`);
    }

    if (updated) {
      setDistances(newDistances);
      setDistanceHistory(prev => [...prev, newDistances]);
    }
    setCurrentStep(prev => prev + 1);
  };

  // Add new node
  const addNode = () => {
    if (nodes.length < 8) {
      const newNodeIndex = nodes.length;
      const positions = getNodePosition(newNodeIndex, nodes.length + 1);
      setNodes([...nodes, { id: newNodeIndex, ...positions }]);
    }
  };

  // Add new edge
  const addEdge = () => {
    const { from, to, weight } = newEdge;
    if (from === '' || to === '' || weight === '') {
      setMessage('Please fill all edge fields');
      return;
    }
    
    const fromNum = parseInt(from);
    const toNum = parseInt(to);
    const weightNum = parseInt(weight);
    
    if (fromNum >= nodes.length || toNum >= nodes.length) {
      setMessage('Invalid node indices');
      return;
    }
    
    setEdges([...edges, { from: fromNum, to: toNum, weight: weightNum }]);
    setNewEdge({ from: '', to: '', weight: '' });
  };

  // Reset visualization
  const reset = () => {
    setIsRunning(false);
    setCurrentStep(-1);
    setIteration(0);
    setCurrentEdge(null);
    setActiveNodes(new Set());
    const initial = new Array(nodes.length).fill(Number.MAX_SAFE_INTEGER);
    setDistances(initial);
    setDistanceHistory([initial]);
    setMessage('');
    setCurrentAction('');
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="mb-6 space-y-4">
        <div className="flex space-x-4">
          <button
            onClick={addNode}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            disabled={nodes.length >= 8}
          >
            Add Node
          </button>
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="From"
              className="w-20 px-2 border rounded"
              value={newEdge.from}
              onChange={(e) => setNewEdge({ ...newEdge, from: e.target.value })}
            />
            <input
              type="number"
              placeholder="To"
              className="w-20 px-2 border rounded"
              value={newEdge.to}
              onChange={(e) => setNewEdge({ ...newEdge, to: e.target.value })}
            />
            <input
              type="number"
              placeholder="Weight"
              className="w-24 px-2 border rounded"
              value={newEdge.weight}
              onChange={(e) => setNewEdge({ ...newEdge, weight: e.target.value })}
            />
            <button
              onClick={addEdge}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Add Edge
            </button>
          </div>
        </div>
        
        <div className="flex space-x-4 items-center">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors flex items-center space-x-2"
            disabled={iteration >= nodes.length - 1}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isRunning ? 'Running...' : 'Start'}</span>
          </button>
          <button
            onClick={reset}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="px-3 py-2 border rounded"
          >
            <option value={2000}>Slow</option>
            <option value={1000}>Normal</option>
            <option value={500}>Fast</option>
          </select>
        </div>

        {message && (
          <div className="flex items-center space-x-2 text-amber-600">
            <AlertCircle className="w-4 h-4" />
            <span>{message}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="border rounded-lg p-4 bg-white">
          <h3 className="text-lg font-semibold mb-4">Graph Visualization</h3>
          <svg width="400" height="400" className="mx-auto">
            {/* Draw edges */}
            {edges.map((edge, index) => {
              const start = nodes[edge.from];
              const end = nodes[edge.to];
              return (
                <g key={`edge-${index}`}>
                  <line
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    className={`transition-all duration-300 ${
                      currentEdge === index 
                        ? 'stroke-blue-500 stroke-2' 
                        : 'stroke-black stroke-1'
                    }`}
                  />
                  <text
                    x={(start.x + end.x) / 2}
                    y={(start.y + end.y) / 2}
                    textAnchor="middle"
                    fill="black"
                    className="text-sm"
                  >
                    {edge.weight}
                  </text>
                </g>
              );
            })}
            
            {/* Draw nodes */}
            {nodes.map((node, index) => (
              <g key={`node-${index}`}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="20"
                  className={`transition-all duration-300 ${
                    activeNodes.has(index)
                      ? 'fill-yellow-400'
                      : index === sourceNode && currentStep >= 0
                      ? 'fill-green-500'
                      : 'fill-white'
                  } stroke-black stroke-1`}
                />
                <text
                  x={node.x}
                  y={node.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-sm font-bold"
                >
                  {index}
                </text>
                <text
                  x={node.x}
                  y={node.y + 30}
                  textAnchor="middle"
                  className="text-xs transition-all duration-300"
                >
                  {distances[index] === Number.MAX_SAFE_INTEGER ? '∞' : distances[index]}
                </text>
              </g>
            ))}
          </svg>
        </div>

        <div className="border rounded-lg p-4 bg-white">
          <h3 className="text-lg font-semibold mb-4">Algorithm Progress</h3>
          <div className="space-y-4">
            <div className="bg-gray-100 p-3 rounded">
              <p className="font-medium">Current Action:</p>
              <p className="text-blue-600">{currentAction}</p>
            </div>
            
            <div className="space-y-2">
              <p className="font-medium">Distance Array History:</p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {distanceHistory.map((dist, idx) => (
                  <div 
                    key={idx}
                    className={`flex items-center space-x-2 p-2 rounded ${
                      idx === distanceHistory.length - 1 ? 'bg-yellow-100' : 'bg-gray-50'
                    }`}
                  >
                    <ChevronRight className="w-4 h-4" />
                    <div className="flex space-x-4">
                      {dist.map((value, i) => (
                        <span
                          key={i}
                          className={`px-3 py-1 rounded ${
                            value === Number.MAX_SAFE_INTEGER
                              ? 'bg-gray-200'
                              : 'bg-blue-100'
                          }`}
                        >
                          {value === Number.MAX_SAFE_INTEGER ? '∞' : value}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-100 p-3 rounded">
              <p className="font-medium">Progress:</p>
              <p>Iteration: {iteration + 1} of {nodes.length - 1}</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${(iteration / (nodes.length - 1)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BellmanFordVisualizer;