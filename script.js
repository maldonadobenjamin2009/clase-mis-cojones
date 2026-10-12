
const gato = document.getElementById("gato");
const cara = document.getElementById("cara");
const mensaje = document.getElementById("mensaje");
const canvas = document.getElementById("escenario");
const ctx = canvas.getContext("2d");

let audio;
let ancho, alto;

const pelota = {
  x: 280,
  y: 100,
  radio: 23,
  vx: 3.5,
  vy: 0,
  gravedad: 0.35,
  rebote: 0.78,
  color: "#ff6b35"
};

function ajustarCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  ancho = rect.width;
  alto = rect.height;

  canvas.width = ancho * dpr;
  canvas.height = alto * dpr;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener("resize", ajustarCanvas);
ajustarCanvas();

// Sonido de maullido sintetizado con Web Audio
function maullar() {
  audio = audio || new (
    window.AudioContext || window.webkitAudioContext
  )();

  if (audio.state === "suspended") {
    audio.resume();
  }

  const ahora = audio.currentTime;
  const oscilador = audio.createOscillator();
  const volumen = audio.createGain();
  const filtro = audio.createBiquadFilter();

  oscilador.type = "triangle";
  filtro.type = "lowpass";
  filtro.frequency.value = 1800;

  oscilador.frequency.setValueAtTime(750, ahora);
  oscilador.frequency.exponentialRampToValueAtTime(
    1100, ahora + 0.12
  );
  oscilador.frequency.exponentialRampToValueAtTime(
    420, ahora + 0.42
  );

  volumen.gain.setValueAtTime(0.001, ahora);
  volumen.gain.linearRampToValueAtTime(0.25, ahora + 0.04);
  volumen.gain.setValueAtTime(0.18, ahora + 0.18);
  volumen.gain.exponentialRampToValueAtTime(
    0.001, ahora + 0.45
  );

  oscilador.connect(filtro);
  filtro.connect(volumen);
  volumen.connect(audio.destination);

  oscilador.start(ahora);
  oscilador.stop(ahora + 0.46);
}

gato.addEventListener("click", () => {
  maullar();

  cara.classList.remove("maullando");
  void cara.offsetWidth;
  cara.classList.add("maullando");

  mensaje.textContent = "¡Miauuuu! 🐱";

  pelota.vy = -8;
  pelota.vx += (Math.random() - 0.5) * 3;

  setTimeout(() => {
    cara.classList.remove("maullando");
    mensaje.textContent = "¡El gato está jugando! 🎾";
  }, 700);
});

// Física de la pelota
function actualizarPelota() {
  pelota.vy += pelota.gravedad;

  pelota.x += pelota.vx;
  pelota.y += pelota.vy;

  // Paredes laterales
  if (pelota.x + pelota.radio > ancho) {
    pelota.x = ancho - pelota.radio;
    pelota.vx *= -pelota.rebote;
  }

  if (pelota.x - pelota.radio < 0) {
    pelota.x = pelota.radio;
    pelota.vx *= -pelota.rebote;
  }

  // Suelo
  if (pelota.y + pelota.radio > alto) {
    pelota.y = alto - pelota.radio;
    pelota.vy *= -pelota.rebote;

    // Evitar rebotes diminutos infinitos
    if (Math.abs(pelota.vy) < 1.1) {
      pelota.vy = 0;
    }
  }

  // Techo
  if (pelota.y - pelota.radio < 0) {
    pelota.y = pelota.radio;
    pelota.vy = Math.abs(pelota.vy) * 0.8;
  }

  // Fricción horizontal
  if (pelota.y + pelota.radio >= alto - 0.5) {
    pelota.vx *= 0.995;
  }
}

function dibujarPelota() {
  ctx.save();

  // Sombra
  ctx.beginPath();
  ctx.ellipse(
    pelota.x + 5,
    alto - 7,
    pelota.radio * 0.9,
    6,
    0, 0, Math.PI * 2
  );
  ctx.fillStyle = "#43566b30";
  ctx.fill();

  // Pelota
  const gradiente = ctx.createRadialGradient(
    pelota.x - 8, pelota.y - 9, 2,
    pelota.x, pelota.y, pelota.radio
  );

  gradiente.addColorStop(0, "#fff3b0");
  gradiente.addColorStop(0.35, pelota.color);
  gradiente.addColorStop(1, "#d83d37");

  ctx.beginPath();
  ctx.arc(
    pelota.x,
    pelota.y,
    pelota.radio,
    0,
    Math.PI * 2
  );

  ctx.fillStyle = gradiente;
  ctx.fill();

  ctx.lineWidth = 3;
  ctx.strokeStyle = "#ffffffaa";
  ctx.stroke();

  ctx.restore();
}

function animar() {
  ctx.clearRect(0, 0, ancho, alto);

  actualizarPelota();
  dibujarPelota();

  requestAnimationFrame(animar);
}

animar();

// Permite lanzar la pelota haciendo clic en el escenario
canvas.addEventListener("click", (evento) => {
  const rect = canvas.getBoundingClientRect();

  pelota.x = evento.clientX - rect.left;
  pelota.y = evento.clientY - rect.top;

  pelota.vx = (Math.random() - 0.5) * 10;
  pelota.vy = -7 - Math.random() * 4;
});
