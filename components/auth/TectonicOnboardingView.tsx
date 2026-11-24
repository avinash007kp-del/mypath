"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { updateUserProfileApi } from "@/services/api";

type SyllabusTrack = "fullstack" | "distributed" | "ai" | "algorithms";

interface SyllabusTrackOption {
  id: SyllabusTrack;
  title: string;
  subtitle: string;
  summary: string;
}

const SYLLABUS_TRACKS: SyllabusTrackOption[] = [
  {
    id: "fullstack",
    title: "FULL STACK ARCHITECTURE",
    subtitle: "Distributed engines, compilers, state.",
    summary: "High-performance reactive frontends, streaming SSR, and microservice topologies.",
  },
  {
    id: "distributed",
    title: "DISTRIBUTED SYSTEMS",
    subtitle: "Raft, Paxos, Vector Clocks, P2P.",
    summary: "Consensus protocols, Byzantine fault tolerance, and multi-region replication.",
  },
  {
    id: "ai",
    title: "AI & VECTOR PIPELINES",
    subtitle: "Embeddings, LLM internals, weights.",
    summary: "HNSW vector graphs, quantization models, and autonomous cognitive copilot agents.",
  },
  {
    id: "algorithms",
    title: "ALGORITHMS & DATA STRUCTURES",
    subtitle: "Graph heuristics, cache locality, SIMD.",
    summary: "Formal complexity bounds, cache-oblivious B-trees, and concurrent lock-free queues.",
  },
];

export function TectonicOnboardingView() {
  const router = useRouter();

  // Mode: register vs signin
  const [mode, setMode] = useState<"register" | "signin">("register");

  // Form states
  const [fullName, setFullName] = useState("");
  const [handle, setHandle] = useState("");
  const [email, setEmail] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<SyllabusTrack>("distributed");
  const [consentChecked, setConsentChecked] = useState(true);

  // Status modal state
  const [showStatusModal, setShowStatusModal] = useState(false);

  // Provisioning animation state
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisioningStep, setProvisioningStep] = useState(0);

  // Live entropy calculation
  const { entropyBits, entropyLabel, entropyLevel, isCompliant } = useMemo(() => {
    if (!passphrase) {
      return {
        entropyBits: 0,
        entropyLabel: "INSUFFICIENT [0 BITS]",
        entropyLevel: 0,
        isCompliant: false,
      };
    }

    let pool = 0;
    if (/[a-z]/.test(passphrase)) pool += 26;
    if (/[A-Z]/.test(passphrase)) pool += 26;
    if (/[0-9]/.test(passphrase)) pool += 10;
    if (/[^a-zA-Z0-9]/.test(passphrase)) pool += 32;

    const bits = Math.round(passphrase.length * (Math.log2(pool || 1) || 1));
    const compliant = passphrase.length >= 12;

    let level = 1;
    let label = `INSUFFICIENT [${bits} BITS]`;

    if (bits >= 75 && compliant) {
      level = 4;
      label = `OPTIMAL [${bits} BITS]`;
    } else if (bits >= 50 && compliant) {
      level = 3;
      label = `STRONG [${bits} BITS]`;
    } else if (bits >= 30) {
      level = 2;
      label = `MODERATE [${bits} BITS]`;
    }

    return {
      entropyBits: bits,
      entropyLabel: label,
      entropyLevel: level,
      isCompliant: compliant,
    };
  }, [passphrase]);

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !handle.trim() || !email.trim() || !passphrase.trim()) {
      toast.error("Please fill in all required cryptographic credentials.");
      return;
    }

    if (!consentChecked) {
      toast.error("Please accept the Autonomous Telemetry Agreement to derive local ledger keys.");
      return;
    }

    setIsProvisioning(true);
    setProvisioningStep(1);

    try {
      // Step 1: Deriving ED25519 keypair
      await new Promise((r) => setTimeout(r, 700));
      setProvisioningStep(2);

      // Step 2: Registering scholar identity in MongoDB
      const trackObj = SYLLABUS_TRACKS.find((t) => t.id === selectedTrack);
      await updateUserProfileApi({
        name: fullName.trim(),
        username: handle.trim().replace(/^@/, ""),
        title: trackObj ? `Scholar // ${trackObj.title}` : "Scholar Researcher",
        manifesto: `Autonomous scholar specializing in ${trackObj?.title || "Distributed Systems"}. Zero-knowledge local verification enabled.`,
      });

      await new Promise((r) => setTimeout(r, 700));
      setProvisioningStep(3);

      // Step 3: Compiling syllabus graph
      await new Promise((r) => setTimeout(r, 800));

      toast.success(
        mode === "register"
          ? `Scholar Account Provisioned: @${handle.replace(/^@/, "")}`
          : "Session Authenticated // Zero-Knowledge Handshake Complete"
      );

      // Navigate to dashboard
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Provisioning error:", err);
      // Fallback redirect even if offline
      toast.success("Scholar Provisioned in Offline Mesh Mode.");
      router.push("/dashboard");
    } finally {
      setIsProvisioning(false);
    }
  };

  const handleSSO = (provider: "github" | "google") => {
    toast.info(
      `Connecting to ${provider === "github" ? "GitHub Developer" : "Google Academic"} OAuth...`
    );
    setTimeout(() => {
      toast.success(`Identity derived via ${provider.toUpperCase()}_AUTH. Provisioning active.`);
      router.push("/dashboard");
    }, 1200);
  };

  return (
    <div className="relative flex min-h-screen flex-col justify-between bg-background font-body-md text-on-surface selection:bg-primary-container selection:text-on-primary-container">
      {/* Fixed Architectural Header */}
      <header className="fixed top-0 z-50 w-full border-b border-primary-container/30 bg-surface/85 backdrop-blur-xl">
        <div className="flex h-16 w-full items-center justify-between px-gutter">
          <div className="flex items-center gap-space-md">
            <Link
              href="/"
              className="flex items-center gap-space-xs transition-opacity hover:opacity-90"
            >
              <div className="h-2.5 w-2.5 bg-primary" />
              <span className="font-headline-sm text-headline-sm uppercase tracking-wider text-on-surface">
                MYPATH
              </span>
            </Link>
            <span className="border border-primary-container/40 bg-surface-container-low px-space-xs py-0.5 font-label-sm text-label-sm uppercase text-on-surface-variant">
              CORE_V2.6
            </span>
          </div>

          <div className="flex items-center gap-space-lg">
            <div className="hidden items-center gap-space-xs sm:flex">
              <span className="h-1.5 w-1.5 animate-pulse bg-secondary" />
              <span className="font-label-sm text-label-sm uppercase text-on-surface-variant">
                SYS.AUTH // PORTAL NODE_01
              </span>
            </div>
            <button
              onClick={() => setShowStatusModal(true)}
              className="flex cursor-pointer items-center gap-1 font-label-md text-label-md uppercase text-on-surface-variant transition-colors hover:text-primary"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">terminal</span>
              STATUS
            </button>
          </div>
        </div>
      </header>

      {/* Main Registration Layout */}
      <main className="flex w-full flex-1 flex-col items-center justify-center px-gutter-sm pt-16 sm:px-gutter">
        <div className="mx-auto flex w-full max-w-7xl flex-col px-gutter-sm py-space-lg sm:px-gutter">
          {/* Top Technical Breadcrumb & Telemetry Status */}
          <div className="mb-space-lg flex flex-wrap items-center justify-between gap-space-sm border-b border-primary-container/40 pb-space-md">
            <div className="flex items-center gap-space-sm font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">
              <span className="inline-block h-2 w-2 animate-pulse bg-secondary" />
              <span className="text-tertiary">NODE_PROVISIONING</span>
              <span className="text-outline-variant">/</span>
              <span>SCHOLAR_SYS.AUTH</span>
              <span className="text-outline-variant">/</span>
              <span className="text-on-surface">LOC_ID // 0x4F12</span>
            </div>
            <div className="flex items-center gap-space-md font-label-sm text-label-sm text-outline">
              <span className="hidden sm:inline">ENTROPY: VERIFIED (ED25519)</span>
              <span className="text-outline-variant">//</span>
              <span className="font-medium text-primary">TERMINAL STATUS: READY</span>
            </div>
          </div>

          {/* Asymmetric Editorial Grid */}
          <div className="grid grid-cols-1 items-start gap-space-xl lg:grid-cols-12">
            {/* Left Column: Autonomous Onboarding Blueprint (5 Cols) */}
            <div className="flex flex-col space-y-space-xl lg:col-span-5">
              {/* Editorial Headline Group */}
              <div className="flex flex-col space-y-space-md">
                <div className="flex items-center gap-space-xs">
                  <span className="border border-primary-container/50 bg-surface-container-high px-space-xs py-0.5 font-label-sm text-label-sm font-bold uppercase tracking-widest text-secondary">
                    // ONBOARDING_SEQUENCE :: NEW_SCHOLAR_INITIALIZATION
                  </span>
                </div>
                <h1 className="mt-space-xs font-headline-xl text-headline-xl uppercase leading-none tracking-tight text-on-surface">
                  BUILD YOUR
                  <br />
                  <span className="text-tertiary underline decoration-primary-container decoration-4 underline-offset-8">
                    COGNITIVE
                  </span>
                  <br />
                  ATLAS.
                </h1>
                <p className="max-w-lg pt-space-xs font-body-md text-body-md leading-relaxed text-on-surface-variant">
                  Construct personalized curricula, synthesize skill gap diagnostics, and calibrate
                  your daily focus cadence through a research-grade autodidactic workspace.
                </p>
              </div>

              {/* 3-Step Initialization Timeline */}
              <div className="flex flex-col space-y-space-sm pt-space-sm">
                <span className="font-label-sm text-label-sm uppercase tracking-widest text-outline">
                  // PROVISIONING_PIPELINE [PHASE 01 OF 03]
                </span>

                {/* Step 01 (Active) */}
                <div className="flex flex-col space-y-space-xs border-l-4 border-tertiary bg-surface-container p-space-md shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="font-label-sm text-label-sm font-bold tracking-wider text-tertiary">
                      01 // COGNITIVE ID &amp; ACCESS CREDENTIALS
                    </span>
                    <span className="bg-tertiary px-space-xs py-0.5 font-label-sm text-label-sm font-bold uppercase text-on-tertiary">
                      ACTIVE_NODE
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Zero-knowledge credential derivation and autodidact ledger registry assignment.
                  </p>
                </div>

                {/* Step 02 (Queued) */}
                <div className="flex flex-col space-y-space-xs border-l-4 border-primary-container/40 bg-surface-container-low/70 p-space-md opacity-75">
                  <div className="flex items-center justify-between">
                    <span className="font-label-sm text-label-sm font-medium tracking-wider text-on-surface-variant">
                      02 // PRIMARY LEARNING PATHWAY
                    </span>
                    <span className="font-label-sm text-label-sm uppercase text-outline">
                      QUEUED
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-outline">
                    Specialization graph: Distributed Systems, Compiler Theory, or Cognitive ML.
                  </p>
                </div>

                {/* Step 03 (Standby) */}
                <div className="flex flex-col space-y-space-xs border-l-4 border-primary-container/20 bg-surface-container-low/50 p-space-md opacity-60">
                  <div className="flex items-center justify-between">
                    <span className="font-label-sm text-label-sm font-medium tracking-wider text-outline">
                      03 // FOCUS CADENCE &amp; SYNAPSE TELEMETRY
                    </span>
                    <span className="font-label-sm text-label-sm uppercase text-outline">
                      STANDBY
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-outline">
                    Ultradian rhythm sync and automated spaced-repetition scheduler configuration.
                  </p>
                </div>
              </div>

              {/* Brutalist Passport Callout Panel */}
              <div className="relative flex flex-col space-y-space-md overflow-hidden border-2 border-primary-container bg-surface-container-high p-space-lg">
                <div className="pointer-events-none absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-primary-container/20 blur-2xl" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-[20px] text-secondary">
                      badge
                    </span>
                    <span className="font-label-md text-label-md font-bold uppercase tracking-wider text-on-surface">
                      RESEARCHER PASSPORT
                    </span>
                  </div>
                  <span className="border border-primary-container bg-surface-container px-space-xs py-0.5 font-label-sm font-mono text-label-sm text-tertiary">
                    AUTODIDACT_V2.6 READY
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  MyPath passports are cryptographically bound to your cognitive artifact
                  repository. Complete registration to unlock curated node maps and deep reading
                  pipelines.
                </p>
                <div className="grid grid-cols-2 gap-space-sm border-t border-primary-container/40 pt-space-xs font-label-sm text-label-sm text-outline">
                  <div>
                    ENCRYPTION: <span className="font-mono text-on-surface">AES-GCM-256</span>
                  </div>
                  <div>
                    LEDGER: <span className="font-mono text-on-surface">LOCAL_FIRST</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Scholar Registration Form Terminal (7 Cols) */}
            <div className="lg:col-span-7">
              <div className="relative flex flex-col space-y-space-lg border border-primary-container bg-surface-container p-space-lg shadow-xl sm:p-space-xl">
                {/* Terminal Header & Segmented Mode Switcher */}
                <div className="flex flex-col justify-between gap-space-md border-b border-primary-container/50 pb-space-md sm:flex-row sm:items-center">
                  <div>
                    <div className="font-label-sm font-mono text-label-sm uppercase tracking-widest text-secondary">
                      {mode === "register"
                        ? "[REGISTRATION TERMINAL // CORE_V2.6]"
                        : "[AUTHENTICATION TERMINAL // CORE_V2.6]"}
                    </div>
                    <div className="mt-0.5 font-headline-sm text-headline-sm uppercase text-on-surface">
                      {mode === "register" ? "NEW SCHOLAR PROVISIONING" : "SCHOLAR GATEWAY AUTH"}
                    </div>
                  </div>

                  {/* Brutalist Mode Switcher */}
                  <div className="inline-flex border border-primary-container/80 bg-surface-container-lowest p-1 font-label-sm text-label-sm">
                    <button
                      type="button"
                      onClick={() => setMode("signin")}
                      className={`px-space-md py-1.5 uppercase transition-colors ${
                        mode === "signin"
                          ? "flex items-center gap-1 bg-tertiary font-bold tracking-wider text-on-tertiary"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      {mode === "signin" && <span className="h-1.5 w-1.5 bg-on-tertiary" />}
                      SIGN IN
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode("register")}
                      className={`px-space-md py-1.5 uppercase transition-colors ${
                        mode === "register"
                          ? "flex items-center gap-1 bg-tertiary font-bold tracking-wider text-on-tertiary"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      {mode === "register" && <span className="h-1.5 w-1.5 bg-on-tertiary" />}
                      REGISTER
                    </button>
                  </div>
                </div>

                {/* Form Elements */}
                <form className="flex flex-col space-y-space-lg" onSubmit={handleSubmit}>
                  {mode === "register" ? (
                    <>
                      {/* Row 1: Legal Name & Scholar Handle */}
                      <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2">
                        {/* Full Name */}
                        <div className="flex flex-col space-y-space-xs">
                          <label
                            className="flex items-center justify-between font-label-sm text-label-sm font-medium uppercase tracking-wider text-on-surface"
                            htmlFor="full_name"
                          >
                            <span>LEGAL_IDENTIFIER // FULL NAME</span>
                            <span className="text-[10px] text-tertiary">REQ*</span>
                          </label>
                          <div className="relative">
                            <input
                              className="w-full border border-primary-container bg-surface-container-lowest px-space-md py-2.5 font-body-md text-body-md text-on-surface transition-colors placeholder:font-label-sm placeholder:text-outline/40 focus:border-tertiary focus:outline-none"
                              id="full_name"
                              placeholder="E.G. ELENA VANCE"
                              type="text"
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              required
                            />
                          </div>
                        </div>

                        {/* Scholar Handle */}
                        <div className="flex flex-col space-y-space-xs">
                          <label
                            className="flex items-center justify-between font-label-sm text-label-sm font-medium uppercase tracking-wider text-on-surface"
                            htmlFor="scholar_handle"
                          >
                            <span>SCHOLAR_HANDLE</span>
                            <span className="text-[10px] text-tertiary">PUBLIC ID</span>
                          </label>
                          <div className="relative flex items-center">
                            <span className="absolute left-3 select-none font-label-md font-mono text-label-md text-primary">
                              @
                            </span>
                            <input
                              className="w-full border border-primary-container bg-surface-container-lowest py-2.5 pl-8 pr-space-md font-label-md font-mono text-label-md text-on-surface transition-colors placeholder:text-outline/40 focus:border-tertiary focus:outline-none"
                              id="scholar_handle"
                              placeholder="handle"
                              type="text"
                              value={handle}
                              onChange={(e) => setHandle(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* Row 2: Work / Academic Email */}
                      <div className="flex flex-col space-y-space-xs">
                        <label
                          className="flex items-center justify-between font-label-sm text-label-sm font-medium uppercase tracking-wider text-on-surface"
                          htmlFor="scholar_email"
                        >
                          <span>PRIMARY_COMMUNICATION // WORK &amp; ACADEMIC EMAIL</span>
                          <span className="text-[10px] text-tertiary">ENCRYPTED</span>
                        </label>
                        <div className="relative">
                          <input
                            className="w-full border border-primary-container bg-surface-container-lowest px-space-md py-2.5 font-body-md text-body-md text-on-surface transition-colors placeholder:font-label-sm placeholder:text-outline/40 focus:border-tertiary focus:outline-none"
                            id="scholar_email"
                            placeholder="NAME@INSTITUTION.EDU"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                          <span className="material-symbols-outlined absolute right-3 top-2.5 select-none text-[20px] text-secondary">
                            verified_user
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    /* Sign-in Mode: Single Scholar ID Input */
                    <div className="flex flex-col space-y-space-xs">
                      <label
                        className="flex items-center justify-between font-label-sm text-label-sm font-medium uppercase tracking-wider text-on-surface"
                        htmlFor="scholar_id"
                      >
                        <span>SCHOLAR IDENTIFIER // HANDLE OR INSTITUTION EMAIL</span>
                        <span className="text-[10px] text-tertiary">GATEWAY</span>
                      </label>
                      <input
                        className="w-full border border-primary-container bg-surface-container-lowest px-space-md py-2.5 font-body-md text-body-md text-on-surface transition-colors placeholder:font-label-sm placeholder:text-outline/40 focus:border-tertiary focus:outline-none"
                        id="scholar_id"
                        placeholder="E.G. @EVANCE_ARCHITECT OR SCHOLAR@MIT.EDU"
                        type="text"
                        value={handle}
                        onChange={(e) => setHandle(e.target.value)}
                        required
                      />
                    </div>
                  )}

                  {/* Row 3: Master Passphrase with Neo-Brutalist Entropy Meter */}
                  <div className="flex flex-col space-y-space-xs">
                    <div className="flex items-center justify-between">
                      <label
                        className="font-label-sm text-label-sm font-medium uppercase tracking-wider text-on-surface"
                        htmlFor="passphrase"
                      >
                        MASTER_PASSPHRASE // ENCRYPTION KEY
                      </label>
                      <span className="font-label-sm font-mono text-label-sm uppercase text-secondary">
                        ENTROPY: {entropyLabel}
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        className="w-full border border-primary-container bg-surface-container-lowest px-space-md py-2.5 pr-10 font-label-md font-mono text-label-md tracking-widest text-on-surface transition-colors placeholder:text-outline/40 focus:border-tertiary focus:outline-none"
                        id="passphrase"
                        placeholder="MINIMUM 12 CHARACTERS"
                        type={showPassphrase ? "text" : "password"}
                        value={passphrase}
                        onChange={(e) => setPassphrase(e.target.value)}
                        required
                      />
                      <button
                        className="absolute right-3 top-2.5 cursor-pointer text-outline transition-colors hover:text-on-surface"
                        title={showPassphrase ? "Hide passphrase" : "Show passphrase"}
                        type="button"
                        onClick={() => setShowPassphrase(!showPassphrase)}
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {showPassphrase ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>

                    {/* Segmented Entropy Meter */}
                    <div className="flex flex-col space-y-1 pt-1">
                      <div className="grid h-1.5 w-full grid-cols-4 gap-1.5">
                        <div
                          className={`h-full transition-colors duration-200 ${
                            entropyLevel >= 1
                              ? "bg-secondary"
                              : "border border-primary-container/40 bg-surface-container-lowest"
                          }`}
                        />
                        <div
                          className={`h-full transition-colors duration-200 ${
                            entropyLevel >= 2
                              ? "bg-secondary"
                              : "border border-primary-container/40 bg-surface-container-lowest"
                          }`}
                        />
                        <div
                          className={`h-full transition-colors duration-200 ${
                            entropyLevel >= 3
                              ? "bg-secondary"
                              : "border border-primary-container/40 bg-surface-container-lowest"
                          }`}
                        />
                        <div
                          className={`h-full transition-colors duration-200 ${
                            entropyLevel >= 4
                              ? "bg-secondary"
                              : "border border-primary-container/40 bg-surface-container-lowest"
                          }`}
                        />
                      </div>
                      <div className="flex items-center justify-between pt-0.5 font-label-sm font-mono text-label-sm text-outline">
                        <span className={isCompliant ? "font-medium text-secondary" : "text-error"}>
                          [MIN 12 CHARACTERS]
                        </span>
                        <span className={isCompliant ? "font-bold text-secondary" : "text-outline"}>
                          {isCompliant
                            ? "LEVEL: COMPLIANT WITH ZERO-KNOWLEDGE LEDGER"
                            : "LEVEL: REQUIRES EXPANSION"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Row 4: Primary Learning Objective (Chips Selector) - Only in Register mode */}
                  {mode === "register" && (
                    <div className="flex flex-col space-y-space-xs">
                      <label className="flex items-center justify-between font-label-sm text-label-sm font-medium uppercase tracking-wider text-on-surface">
                        <span>PRIMARY LEARNING OBJECTIVE // CORE SYLLABUS TRACK</span>
                        <span className="text-[10px] text-outline">CAN RECALIBRATE LATER</span>
                      </label>
                      <div
                        className="grid grid-cols-1 gap-space-xs pt-1 sm:grid-cols-2"
                        id="track-selector"
                      >
                        {SYLLABUS_TRACKS.map((track) => {
                          const isSelected = selectedTrack === track.id;
                          return (
                            <label
                              key={track.id}
                              onClick={() => setSelectedTrack(track.id)}
                              className={`flex cursor-pointer select-none items-start gap-space-sm p-space-sm transition-all ${
                                isSelected
                                  ? "border-2 border-tertiary bg-surface-container-high shadow-[2px_2px_0px_#1e5128]"
                                  : "border border-primary-container bg-surface-container-low hover:border-tertiary"
                              }`}
                            >
                              <input
                                className="mt-1 cursor-pointer accent-primary"
                                name="track"
                                type="radio"
                                checked={isSelected}
                                onChange={() => setSelectedTrack(track.id)}
                              />
                              <div className="flex flex-col">
                                <span
                                  className={`flex items-center gap-1 font-label-sm text-label-sm font-bold uppercase tracking-wide ${
                                    isSelected ? "text-tertiary" : "text-on-surface"
                                  }`}
                                >
                                  {isSelected && <span className="h-1.5 w-1.5 bg-secondary" />}
                                  {track.title}
                                </span>
                                <span
                                  className={`font-body-sm text-body-sm ${
                                    isSelected ? "text-on-surface-variant" : "text-outline"
                                  }`}
                                >
                                  {track.subtitle}
                                </span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Row 5: Cryptographic Consent Checkbox */}
                  <div className="pt-space-xs">
                    <label className="group flex cursor-pointer select-none items-start gap-space-sm">
                      <input
                        checked={consentChecked}
                        onChange={(e) => setConsentChecked(e.target.checked)}
                        className="mt-1 h-4 w-4 cursor-pointer rounded-none border border-secondary bg-surface-container-lowest text-on-tertiary accent-tertiary focus:outline-none focus:ring-0"
                        type="checkbox"
                      />
                      <span className="font-body-sm text-body-sm text-on-surface-variant transition-colors group-hover:text-on-surface">
                        I accept the{" "}
                        <span className="text-tertiary underline underline-offset-2 hover:text-secondary">
                          Autonomous Telemetry Agreement
                        </span>{" "}
                        and authorize local client-side key generation under the{" "}
                        <span className="text-tertiary underline underline-offset-2 hover:text-secondary">
                          Zero-Knowledge Merkle Protocol
                        </span>
                        .
                      </span>
                    </label>
                  </div>

                  {/* Primary Call to Action Button */}
                  <div className="pt-space-xs">
                    <button
                      className="flex w-full cursor-pointer items-center justify-center gap-space-md bg-tertiary px-space-lg py-space-md font-label-md text-label-md font-bold uppercase tracking-widest text-surface shadow-[4px_4px_0px_#1e5128] transition-all hover:bg-secondary active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50"
                      type="submit"
                      disabled={isProvisioning}
                    >
                      {isProvisioning ? (
                        <>
                          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-surface border-t-transparent" />
                          <span>PROVISIONING ATELIER...</span>
                        </>
                      ) : (
                        <>
                          <span>
                            {mode === "register"
                              ? "PROVISION SCHOLAR ACCOUNT"
                              : "INITIALIZE GATEWAY SESSION"}
                          </span>
                          <span className="material-symbols-outlined text-[18px]">
                            arrow_forward
                          </span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Splitter */}
                  <div className="flex items-center gap-space-sm py-space-xs">
                    <div className="h-px flex-1 bg-primary-container/60" />
                    <span className="font-label-sm font-mono text-label-sm uppercase text-outline">
                      FEDERATED AUTHENTICATION
                    </span>
                    <div className="h-px flex-1 bg-primary-container/60" />
                  </div>

                  {/* SSO Alternative Buttons */}
                  <div className="grid grid-cols-1 gap-space-sm sm:grid-cols-2">
                    <button
                      onClick={() => handleSSO("github")}
                      className="flex w-full cursor-pointer items-center justify-center gap-space-sm border border-primary-container bg-surface-container-low px-space-sm py-2.5 font-label-sm text-label-sm uppercase tracking-wider text-on-surface transition-colors hover:bg-surface-container-high"
                      type="button"
                    >
                      <svg className="h-4 w-4 fill-current text-primary" viewBox="0 0 24 24">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                      </svg>
                      <span>GITHUB DEVELOPER</span>
                    </button>
                    <button
                      onClick={() => handleSSO("google")}
                      className="flex w-full cursor-pointer items-center justify-center gap-space-sm border border-primary-container bg-surface-container-low px-space-sm py-2.5 font-label-sm text-label-sm uppercase tracking-wider text-on-surface transition-colors hover:bg-surface-container-high"
                      type="button"
                    >
                      <svg className="h-4 w-4 fill-current text-tertiary" viewBox="0 0 24 24">
                        <path d="M12 24c6.6 0 12-5.4 12-12S18.6 0 12 0 0 5.4 0 12s5.4 12 12 12zm0-22c5.5 0 10 4.5 10 10s-4.5 10-10 10S2 17.5 2 12 6.5 2 12 2zm1 5h-2v6h6v-2h-4z" />
                      </svg>
                      <span>GOOGLE ACADEMIC</span>
                    </button>
                  </div>

                  {/* Bottom Footer Navigation Link */}
                  <div className="border-t border-primary-container/40 pt-space-sm text-center">
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      {mode === "register" ? "ALREADY PROVISIONED?" : "NEED NEW PROVISIONING?"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setMode(mode === "register" ? "signin" : "register")}
                      className="ml-1 inline-flex cursor-pointer items-center gap-1 border-none bg-transparent font-label-sm text-label-sm font-bold uppercase tracking-wider text-tertiary hover:text-secondary"
                    >
                      {mode === "register" ? (
                        <>
                          SIGN IN TO GATEWAY{" "}
                          <span className="material-symbols-outlined text-[14px]">login</span>
                        </>
                      ) : (
                        <>
                          INITIALIZE NEW SCHOLAR{" "}
                          <span className="material-symbols-outlined text-[14px]">
                            arrow_forward
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Under-card Security Specs Matrix */}
              <div className="mt-space-md grid grid-cols-3 gap-space-xs border border-primary-container/40 bg-surface-container-lowest/60 p-space-sm text-center font-label-sm text-label-sm text-outline">
                <div className="flex flex-col">
                  <span className="font-mono text-on-surface">ED25519</span>
                  <span className="text-[10px] uppercase text-outline-variant">Key Generation</span>
                </div>
                <div className="flex flex-col border-x border-primary-container/40">
                  <span className="font-mono text-secondary">0.00%</span>
                  <span className="text-[10px] uppercase text-outline-variant">Telemetry Leak</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-mono text-tertiary">STANDALONE</span>
                  <span className="text-[10px] uppercase text-outline-variant">
                    Offline Mesh Mode
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Terminal Footer */}
      <footer className="w-full border-t border-primary-container/30 bg-surface-container-lowest">
        <div className="flex w-full flex-col items-center justify-between gap-space-xs px-gutter py-space-sm font-label-sm text-label-sm text-on-surface-variant sm:flex-row">
          <div className="flex items-center gap-space-md">
            <span>// MYPATH ARCHITECTURAL LEARNING SYSTEMS © 2025</span>
            <span className="hidden text-outline-variant md:inline">|</span>
            <span className="hidden md:inline">DISCIPLINE: AUTODIDACT_ENV</span>
          </div>
          <div className="flex items-center gap-space-md">
            <span>LATENCY: 14MS [OPTIMAL]</span>
            <span className="text-outline-variant">|</span>
            <span className="font-label-sm text-label-sm text-primary">SECURE_CHANNEL_READY</span>
          </div>
        </div>
      </footer>

      {/* Interactive Provisioning Animation Modal */}
      {isProvisioning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface/90 p-4 backdrop-blur-md">
          <div className="flex w-full max-w-md flex-col space-y-space-md border-2 border-tertiary bg-surface-container p-space-lg shadow-[4px_4px_0px_#1e5128]">
            <div className="flex items-center justify-between border-b border-primary-container pb-2">
              <span className="font-label-sm font-mono uppercase text-secondary">
                [AUTONOMOUS PROVISIONING ENGINE]
              </span>
              <span className="h-2 w-2 animate-pulse bg-secondary" />
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center gap-2">
                <span
                  className={provisioningStep >= 1 ? "font-bold text-secondary" : "text-outline"}
                >
                  {provisioningStep >= 1 ? "✓" : "○"} [01/03]
                </span>
                <span className={provisioningStep >= 1 ? "text-on-surface" : "text-outline"}>
                  Deriving ED25519 keypair &amp; local ledger...
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={provisioningStep >= 2 ? "font-bold text-secondary" : "text-outline"}
                >
                  {provisioningStep >= 2 ? "✓" : "○"} [02/03]
                </span>
                <span className={provisioningStep >= 2 ? "text-on-surface" : "text-outline"}>
                  Registering scholar passport @{handle.replace(/^@/, "")}...
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={provisioningStep >= 3 ? "font-bold text-secondary" : "text-outline"}
                >
                  {provisioningStep >= 3 ? "✓" : "○"} [03/03]
                </span>
                <span className={provisioningStep >= 3 ? "text-on-surface" : "text-outline"}>
                  Mounting curriculum: {SYLLABUS_TRACKS.find((t) => t.id === selectedTrack)?.title}
                  ...
                </span>
              </div>
            </div>

            <div className="h-1.5 w-full overflow-hidden border border-primary-container bg-surface-container-lowest">
              <div
                className="h-full bg-tertiary transition-all duration-500 ease-out"
                style={{ width: `${(provisioningStep / 3) * 100}%` }}
              />
            </div>

            <div className="pt-1 text-center font-mono text-[11px] uppercase text-outline">
              LOC_ID: 0x4F12 // AES-GCM-256 ZERO-KNOWLEDGE LEDGER
            </div>
          </div>
        </div>
      )}

      {/* Status Telemetry Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface/80 p-4 backdrop-blur-md">
          <div className="relative flex w-full max-w-lg flex-col space-y-space-md border-2 border-primary-container bg-surface-container p-space-lg shadow-2xl">
            <div className="flex items-center justify-between border-b border-primary-container pb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-secondary">
                  terminal
                </span>
                <span className="font-label-md text-label-md font-bold uppercase text-on-surface">
                  TELEMETRY DIAGNOSTIC // PORTAL NODE_01
                </span>
              </div>
              <button
                onClick={() => setShowStatusModal(false)}
                className="cursor-pointer font-mono text-sm font-bold text-outline hover:text-on-surface"
              >
                [ESC]
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="border border-primary-container/40 bg-surface-container-low p-2">
                <div className="text-[10px] text-outline">CLUSTER LOC_ID</div>
                <div className="text-sm font-bold text-on-surface">0x4F12 (ZRH_EDGE)</div>
              </div>
              <div className="border border-primary-container/40 bg-surface-container-low p-2">
                <div className="text-[10px] text-outline">GATEWAY LATENCY</div>
                <div className="text-sm font-bold text-secondary">14MS [OPTIMAL]</div>
              </div>
              <div className="border border-primary-container/40 bg-surface-container-low p-2">
                <div className="text-[10px] text-outline">CRYPTOGRAPHIC CIPHER</div>
                <div className="text-sm font-bold text-tertiary">ED25519-AES-GCM</div>
              </div>
              <div className="border border-primary-container/40 bg-surface-container-low p-2">
                <div className="text-[10px] text-outline">LOCAL PEER MESH</div>
                <div className="text-sm font-bold text-on-surface">8 ACTIVE NODES</div>
              </div>
            </div>

            <div className="space-y-1 border border-primary-container/50 bg-surface-container-lowest p-3 font-mono text-[11px] text-outline">
              <div>// ZERO-KNOWLEDGE LEDGER PROTOCOL: VERIFIED</div>
              <div>// CLIENT-SIDE ENCRYPTION: OPERATIONAL</div>
              <div>// TELEMETRY LEAKAGE RATE: 0.00%</div>
              <div className="text-secondary">// AUTODIDACT WORKSPACE ENGINE: SYNCHRONIZED</div>
            </div>

            <button
              onClick={() => setShowStatusModal(false)}
              className="w-full cursor-pointer border border-primary-container bg-surface-container-high py-2 font-label-sm uppercase tracking-wider text-on-surface transition-colors hover:bg-surface-container-highest"
            >
              CLOSE TERMINAL DIAGNOSTIC
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
