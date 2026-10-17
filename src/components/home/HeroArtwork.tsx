"use client";

import { cn } from "cn";
import Image from "next/image";
import { useEffect, useState } from "react";

import figure from "../../../public/images/hero/figure.png";
import light from "../../../public/images/hero/light.png";
import scene from "../../../public/images/hero/scene.png";

import geometry from "./hero-geometry.json";

type Quad = number[][];

const OPEN_BEGIN = "0.32s";
const OPEN_DURATION = "1.35s";
const OPEN_EASING = "0.18 0.76 0.19 1";

const SIZES = "(min-width: 1280px) 715px, (min-width: 1024px) 56vw, (min-width: 768px) 460px, 84vw";

/** Survives client-side navigation, so returning to the homepage doesn't replay the entrance. */
let entrancePlayed = false;

const toPoints = (quad: Quad) => quad.map(([x, y]) => `${x},${y}`).join(" ");

function SwingingShape({ closed, open, fill }: { closed: Quad; open: Quad; fill: string }) {
  return (
    <polygon points={toPoints(closed)} fill={fill}>
      <animate
        attributeName="points"
        from={toPoints(closed)}
        to={toPoints(open)}
        begin={OPEN_BEGIN}
        dur={OPEN_DURATION}
        calcMode="spline"
        keyTimes="0;1"
        keySplines={OPEN_EASING}
        fill="freeze"
      />
    </polygon>
  );
}

/**
 * The cover art's window scene, layered so the door can open once on load (spec §4).
 * Purely decorative: the hero's meaning is carried by the copy beside it.
 */
export function HeroArtwork({ className }: { className?: string }) {
  const [animate] = useState(() => !entrancePlayed);

  useEffect(() => {
    entrancePlayed = true;
  }, []);

  const { door, lock } = geometry;

  return (
    <div aria-hidden="true" className={cn("relative aspect-[2830/2840]", className)}>
      <Image
        src={scene}
        alt=""
        fill
        sizes={SIZES}
        loading="eager"
        fetchPriority="high"
        className="object-contain"
      />
      <Image
        src={light}
        alt=""
        fill
        sizes={SIZES}
        loading="eager"
        className={cn("object-contain", animate && "hero-light")}
      />
      <svg viewBox={geometry.viewBox.join(" ")} className="absolute inset-0 size-full">
        {animate && (
          <g className="hero-animated">
            <SwingingShape closed={door.closed} open={door.open} fill={door.fill} />
            <SwingingShape closed={lock.closed} open={lock.open} fill="#ffffff" />
          </g>
        )}
        <g className={animate ? "hero-still" : undefined}>
          <polygon points={toPoints(door.open)} fill={door.fill} />
          <polygon points={toPoints(lock.open)} fill="#ffffff" />
        </g>
      </svg>
      <Image src={figure} alt="" fill sizes={SIZES} loading="eager" className="object-contain" />
    </div>
  );
}
