"use client";

import { Html } from "@react-three/drei";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export type AvatarGender = "male" | "female" | "other";

type OfficeAvatarProps = {
  gender?: AvatarGender | string | null;
  name?: string;
  /** World position of the desk origin (avatar sits on that desk's chair). */
  deskPosition?: [number, number, number];
  deskRotation?: [number, number, number];
};

function resolveGender(gender?: string | null, name?: string): "male" | "female" {
  const g = (gender || "").toLowerCase().trim();
  if (g === "male" || g === "m") return "male";
  if (g === "female" || g === "f") return "female";

  // Light name heuristic when profile gender is missing
  const n = (name || "").toLowerCase().trim().split(/\s+/)[0] || "";
  const femaleHints = [
    "aisha", "anita", "ananya", "asha", "divya", "fatima", "isha", "kavya",
    "lakshmi", "meera", "neha", "nidhi", "pooja", "priya", "radha", "riya",
    "sanya", "sara", "sarah", "shreya", "sonia", "sneha", "swati", "tanya",
  ];
  const maleHints = [
    "aaron", "aditya", "amit", "arjun", "dev", "john", "karan", "krish",
    "mohit", "nikhil", "rahul", "raj", "rohan", "sahil", "sam", "sohan",
    "vikram", "vivek",
  ];
  if (femaleHints.includes(n)) return "female";
  if (maleHints.includes(n)) return "male";
  // Default presentation when unknown
  return "male";
}

/**
 * Low-poly seated intern avatar — male / female styling, sitting at the desk chair.
 */
export function OfficeAvatar({
  gender,
  name = "You",
  deskPosition = [-0.8, 0, -2.2],
  deskRotation = [0, 0, 0],
}: OfficeAvatarProps) {
  const breath = useRef<THREE.Group>(null);
  const isFemale = resolveGender(gender, name) === "female";

  const skin = isFemale ? "#e8b89a" : "#c9956c";
  const hair = isFemale ? "#2c1810" : "#1a1a1a";
  const top = isFemale ? "#b45309" : "#0f766e";
  const pants = isFemale ? "#1e293b" : "#334155";
  const shoulderW = isFemale ? 0.34 : 0.4;
  const torsoH = isFemale ? 0.38 : 0.42;
  const headR = isFemale ? 0.11 : 0.12;

  useFrame(({ clock }) => {
    if (!breath.current) return;
    const t = Math.sin(clock.elapsedTime * 1.4) * 0.008;
    breath.current.position.y = t;
  });

  // Chair is at local [0, 0.45, 0.55] on the desk group — seat the avatar there, facing the monitor (-Z).
  return (
    <group position={deskPosition} rotation={deskRotation}>
      <group position={[0, 0.48, 0.52]} ref={breath}>
        {/* Legs bent (sitting) */}
        <mesh position={[-0.1, -0.08, 0.12]} rotation={[1.15, 0, 0.05]} castShadow>
          <capsuleGeometry args={[0.055, 0.22, 4, 8]} />
          <meshStandardMaterial color={pants} roughness={0.75} />
        </mesh>
        <mesh position={[0.1, -0.08, 0.12]} rotation={[1.15, 0, -0.05]} castShadow>
          <capsuleGeometry args={[0.055, 0.22, 4, 8]} />
          <meshStandardMaterial color={pants} roughness={0.75} />
        </mesh>
        {/* Lower legs / feet toward floor */}
        <mesh position={[-0.1, -0.22, 0.28]} rotation={[0.2, 0, 0]} castShadow>
          <capsuleGeometry args={[0.045, 0.16, 4, 8]} />
          <meshStandardMaterial color={pants} roughness={0.75} />
        </mesh>
        <mesh position={[0.1, -0.22, 0.28]} rotation={[0.2, 0, 0]} castShadow>
          <capsuleGeometry args={[0.045, 0.16, 4, 8]} />
          <meshStandardMaterial color={pants} roughness={0.75} />
        </mesh>
        <mesh position={[-0.1, -0.32, 0.38]} castShadow>
          <boxGeometry args={[0.1, 0.04, 0.14]} />
          <meshStandardMaterial color="#1c1917" />
        </mesh>
        <mesh position={[0.1, -0.32, 0.38]} castShadow>
          <boxGeometry args={[0.1, 0.04, 0.14]} />
          <meshStandardMaterial color="#1c1917" />
        </mesh>

        {/* Torso */}
        <mesh position={[0, 0.22, 0]} castShadow>
          <boxGeometry args={[shoulderW, torsoH, 0.2]} />
          <meshStandardMaterial color={top} roughness={0.65} />
        </mesh>

        {/* Arms resting toward desk */}
        <mesh position={[-shoulderW * 0.7, 0.18, -0.12]} rotation={[1.05, 0, 0.25]} castShadow>
          <capsuleGeometry args={[0.04, 0.22, 4, 8]} />
          <meshStandardMaterial color={top} roughness={0.65} />
        </mesh>
        <mesh position={[shoulderW * 0.7, 0.18, -0.12]} rotation={[1.05, 0, -0.25]} castShadow>
          <capsuleGeometry args={[0.04, 0.22, 4, 8]} />
          <meshStandardMaterial color={top} roughness={0.65} />
        </mesh>
        {/* Hands near keyboard */}
        <mesh position={[-0.12, 0.28, -0.28]} castShadow>
          <sphereGeometry args={[0.035, 10, 10]} />
          <meshStandardMaterial color={skin} />
        </mesh>
        <mesh position={[0.12, 0.28, -0.28]} castShadow>
          <sphereGeometry args={[0.035, 10, 10]} />
          <meshStandardMaterial color={skin} />
        </mesh>

        {/* Neck + head */}
        <mesh position={[0, 0.42, 0.02]} castShadow>
          <cylinderGeometry args={[0.04, 0.05, 0.08, 12]} />
          <meshStandardMaterial color={skin} />
        </mesh>
        <mesh position={[0, 0.55, 0.02]} castShadow>
          <sphereGeometry args={[headR, 16, 16]} />
          <meshStandardMaterial color={skin} roughness={0.7} />
        </mesh>

        {/* Hair */}
        {isFemale ? (
          <>
            <mesh position={[0, 0.6, 0]} castShadow>
              <sphereGeometry args={[headR * 1.05, 16, 16]} />
              <meshStandardMaterial color={hair} roughness={0.9} />
            </mesh>
            {/* Longer hair down back / sides */}
            <mesh position={[0, 0.42, 0.08]} castShadow>
              <boxGeometry args={[headR * 1.7, 0.28, 0.08]} />
              <meshStandardMaterial color={hair} roughness={0.9} />
            </mesh>
            <mesh position={[-0.1, 0.48, 0.02]} castShadow>
              <capsuleGeometry args={[0.04, 0.18, 4, 8]} />
              <meshStandardMaterial color={hair} roughness={0.9} />
            </mesh>
            <mesh position={[0.1, 0.48, 0.02]} castShadow>
              <capsuleGeometry args={[0.04, 0.18, 4, 8]} />
              <meshStandardMaterial color={hair} roughness={0.9} />
            </mesh>
          </>
        ) : (
          <mesh position={[0, 0.62, 0]} castShadow>
            <sphereGeometry args={[headR * 0.98, 16, 16]} />
            <meshStandardMaterial color={hair} roughness={0.85} />
          </mesh>
        )}

        {/* Soft face hints */}
        <mesh position={[-0.035, 0.56, headR * 0.85]}>
          <sphereGeometry args={[0.012, 8, 8]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        <mesh position={[0.035, 0.56, headR * 0.85]}>
          <sphereGeometry args={[0.012, 8, 8]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>

        <Html position={[0, 0.82, 0]} center distanceFactor={8} style={{ pointerEvents: "none" }}>
          <span className="whitespace-nowrap rounded-full bg-teal-800/90 px-2.5 py-0.5 text-[10px] font-semibold text-white shadow">
            {name.split(" ")[0] || "You"} · you
          </span>
        </Html>
      </group>
    </group>
  );
}
