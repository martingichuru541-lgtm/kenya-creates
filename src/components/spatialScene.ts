import * as THREE from 'three';
import * as xb from 'xrblocks';
import { storage } from '../services/storageService';

export class KenyaCreatesSpatialScene extends xb.Script {
  private domeGroup: THREE.Group = new THREE.Group();
  private centerpiece: THREE.Mesh | null = null;
  private countyRings: THREE.Group = new THREE.Group();
  private prototypeGroup: THREE.Group = new THREE.Group();
  private prototypeIndex: number = 0;
  private rotatePrototypes: boolean = true;
  private prototypeNames = [
    'M-Nyunyu IoT Solar Soil Valve',
    'AgriScan Spectral Crop Drone',
    'Turkana Solar Desalination Pod',
    '3D Myoelectric Prosthetic Arm',
  ];
  private lightHemisphere: THREE.HemisphereLight | null = null;
  private lightDirect: THREE.DirectionalLight | null = null;
  private spatialCard: xb.UICard | null = null;
  private activeProtoText: xb.UIText | null = null;

  init() {
    this.add(this.domeGroup);

    // 1. Lighting with Kenya-inspired warm accents
    this.lightHemisphere = new THREE.HemisphereLight(0xfff8ee, 0x112211, 2.8);
    this.add(this.lightHemisphere);

    this.lightDirect = new THREE.DirectionalLight(0x00cc77, 1.8);
    this.lightDirect.position.set(2, 4, 1);
    this.add(this.lightDirect);

    const warmLight = new THREE.DirectionalLight(0xffaa22, 1.2);
    warmLight.position.set(-2, 3, -1);
    this.add(warmLight);

    // 2. Build Central Holographic Globe & 47 County Orbiters
    this.buildHolographicCenterpiece();

    // 3. Build Interactive 3D Prototype Pedestal
    this.buildPrototypePedestal();

    // 4. Build Spatial UI Card (using xrblocks built-in spatial UI)
    this.buildSpatialUiCard();
  }

  private buildHolographicCenterpiece() {
    const centerGroup = new THREE.Group();
    centerGroup.position.set(0, 1.6, -1.8);

    // Inner glowing sphere
    const sphereGeo = new THREE.IcosahedronGeometry(0.28, 3);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0x008855,
      roughness: 0.2,
      metalness: 0.8,
      wireframe: true,
      transparent: true,
      opacity: 0.7,
    });
    this.centerpiece = new THREE.Mesh(sphereGeo, sphereMat);
    centerGroup.add(this.centerpiece);

    // Outer golden gimbal ring
    const ringGeo = new THREE.TorusGeometry(0.36, 0.012, 16, 64);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.9,
      roughness: 0.2,
    });
    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    ring1.rotation.x = Math.PI / 4;
    centerGroup.add(ring1);

    const ring2 = new THREE.Mesh(ringGeo, ringMat);
    ring2.rotation.y = Math.PI / 3;
    centerGroup.add(ring2);

    // 47 County orbiting dots
    const countiesGroup = new THREE.Group();
    const dotGeo = new THREE.SphereGeometry(0.015, 8, 8);
    const dotMat = new THREE.MeshBasicMaterial({ color: 0x66ffaa });

    for (let i = 0; i < 47; i++) {
      const dot = new THREE.Mesh(dotGeo, dotMat);
      const angle = (i / 47) * Math.PI * 2;
      const radius = 0.52 + (i % 3) * 0.08;
      const height = ((i % 5) - 2) * 0.07;
      dot.position.set(Math.cos(angle) * radius, height, Math.sin(angle) * radius);
      countiesGroup.add(dot);
    }

    this.countyRings = countiesGroup;
    centerGroup.add(countiesGroup);

    this.domeGroup.add(centerGroup);
  }

  private buildPrototypePedestal() {
    this.prototypeGroup = new THREE.Group();
    this.prototypeGroup.position.set(0.7, 1.25, -1.3);

    // Pedestal base
    const baseGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.04, 32);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x1f2937,
      metalness: 0.7,
      roughness: 0.3,
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = -0.15;
    this.prototypeGroup.add(base);

    // Holographic glowing rim
    const rimGeo = new THREE.TorusGeometry(0.19, 0.008, 16, 32);
    const rimMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = -0.13;
    this.prototypeGroup.add(rim);

    // Build the 4 interchangeable 3D models
    this.updatePrototypeModel();

    this.domeGroup.add(this.prototypeGroup);
  }

  private updatePrototypeModel() {
    // Clear previous children above base
    const toRemove: THREE.Object3D[] = [];
    this.prototypeGroup.children.forEach((child) => {
      if (child.position.y > -0.1) {
        toRemove.push(child);
      }
    });
    toRemove.forEach((c) => this.prototypeGroup.remove(c));

    const modelHolder = new THREE.Group();
    modelHolder.name = 'ActivePrototypeModel';

    if (this.prototypeIndex === 0) {
      // Prototype 0: M-Nyunyu Solar Irrigation Sensor
      // Central sensor box
      const boxGeo = new THREE.BoxGeometry(0.09, 0.14, 0.06);
      const boxMat = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.3 });
      const box = new THREE.Mesh(boxGeo, boxMat);
      box.position.y = 0.07;
      modelHolder.add(box);

      // Solar top panel
      const solarGeo = new THREE.BoxGeometry(0.12, 0.015, 0.1);
      const solarMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.9, roughness: 0.1 });
      const solar = new THREE.Mesh(solarGeo, solarMat);
      solar.position.set(0, 0.14, 0);
      solar.rotation.x = -0.2;
      modelHolder.add(solar);

      // Soil probe spikes
      const probeGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.14, 8);
      const probeMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.9 });
      const probe1 = new THREE.Mesh(probeGeo, probeMat);
      probe1.position.set(-0.025, -0.05, 0);
      const probe2 = new THREE.Mesh(probeGeo, probeMat);
      probe2.position.set(0.025, -0.05, 0);
      modelHolder.add(probe1, probe2);

      // Status blinking LED
      const ledGeo = new THREE.SphereGeometry(0.008, 8, 8);
      const ledMat = new THREE.MeshBasicMaterial({ color: 0x34d399 });
      const led = new THREE.Mesh(ledGeo, ledMat);
      led.position.set(0, 0.1, 0.032);
      modelHolder.add(led);
    } else if (this.prototypeIndex === 1) {
      // Prototype 1: AgriScan Drone
      const droneBodyGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.03, 16);
      const droneMat = new THREE.MeshStandardMaterial({ color: 0xf3f4f6, metalness: 0.8 });
      const droneBody = new THREE.Mesh(droneBodyGeo, droneMat);
      modelHolder.add(droneBody);

      // 4 Arms
      for (let i = 0; i < 4; i++) {
        const armGeo = new THREE.CylinderGeometry(0.007, 0.007, 0.16, 8);
        const arm = new THREE.Mesh(armGeo, droneMat);
        const angle = (i * Math.PI) / 2 + Math.PI / 4;
        arm.rotation.z = Math.PI / 2;
        arm.rotation.y = angle;
        arm.position.set(Math.cos(angle) * 0.08, 0, Math.sin(angle) * 0.08);

        // Rotor
        const rotorGeo = new THREE.BoxGeometry(0.1, 0.004, 0.012);
        const rotorMat = new THREE.MeshStandardMaterial({ color: 0x111827 });
        const rotor = new THREE.Mesh(rotorGeo, rotorMat);
        rotor.position.set(Math.cos(angle) * 0.14, 0.02, Math.sin(angle) * 0.14);
        modelHolder.add(arm, rotor);
      }

      // Camera sensor
      const camGeo = new THREE.SphereGeometry(0.02, 12, 12);
      const camMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, metalness: 0.9 });
      const cam = new THREE.Mesh(camGeo, camMat);
      cam.position.set(0, -0.025, 0.02);
      modelHolder.add(cam);
    } else if (this.prototypeIndex === 2) {
      // Prototype 2: Turkana Desalination Chamber
      const tankGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.18, 24);
      const tankMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        roughness: 0.1,
        transparent: true,
        opacity: 0.85,
      });
      const tank = new THREE.Mesh(tankGeo, tankMat);
      modelHolder.add(tank);

      // Condensation cone
      const coneGeo = new THREE.ConeGeometry(0.09, 0.08, 24);
      const coneMat = new THREE.MeshStandardMaterial({ color: 0xe0f2fe, metalness: 0.7 });
      const cone = new THREE.Mesh(coneGeo, coneMat);
      cone.position.y = 0.13;
      modelHolder.add(cone);

      // Water tap & pipe
      const pipeGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.06, 8);
      const pipeMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8 });
      const pipe = new THREE.Mesh(pipeGeo, pipeMat);
      pipe.rotation.x = Math.PI / 2;
      pipe.position.set(0, -0.04, 0.09);
      modelHolder.add(pipe);
    } else {
      // Prototype 3: 3D Myoelectric Hand
      const palmGeo = new THREE.BoxGeometry(0.08, 0.1, 0.04);
      const palmMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4 });
      const palm = new THREE.Mesh(palmGeo, palmMat);
      modelHolder.add(palm);

      // 4 Fingers + Thumb
      for (let f = 0; f < 4; f++) {
        const fingerGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.07, 8);
        const fingerMat = new THREE.MeshStandardMaterial({ color: 0x374151 });
        const finger = new THREE.Mesh(fingerGeo, fingerMat);
        finger.position.set(-0.03 + f * 0.02, 0.08, 0);
        modelHolder.add(finger);
      }
      const thumbGeo = new THREE.CylinderGeometry(0.009, 0.009, 0.05, 8);
      const thumbMat = new THREE.MeshStandardMaterial({ color: 0x374151 });
      const thumb = new THREE.Mesh(thumbGeo, thumbMat);
      thumb.rotation.z = -Math.PI / 4;
      thumb.position.set(0.045, 0.01, 0);
      modelHolder.add(thumb);
    }

    this.prototypeGroup.add(modelHolder);

    if (this.activeProtoText) {
      this.activeProtoText.text = this.prototypeNames[this.prototypeIndex];
    }
  }

  private buildSpatialUiCard() {
    this.activeProtoText = new xb.UIText({
      text: this.prototypeNames[this.prototypeIndex],
      style: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#10b981',
      },
    });

    const statusText = new xb.UIText({
      text: 'Interactive 3D Prototype Showcase',
      style: { fontSize: 14, opacity: 0.8, textAlign: 'center' },
    });

    const nextBtn = new xb.UIButton({
      label: 'Next Innovation >',
      style: { flexGrow: 1, padding: 8 },
      onClick: () => {
        this.prototypeIndex = (this.prototypeIndex + 1) % this.prototypeNames.length;
        this.updatePrototypeModel();
      },
    });

    const toggleRotateBtn = new xb.UIButton({
      label: 'Toggle Rotation',
      style: { flexGrow: 1, padding: 8 },
      onClick: () => {
        this.rotatePrototypes = !this.rotatePrototypes;
      },
    });

    const stats = storage.getLiveStatistics();
    const statsText = new xb.UIText({
      text: `${stats.projectsPublished} Projects Published • 47 Counties Represented`,
      style: { fontSize: 13, opacity: 0.7, textAlign: 'center', marginTop: 4 },
    });

    this.spatialCard = new xb.UICard({
      size: { width: 0.58, height: 'auto' },
      manipulation: true,
      edge: true,
      style: {
        flexDirection: 'column',
        gap: 12,
        padding: 16,
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        borderRadius: 16,
      },
      children: [
        new xb.UIText({
          text: 'KENYA CREATES',
          style: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' },
        }),
        statusText,
        this.activeProtoText,
        new xb.UIPanel({
          style: { width: '100%', flexDirection: 'row', gap: 8 },
          children: [nextBtn, toggleRotateBtn],
        }),
        statsText,
      ],
    });

    this.spatialCard.position.set(-0.75, 1.45, -1.3);
    this.spatialCard.rotation.y = 0.35;
    this.add(this.spatialCard);
  }

  update() {
    // Gentle rotation animations
    if (this.centerpiece) {
      this.centerpiece.rotation.y += 0.008;
      this.centerpiece.rotation.x += 0.003;
    }

    if (this.countyRings) {
      this.countyRings.rotation.y -= 0.004;
    }

    if (this.rotatePrototypes && this.prototypeGroup) {
      const activeModel = this.prototypeGroup.getObjectByName('ActivePrototypeModel');
      if (activeModel) {
        activeModel.rotation.y += 0.015;
      }
    }
  }

  onSelectEnd(event: xb.SelectEvent) {
    // Interacting with 3D space advances prototype and creates pleasant pulse
    this.prototypeIndex = (this.prototypeIndex + 1) % this.prototypeNames.length;
    this.updatePrototypeModel();
  }

  dispose() {
    this.domeGroup.clear();
  }
}
