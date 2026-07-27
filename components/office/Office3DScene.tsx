"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { OfficeAvatar } from "./OfficeAvatar";

export type OfficeHotspotId = "desk" | "meeting" | "standup" | "window";

type Office3DSceneProps = {
  company?: string;
  accent?: string;
  interactive?: boolean;
  onHotspot?: (id: OfficeHotspotId) => void;
  activeHotspot?: OfficeHotspotId | null;
  studentName?: string;
  studentGender?: string | null;
};

function Desk({
  position,
  rotation = [0, 0, 0],
  lit = false,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  lit?: boolean;
}) {
  return (
    <group position={position} rotation={rotation}>
      {/* Desktop */}
      <mesh position={[0, 0.72, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.06, 0.8]} />
        <meshStandardMaterial color="#d6c3a8" roughness={0.55} metalness={0.05} />
      </mesh>
      {/* Legs */}
      {[
        [-0.7, 0.36, -0.3],
        [0.7, 0.36, -0.3],
        [-0.7, 0.36, 0.3],
        [0.7, 0.36, 0.3],
      ].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]} castShadow>
          <boxGeometry args={[0.06, 0.72, 0.06]} />
          <meshStandardMaterial color="#4a5560" roughness={0.4} metalness={0.3} />
        </mesh>
      ))}
      {/* Monitor */}
      <mesh position={[0, 1.05, -0.18]} castShadow>
        <boxGeometry args={[0.72, 0.46, 0.04]} />
        <meshStandardMaterial color="#1c2430" roughness={0.35} metalness={0.4} />
      </mesh>
      <mesh position={[0, 1.05, -0.155]}>
        <planeGeometry args={[0.64, 0.38]} />
        <meshStandardMaterial
          color={lit ? "#7dd3fc" : "#0ea5e9"}
          emissive={lit ? "#38bdf8" : "#0284c7"}
          emissiveIntensity={lit ? 0.85 : 0.35}
        />
      </mesh>
      <mesh position={[0, 0.84, -0.18]}>
        <boxGeometry args={[0.12, 0.18, 0.08]} />
        <meshStandardMaterial color="#2a3441" />
      </mesh>
      {/* Keyboard + mouse */}
      <mesh position={[0, 0.76, 0.12]} castShadow>
        <boxGeometry args={[0.46, 0.02, 0.16]} />
        <meshStandardMaterial color="#e8eef4" roughness={0.7} />
      </mesh>
      <mesh position={[0.34, 0.76, 0.18]}>
        <boxGeometry args={[0.06, 0.02, 0.1]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
      {/* Chair */}
      <mesh position={[0, 0.45, 0.55]} castShadow>
        <boxGeometry args={[0.42, 0.08, 0.42]} />
        <meshStandardMaterial color="#3d4a57" roughness={0.65} />
      </mesh>
      <mesh position={[0, 0.72, 0.72]} castShadow>
        <boxGeometry args={[0.42, 0.48, 0.06]} />
        <meshStandardMaterial color="#3d4a57" roughness={0.65} />
      </mesh>
    </group>
  );
}

function Plant({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.18, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.14, 0.28, 16]} />
        <meshStandardMaterial color="#8b6b4a" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.48, 0]} castShadow>
        <sphereGeometry args={[0.28, 16, 16]} />
        <meshStandardMaterial color="#3f7a55" roughness={0.85} />
      </mesh>
    </group>
  );
}

function HotspotMarker({
  position,
  label,
  active,
  onClick,
}: {
  position: [number, number, number];
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.position.y = position[1] + Math.sin(clock.elapsedTime * 2.2) * 0.05;
  });
  return (
    <group position={position}>
      <mesh
        ref={ref}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
        onPointerOver={() => {
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
        }}
      >
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial
          color={active ? "#0d9488" : "#14b8a6"}
          emissive={active ? "#0f766e" : "#0d9488"}
          emissiveIntensity={active ? 1.1 : 0.55}
          transparent
          opacity={0.92}
        />
      </mesh>
      <Html position={[0, 0.32, 0]} center distanceFactor={8} style={{ pointerEvents: "none" }}>
        <span className="whitespace-nowrap rounded-full bg-slate-900/80 px-2 py-0.5 text-[10px] font-medium text-white shadow">
          {label}
        </span>
      </Html>
    </group>
  );
}

/**
 * Procedural open-plan tech office — daylight, desks, meeting glass, city windows.
 */
export function Office3DScene({
  company = "Solviq",
  accent = "#0d9488",
  interactive = true,
  onHotspot,
  activeHotspot,
  studentName = "You",
  studentGender = null,
}: Office3DSceneProps) {
  const brandMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: accent, roughness: 0.35, metalness: 0.2 }),
    [accent],
  );

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[18, 14]} />
        <meshStandardMaterial color="#e8ebe6" roughness={0.9} />
      </mesh>
      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 3.2, 0]}>
        <planeGeometry args={[18, 14]} />
        <meshStandardMaterial color="#f4f6f5" roughness={1} />
      </mesh>

      {/* Walls */}
      <mesh position={[0, 1.6, -6.8]} receiveShadow>
        <boxGeometry args={[18, 3.2, 0.2]} />
        <meshStandardMaterial color="#f7f5f1" roughness={0.95} />
      </mesh>
      <mesh position={[-8.9, 1.6, 0]} receiveShadow>
        <boxGeometry args={[0.2, 3.2, 14]} />
        <meshStandardMaterial color="#f1efe9" roughness={0.95} />
      </mesh>
      <mesh position={[8.9, 1.6, 0]} receiveShadow>
        <boxGeometry args={[0.2, 3.2, 14]} />
        <meshStandardMaterial color="#f1efe9" roughness={0.95} />
      </mesh>

      {/* Window panes + exterior sky boxes */}
      {[-4.5, -1.5, 1.5, 4.5].map((x) => (
        <group key={x}>
          <mesh position={[x, 1.7, -6.68]}>
            <planeGeometry args={[2.2, 1.8]} />
            <meshStandardMaterial
              color="#87b8d8"
              emissive="#6ea8c9"
              emissiveIntensity={0.25}
              transparent
              opacity={0.55}
              roughness={0.1}
              metalness={0.1}
            />
          </mesh>
          <mesh position={[x, 1.7, -7.2]}>
            <planeGeometry args={[2.4, 2]} />
            <meshBasicMaterial color="#b9d4e8" />
          </mesh>
        </group>
      ))}

      {/* Brand wall plaque */}
      <mesh position={[-6.2, 2.2, -6.65]} material={brandMat}>
        <boxGeometry args={[2.2, 0.45, 0.05]} />
      </mesh>
      <mesh position={[-6.2, 2.2, -6.61]}>
        <planeGeometry args={[2.0, 0.32]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Meeting room glass */}
      <mesh position={[5.2, 1.4, 2.2]}>
        <boxGeometry args={[3.6, 2.6, 0.06]} />
        <meshStandardMaterial color="#c5d9e8" transparent opacity={0.28} roughness={0.05} metalness={0.2} />
      </mesh>
      <mesh position={[5.2, 1.4, 4.4]}>
        <boxGeometry args={[3.6, 2.6, 0.06]} />
        <meshStandardMaterial color="#c5d9e8" transparent opacity={0.28} roughness={0.05} metalness={0.2} />
      </mesh>
      <mesh position={[3.4, 1.4, 3.3]}>
        <boxGeometry args={[0.06, 2.6, 2.2]} />
        <meshStandardMaterial color="#c5d9e8" transparent opacity={0.28} roughness={0.05} metalness={0.2} />
      </mesh>
      {/* Meeting table */}
      <mesh position={[5.2, 0.78, 3.3]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.08, 1.1]} />
        <meshStandardMaterial color="#b08968" roughness={0.45} />
      </mesh>
      {[
        [4.4, 3.0],
        [5.2, 2.6],
        [6.0, 3.0],
        [4.4, 3.6],
        [6.0, 3.6],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.45, z]} castShadow>
          <cylinderGeometry args={[0.16, 0.16, 0.08, 16]} />
          <meshStandardMaterial color="#4b5563" />
        </mesh>
      ))}

      {/* Whiteboard */}
      <mesh position={[-7.5, 1.6, -2]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[2.4, 1.4, 0.05]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.7} />
      </mesh>
      <mesh position={[-7.47, 1.6, -2]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[2.1, 1.1]} />
        <meshBasicMaterial color="#e2e8f0" />
      </mesh>

      {/* Desks — your seat is the lit center desk */}
      <Desk position={[-3.2, 0, -2.2]} lit={activeHotspot === "desk"} />
      <Desk position={[-0.8, 0, -2.2]} lit />
      <Desk position={[1.6, 0, -2.2]} />
      <Desk position={[-3.2, 0, 0.6]} rotation={[0, Math.PI, 0]} />
      <Desk position={[-0.8, 0, 0.6]} rotation={[0, Math.PI, 0]} />

      <OfficeAvatar
        name={studentName}
        gender={studentGender}
        deskPosition={[-0.8, 0, -2.2]}
      />

      <Plant position={[-7.8, 0, -5.8]} />
      <Plant position={[7.6, 0, -5.6]} />
      <Plant position={[7.4, 0, 5.6]} />

      {/* Soft area rug under open desks */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-1, 0.01, -0.8]} receiveShadow>
        <planeGeometry args={[7.2, 4.2]} />
        <meshStandardMaterial color="#d7e0d8" roughness={1} />
      </mesh>

      {/* Invisible company label anchor for accessibility text in parent UI */}
      <mesh visible={false} position={[0, 1.5, 0]}>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshBasicMaterial />
      </mesh>
      {/* silence unused company in tree while keeping prop for future texture */}
      <group userData={{ company }} />

      {interactive && (
        <>
          <HotspotMarker
            position={[-0.8, 1.55, -1.7]}
            label="Your desk"
            active={activeHotspot === "desk"}
            onClick={() => onHotspot?.("desk")}
          />
          <HotspotMarker
            position={[5.2, 1.7, 3.3]}
            label="Meeting"
            active={activeHotspot === "meeting"}
            onClick={() => onHotspot?.("meeting")}
          />
          <HotspotMarker
            position={[-7.2, 1.8, -2]}
            label="Standup board"
            active={activeHotspot === "standup"}
            onClick={() => onHotspot?.("standup")}
          />
          <HotspotMarker
            position={[1.5, 1.9, -6.2]}
            label="City view"
            active={activeHotspot === "window"}
            onClick={() => onHotspot?.("window")}
          />
        </>
      )}
    </group>
  );
}
