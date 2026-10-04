// Ett litet faltningsnät (CNN) i TensorFlow.js. tf laddas globalt från CDN i index.html.
import { render } from './generator.js';

export const INPUT = 48;

/** Lämnar tillbaka kontrollen till webbläsaren (fungerar även i bakgrundsflikar, till skillnad från rAF). */
export const yieldUI = () => new Promise(r => setTimeout(r, 0));

/** Pixlar i modellens storlek, cachade på fallet. Riktiga bilder har redan .px satt. */
export function pixelsOf(c) {
  if (!c.px) c.px = render(c, INPUT);
  return c.px;
}

// Tre faltningslager som letar mönster, sedan "global max pooling": för varje filter tas det
// starkaste svaret någonstans i bilden. Det passar knölar som kan sitta var som helst.
export function buildModel() {
  const m = tf.sequential();
  m.add(tf.layers.conv2d({ inputShape: [INPUT, INPUT, 1], filters: 8, kernelSize: 3, activation: 'relu', padding: 'same' }));
  m.add(tf.layers.maxPooling2d({ poolSize: 2 }));
  m.add(tf.layers.conv2d({ filters: 16, kernelSize: 3, activation: 'relu', padding: 'same' }));
  m.add(tf.layers.maxPooling2d({ poolSize: 2 }));
  m.add(tf.layers.conv2d({ filters: 32, kernelSize: 3, activation: 'relu', padding: 'same' }));
  m.add(tf.layers.globalMaxPooling2d({}));
  m.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));
  m.compile({ optimizer: tf.train.adam(0.005), loss: 'binaryCrossentropy', metrics: ['accuracy'] });
  return m;
}

/** Varje bild får medelvärde 0 och spridning 1 – det gör det mycket lättare för nätet att komma igång. */
function standardize(x) {
  const { mean, variance } = tf.moments(x, [1, 2, 3], true);
  return x.sub(mean).div(variance.sqrt().add(1e-5));
}

function stack(cases) {
  const n = cases.length, S = INPUT * INPUT;
  const buf = new Float32Array(n * S);
  cases.forEach((c, i) => buf.set(pixelsOf(c), i * S));
  return tf.tidy(() => standardize(tf.tensor4d(buf, [n, INPUT, INPUT, 1])));
}

function labels(cases) {
  return tf.tensor2d(cases.map(c => (c.malignant ? 1 : 0)), [cases.length, 1]);
}

/** Tränar och anropar onEpoch(epok, {loss, acc, val_loss, val_acc}) efter varje epok. */
export async function train(model, trainCases, valCases, epochs, onEpoch, shouldStop = () => false) {
  const xs = stack(trainCases), ys = labels(trainCases);
  const vx = stack(valCases), vy = labels(valCases);
  try {
    await model.fit(xs, ys, {
      epochs, batchSize: 16, shuffle: true, validationData: [vx, vy], yieldEvery: 'never',
      callbacks: {
        onEpochEnd: async (e, logs) => {
          await onEpoch(e, logs);
          if (shouldStop()) model.stopTraining = true;
          await yieldUI();
        },
      },
    });
  } finally {
    tf.dispose([xs, ys, vx, vy]);
  }
}

/** Sannolikhet för "elakartad" (0–1) per fall. */
export function predict(model, cases) {
  return tf.tidy(() => {
    const x = stack(cases);
    return Array.from(model.predict(x).dataSync());
  });
}

/**
 * Aktiveringskarta (CAM): sista faltningslagrets filterkartor, viktade med hur mycket varje filter
 * talar för "elakartad". Returnerar en INPUT×INPUT-karta (0–1) och modellens svar.
 */
const camModels = new WeakMap();
export function explain(model, px) {
  // Lagren är [..., sista faltningen, global max pooling, dense]
  if (!camModels.has(model)) camModels.set(model, tf.model({ inputs: model.inputs, outputs: model.layers.at(-3).output }));
  const sub = camModels.get(model);
  const w = model.layers.at(-1).getWeights()[0];
  const { map, base } = tf.tidy(() => {
    const x = standardize(tf.tensor4d(px, [1, INPUT, INPUT, 1]));
    const act = sub.predict(x);                          // [1, h, w, filter]
    const cam = tf.relu(act.mul(w.reshape([1, 1, 1, -1])).sum(-1, true));
    const big = tf.image.resizeBilinear(cam, [INPUT, INPUT]);
    const m = big.div(big.max().add(1e-6)).dataSync();
    return { map: Float32Array.from(m), base: model.predict(x).dataSync()[0] };
  });
  return { map, base };
}
