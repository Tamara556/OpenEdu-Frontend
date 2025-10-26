import {
  Component,
  ElementRef,
  OnInit,
  OnDestroy,
  ViewChild,
  Input,
  AfterViewInit,
} from '@angular/core';
import * as THREE from 'three';

type NormalizedRGB = [number, number, number];

const hexToNormalizedRGB = (hex: string): NormalizedRGB => {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  return [r, g, b];
};

@Component({
  selector: 'app-silk',
  template: `<canvas #canvas class="silk-canvas"></canvas>`,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }
      .silk-canvas {
        width: 100%;
        height: 100%;
        display: block;
      }
    `,
  ],
})
export class SilkComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  @Input() speed: number = 5;
  @Input() scale: number = 1;
  @Input() color: string = '#7B7481';
  @Input() noiseIntensity: number = 1.5;
  @Input() rotation: number = 0;

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.OrthographicCamera;
  private mesh!: THREE.Mesh;
  private uniforms!: any;
  private animationId!: number;

  private vertexShader = `
    varying vec2 vUv;
    varying vec3 vPosition;

    void main() {
      vPosition = position;
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  private fragmentShader = `
    varying vec2 vUv;
    varying vec3 vPosition;

    uniform float uTime;
    uniform vec3  uColor;
    uniform float uSpeed;
    uniform float uScale;
    uniform float uRotation;
    uniform float uNoiseIntensity;

    const float e = 2.71828182845904523536;

    float noise(vec2 texCoord) {
      float G = e;
      vec2  r = (G * sin(G * texCoord));
      return fract(r.x * r.y * (1.0 + texCoord.x));
    }

    vec2 rotateUvs(vec2 uv, float angle) {
      float c = cos(angle);
      float s = sin(angle);
      mat2  rot = mat2(c, -s, s, c);
      return rot * uv;
    }

    void main() {
      float rnd        = noise(gl_FragCoord.xy);
      vec2  uv         = rotateUvs(vUv * uScale, uRotation);
      vec2  tex        = uv * uScale;
      float tOffset    = uSpeed * uTime;

      tex.y += 0.03 * sin(8.0 * tex.x - tOffset);

      float pattern = 0.6 +
                      0.4 * sin(5.0 * (tex.x + tex.y +
                                       cos(3.0 * tex.x + 5.0 * tex.y) +
                                       0.02 * tOffset) +
                               sin(20.0 * (tex.x + tex.y - 0.1 * tOffset)));

      vec4 col = vec4(uColor, 1.0) * vec4(pattern) - rnd / 15.0 * uNoiseIntensity;
      col.a = 1.0;
      gl_FragColor = col;
    }
  `;

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    if (typeof window !== 'undefined') {
      this.initScene();
      this.startAnimation();
    }
  }

  private initScene(): void {
    const canvas = this.canvasRef.nativeElement;

    this.renderer = new THREE.WebGLRenderer({ canvas });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.scene = new THREE.Scene();

    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    this.camera.position.z = 1;

    this.uniforms = {
      uSpeed: { value: this.speed },
      uScale: { value: this.scale },
      uNoiseIntensity: { value: this.noiseIntensity },
      uColor: { value: new THREE.Color(...hexToNormalizedRGB(this.color)) },
      uRotation: { value: this.rotation },
      uTime: { value: 0 },
    };

    const geometry = new THREE.PlaneGeometry(2, 2, 32, 32);
    const material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: this.vertexShader,
      fragmentShader: this.fragmentShader,
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.mesh);

    window.addEventListener('resize', this.onResize);
  }

  private onResize = () => {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };

  private startAnimation(): void {
    const animate = () => {
      this.uniforms.uTime.value += 0.02;
      this.renderer.render(this.scene, this.camera);
      this.animationId = requestAnimationFrame(animate);
    };
    animate();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationId);
    window.removeEventListener('resize', this.onResize);
  }
}
