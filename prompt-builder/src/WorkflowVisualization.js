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
  const fileNodes = {};

  steps.forEach((step, index) => {
    // Erstelle die Nodes für die Schritte
    nodes.push({
      id: `step-${index}`,
      data: { label: step },
      position: { x: 200 * index, y: 100 },
    });

    // Prüfe, ob der Schritt den Output-Symbol 📄 enthält
    if (step.includes('📄') && index > 0) {
      edges.push({
        id: `output-edge-${index}`,
        source: `step-${index - 1}`,
        target: `step-${index}`,
        type: 'smoothstep',
        animated: true,  // Animierte Kante für den Output
      });
    }

    // Prüfe, ob der Schritt das Dateisymbol 🗄️ enthält
    if (step.includes('🗄️')) {
      const fileName = uploadedFiles.length > 0 ? uploadedFiles[0].name : `file-${index}`;
      
      // Erstelle eine separate Node für die Datei, wenn sie noch nicht existiert
      if (!fileNodes[fileName]) {
        nodes.push({
          id: `file-${fileName}`,
          data: { label: `🗄️ ${fileName}` },
          position: { x: 200 * index, y: 250 },  // Datei-Node etwas tiefer positioniert
        });
        fileNodes[fileName] = `file-${fileName}`;
      }
      
      // Füge eine Edge von der Datei zur aktuellen Node hinzu
      edges.push({
        id: `file-edge-${index}`,
        source: fileNodes[fileName],
        target: `step-${index}`,
        type: 'smoothstep',
      });
    }
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
