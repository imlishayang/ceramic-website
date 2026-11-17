/**
 * lili.makes – hand-drawn shelf showcase
 *
 * Sections:
 *   1. Settings and content   (edit this part to add or change things)
 *   2. Drawings               (the ink line-art objects)
 *   3. Rendering the wall
 *   4. Detail panel
 *   5. Cart
 *   6. Routing                (each piece has its own link: #/piece/<id>)
 *   7. Wall interactions      (drag to look around, view switch)
 *   8. Start-up
 *
 * Content below is written by you, so it is inserted into the page as trusted
 * HTML. Text typed by visitors (the personalisation note) is escaped.
 */
'use strict';


/* ==========================================================================
   1. Settings and content
   ========================================================================== */

const SETTINGS = {
  siteName: 'lili.makes',
  contactEmail: 'hello@example.com',   // TODO: replace with your real address
  currency: '¥',
  maxMadeToOrder: 5,                   // most of one made-to-order piece per order
  dragThreshold: 5,                    // pixels moved before a click counts as a drag
  cartStorageKey: 'lili-makes-cart',
  // TODO: replace once online payment is set up (e.g. WeChat Pay or Alipay)
  checkoutNote: 'Payment is not online yet. Send your order and we will reply with payment details.',
};

const STATUS_LABELS = {
  'available': 'In stock',
  'made-to-order': 'Made to order',
  'sold': 'Sold',
};

// How wide each drawing is, relative to the base size in CSS (--unit)
const TYPE_WIDTH = {
  cup: 0.75, plate: 1.2, vase: 0.7, frame: 0.85,   // things you make
  books: 1, plant: 0.85, flowers: 0.5,             // decoration only
};

/**
 * The shelf boards. x and y are pixels on the wall (the wall is 2400 × 1200).
 * Things stand on the top edge of their shelf.
 */
const SHELVES = [
  { x: 310, y: 260, width: 980 },
  { x: 310, y: 620, width: 980 },
  { x: 310, y: 980, width: 980 },
  { x: 310, y: 1340, width: 980 },
];

/**
 * The things you sell. All text, prices and specs below are SAMPLE VALUES:
 * replace them with the real details of each piece.
 *
 * shelf          Which shelf it stands on (index into SHELVES above)
 * x              Where along that shelf, in pixels from the shelf's left end
 * scale          Size multiplier
 * status         'available', 'made-to-order' or 'sold'
 * stock          Optional. How many are in stock (default 1, one of a kind)
 * personalisation Optional. Shows a text box with this question above "Add to cart"
 * cutout         Optional. A transparent PNG/WebP shown on the shelf instead of the drawing
 * images         Optional. Photos for the detail panel, e.g. ['images/candle-vase-1.jpg']
 */
const PIECES = [
  {
    id: 'charm-cup-celadon',
    name: 'Charm cup',
    nameZh: '好运杯',
    type: 'cup',
    glaze: { name: 'Celadon', color: '#9fb5a0' },
    status: 'made-to-order',
    price: 168,
    shelf: 0, x: 110, scale: 1,
    story: 'A handpainted cup that can be personalised with a good luck charm of your choice.',
    specs: { Clay: 'Stoneware', Glaze: 'Celadon', Size: 'Ø 8 cm, H 7 cm', Technique: 'Handpainted' },
    personalisation: 'Which good luck charm would you like?',
    cutout: null,
    images: [],
  },
  {
    id: 'trinket-plate-ash',
    name: 'Trinket plate',
    nameZh: '小物盘',
    type: 'plate',
    glaze: { name: 'Ash white', color: '#e6e3d8' },
    status: 'available',
    price: 128,
    shelf: 1, x: 380, scale: 1,
    story: 'A shallow plate for rings, keys and small things that need a home.',
    specs: { Clay: 'Stoneware', Glaze: 'Ash white', Size: 'Ø 11 cm, H 2 cm', Technique: 'Hand-pressed' },
    cutout: null,
    images: [],
  },
  {
    id: 'charm-cup-indigo',
    name: 'Charm cup',
    nameZh: '好运杯',
    type: 'cup',
    glaze: { name: 'Indigo', color: '#4d6a8a' },
    status: 'available',
    price: 168,
    shelf: 1, x: 600, scale: 1,
    story: 'A handpainted cup that can be personalised with a good luck charm of your choice.',
    specs: { Clay: 'Stoneware', Glaze: 'Indigo', Size: 'Ø 8 cm, H 7 cm', Technique: 'Handpainted' },
    personalisation: 'Which good luck charm would you like?',
    cutout: null,
    images: [],
  },
  {
    id: 'hei-zi-sha-plate',
    name: 'Hei zi sha plate',
    nameZh: '黑紫砂盘',
    type: 'plate',
    glaze: { name: 'Black speckle', color: '#2a2521' },
    status: 'sold',
    price: 188,
    shelf: 2, x: 400, scale: 1.3,
    story: 'A dark, speckled plate fired from hei zi sha clay.',
    specs: { Clay: 'Hei zi sha', Glaze: 'Unglazed, speckled', Size: 'Ø 18 cm, H 2.5 cm', Technique: 'Hand-pressed' },
    cutout: null,
    images: [],
  },
  {
    id: 'charm-cup-oatmeal',
    name: 'Charm cup',
    nameZh: '好运杯',
    type: 'cup',
    glaze: { name: 'Oatmeal', color: '#cbbd9f' },
    status: 'available',
    price: 168,
    shelf: 2, x: 920, scale: 1,
    story: 'A handpainted cup that can be personalised with a good luck charm of your choice.',
    specs: { Clay: 'Stoneware', Glaze: 'Oatmeal', Size: 'Ø 8 cm, H 7 cm', Technique: 'Handpainted' },
    personalisation: 'Which good luck charm would you like?',
    cutout: null,
    images: [],
  },
  {
    id: 'ceramic-frame',
    name: 'Ceramic frame',
    nameZh: '陶瓷相框',
    type: 'frame',
    glaze: { name: 'Celadon', color: '#a9b8a8' },
    status: 'made-to-order',
    price: 148,
    shelf: 3, x: 160, scale: 1.15,
    story: 'A small ceramic frame for a photo you want to keep on your desk.',
    specs: { Clay: 'Stoneware', Glaze: 'Celadon', Size: '10 × 12 cm', Technique: 'Slab-built' },
    cutout: null,
    images: [],
  },
  {
    id: 'trinket-plate-oatmeal',
    name: 'Trinket plate',
    nameZh: '小物盘',
    type: 'plate',
    glaze: { name: 'Oatmeal', color: '#cbbd9f' },
    status: 'available',
    price: 118,
    shelf: 3, x: 680, scale: 0.9,
    story: 'A shallow plate for rings, keys and small things that need a home.',
    specs: { Clay: 'Stoneware', Glaze: 'Oatmeal', Size: 'Ø 10 cm, H 2 cm', Technique: 'Hand-pressed' },
    cutout: null,
    images: [],
  },
];

/** Decoration that makes the shelves feel lived in. Not clickable. */
const DECOR = [
  { type: 'books',   shelf: 0, x: 310, scale: 1 },
  { type: 'flowers', shelf: 0, x: 900, scale: 1 },
  { type: 'plant',   shelf: 1, x: 120, scale: 1 },
  { type: 'flowers', shelf: 1, x: 880, scale: 1 },
  { type: 'books',   shelf: 2, x: 700, scale: 1 },
  { type: 'plant',   shelf: 3, x: 420, scale: 1 },
  { type: 'flowers', shelf: 3, x: 900, scale: 1 },
  { type: 'books',   shelf: 3, x: 150, scale: 1 },
  { type: 'flowers', shelf: 3, x: 650, scale: 1 },
  { type: 'plant',   shelf: 3, x: 850, scale: 1 },
];

/**
 * Photo frames. Add a photo path to `photo` to fill a frame. Add a `pieceId`
 * (from PIECES) to make clicking the frame open that piece.
 */
const FRAMES = [
  { shelf: 0, x: 700, width: 150, height: 120, photo: null, pieceId: null, caption: 'your photo here' },
  { shelf: 1, x: 800, width: 120, height: 150, photo: null, pieceId: null, caption: 'your photo here' },
  { shelf: 2, x: 130, width: 140, height: 110, photo: null, pieceId: null, caption: 'your photo here' },
  { shelf: 3, x: 400, width: 150, height: 120, photo: null, pieceId: null, caption: 'your photo here' },
];

/** Handwritten notes on the wall. x and y are wall pixels. */
const NOTES = [
  { x: 1500, y: 40,   text: 'pick something up',           tilt: '1.5deg' },
  { x: 1500, y: 1060, text: 'more on the way',             tilt: '-1.5deg' },
];


/* ==========================================================================
   2. Drawings
   Marker-style line art. Ceramics get a light wash of their glaze colour.
   Each piece's photo replaces its drawing once photos are added.
   ========================================================================== */

const DRAWINGS = {
  cup: {
    viewBox: '0 4 120 104',
    markup: `
      <path class="ink glaze" d="M14 14C16 50 22 84 34 100Q40 106 60 106Q80 106 86 100C98 84 104 50 106 14Z"/>
      <ellipse class="ink glaze" cx="60" cy="14" rx="46" ry="9"/>
      <ellipse class="ink" cx="60" cy="14" rx="40" ry="6"/>
      <path class="ink-line" d="M19 52q7-8 14 0t14 0t14 0t14 0t14 0t10 0"/>`,
  },
  plate: {
    viewBox: '0 4 170 56',
    markup: `
      <path class="ink glaze" d="M5 30V36Q5 58 85 58Q165 58 165 36V30Z"/>
      <ellipse class="ink glaze" cx="85" cy="30" rx="80" ry="24"/>
      <ellipse class="ink-line" cx="85" cy="31" rx="54" ry="15"/>`,
  },
  vase: {
    viewBox: '0 0 100 136',
    markup: `
      <path class="ink glaze" d="M38 6H62V30C62 42 90 54 90 92C90 124 76 134 50 134C24 134 10 124 10 92C10 54 38 42 38 30Z"/>
      <ellipse class="ink glaze" cx="50" cy="6" rx="12" ry="4"/>
      <circle class="ink-dot" cx="34" cy="92" r="1.5"/>
      <circle class="ink-dot" cx="52" cy="104" r="1.5"/>
      <circle class="ink-dot" cx="66" cy="86" r="1.5"/>
      <circle class="ink-dot" cx="44" cy="72" r="1.5"/>
      <circle class="ink-dot" cx="62" cy="118" r="1.5"/>
      <circle class="ink-dot" cx="30" cy="112" r="1.5"/>`,
  },
  frame: {
    viewBox: '0 0 120 136',
    markup: `
      <rect class="ink glaze" x="6" y="6" width="108" height="128" rx="10"/>
      <rect class="ink" x="26" y="26" width="68" height="88" rx="4"/>
      <path class="ink-line" d="M34 100L52 74L66 92L76 80L86 100"/>`,
  },
  books: {
    viewBox: '0 0 130 70',
    markup: `
      <rect class="ink" x="6" y="46" width="118" height="20" rx="2"/>
      <rect class="ink" x="16" y="26" width="98" height="20" rx="2"/>
      <rect class="ink" x="4" y="6" width="104" height="20" rx="2"/>
      <path class="ink-line" d="M16 56H34M26 36H44M14 16H32"/>`,
  },
  plant: {
    viewBox: '0 0 120 150',
    markup: `
      <path class="ink-line" d="M60 92C60 70 56 50 40 28"/>
      <path class="ink" d="M40 28C22 30 14 48 22 62C40 62 48 46 40 28Z"/>
      <path class="ink" d="M62 70C60 40 76 22 96 20C102 44 88 68 62 70Z"/>
      <path class="ink" d="M58 58C50 38 54 18 70 6C82 26 74 48 58 58Z"/>
      <path class="ink" d="M26 92H94L86 140Q84 148 72 148H48Q36 148 34 140Z"/>
      <path class="ink-line" d="M32 112q7-7 14 0t14 0t14 0t12 0"/>`,
  },
  flowers: {
    viewBox: '0 0 70 130',
    markup: `
      <path class="ink-line" d="M35 76L20 26M35 76L36 10M35 76L52 30"/>
      <circle class="ink-dot" cx="20" cy="24" r="6"/>
      <circle class="ink-dot" cx="36" cy="8" r="6"/>
      <circle class="ink-dot" cx="52" cy="28" r="6"/>
      <path class="ink" d="M27 76H43V86C53 94 56 104 56 114Q56 128 35 128Q14 128 14 114C14 104 17 94 27 86Z"/>`,
  },
};

/** Returns the SVG drawing for a type. Pass `label` to make it readable by screen readers. */
function drawingSvg(type, { glaze = null, label = null } = {}) {
  const drawing = DRAWINGS[type];
  const a11y = label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"';
  const style = glaze ? `style="--glaze: ${glaze}"` : '';

  return `<svg class="drawing" viewBox="${drawing.viewBox}" ${a11y} ${style}>${drawing.markup}</svg>`;
}

/** A shelf board with two small brackets underneath. */
function shelfSvg(width) {
  return `
    <svg width="${width}" height="44" viewBox="0 0 ${width} 44">
      <path class="ink" d="M4 3L${width - 6} 2L${width - 2} 7L${width - 3} 20L${width - 8} 22L6 23L2 18L3 7Z"/>
      <rect class="ink" x="60" y="25" width="16" height="16" rx="2"/>
      <rect class="ink" x="${width - 76}" y="25" width="16" height="16" rx="2"/>
    </svg>`;
}


/* ==========================================================================
   3. Rendering the wall
   ========================================================================== */

const scene = document.getElementById('scene');
const shelvesLayer = document.getElementById('shelves');
const itemsLayer = document.getElementById('items');

/** "Charm cup, celadon" */
function describe(piece) {
  return `${piece.name}, ${piece.glaze.name.toLowerCase()}`;
}

function formatPrice(amount) {
  return `${SETTINGS.currency}${amount.toLocaleString('en-US')}`;
}

function routeFor(id) {
  return `#/piece/${encodeURIComponent(id)}`;
}

/** Wall position of a spot on a shelf. */
function shelfPoint(shelfIndex, offset) {
  const shelf = SHELVES[shelfIndex];
  return { x: shelf.x + offset, y: shelf.y };
}

function shelfTemplate(shelf) {
  return `<div class="shelf" style="--x: ${shelf.x}; --y: ${shelf.y}">${shelfSvg(shelf.width)}</div>`;
}

function noteTemplate(note) {
  return `<p class="wall-note" style="--x: ${note.x}; --y: ${note.y}; --tilt: ${note.tilt}">${note.text}</p>`;
}

function pieceTemplate(piece) {
  const { x, y } = shelfPoint(piece.shelf, piece.x);
  const size = (piece.scale * TYPE_WIDTH[piece.type]).toFixed(2);
  const price = piece.status === 'sold' ? 'Sold' : formatPrice(piece.price);

  const visual = piece.cutout
    ? `<img class="piece__image" src="${piece.cutout}" alt="" draggable="false">`
    : drawingSvg(piece.type, { glaze: piece.glaze.color });

  return `
    <li class="wall__item" style="--x: ${x}; --y: ${y}; --size: ${size}">
      <a class="piece" href="${routeFor(piece.id)}">
        <span class="piece__object">${visual}</span>
        <span class="piece__label">
          <span class="piece__name">${describe(piece)}</span>
          <span class="piece__price">${price}</span>
        </span>
      </a>
    </li>`;
}

function decorTemplate(item) {
  const { x, y } = shelfPoint(item.shelf, item.x);
  const size = (item.scale * TYPE_WIDTH[item.type]).toFixed(2);

  return `
    <li class="wall__item wall__item--decor" aria-hidden="true" style="--x: ${x}; --y: ${y}; --size: ${size}">
      <span class="piece__object">${drawingSvg(item.type)}</span>
    </li>`;
}

function frameTemplate(frame) {
  const { x, y } = shelfPoint(frame.shelf, frame.x);
  const inner = frame.photo
    ? `<img src="${frame.photo}" alt="" draggable="false">`
    : `<span class="frame__caption">${frame.caption}</span>`;
  const photo = `<span class="frame__photo">${inner}</span>`;

  const isLinked = Boolean(frame.pieceId && findPiece(frame.pieceId));
  const frameElement = isLinked
    ? `<a class="frame" href="${routeFor(frame.pieceId)}" aria-label="${describe(findPiece(frame.pieceId))}">${photo}</a>`
    : `<div class="frame">${photo}</div>`;

  const decorClass = isLinked ? '' : 'wall__item--decor';
  const hidden = isLinked || frame.photo ? '' : 'aria-hidden="true"';

  return `
    <li class="wall__item wall__item--frame ${decorClass}" ${hidden}
        style="--x: ${x}; --y: ${y}; --w: ${frame.width}; --h: ${frame.height}">
      ${frameElement}
    </li>`;
}

function renderWall() {
  shelvesLayer.innerHTML = SHELVES.map(shelfTemplate).join('') + NOTES.map(noteTemplate).join('');

  itemsLayer.innerHTML = [
    ...PIECES.map(pieceTemplate),
    ...DECOR.map(decorTemplate),
    ...FRAMES.map(frameTemplate),
  ].join('');
}


/* ==========================================================================
   4. Detail panel
   ========================================================================== */

const detail = {
  dialog: document.getElementById('detail'),
  close: document.getElementById('detail-close'),
  image: document.getElementById('detail-image'),
  thumbs: document.getElementById('detail-thumbs'),
  status: document.getElementById('detail-status'),
  title: document.getElementById('detail-title'),
  titleZh: document.getElementById('detail-title-zh'),
  price: document.getElementById('detail-price'),
  story: document.getElementById('detail-story'),
  specs: document.getElementById('detail-specs'),
  noteField: document.getElementById('detail-note-field'),
  noteLabel: document.getElementById('detail-note-label'),
  note: document.getElementById('detail-note'),
  add: document.getElementById('detail-add'),
  viewCart: document.getElementById('detail-view-cart'),
  enquire: document.getElementById('detail-enquire'),
  added: document.getElementById('detail-added'),
  prev: document.getElementById('detail-prev'),
  next: document.getElementById('detail-next'),
};

function findPiece(id) {
  return PIECES.find((piece) => piece.id === id);
}

/** The piece `step` places away from `id`, wrapping around at the ends. */
function neighbour(id, step) {
  const index = PIECES.findIndex((piece) => piece.id === id);
  return PIECES[(index + step + PIECES.length) % PIECES.length];
}

function enquiryLink(piece) {
  const subject = encodeURIComponent(`Enquiry: ${describe(piece)}`);
  const body = encodeURIComponent(`Hi, I'd like to ask about the ${describe(piece)}.`);
  return `mailto:${SETTINGS.contactEmail}?subject=${subject}&body=${body}`;
}

function renderGallery(piece) {
  const photos = piece.images;

  detail.image.innerHTML = photos.length
    ? `<img src="${photos[0]}" alt="${describe(piece)}">`
    : drawingSvg(piece.type, { glaze: piece.glaze.color, label: describe(piece) });

  // Thumbnails only make sense when there is more than one photo
  detail.thumbs.innerHTML = photos.length > 1
    ? photos.map((src, index) => `
        <button type="button" class="thumb" data-index="${index}" aria-label="Show photo ${index + 1}">
          <img src="${src}" alt="">
        </button>`).join('')
    : '';
}

/** Price, note box and buttons. Called again whenever the cart changes. */
function renderPurchase(piece) {
  const isSold = piece.status === 'sold';
  const line = findLine(piece.id);
  const isAtMax = Boolean(line) && line.quantity >= maxQuantity(piece);

  detail.price.textContent = isSold ? 'Sold' : formatPrice(piece.price);
  detail.noteField.hidden = isSold || !piece.personalisation;
  detail.add.hidden = isSold;
  detail.add.disabled = isAtMax;
  detail.add.textContent = !line ? 'Add to cart' : isAtMax ? 'In your cart' : 'Add one more';
  detail.viewCart.hidden = !line;
}

function fillDetail(piece) {
  detail.status.textContent = STATUS_LABELS[piece.status];
  detail.title.textContent = piece.name;
  detail.titleZh.textContent = piece.nameZh;
  detail.story.textContent = piece.story;
  detail.specs.innerHTML = Object.entries(piece.specs)
    .map(([label, value]) => `<dt>${label}</dt><dd>${value}</dd>`)
    .join('');

  detail.noteLabel.textContent = piece.personalisation || '';
  detail.note.value = findLine(piece.id)?.note || '';
  detail.added.textContent = '';

  detail.enquire.href = enquiryLink(piece);
  detail.prev.href = routeFor(neighbour(piece.id, -1).id);
  detail.next.href = routeFor(neighbour(piece.id, 1).id);

  renderGallery(piece);
  renderPurchase(piece);
  document.title = `${describe(piece)} · ${SETTINGS.siteName}`;
}

function showDetail(piece) {
  fillDetail(piece);
  if (!detail.dialog.open) detail.dialog.showModal();
  detail.dialog.scrollTop = 0;
}

function hideDetail() {
  if (detail.dialog.open) detail.dialog.close();
  document.title = SETTINGS.siteName;
}

// Thumbnails swap the large photo
detail.thumbs.addEventListener('click', (event) => {
  const thumb = event.target.closest('.thumb');
  const piece = findPiece(getRoutePieceId());
  const photo = detail.image.querySelector('img');
  if (thumb && piece && photo) photo.src = piece.images[Number(thumb.dataset.index)];
});

detail.add.addEventListener('click', () => {
  const piece = findPiece(getRoutePieceId());
  if (!piece) return;

  addToCart(piece, detail.note.value.trim());
  detail.added.textContent = 'Added to your cart.';
});

detail.viewCart.addEventListener('click', openCart);


/* ==========================================================================
   5. Cart
   The cart lives in this browser (localStorage). Checkout sends an order
   request by email until online payment is added.
   ========================================================================== */

const cartEls = {
  dialog: document.getElementById('cart'),
  button: document.getElementById('cart-button'),
  count: document.getElementById('cart-count'),
  close: document.getElementById('cart-close'),
  empty: document.getElementById('cart-empty'),
  lines: document.getElementById('cart-lines'),
  footer: document.getElementById('cart-footer'),
  total: document.getElementById('cart-total'),
  checkout: document.getElementById('cart-checkout'),
  note: document.getElementById('cart-note'),
};

/** Each cart line looks like { id, quantity, note } */
let cart = loadCart();

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (char) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]
  ));
}

function maxQuantity(piece) {
  return piece.status === 'made-to-order' ? SETTINGS.maxMadeToOrder : (piece.stock ?? 1);
}

function findLine(id) {
  return cart.find((line) => line.id === id);
}

function cartCount() {
  return cart.reduce((sum, line) => sum + line.quantity, 0);
}

function cartTotal() {
  return cart.reduce((sum, line) => sum + findPiece(line.id).price * line.quantity, 0);
}

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS.cartStorageKey)) || [];

    // Drop anything that is no longer for sale, and keep quantities in range
    return saved
      .filter((line) => findPiece(line.id) && findPiece(line.id).status !== 'sold')
      .map((line) => ({
        id: line.id,
        quantity: Math.min(Math.max(1, line.quantity), maxQuantity(findPiece(line.id))),
        note: String(line.note || ''),
      }));
  } catch {
    return [];
  }
}

function saveCart() {
  try {
    localStorage.setItem(SETTINGS.cartStorageKey, JSON.stringify(cart));
  } catch {
    // Storage can be blocked (private browsing). The cart still works until the page closes.
  }
}

/** Saves the cart and refreshes everything that shows it. */
function updateCart() {
  saveCart();
  renderCartButton();
  renderCart();

  const openPiece = detail.dialog.open ? findPiece(getRoutePieceId()) : null;
  if (openPiece) renderPurchase(openPiece);
}

function addToCart(piece, note) {
  const line = findLine(piece.id);

  if (!line) {
    cart.push({ id: piece.id, quantity: 1, note });
  } else {
    line.quantity = Math.min(maxQuantity(piece), line.quantity + 1);
    if (note) line.note = note;
  }

  updateCart();
}

function changeQuantity(id, step) {
  const line = findLine(id);
  if (!line) return;

  line.quantity = Math.min(maxQuantity(findPiece(id)), Math.max(1, line.quantity + step));
  updateCart();
}

function removeFromCart(id) {
  cart = cart.filter((line) => line.id !== id);
  updateCart();
}

function renderCartButton() {
  const count = cartCount();

  cartEls.count.textContent = count;
  cartEls.count.classList.toggle('has-items', count > 0);
  cartEls.button.setAttribute('aria-label', `Cart, ${count} ${count === 1 ? 'item' : 'items'}`);
}

function lineTemplate(line) {
  const piece = findPiece(line.id);
  const max = maxQuantity(piece);

  const quantityControls = max > 1
    ? `<div class="qty">
         <button type="button" data-action="decrease" aria-label="One fewer" ${line.quantity <= 1 ? 'disabled' : ''}>−</button>
         <span>${line.quantity}</span>
         <button type="button" data-action="increase" aria-label="One more" ${line.quantity >= max ? 'disabled' : ''}>+</button>
       </div>`
    : '';

  return `
    <li class="cart-line" data-id="${piece.id}">
      <p class="cart-line__name">${describe(piece)}</p>
      <p class="cart-line__price">${formatPrice(piece.price * line.quantity)}</p>
      ${line.note ? `<p class="cart-line__note">Note: ${escapeHtml(line.note)}</p>` : ''}
      <div class="cart-line__controls">
        ${quantityControls}
        <button type="button" class="link-button" data-action="remove">Remove</button>
      </div>
    </li>`;
}

function checkoutLink() {
  const lines = cart.map((line) => {
    const piece = findPiece(line.id);
    const note = line.note ? ` (note: ${line.note})` : '';
    return `- ${describe(piece)} x ${line.quantity}, ${formatPrice(piece.price * line.quantity)}${note}`;
  });

  const body = [
    'Hi, I would like to order:',
    '',
    ...lines,
    '',
    `Total: ${formatPrice(cartTotal())}`,
    '',
    'My name and delivery address:',
  ].join('\n');

  return `mailto:${SETTINGS.contactEmail}?subject=${encodeURIComponent('Order request')}&body=${encodeURIComponent(body)}`;
}

function renderCart() {
  const hasItems = cart.length > 0;

  cartEls.empty.hidden = hasItems;
  cartEls.lines.hidden = !hasItems;
  cartEls.footer.hidden = !hasItems;

  cartEls.lines.innerHTML = cart.map(lineTemplate).join('');
  cartEls.total.textContent = formatPrice(cartTotal());
  cartEls.checkout.href = checkoutLink();
  cartEls.note.textContent = SETTINGS.checkoutNote;
}

function openCart() {
  if (detail.dialog.open) detail.dialog.close();
  renderCart();
  cartEls.dialog.showModal();
}

cartEls.button.addEventListener('click', openCart);
cartEls.close.addEventListener('click', () => cartEls.dialog.close());

// Clicking the dark backdrop closes the drawer (the drawer itself has no padding)
cartEls.dialog.addEventListener('click', (event) => {
  if (event.target === cartEls.dialog) cartEls.dialog.close();
});

cartEls.lines.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (!button) return;

  const { id } = button.closest('.cart-line').dataset;
  if (button.dataset.action === 'increase') changeQuantity(id, 1);
  if (button.dataset.action === 'decrease') changeQuantity(id, -1);
  if (button.dataset.action === 'remove') removeFromCart(id);
});


/* ==========================================================================
   6. Routing
   Every piece has its own link (e.g. index.html#/piece/candle-vase) that can
   be shared on Xiaohongshu, Instagram or WeChat. The browser back button
   closes the detail panel.
   ========================================================================== */

const ROUTE_PREFIX = '#/piece/';

function getRoutePieceId() {
  return location.hash.startsWith(ROUTE_PREFIX)
    ? decodeURIComponent(location.hash.slice(ROUTE_PREFIX.length))
    : null;
}

function handleRoute() {
  const piece = findPiece(getRoutePieceId());

  if (piece) {
    showDetail(piece);
  } else {
    hideDetail();
  }
}

// Esc and the Close button end up here: close the panel, then clear the link
detail.dialog.addEventListener('close', () => {
  if (getRoutePieceId()) location.hash = '#/';
});

detail.close.addEventListener('click', () => detail.dialog.close());

// Clicking the dark backdrop closes the panel (the panel itself has no padding)
detail.dialog.addEventListener('click', (event) => {
  if (event.target === detail.dialog) detail.dialog.close();
});

// Left and right arrow keys move between pieces (but not while typing)
document.addEventListener('keydown', (event) => {
  const id = getRoutePieceId();
  if (!detail.dialog.open || !id || event.target.matches('input, textarea')) return;

  if (event.key === 'ArrowLeft') location.hash = routeFor(neighbour(id, -1).id);
  if (event.key === 'ArrowRight') location.hash = routeFor(neighbour(id, 1).id);
});

window.addEventListener('hashchange', handleRoute);


/* ==========================================================================
   7. Wall interactions
   ========================================================================== */

const viewButtons = document.querySelectorAll('.view-toggle__button');

function isListView() {
  return document.body.dataset.view === 'list';
}

function setView(view) {
  document.body.dataset.view = view;

  viewButtons.forEach((button) => {
    const isActive = button.dataset.view === view;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
}

/**
 * Mouse users can drag the wall in any direction. Touch screens already
 * scroll natively, and the arrow keys work when the wall has focus.
 */
function enableDragScroll() {
  let isPointerDown = false;
  let hasDragged = false;
  let start = { x: 0, y: 0, left: 0, top: 0 };

  scene.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'mouse' || event.button !== 0 || isListView()) return;

    isPointerDown = true;
    hasDragged = false;
    start = { x: event.clientX, y: event.clientY, left: scene.scrollLeft, top: scene.scrollTop };
  });

  window.addEventListener('pointermove', (event) => {
    if (!isPointerDown) return;

    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.hypot(dx, dy) > SETTINGS.dragThreshold) hasDragged = true;

    if (hasDragged) {
      scene.classList.add('is-dragging');
      scene.scrollLeft = start.left - dx;
      scene.scrollTop = start.top - dy;
    }
  });

  window.addEventListener('pointerup', () => {
    isPointerDown = false;
    scene.classList.remove('is-dragging');
  });

  // A drag that ends on a piece must not open it
  scene.addEventListener('click', (event) => {
    const wasDrag = hasDragged;
    hasDragged = false;
    if (wasDrag) event.preventDefault();
  });
}

viewButtons.forEach((button) => {
  button.addEventListener('click', () => setView(button.dataset.view));
});


/* ==========================================================================
   8. Start-up
   ========================================================================== */

renderWall();
renderCartButton();
renderCart();
enableDragScroll();
handleRoute();   // opens a piece straight away if the link points to one
