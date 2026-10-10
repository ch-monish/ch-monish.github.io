'use client';

import { useEffect, useRef } from 'react';

const vertexShader = `#version 300 es
precision highp float;
out vec2 vUv;
void main() {
  vec2 position = gl_VertexID == 0 ? vec2(-1.0, -1.0)
    : (gl_VertexID == 1 ? vec2(3.0, -1.0) : vec2(-1.0, 3.0));
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

const shaders = {
  splat: `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outputColor;
uniform sampler2D source;
uniform vec2 point;
uniform vec2 value;
uniform vec3 color;
uniform float radius;
uniform float aspect;
uniform float isDye;
uniform float dyeStrength;
void main() {
  vec2 p = vUv - point;
  p.x *= aspect;
  float influence = exp(-dot(p, p) / radius);
  vec4 base = texture(source, vUv);
  outputColor = isDye > 0.5
    ? vec4(base.rgb + color * influence * dyeStrength, 1.0)
    : vec4(base.xy + value * influence, 0.0, 1.0);
}`,
  advect: `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outputColor;
uniform sampler2D source;
uniform sampler2D velocity;
uniform vec2 texelSize;
uniform float dt;
uniform float dissipation;
void main() {
  vec2 backtrace = vUv - dt * texture(velocity, vUv).xy;
  outputColor = texture(source, clamp(backtrace, texelSize * 0.5, 1.0 - texelSize * 0.5)) * dissipation;
}`,
  diffuse: `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outputColor;
uniform sampler2D source;
uniform sampler2D previous;
uniform vec2 texelSize;
uniform float alpha;
uniform float beta;
void main() {
  vec2 neighbors =
    texture(previous, vUv - vec2(texelSize.x, 0.0)).xy
    + texture(previous, vUv + vec2(texelSize.x, 0.0)).xy
    + texture(previous, vUv - vec2(0.0, texelSize.y)).xy
    + texture(previous, vUv + vec2(0.0, texelSize.y)).xy;
  outputColor = vec4((neighbors + alpha * texture(source, vUv).xy) / beta, 0.0, 1.0);
}`,
  curl: `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outputColor;
uniform sampler2D velocity;
uniform vec2 texelSize;
void main() {
  float left = texture(velocity, vUv - vec2(texelSize.x, 0.0)).y;
  float right = texture(velocity, vUv + vec2(texelSize.x, 0.0)).y;
  float bottom = texture(velocity, vUv - vec2(0.0, texelSize.y)).x;
  float top = texture(velocity, vUv + vec2(0.0, texelSize.y)).x;
  outputColor = vec4((right - left - top + bottom) * 0.5, 0.0, 0.0, 1.0);
}`,
  vorticity: `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outputColor;
uniform sampler2D velocity;
uniform sampler2D curl;
uniform vec2 texelSize;
uniform float dt;
void main() {
  float left = abs(texture(curl, vUv - vec2(texelSize.x, 0.0)).x);
  float right = abs(texture(curl, vUv + vec2(texelSize.x, 0.0)).x);
  float bottom = abs(texture(curl, vUv - vec2(0.0, texelSize.y)).x);
  float top = abs(texture(curl, vUv + vec2(0.0, texelSize.y)).x);
  float center = texture(curl, vUv).x;
  vec2 force = 0.5 * vec2(right - left, top - bottom);
  force /= length(force) + 0.0001;
  force *= vec2(1.0, -1.0) * center * 0.24 * dt;
  outputColor = vec4(texture(velocity, vUv).xy + force, 0.0, 1.0);
}`,
  divergence: `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outputColor;
uniform sampler2D velocity;
uniform vec2 texelSize;
void main() {
  float left = texture(velocity, vUv - vec2(texelSize.x, 0.0)).x;
  float right = texture(velocity, vUv + vec2(texelSize.x, 0.0)).x;
  float bottom = texture(velocity, vUv - vec2(0.0, texelSize.y)).y;
  float top = texture(velocity, vUv + vec2(0.0, texelSize.y)).y;
  outputColor = vec4((right - left + top - bottom) * 0.5, 0.0, 0.0, 1.0);
}`,
  pressure: `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outputColor;
uniform sampler2D pressure;
uniform sampler2D divergence;
uniform vec2 texelSize;
void main() {
  float left = texture(pressure, vUv - vec2(texelSize.x, 0.0)).x;
  float right = texture(pressure, vUv + vec2(texelSize.x, 0.0)).x;
  float bottom = texture(pressure, vUv - vec2(0.0, texelSize.y)).x;
  float top = texture(pressure, vUv + vec2(0.0, texelSize.y)).x;
  float div = texture(divergence, vUv).x;
  outputColor = vec4((left + right + bottom + top - div) * 0.25, 0.0, 0.0, 1.0);
}`,
  project: `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outputColor;
uniform sampler2D velocity;
uniform sampler2D pressure;
uniform vec2 texelSize;
void main() {
  float left = texture(pressure, vUv - vec2(texelSize.x, 0.0)).x;
  float right = texture(pressure, vUv + vec2(texelSize.x, 0.0)).x;
  float bottom = texture(pressure, vUv - vec2(0.0, texelSize.y)).x;
  float top = texture(pressure, vUv + vec2(0.0, texelSize.y)).x;
  vec2 flow = texture(velocity, vUv).xy - vec2(right - left, top - bottom) * 0.5;
  outputColor = vec4(flow, 0.0, 1.0);
}`,
  display: `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outputColor;
uniform sampler2D dye;
uniform vec2 texelSize;
float densityAt(vec2 uv) {
  vec3 sampleColor = texture(dye, uv).rgb;
  return max(max(sampleColor.r, sampleColor.g), sampleColor.b);
}
void main() {
  vec3 baseColor = texture(dye, vUv).rgb;
  float density = max(max(baseColor.r, baseColor.g), baseColor.b);
  vec2 gradient = vec2(
    densityAt(vUv + vec2(texelSize.x, 0.0)) - densityAt(vUv - vec2(texelSize.x, 0.0)),
    densityAt(vUv + vec2(0.0, texelSize.y)) - densityAt(vUv - vec2(0.0, texelSize.y))
  );
  float edge = length(gradient);
  vec2 normal = gradient / (edge + 0.0001);
  vec2 refractedUv = clamp(vUv - normal * 0.0025, texelSize * 0.5, 1.0 - texelSize * 0.5);
  float rim = smoothstep(0.025, 0.16, edge);
  vec3 color = mix(baseColor, texture(dye, refractedUv).rgb, 0.55);
  color += vec3(0.34, 0.48, 0.62) * rim * 0.18;
  float alpha = clamp(density * 0.46 + rim * 0.11, 0.0, 0.48);
  outputColor = vec4(color, alpha);
}`,
};

type Target = { texture: WebGLTexture; framebuffer: WebGLFramebuffer };
type PingPong = { read: Target; write: Target };

const next = (buffer: PingPong) => {
  [buffer.read, buffer.write] = [buffer.write, buffer.read];
};

export function FluidCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const gl = canvas.getContext('webgl2', {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
      powerPreference: 'low-power',
    });
    if (!gl || !gl.getExtension('EXT_color_buffer_float')) return;

    const programs = new Map<string, WebGLProgram>();
    const targets: Target[] = [];
    let velocity: PingPong;
    let dye: PingPong;
    let pressure: PingPong;
    let divergence: Target;
    let curl: Target;
    let animationFrame = 0;
    let previousTime = 0;
    let pointer: { x: number; y: number; dx: number; dy: number; down: boolean } | null = null;
    let simWidth = 1;
    let simHeight = 1;
    let canvasWidth = 1;
    let canvasHeight = 1;
    let visible = true;
    let colorIndex = 0;
    const colors = [
      [0.1, 0.72, 1.0],
      [0.38, 0.3, 1.0],
      [0.1, 0.95, 0.72],
      [1.0, 0.36, 0.58],
    ];
    const contactColors = [
      [0.2, 0.68, 0.82],
      [0.25, 0.62, 0.8],
      [0.3, 0.74, 0.72],
      [0.16, 0.56, 0.76],
    ];
    let color = colors[0];

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) throw new Error('Unable to create fluid shader.');
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const message = gl.getShaderInfoLog(shader) ?? 'Unknown shader compilation error.';
        gl.deleteShader(shader);
        throw new Error(message);
      }
      return shader;
    };

    let vertex: WebGLShader | null = null;
    try {
      vertex = compile(gl.VERTEX_SHADER, vertexShader);
      for (const [name, fragmentSource] of Object.entries(shaders)) {
        const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);
        const program = gl.createProgram();
        if (!program) {
          gl.deleteShader(fragment);
          throw new Error('Unable to create fluid render program.');
        }
        gl.attachShader(program, vertex);
        gl.attachShader(program, fragment);
        gl.linkProgram(program);
        gl.deleteShader(fragment);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
          const message = gl.getProgramInfoLog(program) ?? 'Unknown shader link error.';
          gl.deleteProgram(program);
          throw new Error(message);
        }
        programs.set(name, program);
      }
      gl.deleteShader(vertex);
      vertex = null;
    } catch (error) {
      if (vertex) gl.deleteShader(vertex);
      Array.from(programs.values()).forEach((program) => gl.deleteProgram(program));
      console.warn('Fluid cursor shaders could not initialize:', error);
      return;
    }

    const vao = gl.createVertexArray();
    if (!vao) {
      Array.from(programs.values()).forEach((program) => gl.deleteProgram(program));
      console.warn('Fluid cursor could not create a WebGL vertex array.');
      return;
    }
    gl.bindVertexArray(vao);

    const createTarget = (width: number, height: number): Target => {
      const texture = gl.createTexture();
      if (!texture) throw new Error('Unable to allocate fluid texture.');
      const framebuffer = gl.createFramebuffer();
      if (!framebuffer) {
        gl.deleteTexture(texture);
        throw new Error('Unable to allocate fluid framebuffer.');
      }
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, width, height, 0, gl.RGBA, gl.HALF_FLOAT, null);
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
        gl.deleteTexture(texture);
        gl.deleteFramebuffer(framebuffer);
        throw new Error('The browser cannot create floating-point fluid buffers.');
      }
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      const target = { texture, framebuffer };
      targets.push(target);
      return target;
    };

    const createPingPong = (width: number, height: number): PingPong => ({
      read: createTarget(width, height),
      write: createTarget(width, height),
    });

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvasWidth = Math.max(1, Math.floor(window.innerWidth * ratio));
      canvasHeight = Math.max(1, Math.floor(window.innerHeight * ratio));
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const resolution = window.innerWidth < 700 ? 200 : 360;
      const scale = resolution / Math.max(canvasWidth, canvasHeight);
      simWidth = Math.max(2, Math.floor(canvasWidth * scale));
      simHeight = Math.max(2, Math.floor(canvasHeight * scale));

      for (const target of targets) {
        gl.deleteTexture(target.texture);
        gl.deleteFramebuffer(target.framebuffer);
      }
      targets.length = 0;
      velocity = createPingPong(simWidth, simHeight);
      dye = createPingPong(simWidth, simHeight);
      pressure = createPingPong(simWidth, simHeight);
      divergence = createTarget(simWidth, simHeight);
      curl = createTarget(simWidth, simHeight);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvasWidth, canvasHeight);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    };

    const draw = (name: string, output: Target | null, inputs: Array<[string, WebGLTexture]>, values: Record<string, number | number[]>) => {
      const program = programs.get(name);
      if (!program) return;
      gl.useProgram(program);
      gl.bindFramebuffer(gl.FRAMEBUFFER, output?.framebuffer ?? null);
      gl.viewport(0, 0, output ? simWidth : canvasWidth, output ? simHeight : canvasHeight);
      inputs.forEach(([uniform, texture], index) => {
        gl.activeTexture(gl.TEXTURE0 + index);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(gl.getUniformLocation(program, uniform), index);
      });
      for (const [uniform, value] of Object.entries(values)) {
        const location = gl.getUniformLocation(program, uniform);
        if (location === null) continue;
        if (typeof value === 'number') gl.uniform1f(location, value);
        else if (value.length === 2) gl.uniform2f(location, value[0], value[1]);
        else gl.uniform3f(location, value[0], value[1], value[2]);
      }
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const addSplat = (x: number, y: number, dx: number, dy: number, strong: boolean) => {
      const point = [x, 1 - y];
      const aspect = canvasWidth / canvasHeight;
      const strength = strong ? 2.4 : 1;
      draw('splat', velocity.write, [['source', velocity.read.texture]], {
        point, value: [dx * strength * 2.6, -dy * strength * 2.6],
        color: [0, 0, 0], radius: 0.0011, aspect, isDye: 0, dyeStrength: 0,
      });
      next(velocity);
      draw('splat', dye.write, [['source', dye.read.texture]], {
        point, value: [0, 0], color, radius: 0.0011, aspect, isDye: 1, dyeStrength: 0.16,
      });
      next(dye);
    };

    const simulate = (time: number) => {
      const dt = Math.min((time - previousTime) / 1000 || 1 / 60, 1 / 30);
      previousTime = time;
      const texelSize = [1 / simWidth, 1 / simHeight];

      if (pointer) {
        const distance = Math.hypot(pointer.dx, pointer.dy);
        if (distance > 0.00015 || pointer.down) {
          addSplat(pointer.x, pointer.y, pointer.dx, pointer.dy, pointer.down);
        }
        pointer.dx = 0;
        pointer.dy = 0;
        pointer.down = false;
      }

      draw('advect', velocity.write, [
        ['source', velocity.read.texture],
        ['velocity', velocity.read.texture],
      ], { texelSize, dt, dissipation: Math.exp(-1.7 * dt) });
      next(velocity);

      draw('curl', curl, [['velocity', velocity.read.texture]], { texelSize });
      draw('vorticity', velocity.write, [
        ['velocity', velocity.read.texture],
        ['curl', curl.texture],
      ], { texelSize, dt });
      next(velocity);

      const viscosity = 0.0018;
      const diffusionAlpha = viscosity * dt * simWidth * simWidth;
      for (let iteration = 0; iteration < 2; iteration += 1) {
        draw('diffuse', velocity.write, [
          ['source', velocity.read.texture],
          ['previous', velocity.read.texture],
        ], { texelSize, alpha: diffusionAlpha, beta: 1 + 4 * diffusionAlpha });
        next(velocity);
      }

      draw('divergence', divergence, [['velocity', velocity.read.texture]], { texelSize });
      for (let iteration = 0; iteration < 10; iteration += 1) {
        draw('pressure', pressure.write, [
          ['pressure', pressure.read.texture],
          ['divergence', divergence.texture],
        ], { texelSize });
        next(pressure);
      }
      draw('project', velocity.write, [
        ['velocity', velocity.read.texture],
        ['pressure', pressure.read.texture],
      ], { texelSize });
      next(velocity);

      draw('advect', dye.write, [
        ['source', dye.read.texture],
        ['velocity', velocity.read.texture],
      ], { texelSize, dt, dissipation: Math.exp(-0.9 * dt) });
      next(dye);

      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvasWidth, canvasHeight);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      draw('display', null, [['dye', dye.read.texture]], { texelSize });
      animationFrame = window.requestAnimationFrame(simulate);
    };

    const handlePointerMove = (event: PointerEvent) => {
      const x = event.clientX / window.innerWidth;
      const y = event.clientY / window.innerHeight;
      const contact = document.getElementById('contact')?.getBoundingClientRect();
      const overContact = contact
        && event.clientX >= contact.left
        && event.clientX <= contact.right
        && event.clientY >= contact.top
        && event.clientY <= contact.bottom;
      color = (overContact ? contactColors : colors)[colorIndex];
      if (!pointer) {
        pointer = { x, y, dx: 0, dy: 0, down: false };
        return;
      }
      pointer.dx += x - pointer.x;
      pointer.dy += y - pointer.y;
      pointer.x = x;
      pointer.y = y;
    };
    const handlePointerDown = (event: PointerEvent) => {
      colorIndex = (colorIndex + 1) % colors.length;
      color = colors[colorIndex];
      handlePointerMove(event);
      if (pointer) pointer.down = true;
    };
    try {
      resize();
    } catch (error) {
      console.warn('Fluid cursor effect could not initialize:', error);
      for (const target of targets) {
        gl.deleteTexture(target.texture);
        gl.deleteFramebuffer(target.framebuffer);
      }
      Array.from(programs.values()).forEach((program) => gl.deleteProgram(program));
      gl.deleteVertexArray(vao);
      return;
    }
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !animationFrame) {
        previousTime = performance.now();
        animationFrame = window.requestAnimationFrame(simulate);
      } else if (!visible && animationFrame) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      }
    });
    visibilityObserver.observe(canvas);
    const resizeObserver = new ResizeObserver(() => {
      try {
        resize();
      } catch (error) {
        console.warn('Fluid cursor could not resize:', error);
        if (animationFrame) window.cancelAnimationFrame(animationFrame);
        animationFrame = 0;
        visible = false;
        resizeObserver.disconnect();
        visibilityObserver.disconnect();
      }
    });
    resizeObserver.observe(document.documentElement);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    animationFrame = window.requestAnimationFrame(simulate);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      for (const target of targets) {
        gl.deleteTexture(target.texture);
        gl.deleteFramebuffer(target.framebuffer);
      }
      Array.from(programs.values()).forEach((program) => gl.deleteProgram(program));
      gl.deleteVertexArray(vao);
    };
  }, []);

  return <canvas ref={canvasRef} className="fluid-cursor-canvas" aria-hidden="true" />;
}
