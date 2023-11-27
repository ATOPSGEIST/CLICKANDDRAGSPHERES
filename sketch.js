// Define global variables
let sphereRadius;
let initialX;
let initialY;
let initialZ;
let img;
let elasticity = 0.7;
let gravity = 20;
let isDragging = false; // Declare isDragging as a global variable
let sphereVelocity;
let sphereGravity = 0.1;
let maxGravity = 3
let subStepsPerFrame = 4
let textVisible = true; // Variable to track text visibility




let sphereXYZ = [];
let sphereVelocities = [];

function preload() {
  img = loadImage('IMG_20140307_190003028.jpg');
  sound = loadSound('Audio1.wav')
  font = loadFont('Lato-Thin.ttf');
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  background(0);
  textFont(font);

  sphereRadius = windowWidth / 20;  // Adjust the sphere size
  let spacing = windowWidth/8; // Adjusted spacing between spheres

  // Calculate the starting positions
  let grid_size = 3; // Size of the grid
  let gridSpan = (grid_size - 1) * spacing; // The total span of the grid
  initialX = -gridSpan / 2; // Center the grid on the X-axis
  initialY = -gridSpan / 2; // Center the grid on the Y-axis
  initialZ = -gridSpan / 2; // Center the grid on the Z-axis

  sphereXYZ = []; // Clear any previous spheres
  sphereVelocities = []; // Clear any previous velocities

  // Create the grid of spheres
  for (let z = 0; z < grid_size; z++) {
    for (let y = 0; y < grid_size; y++) {
      for (let x = 0; x < grid_size; x++) {
        const xPosition = initialX + x * spacing; // Position each sphere using the spacing
        const yPosition = initialY + y * spacing;
        const zPosition = initialZ + z * spacing;

        sphereXYZ.push({ x: xPosition, y: yPosition, z: zPosition });
        sphereVelocities.push(createVector(0, 0, 0)); // Initialize velocities
      }
    }
  }
}




function handleSphereCollision(sphereA, sphereB, velocityA, velocityB, elasticity) {
  
  // Calculate the distance between the sphere centers
  let dx = sphereB.x - sphereA.x;
  let dy = sphereB.y - sphereA.y;
  let dz = sphereB.z - sphereA.z;
  let distance = sqrt(dx * dx + dy * dy + dz * dz);

  // Check if the distance is less than two times the radius
  if (distance < sphereRadius * 2) {
    // Calculate the normal of the collision
    let nx = dx / distance;
    let ny = dy / distance;
    let nz = dz / distance;
    let damping = 0.98;

    // Calculate the relative velocity in terms of the normal direction
    let vnA = velocityA.x * nx + velocityA.y * ny + velocityA.z * nz;
    let vnB = velocityB.x * nx + velocityB.y * ny + velocityB.z * nz;

    // Calculate the velocity of the center of mass
    let vcm = (vnA + vnB) / 2;

    // Calculate the collision impulse, taking elasticity into account
  let impulseA =-(2 + elasticity) * -damping;
  let impulseB =-(2 + elasticity) * -damping;

    // Apply the impulse to the spheres' velocities
    velocityA.x -= impulseA * nx;
    velocityA.y -= impulseA * ny;
    velocityA.z -= impulseA * nz;

    velocityB.x += impulseB * nx;
    velocityB.y += impulseB * ny;
    velocityB.z += impulseB * nz;

    // Move spheres to the edge of collision
    let overlap = sphereRadius * 2 - distance;
    let correctionFactor = overlap / distance / 2; // Divide the overlap between both spheres
    let correction = createVector(correctionFactor * dx, correctionFactor * dy, correctionFactor * dz);
    sphereA.x -= correction.x;
    sphereA.y -= correction.y;
    sphereA.z -= correction.z;
    sphereB.x += correction.x;
    sphereB.y += correction.y;
    sphereB.z += correction.z;
  }
}

function draw() {
  directionalLight(200, 200, 200, windowWidth, windowWidth, 0)
  directionalLight(100, 100, 100, -windowWidth, -windowWidth)
  ambientLight(120)
  background(0);
  stroke(0, 200, 0);
  noFill();
  box(width - sphereRadius, height - sphereRadius, width - sphereRadius);
  noStroke();
  texture(img);

  // Gravity and collision resolution
  for (let i = 0; i < sphereXYZ.length; i++) {
    let sphereC = sphereXYZ[i];
    let sphereVelocity = sphereVelocities[i];

    if (!isDragging || i !== selectedSphereIndex) {
      // Apply gravity with terminal velocity
      sphereVelocity.y = min(sphereVelocity.y + sphereGravity, maxGravity);

      // Sub-step physics update for improved stability
      for (let subStep = 0; subStep < subStepsPerFrame; subStep++) {
        // Update positions
        sphereC.x += sphereVelocity.x / subStepsPerFrame;
        sphereC.y += sphereVelocity.y / subStepsPerFrame;
        sphereC.z += sphereVelocity.z / subStepsPerFrame;

      // Handle collisions with bounds
      // X-axis
      if (sphereC.x - sphereRadius < -width / 2) {
        sphereVelocity.x *= -elasticity;
        sphereC.x = -width / 2 + sphereRadius;

      } else if (sphereC.x + sphereRadius > width / 2) {
        sphereVelocity.x *= -elasticity;
        sphereC.x = width / 2 - sphereRadius;
      }
      // Y-axis
      if (sphereC.y - sphereRadius < -height / 2) {
        sphereVelocity.y *= -elasticity;
        sphereC.y = -height / 2 + sphereRadius;
      } else if (sphereC.y + sphereRadius > height / 2) {
        sphereVelocity.y *= -elasticity;
        sphereC.y = height / 2 - sphereRadius;
      }
      // Z-axis
      if (sphereC.z - sphereRadius < -width + - sphereRadius) {
        sphereVelocity.z *= -elasticity;
        sphereC.z = -width*2 / 2 + sphereRadius;
      } else if (sphereC.z + sphereRadius > width / 2) {
        sphereVelocity.z *= -elasticity;
        sphereC.z = width / 2 - sphereRadius;
      }
    }
  }

    // Check for collisions between spheres within sub-steps
        for (let j = 0; j < sphereXYZ.length; j++) {
          if (i != j) {
            handleSphereCollision(sphereXYZ[i], sphereXYZ[j], sphereVelocities[i], sphereVelocities[j], elasticity);
          }
        }
  }

  // Draw all spheres
  for (let i = 0; i < sphereXYZ.length; i++) {
    let sphereC = sphereXYZ[i];
    push();
    translate(sphereC.x, sphereC.y, sphereC.z);
    rotateY(PI)
    texture(img);
    sphere(sphereRadius);
    pop();
  }
    displayText();
}



let currentIndex = -1; // Start with an invalid index

function displayText() {
  if (textVisible) {
    fill(255); // Set text color to white
    textSize(20); // Set text size
    textAlign(CENTER, CENTER);
    text("Click and drag sphere", 0, 0);
  }
}

function mousePressed() {
  let minDistance = Infinity; // Start with a very large number
  let closestZ = -Infinity; // Start with the farthest possible z value
  currentIndex = -1; // Reset currentIndex for each mouse press

  // Loop over all spheres to find which one is closest to the mouse
  for (let i = 0; i < sphereXYZ.length; i++) {
    let sphereC = sphereXYZ[i];
    let dx = sphereC.x - (mouseX - width / 2);  // Adjust mouse coordinates for WEBGL mode
    let dy = sphereC.y - (mouseY - height / 2); // Adjust mouse coordinates for WEBGL mode
    let distance = sqrt(dx * dx + dy * dy);

    // Check if this sphere is the closest one to the mouse cursor
    if (distance < minDistance) {
      // Now, check if this sphere is in front of the last closest one
      if (sphereC.z > closestZ) 
        minDistance = distance;
        closestZ = sphereC.z;
        currentIndex = i;
      
    }
    
  }

  // If a closest sphere is found within a reasonable distance, constrain its position
  if (currentIndex !== -1 && minDistance < sphereRadius * 2) {
    sphereXYZ[currentIndex].x = constrain(mouseX - width / 2, -width / 2 + sphereRadius, width / 2 - sphereRadius);
    sphereXYZ[currentIndex].y = constrain(mouseY - height / 2, -height / 2 + sphereRadius, height / 2 - sphereRadius);
  }
}

function mouseDragged() {
  // If there is a currently selected sphere, drag it with the mouse
  if (currentIndex !== -1) {
    sphereXYZ[currentIndex].x = constrain(mouseX - width / 2, -width / 2 + sphereRadius, width / 2 - sphereRadius);
    sphereXYZ[currentIndex].y = constrain(mouseY - height / 2, -height / 2 + sphereRadius, height / 2 - sphereRadius);
    textVisible = false; // Hide the text when the mouse is clicked
  }
}



  

function mouseReleased() {
  if (isDragging) {
    isDragging = false;
    selectedSphereIndex = -1; // Deselect the sphere
  }
}
