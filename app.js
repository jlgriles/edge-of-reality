// Global variables
let scene, camera, renderer, sphere;
let nodes = [];
let connections = [];
let raycaster, mouse;
let autoRotationSpeed = 0.0005;
let isUserInteracting = false;
let openModals = [];

// Category color mapping
const categoryColors = {
  'technology': 0x00ffff,    // cyan
  'science': 0xff00ff,       // magenta
  'health': 0x00ff00,        // green
  'culture': 0xffff00,       // yellow
  'business': 0xff8800       // orange
};

// Interaction state
let isDragging = false;
let mouseDownPos = { x: 0, y: 0 };
let previousMousePosition = { x: 0, y: 0 };
let sphereRotationVelocity = { x: 0, y: 0 };
let dampingFactor = 0.95;

// Initialize the application
function init() {
  if (!checkWebGLSupport()) {
    document.getElementById('webgl-error').classList.remove('hidden');
    return;
  }

  initScene();
  createStarfield();
  createNodes();
  createConnections();
  setupEventListeners();
  animate();
}

function checkWebGLSupport() {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && 
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch(e) {
    return false;
  }
}

function initScene() {
  scene = new THREE.Scene();
  
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000);
  camera.position.set(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000);
  document.getElementById('canvas-container').appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xffffff, 1, 2000);
  pointLight.position.set(0, 0, 0);
  scene.add(pointLight);

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();
}

function createStarfield() {
  const radius = 1000;
  const geometry = new THREE.SphereGeometry(radius, 64, 64);
  
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 1500; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = Math.random() * 2;
    ctx.fillRect(x, y, size, size);
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.BackSide
  });
  
  sphere = new THREE.Mesh(geometry, material);
  scene.add(sphere);
}

function sphericalToCartesian(theta, phi, radius) {
  const thetaRad = (theta * Math.PI) / 180;
  const phiRad = (phi * Math.PI) / 180;
  
  const x = radius * Math.sin(phiRad) * Math.sin(thetaRad);
  const y = radius * Math.cos(phiRad);
  const z = radius * Math.sin(phiRad) * Math.cos(thetaRad);
  
  return { x, y, z };
}

function createNodes() {
  podcastNodes.forEach(nodeData => {
    const node = createNode(nodeData);
    nodes.push({ mesh: node, data: nodeData });
    sphere.add(node);
  });
}

function createNode(nodeData) {
  const radius = 950;
  const position = sphericalToCartesian(nodeData.theta, nodeData.phi, radius);
  
  // Get color from first category
  const firstCategory = nodeData.themes[0];
  const nodeColor = categoryColors[firstCategory] || 0xffffff; // default to white if category not found
  
  const geometry = new THREE.SphereGeometry(15, 32, 32);
  const material = new THREE.MeshBasicMaterial({
    color: nodeColor,
    transparent: true,
    opacity: 0.9
  });
  
  const nodeMesh = new THREE.Mesh(geometry, material);
  nodeMesh.position.set(position.x, position.y, position.z);
  
  const glowGeometry = new THREE.SphereGeometry(20, 32, 32);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: nodeColor,
    transparent: true,
    opacity: 0.3
  });
  const glow = new THREE.Mesh(glowGeometry, glowMaterial);
  nodeMesh.add(glow);
  
  // Store data on the main mesh
  nodeMesh.userData = nodeData;
  nodeMesh.name = 'podcast-node';
  
  return nodeMesh;
}

function createConnections() {
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.3
  });
  
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const node1 = nodes[i];
      const node2 = nodes[j];
      
      const sharedThemes = node1.data.themes.filter(theme => 
        node2.data.themes.includes(theme)
      );
      
      if (sharedThemes.length > 0) {
        const points = [node1.mesh.position, node2.mesh.position];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, lineMaterial);
        line.name = 'connection-line';
        connections.push(line);
        sphere.add(line);
      }
    }
  }
}

function setupEventListeners() {
  renderer.domElement.addEventListener('mousedown', onMouseDown);
  renderer.domElement.addEventListener('mousemove', onMouseMove);
  renderer.domElement.addEventListener('mouseup', onMouseUp);
  
  renderer.domElement.addEventListener('touchstart', onTouchStart, { passive: false });
  renderer.domElement.addEventListener('touchmove', onTouchMove, { passive: false });
  renderer.domElement.addEventListener('touchend', onTouchEnd);
  
  window.addEventListener('resize', onWindowResize);
  
  // Event delegation for directional labels (backup)
  const labelsContainer = document.getElementById('directional-labels');
  
  labelsContainer.addEventListener('click', function(e) {
    const label = e.target.closest('.directional-label');
    if (label && label.dataset.nodeId) {
      e.stopPropagation();
      e.preventDefault();
      const node = nodes.find(n => n.data.id === label.dataset.nodeId);
      if (node) {
        rotateToNode(node);
      }
    }
  });
}

function onMouseDown(event) {
  isDragging = false;
  mouseDownPos = { x: event.clientX, y: event.clientY };
  isUserInteracting = true;
  previousMousePosition = { x: event.clientX, y: event.clientY };
}

function onMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
  if (isUserInteracting) {
    isDragging = true;
    const deltaX = event.clientX - previousMousePosition.x;
    const deltaY = event.clientY - previousMousePosition.y;
    
    sphereRotationVelocity.x = deltaY * 0.005;
    sphereRotationVelocity.y = deltaX * 0.005;
    
    previousMousePosition = { x: event.clientX, y: event.clientY };
  } else {
    handleHover();
  }
}

function onMouseUp(event) {
  isUserInteracting = false;
  
  // Check if this was a click (not a drag)
  const distance = Math.sqrt(
    Math.pow(event.clientX - mouseDownPos.x, 2) + 
    Math.pow(event.clientY - mouseDownPos.y, 2)
  );
  
  if (distance < 5) {
    // This was a click, not a drag
    handleClick(event);
  }
  
  setTimeout(() => {
    if (!isUserInteracting) {
      isDragging = false;
    }
  }, 100);
}

function handleClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
  raycaster.setFromCamera(mouse, camera);
  
  // Only check podcast nodes
  const nodeMeshes = nodes.map(n => n.mesh);
  const intersects = raycaster.intersectObjects(nodeMeshes, true);
  
  if (intersects.length > 0) {
    // Walk up the tree to find the node with userData
    let object = intersects[0].object;
    while (object) {
      if (object.userData && object.userData.id) {
        openModal(object.userData);
        return;
      }
      object = object.parent;
    }
  }
}

function onTouchStart(event) {
  event.preventDefault();
  if (event.touches.length === 1) {
    isDragging = false;
    mouseDownPos = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    isUserInteracting = true;
    previousMousePosition = { x: event.touches[0].clientX, y: event.touches[0].clientY };
  }
}

function onTouchMove(event) {
  event.preventDefault();
  if (isUserInteracting && event.touches.length === 1) {
    isDragging = true;
    const deltaX = event.touches[0].clientX - previousMousePosition.x;
    const deltaY = event.touches[0].clientY - previousMousePosition.y;
    
    sphereRotationVelocity.x = deltaY * 0.005;
    sphereRotationVelocity.y = deltaX * 0.005;
    
    previousMousePosition = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY
    };
  }
}

function onTouchEnd(event) {
  isUserInteracting = false;
  
  if (event.changedTouches.length === 1) {
    const touch = event.changedTouches[0];
    const distance = Math.sqrt(
      Math.pow(touch.clientX - mouseDownPos.x, 2) + 
      Math.pow(touch.clientY - mouseDownPos.y, 2)
    );
    
    if (distance < 10) {
      // This was a tap
      mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
      
      raycaster.setFromCamera(mouse, camera);
      const nodeMeshes = nodes.map(n => n.mesh);
      const intersects = raycaster.intersectObjects(nodeMeshes, true);
      
      if (intersects.length > 0) {
        let object = intersects[0].object;
        while (object) {
          if (object.userData && object.userData.id) {
            openModal(object.userData);
            return;
          }
          object = object.parent;
        }
      }
    }
  }
  
  setTimeout(() => {
    isDragging = false;
  }, 100);
}

function handleHover() {
  raycaster.setFromCamera(mouse, camera);
  const nodeMeshes = nodes.map(n => n.mesh);
  const intersects = raycaster.intersectObjects(nodeMeshes, true);
  
  if (intersects.length > 0) {
    let object = intersects[0].object;
    while (object) {
      if (object.userData && object.userData.id) {
        showTooltip(object.userData, mouse);
        return;
      }
      object = object.parent;
    }
  }
  hideTooltip();
}

function showTooltip(nodeData, mousePos) {
  const tooltip = document.getElementById('tooltip');
  tooltip.textContent = nodeData.title;
  tooltip.classList.remove('hidden');
  
  const x = (mousePos.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-mousePos.y * 0.5 + 0.5) * window.innerHeight;
  
  tooltip.style.left = `${x + 15}px`;
  tooltip.style.top = `${y - 10}px`;
}

function hideTooltip() {
  document.getElementById('tooltip').classList.add('hidden');
}

function openModal(nodeData) {
  if (window.innerWidth <= 768 && openModals.length > 0) {
    openModals.forEach(modal => modal.remove());
    openModals = [];
  }
  
  const modalBackdrop = document.createElement('div');
  modalBackdrop.className = 'modal-backdrop';
  
  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';
  
  const closeButton = document.createElement('button');
  closeButton.className = 'modal-close';
  closeButton.innerHTML = '&times;';
  closeButton.onclick = () => closeModal(modalBackdrop);
  
  const title = document.createElement('h2');
  title.className = 'modal-title';
  title.textContent = nodeData.title;
  
  const description = document.createElement('p');
  description.className = 'modal-description';
  description.textContent = 'This episode is coming soon! We\'re still cooking up the cosmic conversations and interdimensional insights. Check back later to engage with the full podcast experience. Until then, keep exploring the constellation and stay on the edge of reality!';
  
  // Spotify embed - uncomment when episodes are ready
  // const iframe = document.createElement('iframe');
  // iframe.className = 'spotify-embed';
  // iframe.src = nodeData.spotifyEmbed;
  // iframe.allowtransparency = 'true';
  // iframe.allow = 'encrypted-media';
  
  const tags = document.createElement('div');
  tags.className = 'modal-tags';
  nodeData.themes.forEach(theme => {
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = theme;
    // Convert category color to hex string for CSS
    const categoryColorHex = categoryColors[theme] || 0xffffff;
    const colorHex = '#' + categoryColorHex.toString(16).padStart(6, '0');
    tag.style.color = colorHex;
    tags.appendChild(tag);
  });
  
  modalContent.appendChild(closeButton);
  modalContent.appendChild(title);
  modalContent.appendChild(description);
  // modalContent.appendChild(iframe); // Uncomment when episodes are ready
  modalContent.appendChild(tags);
  modalBackdrop.appendChild(modalContent);
  
  modalBackdrop.onclick = (e) => {
    if (e.target === modalBackdrop) {
      closeModal(modalBackdrop);
    }
  };
  
  document.getElementById('modal-container').appendChild(modalBackdrop);
  openModals.push(modalBackdrop);
}

function openAboutModal() {
  if (window.innerWidth <= 768 && openModals.length > 0) {
    openModals.forEach(modal => modal.remove());
    openModals = [];
  }
  
  const modalBackdrop = document.createElement('div');
  modalBackdrop.className = 'modal-backdrop';
  
  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';
  
  const closeButton = document.createElement('button');
  closeButton.className = 'modal-close';
  closeButton.innerHTML = '&times;';
  closeButton.onclick = () => closeModal(modalBackdrop);
  
  const title = document.createElement('h2');
  title.className = 'modal-title';
  title.textContent = 'About Edge of Reality';
  
  const description = document.createElement('div');
  description.className = 'modal-description';
  description.innerHTML = `
    <p style="margin-bottom: 16px;">Welcome to the Edge of Reality, where researchers share their groundbreaking work and explore what excites them at the frontier of human knowledge.</p>
    <p style="margin-bottom: 16px;">Each episode features a guest researcher presenting their work across fields like neuroscience, physics, artificial intelligence, psychology, and beyond: diving into both established findings and speculative horizons.</p>
    <p style="margin-bottom: 16px;">Navigate through our constellation of episodes by dragging to rotate the sphere. Each glowing node represents an episode, connected to others that share similar themes. Hover over nodes to see episode titles, or follow the directional category labels to explore.</p>
    <p><strong>How to Navigate:</strong></p>
    <ul style="margin-left: 20px; margin-top: 8px;">
      <li>Drag to rotate the sphere</li>
      <li>Click nodes to play episodes</li>
      <li>Hover over nodes for episode titles</li>
      <li>Follow category labels to explore themes</li>
    </ul>
  `;
  
  modalContent.appendChild(closeButton);
  modalContent.appendChild(title);
  modalContent.appendChild(description);
  modalBackdrop.appendChild(modalContent);
  
  modalBackdrop.onclick = (e) => {
    if (e.target === modalBackdrop) {
      closeModal(modalBackdrop);
    }
  };
  
  document.getElementById('modal-container').appendChild(modalBackdrop);
  openModals.push(modalBackdrop);
}

function closeModal(modalElement) {
  modalElement.remove();
  openModals = openModals.filter(m => m !== modalElement);
}

function updateDirectionalLabels() {
  const labelsContainer = document.getElementById('directional-labels');
  
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  
  // Collect all potential labels with their data
  const potentialLabels = [];
  
  nodes.forEach(node => {
    const nodeWorldPos = new THREE.Vector3();
    node.mesh.getWorldPosition(nodeWorldPos);
    
    const nodeDir = nodeWorldPos.clone().sub(camera.position).normalize();
    const cameraDir = new THREE.Vector3(0, 0, -1);
    cameraDir.applyQuaternion(camera.quaternion);
    
    const angle = Math.acos(nodeDir.dot(cameraDir)) * (180 / Math.PI);
    
    if (angle > 60 && angle < 120) {
      const screenPos = nodeWorldPos.clone().project(camera);
      const x = (screenPos.x * 0.5 + 0.5) * window.innerWidth;
      const y = (-screenPos.y * 0.5 + 0.5) * window.innerHeight;
      
      const dirX = x - centerX;
      const dirY = y - centerY;
      
      let labelX, labelY, arrow, edge;
      
      if (Math.abs(dirX) > Math.abs(dirY)) {
        if (dirX > 0) {
          labelX = window.innerWidth - 250;
          labelY = Math.max(80, Math.min(window.innerHeight - 80, y));
          arrow = '>';
          edge = 'right';
        } else {
          labelX = 20;
          labelY = Math.max(80, Math.min(window.innerHeight - 80, y));
          arrow = '<';
          edge = 'left';
        }
      } else {
        if (dirY > 0) {
          labelX = Math.max(20, Math.min(window.innerWidth - 250, x - 100));
          labelY = window.innerHeight - 60;
          arrow = 'v';
          edge = 'bottom';
        } else {
          labelX = Math.max(20, Math.min(window.innerWidth - 250, x - 100));
          labelY = 80;
          arrow = '^';
          edge = 'top';
        }
      }
      
      potentialLabels.push({
        node: node,
        x: labelX,
        y: labelY,
        arrow: arrow,
        edge: edge,
        angle: angle
      });
    }
  });
  
  // Sort by angle (show closer ones first)
  potentialLabels.sort((a, b) => a.angle - b.angle);
  
  // Keep track of used positions per edge
  const usedPositions = {
    left: [],
    right: [],
    top: [],
    bottom: []
  };
  
  const minSpacing = 40;
  
  // Reuse existing labels to preserve event listeners
  const existingLabels = Array.from(labelsContainer.querySelectorAll('.directional-label'));
  const usedLabels = new Set();
  
  potentialLabels.forEach(labelData => {
    let finalY = labelData.y;
    let finalX = labelData.x;
    
    // Check for overlaps on this edge
    const positions = usedPositions[labelData.edge];
    let hasOverlap = false;
    
    if (labelData.edge === 'left' || labelData.edge === 'right') {
      for (let pos of positions) {
        if (Math.abs(pos - finalY) < minSpacing) {
          hasOverlap = true;
          let testY = finalY;
          let foundSpace = false;
          
          for (let offset = minSpacing; offset < 200; offset += minSpacing) {
            testY = finalY + offset;
            if (testY < window.innerHeight - 80) {
              let clear = true;
              for (let p of positions) {
                if (Math.abs(p - testY) < minSpacing) {
                  clear = false;
                  break;
                }
              }
              if (clear) {
                finalY = testY;
                foundSpace = true;
                break;
              }
            }
          }
          
          if (!foundSpace) {
            for (let offset = minSpacing; offset < 200; offset += minSpacing) {
              testY = finalY - offset;
              if (testY > 80) {
                let clear = true;
                for (let p of positions) {
                  if (Math.abs(p - testY) < minSpacing) {
                    clear = false;
                    break;
                  }
                }
                if (clear) {
                  finalY = testY;
                  foundSpace = true;
                  break;
                }
              }
            }
          }
          
          if (!foundSpace) {
            return;
          }
          break;
        }
      }
    } else {
      for (let pos of positions) {
        if (Math.abs(pos - finalX) < 150) {
          hasOverlap = true;
          let testX = finalX;
          let foundSpace = false;
          
          for (let offset = 150; offset < 400; offset += 150) {
            testX = finalX + offset;
            if (testX < window.innerWidth - 250) {
              let clear = true;
              for (let p of positions) {
                if (Math.abs(p - testX) < 150) {
                  clear = false;
                  break;
                }
              }
              if (clear) {
                finalX = testX;
                foundSpace = true;
                break;
              }
            }
          }
          
          if (!foundSpace) {
            for (let offset = 150; offset < 400; offset += 150) {
              testX = finalX - offset;
              if (testX > 20) {
                let clear = true;
                for (let p of positions) {
                  if (Math.abs(p - testX) < 150) {
                    clear = false;
                    break;
                  }
                }
                if (clear) {
                  finalX = testX;
                  foundSpace = true;
                  break;
                }
              }
            }
          }
          
          if (!foundSpace) {
            return;
          }
          break;
        }
      }
    }
    
    if (labelData.edge === 'left' || labelData.edge === 'right') {
      usedPositions[labelData.edge].push(finalY);
    } else {
      usedPositions[labelData.edge].push(finalX);
    }
    
    // Try to find existing label for this node
    let label = existingLabels.find(l => l.dataset.nodeId === labelData.node.data.id);
    
    // Convert category color to hex string for CSS
    const firstCategory = labelData.node.data.themes[0];
    const categoryColorHex = categoryColors[firstCategory] || 0xffffff;
    const colorHex = '#' + categoryColorHex.toString(16).padStart(6, '0');
    
    if (label) {
      // Reuse existing label to preserve event listeners
      label.style.left = `${finalX}px`;
      label.style.top = `${finalY}px`;
      const themeText = labelData.node.data.themes[0];
      label.innerHTML = `<span class="arrow">${labelData.arrow}</span><span class="label-text" style="color: ${colorHex};">${themeText}</span>`;
      usedLabels.add(label);
    } else {
      // Create new label
      label = document.createElement('div');
      label.className = 'directional-label visible';
      const themeText = labelData.node.data.themes[0];
      label.innerHTML = `<span class="arrow">${labelData.arrow}</span><span class="label-text" style="color: ${colorHex};">${themeText}</span>`;
      label.style.left = `${finalX}px`;
      label.style.top = `${finalY}px`;
      label.dataset.nodeId = labelData.node.data.id;
      
      // Add direct click handler to the label
      const nodeToRotateTo = labelData.node;
      label.addEventListener('click', function(e) {
        e.stopPropagation();
        e.preventDefault();
        rotateToNode(nodeToRotateTo);
      });
      
      labelsContainer.appendChild(label);
      usedLabels.add(label);
    }
  });
  
  // Remove unused labels
  existingLabels.forEach(label => {
    if (!usedLabels.has(label) && !label.dataset.static) {
      label.remove();
    }
  });
}

function rotateToNode(node) {
  isUserInteracting = true;
  
  const nodePos = node.mesh.position.clone();
  
  const targetRotationY = -Math.atan2(nodePos.x, nodePos.z);
  const horizontalDist = Math.sqrt(nodePos.x * nodePos.x + nodePos.z * nodePos.z);
  const targetRotationX = -Math.atan2(nodePos.y, horizontalDist) + Math.PI / 2;
  
  const startRotationY = sphere.rotation.y;
  const startRotationX = sphere.rotation.x;
  
  let deltaY = targetRotationY - startRotationY;
  while (deltaY > Math.PI) deltaY -= 2 * Math.PI;
  while (deltaY < -Math.PI) deltaY += 2 * Math.PI;
  
  let deltaX = targetRotationX - startRotationX;
  while (deltaX > Math.PI) deltaX -= 2 * Math.PI;
  while (deltaX < -Math.PI) deltaX += 2 * Math.PI;
  
  const duration = 800;
  const startTime = Date.now();
  
  function animateRotation() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    const eased = progress < 0.5 
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;
    
    sphere.rotation.y = startRotationY + deltaY * eased;
    sphere.rotation.x = startRotationX + deltaX * eased;
    
    sphereRotationVelocity.x = 0;
    sphereRotationVelocity.y = 0;
    
    if (progress < 1) {
      requestAnimationFrame(animateRotation);
    } else {
      // Animation complete - open modal and re-enable interaction
      setTimeout(() => {
        isUserInteracting = false;
        openModal(node.data);
      }, 100);
    }
  }
  
  animateRotation();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  
  // Animate nodes - pulsing glow effect
  const time = Date.now() * 0.001; // Convert to seconds
  nodes.forEach((node, index) => {
    // Each node pulses at slightly different rate/offset for variety
    const pulseSpeed = 1.5 + (index * 0.1) % 1; // Vary speed between 1.5-2.5
    const pulseOffset = index * 0.5; // Stagger the pulses
    const pulse = Math.sin(time * pulseSpeed + pulseOffset) * 0.5 + 0.5; // 0 to 1
    
    // Pulse the opacity of the main node
    node.mesh.material.opacity = 0.7 + (pulse * 0.3); // 0.7 to 1.0
    
    // Pulse the glow (first child)
    if (node.mesh.children[0]) {
      node.mesh.children[0].material.opacity = 0.2 + (pulse * 0.3); // 0.2 to 0.5
      // Also pulse the scale slightly
      const scale = 1 + (pulse * 0.2); // 1.0 to 1.2
      node.mesh.children[0].scale.set(scale, scale, scale);
    }
  });
  
  if (isDragging || Math.abs(sphereRotationVelocity.x) > 0.0001 || Math.abs(sphereRotationVelocity.y) > 0.0001) {
    sphere.rotation.x += sphereRotationVelocity.x;
    sphere.rotation.y += sphereRotationVelocity.y;
    
    if (!isDragging) {
      sphereRotationVelocity.x *= dampingFactor;
      sphereRotationVelocity.y *= dampingFactor;
    }
  }
  
  if (!isUserInteracting && !isDragging && 
      Math.abs(sphereRotationVelocity.x) < 0.0001 && 
      Math.abs(sphereRotationVelocity.y) < 0.0001) {
    sphere.rotation.y += autoRotationSpeed;
  }
  
  // Don't update labels during user interaction or when animating to node
  // This prevents labels from being recreated during clicks
  if (!isUserInteracting && !isDragging) {
    updateDirectionalLabels();
  }
  
  renderer.render(scene, camera);
}

window.addEventListener('DOMContentLoaded', init);
