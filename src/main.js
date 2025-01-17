import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as Tone from 'tone';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000000);
const renderer = new THREE.WebGLRenderer();

const loader = new GLTFLoader();
const models = [];
const labels = [];

const synth = new Tone.Synth().toDestination();
const reverb = new Tone.Reverb(1.5).toDestination();
synth.connect(reverb);

function getZoomSensitivity(currentZoom) {
    const threshold = zoomSettings.thresholds.reduce((prev, curr) => {
        return (currentZoom >= curr.zoom) ? curr : prev;
    }, zoomSettings.thresholds[0]);
    return threshold.sensitivity;
}

const modelConfigs = [
    {
        path: '/models/sun.glb',
        baseScale: 1,
        xPos: 0,            
        name: 'Sun',
        description: 'The Sun is 1.39 million km in diameter'
    },
    {
        path: '/models/jupiter.glb',
        baseScale: 0.1,
        xPos: 30,           
        name: 'Jupiter',
        description: 'Jupiter is 140,000 km in diameter'
    },
    {
        path: '/models/earth.glb',
        baseScale: 0.01,
        xPos: 45,
        name: 'Earth',
        description: 'Earth is 13,000 km in diameter'
    },
    {
        path: '/models/tower.glb',
        baseScale: 0.0025,
        xPos: 50,
        name: 'Tower',
        description: 'The tower is 330 meters in height, which is the equivalent of the height of the eiffel tower'
    },
    {
        path: '/models/human_skeleton.glb',
        baseScale: 0.0001,
        xPos: 51,
        name: 'Human Skeleton',
        description: 'The human skeleton is an average height of 1.7 meters'
    }
];

const viewPoints = [
    { x: 0, zoom: 20, sensitivity: 0.1},
    { x: 15, zoom: 30, sensitivity: 0.1},
    { x: 30, zoom: 15, sensitivity: 0.05},  //jupiter
    { x: 35, zoom: 30, sensitivity: 0.05},
    { x: 44, zoom: 30, sensitivity: 0.05},
    { x: 45, zoom: 1.5, sensitivity: 0.01}, //earth
    { x: 46, zoom: 3, sensitivity: 0.01},
    { x: 49, zoom: 3, sensitivity: 0.01},
    { x: 50, zoom: 0.2, sensitivity: 0.001},   //tower
    { x: 50.1, zoom: 0.75, sensitivity: 0.001},
    { x: 50.9, zoom: 0.75, sensitivity: 0.001}, 
    { x: 51, zoom: 0.2, sensitivity: 0.001},
    { x: 120, zoom: 2, sensitivity: 0.001}
];

const panSettings = {
    minX: 0,
    maxX: 51,
    defaultSensitivity: 0.1,
    currentX: 0,
    targetX: 0,
    currentZoom: 20,
    targetZoom: 20
};

function createModelUI() {
    const uiContainer = document.createElement('div');
    uiContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.5);
        padding: 10px;
        border-radius: 5px;
        color: white;
        font-family: Arial, sans-serif;
    `;

    modelConfigs.forEach((config, index) => {
        const button = document.createElement('button');
        button.textContent = config.name;
        button.style.cssText = `
            display: block;
            margin: 5px;
            padding: 8px 15px;
            background: #444;
            border: none;
            border-radius: 3px;
            color: white;
            cursor: pointer;
            transition: background 0.3s;
        `;
        
        button.onmouseover = () => button.style.background = '#666';
        button.onmouseout = () => button.style.background = '#444';
        
        
        button.onclick = async () => {
            
            await Tone.start();
            
            
            const notes = ['C4', 'E4', 'G4', 'B4', 'D5'];
            synth.triggerAttackRelease(notes[index], '0.1');
            
            
            panSettings.targetX = config.xPos;
        };
        
        uiContainer.appendChild(button);
    });

    document.body.appendChild(uiContainer);
}

async function initAudio() {
    await Tone.start();
    console.log('Audio is ready');
}

function createTextUI() {
    const uiContainer = document.createElement('div');
    uiContainer.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;          
        background: rgba(0, 0, 0, 0.7);
        padding: 15px;
        border-radius: 5px;
        color: white;
        font-family: Arial, sans-serif;
        min-width: 200px;
        transition: all 0.3s ease;
        z-index: 1000;
    `;

    
    const headerContainer = document.createElement('div');
    headerContainer.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
    `;

    
    const header = document.createElement('h2');
    header.textContent = 'Information';
    header.style.cssText = `
        margin: 0;
        font-size: 18px;
    `;

    
    const arrow = document.createElement('span');
    arrow.textContent = '▼';
    arrow.style.cssText = `
        transition: transform 0.3s ease;
        margin-left: 10px;   
    `;

    
    const content = document.createElement('div');
    content.style.cssText = `
        position: absolute;   
        left: 0;             
        top: 100%;           
        width: 100%;         
        background: rgba(0, 0, 0, 0.7);
        margin-top: 5px;     
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease;
        border-radius: 5px;
    `;

    
    content.innerHTML = `
        <div style="padding: 15px;">  This website is a scale model of different objects in our universe. To navigate the different objects, use the buttons on the top right of the screen.
        </div>
    `;

    
    let isOpen = false;
    headerContainer.onclick = () => {
        isOpen = !isOpen;
        arrow.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0)';
        content.style.maxHeight = isOpen ? '300px' : '0';
        
        
        synth.triggerAttackRelease('C5', '0.05');
    };

    
    headerContainer.appendChild(header);
    headerContainer.appendChild(arrow);
    uiContainer.appendChild(headerContainer);
    uiContainer.appendChild(content);
    document.body.appendChild(uiContainer);
}

Promise.all(modelConfigs.map(loadModel))
    .then(() => {
        console.log('All models loaded');
        createModelUI();
        initAudio();
        createTextUI();  
        animate();
    })
    .catch(error => {
    console.error('Error loading models:', error);
});

function createModelLabel(config) {
    const div = document.createElement('div');
    div.className = 'model-label';
    div.textContent = config.description;
    div.style.cssText = `
        position: absolute;
        left: ${window.innerWidth/2 - 150}px;
        top: ${window.innerHeight/2}px;
        color: white;
        font-family: Arial, sans-serif;
        font-size: 16px;
        background: rgba(0, 0, 0, 0.7);
        padding: 10px;
        border-radius: 5px;
        pointer-events: none;
        transform: translate(-100%, -50%);
        opacity: 0;
        transition: opacity 0.3s;
    `;
    document.body.appendChild(div);
    return div;
}

Promise.all(modelConfigs.map(loadModel))
    .then(() => {
        console.log('All models loaded');
        createModelUI();
        animate();
    })
    .catch(error => {
        console.error('Error loading models:', error);
    });

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

camera.position.z = 20; 
camera.position.x = 0;  

function loadModel(config) {
    return new Promise((resolve, reject) => {
        loader.load(
            config.path,
            (gltf) => {
                const model = gltf.scene;
                model.scale.setScalar(config.baseScale);
                model.position.x = config.xPos;
                model.position.z = 0;
                models.push(model);
                scene.add(model);
                
                
                const label = createModelLabel(config);
                labels.push({ label, xPos: config.xPos });
                
                resolve(model);
            },
            (xhr) => {
                console.log(`${config.path}: ${(xhr.loaded / xhr.total * 100)}% loaded`);
            },
            reject
        );
    });
}

function handleScroll(event) {
    event.preventDefault();
    
    
    const nearestPoint = viewPoints.reduce((prev, curr) => {
        return Math.abs(curr.x - panSettings.currentX) < Math.abs(prev.x - panSettings.currentX) ? curr : prev;
    });
    
    const sensitivity = nearestPoint.sensitivity || panSettings.defaultSensitivity;
    
    panSettings.targetX = THREE.MathUtils.clamp(
        panSettings.targetX + event.deltaY * sensitivity,
        panSettings.minX,
        panSettings.maxX
    );
    
    console.log('Current X Position:', panSettings.currentX.toFixed(3));
}

function animate() {
    requestAnimationFrame(animate);
    
    
    panSettings.currentX = THREE.MathUtils.lerp(
        panSettings.currentX,
        panSettings.targetX,
        0.05
    );
    
    
    const nearestPoint = viewPoints.reduce((prev, curr) => {
        return Math.abs(curr.x - panSettings.currentX) < Math.abs(prev.x - panSettings.currentX) ? curr : prev;
    });
    
    panSettings.targetZoom = nearestPoint.zoom;
    panSettings.currentZoom = THREE.MathUtils.lerp(
        panSettings.currentZoom,
        panSettings.targetZoom,
        0.05
    );
    
    
    labels.forEach(({label, xPos}) => {
        const distance = Math.abs(xPos - panSettings.currentX);
        let threshold;
        
        
        if (xPos <= 30) {          
            threshold = 3;
        } else if (xPos <= 45) {   
            threshold = 2;
        } else if (xPos === 50) {  
            threshold = 0.5;
        } else {                   
            threshold = 0.3;
        }
        
        label.style.opacity = distance < threshold ? 1 : 0;
    });
    
    
    camera.position.x = panSettings.currentX;
    camera.position.z = panSettings.currentZoom;
    
    
    models.forEach(model => {
        if (model) {
            model.rotation.y += 0.002;
        }
    });
    
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    labels.forEach(({label}) => {
        label.style.left = `${window.innerWidth/2 - 150}px`;
        label.style.top = `${window.innerHeight/2}px`;
    });
    
    
});

Promise.all(modelConfigs.map(loadModel))
    .then(() => {
        console.log('All models loaded');
        animate();
    })
    .catch(error => {
        console.error('Error loading models:', error);
});