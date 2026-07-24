import React, { useEffect, useRef, useState } from 'react';
import { ThemeMode } from '../types';

interface ShaderBackgroundProps {
  theme: ThemeMode;
}

export type MoonPhase = 'crescent' | 'half' | 'full';

export const ShaderBackground: React.FC<ShaderBackgroundProps> = ({ theme }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [moonPhase, setMoonPhase] = useState<MoonPhase>('full');

  // Automatic smooth moon phase cycling for Obsidian Night theme
  useEffect(() => {
    if (theme !== 'night') return;
    const interval = setInterval(() => {
      setMoonPhase((prev) => {
        if (prev === 'full') return 'half';
        if (prev === 'half') return 'crescent';
        return 'full';
      });
    }, 16000); // Realistic gentle cycle pause every 16 seconds

    return () => clearInterval(interval);
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function syncSize() {
      if (!canvas) return;
      const w = canvas.clientWidth || window.innerWidth || 1280;
      const h = canvas.clientHeight || window.innerHeight || 720;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(syncSize);
      resizeObserver.observe(canvas);
    }
    syncSize();

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return;

    const vs = `
      attribute vec2 a_position;
      varying vec2 v_texCoord;
      void main() {
        v_texCoord = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    // Fragment Shader depending on theme
    const getFragmentShaderSource = (mode: ThemeMode) => {
      if (mode === 'night') {
        return `
          precision highp float;
          varying vec2 v_texCoord;
          uniform float u_time;
          uniform vec2 u_resolution;

          float hash(vec2 p) {
            p = fract(p * vec2(123.34, 456.21));
            p += dot(p, p + 45.32);
            return fract(p.x * p.y);
          }

          float noise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            f = f * f * (3.0 - 2.0 * f);
            float a = hash(i);
            float b = hash(i + vec2(1.0, 0.0));
            float c = hash(i + vec2(0.0, 1.0));
            float d = hash(i + vec2(1.0, 1.0));
            return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
          }

          float fbm(vec2 p) {
            float v = 0.0;
            float a = 0.5;
            mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
            for (int i = 0; i < 5; i++) {
              v += a * noise(p);
              p = rot * p * 2.02;
              a *= 0.5;
            }
            return v;
          }

          void main() {
            vec2 uv = v_texCoord;
            vec2 aspectUV = (uv - 0.5) * vec2(u_resolution.x / max(u_resolution.y, 1.0), 1.0);

            // Deep Obsidian Space Base (Midnight Pitch Black & Deep Blue)
            vec3 spaceBg = mix(vec3(0.003, 0.005, 0.018), vec3(0.015, 0.025, 0.07), uv.y);

            // Diagonal Galaxy Stream Alignment (~41 degree tilt)
            float t = u_time * 0.012;
            vec2 galaxyUV = aspectUV;
            float angle = -0.72;
            mat2 galRot = mat2(cos(angle), sin(angle), -sin(angle), cos(angle));
            galaxyUV = galRot * (galaxyUV - vec2(0.0, -0.1));

            // Milky Way Central Stream Falloff
            float distToStream = abs(galaxyUV.y + sin(galaxyUV.x * 1.2 + t) * 0.08);
            float streamMask = exp(-distToStream * 4.5);

            // Cosmic Nebula Cloud Turbulence & Dark Dust Rifts
            float n1 = fbm(galaxyUV * 3.5 + vec2(t * 0.25, -t * 0.15));
            float n2 = fbm(galaxyUV * 7.0 - vec2(t * 0.12, t * 0.20));
            float darkDust = fbm(galaxyUV * 5.0 + vec2(10.0));

            float coreBrightness = streamMask * (0.4 + 0.65 * n1);
            coreBrightness = max(0.0, coreBrightness - darkDust * 0.4 * streamMask);

            // Elegant, Soft Cosmic Palette (Subtle champagne gold, deep copper, violet & dark indigo)
            vec3 colGold = vec3(0.82, 0.58, 0.28);    // Soft Champagne Gold
            vec3 colBronze = vec3(0.60, 0.35, 0.16);  // Warm Subtle Copper
            vec3 colViolet = vec3(0.42, 0.18, 0.52);  // Deep Cosmic Violet
            vec3 colPurple = vec3(0.16, 0.08, 0.32);  // Outer Dark Indigo/Purple
            vec3 colBlue = vec3(0.04, 0.10, 0.26);    // Midnight Deep Blue

            float verticalGradient = clamp((galaxyUV.x + 0.6) * 0.8, 0.0, 1.0);

            // Balanced Soft Nebula Blending (No harsh glare)
            vec3 nebulaColor = mix(colBronze, colGold, n1 * 0.7);
            nebulaColor = mix(nebulaColor, colViolet, verticalGradient * 0.6);
            nebulaColor = mix(nebulaColor, colPurple, n2 * 0.5);

            // Subtle golden stardust glow along the core
            float goldenDustGlow = pow(streamMask, 1.5) * (0.3 + 0.4 * n1);
            nebulaColor += colGold * goldenDustGlow * 0.45;
            nebulaColor = mix(nebulaColor, colBlue, (1.0 - streamMask) * 0.5);

            vec3 sky = spaceBg + nebulaColor * pow(coreBrightness, 1.35) * 1.7;

            // Highly Realistic Star Field Rendering
            // Layer 1: Thousands of Ultra-Fine Crisp Pinpoint Stardust
            vec2 grid1 = floor(uv * 420.0);
            float h1 = hash(grid1);
            if (h1 > (0.925 - streamMask * 0.045)) {
              float starIntensity = pow((h1 - (0.925 - streamMask * 0.045)) / 0.075, 3.0) * 0.75;
              vec3 starTemp = mix(vec3(0.85, 0.92, 1.0), vec3(1.0, 0.88, 0.70), fract(h1 * 43.0));
              sky += starTemp * starIntensity;
            }

            // Layer 2: Medium Pinprick Stars with Crisp Sharp Cores
            vec2 grid2 = floor(uv * 160.0);
            vec2 subUV2 = fract(uv * 160.0) - 0.5;
            float h2 = hash(grid2);
            if (h2 > 0.962) {
              vec2 posOffset = (vec2(hash(grid2 + 1.0), hash(grid2 + 2.0)) - 0.5) * 0.7;
              float dist = length(subUV2 - posOffset);
              // Sharp pinpoint core + soft realistic atmospheric halo
              float sharpCore = exp(-dist * 65.0) * 1.2;
              float softHalo = 0.005 / (dist + 0.035);
              float starShape = sharpCore + softHalo;
              float twinkle = 0.75 + 0.25 * sin(u_time * (2.0 + h2 * 4.0) + h2 * 50.0);
              vec3 starColor = mix(vec3(0.88, 0.94, 1.0), vec3(1.0, 0.90, 0.75), fract(h2 * 87.0));
              sky += starColor * starShape * twinkle * 0.8;
            }

            // Layer 3: Prominent Astrophotography Stars with Realistic 4-Point Diffraction Spikes
            vec2 grid3 = floor(uv * 48.0);
            vec2 subUV3 = fract(uv * 48.0) - 0.5;
            float h3 = hash(grid3);
            if (h3 > 0.982) {
              vec2 posOffset = (vec2(hash(grid3 + 3.0), hash(grid3 + 4.0)) - 0.5) * 0.6;
              vec2 diffVec = subUV3 - posOffset;
              float dist = length(diffVec);
              
              // Sharp Pinpoint Core + Soft Corona
              float core = exp(-dist * 45.0) * 1.5;
              float halo = exp(-dist * 12.0) * 0.4;
              
              // Realistic 4-Point Camera Lens Diffraction Cross Spikes
              vec2 d = abs(diffVec);
              float crossSpikes = (exp(-d.x * 40.0) * exp(-d.y * 4.0) + exp(-d.y * 40.0) * exp(-d.x * 4.0)) * 0.35;
              
              float totalStar = core + halo + crossSpikes;
              float twinkle = 0.8 + 0.2 * sin(u_time * 3.0 + h3 * 90.0);
              vec3 starColor = mix(vec3(0.92, 0.96, 1.0), vec3(1.0, 0.88, 0.72), fract(h3 * 23.0));
              sky += starColor * totalStar * twinkle * 1.1;
            }

            // Bottom Horizon Silhouette (Trees & Ridge like in the reference photo)
            float treeHeight = 0.06 + noise(vec2(uv.x * 70.0, 0.0)) * 0.03;
            float treeSpikes = abs(sin(uv.x * 200.0)) * 0.02;
            if (uv.y < (treeHeight + treeSpikes)) {
              sky *= smoothstep(0.0, 0.012, treeHeight + treeSpikes - uv.y) * 0.1;
            }

            gl_FragColor = vec4(sky, 1.0);
          }
        `;
      } else if (mode === 'aurora') {
        return `
          precision highp float;
          varying vec2 v_texCoord;
          uniform float u_time;
          uniform vec2 u_resolution;

          void main() {
            vec2 uv = v_texCoord;

            // Deep Pure Arctic Night Sky Base (Tanpa Bintik Putih)
            vec3 sky = mix(vec3(0.01, 0.04, 0.12), vec3(0.02, 0.08, 0.22), uv.y);

            // Real Dynamic Aurora Borealis Waves & Curtains
            float t = u_time * 0.45;
            
            float wave1 = sin(uv.x * 6.0 + t) * 0.14 + sin(uv.x * 12.0 - t * 1.4) * 0.07;
            float wave2 = sin(uv.x * 8.0 - t * 0.9) * 0.15 + cos(uv.x * 15.0 + t * 1.2) * 0.06;
            
            // Vertical light ray shafts
            float ray1 = sin(uv.x * 38.0 + sin(uv.y * 12.0 + t) * 2.8) * 0.5 + 0.5;
            float ray2 = cos(uv.x * 26.0 - sin(uv.y * 9.0 - t) * 2.2) * 0.5 + 0.5;

            // Aurora height ribbon masks (upper sky curtain)
            float ribbon1 = smoothstep(0.20, 0.0, abs(uv.y - 0.62 - wave1));
            float ribbon2 = smoothstep(0.24, 0.0, abs(uv.y - 0.48 - wave2));

            // Vivid Aurora Colors (Emerald Green, Neon Cyan, Violet Purple)
            vec3 emerald = vec3(0.05, 0.98, 0.55);
            vec3 cyan = vec3(0.10, 0.88, 0.98);
            vec3 violet = vec3(0.68, 0.22, 0.95);

            vec3 aurora1 = mix(emerald, cyan, sin(uv.x * 4.0 + t) * 0.5 + 0.5) * ribbon1 * (0.55 + ray1 * 0.45);
            vec3 aurora2 = mix(cyan, violet, cos(uv.x * 3.0 - t) * 0.5 + 0.5) * ribbon2 * (0.5 + ray2 * 0.5);

            vec3 finalSky = sky + aurora1 * 1.8 + aurora2 * 1.5;

            gl_FragColor = vec4(finalSky, 1.0);
          }
        `;
      } else if (mode === 'ocean') {
        return `
          precision highp float;
          varying vec2 v_texCoord;
          uniform float u_time;

          void main() {
            vec2 uv = v_texCoord;
            
            vec3 color1 = vec3(0.03, 0.09, 0.20);
            vec3 color2 = vec3(0.06, 0.22, 0.38);
            vec3 color3 = vec3(0.15, 0.42, 0.58);

            float t = u_time * 0.1;
            vec3 sky = mix(color1, color2, uv.y + sin(uv.x * 3.0 + t) * 0.1);
            sky = mix(sky, color3, clamp(1.0 - uv.y * 1.3, 0.0, 1.0) * 0.5);

            gl_FragColor = vec4(sky, 1.0);
          }
        `;
      } else if (mode === 'lavender') {
        return `
          precision highp float;
          varying vec2 v_texCoord;
          uniform float u_time;

          void main() {
            vec2 uv = v_texCoord;

            vec3 color1 = vec3(0.12, 0.07, 0.20);
            vec3 color2 = vec3(0.28, 0.12, 0.35);
            vec3 color3 = vec3(0.55, 0.32, 0.58);

            float t = u_time * 0.08;
            vec3 sky = mix(color1, color2, uv.y + sin(uv.x * 3.0 + t) * 0.1);
            sky = mix(sky, color3, clamp(uv.y * 1.3 - 0.3, 0.0, 1.0) * 0.6);

            gl_FragColor = vec4(sky, 1.0);
          }
        `;
      } else if (mode === 'morning') {
        return `
          precision highp float;
          varying vec2 v_texCoord;
          uniform float u_time;

          void main() {
            vec2 uv = v_texCoord;

            vec3 color1 = vec3(0.96, 0.75, 0.52);
            vec3 color2 = vec3(0.72, 0.84, 0.96);
            vec3 color3 = vec3(0.99, 0.92, 0.82);

            float t = u_time * 0.06;
            vec3 sky = mix(color1, color3, uv.y + sin(uv.x * 2.0 + t) * 0.1);
            sky = mix(sky, color2, clamp(uv.y * 1.2 - 0.1, 0.0, 1.0));

            gl_FragColor = vec4(sky, 1.0);
          }
        `;
      } else if (mode === 'afternoon') {
        return `
          precision highp float;
          varying vec2 v_texCoord;
          uniform float u_time;

          void main() {
            vec2 uv = v_texCoord;

            vec3 color1 = vec3(0.38, 0.60, 0.88);
            vec3 color2 = vec3(0.85, 0.92, 0.98);
            vec3 color3 = vec3(0.50, 0.72, 0.92);

            float t = u_time * 0.05;
            vec3 sky = mix(color1, color3, uv.y + sin(uv.x * 2.5 + t) * 0.08);
            sky = mix(sky, color2, 1.0 - uv.y);

            gl_FragColor = vec4(sky, 1.0);
          }
        `;
      }

      // Default: Sunset Crimson Coral Twilight Palette
      return `
        precision highp float;
        varying vec2 v_texCoord;
        uniform float u_time;

        void main() {
            vec2 uv = v_texCoord;
            
            vec3 color1 = vec3(0.92, 0.38, 0.22); // Deep Coral Orange (#EB6138)
            vec3 color2 = vec3(0.82, 0.32, 0.50); // Twilight Rose (#D15280)
            vec3 color3 = vec3(0.38, 0.22, 0.55); // Midnight Purple (#61388C)
            vec3 color4 = vec3(0.98, 0.88, 0.72); // Sunset Warm Glow

            float t = u_time * 0.08;
            
            vec3 sky = mix(color1, color2, uv.y + sin(uv.x * 2.5 + t) * 0.1);
            sky = mix(sky, color3, clamp(uv.y * 1.4 - 0.4, 0.0, 1.0));
            sky = mix(sky, color4, clamp(1.0 - uv.y - 0.2, 0.0, 1.0) * 0.55);

            gl_FragColor = vec4(sky, 1.0);
        }
      `;
    };

    function createShader(glCtx: WebGLRenderingContext, type: number, src: string) {
      const s = glCtx.createShader(type);
      if (!s) return null;
      glCtx.shaderSource(s, src);
      glCtx.compileShader(s);
      return s;
    }

    const vertShader = createShader(gl, gl.VERTEX_SHADER, vs);
    const fragShader = createShader(gl, gl.FRAGMENT_SHADER, getFragmentShaderSource(theme));
    if (!vertShader || !fragShader) return;

    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vertShader);
    gl.attachShader(prog, fragShader);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const pos = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_resolution');

    let animationFrameId: number;
    const render = (t: number) => {
      syncSize();
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (uTime) gl.uniform1f(uTime, t * 0.001);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationFrameId = requestAnimationFrame(render);
    };

    render(0);

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  return (
    <div className="fixed inset-0 z-[-2] overflow-hidden pointer-events-none">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-75 transition-opacity duration-1000"
        style={{ display: 'block', width: '100%', height: '100%' }}
      />

      {/* SUNSET CORAL THEME OVERLAY (Matahari Sunset + Awan Indah) */}
      {theme === 'sunset' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden animate-in fade-in duration-700">
          {/* Radiant Sunset Sun */}
          <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-gradient-to-t from-amber-300 via-rose-400 to-orange-500 blur-sm shadow-[0_0_120px_rgba(251,146,60,0.85)] opacity-90 animate-pulse"></div>

          {/* Soft Sunset Horizon Rays */}
          <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-orange-600/40 via-rose-500/20 to-transparent"></div>

          {/* Coral Sunset Clouds */}
          <div className="floating-cloud absolute top-[22%] left-[-10%] w-[500px] h-32 bg-rose-300/30 rounded-full blur-2xl"></div>
          <div
            className="floating-cloud absolute top-[38%] left-[20%] w-[600px] h-40 bg-amber-200/25 rounded-full blur-3xl"
            style={{ animationDuration: '42s' }}
          ></div>
        </div>
      )}

      {/* OBSIDIAN NIGHT THEME OVERLAY (Bulan Realistis Photorealistic 3D Glowing + Moon Phase Cycles) */}
      {theme === 'night' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden animate-in fade-in duration-700">
          {/* Automatic Celestial Moon */}
          <div className="absolute top-[12%] right-[8%] sm:right-[14%] z-20">
            <div className="relative flex flex-col items-center justify-center">
              {/* Soft Atmospheric Moon Glow Halo */}
              <div className="absolute -inset-8 rounded-full bg-amber-100/20 blur-3xl animate-pulse"></div>
              <div className="absolute -inset-3 rounded-full bg-amber-50/25 blur-xl"></div>

              {/* Render Animated Soft Photorealistic Moon Phase */}
              <div className="relative z-10 transition-all duration-700 ease-in-out">
                {moonPhase === 'full' && (
                  <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-full bg-gradient-to-br from-[#ffffff] via-[#f7f2ea] to-[#e0d6c8] shadow-[0_0_40px_rgba(254,243,199,0.9)] border border-amber-100/80 relative overflow-hidden transition-all duration-500">
                    {/* Soft Organic Lunar Craters */}
                    <div className="absolute top-[18%] left-[22%] w-[32%] h-[32%] rounded-full bg-[#a39485]/20 blur-[1px]"></div>
                    <div className="absolute top-[42%] right-[16%] w-[38%] h-[38%] rounded-full bg-[#968778]/18 blur-[1.5px]"></div>
                    <div className="absolute bottom-[20%] left-[28%] w-[28%] h-[28%] rounded-full bg-[#a39485]/22 blur-[1px]"></div>
                    <div className="absolute top-[32%] left-[50%] w-3 h-3 rounded-full bg-[#8c7d6e]/25 shadow-inner"></div>
                    <div className="absolute bottom-[28%] right-[32%] w-3.5 h-3.5 rounded-full bg-[#8c7d6e]/20 shadow-inner"></div>
                  </div>
                )}

                {moonPhase === 'half' && (
                  <div className="w-18 h-18 sm:w-22 sm:h-22 relative transition-all duration-500">
                    {/* Half Moon SVG - Pure Transparent Dark Side */}
                    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_35px_rgba(254,243,199,0.85)]">
                      <defs>
                        <radialGradient id="halfMoonGrad" cx="30%" cy="30%" r="70%">
                          <stop offset="0%" stopColor="#ffffff" />
                          <stop offset="60%" stopColor="#f7f2ea" />
                          <stop offset="100%" stopColor="#e0d6c8" />
                        </radialGradient>
                      </defs>
                      <path d="M 50 0 A 50 50 0 0 0 50 100 Z" fill="url(#halfMoonGrad)" />
                      <circle cx="28" cy="34" r="8" fill="#8c7d6e" opacity="0.2" />
                      <circle cx="22" cy="62" r="10" fill="#8c7d6e" opacity="0.18" />
                      <circle cx="36" cy="48" r="4" fill="#8c7d6e" opacity="0.22" />
                    </svg>
                  </div>
                )}

                {moonPhase === 'crescent' && (
                  <div className="w-18 h-18 sm:w-22 sm:h-22 relative transition-all duration-500">
                    {/* Crescent Moon SVG */}
                    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_35px_rgba(254,243,199,0.9)]">
                      <defs>
                        <radialGradient id="crescentGrad" cx="35%" cy="35%" r="65%">
                          <stop offset="0%" stopColor="#ffffff" />
                          <stop offset="60%" stopColor="#f7f2ea" />
                          <stop offset="100%" stopColor="#e0d6c8" />
                        </radialGradient>
                      </defs>
                      <path
                        d="M 50,0 C 77.6,0 100,22.4 100,50 C 100,77.6 77.6,100 50,100 C 68,80 75,50 50,0 Z"
                        fill="url(#crescentGrad)"
                      />
                      <circle cx="68" cy="40" r="4" fill="#8c7d6e" opacity="0.2" />
                      <circle cx="62" cy="64" r="5" fill="#8c7d6e" opacity="0.16" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Drifting Night Mist */}
          <div className="floating-cloud absolute top-[30%] left-[-5%] w-[550px] h-32 bg-indigo-900/20 rounded-full blur-3xl"></div>
        </div>
      )}

      {/* AURORA BOREALIS THEME OVERLAY */}
      {theme === 'aurora' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden animate-in fade-in duration-700">
          {/* Layered Waving Aurora Light Curtains */}
          <div className="absolute top-0 inset-x-0 h-3/4 bg-gradient-to-b from-emerald-400/25 via-teal-300/20 to-transparent blur-3xl animate-pulse"></div>
          
          <div
            className="floating-cloud absolute top-[5%] -left-[10%] w-[800px] h-64 bg-gradient-to-r from-emerald-400/30 via-teal-400/35 to-cyan-400/20 rounded-full blur-3xl"
            style={{ animationDuration: '28s' }}
          ></div>

          <div
            className="floating-cloud absolute top-[20%] right-[-10%] w-[750px] h-56 bg-gradient-to-r from-teal-400/25 via-purple-500/25 to-emerald-400/30 rounded-full blur-3xl"
            style={{ animationDuration: '34s', animationDelay: '-10s' }}
          ></div>
        </div>
      )}

      {/* OCEAN WAVE THEME OVERLAY */}
      {theme === 'ocean' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden animate-in fade-in duration-700">
          <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-sky-600/30 via-cyan-500/15 to-transparent blur-2xl"></div>
          <div className="floating-cloud absolute top-[25%] left-[5%] w-[500px] h-36 bg-cyan-300/20 rounded-full blur-3xl"></div>
        </div>
      )}

      {/* LAVENDER DREAMS THEME OVERLAY */}
      {theme === 'lavender' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden animate-in fade-in duration-700">
          <div className="floating-cloud absolute top-[18%] left-[12%] w-[500px] h-36 bg-purple-300/25 rounded-full blur-3xl"></div>
          <div
            className="floating-cloud absolute top-[40%] right-[10%] w-[550px] h-40 bg-fuchsia-300/20 rounded-full blur-3xl"
            style={{ animationDuration: '36s' }}
          ></div>
        </div>
      )}

      {/* GOLDEN MORNING THEME OVERLAY (Matahari Pagi + Awan Lembung + Kawanan Burung Realistis) */}
      {theme === 'morning' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden animate-in fade-in duration-700">
          {/* Golden Dawn Sun */}
          <div className="absolute top-[8%] right-[15%] w-48 h-48 rounded-full bg-amber-200/90 blur-xl shadow-[0_0_100px_rgba(251,191,36,0.8)] animate-pulse"></div>
          
          {/* Drifting Golden Morning Clouds */}
          <div className="floating-cloud absolute top-[18%] left-[-10%] w-[600px] h-36 bg-amber-100/40 rounded-full blur-2xl"></div>
          <div
            className="floating-cloud absolute top-[35%] right-[-5%] w-[500px] h-32 bg-orange-100/30 rounded-full blur-2xl"
            style={{ animationDuration: '36s', animationDelay: '-8s' }}
          ></div>

          {/* Realistic V-Formation Flock of Birds */}
          <div className="flying-bird-flock absolute top-[20%] left-0 z-10 flex items-center gap-6">
            <div className="bird-wing-flap-1 text-[#2d180c]/85">
              <svg width="32" height="20" viewBox="0 0 24 16" fill="currentColor">
                <path d="M1,8 C6,1 10,5 12,8 C14,5 18,1 23,8 C19,10 14,7 12,10 C10,7 5,10 1,8 Z" />
              </svg>
            </div>
            <div className="bird-wing-flap-2 text-[#2d180c]/75 -mt-5">
              <svg width="26" height="16" viewBox="0 0 24 16" fill="currentColor">
                <path d="M1,8 C6,1 10,5 12,8 C14,5 18,1 23,8 C19,10 14,7 12,10 C10,7 5,10 1,8 Z" />
              </svg>
            </div>
            <div className="bird-wing-flap-3 text-[#2d180c]/80 mt-4">
              <svg width="28" height="18" viewBox="0 0 24 16" fill="currentColor">
                <path d="M1,8 C6,1 10,5 12,8 C14,5 18,1 23,8 C19,10 14,7 12,10 C10,7 5,10 1,8 Z" />
              </svg>
            </div>
            <div className="bird-wing-flap-1 text-[#2d180c]/65 -mt-2">
              <svg width="22" height="14" viewBox="0 0 24 16" fill="currentColor">
                <path d="M1,8 C6,1 10,5 12,8 C14,5 18,1 23,8 C19,10 14,7 12,10 C10,7 5,10 1,8 Z" />
              </svg>
            </div>
            <div className="bird-wing-flap-2 text-[#2d180c]/60 mt-6">
              <svg width="20" height="13" viewBox="0 0 24 16" fill="currentColor">
                <path d="M1,8 C6,1 10,5 12,8 C14,5 18,1 23,8 C19,10 14,7 12,10 C10,7 5,10 1,8 Z" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* AFTERNOON SKY THEME OVERLAY (Matahari Cerah + Awan Tebal + Pesawat Jet Realistis + Kawanan Burung) */}
      {theme === 'afternoon' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden animate-in fade-in duration-700">
          {/* Bright Afternoon Sun */}
          <div className="absolute top-[6%] left-[18%] w-40 h-40 rounded-full bg-white/95 blur-md shadow-[0_0_90px_rgba(255,255,255,0.95)]"></div>
          <div className="absolute top-[8%] left-[20%] w-32 h-32 rounded-full bg-sky-100/50 blur-2xl"></div>

          {/* Cumulus Fluffy Fluffy Clouds */}
          <div className="floating-cloud absolute top-[12%] left-[-8%] w-[550px] h-36 bg-white/60 rounded-full blur-2xl"></div>
          <div
            className="floating-cloud absolute top-[28%] right-[-10%] w-[650px] h-44 bg-white/50 rounded-full blur-2xl"
            style={{ animationDuration: '42s' }}
          ></div>
          <div
            className="floating-cloud absolute top-[45%] left-[10%] w-[480px] h-32 bg-white/40 rounded-full blur-xl"
            style={{ animationDuration: '32s', animationDelay: '-12s' }}
          ></div>

          {/* Realistic High-Detail Commercial Passenger Jet Airplane */}
          <div className="flying-airplane absolute top-[24%] left-0 z-20 flex items-center">
            {/* Realistic Expanding Vapor Jet Contrail */}
            <div className="relative flex items-center">
              <div className="w-[320px] sm:w-[500px] h-[4px] bg-gradient-to-r from-transparent via-white/50 to-white/95 blur-[2px] rounded-full mr-[-8px]"></div>
              <div className="w-[180px] sm:w-[280px] h-[8px] bg-gradient-to-r from-transparent via-white/30 to-white/70 blur-[5px] rounded-full absolute right-0"></div>
            </div>

            {/* Jet Silhouette with Engine Pods and Strobe Navigation Lights */}
            <div className="relative text-[#17304f] drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)] flex items-center">
              {/* Airplane SVG Silhouette */}
              <svg width="44" height="44" viewBox="0 0 48 48" fill="currentColor">
                {/* Fuselage Main Body */}
                <path d="M 44,24 C 38,21 28,19 18,19 C 14,19 8,20 4,22 C 2,23 2,25 4,26 C 8,28 14,29 18,29 C 28,29 38,27 44,24 Z" />
                {/* Main Wings */}
                <path d="M 28,24 L 14,4 L 10,5 L 20,24 L 10,43 L 14,44 Z" />
                {/* Tail Stabilizer */}
                <path d="M 8,22 L 2,12 L 0,13 L 5,23 L 0,35 L 2,36 Z" />
                {/* Jet Engines under Wings */}
                <rect x="20" y="13" width="7" height="3" rx="1.5" fill="#0d1d33" />
                <rect x="20" y="32" width="7" height="3" rx="1.5" fill="#0d1d33" />
              </svg>

              {/* Red Left Wing Strobe Light */}
              <div className="absolute top-[4px] left-[14px] w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_10px_#f43f5e] strobe-red"></div>
              {/* Green Right Wing Strobe Light */}
              <div className="absolute bottom-[4px] left-[14px] w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399] strobe-green"></div>
            </div>
          </div>

          {/* Soaring Birds in Afternoon Sky */}
          <div
            className="flying-bird-flock absolute top-[15%] left-0 z-10 flex items-center gap-5"
            style={{ animationDuration: '38s', animationDelay: '-14s' }}
          >
            <div className="bird-wing-flap-1 text-[#0f2438]/80">
              <svg width="28" height="18" viewBox="0 0 24 16" fill="currentColor">
                <path d="M1,8 C6,1 10,5 12,8 C14,5 18,1 23,8 C19,10 14,7 12,10 C10,7 5,10 1,8 Z" />
              </svg>
            </div>
            <div className="bird-wing-flap-2 text-[#0f2438]/70 -mt-3">
              <svg width="22" height="14" viewBox="0 0 24 16" fill="currentColor">
                <path d="M1,8 C6,1 10,5 12,8 C14,5 18,1 23,8 C19,10 14,7 12,10 C10,7 5,10 1,8 Z" />
              </svg>
            </div>
            <div className="bird-wing-flap-3 text-[#0f2438]/65 mt-3">
              <svg width="20" height="13" viewBox="0 0 24 16" fill="currentColor">
                <path d="M1,8 C6,1 10,5 12,8 C14,5 18,1 23,8 C19,10 14,7 12,10 C10,7 5,10 1,8 Z" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Global Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/15 pointer-events-none"></div>
    </div>
  );
};

