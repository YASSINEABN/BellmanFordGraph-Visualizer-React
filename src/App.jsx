import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle, Play, Pause, RotateCcw, ChevronRight, Save, Upload } from 'lucide-react';
import { FileDown } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const getNodePosition = (index, total) => {
  const adjustedRadius = Math.min(150, Math.max(100, 400 / total));
  const angle = (2 * Math.PI * index) / total;
  const centerOffset = total > 6 ? 200 : 150;
  
  const x = adjustedRadius * Math.cos(angle) + centerOffset;
  const y = adjustedRadius * Math.sin(angle) + centerOffset;
  return { x, y };
};

const calculateEdgePoints = (start, end, nodeRadius = 25) => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const unitX = dx / distance;
  const unitY = dy / distance;

  return {
    x1: start.x + unitX * nodeRadius,
    y1: start.y + unitY * nodeRadius,
    x2: end.x - unitX * nodeRadius,
    y2: end.y - unitY * nodeRadius,
  };
};

const formatDistance = (distance) => {
  return distance === Number.MAX_SAFE_INTEGER ? '∞' : distance;
};

const DistanceArray = ({ distances, sourceNode, activeNodes }) => {
  return (
    <div className="w-full p-4 bg-gray-50 rounded-lg shadow-sm">
      <h3 className="text-sm font-semibold mb-3">Shortest Distances from Source Node {sourceNode}</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {distances.map((distance, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg ${
              index === sourceNode
                ? 'bg-green-100 border-green-300'
                : activeNodes.has(index)
                ? 'bg-yellow-100 border-yellow-300'
                : 'bg-white'
            } border shadow-sm transition-colors duration-300`}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-600">Node {index}:</span>
              <span className={`font-bold ${
                distance === Number.MAX_SAFE_INTEGER 
                  ? 'text-gray-400' 
                  : 'text-blue-600'
              }`}>
                {formatDistance(distance)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ControlPanel = ({
  isRunning,
  onToggleRunning,
  onReset,
  onSave,
  onLoad,
  speed,
  onSpeedChange,
  negativeLoop,
  onAddNode,
  maxNodes,
  newEdge,
  onNewEdgeChange,
  onAddEdge,
  onGeneratePDF,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 justify-between items-center bg-white p-4 rounded-lg shadow-sm">
        <div className="space-x-6 space-y-2">
          <button
            onClick={onAddNode}
            className="px-4 py-2 bg-blue-600 mx-6 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            disabled={maxNodes}
          >
            Add Node
          </button>
          <button
            onClick={onGeneratePDF}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            Generate Pdf
          </button>
          <button
            onClick={onToggleRunning}
            className={`px-4 py-2 rounded-md text-white flex items-center gap-2 
              ${isRunning ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'}
              ${negativeLoop ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={negativeLoop}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isRunning ? 'Pause' : 'Start'}</span>
          </button>
          <button
            onClick={onReset}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-6 h-4" />
            <span>Reset</span>
          </button>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={speed}
            onChange={onSpeedChange}
            className="px-3 py-2 border rounded-md bg-white"
          >
            <option value={2000}>Slow</option>
            <option value={1000}>Normal</option>
            <option value={500}>Fast</option>
          </select>
          <button 
            onClick={onSave}
            className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save</span>
          </button>
          <label className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors flex items-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>Load</span>
            <input type="file" accept=".json" onChange={onLoad} className="hidden" />
          </label>
        </div>
      </div>

      <div className="flex gap-3 bg-white p-4 rounded-lg shadow-sm">
        <input
          type="number"
          placeholder="From"
          className="w-24 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
          value={newEdge.from}
          onChange={(e) => onNewEdgeChange({ ...newEdge, from: e.target.value })}
          min="0"
        />
        <input
          type="number"
          placeholder="To"
          className="w-24 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
          value={newEdge.to}
          onChange={(e) => onNewEdgeChange({ ...newEdge, to: e.target.value })}
          min="0"
        />
        <input
          type="number"
          placeholder="Weight"
          className="w-28 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
          value={newEdge.weight}
          onChange={(e) => onNewEdgeChange({ ...newEdge, weight: e.target.value })}
        />
        <button
          onClick={onAddEdge}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Add Edge
        </button>
      </div>
    </div>
  );
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
  const [speed, setSpeed] = useState(1000);
  const [distanceHistory, setDistanceHistory] = useState([]);
  const [currentAction, setCurrentAction] = useState('');
  const [edgePaths, setEdgePaths] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [negativeLoop, setNegativeLoop] = useState(false);
  const [draggingNode, setDraggingNode] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [removeButtonVisible, setRemoveButtonVisible] = useState(false);


  const updateEdgePaths = useCallback(() => {
    const paths = edges.map(edge => {
      const start = nodes[edge.from];
      const end = nodes[edge.to];
      if (!start || !end) return null;
      return {
        ...edge,
        ...calculateEdgePoints(start, end),
      };
    }).filter(Boolean);
    setEdgePaths(paths);
  }, [edges, nodes]);

  useEffect(() => {
    updateEdgePaths();
  }, [nodes, edges, updateEdgePaths]);

  useEffect(() => {
    if (nodes.length > 0) {
      const initial = new Array(nodes.length).fill(Number.MAX_SAFE_INTEGER);
      initial[sourceNode] = 0;
      setDistances(initial);
      setDistanceHistory([initial]);
    }
  }, [nodes, sourceNode]);

  const processNextEdge = useCallback(() => {
    if (edges.length === 0) return;

    const newDistances = [...distances];
    let edgeIndex = currentStep === -1 ? 0 : (currentStep + 1) % edges.length;
    
    if (edgeIndex === 0 && currentStep !== -1) {
      setIteration(prev => prev + 1);
    }

    const edge = edges[edgeIndex];
    setCurrentEdge(edgeIndex);
    setActiveNodes(new Set([edge.from, edge.to]));

    if (newDistances[edge.from] !== Number.MAX_SAFE_INTEGER &&
        newDistances[edge.from] + edge.weight < newDistances[edge.to]) {
      
      if (iteration === nodes.length - 1) {
        setNegativeLoop(true);
        setIsRunning(false);
        setMessage('Negative cycle detected!');
        return;
      }

      newDistances[edge.to] = newDistances[edge.from] + edge.weight;
      setDistances(newDistances);
      setDistanceHistory(prev => [...prev, [...newDistances]]);
      setCurrentAction(`Updated distance to node ${edge.to}: ${newDistances[edge.to]}`);
    } else {
      setCurrentAction(`No update needed for edge ${edge.from} → ${edge.to}`);
    }
    
    setCurrentStep(edgeIndex);
  }, [currentStep, edges, distances, iteration, nodes.length]);
  useEffect(() => {
    let timer;
    if (isRunning && edges.length > 0) {
      timer = setTimeout(() => {
        if (iteration < nodes.length) {
          processNextEdge();
        } else {
          setIsRunning(false);
          setMessage('Algorithm completed!');
          setActiveNodes(new Set());
          setCurrentEdge(null);
        }
      }, speed);
    }
    return () => clearTimeout(timer);
  }, [isRunning, processNextEdge, edges.length, iteration, nodes.length, speed]);

  const generatePDFReport = () => {
    const pdf = new jsPDF();
    
    pdf.setFontSize(16);
    pdf.text('Bellman-Ford Algorithm Visualization Report', 20, 20);
    
    pdf.setFontSize(12);
    pdf.text(`Number of Nodes: ${nodes.length}`, 20, 35);
    pdf.text(`Source Node: ${sourceNode}`, 20, 45);
    pdf.text(`Number of Edges: ${edges.length}`, 20, 55);
    
    pdf.setFontSize(14);
    pdf.text('Edge Information:', 20, 70);
    
    const edgesData = edges.map(edge => [
      edge.from,
      edge.to,
      edge.weight,
    ]);
    
    pdf.autoTable({
      startY: 75,
      head: [['From Node', 'To Node', 'Weight']],
      body: edgesData,
      theme: 'striped',
      headStyles: { fillColor: [66, 135, 245] },
    });
    
    pdf.setFontSize(14);
    pdf.text('Final Shortest Distances:', 20, pdf.autoTable.previous.finalY + 20);
    
    const distanceData = distances.map((distance, index) => [
      index,
      distance === Number.MAX_SAFE_INTEGER ? '∞' : distance,
    ]);
    
    pdf.autoTable({
      startY: pdf.autoTable.previous.finalY + 25,
      head: [['Node', 'Shortest Distance from Source']],
      body: distanceData,
      theme: 'striped',
      headStyles: { fillColor: [66, 135, 245] },
    });
    

    pdf.setFontSize(14);
    pdf.text('Algorithm Steps:', 20, pdf.autoTable.previous.finalY + 20);
    
    const stepsData = distanceHistory.map((dist, step) => [
      `Step ${step + 1}`,
      dist.map((d, i) => `Node ${i}: ${d === Number.MAX_SAFE_INTEGER ? '∞' : d}`).join(', '),
    ]);
    
    pdf.autoTable({
      startY: pdf.autoTable.previous.finalY + 25,
      head: [['Step', 'Distance Values']],
      body: stepsData,
      theme: 'striped',
      headStyles: { fillColor: [66, 135, 245] },
    });
    
    if (negativeLoop) {
      pdf.setTextColor(255, 0, 0);
      pdf.text('⚠️ Negative Cycle Detected in the Graph!', 20, pdf.autoTable.previous.finalY + 20);
      pdf.setTextColor(0, 0, 0);
    }
    
    pdf.setFontSize(10);
    pdf.text(`Generated on: ${new Date().toLocaleString()}`, 20, pdf.internal.pageSize.height - 10);
    
    pdf.save('bellman-ford-report.pdf');
  };
  const addEdge = () => {
    const { from, to, weight } = newEdge;
    if (!from || !to || !weight) {
      setMessage('Please fill all edge fields');
      return;
    }

    const fromNum = parseInt(from);
    const toNum = parseInt(to);
    const weightNum = parseInt(weight);

    if (fromNum >= nodes.length || toNum >= nodes.length || fromNum < 0 || toNum < 0) {
      setMessage('Invalid node indices');
      return;
    }

    if (edges.some(e => e.from === fromNum && e.to === toNum)) {
      setMessage('Edge already exists');
      return;
    }

    setEdges(prev => [...prev, { from: fromNum, to: toNum, weight: weightNum }]);
    setNewEdge({ from: '', to: '', weight: '' });
    setMessage('Edge added successfully');
  };

  const reset = () => {
    setIsRunning(false);
    setCurrentStep(-1);
    setIteration(0);
    setCurrentEdge(null);
    setActiveNodes(new Set());
    setNegativeLoop(false);
    const initial = new Array(nodes.length).fill(Number.MAX_SAFE_INTEGER);
    initial[sourceNode] = 0;
    setDistances(initial);
    setDistanceHistory([initial]);
    setMessage('');
    setCurrentAction('');
  };

  const handleinput = (index, e) => {
    
    console.log(index);
  };

  const handleMouseDown = (index, e) => {
    const timer = setTimeout(() => {
      setDraggingNode(index);
      setIsDragging(true);
      setRemoveButtonVisible(true);
    }, 500); // Long click duration: 500ms
    e.target.longClickTimer = timer; // Attach timer to the event target
  };
  
  const handleMouseUp = (e) => {
    clearTimeout(e.target.longClickTimer); // Clear the timer if released early
    if (isDragging) {
      setIsDragging(false);
      setRemoveButtonVisible(false);
      setDraggingNode(null);
    }
  };
  
  const handleMouseMove = (e) => {
    if (isDragging && draggingNode !== null) {
      const svg = e.target.closest("svg");
      const rect = svg.getBoundingClientRect();
      const newNodes = [...nodes];
      newNodes[draggingNode] = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      setNodes(newNodes);
    }
  };

  const saveState = () => {
    const state = {
      nodes, edges, distances, currentStep, iteration,
      sourceNode, distanceHistory, currentAction
    };
    const blob = new Blob([JSON.stringify(state)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bellman-ford-state.json';
    link.click();
    URL.revokeObjectURL(url);
    setMessage('State saved successfully!');
  };

  const loadState = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const state = JSON.parse(e.target.result);
        setNodes(state.nodes);
        setEdges(state.edges);
        setDistances(state.distances);
        setCurrentStep(state.currentStep);
        setIteration(state.iteration);
        setSourceNode(state.sourceNode);
        setDistanceHistory(state.distanceHistory);
        setCurrentAction(state.currentAction);
        setMessage('State loaded successfully!');
      } catch (error) {
        setMessage('Error loading state file');
      }
    };
    reader.readAsText(file);
  };
  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-100 rounded-xl shadow-lg space-y-6">
      <ControlPanel 
        isRunning={isRunning}
        onToggleRunning={() => setIsRunning(!isRunning)}
        onReset={reset}
        onSave={saveState}
        onLoad={loadState}
        speed={speed}
        onSpeedChange={(e) => setSpeed(Number(e.target.value))}
        negativeLoop={negativeLoop}
        onAddNode={() => {
          if (nodes.length < 12) {
            const newNode = {
              id: nodes.length,
              ...getNodePosition(nodes.length, nodes.length + 1)
            };
            setNodes([...nodes, newNode]);
          }
        }}
        maxNodes={nodes.length >= 12}
        newEdge={newEdge}
        onNewEdgeChange={setNewEdge}
        onAddEdge={addEdge}
        onGeneratePDF={generatePDFReport}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="relative bg-white p-6 rounded-xl shadow-md">
          <svg width="100%" height="600" className="max-w-full" viewBox="0 0 400 400"   onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}>
            
              
            <defs >
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#4B5563" />
              </marker>
            </defs>
            
            {edgePaths.map((edge, index) => (
              <g key={`edge-${index}`}>
                <line
                  x1={edge.x1}
                  y1={edge.y1}
                  x2={edge.x2}
                  y2={edge.y2}
                  className={`${
                    currentEdge === index 
                      ? 'stroke-blue-500 stroke-2' 
                      : 'stroke-gray-400'
                  } transition-colors duration-300`}
                  strokeWidth={currentEdge === index ? 3 : 2}
                  markerEnd="url(#arrowhead)"
                
                />
                <text
                  
                  x={(edge.x1 + edge.x2) / 2}
                  y={(edge.y1 + edge.y2) / 2}
                  dy="-5"
                  textAnchor="middle"
                  className={`text-sm ${
                    currentEdge === index ? 'fill-blue-600' : 'fill-gray-600'
                  } font-medium`}
                >
                  {edge.weight}
                </text>
              </g>
            ))}
            
            {nodes.map((node, index) => (
              <g 
                key={`node-${index}`}
                className="transition-all duration-300 cursor-pointer"
                onClick={() => {
                  if (!isRunning) {
                    setSourceNode(index);
                    reset();
                  }
                }}
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={25}
                  className={`${
                    activeNodes.has(index)
                      ? 'fill-yellow-400'
                      : index === sourceNode
                      ? 'fill-green-500'
                      : 'fill-blue-500'
                  } transition-colors duration-300`}
                  onMouseDown={(e) => handleMouseDown(index, e)}
                  stroke={selectedNode === index ? '#2563EB' : 'none'}
                  strokeWidth="3"
                />
                <text
                  x={node.x}
                  y={node.y}
                  textAnchor="middle"
                  dy="0.3em"
                  className="text-white font-bold"
                >
                  {index}
                </text>
                <text
                  x={node.x}
                  y={node.y + 40}
                  textAnchor="middle"
                  className="text-sm fill-gray-600 font-medium"
                >
                  {formatDistance(distances[index])}
                </text>
              </g>
            ))}
          </svg>
        </div>

        <div className="space-y-6">
          <DistanceArray 
            distances={distances}
            sourceNode={sourceNode}
            activeNodes={activeNodes}
          />

          <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Algorithm Status:</span>
              <span className={`text-sm ${isRunning ? 'text-green-500' : 'text-gray-500'}`}>
                {isRunning ? 'Running' : 'Paused'}
              </span>
            </div>

            {message && (
              <div className={`flex items-center gap-2 text-sm p-3 rounded-lg ${
                negativeLoop ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
              }`}>
                <AlertCircle className="w-4 h-4" />
                <span>{message}</span>
              </div>
            )}

            {currentAction && (
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                {currentAction}
              </div>
            )}

            {iteration > 0 && (
              <div className="text-sm bg-gray-50 p-3 rounded-lg">
                <span className="font-semibold">Current Iteration:</span>
                <span className="ml-2">{iteration} of {nodes.length - 1}</span>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-sm font-semibold mb-3">Instructions</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Click "Add Node" to add new nodes (max 12)</li>
              <li>• Click any node to set it as the source node</li>
              <li>• Add edges between nodes using the form above</li>
              <li>• Use the speed dropdown to control animation speed</li>
              <li>• Save/Load buttons preserve your graph state</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BellmanFordVisualizer;