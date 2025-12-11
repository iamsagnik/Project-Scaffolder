// flowPreview.js — paste/rewrite entire file
console.log("FLOW PREVIEW JS LOADED");
const vscode = acquireVsCodeApi();

window.addEventListener("load", () => {
  if (typeof vscode !== "undefined") {
    vscode.postMessage({ type: "ready" });
  } else {
    console.warn("VSCode API not available in webview.");
  }
});

// state
let graphData = null;
let functions = [];
let currentIndex = 0;
let initialTransform = null;

// layout constants (tweak VIEW_PADDING to change border size)
const MIN_SCALE = 0.5;
const MAX_SCALE = 2.5;
const VIEW_PADDING = 80; // px padding around graph that user cannot pan past

// d3 & svg setup
const svg = d3.select("#flowChart");
const inner = svg.append("g");

// zoom handler (uses padded bounding box for clamping)
const zoom = d3.zoom()
  .scaleExtent([MIN_SCALE, MAX_SCALE])
  .on("zoom", (event) => {
    const t = event.transform;

    // viewport
    const svgW = svg.node().clientWidth || parseInt(svg.style("width")) || 800;
    const svgH = svg.node().clientHeight || parseInt(svg.style("height")) || 600;

    // guard: inner may not have been rendered yet
    const innerNode = inner.node();
    if (!innerNode) return;

    // real bbox of graph content
    const bbox = innerNode.getBBox();
    const rawX = bbox.x;
    const rawY = bbox.y;
    const rawW = Math.max(1, bbox.width);
    const rawH = Math.max(1, bbox.height);

    // padded box in graph coordinates
    const paddedX = rawX - VIEW_PADDING;
    const paddedY = rawY - VIEW_PADDING;
    const paddedW = rawW + VIEW_PADDING * 2;
    const paddedH = rawH + VIEW_PADDING * 2;

    // scaled padded box
    const scaledPaddedX = paddedX * t.k;
    const scaledPaddedY = paddedY * t.k;
    const scaledPaddedW = paddedW * t.k;
    const scaledPaddedH = paddedH * t.k;

    // boundaries so padded box stays visible in viewport
    // left-most translation (minX) allows right edge = svgW  => tx = svgW - (scaledPaddedX + scaledPaddedW)
    // right-most translation (maxX) allows left edge = 0     => tx = -scaledPaddedX
    const minX = svgW - (scaledPaddedX + scaledPaddedW);
    const maxX = -scaledPaddedX;

    const minY = svgH - (scaledPaddedY + scaledPaddedH);
    const maxY = -scaledPaddedY;

    // clamp translation
    let clampedX = t.x;
    let clampedY = t.y;

    // if padded box smaller than viewport, center it inside viewport instead
    if (scaledPaddedW <= svgW) {
      clampedX = (svgW - scaledPaddedW) / 2 - scaledPaddedX;
    } else {
      clampedX = Math.max(minX, Math.min(t.x, maxX));
    }

    if (scaledPaddedH <= svgH) {
      clampedY = (svgH - scaledPaddedH) / 2 - scaledPaddedY;
    } else {
      clampedY = Math.max(minY, Math.min(t.y, maxY));
    }

    const clamped = d3.zoomIdentity.translate(clampedX, clampedY).scale(t.k);

    // apply transform to inner and keep d3 internal state
    inner.attr("transform", clamped);
    svg.property("__zoom", clamped);
  });

// attach zoom once
svg.call(zoom);

// UI elements
const functionSelect = document.getElementById("functionSelect");

window.addEventListener("message", (event) => {
  const msg = event.data;

  if (msg.type === "graphData") {
    graphData = msg.graph;
    loadFunctions(graphData);
    renderFunction(0);
  }

  if (msg.type === "switchFunction") {
    const idx = functions.findIndex(f => f.fullName === msg.targetFullName);
    if (idx >= 0) {
      functionSelect.value = idx;
      renderFunction(idx);
    }
  }
});


function loadFunctions(graph) {
  functions = [];

  // Add real functions
  for (const fn of graph.functions || []) {
    functions.push(fn);
  }

  // Build call graph overview node set
  if (graph.functions && graph.functions.length > 0) {
    const callNodes = [];
    const callEdges = [];

    for (const fn of graph.functions) {
      callNodes.push({
        id: fn.fullName,
        code: fn.fullName.split("::").pop(),
        type: "function"
      });

      fn.nodes.forEach(n => {
        if (n.callTarget) {
          const target = graph.functions.find(f => f.fullName.endsWith(n.callTarget));
          if (target) {
            callEdges.push({
              from: fn.fullName,
              to: target.fullName,
              label: ""
            });
          }
        }
      });
    }

    functions.push({
      name: "Call Graph",
      fullName: "call_graph",
      nodes: callNodes,
      edges: callEdges
    });
  }

  // Dropdown
  functionSelect.innerHTML = "";
  functions.forEach((fn, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    const clean = fn.fullName
      ? fn.fullName.split("::").pop().replace(/\(.*/, "")
      : fn.name;
    opt.text = clean;
    functionSelect.appendChild(opt);
  });

  functionSelect.onchange = () => renderFunction(parseInt(functionSelect.value, 10));
}


function renderFunction(index) {
  currentIndex = index;
  const fn = functions[index];
  if (!fn) return;

  // clear existing graph
  inner.selectAll("*").remove();

  // RESET zoom state so each graph gets its own view calculations
  const identity = d3.zoomIdentity.translate(0, 0).scale(1);
  svg.property("__zoom", identity);
  svg.call(zoom.transform, identity);

  // build dagre graph
  const g = new dagreD3.graphlib.Graph().setGraph({});

  // Nodes
  fn.nodes.forEach((node) => {
    const safe = escapeHtml(node.code || node.type);

    let shape = "rect";
    if (node.type === "if") shape = "diamond";
    if (node.type === "return") shape = "ellipse";
    if (node.type === "merge") shape = "circle";

    g.setNode(node.id, {
      label: safe,
      shape,
      rx: 5,
      ry: 5,
      class: "node-style"
    });
  });

  // Edges
  fn.edges.forEach((edge) => {
    g.setEdge(edge.from, edge.to, {
      label: edge.label || "",
      arrowhead: "vee",
      class: "edge-style"
    });
  });

  // Smooth self-loops
  g.edges().forEach(e => {
    if (e.v === e.w) {
      const edgeObj = g.edge(e);
      g.setEdge(e.v, e.w, {
        ...edgeObj,
        curve: d3.curveBasis,
        arrowhead: "vee"
      });
    }
  });

  // margins for dagre layout (kept but final centering uses padded bbox)
  g.graph().marginx = 40;
  g.graph().marginy = 40;

  // render to inner group
  const render = new dagreD3.render();
  render(inner, g);

  // --- compute padded bbox and initial transform so padded graph fits and is centered ---
  const bbox = inner.node().getBBox();
  const rawX = bbox.x;
  const rawY = bbox.y;
  const rawW = Math.max(1, bbox.width);
  const rawH = Math.max(1, bbox.height);

  const paddedX = rawX - VIEW_PADDING;
  const paddedY = rawY - VIEW_PADDING;
  const paddedW = rawW + VIEW_PADDING * 2;
  const paddedH = rawH + VIEW_PADDING * 2;

  const svgW = svg.node().clientWidth || parseInt(svg.style("width")) || 800;
  const svgH = svg.node().clientHeight || parseInt(svg.style("height")) || 600;

  const minScaleForGraph = Math.min(svgW / paddedW, svgH / paddedH) * 0.9;
  zoom.scaleExtent([minScaleForGraph, MAX_SCALE]);

  // Compute scale so padded box fits within viewport (no side touches) and obeys MIN/MAX
  let scale = Math.min(svgW / paddedW, svgH / paddedH);
  scale =  scale * 0.98; // a tiny shrink to ensure padding

  // center padded box in viewport
  const centerGraphX = paddedX + paddedW / 2;
  const centerGraphY = paddedY + paddedH / 2;

  const tx = svgW / 2 - centerGraphX * scale;
  const ty = svgH / 2 - centerGraphY * scale;

  initialTransform = d3.zoomIdentity.translate(tx, ty).scale(scale);

  // apply initial transform (this will call zoom handler which clamps using padded bbox)
  svg.transition().duration(300).call(zoom.transform, initialTransform);

  // Click interactions (after render)
  inner.selectAll("g.node").on("click", (event, nodeId) => {
    event.stopPropagation();

    const node = fn.nodes.find((n) => n.id === nodeId);
    if (!node) return;

    if (node.range) {
      vscode.postMessage({
        type: "highlightCode",
        range: node.range
      });
    }

    if (node.callTarget) {
      const targetFn = functions.find((f) => {
        const last = f.fullName.split("::").pop();
        return last === node.callTarget;
      });

      if (targetFn) {
        vscode.postMessage({
          type: "jumpToFunction",
          targetFullName: targetFn.fullName
        });
      }
    }
  });
}


function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}