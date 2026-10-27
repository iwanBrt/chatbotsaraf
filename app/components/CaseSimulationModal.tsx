"use client";

import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Info,
  Brain,
  Flame,
  ZoomIn,
  ZoomOut,
  TrendingUp,
  Tag,
  Gauge,
  Sparkles,
} from "lucide-react";
import { LEARNING_CASES } from "../data/learningCases";

interface CaseSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCaseId?: string | null;
  currentStepNumber?: number;
}

export interface AnatomicalLabelDef {
  id: string;
  name: string;
  pos: [number, number, number];
  dx: number;
  dy: number;
  info: string;
}

export const CASE_ANATOMICAL_LABELS: Record<string, AnatomicalLabelDef[]> = {
  "kasus-1": [
    {
      id: "dendrit",
      name: "Dendrit",
      pos: [-5.6, 2.2, 0.5],
      dx: 20,
      dy: -45,
      info: "Dendrit: Percabangan pendek yang menerima impuls dari reseptor atau neuron lain dan membawanya menuju badan sel.",
    },
    {
      id: "soma",
      name: "Badan sel dan inti",
      pos: [-4.7, -0.9, 0],
      dx: 0,
      dy: 52,
      info: "Badan sel dan inti: Mengatur metabolisme neuron serta menyatukan sinyal listrik sebelum memicu potensial aksi.",
    },
    {
      id: "axon",
      name: "Akson",
      pos: [-0.2, 0, 0],
      dx: 0,
      dy: -45,
      info: "Akson: Serabut panjang silindris yang menghantarkan impuls listrik menjauhi badan sel menuju neuron atau efektor berikutnya.",
    },
    {
      id: "myelin",
      name: "Selubung mielin",
      pos: [-1.0, -0.48, 0],
      dx: 0,
      dy: 52,
      info: "Selubung mielin: Lapisan isolator berlemak (sel Schwann) yang membuat impuls melompat cepat (konduksi saltatori hingga 100 m/s).",
    },
    {
      id: "node",
      name: "Nodus Ranvier",
      pos: [1.4, 0, 0],
      dx: 0,
      dy: -45,
      info: "Nodus Ranvier: Celah antar selubung mielin tempat terkonsentrasinya kanal ion Na⁺/K⁺ untuk melompatkan impuls.",
    },
    {
      id: "term",
      name: "Ujung akson",
      pos: [5.8, 0.5, 0],
      dx: -20,
      dy: -50,
      info: "Ujung akson (terminal sinaptik): Melepaskan neurotransmiter ke celah sinapsis untuk meneruskan sinyal.",
    },
  ],
  "kasus-2": [
    {
      id: "na_pore",
      name: "Kanal Na⁺ (Depolarisasi)",
      pos: [-1.8, 0.65, 0],
      dx: -20,
      dy: -50,
      info: "Kanal Ion Na⁺: Membuka saat stimulus mencapai ambang batas (-55mV), ion Na⁺ masuk memicu depolarisasi hingga +30mV.",
    },
    {
      id: "bilayer",
      name: "Fosfolipid Bilayer",
      pos: [-3.2, 0.5, 0],
      dx: 0,
      dy: 48,
      info: "Lapisan Ganda Fosfolipid: Struktur membran hidrofobik yang menjaga perbedaan muatan ion dalam dan luar sel.",
    },
    {
      id: "na_pump",
      name: "Pompa Na⁺/K⁺ (ATPase)",
      pos: [0, 0.65, 0],
      dx: 0,
      dy: -52,
      info: "Pompa Natrium-Kalium: Memompa 3 Na⁺ keluar dan 2 K⁺ ke dalam sel menggunakan energi ATP untuk menjaga potensial istirahat (-70mV).",
    },
    {
      id: "k_pore",
      name: "Kanal K⁺ (Repolarisasi)",
      pos: [1.8, 0.65, 0],
      dx: 20,
      dy: -50,
      info: "Kanal Ion K⁺: Membuka pada puncak potensial aksi, ion K⁺ keluar meninggalkan sel untuk memulihkan muatan negatif sel (repolarisasi).",
    },
  ],
  "kasus-3": [
    {
      id: "vesicles",
      name: "Vesikel Sinapsis",
      pos: [-1.8, 0.8, 0],
      dx: -20,
      dy: -48,
      info: "Vesikel Sinaptik: Kantung membran di tombol terminal prasinaptik yang menyimpan ribuan molekul neurotransmiter.",
    },
    {
      id: "cleft",
      name: "Celah Sinapsis (20-40 nm)",
      pos: [0, 0, 0],
      dx: 0,
      dy: 50,
      info: "Celah Sinapsis: Ruang sempit mikroskopis (20-40 nm) antarneuron tempat neurotransmiter berdifusi.",
    },
    {
      id: "receptors",
      name: "Reseptor Pascasinaptik",
      pos: [1.8, 0.8, 0],
      dx: 20,
      dy: -48,
      info: "Reseptor Protein: Saluran membran pada membran penerima yang membuka saat neurotransmiter menempel spesifik (kunci & gembok).",
    },
  ],
  "kasus-4": [
    {
      id: "cerebrum",
      name: "Otak Besar (Serebrum)",
      pos: [0.2, 3.48, 0.2],
      dx: 45,
      dy: -30,
      info: "Otak Besar (Serebrum): Pusat berpikir dan kesadaran (~250 ms). Pada gerak sadar, impuls diolah di korteks serebrum.",
    },
    {
      id: "spinal",
      name: "Medula Spinalis",
      pos: [0.05, 1.9, -0.2],
      dx: -55,
      dy: -25,
      info: "Sumsum Tulang Belakang: Pusat integrasi busur refleks kilat (~30 ms). Interneuron langsung meneruskan sinyal ke motorik tanpa menunggu otak.",
    },
    {
      id: "biceps",
      name: "Otot Bisep (Efektor)",
      pos: [1.62, 1.58, 0.2],
      dx: 45,
      dy: 15,
      info: "Efektor Otot Lengan (Bisep): Menerima perintah motorik dan berkontraksi menarik tangan menjauh dalam hitungan milidetik.",
    },
    {
      id: "heat",
      name: "Rangsang Panas (Jari & Api)",
      pos: [1.99, -0.7, 0.34],
      dx: 45,
      dy: 30,
      info: "Rangsang Panas: Termoreseptor di ujung jari mendeteksi suhu tinggi dan langsung memicu impuls sensorik darurat.",
    },
  ],
  "kasus-5": [
    {
      id: "c5_brain",
      name: "Otak & Medula (SSP)",
      pos: [0, 2.6, 0],
      dx: 0,
      dy: -48,
      info: "Sistem Saraf Pusat: Pusat pengolah dan pengambil keputusan seluruh integrasi sensorik-motorik tubuh.",
    },
    {
      id: "c5_receptor",
      name: "1. Reseptor Sensorik",
      pos: [-4.2, -1.5, 0],
      dx: -20,
      dy: -40,
      info: "Titik Input Reseptor: Mengubah rangsang lingkungan menjadi potensial aksi.",
    },
    {
      id: "c5_axon",
      name: "2. Akson & Mielin",
      pos: [-1.8, 0.5, 0],
      dx: -20,
      dy: 45,
      info: "Kabel Akson & Mielin: Menghantarkan impuls secara saltatori menuju sistem saraf pusat.",
    },
    {
      id: "c5_synapse",
      name: "3. Celah Sinapsis",
      pos: [1.8, 0.5, 0],
      dx: 20,
      dy: 45,
      info: "Jembatan Kimiawi Sinapsis: Menyalurkan sinyal antar sel saraf menggunakan neurotransmiter.",
    },
    {
      id: "c5_effector",
      name: "4. Efektor Otot",
      pos: [4.2, -1.5, 0],
      dx: 20,
      dy: -40,
      info: "Efektor Akhir: Otot atau kelenjar yang mengeksekusi gerakan atau reaksi biologis.",
    },
  ],
};

export const CaseSimulationModal: React.FC<CaseSimulationModalProps> = ({
  isOpen,
  onClose,
  initialCaseId,
}) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(
    initialCaseId || "kasus-1"
  );
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(1);
  const [comparisonMode, setComparisonMode] = useState<"normal" | "abnormal">(
    "abnormal"
  );
  const [selectedElementInfo, setSelectedElementInfo] = useState<string | null>(
    null
  );
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);

  // Kasus 2 state
  const [ionPhase, setIonPhase] = useState<
    "resting" | "depolarizing" | "repolarizing"
  >("resting");
  const [voltageValue, setVoltageValue] = useState<number>(-70);

  // Kasus 4 state
  const [reflexType, setReflexType] = useState<"reflex" | "conscious">("reflex");
  const [reflexFlinchTrigger, setReflexFlinchTrigger] = useState<number>(0);

  // Kasus 5 diagnostic checkpoint
  const [testedCheckpoint, setTestedCheckpoint] = useState<number>(2); // default akson mielin
  const [latencyReadout, setLatencyReadout] = useState<string>("Normal: ~15 ms (100 m/s)");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgLabelsRef = useRef<SVGSVGElement | null>(null);
  const domLabelsRef = useRef<HTMLDivElement | null>(null);
  const labelElementsRef = useRef<{
    def: AnatomicalLabelDef;
    button: HTMLButtonElement;
    line: SVGLineElement;
    circle: SVGCircleElement;
    vec: THREE.Vector3;
  }[]>([]);

  // References to Three.js objects
  const threeRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    rootGroup: THREE.Group;
    // 5 Case Groups
    case1Group: THREE.Group;
    case2Group: THREE.Group;
    case3Group: THREE.Group;
    case4Group: THREE.Group;
    case5Group: THREE.Group;
    // Kasus 1 Meshes
    myelinMeshes: THREE.Mesh[];
    damagedMyelinMeshes: THREE.Mesh[];
    nodesOfRanvier: THREE.Mesh[];
    somaMesh?: THREE.Mesh;
    // Kasus 2 Meshes
    naPores: THREE.Mesh[];
    kPores: THREE.Mesh[];
    naGateLeft?: THREE.Mesh;
    kGateLeft?: THREE.Mesh;
    naGateInact?: THREE.Mesh;
    naPump?: THREE.Mesh;
    // Kasus 3 Meshes
    synapticVesicles: THREE.Mesh[];
    receptors: THREE.Mesh[];
    preSynBulb?: THREE.Mesh;
    postSynMembrane?: THREE.Mesh;
    // Kasus 4 Meshes
    flameParticles: THREE.Mesh[];
    bicepsMuscle?: THREE.Mesh;
    spinalRing?: THREE.Mesh;
    cerebrumHemiLeft?: THREE.Mesh;
    cerebrumHemiRight?: THREE.Mesh;
    forearmGroup?: THREE.Group;
    // Curves
    case1AxonCurve: THREE.Curve<THREE.Vector3>;
    case4SensoryCurve: THREE.Curve<THREE.Vector3>;
    case4ReflexMotorCurve: THREE.Curve<THREE.Vector3>;
    case4SpinalAscendCurve: THREE.Curve<THREE.Vector3>;
    case4ConsciousMotorCurve: THREE.Curve<THREE.Vector3>;
    // Dynamic Impulses and Particles
    impulses: {
      mesh: THREE.Mesh;
      light?: THREE.PointLight;
      curve: THREE.Curve<THREE.Vector3>;
      progress: number;
      speed: number;
      onComplete?: () => void;
    }[];
    particles: {
      mesh: THREE.Mesh;
      velocity: THREE.Vector3;
      life: number;
      maxLife: number;
    }[];
    ambientDust: THREE.Points;
    // Controls
    rotationY: number;
    rotationX: number;
    targetDistance: number;
    isInteracting: boolean;
    lastTime: number;
  } | null>(null);

  // Sync selectedCaseId when initialCaseId prop changes
  useEffect(() => {
    if (initialCaseId) {
      setSelectedCaseId(initialCaseId);
    }
  }, [initialCaseId]);

  // Update diagnostic latency readout for Kasus 5
  useEffect(() => {
    if (selectedCaseId === "kasus-5") {
      if (comparisonMode === "abnormal") {
        if (testedCheckpoint === 2) {
          setLatencyReadout("Terhambat di Mielin: 15 m/s (+85 ms Delay Terdeteksi)");
        } else if (testedCheckpoint === 3) {
          setLatencyReadout("Blokade Sinapsis: Sinyal Kimia Gagal Menyeberang (+120 ms)");
        } else if (testedCheckpoint === 1) {
          setLatencyReadout("Ambang Reseptor Tinggi: Sinyal Rangsang Terlambat Dipicu");
        } else {
          setLatencyReadout("Kelelahan Efektor: Respons Otot Tertunda Signifikan");
        }
      } else {
        setLatencyReadout("Normal & Optimal: ~15 ms (Konduksi Cepat Saltatori 100 m/s)");
      }
    }
  }, [selectedCaseId, comparisonMode, testedCheckpoint]);

  // Build 3D direct pointer labels (buttons, leader lines, anchor dots) like in NeuroAR
  const buildAnatomicalLabels = (caseId: string) => {
    const svgEl = svgLabelsRef.current;
    const domEl = domLabelsRef.current;
    if (!svgEl || !domEl) return;

    svgEl.innerHTML = "";
    domEl.innerHTML = "";
    labelElementsRef.current = [];

    const defs = CASE_ANATOMICAL_LABELS[caseId] || [];
    const NS = "http://www.w3.org/2000/svg";

    defs.forEach((def) => {
      // 1. Interactive Button Pill
      const btn = document.createElement("button");
      btn.className = "anat-label";
      btn.textContent = def.name;
      btn.title = `Klik untuk info: ${def.name}`;
      btn.onclick = (e) => {
        e.stopPropagation();
        setSelectedElementInfo(def.info);
        domEl.querySelectorAll(".anat-label").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
      };
      domEl.appendChild(btn);

      // 2. Connecting SVG Leader Line
      const line = document.createElementNS(NS, "line");
      line.setAttribute("stroke", "#38bdf8");
      line.setAttribute("stroke-width", "1.5");
      line.setAttribute("stroke-linecap", "round");
      svgEl.appendChild(line);

      // 3. 3D Anchor Circle Dot on Anatomical Part
      const circle = document.createElementNS(NS, "circle");
      circle.setAttribute("r", "3.5");
      circle.setAttribute("fill", "#38bdf8");
      circle.setAttribute("stroke", "#ffffff");
      circle.setAttribute("stroke-width", "1.2");
      svgEl.appendChild(circle);

      labelElementsRef.current.push({
        def,
        button: btn,
        line,
        circle,
        vec: new THREE.Vector3(...def.pos),
      });
    });
  };

  // Real-time 3D coordinate projection tracking (updates leader lines and badges at 60 FPS)
  const updateAnatomicalLabels = (caseId: string) => {
    const svgEl = svgLabelsRef.current;
    const domEl = domLabelsRef.current;
    if (!svgEl || !domEl) return;

    if (!showLabels) {
      svgEl.style.display = "none";
      domEl.style.display = "none";
      return;
    }
    svgEl.style.display = "block";
    domEl.style.display = "block";

    const state = threeRef.current;
    const container = containerRef.current;
    if (!state || !container) return;

    const w = container.clientWidth;
    const h = container.clientHeight;
    if (w <= 0 || h <= 0) return;

    const groupMap: Record<string, THREE.Group> = {
      "kasus-1": state.case1Group,
      "kasus-2": state.case2Group,
      "kasus-3": state.case3Group,
      "kasus-4": state.case4Group,
      "kasus-5": state.case5Group,
    };
    const activeGroup = groupMap[caseId];
    if (!activeGroup) return;

    state.rootGroup.updateMatrixWorld(true);
    const cam = state.camera;
    const wv = new THREE.Vector3();

    for (const item of labelElementsRef.current) {
      wv.copy(item.vec);
      activeGroup.localToWorld(wv);

      // Depth culling: check if facing camera
      const isFront = wv.z > -cam.position.z * 0.15;
      wv.project(cam);

      if (wv.z >= -1 && wv.z <= 1) {
        const x = (wv.x * 0.5 + 0.5) * w;
        const y = (-wv.y * 0.5 + 0.5) * h;
        const dx = item.def.dx;
        const dy = item.def.dy;
        const tx = x + dx;
        const ty = y + dy;

        item.button.style.left = `${tx}px`;
        item.button.style.top = `${ty}px`;
        item.button.style.transform = `translate(${dx > 0 ? "0" : dx < 0 ? "-100%" : "-50%"}, -50%)`;
        item.button.style.opacity = isFront ? "1" : "0.28";

        const ly = ty - Math.sign(dy) * (dx === 0 ? 11 : 0);
        item.line.setAttribute("x1", x.toFixed(1));
        item.line.setAttribute("y1", y.toFixed(1));
        item.line.setAttribute("x2", tx.toFixed(1));
        item.line.setAttribute("y2", ly.toFixed(1));
        item.line.style.opacity = isFront ? "1" : "0.28";

        item.circle.setAttribute("cx", x.toFixed(1));
        item.circle.setAttribute("cy", y.toFixed(1));
        item.circle.style.opacity = isFront ? "1" : "0.28";
      } else {
        item.button.style.opacity = "0";
        item.line.style.opacity = "0";
        item.circle.style.opacity = "0";
      }
    }
  };

  // Re-build 3D direct pointer labels when case changes or modal opens
  useEffect(() => {
    if (isOpen) {
      buildAnatomicalLabels(selectedCaseId);
    }
  }, [selectedCaseId, isOpen]);

  // Sync active class with selectedElementInfo
  useEffect(() => {
    const domEl = domLabelsRef.current;
    if (!domEl) return;
    domEl.querySelectorAll(".anat-label").forEach((btn) => {
      const labelObj = labelElementsRef.current.find((l) => l.button === btn);
      if (labelObj && selectedElementInfo && selectedElementInfo === labelObj.def.info) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  }, [selectedElementInfo]);

  // Initialize Three.js scene
  useEffect(() => {
    if (!isOpen || !canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    const width = container.clientWidth || 740;
    const height = container.clientHeight || 400;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 14.5);

    // Cinematic Biological Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.85));

    const mainKeyLight = new THREE.DirectionalLight(0xffffff, 1.3);
    mainKeyLight.position.set(10, 14, 12);
    scene.add(mainKeyLight);

    const cyanRimLight = new THREE.DirectionalLight(0x38bdf8, 1.1);
    cyanRimLight.position.set(-14, -8, -10);
    scene.add(cyanRimLight);

    const purpleGlowLight = new THREE.PointLight(0xa855f7, 1.4, 45);
    purpleGlowLight.position.set(-6, 5, 8);
    scene.add(purpleGlowLight);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Organic Material Generator with Tone & Depth
    const matPhysical = (color: number, emissive = 0.2, opts = {}) =>
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.32,
        metalness: 0.15,
        emissive: color,
        emissiveIntensity: emissive,
        ...opts,
      });

    // Helper: Bumpy Organic Spheres (Cellular soma, nucleus, cerebral cortex)
    const createBumpyGeometry = (radius: number, detail = 28, bumpFactor = 0.08, freq = 8) => {
      const geo = new THREE.SphereGeometry(radius, detail, detail);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const z = pos.getZ(i);
        const k = 1 + bumpFactor * Math.sin(x * freq) * Math.sin(y * freq + 1) * Math.sin(z * freq);
        pos.setXYZ(i, x * k, y * k, z * k);
      }
      geo.computeVertexNormals();
      return geo;
    };

    // Ambient floating biological micro-dust (Cytoplasmic / extracellular particles)
    const dustCount = 90;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount * 3; i += 3) {
      dustPos[i] = (Math.random() - 0.5) * 26;
      dustPos[i + 1] = (Math.random() - 0.5) * 18;
      dustPos[i + 2] = (Math.random() - 0.5) * 18;
    }
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.09,
      transparent: true,
      opacity: 0.45,
    });
    const ambientDust = new THREE.Points(dustGeo, dustMat);
    scene.add(ambientDust);

    // =========================================================================
    // 1. KASUS 1: NEURON DENGAN KERUSAKAN SELUBUNG MIELIN (KASUS ANDI)
    // =========================================================================
    const case1Group = new THREE.Group();
    case1Group.scale.setScalar(0.96);
    rootGroup.add(case1Group);

    // Organic Soma (Badan Sel)
    const somaGeo = createBumpyGeometry(1.3, 32, 0.07, 7);
    const somaMat = matPhysical(0x0ea5e9, 0.35, { transparent: true, opacity: 0.88 });
    const somaMesh = new THREE.Mesh(somaGeo, somaMat);
    somaMesh.position.set(-4.7, 0, 0);
    case1Group.add(somaMesh);

    // Inti Sel (Nukleus Glowing Organik)
    const nucleus = new THREE.Mesh(
      createBumpyGeometry(0.55, 20, 0.05, 10),
      matPhysical(0x9333ea, 0.65)
    );
    nucleus.position.set(-4.7, 0, 0);
    case1Group.add(nucleus);

    // Nukleolus di dalam inti
    const nucleolus = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 16, 12),
      matPhysical(0xf472b6, 0.9)
    );
    nucleolus.position.set(-4.7, 0.1, 0.1);
    case1Group.add(nucleolus);

    // Bukit Akson (Axon Hillock - Zona Pemicu Potensial Aksi)
    const hillock = new THREE.Mesh(
      new THREE.ConeGeometry(0.55, 0.9, 20),
      matPhysical(0x38bdf8, 0.4)
    );
    hillock.rotation.z = -Math.PI / 2;
    hillock.position.set(-3.7, 0, 0);
    case1Group.add(hillock);

    // Dendrit-Dendrit Bercabang Organik dengan Duri Dendrit (Spines)
    const dendMat = matPhysical(0x38bdf8, 0.32);
    for (let i = 0; i < 7; i++) {
      const angle = Math.PI * (0.58 + i * 0.14);
      const dx = Math.cos(angle);
      const dy = Math.sin(angle);
      const dz = i % 2 ? 0.45 : -0.45;
      const pts = [
        new THREE.Vector3(-4.7 + dx * 1.1, dy * 1.1, dz * 1.0),
        new THREE.Vector3(-4.7 + dx * 2.3, dy * 2.3, dz * 1.5),
        new THREE.Vector3(-4.7 + dx * 3.6, dy * 3.6, dz * 2.0),
      ];
      case1Group.add(
        new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.08, 6), dendMat)
      );

      // Dendritic spines (bintil penerima sinapsis)
      for (let s = 1; s <= 2; s++) {
        const spine = new THREE.Mesh(
          new THREE.SphereGeometry(0.09, 8, 8),
          matPhysical(0x67e8f9, 0.5)
        );
        spine.position.set(-4.7 + dx * (1.2 + s * 0.9) + 0.15, dy * (1.2 + s * 0.9) + 0.1, dz + 0.1);
        case1Group.add(spine);
      }
    }

    // Akson Panjang Keemasan
    const axon1 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 9.8, 20),
      matPhysical(0xfbbf24, 0.32)
    );
    axon1.position.set(0.3, 0, 0);
    axon1.rotation.z = Math.PI / 2;
    case1Group.add(axon1);

    // 5 Segmen Selubung Mielin Tebal Berlapis (Schwann Cells)
    const myelinMeshes: THREE.Mesh[] = [];
    const damagedMyelinMeshes: THREE.Mesh[] = [];
    const nodesOfRanvier: THREE.Mesh[] = [];
    const myelinX = [-2.6, -1.0, 0.6, 2.2, 3.8];

    myelinX.forEach((xPos, idx) => {
      // Normal Myelin (Kuning keemasan tebal berlapis)
      const mMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.48, 0.48, 1.25, 24),
        matPhysical(0xfef08a, 0.45, { roughness: 0.25, metalness: 0.2 })
      );
      mMesh.position.set(xPos, 0, 0);
      mMesh.rotation.z = Math.PI / 2;

      // Schwann Cell Nucleus bump on myelin surface
      const schwannNucleus = new THREE.Mesh(
        new THREE.SphereGeometry(0.16, 12, 10),
        matPhysical(0xf59e0b, 0.7)
      );
      schwannNucleus.position.set(0, 0.45, 0);
      mMesh.add(schwannNucleus);

      case1Group.add(mMesh);
      myelinMeshes.push(mMesh);

      // Nodus Ranvier (Celah sempit antar selubung mielin)
      if (idx < myelinX.length - 1) {
        const nextX = myelinX[idx + 1];
        const midGapX = (xPos + nextX) / 2;
        const nodeRing = new THREE.Mesh(
          new THREE.TorusGeometry(0.24, 0.05, 8, 20),
          matPhysical(0x38bdf8, 0.8)
        );
        nodeRing.rotation.y = Math.PI / 2;
        nodeRing.position.set(midGapX, 0, 0);
        case1Group.add(nodeRing);
        nodesOfRanvier.push(nodeRing);
      }

      // Damaged Myelin for Andi's case (Segmen tengah 1 & 2 terkelupas)
      if (idx === 1 || idx === 2) {
        const dMesh = new THREE.Mesh(
          new THREE.CylinderGeometry(0.24, 0.24, 1.25, 16),
          matPhysical(0xf43f5e, 0.8, { wireframe: true, transparent: true, opacity: 0.95 })
        );
        dMesh.position.set(xPos, 0, 0);
        dMesh.rotation.z = Math.PI / 2;
        dMesh.visible = false;
        case1Group.add(dMesh);
        damagedMyelinMeshes.push(dMesh);
      }
    });

    // Ujung Percabangan Terminal Akson
    const termMat = matPhysical(0x10b981, 0.5);
    [[0.9, 0.3], [0.7, -0.4], [0.4, 0.8], [0.3, -0.8]].forEach(([y, z]) => {
      const termPts = [
        new THREE.Vector3(5.1, 0, 0),
        new THREE.Vector3(5.9, y * 0.5, z * 0.5),
        new THREE.Vector3(6.8, y, z),
      ];
      case1Group.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(termPts), 16, 0.08, 6), termMat));
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 12), termMat);
      bulb.position.set(6.8, y, z);
      case1Group.add(bulb);
    });

    // =========================================================================
    // 2. KASUS 2: PENAMPANG 3D MEMBRAN AKSON REALISTIS (LIPID BILAYER & KANAL)
    // =========================================================================
    const case2Group = new THREE.Group();
    case2Group.scale.setScalar(1.05);
    case2Group.visible = false;
    rootGroup.add(case2Group);

    // Phospholipid Bilayer: Barisan molekul kepala lipid berbentuk bola & ekor hidrofobik
    const lipidMatTop = matPhysical(0x0284c7, 0.35, { roughness: 0.3 });
    const lipidMatBottom = matPhysical(0x0369a1, 0.35, { roughness: 0.3 });
    const tailMat = matPhysical(0xfacc15, 0.2, { roughness: 0.6 });

    // Barisan Kepala Lipid Atas (Ekstraseluler) & Bawah (Intraseluler)
    for (let x = -5.0; x <= 5.0; x += 0.55) {
      for (let z = -1.6; z <= 1.6; z += 0.55) {
        if ((x > -3.1 && x < -1.3) || (x > 1.3 && x < 3.1) || (x > -0.7 && x < 0.7)) continue; // lubang kanal & pompa
        const lipidTop = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), lipidMatTop);
        lipidTop.position.set(x, 1.5, z);
        case2Group.add(lipidTop);

        // Ekor lipid atas
        const tailTop = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.8, 6), tailMat);
        tailTop.position.set(x, 1.0, z);
        case2Group.add(tailTop);

        const lipidBottom = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), lipidMatBottom);
        lipidBottom.position.set(x, -1.5, z);
        case2Group.add(lipidBottom);

        // Ekor lipid bawah
        const tailBottom = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.8, 6), tailMat);
        tailBottom.position.set(x, -1.0, z);
        case2Group.add(tailBottom);
      }
    }

    // Kanal Ion Na⁺ (Natrium - Saluran Quaternary Berongga Oranye)
    const naPores: THREE.Mesh[] = [];
    const naCyl = new THREE.Mesh(
      new THREE.CylinderGeometry(0.95, 0.95, 2.4, 24, 1, true),
      matPhysical(0xf59e0b, 0.65, { side: THREE.DoubleSide })
    );
    naCyl.position.set(-2.2, 0, 0);
    case2Group.add(naCyl);
    naPores.push(naCyl);

    // Gerbang Buka-Tutup Na⁺ (Gerbang Aktivasi Luar)
    const naGateLeft = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 0.18, 0.7),
      matPhysical(0xfef08a, 0.9)
    );
    naGateLeft.position.set(-2.2, 1.0, 0);
    case2Group.add(naGateLeft);

    // Bola Inaktivasi Na⁺ (Ball and chain mechanism)
    const naGateInact = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 12, 10),
      matPhysical(0xef4444, 0.8)
    );
    naGateInact.position.set(-2.2, -1.1, 0);
    case2Group.add(naGateInact);

    // Kanal Ion K⁺ (Kalium - Saluran Quaternary Berongga Ungu)
    const kPores: THREE.Mesh[] = [];
    const kCyl = new THREE.Mesh(
      new THREE.CylinderGeometry(0.95, 0.95, 2.4, 24, 1, true),
      matPhysical(0x8b5cf6, 0.65, { side: THREE.DoubleSide })
    );
    kCyl.position.set(2.2, 0, 0);
    case2Group.add(kCyl);
    kPores.push(kCyl);

    // Gerbang Buka-Tutup K⁺
    const kGateLeft = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 0.18, 0.7),
      matPhysical(0xd8b4fe, 0.9)
    );
    kGateLeft.position.set(2.2, 1.0, 0);
    case2Group.add(kGateLeft);

    // Pompa Na⁺/K⁺ ATPase di Tengah
    const naPump = new THREE.Mesh(
      new THREE.CylinderGeometry(0.65, 0.65, 2.2, 20),
      matPhysical(0x10b981, 0.55)
    );
    naPump.position.set(0, 0, 0);
    case2Group.add(naPump);

    // Poros Intraseluler Akson Tengah
    const innerAxonCore = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.35, 10.5, 16),
      matPhysical(0x0284c7, 0.35)
    );
    innerAxonCore.rotation.z = Math.PI / 2;
    innerAxonCore.position.set(0, -2.2, 0);
    case2Group.add(innerAxonCore);

    // =========================================================================
    // 3. KASUS 3: SAMBUNGAN CELAH SINAPSIS 3D REALISTIS (EKSOSITOSIS VESIKEL)
    // =========================================================================
    const case3Group = new THREE.Group();
    case3Group.scale.setScalar(1.08);
    case3Group.visible = false;
    rootGroup.add(case3Group);

    // Terminal Akson Prasinaptik (Bulb Organik Lengkung Kiri)
    const preSynBulb = new THREE.Mesh(
      new THREE.SphereGeometry(3.0, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.45),
      matPhysical(0x0284c7, 0.4, { side: THREE.DoubleSide })
    );
    preSynBulb.position.set(-3.2, 0, 0);
    preSynBulb.rotation.z = -Math.PI / 2;
    case3Group.add(preSynBulb);

    // Mitokondria di dalam terminal prasinaptik (pemasok energi ATP)
    const mito = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.35, 1.4, 16),
      matPhysical(0xf59e0b, 0.65)
    );
    mito.position.set(-4.5, 0.8, -0.4);
    mito.rotation.z = Math.PI / 4;
    case3Group.add(mito);

    // Vesikel-Vesikel Sinaptik 3D dengan Neurotransmiter
    const synapticVesicles: THREE.Mesh[] = [];
    [
      [-4.0, 1.0, 0],
      [-3.6, -0.8, 0.5],
      [-4.2, -0.5, -0.6],
      [-3.0, 0.4, 0.4],
      [-2.8, -0.3, -0.4],
      [-3.7, 0.3, -0.7],
      [-2.3, 0.1, 0.1], // docking near active zone
    ].forEach(([x, y, z]) => {
      const v = new THREE.Mesh(
        new THREE.SphereGeometry(0.38, 16, 12),
        matPhysical(0x38bdf8, 0.7)
      );
      v.position.set(x, y, z);
      case3Group.add(v);
      synapticVesicles.push(v);
    });

    // Membran Pascasinaptik (Penerima Kanan)
    const postSynMembrane = new THREE.Mesh(
      new THREE.SphereGeometry(3.2, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.4),
      matPhysical(0x059669, 0.4, { side: THREE.DoubleSide })
    );
    postSynMembrane.position.set(4.6, 0, 0);
    postSynMembrane.rotation.z = Math.PI / 2;
    case3Group.add(postSynMembrane);

    // Reseptor Saluran Ion Pascasinaptik dengan Slot Pengikat (Lock & Key)
    const receptors: THREE.Mesh[] = [];
    [-1.3, 0, 1.3].forEach((yPos) => {
      const rec = new THREE.Mesh(
        new THREE.CylinderGeometry(0.28, 0.28, 0.8, 16),
        matPhysical(0x34d399, 0.8)
      );
      rec.position.set(1.6, yPos, 0);
      rec.rotation.z = Math.PI / 2;
      case3Group.add(rec);
      receptors.push(rec);
    });

    // =========================================================================
    // =========================================================================
    // 4. KASUS 4: ANATOMI TUBUH MANUSIA LENGKAP & BUSUR REFLEKS KILAT
    // =========================================================================
    const case4Group = new THREE.Group();
    case4Group.scale.setScalar(0.68);
    case4Group.position.set(0, 0.25, 0);
    case4Group.visible = false;
    rootGroup.add(case4Group);

    // Dedicated Cinematic Lights for Anatomical Mannequin
    const humanFrontLight = new THREE.DirectionalLight(0xe0f2fe, 2.6);
    humanFrontLight.position.set(2, 4, 10);
    case4Group.add(humanFrontLight);

    const humanFillLight = new THREE.PointLight(0x38bdf8, 2.0, 25);
    humanFillLight.position.set(-3, 1, 6);
    case4Group.add(humanFillLight);

    // High-Fidelity Medical Mannequin Materials (Luminous Cyan Hologram Body)
    const humanSkinMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.72,
      roughness: 0.22,
      metalness: 0.2,
      emissive: 0x0284c7,
      emissiveIntensity: 0.32,
      depthWrite: true,
    });
    const humanJointMat = new THREE.MeshStandardMaterial({
      color: 0x0ea5e9,
      transparent: true,
      opacity: 0.85,
      roughness: 0.18,
      metalness: 0.25,
      emissive: 0x0284c7,
      emissiveIntensity: 0.42,
    });
    const muscleReliefMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.65,
      roughness: 0.28,
      metalness: 0.15,
      emissive: 0x0369a1,
      emissiveIntensity: 0.3,
    });
    const faceFeatureMat = new THREE.MeshStandardMaterial({
      color: 0x7dd3fc,
      transparent: true,
      opacity: 0.88,
      roughness: 0.16,
      metalness: 0.2,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.45,
    });
    const visorMat = new THREE.MeshBasicMaterial({ color: 0x67e8f9 });
    const nerveMat = new THREE.MeshStandardMaterial({
      color: 0x2dd4bf,
      roughness: 0.2,
      metalness: 0.1,
      emissive: 0x14b8a6,
      emissiveIntensity: 0.8,
    });
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.35,
      metalness: 0.45,
    });

    // 1. Studio Observation Pedestal (Pijakan Kaki Laboratorium Futuristik)
    const pedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(2.5, 2.65, 0.16, 36),
      pedestalMat
    );
    pedestal.position.set(0, -3.85, 0);
    case4Group.add(pedestal);

    const pedestalRing1 = new THREE.Mesh(
      new THREE.RingGeometry(2.35, 2.52, 36),
      new THREE.MeshBasicMaterial({ color: 0x0ea5e9, side: THREE.DoubleSide })
    );
    pedestalRing1.rotation.x = -Math.PI / 2;
    pedestalRing1.position.set(0, -3.76, 0);
    case4Group.add(pedestalRing1);

    const pedestalRing2 = new THREE.Mesh(
      new THREE.RingGeometry(1.4, 1.48, 36),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide })
    );
    pedestalRing2.rotation.x = -Math.PI / 2;
    pedestalRing2.position.set(0, -3.76, 0);
    case4Group.add(pedestalRing2);

    // 2. Tungkai Bawah & Kaki Manusia (Articulated Human Legs & Feet)
    const legX = 0.52;

    [-legX, legX].forEach((lx) => {
      const isRight = lx > 0;

      // Sendi Panggul (Hip Ball Joint)
      const hipJoint = new THREE.Mesh(new THREE.SphereGeometry(0.26, 16, 12), humanJointMat);
      hipJoint.position.set(lx, -0.22, 0);
      case4Group.add(hipJoint);

      // Paha (Femur & Muscular Thigh)
      const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.26, 1.65, 20), humanSkinMat);
      thigh.position.set(lx, -1.05, 0);
      case4Group.add(thigh);

      // Otot Paha Depan (Quadriceps Bulge)
      const quadMuscle = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.95, 0.16), muscleReliefMat);
      quadMuscle.position.set(lx, -0.98, 0.18);
      case4Group.add(quadMuscle);

      // Sendi Lutut (Knee Joint)
      const knee = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 12), humanJointMat);
      knee.position.set(lx, -1.95, 0.04);
      case4Group.add(knee);

      // Tempurung Lutut (Patella Plate)
      const patella = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.22, 0.1), humanJointMat);
      patella.position.set(lx, -1.95, 0.22);
      case4Group.add(patella);

      // Betis & Tulang Kering (Calf & Shin)
      const calf = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.18, 1.65, 20), humanSkinMat);
      calf.position.set(lx, -2.85, 0);
      case4Group.add(calf);

      // Otot Betis Belakang (Gastrocnemius Muscle)
      const gastro = new THREE.Mesh(new THREE.SphereGeometry(0.23, 14, 12), muscleReliefMat);
      gastro.scale.set(1.0, 1.35, 1.0);
      gastro.position.set(lx, -2.62, -0.12);
      case4Group.add(gastro);

      // Pergelangan & Mata Kaki (Ankle Malleolus)
      const ankle = new THREE.Mesh(new THREE.SphereGeometry(0.18, 14, 10), humanJointMat);
      ankle.position.set(lx, -3.65, 0);
      case4Group.add(ankle);

      // Tumit (Calcaneus / Heel)
      const heel = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.18, 0.36), humanSkinMat);
      heel.position.set(lx, -3.74, 0.0);
      case4Group.add(heel);

      // Telapak Kaki Depan & Jari-Jari (Forefoot & Toes)
      const forefoot = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.14, 0.52), humanSkinMat);
      forefoot.position.set(lx, -3.76, 0.36);
      forefoot.rotation.y = isRight ? 0.07 : -0.07;
      case4Group.add(forefoot);
    });

    // 3. Panggul & Batang Tubuh Manusia (Pelvis, Waist & V-Taper Torso)
    // Panggul / Pelvis
    const pelvis = new THREE.Mesh(
      new THREE.CylinderGeometry(0.8, 0.95, 0.75, 24),
      humanSkinMat
    );
    pelvis.position.set(0, 0.05, 0);
    pelvis.scale.z = 0.66;
    case4Group.add(pelvis);

    // Tulang Usus / Panggul Samping (Iliac Crest Ridges)
    [-0.78, 0.78].forEach((ix) => {
      const iliac = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.12, 0.12), humanJointMat);
      iliac.position.set(ix, 0.32, 0.05);
      case4Group.add(iliac);
    });

    // Pinggang Atletis (Waist)
    const waist = new THREE.Mesh(new THREE.CylinderGeometry(0.84, 0.76, 0.85, 24), humanSkinMat);
    waist.position.set(0, 0.85, 0);
    waist.scale.z = 0.62;
    case4Group.add(waist);

    // Otot Perut (6-Pack Rectus Abdominis Grid)
    [-0.18, 0.18].forEach((xPos) => {
      [0.55, 0.85, 1.15].forEach((yPos) => {
        const absPad = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.22, 0.09), muscleReliefMat);
        absPad.position.set(xPos, yPos, 0.33);
        case4Group.add(absPad);
      });
    });

    // Dada & Sangkar Tulang Rusuk V-Taper (Thorax & Chest)
    const chest = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 0.86, 1.35, 24), humanSkinMat);
    chest.position.set(0, 1.9, 0);
    chest.scale.z = 0.68;
    case4Group.add(chest);

    // Otot Pektoral Dada Kiri & Kanan (Pectoralis Major Plates)
    const pectL = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.38, 0.13), muscleReliefMat);
    pectL.position.set(-0.36, 2.05, 0.38);
    pectL.rotation.z = -0.08;
    case4Group.add(pectL);

    const pectR = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.38, 0.13), muscleReliefMat);
    pectR.position.set(0.36, 2.05, 0.38);
    pectR.rotation.z = 0.08;
    case4Group.add(pectR);

    // Tulang Selangka (Clavicles)
    const clavicle = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 2.3, 16), humanJointMat);
    clavicle.rotation.z = Math.PI / 2;
    clavicle.position.set(0, 2.44, 0.1);
    case4Group.add(clavicle);

    // Otot Bahu-Leher Miring (Trapezius Muscles)
    const trapL = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.32, 0.38), muscleReliefMat);
    trapL.position.set(-0.68, 2.5, -0.04);
    trapL.rotation.z = 0.36;
    case4Group.add(trapL);

    const trapR = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.32, 0.38), muscleReliefMat);
    trapR.position.set(0.68, 2.5, -0.04);
    trapR.rotation.z = -0.36;
    case4Group.add(trapR);

    // Tutup Otot Bahu Atletis (Deltoid Muscle Caps)
    const deltoidL = new THREE.Mesh(new THREE.SphereGeometry(0.38, 20, 16), muscleReliefMat);
    deltoidL.scale.set(1.05, 1.3, 1.15);
    deltoidL.position.set(-1.36, 2.32, 0);
    case4Group.add(deltoidL);

    const deltoidR = new THREE.Mesh(new THREE.SphereGeometry(0.38, 20, 16), muscleReliefMat);
    deltoidR.scale.set(1.05, 1.3, 1.15);
    deltoidR.position.set(1.36, 2.32, 0);
    case4Group.add(deltoidR);

    // 4. Kolom Vertebra & Sumsum Tulang Belakang (Spinal Cord & Vertebrae)
    for (let v = 0; v < 12; v++) {
      const vY = 0.42 + v * 0.17;
      const vertRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.15, 0.04, 8, 16),
        matPhysical(0x64748b, 0.3)
      );
      vertRing.position.set(0, vY, -0.22);
      case4Group.add(vertRing);
    }

    // Sumsum Tulang Belakang (Spinal Cord Berkilau Keemasan)
    const spinal4 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 4.1, 16),
      matPhysical(0xfbbf24, 0.85)
    );
    spinal4.position.set(0, 0.6, -0.22);
    case4Group.add(spinal4);

    // Cincin Interneuron Medula Spinalis (Pusat Refleks C6/T1)
    const spinalRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.34, 0.07, 8, 24),
      new THREE.MeshBasicMaterial({ color: 0xfacc15 })
    );
    spinalRing.position.set(0.05, 1.9, -0.2);
    case4Group.add(spinalRing);

    // Jaringan Saraf Tepi Dada & Punggung (Peripheral Intercostal Nerves)
    for (let r = 0; r < 3; r++) {
      const ribY = 1.6 - r * 0.35;
      [-1, 1].forEach((s) => {
        const nerveCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(0, ribY, -0.2),
          new THREE.Vector3(s * 0.55, ribY - 0.06, -0.1),
          new THREE.Vector3(s * 0.92, ribY - 0.16, 0.18),
        ]);
        case4Group.add(new THREE.Mesh(new THREE.TubeGeometry(nerveCurve, 16, 0.03, 6), nerveMat));
      });
    }

    // 5. Leher, Kepala & Wajah Berkarakter (Neck, Cranium, Face & Brain)
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.36, 0.58, 20), humanSkinMat);
    neck.position.set(0, 2.7, 0);
    case4Group.add(neck);

    // Jakun / Kartilago Tiroid (Adam's Apple)
    const thyroid = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), faceFeatureMat);
    thyroid.position.set(0, 2.7, 0.19);
    case4Group.add(thyroid);

    // Tengkorak Kepala Manusia (Cranium)
    const cranium = new THREE.Mesh(new THREE.SphereGeometry(0.8, 28, 22), humanSkinMat);
    cranium.position.set(0, 3.42, 0);
    cranium.scale.set(0.86, 1.05, 0.96);
    case4Group.add(cranium);

    // Lengkung Tulang Alis (Brow Ridge)
    const browRidge = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.1, 0.18), faceFeatureMat);
    browRidge.position.set(0, 3.45, 0.66);
    case4Group.add(browRidge);

    // Visor Sensorik Bercahaya (Cyber Ocular Visor)
    const ocularVisor = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.07, 0.1), visorMat);
    ocularVisor.position.set(0, 3.39, 0.72);
    case4Group.add(ocularVisor);

    // Batang Hidung (Nose Bridge)
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.28, 8), faceFeatureMat);
    nose.rotation.x = 0.25;
    nose.position.set(0, 3.22, 0.78);
    case4Group.add(nose);

    // Garis Bibir / Mulut (Mouth Line)
    const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.04, 0.06), faceFeatureMat);
    mouth.position.set(0, 3.06, 0.7);
    case4Group.add(mouth);

    // Dagu & Rahang Tegas (Mandible & Chin)
    const jaw = new THREE.Mesh(new THREE.ConeGeometry(0.44, 0.42, 16), humanSkinMat);
    jaw.rotation.x = Math.PI;
    jaw.position.set(0, 2.95, 0.22);
    case4Group.add(jaw);

    const chinPad = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.15, 0.15), faceFeatureMat);
    chinPad.position.set(0, 2.9, 0.52);
    case4Group.add(chinPad);

    // Daun Telinga Kiri & Kanan (Ears / Auricles)
    [-0.72, 0.72].forEach((ex) => {
      const ear = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.26, 0.16), faceFeatureMat);
      ear.position.set(ex, 3.34, -0.05);
      case4Group.add(ear);
    });

    // Otak Besar di Dalam Kepala (Cerebrum 2 Hemisfer Bumpy)
    const cerebrumMat = matPhysical(0xf472b6, 0.85);
    const cerebrumHemiLeft = new THREE.Mesh(createBumpyGeometry(0.48, 22, 0.08, 9), cerebrumMat);
    cerebrumHemiLeft.position.set(-0.24, 3.48, 0);
    cerebrumHemiLeft.scale.set(0.85, 0.8, 1.1);
    case4Group.add(cerebrumHemiLeft);

    const cerebrumHemiRight = new THREE.Mesh(createBumpyGeometry(0.48, 22, 0.08, 9), cerebrumMat);
    cerebrumHemiRight.position.set(0.24, 3.48, 0);
    cerebrumHemiRight.scale.set(0.85, 0.8, 1.1);
    case4Group.add(cerebrumHemiRight);

    // Otak Kecil (Cerebellum)
    const cerebellum = new THREE.Mesh(createBumpyGeometry(0.28, 16, 0.06, 12), matPhysical(0xa855f7, 0.7));
    cerebellum.position.set(0, 2.95, -0.4);
    cerebellum.scale.set(1.2, 0.7, 1);
    case4Group.add(cerebellum);

    // Batang Otak (Brainstem)
    const brainstem = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.09, 0.55, 16), matPhysical(0xffa94d, 0.75));
    brainstem.position.set(0, 2.7, -0.18);
    case4Group.add(brainstem);

    // 6. Lengan Kiri (Left Arm - Rileks di Samping)
    const shoulderL = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 12), humanJointMat);
    shoulderL.position.set(-1.38, 2.35, 0);
    case4Group.add(shoulderL);

    const upperArmL = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.2, 1.35, 16), humanSkinMat);
    upperArmL.position.set(-1.48, 1.55, 0);
    case4Group.add(upperArmL);

    const elbowL = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), humanJointMat);
    elbowL.position.set(-1.52, 0.8, 0);
    case4Group.add(elbowL);

    const forearmL = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.16, 1.25, 16), humanSkinMat);
    forearmL.position.set(-1.54, 0.1, 0);
    case4Group.add(forearmL);

    const wristL = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 10), humanJointMat);
    wristL.position.set(-1.56, -0.56, 0);
    case4Group.add(wristL);

    // Telapak Tangan & Jari Kiri (Sculpted Hand)
    const palmL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.26, 0.1), humanSkinMat);
    palmL.position.set(-1.56, -0.74, 0);
    case4Group.add(palmL);

    const thumbL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.14, 0.08), humanSkinMat);
    thumbL.position.set(-1.48, -0.7, 0.06);
    case4Group.add(thumbL);

    const fingersL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.22, 0.08), humanSkinMat);
    fingersL.position.set(-1.56, -0.92, 0);
    case4Group.add(fingersL);

    // 7. Lengan Kanan Interaktif (Right Arm - Pelaku Refleks Menghindar)
    const shoulderR = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 12), humanJointMat);
    shoulderR.position.set(1.38, 2.35, 0);
    case4Group.add(shoulderR);

    // Lengan Atas Kanan
    const upperArmR = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.21, 1.3, 16), humanSkinMat);
    upperArmR.position.set(1.58, 1.58, 0.06);
    case4Group.add(upperArmR);

    // Efektor Otot Bisep Lengan (Biceps Brachii yang Berkontraksi)
    const bicepsMuscle = new THREE.Mesh(
      new THREE.SphereGeometry(0.34, 18, 14),
      new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.92 })
    );
    bicepsMuscle.position.set(1.62, 1.58, 0.2);
    bicepsMuscle.scale.set(1.05, 1.4, 1.05);
    case4Group.add(bicepsMuscle);

    // Sendi Siku Kanan (Elbow Pivot)
    const elbowR = new THREE.Mesh(new THREE.SphereGeometry(0.23, 16, 12), humanJointMat);
    elbowR.position.set(1.68, 0.88, 0.1);
    case4Group.add(elbowR);

    // Forearm Group: Berartikulasi/Flinch Menghindar Saat Refleks!
    const forearmGroup = new THREE.Group();
    forearmGroup.position.set(1.68, 0.88, 0.1); // pusat rotasi siku
    case4Group.add(forearmGroup);

    const forearmR = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.17, 1.25, 16), humanSkinMat);
    forearmR.position.set(0.18, -0.6, 0.12);
    forearmGroup.add(forearmR);

    const wristR = new THREE.Mesh(new THREE.SphereGeometry(0.17, 14, 10), humanJointMat);
    wristR.position.set(0.26, -1.22, 0.2);
    forearmGroup.add(wristR);

    // Telapak Tangan & Jari-Jari (Palm & Fingers)
    const palmR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.26, 0.1), humanSkinMat);
    palmR.position.set(0.28, -1.36, 0.22);
    forearmGroup.add(palmR);

    const thumbR = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.16, 0.09), humanSkinMat);
    thumbR.position.set(0.18, -1.34, 0.25);
    forearmGroup.add(thumbR);

    const indexFinger = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.035, 0.28, 8), humanSkinMat);
    indexFinger.position.set(0.31, -1.54, 0.24);
    forearmGroup.add(indexFinger);

    const otherFingersR = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.18, 0.08), humanSkinMat);
    otherFingersR.position.set(0.32, -1.48, 0.18);
    forearmGroup.add(otherFingersR);

    // 8. Benda Rangsang Panas (Meja Laboratorium, Wadah & Nyala Api Tepat di Bawah Jari)
    const standPillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.19, 3.0, 16),
      pedestalMat
    );
    standPillar.position.set(1.99, -2.4, 0.34);
    case4Group.add(standPillar);

    const standTop = new THREE.Mesh(
      new THREE.CylinderGeometry(0.48, 0.48, 0.1, 24),
      matPhysical(0x94a3b8, 0.4)
    );
    standTop.position.set(1.99, -0.85, 0.34);
    case4Group.add(standTop);

    // Multi-layer Flame Particles (Lilin / Api Berkedip)
    const flameParticles: THREE.Mesh[] = [];
    const flameColors = [0xff2200, 0xff7700, 0xffdd00];
    for (let f = 0; f < 3; f++) {
      const fl = new THREE.Mesh(
        new THREE.SphereGeometry(0.13 + f * 0.05, 12, 10),
        new THREE.MeshBasicMaterial({ color: flameColors[f], transparent: true, opacity: 0.9 - f * 0.15 })
      );
      fl.position.set(1.99, -0.72 + f * 0.05, 0.34);
      case4Group.add(fl);
      flameParticles.push(fl);
    }

    // Dynamic Warm Fire Light
    const flameLight = new THREE.PointLight(0xff6a00, 2.5, 5.0);
    flameLight.position.set(1.99, -0.65, 0.34);
    case4Group.add(flameLight);

    // 9. Jalur Kabel Saraf (Fiber Optic Neural Pathways)
    // Jalur Saraf Sensorik (Merah dari Jari ke Medula Spinalis)
    const armPath = [
      new THREE.Vector3(0.05, 1.9, -0.2),
      new THREE.Vector3(1.3, 2.2, 0.0),
      new THREE.Vector3(1.58, 1.58, 0.06),
      new THREE.Vector3(1.68, 0.88, 0.1),
      new THREE.Vector3(1.86, 0.28, 0.22),
      new THREE.Vector3(1.96, -0.38, 0.32),
      new THREE.Vector3(1.99, -0.58, 0.34),
    ];
    case4Group.add(
      new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(armPath), 36, 0.045, 6), matPhysical(0xef4444, 0.75))
    );

    // Jalur Saraf Motorik (Hijau dari Medula Spinalis ke Otot Bisep)
    const motorArmPath = [
      new THREE.Vector3(0.05, 1.9, -0.2),
      new THREE.Vector3(1.3, 2.15, 0.05),
      new THREE.Vector3(1.62, 1.58, 0.2),
    ];
    case4Group.add(
      new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(motorArmPath), 20, 0.045, 6), matPhysical(0x10b981, 0.8))
    );

    // =========================================================================
    // 5. KASUS 5: SISTEM SARAF TERPADU & TERMINAL DIAGNOSTIK
    // =========================================================================
    const case5Group = new THREE.Group();
    case5Group.scale.setScalar(0.94);
    case5Group.visible = false;
    rootGroup.add(case5Group);

    // Otak Pusat & Medula
    const c5Brain = new THREE.Mesh(createBumpyGeometry(1.2, 24, 0.08, 8), matPhysical(0xa855f7, 0.6));
    c5Brain.position.set(0, 2.6, 0);
    case5Group.add(c5Brain);

    const c5Spine = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 4.4, 16), matPhysical(0x38bdf8, 0.45));
    c5Spine.position.set(0, 0.2, 0);
    case5Group.add(c5Spine);

    // 4 Checkpoint Nodes Diagnostik
    const c5Nodes = [
      { id: 1, pos: [-4.2, -1.5, 0], col: 0x0ea5e9, name: "Reseptor Sensorik" },
      { id: 2, pos: [-1.8, 0.5, 0], col: 0xf59e0b, name: "Akson & Mielin" },
      { id: 3, pos: [1.8, 0.5, 0], col: 0x10b981, name: "Celah Sinapsis" },
      { id: 4, pos: [4.2, -1.5, 0], col: 0xec4899, name: "Efektor Otot" },
    ];
    c5Nodes.forEach((node) => {
      const nMesh = new THREE.Mesh(new THREE.SphereGeometry(0.5, 20, 16), matPhysical(node.col, 0.7));
      nMesh.position.set(...(node.pos as [number, number, number]));
      case5Group.add(nMesh);
    });

    // Connecting Network Cables
    const c5CablePts = [
      new THREE.Vector3(-4.2, -1.5, 0),
      new THREE.Vector3(-1.8, 0.5, 0),
      new THREE.Vector3(0, 2.6, 0),
      new THREE.Vector3(1.8, 0.5, 0),
      new THREE.Vector3(4.2, -1.5, 0),
    ];
    case5Group.add(
      new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(c5CablePts), 36, 0.075, 6), matPhysical(0x64748b, 0.35))
    );

    // Curves
    const case1AxonCurve = new THREE.LineCurve3(new THREE.Vector3(-4.7, 0, 0), new THREE.Vector3(6.6, 0, 0));
    const case4SensoryCurve = new THREE.CatmullRomCurve3([...armPath].reverse());
    const case4ReflexMotorCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.05, 1.9, -0.2),
      new THREE.Vector3(1.3, 2.15, 0.05),
      new THREE.Vector3(1.62, 1.58, 0.2),
    ]);
    const case4SpinalAscendCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.05, 1.9, -0.2),
      new THREE.Vector3(0, 2.7, -0.18),
      new THREE.Vector3(0, 3.48, 0),
    ]);
    const case4ConsciousMotorCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 3.48, 0.1),
      new THREE.Vector3(0, 2.7, -0.18),
      new THREE.Vector3(0.05, 1.9, -0.2),
      new THREE.Vector3(1.3, 2.15, 0.05),
      new THREE.Vector3(1.62, 1.58, 0.2),
    ]);

    threeRef.current = {
      renderer,
      scene,
      camera,
      rootGroup,
      case1Group,
      case2Group,
      case3Group,
      case4Group,
      case5Group,
      myelinMeshes,
      damagedMyelinMeshes,
      nodesOfRanvier,
      somaMesh,
      naPores,
      kPores,
      naGateLeft,
      kGateLeft,
      naGateInact,
      naPump,
      synapticVesicles,
      receptors,
      preSynBulb,
      postSynMembrane,
      flameParticles,
      bicepsMuscle,
      spinalRing,
      cerebrumHemiLeft,
      cerebrumHemiRight,
      forearmGroup,
      case1AxonCurve,
      case4SensoryCurve,
      case4ReflexMotorCurve,
      case4SpinalAscendCurve,
      case4ConsciousMotorCurve,
      impulses: [],
      particles: [],
      ambientDust,
      rotationY: 0,
      rotationX: 0.1,
      targetDistance: 14.5,
      isInteracting: false,
      lastTime: performance.now(),
    };

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0) {
          renderer.setSize(w, h, false);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      renderer.dispose();
      threeRef.current = null;
    };
  }, [isOpen]);

  // Switch active 3D group when selectedCaseId changes
  useEffect(() => {
    if (!threeRef.current) return;
    const { case1Group, case2Group, case3Group, case4Group, case5Group, rootGroup } = threeRef.current;

    case1Group.visible = selectedCaseId === "kasus-1";
    case2Group.visible = selectedCaseId === "kasus-2";
    case3Group.visible = selectedCaseId === "kasus-3";
    case4Group.visible = selectedCaseId === "kasus-4";
    case5Group.visible = selectedCaseId === "kasus-5";

    if (selectedCaseId === "kasus-2") {
      threeRef.current.targetDistance = 10.5;
      rootGroup.position.set(0, 0, 0);
    } else if (selectedCaseId === "kasus-3") {
      threeRef.current.targetDistance = 11.0;
      rootGroup.position.set(0, 0, 0);
    } else if (selectedCaseId === "kasus-4") {
      threeRef.current.targetDistance = 9.8;
      threeRef.current.rotationY = 0.35;
      threeRef.current.rotationX = 0.08;
      rootGroup.position.set(0, 0, 0);
    } else if (selectedCaseId === "kasus-5") {
      threeRef.current.targetDistance = 13.0;
      rootGroup.position.set(0, 0, 0);
    } else {
      threeRef.current.targetDistance = 13.5;
      threeRef.current.rotationY = 0;
      threeRef.current.rotationX = 0.04;
      rootGroup.position.set(0, 0, 0);
    }
  }, [selectedCaseId]);

  // Update comparison mode for Kasus 1 (Mielin normal vs rusak)
  useEffect(() => {
    if (!threeRef.current) return;
    const { myelinMeshes, damagedMyelinMeshes } = threeRef.current;

    const isAbnormal = comparisonMode === "abnormal";
    if (selectedCaseId === "kasus-1") {
      if (myelinMeshes[1]) myelinMeshes[1].visible = !isAbnormal;
      if (myelinMeshes[2]) myelinMeshes[2].visible = !isAbnormal;
      damagedMyelinMeshes.forEach((m) => (m.visible = isAbnormal));
    } else {
      myelinMeshes.forEach((m) => (m.visible = true));
      damagedMyelinMeshes.forEach((m) => (m.visible = false));
    }
  }, [comparisonMode, selectedCaseId]);

  // Three.js Render & Particle Tick Loop
  useEffect(() => {
    if (!isOpen) return;

    let animId: number;
    let spawnTimer = 0;
    let ionTimer = 0;

    const render = (time: number) => {
      const state = threeRef.current;
      if (!state) return;

      const dt = Math.min((time - state.lastTime) / 1000, 0.08);
      state.lastTime = time;

      // Auto rotation
      if (isAutoRotate && !state.isInteracting && isPlaying) {
        if (selectedCaseId === "kasus-4") {
          // Showcase turntable oscillation: smooth sway between ~0.02 and ~0.68 rad (arc of ~38 degrees)
          // keeps the human facial profile, athletic chest, reflex arm, and spinal cord always in clear sight!
          state.rotationY = 0.35 + Math.sin(time * 0.00075) * 0.33;
        } else if (selectedCaseId === "kasus-1") {
          // Gentle showcase oscillation: keeps soma, dendrites, myelin sheaths, and terminals clearly legible horizontally
          state.rotationY = Math.sin(time * 0.0005) * 0.22;
        } else {
          state.rotationY += dt * 0.22;
        }
      }
      state.rootGroup.rotation.y = state.rotationY;
      state.rootGroup.rotation.x = state.rotationX;

      // Smooth camera zoom
      state.camera.position.z += (state.targetDistance - state.camera.position.z) * 0.1;
      state.camera.lookAt(0, 0, 0);

      // Rotate ambient micro-dust
      if (state.ambientDust) {
        state.ambientDust.rotation.y += dt * 0.05;
      }

      if (isPlaying) {
        spawnTimer += dt * speed;

        // -------------------------------------------------------------
        // ANIMATION: KASUS 1 (Neuron & Selubung Mielin Andi)
        // -------------------------------------------------------------
        if (selectedCaseId === "kasus-1") {
          if (spawnTimer > 1.8) {
            spawnTimer = 0;
            const isDamaged = comparisonMode === "abnormal";

            const impulse = new THREE.Mesh(
              new THREE.SphereGeometry(0.34, 16, 12),
              new THREE.MeshBasicMaterial({ color: isDamaged ? 0xf43f5e : 0xfacc15 })
            );

            // Halo glow
            const halo = new THREE.Mesh(
              new THREE.SphereGeometry(0.72, 16, 12),
              new THREE.MeshBasicMaterial({
                color: isDamaged ? 0xf43f5e : 0xfef08a,
                transparent: true,
                opacity: 0.45,
              })
            );
            impulse.add(halo);

            // Dynamic PointLight attached to traveling impulse
            const impLight = new THREE.PointLight(isDamaged ? 0xf43f5e : 0xfacc15, 2.4, 5.5);
            impulse.add(impLight);

            state.case1Group.add(impulse);

            state.impulses.push({
              mesh: impulse,
              light: impLight,
              curve: state.case1AxonCurve,
              progress: 0,
              speed: isDamaged ? 0.35 : 0.95,
              onComplete: () => {
                // Synaptic terminal burst
                for (let k = 0; k < 16; k++) {
                  const p = new THREE.Mesh(
                    new THREE.SphereGeometry(0.09, 8, 8),
                    new THREE.MeshBasicMaterial({ color: 0x34d399, transparent: true })
                  );
                  p.position.set(6.6, (Math.random() - 0.5) * 1.4, (Math.random() - 0.5) * 0.9);
                  state.case1Group.add(p);
                  state.particles.push({
                    mesh: p,
                    velocity: new THREE.Vector3(0.9 + Math.random() * 0.9, (Math.random() - 0.5) * 0.9, (Math.random() - 0.5) * 0.9),
                    life: 1.0,
                    maxLife: 1.0,
                  });
                }
              },
            });
          }

          // If damaged, emit leaking red electric spark debris continuously from middle myelin
          if (comparisonMode === "abnormal" && Math.random() < 0.28) {
            const spark = new THREE.Mesh(
              new THREE.SphereGeometry(0.08, 6, 6),
              new THREE.MeshBasicMaterial({ color: 0xf43f5e, transparent: true })
            );
            const xPos = -1.0 + (Math.random() - 0.5) * 2.0;
            spark.position.set(xPos, (Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 0.6);
            state.case1Group.add(spark);
            state.particles.push({
              mesh: spark,
              velocity: new THREE.Vector3((Math.random() - 0.5) * 0.4, 0.8 + Math.random() * 0.6, (Math.random() - 0.5) * 0.4),
              life: 0.8,
              maxLife: 0.8,
            });
          }
        }

        // -------------------------------------------------------------
        // ANIMATION: KASUS 2 (Kanal Ion Na⁺ & K⁺ Membran)
        // -------------------------------------------------------------
        else if (selectedCaseId === "kasus-2") {
          ionTimer += dt * speed;
          if (ionTimer > 3.6) ionTimer = 0;

          if (ionTimer < 1.2) {
            setIonPhase("resting");
            setVoltageValue(-70);
            if (state.naGateLeft) state.naGateLeft.rotation.z = 0;
            if (state.kGateLeft) state.kGateLeft.rotation.z = 0;
            if (state.naGateInact) state.naGateInact.position.set(-2.2, -1.1, 0);
          } else if (ionTimer < 2.4) {
            setIonPhase("depolarizing");
            setVoltageValue(+30);
            if (state.naGateLeft) {
              state.naGateLeft.rotation.z = comparisonMode === "normal" ? Math.PI / 2 : 0;
            }
            // Stream Na+ ions flowing inside
            if (comparisonMode === "normal" && Math.random() < 0.45) {
              const naIon = new THREE.Mesh(
                new THREE.SphereGeometry(0.16, 10, 8),
                new THREE.MeshBasicMaterial({ color: 0xf59e0b })
              );
              naIon.position.set(-2.2 + (Math.random() - 0.5) * 0.5, 2.5, (Math.random() - 0.5) * 0.5);
              state.case2Group.add(naIon);
              state.particles.push({
                mesh: naIon,
                velocity: new THREE.Vector3(0, -2.4, 0),
                life: 1.2,
                maxLife: 1.2,
              });
            }
          } else {
            setIonPhase("repolarizing");
            setVoltageValue(-55);
            if (state.naGateLeft) state.naGateLeft.rotation.z = 0;
            if (state.naGateInact) state.naGateInact.position.set(-2.2, -0.3, 0); // plug channel pore
            if (state.kGateLeft) {
              state.kGateLeft.rotation.z = comparisonMode === "normal" ? Math.PI / 2 : 0;
            }
            // Stream K+ ions flowing outside
            if (comparisonMode === "normal" && Math.random() < 0.45) {
              const kIon = new THREE.Mesh(
                new THREE.SphereGeometry(0.16, 10, 8),
                new THREE.MeshBasicMaterial({ color: 0xa855f7 })
              );
              kIon.position.set(2.2 + (Math.random() - 0.5) * 0.5, 0.2, (Math.random() - 0.5) * 0.5);
              state.case2Group.add(kIon);
              state.particles.push({
                mesh: kIon,
                velocity: new THREE.Vector3(0, 2.4, 0),
                life: 1.2,
                maxLife: 1.2,
              });
            }
          }
        }

        // -------------------------------------------------------------
        // ANIMATION: KASUS 3 (Celah Sinapsis & Neurotransmiter)
        // -------------------------------------------------------------
        else if (selectedCaseId === "kasus-3") {
          if (spawnTimer > 1.4) {
            spawnTimer = 0;
            const count = comparisonMode === "normal" ? 20 : 3;
            for (let k = 0; k < count; k++) {
              const nt = new THREE.Mesh(
                new THREE.SphereGeometry(0.15, 8, 8),
                new THREE.MeshBasicMaterial({
                  color: comparisonMode === "normal" ? 0x4ade80 : 0xf43f5e,
                  transparent: true,
                })
              );
              nt.position.set(-1.4, (Math.random() - 0.5) * 1.8, (Math.random() - 0.5) * 1.2);
              state.case3Group.add(nt);
              state.particles.push({
                mesh: nt,
                velocity: new THREE.Vector3(1.5 + Math.random() * 0.9, (Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5),
                life: 1.2,
                maxLife: 1.2,
              });
            }
          }
        }

        // -------------------------------------------------------------
        // ANIMATION: KASUS 4 (Busur Refleks Tubuh vs Gerak Sadar)
        // -------------------------------------------------------------
        else if (selectedCaseId === "kasus-4") {
          // Flame flickering animation
          state.flameParticles.forEach((fl, idx) => {
            const flick = 1.0 + 0.3 * Math.sin(time * 0.02 + idx * 1.5);
            fl.scale.set(flick, flick * 1.2, flick);
          });

          if (spawnTimer > 2.2) {
            spawnTimer = 0;
            if (reflexType === "reflex") {
              // Refleks Cepat ~30ms
              const sensImp = new THREE.Mesh(new THREE.SphereGeometry(0.26, 16, 12), new THREE.MeshBasicMaterial({ color: 0xff4d4d }));
              state.case4Group.add(sensImp);
              state.impulses.push({
                mesh: sensImp,
                curve: state.case4SensoryCurve,
                progress: 0,
                speed: 1.5,
                onComplete: () => {
                  // Direct motor output from spine to biceps
                  const motImp = new THREE.Mesh(new THREE.SphereGeometry(0.26, 16, 12), new THREE.MeshBasicMaterial({ color: 0x10b981 }));
                  state.case4Group.add(motImp);
                  state.impulses.push({
                    mesh: motImp,
                    curve: state.case4ReflexMotorCurve,
                    progress: 0,
                    speed: 1.6,
                    onComplete: () => {
                      // Muscle twitch and visible forearm flinch away from flame!
                      if (state.bicepsMuscle) {
                        state.bicepsMuscle.scale.set(1.55, 1.55, 1.55);
                      }
                      if (state.forearmGroup) {
                        state.forearmGroup.rotation.z = -0.52; // snap forearm & hand up!
                        state.forearmGroup.rotation.x = 0.25;
                      }
                      setReflexFlinchTrigger((prev) => prev + 1);

                      setTimeout(() => {
                        if (state.bicepsMuscle) state.bicepsMuscle.scale.set(1, 1, 1);
                        if (state.forearmGroup) {
                          state.forearmGroup.rotation.z = 0;
                          state.forearmGroup.rotation.x = 0;
                        }
                      }, 480);
                    },
                  });
                },
              });
            } else {
              // Gerak Sadar Otak ~250ms (Impuls naik ke cerebrum dulu)
              const sensImp = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), new THREE.MeshBasicMaterial({ color: 0xa855f7 }));
              state.case4Group.add(sensImp);
              state.impulses.push({
                mesh: sensImp,
                curve: state.case4SensoryCurve,
                progress: 0,
                speed: 0.9,
                onComplete: () => {
                  const upImp = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), new THREE.MeshBasicMaterial({ color: 0xf472b6 }));
                  state.case4Group.add(upImp);
                  state.impulses.push({
                    mesh: upImp,
                    curve: state.case4SpinalAscendCurve,
                    progress: 0,
                    speed: 0.9,
                    onComplete: () => {
                      const downImp = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), new THREE.MeshBasicMaterial({ color: 0x10b981 }));
                      state.case4Group.add(downImp);
                      state.impulses.push({
                        mesh: downImp,
                        curve: state.case4ConsciousMotorCurve,
                        progress: 0,
                        speed: 0.9,
                        onComplete: () => {
                          if (state.bicepsMuscle) {
                            state.bicepsMuscle.scale.set(1.35, 1.35, 1.35);
                          }
                          if (state.forearmGroup) {
                            state.forearmGroup.rotation.z = -0.32; // deliberate controlled arm lift
                          }
                          setTimeout(() => {
                            if (state.bicepsMuscle) state.bicepsMuscle.scale.set(1, 1, 1);
                            if (state.forearmGroup) state.forearmGroup.rotation.z = 0;
                          }, 650);
                        },
                      });
                    },
                  });
                },
              });
            }
          }
        }

        // -------------------------------------------------------------
        // ANIMATION: KASUS 5 (Integrasi Sistem Saraf Lengkap)
        // -------------------------------------------------------------
        else if (selectedCaseId === "kasus-5") {
          if (spawnTimer > 1.8) {
            spawnTimer = 0;
            const imp = new THREE.Mesh(
              new THREE.SphereGeometry(0.28, 16, 12),
              new THREE.MeshBasicMaterial({ color: comparisonMode === "abnormal" ? 0xf43f5e : 0x0ea5e9 })
            );
            const line = new THREE.LineCurve3(new THREE.Vector3(-4.2, -1.5, 0), new THREE.Vector3(4.2, -1.5, 0));
            state.case5Group.add(imp);
            state.impulses.push({
              mesh: imp,
              curve: line,
              progress: 0,
              speed: comparisonMode === "abnormal" ? 0.45 : 1.0,
            });
          }
        }

        // Progress active impulses
        for (let i = state.impulses.length - 1; i >= 0; i--) {
          const imp = state.impulses[i];
          imp.progress += dt * imp.speed * speed;
          if (imp.progress >= 1.0) {
            imp.mesh.parent?.remove(imp.mesh);
            state.impulses.splice(i, 1);
            if (imp.onComplete) imp.onComplete();
            continue;
          }
          imp.mesh.position.copy(imp.curve.getPointAt(imp.progress));
          imp.mesh.scale.setScalar(1.0 + 0.25 * Math.sin(time * 0.015));
        }

        // Progress particles
        for (let i = state.particles.length - 1; i >= 0; i--) {
          const p = state.particles[i];
          p.life -= dt * speed;
          if (p.life <= 0) {
            p.mesh.parent?.remove(p.mesh);
            state.particles.splice(i, 1);
            continue;
          }
          p.mesh.position.addScaledVector(p.velocity, dt * speed);
          const mat = p.mesh.material as THREE.MeshBasicMaterial;
          mat.opacity = p.life / p.maxLife;
        }

        // Pulse reflex targets
        const pulse = 1.0 + 0.25 * Math.sin(time * 0.01);
        if (state.spinalRing) state.spinalRing.scale.setScalar(pulse);
      }

      // Update 3D Direct Pointer Leader Lines & Badges (tracks even when paused/rotating)
      updateAnatomicalLabels(selectedCaseId);

      state.renderer.render(state.scene, state.camera);
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isOpen, isPlaying, speed, comparisonMode, selectedCaseId, isAutoRotate, reflexType, showLabels]);

  // Pointer rotation handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const state = threeRef.current;
    if (!state) return;
    state.isInteracting = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const state = threeRef.current;
    if (!state || !state.isInteracting) return;
    state.rotationY += e.movementX * 0.008;
    state.rotationX = Math.max(-0.6, Math.min(0.6, state.rotationX + e.movementY * 0.006));
  };

  const handlePointerUp = () => {
    if (threeRef.current) threeRef.current.isInteracting = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    const state = threeRef.current;
    if (!state) return;
    e.preventDefault();
    state.targetDistance = Math.max(8, Math.min(26, state.targetDistance + e.deltaY * 0.015));
  };

  const handleResetCamera = () => {
    const state = threeRef.current;
    if (!state) return;
    state.rotationY = selectedCaseId === "kasus-4" ? 0.35 : 0;
    state.rotationX = 0.08;
    state.targetDistance =
      selectedCaseId === "kasus-2"
        ? 10.5
        : selectedCaseId === "kasus-3"
        ? 11.0
        : selectedCaseId === "kasus-4"
        ? 9.8
        : selectedCaseId === "kasus-5"
        ? 13.0
        : 13.5;
  };

  const handleZoom = (delta: number) => {
    const state = threeRef.current;
    if (!state) return;
    state.targetDistance = Math.max(8, Math.min(26, state.targetDistance + delta));
  };

  if (!isOpen) return null;

  const currentCase =
    LEARNING_CASES.find((c) => c.id === selectedCaseId) || LEARNING_CASES[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-zinc-950/85 backdrop-blur-md animate-fade-in select-none">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .anat-label {
              position: absolute;
              pointer-events: auto;
              border: 1.5px solid rgba(56, 189, 248, 0.75);
              background: rgba(10, 15, 36, 0.92);
              color: #f0fdf4;
              font-family: inherit;
              font-size: 11px;
              font-weight: 700;
              padding: 3px 10px;
              border-radius: 9999px;
              white-space: nowrap;
              box-shadow: 0 0 12px rgba(56, 189, 248, 0.4);
              cursor: pointer;
              user-select: none;
              backdrop-filter: blur(8px);
              transition: background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease, transform 0.1s ease;
            }
            .anat-label:hover {
              background: rgba(14, 165, 233, 0.45);
              border-color: #38bdf8;
              box-shadow: 0 0 16px rgba(56, 189, 248, 0.8);
              transform: scale(1.06);
            }
            .anat-label.active {
              background: #0284c7 !important;
              color: #ffffff !important;
              border-color: #38bdf8 !important;
              box-shadow: 0 0 20px rgba(56, 189, 248, 1) !important;
            }
          `,
        }}
      />
      <div className="relative w-full max-w-4xl max-h-[96vh] flex flex-col rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden text-zinc-100">
        {/* ================= HEADER MODAL ================= */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-zinc-800/90 bg-zinc-900/95">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-sm">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                  Laboratorium Biologi 3D Realistis
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-700/50">
                  WebGL Three.js Engine
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white truncate max-w-md">
                {currentCase.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-all cursor-pointer"
              title="Tutup Simulasi"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================= TAB 5 KASUS LENGKAP ================= */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-zinc-800/60 bg-zinc-950/50 overflow-x-auto no-scrollbar">
          {LEARNING_CASES.map((item, idx) => {
            const isSelected = item.id === selectedCaseId;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedCaseId(item.id);
                  setSelectedElementInfo(null);
                  handleResetCamera();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-zinc-800/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                    isSelected
                      ? "bg-white text-indigo-700"
                      : "bg-zinc-700 text-zinc-300"
                  }`}
                >
                  {idx + 1}
                </span>
                <span className="truncate max-w-[150px]">
                  {item.title.split(":")[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* ================= BODY SIMULASI 3D ================= */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 flex flex-col gap-3.5">
          {/* CONTROL BAR */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 bg-zinc-950/70 p-2.5 rounded-xl border border-zinc-800/80">
            {/* Play, Pause, Reset, Zoom In/Out, Speed, Auto 360 */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm ${
                  isPlaying
                    ? "bg-amber-600 hover:bg-amber-500 text-white"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white"
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Mulai</span>
                  </>
                )}
              </button>

              <button
                onClick={handleResetCamera}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-all cursor-pointer"
                title="Atur Ulang Posisi Kamera 3D"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>

              {/* Zoom Buttons */}
              <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
                <button
                  onClick={() => handleZoom(-2)}
                  className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-all"
                  title="Perbesar (Zoom In)"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleZoom(2)}
                  className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-all"
                  title="Perkecil (Zoom Out)"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Speed Switcher */}
              <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
                {[0.5, 1, 2].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                      speed === s
                        ? "bg-indigo-600 text-white"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>

              <button
                onClick={() => setIsAutoRotate(!isAutoRotate)}
                className={`px-2 py-1 rounded text-[11px] font-medium border transition-all ${
                  isAutoRotate
                    ? "bg-indigo-950/60 border-indigo-700 text-indigo-300"
                    : "bg-zinc-900 border-zinc-800 text-zinc-500"
                }`}
                title="Putar Otomatis 360 Derajat"
              >
                Auto 360°
              </button>

              <button
                onClick={() => setShowLabels(!showLabels)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium border transition-all ${
                  showLabels
                    ? "bg-teal-950/60 border-teal-700 text-teal-300"
                    : "bg-zinc-900 border-zinc-800 text-zinc-500"
                }`}
                title="Tampilkan Label Bagian 3D"
              >
                <Tag className="w-3 h-3" />
                <span className="hidden sm:inline">Label</span>
              </button>
            </div>

            {/* Custom Mode Switcher per Case */}
            {selectedCaseId === "kasus-4" ? (
              <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                <button
                  onClick={() => setReflexType("reflex")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    reflexType === "reflex"
                      ? "bg-rose-600 text-white shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Refleks Kilat (~30ms)</span>
                </button>
                <button
                  onClick={() => setReflexType("conscious")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    reflexType === "conscious"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <Brain className="w-3.5 h-3.5" />
                  <span>Gerak Sadar Otak (~250ms)</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                <button
                  onClick={() => setComparisonMode("normal")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    comparisonMode === "normal"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Normal</span>
                </button>
                <button
                  onClick={() => setComparisonMode("abnormal")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    comparisonMode === "abnormal"
                      ? "bg-rose-600 text-white shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Kasus Terganggu</span>
                </button>
              </div>
            )}
          </div>

          {/* ================= 3D VIEWPORT CANVAS ================= */}
          <div
            ref={containerRef}
            className="relative w-full h-[340px] sm:h-[410px] rounded-2xl bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-800/90 overflow-hidden shadow-2xl flex items-center justify-center"
          >
            <canvas
              ref={canvasRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onWheel={handleWheel}
              className="w-full h-full cursor-grab active:cursor-grabbing block touch-none"
            />

            {/* 3D Anatomical Pointer Leader Lines (SVG - tracks 3D parts directly) */}
            <svg
              ref={svgLabelsRef}
              className={`absolute inset-0 w-full h-full pointer-events-none z-10 transition-opacity duration-300 ${
                showLabels ? "opacity-100" : "opacity-0"
              }`}
            />

            {/* 3D Anatomical Direct Pointer Labels (Pills directly pointing to anatomical parts) */}
            <div
              ref={domLabelsRef}
              className={`absolute inset-0 w-full h-full pointer-events-none z-20 transition-opacity duration-300 ${
                showLabels ? "opacity-100" : "opacity-0"
              }`}
            />

            {/* Bottom Overlay Info */}
            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-zinc-400 pointer-events-none bg-zinc-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-zinc-800/60 shadow-md">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>🖱️ Geser untuk memutar 360° · Scroll untuk zoom mikroskopis</span>
              </span>
              <span className="font-mono text-[10px] text-indigo-300 font-bold uppercase tracking-wider">
                {selectedCaseId === "kasus-1" && "3D Neuron: Akson & Mielin"}
                {selectedCaseId === "kasus-2" && "3D Penampang Membran: Kanal Na⁺ / K⁺"}
                {selectedCaseId === "kasus-3" && "3D Sambungan Sinapsis & Neurotransmiter"}
                {selectedCaseId === "kasus-4" && "3D Anatomi Tubuh: Refleks vs Sadar"}
                {selectedCaseId === "kasus-5" && "3D Jaringan Sistem Saraf Lengkap"}
              </span>
            </div>

            {/* Case 1: Badges */}
            {selectedCaseId === "kasus-1" && comparisonMode === "abnormal" && (
              <div className="absolute top-3 left-3 bg-rose-950/85 border border-rose-500/60 text-rose-200 px-3 py-1.5 rounded-xl text-xs flex items-center gap-2 backdrop-blur-md animate-fade-in shadow-xl">
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 animate-bounce" />
                <div>
                  <p className="font-bold">Mielin Rusak Terdeteksi!</p>
                  <p className="text-[10px] text-rose-300">
                    Arus listrik impuls bocor di bagian tengah & laju konduksi melambat drastis (15 m/s).
                  </p>
                </div>
              </div>
            )}

            {/* Case 2: Live Action Potential Voltage Indicator & Graph Wave */}
            {selectedCaseId === "kasus-2" && (
              <div className="absolute top-3 left-3 bg-zinc-950/85 border border-zinc-800 text-zinc-200 px-3 py-2 rounded-xl text-xs flex items-center gap-3 backdrop-blur-md shadow-xl">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Zap className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-400 font-semibold uppercase">Potensial Membran:</span>
                    <span className={`font-mono font-bold ${voltageValue > 0 ? "text-amber-400" : "text-sky-400"}`}>
                      {voltageValue > 0 ? `+${voltageValue}` : voltageValue} mV
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-white uppercase tracking-wider">
                    {ionPhase === "resting"
                      ? "Fase Istirahat (Kanal Tertutup)"
                      : ionPhase === "depolarizing"
                      ? "Depolarisasi (Na⁺ Masuk Membran)"
                      : "Repolarisasi (K⁺ Keluar Membran)"}
                  </p>
                </div>
              </div>
            )}

            {/* Case 4: Reflex Flinch Badge */}
            {selectedCaseId === "kasus-4" && reflexType === "reflex" && reflexFlinchTrigger > 0 && (
              <div className="absolute top-3 left-3 bg-rose-950/85 border border-rose-500/60 text-rose-200 px-3 py-1.5 rounded-xl text-xs flex items-center gap-2 backdrop-blur-md animate-fade-in shadow-xl">
                <Flame className="w-4 h-4 text-amber-400 flex-shrink-0 animate-pulse" />
                <div>
                  <p className="font-bold">Lengan Menghindar Otomatis!</p>
                  <p className="text-[10px] text-rose-300">
                    Otot bisep berkontraksi dalam ~30 ms sebelum rasa sakit disadari otak.
                  </p>
                </div>
              </div>
            )}

            {/* Case 5: Diagnostic Latency Meter */}
            {selectedCaseId === "kasus-5" && (
              <div className="absolute top-3 left-3 bg-zinc-950/85 border border-indigo-700/60 text-zinc-200 px-3 py-2 rounded-xl text-xs flex items-center gap-3 backdrop-blur-md shadow-xl">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                  <TrendingUp className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 font-semibold uppercase">Uji Kecepatan Jalur Saraf:</span>
                  <p className={`text-[11px] font-bold ${comparisonMode === "normal" ? "text-emerald-400" : "text-rose-400"}`}>
                    {latencyReadout}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ================= CASE SPECIFIC INTERACTION CARDS ================= */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* KASUS 1 */}
            {selectedCaseId === "kasus-1" && (
              <>
                <div
                  onClick={() =>
                    setSelectedElementInfo(
                      "Badan Sel (Soma) & Dendrit: Berada di sisi kiri (bola biru bergelombang organik), bertugas menerima rangsang dan menyatukan sinyal listrik di bukit akson."
                    )
                  }
                  className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 hover:border-indigo-500/50 cursor-pointer transition-all hover:scale-102"
                >
                  <h4 className="text-xs font-bold text-sky-400 mb-1">
                    1. Dendrit & Badan Sel
                  </h4>
                  <p className="text-[11px] text-zinc-400 leading-snug">
                    Menerima impuls dari reseptor / neuron sebelumnya.
                  </p>
                </div>
                <div
                  onClick={() =>
                    setSelectedElementInfo(
                      comparisonMode === "normal"
                        ? "Selubung Mielin Normal: Silinder kuning membungkus akson. Menghasilkan konduksi saltatori cepat melompati celah nodus Ranvier (100 m/s)."
                        : "Selubung Mielin Rusak (Kasus Andi): Lapisan isolator terkelupas (merah berlubang). Arus bocor dan konduksi koordinasi motorik melambat!"
                    )
                  }
                  className={`p-3 rounded-xl border cursor-pointer transition-all hover:scale-102 ${
                    comparisonMode === "normal"
                      ? "bg-zinc-950/80 border-zinc-800 hover:border-emerald-500/50"
                      : "bg-rose-950/30 border-rose-800/80"
                  }`}
                >
                  <h4
                    className={`text-xs font-bold mb-1 ${
                      comparisonMode === "normal"
                        ? "text-amber-400"
                        : "text-rose-400"
                    }`}
                  >
                    2. Selubung Mielin & Akson
                  </h4>
                  <p className="text-[11px] text-zinc-400 leading-snug">
                    {comparisonMode === "normal"
                      ? "Mielin utuh (kuning) mempercepat transmisi hingga 100 m/s."
                      : "Kerusakan mielin menyebabkan gangguan koordinasi gerak Andi!"}
                  </p>
                </div>
                <div
                  onClick={() =>
                    setSelectedElementInfo(
                      "Terminal Akson (Ujung Kanan): Melepaskan zat kimiawi neurotransmiter ke sel target/otot."
                    )
                  }
                  className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 hover:border-emerald-500/50 cursor-pointer transition-all hover:scale-102"
                >
                  <h4 className="text-xs font-bold text-emerald-400 mb-1">
                    3. Ujung Terminal Akson
                  </h4>
                  <p className="text-[11px] text-zinc-400 leading-snug">
                    Percabangan hijau di ujung kanan meneruskan sinyal ke efektor.
                  </p>
                </div>
              </>
            )}

            {/* KASUS 2 */}
            {selectedCaseId === "kasus-2" && (
              <>
                <div
                  onClick={() =>
                    setSelectedElementInfo(
                      "Kanal Ion Na⁺ (Silinder Oranye Kiri): Membuka saat stimulus mencapai ambang batas, memungkinkan ion Na⁺ masuk memicu depolarisasi."
                    )
                  }
                  className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 hover:border-amber-500/50 cursor-pointer transition-all hover:scale-102"
                >
                  <h4 className="text-xs font-bold text-amber-400 mb-1">
                    1. Kanal Ion Na⁺ (Depolarisasi)
                  </h4>
                  <p className="text-[11px] text-zinc-400 leading-snug">
                    Ion Na⁺ masuk pesat ke dalam akson, menaikkan voltase ke +30mV.
                  </p>
                </div>
                <div
                  onClick={() =>
                    setSelectedElementInfo(
                      "Kanal Ion K⁺ (Silinder Ungu Kanan): Membuka saat repolarisasi, memungkinkan ion K⁺ keluar mengembalikan muatan negatif istirahat (-70mV)."
                    )
                  }
                  className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 hover:border-purple-500/50 cursor-pointer transition-all hover:scale-102"
                >
                  <h4 className="text-xs font-bold text-purple-400 mb-1">
                    2. Kanal Ion K⁺ (Repolarisasi)
                  </h4>
                  <p className="text-[11px] text-zinc-400 leading-snug">
                    Ion K⁺ keluar memulihkan polaritas membran akson.
                  </p>
                </div>
                <div
                  onClick={() =>
                    setSelectedElementInfo(
                      comparisonMode === "normal"
                        ? "Aliran Ion Normal: Perpindahan ion Na⁺ dan K⁺ membentuk potensial aksi listrik yang stabil."
                        : "Gangguan Kanal Ion: Kanal tersumbat, ion tidak berpindah, potensial aksi gagal terbentuk!"
                    )
                  }
                  className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 hover:border-sky-500/50 cursor-pointer transition-all hover:scale-102"
                >
                  <h4 className="text-xs font-bold text-sky-400 mb-1">
                    3. Status Potensial Aksi
                  </h4>
                  <p className="text-[11px] text-zinc-400 leading-snug">
                    {comparisonMode === "normal"
                      ? "Grafik potensial aksi berfluktuasi -70mV ke +30mV."
                      : "Kanal ion terganggu: Impuls terhambat total!"}
                  </p>
                </div>
              </>
            )}

            {/* KASUS 3 */}
            {selectedCaseId === "kasus-3" && (
              <>
                <div
                  onClick={() =>
                    setSelectedElementInfo(
                      "Terminal Prasinaptik (Kiri): Mengandung vesikel sinaptik yang menyimpan neurotransmiter kimiawi serta mitokondria penyedia ATP."
                    )
                  }
                  className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 hover:border-sky-500/50 cursor-pointer transition-all hover:scale-102"
                >
                  <h4 className="text-xs font-bold text-sky-400 mb-1">
                    1. Vesikel Prasinaptik
                  </h4>
                  <p className="text-[11px] text-zinc-400 leading-snug">
                    Menyimpan molekul neurotransmiter siap dilepas saat impuls tiba.
                  </p>
                </div>
                <div
                  onClick={() =>
                    setSelectedElementInfo(
                      comparisonMode === "normal"
                        ? "Pelepasan Normal: Molekul neurotransmiter hijau dilepaskan melintasi celah sinapsis (20-40 nm)."
                        : "Pelepasan Terganggu: Jumlah molekul neurotransmiter yang keluar sangat sedikit, sinyal gagal tersampaikan!"
                    )
                  }
                  className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 hover:border-emerald-500/50 cursor-pointer transition-all hover:scale-102"
                >
                  <h4 className="text-xs font-bold text-emerald-400 mb-1">
                    2. Celah Sinapsis
                  </h4>
                  <p className="text-[11px] text-zinc-400 leading-snug">
                    Ruang antarneuron tempat neurotransmiter berdifusi.
                  </p>
                </div>
                <div
                  onClick={() =>
                    setSelectedElementInfo(
                      "Reseptor Pascasinaptik (Kanan): Saluran protein yang membuka saat neurotransmiter menempel, memicu impuls baru."
                    )
                  }
                  className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 hover:border-indigo-500/50 cursor-pointer transition-all hover:scale-102"
                >
                  <h4 className="text-xs font-bold text-indigo-400 mb-1">
                    3. Reseptor Pascasinaptik
                  </h4>
                  <p className="text-[11px] text-zinc-400 leading-snug">
                    Mengikat neurotransmiter untuk mengaktifkan sel target berikutnya.
                  </p>
                </div>
              </>
            )}

            {/* KASUS 4 */}
            {selectedCaseId === "kasus-4" && (
              <>
                <div
                  onClick={() =>
                    setSelectedElementInfo(
                      "Reseptor Panas di Jari: Mendeteksi suhu tinggi setrika dan memicu potensial aksi pada neuron sensorik."
                    )
                  }
                  className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 hover:border-rose-500/50 cursor-pointer transition-all hover:scale-102"
                >
                  <h4 className="text-xs font-bold text-rose-400 mb-1">
                    1. Rangsang Panas (Jari)
                  </h4>
                  <p className="text-[11px] text-zinc-400 leading-snug">
                    Reseptor kulit jari mendeteksi suhu panas dan mengirim impuls.
                  </p>
                </div>
                <div
                  onClick={() =>
                    setSelectedElementInfo(
                      "Sumsum Tulang Belakang (Spinal Cord): Pusat kendali refleks. Interneuron langsung memotong sinyal ke saraf motorik tanpa menunggu instruksi sadar otak!"
                    )
                  }
                  className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 hover:border-amber-500/50 cursor-pointer transition-all hover:scale-102"
                >
                  <h4 className="text-xs font-bold text-amber-400 mb-1">
                    2. Medula Spinalis
                  </h4>
                  <p className="text-[11px] text-zinc-400 leading-snug">
                    Pusat integrasi refleks cepat ~30 ms sebelum otak menyadari rasa sakit.
                  </p>
                </div>
                <div
                  onClick={() =>
                    setSelectedElementInfo(
                      "Otot Lengan / Efektor (Titik Hijau): Menerima perintah motorik dan langsung berkontraksi menarik tangan menjauh."
                    )
                  }
                  className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 hover:border-emerald-500/50 cursor-pointer transition-all hover:scale-102"
                >
                  <h4 className="text-xs font-bold text-emerald-400 mb-1">
                    3. Efektor Otot Lengan
                  </h4>
                  <p className="text-[11px] text-zinc-400 leading-snug">
                    Otot menarik tangan menjauh dalam sekejap untuk mencegah luka bakar.
                  </p>
                </div>
              </>
            )}

            {/* KASUS 5 */}
            {selectedCaseId === "kasus-5" && (
              <>
                {[
                  {
                    id: 1,
                    title: "1. Reseptor Sensorik",
                    desc: "Titik input rangsangan awal.",
                    color: "text-sky-400 border-sky-800/80",
                    info: "Reseptor Sensorik: Jika titik ini terganggu, rangsang tidak terbaca sama sekali.",
                  },
                  {
                    id: 2,
                    title: "2. Akson & Mielin",
                    desc: "Jalur konduksi saltatori.",
                    color: "text-amber-400 border-amber-800/80",
                    info: "Akson & Mielin: Kerusakan di sini memperlambat kecepatan rambatan sinyal.",
                  },
                  {
                    id: 3,
                    title: "3. Celah Sinapsis",
                    desc: "Penerus sinyal kimiawi.",
                    color: "text-emerald-400 border-emerald-800/80",
                    info: "Sinapsis: Kegagalan neurotransmiter menghalangi penerusan sinyal ke neuron berikutnya.",
                  },
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setTestedCheckpoint(item.id);
                      setSelectedElementInfo(item.info);
                    }}
                    className={`p-3 rounded-xl bg-zinc-950/80 border ${item.color} cursor-pointer transition-all hover:scale-104`}
                  >
                    <h4 className={`text-xs font-bold mb-1 ${item.color}`}>
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-zinc-400 leading-snug">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* ================= BOX DETAIL PENJELASAN ELEMEN KLIK ================= */}
          {selectedElementInfo && (
            <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-800/80 text-xs text-indigo-200 flex items-start gap-2.5 animate-fade-in shadow-md">
              <Info className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">{selectedElementInfo}</p>
              </div>
              <button
                onClick={() => setSelectedElementInfo(null)}
                className="text-indigo-400 hover:text-white text-[11px] font-bold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          )}

          {/* ================= SKENARIO KASUS ================= */}
          <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800/90 text-xs space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-400 font-bold text-[10px] uppercase tracking-wider">
              <Brain className="w-3.5 h-3.5 text-indigo-400" />
              <span>Skenario Kasus Pasien</span>
            </div>
            <p className="text-zinc-200 leading-relaxed text-[11px]">
              {currentCase.scenario}
            </p>
          </div>
        </div>

        {/* ================= FOOTER MODAL ================= */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-t border-zinc-800 bg-zinc-900/95 text-xs">
          <span className="text-zinc-500 text-[11px]">
            Gunakan tombol <strong>Normal / Kasus Terganggu</strong> untuk membandingkan.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-sm cursor-pointer"
          >
            Lanjutkan Diskusi Kasus
          </button>
        </div>
      </div>
    </div>
  );
};
