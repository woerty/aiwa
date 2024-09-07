import React, { useMemo } from 'react';
import ReactFlow, { MiniMap, Controls, Background } from 'reactflow';
import 'reactflow/dist/style.css';

// Funktion zur Umwandlung von Workflow-Schritten in React Flow Nodes und Edges
const nodeWidth = 150;
const nodeHeight = 50;

// Funktion zum Umwandeln von Workflow-Schritten in Nodes und Edges
const convertStepsToFlowElements = (steps, uploadedFiles) => {
    const nodes = [];
    const edges = [];
    
    steps.forEach((step, index) => {
      // Erstelle die Nodes für die Schritte
      nodes.push({
        id: `step-${index}`,
        data: { label: step.text },
        position: { x: 200 * index, y: 100 },
      });
  
      // Füge die Verbindungen (Edges) basierend auf den Inputs hinzu
      step.inputs.forEach((inputId) => {
        edges.push({
          id: `edge-${inputId}-${index}`,
          source: inputId,  // Input kommt entweder von einer Datei oder einem Output
          target: `step-${index}`,
          type: 'smoothstep',
        });
      });
    });
  
    return { nodes, edges };
  };
  

const WorkflowVisualization = ({ steps, uploadedFiles }) => {
    const { nodes, edges } = useMemo(() => convertStepsToFlowElements(steps, uploadedFiles), [steps, uploadedFiles]);
  
    return (
      <div style={{ height: '500px', width: '1000px' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          attributionPosition="top-right"
        >
          <MiniMap />
          <Controls />
          <Background color="#aaa" gap={16} />
        </ReactFlow>
      </div>
    );
  };
  

export default WorkflowVisualization;
