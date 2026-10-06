import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild
} from '@angular/core';

import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-aircraft',
  standalone: true,
  imports:[FormsModule],
  templateUrl: './aircraft.html',
  styleUrl:'./aircraft.scss'
})
export class AircraftComponent implements AfterViewInit {
  flights = [
  {
    flightNumber: '6E2134',
    from: 'DEL',
    to: 'BOM',
    departure: '06:30',
    arrival: '08:45',
    price: 5420
  },
  {
    flightNumber: 'AI864',
    from: 'DEL',
    to: 'BOM',
    departure: '09:15',
    arrival: '11:30',
    price: 6180
  },
  {
    flightNumber: '6E6087',
    from: 'DEL',
    to: 'BLR',
    departure: '14:20',
    arrival: '17:10',
    price: 6890
  },
  {
    flightNumber: '6E201',
    from: 'BOM',
    to: 'DEL',
    departure: '10:00',
    arrival: '12:10',
    price: 5100
  }
];
from:string="BOM";
to:string="DEL";
filteredFlights:any=[];

  @ViewChild('canvas', { static: true })
  canvas!: ElementRef<HTMLCanvasElement>;

  // --------------------------------------------------
  // THREE CORE
  // --------------------------------------------------

  scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera;
  renderer!: THREE.WebGLRenderer;
  controls!: OrbitControls;

  // --------------------------------------------------
  // AIRCRAFT
  // --------------------------------------------------

  aircraft!: THREE.Group;

  // --------------------------------------------------
  // CABIN
  // --------------------------------------------------

  cabinGroup!: THREE.Group;

  // Seat GLB template
  seatTemplate!: THREE.Object3D;

  insideCabin = false;

  // --------------------------------------------------
  // RAYCASTING
  // --------------------------------------------------

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  selectedSeat: THREE.Object3D | null = null;

  // --------------------------------------------------
  // CABIN DIMENSIONS
  // --------------------------------------------------

  cabinWidth = 6.2;
  cabinLength = 42;
  cabinHeight = 5;

  // --------------------------------------------------
  // INITIALIZE
  // --------------------------------------------------

  ngAfterViewInit(): void {

    this.initThree();

    this.loadSeat();

    this.loadAirplane();

    this.animate();

    window.addEventListener(
      'resize',
      () => this.onResize()
    );

    this.canvas.nativeElement.addEventListener(
      'click',
      (event) => this.onCanvasClick(event)
    );
  }

  // --------------------------------------------------
  // THREE SETUP
  // --------------------------------------------------

  private initThree(): void {

    this.scene = new THREE.Scene();

    this.scene.background =
      new THREE.Color(0x87ceeb);

    this.camera =
      new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );

    this.camera.position.set(
      0,
      4,
      15
    );

    this.renderer =
      new THREE.WebGLRenderer({
        canvas: this.canvas.nativeElement,
        antialias: true
      });

    this.renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, 2)
    );

    this.renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );

    this.renderer.shadowMap.enabled = true;

    // ------------------------------------------------
    // LIGHTS
    // ------------------------------------------------

    const ambient =
      new THREE.AmbientLight(
        0xffffff,
        1.5
      );

    this.scene.add(ambient);

    const directional =
      new THREE.DirectionalLight(
        0xffffff,
        2
      );

    directional.position.set(
      10,
      15,
      10
    );

    directional.castShadow = true;

    this.scene.add(directional);

    // ------------------------------------------------
    // CONTROLS
    // ------------------------------------------------

    this.controls =
      new OrbitControls(
        this.camera,
        this.renderer.domElement
      );

    this.controls.enableDamping = true;

    this.controls.minDistance = 2;

    this.controls.maxDistance = 20;
  }

  // --------------------------------------------------
  // LOAD SEAT GLB
  // --------------------------------------------------

  private loadSeat(): void {

    const loader = new GLTFLoader();

    loader.load(
      'models/seat.glb',

      (gltf) => {

        this.seatTemplate =
          gltf.scene;

        console.log(
          'Seat GLB loaded'
        );

      },

      undefined,

      (error) => {

        console.error(
          'Seat GLB loading error:',
          error
        );

      }
    );
  }

  // --------------------------------------------------
  // LOAD AIRPLANE FBX
  // --------------------------------------------------

  private loadAirplane(): void {

    const loader = new FBXLoader();

    loader.load(
      'models/airplane.fbx',

      (object) => {

        this.aircraft = object;

        // --------------------------------------------
        // NORMALIZE AIRCRAFT
        // --------------------------------------------

        const box =
          new THREE.Box3()
            .setFromObject(object);

        const size =
          new THREE.Vector3();

        box.getSize(size);

        const maxDimension =
          Math.max(
            size.x,
            size.y,
            size.z
          );

        const scale =
          15 / maxDimension;

        object.scale.setScalar(scale);

        // --------------------------------------------
        // CENTER
        // --------------------------------------------

        const newBox =
          new THREE.Box3()
            .setFromObject(object);

        const center =
          new THREE.Vector3();

        newBox.getCenter(center);

        object.position.sub(center);

        object.position.y = 0;

        // --------------------------------------------

        this.scene.add(object);

        console.log(
          'Aircraft loaded'
        );
      },

      undefined,

      (error) => {

        console.error(
          'FBX loading error:',
          error
        );

      }
    );
  }

  // --------------------------------------------------
  // ENTER CABIN
  // --------------------------------------------------

  private enterCabin(): void {

    if (this.insideCabin) {
      return;
    }

    this.insideCabin = true;

    // Hide aircraft
    if (this.aircraft) {
      this.aircraft.visible = false;
    }

    this.createCabin();

    // -----------------------------------------------
    // CAMERA
    // -----------------------------------------------

    this.camera.position.set(
      0,
      2.1,
      11
    );

    this.controls.target.set(
      0,
      2.1,
      0
    );

    this.controls.minDistance = 3;
    this.controls.maxDistance = 12;

    this.controls.update();
  }

  // --------------------------------------------------
  // EXIT CABIN
  // --------------------------------------------------

  exitCabin(): void {

    this.insideCabin = false;

    if (this.cabinGroup) {

      this.scene.remove(
        this.cabinGroup
      );

      this.cabinGroup.traverse(
        (child: THREE.Object3D) => {

          if (child instanceof THREE.Mesh) {

            child.geometry.dispose();

            if (Array.isArray(child.material)) {

              child.material.forEach(
                material =>
                  material.dispose()
              );

            } else {

              child.material.dispose();
            }
          }
        }
      );
    }

    if (this.aircraft) {
      this.aircraft.visible = true;
    }

    this.camera.position.set(
      0,
      4,
      15
    );

    this.controls.target.set(
      0,
      0,
      0
    );

    this.controls.minDistance = 2;
    this.controls.maxDistance = 20;

    this.controls.update();
  }

  // --------------------------------------------------
  // CREATE CABIN
  // --------------------------------------------------

  private createCabin(): void {

    // Remove previous cabin
    if (this.cabinGroup) {

      this.scene.remove(
        this.cabinGroup
      );
    }

    // IMPORTANT
    // This is the group containing EVERYTHING
    this.cabinGroup =
      new THREE.Group();

    this.scene.add(
      this.cabinGroup
    );

    this.createCabinFloor();

    this.createCabinWalls();

    this.createCeiling();

    this.createWindows();

    this.createSeats();
    this.createSeatNumbers();
    this.createOutsideView();
  }

  // --------------------------------------------------
  // FLOOR
  // --------------------------------------------------

  private createCabinFloor(): void {

    const geometry =
      new THREE.BoxGeometry(
        this.cabinWidth,
        0.2,
        this.cabinLength
      );

    const material =
      new THREE.MeshStandardMaterial({
        color: 0x30343b,
        roughness: 0.9
      });

    const floor =
      new THREE.Mesh(
        geometry,
        material
      );

    floor.position.y = 0;

    floor.receiveShadow = true;

    this.cabinGroup.add(
      floor
    );
  }

  // --------------------------------------------------
  // WALLS
  // --------------------------------------------------

  private createCabinWalls(): void {

    const wallMaterial =
      new THREE.MeshStandardMaterial({
        color: 0xe7e7e7,
        roughness: 0.8,
        side: THREE.DoubleSide
      });

    const windowBottom = 1.45;
    const windowTop = 2.70;

    // -----------------------------------------------
    // TOP WALL
    // -----------------------------------------------

    const topHeight =
      this.cabinHeight -
      windowTop;

    const topWall =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.25,
          topHeight,
          this.cabinLength
        ),
        wallMaterial
      );

    topWall.position.set(
      -3.0,
      windowTop + topHeight / 2,
      0
    );

    this.cabinGroup.add(
      topWall
    );

    const topWall2 =
      topWall.clone();

    topWall2.position.x = 3.0;

    this.cabinGroup.add(
      topWall2
    );

    // -----------------------------------------------
    // BOTTOM WALL
    // -----------------------------------------------

    const bottomHeight =
      windowBottom;

    const bottomWall =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.25,
          bottomHeight,
          this.cabinLength
        ),
        wallMaterial
      );

    bottomWall.position.set(
      -3.0,
      bottomHeight / 2,
      0
    );

    this.cabinGroup.add(
      bottomWall
    );

    const bottomWall2 =
      bottomWall.clone();

    bottomWall2.position.x = 3.0;

    this.cabinGroup.add(
      bottomWall2
    );
  }

  // --------------------------------------------------
  // CEILING
  // --------------------------------------------------

  private createCeiling(): void {

  const ceilingMaterial =
    new THREE.MeshStandardMaterial({
      color: 0xf5f5f5,
      roughness: 0.8,
      side: THREE.DoubleSide
    });

  // Main ceiling
  const ceiling =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        5.6,
        0.18,
        this.cabinLength
      ),
      ceilingMaterial
    );

  ceiling.position.y = 4.75;

  this.cabinGroup.add(ceiling);

  // Slightly curved-looking center panels
  for (let z = -18; z <= 18; z += 3) {

    const panel =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          5.3,
          0.08,
          2.7
        ),
        new THREE.MeshStandardMaterial({
          color: 0xffffff,
          roughness: 0.75
        })
      );

    panel.position.set(
      0,
      4.82,
      z
    );

    this.cabinGroup.add(panel);
  }

  // Center lighting strip
  const lightStrip =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.35,
        0.08,
        this.cabinLength - 2
      ),
      new THREE.MeshBasicMaterial({
        color: 0xffffff
      })
    );

  lightStrip.position.set(
    0,
    4.88,
    0
  );

  this.cabinGroup.add(lightStrip);
}

  // --------------------------------------------------
  // WINDOWS
  // --------------------------------------------------

  private createWindows(): void {

    const windowWidth = 0.90;
    const windowHeight = 1.25;

    const windowBottom = 1.45;
    const windowTop = 2.70;

    const windowY =
      (windowBottom + windowTop) / 2;

    const windowMaterial =
      new THREE.MeshBasicMaterial({
        color: 0x87c9ee,
        transparent: true,
        opacity: 0.22,
        side: THREE.DoubleSide
      });

    const frameMaterial =
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.7
      });

    for (let row = 0; row < 20; row++) {

      const z =
        8 - row * 1.8;

      [-3.14, 3.14].forEach(
        (x, side) => {

          // -----------------------------------------
          // GLASS
          // -----------------------------------------

          const glass =
            new THREE.Mesh(
              new THREE.PlaneGeometry(
                windowWidth,
                windowHeight
              ),
              windowMaterial
            );

          glass.position.set(
            x,
            windowY,
            z
          );

          glass.rotation.y =
            side === 0
              ? Math.PI / 2
              : -Math.PI / 2;

          this.cabinGroup.add(
            glass
          );

          // -----------------------------------------
          // FRAME
          // -----------------------------------------

          const frame =
            new THREE.Mesh(
              new THREE.RingGeometry(
                0.50,
                0.58,
                32
              ),
              frameMaterial
            );

          frame.scale.y = 1.35;

          frame.position.set(
            x,
            windowY,
            z
          );

          frame.rotation.y =
            side === 0
              ? Math.PI / 2
              : -Math.PI / 2;

          this.cabinGroup.add(
            frame
          );
        }
      );
    }
  }

  // --------------------------------------------------
  // SEATS
  // --------------------------------------------------

  private createSeats(): void {

    if (!this.seatTemplate) {

      console.warn(
        'Seat model not loaded yet'
      );

      return;
    }

    const seatSpacing = 0.70;

    const leftStart = -2.25;
    const rightStart = 0.85;

    const rowSpacing = 1.8;

    let seatIndex = 0;

    for (let row = 1; row <= 20; row++) {

      const z =
        8 - (row - 1) * rowSpacing;

      const positions = [
        { letter: 'A', x: leftStart },
        { letter: 'B', x: leftStart + seatSpacing },
        { letter: 'C', x: leftStart + seatSpacing * 2 },

        { letter: 'D', x: rightStart },
        { letter: 'E', x: rightStart + seatSpacing },
        { letter: 'F', x: rightStart + seatSpacing * 2 }
      ];

      positions.forEach(
        seatPosition => {

          const occupied =
            (seatIndex % 7 === 0);

          this.createSeat(
            seatPosition.x,
            z,
            `${row}${seatPosition.letter}`,
            occupied
          );

          seatIndex++;
        }
      );
    }
  }

  // --------------------------------------------------
  // CREATE INDIVIDUAL SEAT
  // --------------------------------------------------

  private createSeat(
    x: number,
    z: number,
    seatNumber: string,
    occupied: boolean
  ): void {

    const seat =
      this.seatTemplate.clone(true);

    seat.userData['seatNumber'] =
      seatNumber;

    seat.userData['occupied'] =
      occupied;

      this.setSeatColor(
  seat,
  occupied ? 0xff2020 : 0xffffff
);
    // -----------------------------------------------
    // SCALE
    // -----------------------------------------------

    const originalBox =
      new THREE.Box3()
        .setFromObject(seat);

    const originalSize =
      new THREE.Vector3();

    originalBox.getSize(
      originalSize
    );

    const targetWidth = 0.62;
    const targetDepth = 0.70;

    const scaleX =
      targetWidth / originalSize.x;

    const scaleZ =
      targetDepth / originalSize.z;

    const scale =
      Math.min(
        scaleX,
        scaleZ
      );

    seat.scale.setScalar(
      scale
    );

    // -----------------------------------------------
    // CENTER
    // -----------------------------------------------

    let box =
      new THREE.Box3()
        .setFromObject(seat);

    const center =
      new THREE.Vector3();

    box.getCenter(center);

    seat.position.sub(
      center
    );

    // -----------------------------------------------
    // HORIZONTAL POSITION
    // -----------------------------------------------

    seat.position.x += x;
    seat.position.z += z;

    // -----------------------------------------------
    // CRITICAL FLOOR FIX
    // -----------------------------------------------

    box =
      new THREE.Box3()
        .setFromObject(seat);

    const floorTop = 0.1;

    seat.position.y +=
      floorTop - box.min.y;

    // -----------------------------------------------
    // COLOR
    // -----------------------------------------------

    this.setSeatColor(
      seat,
      occupied
        ? 0xff2020
        : 0xffffff
    );

    // -----------------------------------------------
    // ADD TO CABIN
    // -----------------------------------------------

    this.cabinGroup.add(
      seat
    );
  }

  // --------------------------------------------------
  // SEAT COLOR
  // --------------------------------------------------

  private setSeatColor(
  object: THREE.Object3D,
  color: number
): void {

  object.traverse((child) => {

    if (!(child instanceof THREE.Mesh)) return;

    const materials = Array.isArray(child.material)
      ? child.material
      : [child.material];

    const updatedMaterials = materials.map((originalMaterial) => {

      const material = originalMaterial.clone();

      // Make sure material has a color
      if ('color' in material) {
        (material as any).color.set(color);
      }

      // Remove original GLB texture
      if ('map' in material) {
        (material as any).map = null;
      }

      // Disable vertex colors if the model uses them
      if ('vertexColors' in material) {
        (material as any).vertexColors = false;
      }

      // Small glow for selected/booked state
      if ('emissive' in material) {
        (material as any).emissive.set(color);
        (material as any).emissiveIntensity = 0.15;
      }

      material.needsUpdate = true;

      return material;
    });

    child.material = Array.isArray(child.material)
      ? updatedMaterials
      : updatedMaterials[0];

  });
}

  // --------------------------------------------------
  // OUTSIDE VIEW
  // --------------------------------------------------

  private createOutsideView(): void {

    const skyGeometry =
      new THREE.SphereGeometry(
        100,
        32,
        32
      );

    const skyMaterial =
      new THREE.MeshBasicMaterial({
        color: 0x72b8e6,
        side: THREE.BackSide
      });

    const sky =
      new THREE.Mesh(
        skyGeometry,
        skyMaterial
      );

    this.cabinGroup.add(
      sky
    );

    // -----------------------------------------------
    // CLOUDS
    // -----------------------------------------------

    for (let i = 0; i < 20; i++) {

      const cloud =
        new THREE.Group();

      for (let j = 0; j < 4; j++) {

        const cloudPart =
          new THREE.Mesh(
            new THREE.SphereGeometry(
              0.8 + Math.random() * 0.6,
              12,
              12
            ),
            new THREE.MeshBasicMaterial({
              color: 0xffffff,
              transparent: true,
              opacity: 0.85
            })
          );

        cloudPart.position.x =
          j * 0.8;

        cloud.add(
          cloudPart
        );
      }

      cloud.position.set(
        Math.random() > 0.5
          ? 8
          : -8,

        2 + Math.random() * 5,

        -15 + Math.random() * 30
      );

      this.cabinGroup.add(
        cloud
      );
    }
  }

  // --------------------------------------------------
  // CLICK
  // --------------------------------------------------

  private onCanvasClick(event: MouseEvent): void {

  const rect =
    this.canvas.nativeElement.getBoundingClientRect();

  this.mouse.x =
    ((event.clientX - rect.left) / rect.width) * 2 - 1;

  this.mouse.y =
    -((event.clientY - rect.top) / rect.height) * 2 + 1;

  this.raycaster.setFromCamera(
    this.mouse,
    this.camera
  );

  // =================================================
  // OUTSIDE AIRCRAFT
  // =================================================

  if (!this.insideCabin) {

    if (!this.aircraft) {
      return;
    }

    const hits =
      this.raycaster.intersectObject(
        this.aircraft,
        true
      );

    // Only enter cabin if AIRCRAFT was clicked
    if (hits.length > 0) {

      this.enterCabin();
    }

    return;
  }

  // =================================================
  // INSIDE CABIN - SEAT SELECTION
  // =================================================

  if (!this.cabinGroup) {
    return;
  }

  const intersections =
    this.raycaster.intersectObjects(
      this.cabinGroup.children,
      true
    );

  if (!intersections.length) {
    return;
  }

  let object: THREE.Object3D | null =
    intersections[0].object;

  // Walk up until we find the seat
  while (
    object &&
    !object.userData['seatNumber'] &&
    object.parent
  ) {
    object = object.parent;
  }

  if (
    !object ||
    !object.userData['seatNumber']
  ) {
    return;
  }

  const seatNumber =
    object.userData['seatNumber'];

  const occupied =
    object.userData['occupied'];

  if (occupied) {

  // Always keep booked seat RED
  this.setSeatColor(
    object,
    0xff2d2d
  );

  alert(
    `Seat ${seatNumber} is already booked`
  );

  return;
}

  // Reset previous selection
  if (this.selectedSeat) {

  // Only reset if it is NOT booked
  if (!this.selectedSeat.userData['occupied']) {

    this.setSeatColor(
      this.selectedSeat,
      0xe8e8e8
    );
  }
}

  // Select new seat
  this.selectedSeat = object;

  this.setSeatColor(
    object,
    0x2196f3
  );

  console.log(
    'Selected seat:',
    seatNumber
  );
}

  // --------------------------------------------------
  // RESIZE
  // --------------------------------------------------

  private onResize(): void {

    this.camera.aspect =
      window.innerWidth /
      window.innerHeight;

    this.camera.updateProjectionMatrix();

    this.renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );
  }

  // --------------------------------------------------
  // ANIMATION
  // --------------------------------------------------

  private animate = (): void => {

    requestAnimationFrame(
      this.animate
    );

    this.controls.update();

    this.renderer.render(
      this.scene,
      this.camera
    );
  };

  private createSeatNumbers(): void {

  const seatSpacing = 0.70;

  const leftStart = -2.25;
  const rightStart = 0.85;

  const rowSpacing = 1.8;

  const positions = [
    { letter: 'A', x: leftStart },
    { letter: 'B', x: leftStart + seatSpacing },
    { letter: 'C', x: leftStart + seatSpacing * 2 },

    { letter: 'D', x: rightStart },
    { letter: 'E', x: rightStart + seatSpacing },
    { letter: 'F', x: rightStart + seatSpacing * 2 }
  ];

  for (let row = 1; row <= 20; row++) {

    const z =
      8 - (row - 1) * rowSpacing;

    positions.forEach(seat => {

      const sprite =
        this.createTextSprite(
          `${row}${seat.letter}`
        );

      sprite.position.set(
        seat.x,
        1.75,
        z - 0.18
      );

      sprite.scale.set(
        0.38,
        0.20,
        1
      );

      this.cabinGroup.add(sprite);
    });
  }
}

private createTextSprite(
  text: string
): THREE.Sprite {

  const canvas =
    document.createElement('canvas');

  canvas.width = 128;
  canvas.height = 64;

  const context =
    canvas.getContext('2d')!;

  // Background
  context.fillStyle =
    'rgba(255,255,255,0.92)';

  context.roundRect(
    8,
    8,
    112,
    48,
    10
  );

  context.fill();

  // Text
  context.fillStyle =
    '#222222';

  context.font =
    'bold 30px Arial';

  context.textAlign =
    'center';

  context.textBaseline =
    'middle';

  context.fillText(
    text,
    64,
    32
  );

  const texture =
    new THREE.CanvasTexture(
      canvas
    );

  texture.needsUpdate = true;

  const material =
    new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: true
    });

  return new THREE.Sprite(
    material
  );
}

searchFlights(){
  this.filteredFlights = this.flights.filter(
  flight =>
    flight.from === this.from &&
    flight.to === this.to
);

}

selectFlight(flight:any){
console.log(flight);

}
}