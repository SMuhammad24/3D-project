import * as THREE from 'three';

/**
 * Creates the complete, modular 3D Logitech MX Master 2S Mouse model.
 * Each sub-layer is grouped with initial and exploded relative transformations
 * so that GSAP or the manual explode slider can smoothly explode or assemble it.
 */
export function createMXMasterModel() {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'MX_Master_Root';

  // Master materials dictionary for colorways and PBR rendering
  const materials = {
    // Top shell primary matte material (customizable colorway)
    topShellMat: new THREE.MeshStandardMaterial({
      color: 0x1e2124,
      roughness: 0.35,
      metalness: 0.15,
      clearcoat: 0.1,
      clearcoatRoughness: 0.2,
    }),

    // Bronze / champagne metallic trim accents on the thumb & side
    trimAccentMat: new THREE.MeshStandardMaterial({
      color: 0x8a7258, // Warm metallic bronze/champagne
      roughness: 0.28,
      metalness: 0.85,
    }),

    // Dark rubberized grip with textured micro-geometry
    rubberGripMat: new THREE.MeshStandardMaterial({
      color: 0x141619,
      roughness: 0.88,
      metalness: 0.05,
    }),

    // Stainless steel knurled wheels (high metallic reflection)
    knurledSteelMat: new THREE.MeshStandardMaterial({
      color: 0xd8dde2,
      roughness: 0.2,
      metalness: 0.95,
    }),

    // Stainless steel wheel rubber center ring
    wheelRubberMat: new THREE.MeshStandardMaterial({
      color: 0x181a1d,
      roughness: 0.9,
      metalness: 0.1,
    }),

    // Omron Microswitch housing (matte black polymer)
    switchBodyMat: new THREE.MeshStandardMaterial({
      color: 0x0f1115,
      roughness: 0.6,
      metalness: 0.2,
    }),

    // Switch plunger (vibrant tactile white/red)
    switchPlungerMat: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.3,
      metalness: 0.1,
    }),

    // Li-Po battery pack (silver/metallic polymer pouch)
    batteryCellMat: new THREE.MeshStandardMaterial({
      color: 0x9ca3af,
      roughness: 0.25,
      metalness: 0.7,
    }),

    batteryLabelMat: new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.5,
      metalness: 0.2,
    }),

    // PCB mainboard (Dark emerald/black solder mask)
    pcbMat: new THREE.MeshStandardMaterial({
      color: 0x0a2f1d,
      roughness: 0.4,
      metalness: 0.3,
    }),

    // Gold plated contacts & traces
    goldContactMat: new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.2,
      metalness: 0.9,
    }),

    // SMD IC chips (Silicon matte black)
    icChipMat: new THREE.MeshStandardMaterial({
      color: 0x111317,
      roughness: 0.45,
      metalness: 0.25,
    }),

    // Glowing Laser Diode / Optical Sensor Lens
    laserGlowMat: new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 2.5,
      roughness: 0.1,
      metalness: 0.1,
    }),

    // Green LED indicators (Battery / Power)
    greenLedMat: new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x10b981,
      emissiveIntensity: 3.0,
      roughness: 0.1,
    }),

    // Low-friction PTFE Teflon glide feet
    ptfeGlideMat: new THREE.MeshStandardMaterial({
      color: 0x242830,
      roughness: 0.2,
      metalness: 0.1,
    }),

    // Base chassis bottom frame
    chassisMat: new THREE.MeshStandardMaterial({
      color: 0x16181d,
      roughness: 0.5,
      metalness: 0.3,
    })
  };

  // Keep references to all animatable component groups
  const parts = {};

  /* -------------------------------------------------------------
     LAYER 1: BASE CHASSIS & GLIDE FEET (Layer 0 on the bottom)
     ------------------------------------------------------------- */
  const bottomChassis = new THREE.Group();
  bottomChassis.name = 'bottomChassis';
  bottomChassis.userData = {
    title: 'Base Chassis & PTFE Glides',
    desc: 'High-rigidity polycarbonate base plate with zero-friction PTFE Teflon glides, power switch, and Easy-Switch 3-device channel selector.',
    tag: 'Chassis & PTFE Feet',
    explodePos: new THREE.Vector3(0, -1.8, 0),
    explodeRot: new THREE.Vector3(-0.15, 0, 0)
  };

  // Base Plate Geometry
  const baseShape = new THREE.Shape();
  // Ergonomic outline for MX Master base
  baseShape.moveTo(-1.1, -1.8);
  baseShape.lineTo(1.1, -1.8);
  baseShape.quadraticCurveTo(1.4, -0.6, 1.3, 0.8);
  baseShape.quadraticCurveTo(1.1, 2.0, 0.0, 2.2);
  baseShape.quadraticCurveTo(-1.6, 1.8, -1.9, 0.2); // Thumb wing flare
  baseShape.quadraticCurveTo(-1.8, -1.2, -1.1, -1.8);

  const extrudeSettings = {
    steps: 1,
    depth: 0.25,
    bevelEnabled: true,
    bevelThickness: 0.08,
    bevelSize: 0.08,
    bevelOffset: 0,
    bevelSegments: 4
  };

  const baseGeo = new THREE.ExtrudeGeometry(baseShape, extrudeSettings);
  baseGeo.rotateX(Math.PI / 2);
  baseGeo.center();
  const baseMesh = new THREE.Mesh(baseGeo, materials.chassisMat);
  baseMesh.castShadow = true;
  baseMesh.receiveShadow = true;
  bottomChassis.add(baseMesh);

  // PTFE Glides (Top-Left, Top-Right, Bottom, Thumb Wing)
  function createGlidePad(w, h, x, z, rot = 0) {
    const padGeo = new THREE.BoxGeometry(w, 0.04, h);
    const pad = new THREE.Mesh(padGeo, materials.ptfeGlideMat);
    pad.position.set(x, -0.15, z);
    pad.rotation.y = rot;
    bottomChassis.add(pad);
  }
  createGlidePad(0.7, 0.25, 0, 1.6); // Front pad
  createGlidePad(1.1, 0.28, 0, -1.5); // Back pad
  createGlidePad(0.45, 0.9, -1.3, 0.1, 0.3); // Thumb wing pad
  createGlidePad(0.35, 0.8, 0.9, 0.3, -0.2); // Right side pad

  // Sensor Aperture & Power Switch on bottom
  const apertureGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.06, 16);
  const aperture = new THREE.Mesh(apertureGeo, materials.switchBodyMat);
  aperture.position.set(0, -0.14, -0.1);
  bottomChassis.add(aperture);

  // Easy-Switch 1-2-3 Button & LEDs
  const easySwitchBtnGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.05, 16);
  const easySwitchBtn = new THREE.Mesh(easySwitchBtnGeo, materials.knurledSteelMat);
  easySwitchBtn.position.set(0, -0.14, -0.7);
  bottomChassis.add(easySwitchBtn);

  // 3 small device LEDs
  for (let i = -1; i <= 1; i++) {
    const ledGeo = new THREE.SphereGeometry(0.025, 8, 8);
    const led = new THREE.Mesh(ledGeo, materials.greenLedMat);
    led.position.set(i * 0.1, -0.14, -0.9);
    bottomChassis.add(led);
  }

  // Micro-USB charging port at front
  const usbPortGeo = new THREE.BoxGeometry(0.35, 0.12, 0.15);
  const usbPort = new THREE.Mesh(usbPortGeo, materials.knurledSteelMat);
  usbPort.position.set(0, 0.02, 2.05);
  bottomChassis.add(usbPort);

  rootGroup.add(bottomChassis);
  parts.bottomChassis = bottomChassis;


  /* -------------------------------------------------------------
     LAYER 2: MOTHERBOARD & DARKFIELD 4000 DPI SENSOR PCB
     ------------------------------------------------------------- */
  const mainboardPCB = new THREE.Group();
  mainboardPCB.name = 'mainboardPCB';
  mainboardPCB.userData = {
    title: 'Darkfield™ 4000 DPI Laser Engine & PCB',
    desc: 'Dual-layer green FR4 PCB with high-precision Darkfield laser sensor IC, Bluetooth Low Energy microcontroller, Unifying 2.4GHz RF radio, and gold trace contacts.',
    tag: 'Core Logic & Sensor',
    explodePos: new THREE.Vector3(0, -0.8, 0.2),
    explodeRot: new THREE.Vector3(-0.08, 0, 0)
  };

  // Main PCB Board
  const pcbShape = new THREE.Shape();
  pcbShape.moveTo(-0.9, -1.5);
  pcbShape.lineTo(0.9, -1.5);
  pcbShape.quadraticCurveTo(1.1, -0.4, 1.0, 0.9);
  pcbShape.lineTo(0.5, 1.7);
  pcbShape.lineTo(-0.5, 1.7);
  pcbShape.lineTo(-1.0, 0.9);
  pcbShape.quadraticCurveTo(-1.4, 0.0, -1.3, -0.8);
  pcbShape.lineTo(-0.9, -1.5);

  const pcbGeo = new THREE.ExtrudeGeometry(pcbShape, { depth: 0.06, bevelEnabled: false });
  pcbGeo.rotateX(Math.PI / 2);
  pcbGeo.center();
  const pcbMesh = new THREE.Mesh(pcbGeo, materials.pcbMat);
  pcbMesh.position.set(0, 0.35, 0);
  pcbMesh.castShadow = true;
  pcbMesh.receiveShadow = true;
  mainboardPCB.add(pcbMesh);

  // Darkfield Laser Sensor IC Package
  const sensorGeo = new THREE.BoxGeometry(0.55, 0.18, 0.55);
  const sensorMesh = new THREE.Mesh(sensorGeo, materials.icChipMat);
  sensorMesh.position.set(0, 0.35, -0.1);
  mainboardPCB.add(sensorMesh);

  // Glowing laser diode lens inside sensor
  const laserLensGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.08, 16);
  const laserLens = new THREE.Mesh(laserLensGeo, materials.laserGlowMat);
  laserLens.position.set(0, 0.26, -0.1);
  mainboardPCB.add(laserLens);

  // Laser beam cone projection (downward glow effect)
  const beamGeo = new THREE.ConeGeometry(0.35, 1.2, 16, 1, true);
  const beamMat = new THREE.MeshBasicMaterial({
    color: 0x00f0ff,
    transparent: true,
    opacity: 0.35,
    side: THREE.DoubleSide
  });
  const laserBeam = new THREE.Mesh(beamGeo, beamMat);
  laserBeam.position.set(0, -0.3, -0.1);
  laserBeam.rotation.x = Math.PI;
  mainboardPCB.add(laserBeam);

  // Microcontroller & SMD ICs
  const mcuGeo = new THREE.BoxGeometry(0.4, 0.1, 0.4);
  const mcuMesh = new THREE.Mesh(mcuGeo, materials.icChipMat);
  mcuMesh.position.set(0.4, 0.42, 0.5);
  mainboardPCB.add(mcuMesh);

  // Golden SMD Capacitors & Traces
  for (let i = 0; i < 8; i++) {
    const smdGeo = new THREE.BoxGeometry(0.08, 0.05, 0.12);
    const smd = new THREE.Mesh(smdGeo, materials.goldContactMat);
    smd.position.set(
      -0.6 + (i % 3) * 0.45,
      0.4,
      -0.9 + Math.floor(i / 3) * 0.55
    );
    mainboardPCB.add(smd);
  }

  rootGroup.add(mainboardPCB);
  parts.mainboardPCB = mainboardPCB;


  /* -------------------------------------------------------------
     LAYER 3: 500mAh RECHARGEABLE LI-PO BATTERY PACK
     ------------------------------------------------------------- */
  const batteryPack = new THREE.Group();
  batteryPack.name = 'batteryPack';
  batteryPack.userData = {
    title: '500 mAh Li-Po High-Density Power Cell',
    desc: 'Ultra-thin lithium-polymer prismatic cell delivering up to 70 days on a single charge. Features 3-minute fast recharge protection circuit.',
    tag: 'Power System',
    explodePos: new THREE.Vector3(0.5, 0.1, -0.4),
    explodeRot: new THREE.Vector3(0, 0.25, 0.1)
  };

  // Metallic Battery Pouch
  const cellGeo = new THREE.BoxGeometry(0.85, 0.25, 1.25);
  const cellMesh = new THREE.Mesh(cellGeo, materials.batteryCellMat);
  cellMesh.position.set(0.15, 0.65, -0.55);
  cellMesh.castShadow = true;
  batteryPack.add(cellMesh);

  // Logitech Battery Label
  const labelGeo = new THREE.PlaneGeometry(0.7, 0.95);
  const labelMesh = new THREE.Mesh(labelGeo, materials.batteryLabelMat);
  labelMesh.rotation.x = -Math.PI / 2;
  labelMesh.position.set(0.15, 0.78, -0.55);
  batteryPack.add(labelMesh);

  // Power Leads (Red / Black Wires)
  const wireMatRed = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.5 });
  const wireMatBlack = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.5 });
  
  const wireCurve1 = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.0, 0.65, 0.1),
    new THREE.Vector3(-0.2, 0.6, 0.3),
    new THREE.Vector3(-0.35, 0.42, 0.4)
  ]);
  const wireGeo1 = new THREE.TubeGeometry(wireCurve1, 12, 0.02, 8, false);
  batteryPack.add(new THREE.Mesh(wireGeo1, wireMatRed));

  const wireCurve2 = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.2, 0.65, 0.1),
    new THREE.Vector3(0.05, 0.6, 0.3),
    new THREE.Vector3(-0.25, 0.42, 0.4)
  ]);
  const wireGeo2 = new THREE.TubeGeometry(wireCurve2, 12, 0.02, 8, false);
  batteryPack.add(new THREE.Mesh(wireGeo2, wireMatBlack));

  // 3-Stage Side LED Power Gauge
  for (let i = 0; i < 3; i++) {
    const battLedGeo = new THREE.BoxGeometry(0.04, 0.04, 0.08);
    const battLed = new THREE.Mesh(battLedGeo, materials.greenLedMat);
    battLed.position.set(-0.95, 0.7 + i * 0.08, -0.2);
    batteryPack.add(battLed);
  }

  rootGroup.add(batteryPack);
  parts.batteryPack = batteryPack;


  /* -------------------------------------------------------------
     LAYER 4: THUMB REST WING & SIDE THUMB WHEEL MODULE
     ------------------------------------------------------------- */
  const thumbModule = new THREE.Group();
  thumbModule.name = 'thumbModule';
  thumbModule.userData = {
    title: 'Thumb Wheel & Gesture Rest Module',
    desc: 'Diamond-faceted thumb rest with hidden mechanical gesture button, Forward/Back navigation toggles, and machined stainless steel side scroll wheel.',
    tag: 'Thumb & Navigation',
    explodePos: new THREE.Vector3(-1.6, 0.4, 0.1),
    explodeRot: new THREE.Vector3(0, -0.3, -0.2)
  };

  // Sculpted Thumb Wing Base
  const thumbWingShape = new THREE.Shape();
  thumbWingShape.moveTo(-0.4, -1.0);
  thumbWingShape.lineTo(0.2, -1.0);
  thumbWingShape.lineTo(0.4, 0.6);
  thumbWingShape.quadraticCurveTo(-0.2, 1.0, -1.1, 0.4);
  thumbWingShape.quadraticCurveTo(-1.3, -0.4, -0.4, -1.0);

  const thumbWingGeo = new THREE.ExtrudeGeometry(thumbWingShape, {
    depth: 0.35,
    bevelEnabled: true,
    bevelThickness: 0.08,
    bevelSize: 0.06,
    bevelSegments: 4
  });
  thumbWingGeo.rotateX(Math.PI / 2);
  thumbWingGeo.center();
  const thumbWingMesh = new THREE.Mesh(thumbWingGeo, materials.rubberGripMat);
  thumbWingMesh.position.set(-1.1, 0.65, 0.0);
  thumbWingMesh.castShadow = true;
  thumbModule.add(thumbWingMesh);

  // Bronze Side Trim Accent Strip
  const trimCurve = new THREE.BoxGeometry(0.08, 0.15, 1.6);
  const trimMesh = new THREE.Mesh(trimCurve, materials.trimAccentMat);
  trimMesh.position.set(-1.25, 0.85, 0.0);
  trimMesh.rotation.y = 0.1;
  thumbModule.add(trimMesh);

  // Side Thumb Scroll Wheel (Knurled Metal Cylinder)
  const thumbWheelGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.35, 24);
  const thumbWheel = new THREE.Mesh(thumbWheelGeo, materials.knurledSteelMat);
  thumbWheel.rotation.z = Math.PI / 2;
  thumbWheel.position.set(-0.85, 0.95, 0.35);
  thumbWheel.castShadow = true;
  thumbModule.add(thumbWheel);

  // Forward and Back Buttons (Angular dual buttons)
  const fwdBtnGeo = new THREE.BoxGeometry(0.12, 0.14, 0.25);
  const fwdBtn = new THREE.Mesh(fwdBtnGeo, materials.switchBodyMat);
  fwdBtn.position.set(-0.9, 0.95, 0.0);
  thumbModule.add(fwdBtn);

  const backBtnGeo = new THREE.BoxGeometry(0.12, 0.14, 0.25);
  const backBtn = new THREE.Mesh(backBtnGeo, materials.switchBodyMat);
  backBtn.position.set(-0.9, 0.95, -0.3);
  thumbModule.add(backBtn);

  rootGroup.add(thumbModule);
  parts.thumbModule = thumbModule;


  /* -------------------------------------------------------------
     LAYER 5: TACTILE CLICK SWITCHES & DPI CLUTCH
     ------------------------------------------------------------- */
  const clickButtons = new THREE.Group();
  clickButtons.name = 'clickButtons';
  clickButtons.userData = {
    title: 'Omron Mechanical Tactile Switches',
    desc: 'High-end microswitches rated for 10,000,000+ crisp, tactile clicks. Includes middle SmartShift mode-toggle switch.',
    tag: 'Tactile Switches',
    explodePos: new THREE.Vector3(0, 0.6, 0.9),
    explodeRot: new THREE.Vector3(0.15, 0, 0)
  };

  // Left Omron Switch Box
  function createOmronSwitch(x, z) {
    const swGroup = new THREE.Group();
    const bodyGeo = new THREE.BoxGeometry(0.25, 0.3, 0.45);
    const body = new THREE.Mesh(bodyGeo, materials.switchBodyMat);
    swGroup.add(body);

    const plungerGeo = new THREE.BoxGeometry(0.08, 0.08, 0.12);
    const plunger = new THREE.Mesh(plungerGeo, materials.switchPlungerMat);
    plunger.position.set(0, 0.18, 0.1);
    swGroup.add(plunger);

    swGroup.position.set(x, 0.72, z);
    return swGroup;
  }

  const leftSwitch = createOmronSwitch(-0.45, 1.4);
  const rightSwitch = createOmronSwitch(0.45, 1.4);
  const modeSwitch = createOmronSwitch(0.0, 0.55);
  clickButtons.add(leftSwitch);
  clickButtons.add(rightSwitch);
  clickButtons.add(modeSwitch);

  rootGroup.add(clickButtons);
  parts.clickButtons = clickButtons;


  /* -------------------------------------------------------------
     LAYER 6: MAGSPEED PRIMARY SCROLL WHEEL ASSEMBLY
     ------------------------------------------------------------- */
  const wheelAssembly = new THREE.Group();
  wheelAssembly.name = 'wheelAssembly';
  wheelAssembly.userData = {
    title: 'MagSpeed™ Kinetic Scroll Wheel Assembly',
    desc: 'Machined solid stainless steel wheel with diamond knurled perimeter, SmartShift auto-ratchet clutch, and middle click optical encoder.',
    tag: 'MagSpeed Wheel',
    explodePos: new THREE.Vector3(0, 1.3, 1.1),
    explodeRot: new THREE.Vector3(0.35, 0, 0)
  };

  // Wheel Carriage Frame
  const carriageGeo = new THREE.BoxGeometry(0.45, 0.3, 0.8);
  const carriage = new THREE.Mesh(carriageGeo, materials.switchBodyMat);
  carriage.position.set(0, 0.75, 1.1);
  wheelAssembly.add(carriage);

  // Main Scroll Wheel (Solid Knurled Steel Cylinder)
  const mainWheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.3, 32);
  const mainWheel = new THREE.Mesh(mainWheelGeo, materials.knurledSteelMat);
  mainWheel.rotation.z = Math.PI / 2;
  mainWheel.position.set(0, 1.0, 1.15);
  mainWheel.castShadow = true;
  wheelAssembly.add(mainWheel);

  // Rubber Traction Center Ring
  const ringGeo = new THREE.CylinderGeometry(0.385, 0.385, 0.12, 32);
  const centerRing = new THREE.Mesh(ringGeo, materials.wheelRubberMat);
  centerRing.rotation.z = Math.PI / 2;
  centerRing.position.set(0, 1.0, 1.15);
  wheelAssembly.add(centerRing);

  // SmartShift Mode Toggle Button
  const modeBtnGeo = new THREE.BoxGeometry(0.14, 0.08, 0.2);
  const modeBtn = new THREE.Mesh(modeBtnGeo, materials.knurledSteelMat);
  modeBtn.position.set(0, 1.0, 0.6);
  wheelAssembly.add(modeBtn);

  rootGroup.add(wheelAssembly);
  parts.wheelAssembly = wheelAssembly;


  /* -------------------------------------------------------------
     LAYER 7: TOP SCULPTED ERGONOMIC PALM SHELL
     ------------------------------------------------------------- */
  const topShell = new THREE.Group();
  topShell.name = 'topShell';
  topShell.userData = {
    title: 'Hand-Crafted Ergonomic Top Shell',
    desc: 'Signature asymmetrical palm arch with oleophobic soft-touch graphite finish, independent spring-loaded click flippers, and metallic Logitech emblem.',
    tag: 'Ergonomic Shell',
    explodePos: new THREE.Vector3(0, 1.7, -0.3),
    explodeRot: new THREE.Vector3(0.2, 0, 0)
  };

  // Sculpted Palm Arch using Smooth Extrusion / Lofts
  const shellArchShape = new THREE.Shape();
  shellArchShape.moveTo(-1.0, -1.6);
  shellArchShape.lineTo(0.95, -1.6);
  shellArchShape.quadraticCurveTo(1.2, -0.4, 1.05, 0.8);
  shellArchShape.lineTo(0.8, 1.8);
  // Cutout slot for the scroll wheel
  shellArchShape.lineTo(0.22, 1.8);
  shellArchShape.lineTo(0.22, 0.7);
  shellArchShape.lineTo(-0.22, 0.7);
  shellArchShape.lineTo(-0.22, 1.8);
  shellArchShape.lineTo(-0.8, 1.8);
  shellArchShape.quadraticCurveTo(-1.25, 0.8, -1.2, -0.4);
  shellArchShape.quadraticCurveTo(-1.15, -1.2, -1.0, -1.6);

  const shellExtrudeSettings = {
    depth: 0.6,
    bevelEnabled: true,
    bevelThickness: 0.35,
    bevelSize: 0.15,
    bevelSegments: 8
  };

  const shellGeo = new THREE.ExtrudeGeometry(shellArchShape, shellExtrudeSettings);
  shellGeo.rotateX(Math.PI / 2);
  shellGeo.center();
  
  // Custom vertex deformation to give realistic asymmetrical palm tilt to the right
  const posAttr = shellGeo.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const y = posAttr.getY(i);
    const z = posAttr.getZ(i);

    // Arch elevation peaking near center-left
    const arch = Math.cos((x + 0.2) * 1.1) * Math.cos((z + 0.3) * 0.9);
    posAttr.setY(i, y + Math.max(0, arch * 0.65));
  }
  shellGeo.computeVertexNormals();

  const shellMesh = new THREE.Mesh(shellGeo, materials.topShellMat);
  shellMesh.position.set(0, 1.05, 0);
  shellMesh.castShadow = true;
  shellMesh.receiveShadow = true;
  topShell.add(shellMesh);

  // Left & Right Primary Click Flipper Separator Line
  const clickDividerGeo = new THREE.BoxGeometry(0.04, 0.3, 1.0);
  const clickDivider = new THREE.Mesh(clickDividerGeo, materials.switchBodyMat);
  clickDivider.position.set(0, 1.25, 1.4);
  topShell.add(clickDivider);

  // Metallic Logitech Logo Badge on Palm Rest
  const logoGeo = new THREE.PlaneGeometry(0.4, 0.15);
  const logoMat = new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    roughness: 0.2,
    metalness: 0.9,
    transparent: true,
    opacity: 0.85
  });
  const logoMesh = new THREE.Mesh(logoGeo, logoMat);
  logoMesh.rotation.x = -Math.PI / 2.3;
  logoMesh.position.set(0, 1.42, -0.7);
  topShell.add(logoMesh);

  rootGroup.add(topShell);
  parts.topShell = topShell;

  // Save initial base positions & rotations for interpolation
  Object.keys(parts).forEach(key => {
    const part = parts[key];
    part.userData.initialPos = part.position.clone();
    part.userData.initialRot = part.rotation.clone();
  });

  return {
    root: rootGroup,
    parts,
    materials,
    setColorway: (colorName) => {
      let mainColor = 0x1e2124;
      let accentColor = 0x8a7258;

      if (colorName === 'meteorite') {
        mainColor = 0x4b525d;
        accentColor = 0x9ca3af;
      } else if (colorName === 'teal') {
        mainColor = 0x15313d;
        accentColor = 0x38bdf8;
      }

      materials.topShellMat.color.setHex(mainColor);
      materials.trimAccentMat.color.setHex(accentColor);
    }
  };
}
