import React, { useEffect, useRef } from 'react';

/**
 * High-performance WebGL Grain Gradient Canvas inspired by Dopamine Studio.
 * Renders an organic domain-warped mesh gradient in a sky-blue & crisp white palette,
 * with subtle grain texture and interactive mouse responsiveness.
 */
const GrainGradientCanvas = ({ className = '' }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { antialias: false, powerPreference: 'low-power' });
    if (!gl) return;

    // Vertex Shader
    const vsSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    // Fragment Shader with domain warping, sky blue & white colors, and organic grain
    const fsSource = `
      precision mediump float;
      uniform vec2 iResolution;
      uniform float iTime;
      uniform vec2 iMouse;

      // Pseudo-random generator for filmic grain
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / iResolution.xy;
        float ratio = iResolution.x / iResolution.y;
        
        vec2 tuv = uv - 0.5;
        tuv.x *= ratio;

        // Subtle mouse influence
        vec2 mouseUV = (iMouse / iResolution) - 0.5;
        mouseUV.x *= ratio;
        float distToMouse = length(tuv - mouseUV);
        float mouseAttract = smoothstep(0.8, 0.0, distToMouse) * 0.12;

        float t = iTime * 0.18;

        // Domain warping ripples (sky blue fluidity)
        float amp = 10.0;
        tuv.x += sin(tuv.y * 2.2 + t * 1.8 + mouseAttract) / amp;
        tuv.y += cos(tuv.x * 2.8 + t * 1.5 - mouseAttract) / (amp * 0.85);

        // Gradient blend angle
        float blend = tuv.x * 0.75 + tuv.y * 0.65;
        float flow = sin(blend * 3.1415 + t) * 0.5 + 0.5;

        // Studio Sky-Blue & White color palette:
        // Color 1: Crisp clean pure white with soft sky-ice tint
        vec3 colWhite = vec3(0.98, 0.99, 1.0);
        // Color 2: Luminous electric sky blue (#38bdf8 / #0284c7 blend)
        vec3 colSky = vec3(0.22, 0.74, 0.97);
        // Color 3: Deep royal blue accent (#2563eb / #1d4ed8)
        vec3 colRoyal = vec3(0.14, 0.39, 0.92);
        // Color 4: Soft celestial azure (#e0f2fe)
        vec3 colAzure = vec3(0.88, 0.95, 0.99);

        // Fluid multi-stop mix
        vec3 color = mix(colWhite, colAzure, smoothstep(0.1, 0.6, flow));
        color = mix(color, colSky, smoothstep(0.45, 0.95, flow) * 0.72);
        
        // Soft vignette / radial focus on center
        float radial = length(uv - vec2(0.5, 0.45));
        color = mix(color, colRoyal, smoothstep(0.7, 1.3, radial) * 0.25);

        // Ultra-fine organic studio grain (like high-end agency shaders)
        float grain = (hash(gl_FragCoord.xy + fract(iTime * 17.0)) - 0.5) * 0.055;
        color += grain;

        gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
      }
    `;

    const createShader = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertShader = createShader(gl.VERTEX_SHADER, vsSource);
    const fragShader = createShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vertShader || !fragShader) return;

    const program = gl.createProgram();
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    gl.useProgram(program);

    // Full screen quad
    const quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const positionLoc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    const resLoc = gl.getUniformLocation(program, 'iResolution');
    const timeLoc = gl.getUniformLocation(program, 'iTime');
    const mouseLoc = gl.getUniformLocation(program, 'iMouse');

    let mouse = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.5 };
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse = {
        x: e.clientX - rect.left,
        y: canvas.height - (e.clientY - rect.top),
      };
    };
    window.addEventListener('pointermove', handleMouseMove);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = canvas.parentElement ? canvas.parentElement.clientWidth : window.innerWidth;
      const height = canvas.parentElement ? canvas.parentElement.clientHeight : window.innerHeight;
      canvas.width = Math.max(width * dpr, 100);
      canvas.height = Math.max(height * dpr, 100);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    resize();
    window.addEventListener('resize', resize);

    let animId;
    const startTime = performance.now();

    const render = () => {
      const now = (performance.now() - startTime) * 0.001;
      gl.uniform2f(resLoc, canvas.width, canvas.height);
      gl.uniform1f(timeLoc, now);
      gl.uniform2f(mouseLoc, mouse.x * (canvas.width / (canvas.clientWidth || 1)), mouse.y);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('pointermove', handleMouseMove);
      window.removeEventListener('resize', resize);
      gl.deleteProgram(program);
      gl.deleteShader(vertShader);
      gl.deleteShader(fragShader);
      gl.deleteBuffer(quadBuffer);
    };
  }, []);

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="h-full w-full opacity-65 transition-opacity duration-1000"
        style={{ display: 'block' }}
      />
      {/* Soft gradient bottom fade */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white via-white/80 to-transparent" />
    </div>
  );
};

export default GrainGradientCanvas;
