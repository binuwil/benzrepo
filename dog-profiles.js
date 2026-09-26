window.DOG_PROFILES = [
  {
    id: 'chihuahua',
    name: 'Chihuahua',
    portrait: { background: '#f4c2a1', fur: '#c7784e', shade: '#8d4a36', innerEar: '#e78f80', muzzle: '#f4d8bd', earType: 'upright', marking: 'cream' },
    pitch: 1.3,
    soundKey: 'puppy',
    soundLabel: 'Puppy Yip',
    description: 'Tiny companion; try a bright, higher-pitched yip.'
  },
  {
    id: 'cockapoo',
    name: 'Cockapoo',
    portrait: { background: '#f1d2a7', fur: '#b9713f', shade: '#80462f', innerEar: '#d88772', muzzle: '#f0d7b5', earType: 'floppy', marking: 'curls' },
    pitch: 1,
    soundKey: 'single',
    soundLabel: 'Classic Woof',
    description: 'A friendly medium-sized companion with a balanced bark.'
  },
  {
    id: 'german-shepherd',
    name: 'German Shepherd',
    portrait: { background: '#b9d6ca', fur: '#cf9454', shade: '#40362f', innerEar: '#8d5148', muzzle: '#d5a26a', earType: 'shepherd', marking: 'saddle' },
    pitch: 0.9,
    soundKey: 'breed_german_shepherd',
    soundLabel: 'German Shepherd Bark',
    description: 'A larger working breed with a full, clear bark.'
  },
  {
    id: 'bulldog',
    name: 'Bulldog',
    portrait: { background: '#d4c1ae', fur: '#d8b27c', shade: '#a47b52', innerEar: '#bd6d69', muzzle: '#f2e0c7', earType: 'folded', marking: 'wrinkles' },
    pitch: 0.85,
    soundKey: 'breed_bulldog',
    soundOffset: 8,
    soundLabel: 'Bulldog Bark',
    description: 'A compact, sturdy breed; start with a lower bark.'
  },
  {
    id: 'pit-bull',
    name: 'Pit Bull Terrier',
    portrait: { background: '#d7c0bd', fur: '#a67c67', shade: '#65483f', innerEar: '#c77e78', muzzle: '#eee0d4', earType: 'rose', marking: 'blaze' },
    pitch: 0.95,
    soundKey: 'woof',
    soundLabel: 'Deep Woof',
    description: 'A strong, athletic dog; try the shared deep-woof sample.'
  },
  {
    id: 'corgi',
    name: 'Pembroke Welsh Corgi',
    portrait: { background: '#edd1a7', fur: '#d38a45', shade: '#9e5834', innerEar: '#c96f68', muzzle: '#f4e3c6', earType: 'corgi', marking: 'blaze' },
    pitch: 1.15,
    soundKey: 'double',
    soundLabel: 'Double Bark',
    description: 'A small herding dog; try the shared double-bark sample.'
  },
  {
    id: 'terrier',
    name: 'Jack Russell Terrier',
    portrait: { background: '#c3d6c2', fur: '#f0e7d7', shade: '#bd7a45', innerEar: '#cf8c7c', muzzle: '#fff4e8', earType: 'terrier', marking: 'terrier' },
    pitch: 1.2,
    soundKey: 'breed_terrier',
    soundLabel: 'Terrier Bark',
    description: 'A lively terrier with a sharp, energetic bark.'
  }
];

window.createDogPortrait = function (profile) {
  const coat = profile.portrait;
  const ears = {
    upright: `<path d="M151 204C121 178 105 117 103 67C151 81 194 128 207 184Z" fill="${coat.fur}" stroke="${coat.shade}" stroke-width="10"/><path d="M361 204C391 178 407 117 409 67C361 81 318 128 305 184Z" fill="${coat.fur}" stroke="${coat.shade}" stroke-width="10"/><path d="M151 172C137 145 126 113 122 91C151 111 173 139 181 170Z" fill="${coat.innerEar}"/><path d="M361 172C375 145 386 113 390 91C361 111 339 139 331 170Z" fill="${coat.innerEar}"/>`,
    floppy: `<path d="M143 185C100 151 61 166 63 231C64 294 110 333 156 295L188 245Z" fill="${coat.fur}" stroke="${coat.shade}" stroke-width="10"/><path d="M369 185C412 151 451 166 449 231C448 294 402 333 356 295L324 245Z" fill="${coat.fur}" stroke="${coat.shade}" stroke-width="10"/><path d="M124 203C101 191 91 205 97 238C103 268 118 281 138 273Z" fill="${coat.innerEar}"/><path d="M388 203C411 191 421 205 415 238C409 268 394 281 374 273Z" fill="${coat.innerEar}"/>`,
    shepherd: `<path d="M149 198C128 163 118 95 127 52C173 79 205 132 210 183Z" fill="${coat.shade}" stroke="#342d2a" stroke-width="10"/><path d="M363 198C384 163 394 95 385 52C339 79 307 132 302 183Z" fill="${coat.shade}" stroke="#342d2a" stroke-width="10"/><path d="M157 157C148 127 144 99 146 79C169 101 184 126 188 154Z" fill="${coat.innerEar}"/><path d="M355 157C364 127 368 99 366 79C343 101 328 126 324 154Z" fill="${coat.innerEar}"/>`,
    folded: `<path d="M144 189C114 153 82 154 76 188C67 232 99 252 151 240L187 222Z" fill="${coat.fur}" stroke="${coat.shade}" stroke-width="10"/><path d="M368 189C398 153 430 154 436 188C445 232 413 252 361 240L325 222Z" fill="${coat.fur}" stroke="${coat.shade}" stroke-width="10"/><path d="M121 189C103 179 95 191 98 208C102 223 116 229 136 222Z" fill="${coat.innerEar}"/><path d="M391 189C409 179 417 191 414 208C410 223 396 229 376 222Z" fill="${coat.innerEar}"/>`,
    rose: `<path d="M148 195C119 161 91 165 82 196C73 228 101 247 154 235L188 217Z" fill="${coat.fur}" stroke="${coat.shade}" stroke-width="10"/><path d="M364 195C393 161 421 165 430 196C439 228 411 247 358 235L324 217Z" fill="${coat.fur}" stroke="${coat.shade}" stroke-width="10"/><path d="M120 192C106 184 99 194 103 207C108 219 120 221 138 214Z" fill="${coat.innerEar}"/><path d="M392 192C406 184 413 194 409 207C404 219 392 221 374 214Z" fill="${coat.innerEar}"/>`,
    corgi: `<path d="M145 199C119 170 91 111 99 60C150 79 194 128 207 184Z" fill="${coat.fur}" stroke="${coat.shade}" stroke-width="10"/><path d="M367 199C393 170 421 111 413 60C362 79 318 128 305 184Z" fill="${coat.fur}" stroke="${coat.shade}" stroke-width="10"/><path d="M145 165C130 138 119 108 119 87C149 108 168 135 179 164Z" fill="${coat.innerEar}"/><path d="M367 165C382 138 393 108 393 87C363 108 344 135 333 164Z" fill="${coat.innerEar}"/>`,
    terrier: `<path d="M147 194C111 156 76 166 77 211C78 253 111 274 159 246L187 222Z" fill="${coat.fur}" stroke="${coat.shade}" stroke-width="10"/><path d="M365 194C401 156 436 166 435 211C434 253 401 274 353 246L325 222Z" fill="${coat.fur}" stroke="${coat.shade}" stroke-width="10"/><path d="M124 196C105 183 96 194 102 214C108 231 120 235 139 223Z" fill="${coat.innerEar}"/><path d="M388 196C407 183 416 194 410 214C404 231 392 235 373 223Z" fill="${coat.innerEar}"/>`
  }[coat.earType];

  const markings = {
    cream: `<path d="M207 155C226 131 286 131 305 155C292 181 282 201 256 209C230 201 220 181 207 155Z" fill="${coat.muzzle}"/><path d="M149 260C168 238 193 239 208 259C198 284 174 297 153 284Z" fill="${coat.shade}" opacity=".85"/>`,
    curls: `<g fill="${coat.muzzle}" opacity=".85"><circle cx="169" cy="164" r="18"/><circle cx="199" cy="143" r="20"/><circle cx="232" cy="132" r="17"/><circle cx="270" cy="132" r="18"/><circle cx="306" cy="145" r="20"/><circle cx="340" cy="169" r="17"/><circle cx="139" cy="231" r="15"/><circle cx="373" cy="231" r="15"/></g>`,
    saddle: `<path d="M157 188C173 125 216 105 256 105C296 105 339 125 355 188C329 174 301 169 256 171C211 169 183 174 157 188Z" fill="${coat.shade}"/><path d="M211 198C225 179 287 179 301 198C289 220 279 232 256 238C233 232 223 220 211 198Z" fill="${coat.muzzle}"/>`,
    wrinkles: `<path d="M151 223Q194 204 230 220M282 220Q318 204 361 223M150 246Q190 231 221 243M291 243Q322 231 362 246" fill="none" stroke="${coat.shade}" stroke-width="8" stroke-linecap="round" opacity=".6"/>`,
    blaze: `<path d="M235 133Q256 120 277 133L293 245Q281 272 256 282Q231 272 219 245Z" fill="${coat.muzzle}"/>`,
    terrier: `<path d="M278 130C323 136 347 168 349 207C337 229 316 245 289 250C279 217 276 174 278 130Z" fill="${coat.shade}"/><path d="M232 132Q256 121 278 132L287 249Q274 274 256 282Q238 274 225 249Z" fill="${coat.muzzle}"/>`
  }[coat.marking];

  const bulldogSnout = coat.marking === 'wrinkles';
  const headShape = bulldogSnout
    ? 'M99 251C98 155 154 109 256 109C358 109 414 155 413 251C412 354 355 414 256 414C157 414 100 354 99 251Z'
    : 'M112 251C112 157 167 108 256 108C345 108 400 157 400 251C400 352 344 412 256 412C168 412 112 352 112 251Z';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${coat.background}"/><stop offset="1" stop-color="#fff1df"/></linearGradient></defs><rect width="512" height="512" rx="256" fill="url(#bg)"/><circle cx="83" cy="114" r="8" fill="#fff" opacity=".8"/><circle cx="424" cy="365" r="11" fill="#fff" opacity=".7"/><path d="M125 452Q144 386 204 377H308Q368 386 387 452Z" fill="${coat.shade}"/><path d="M144 447Q157 398 211 391H301Q355 398 368 447Z" fill="${coat.fur}"/><path d="M221 387H291L281 432H231Z" fill="${coat.muzzle}"/>${ears}<path d="${headShape}" fill="${coat.fur}" stroke="${coat.shade}" stroke-width="10" stroke-linejoin="round"/>${markings}<ellipse cx="194" cy="264" rx="22" ry="27" fill="#342c29"/><ellipse cx="318" cy="264" rx="22" ry="27" fill="#342c29"/><circle cx="201" cy="255" r="7" fill="#fff"/><circle cx="325" cy="255" r="7" fill="#fff"/><ellipse cx="168" cy="306" rx="23" ry="12" fill="#e79488" opacity=".5"/><ellipse cx="344" cy="306" rx="23" ry="12" fill="#e79488" opacity=".5"/><ellipse cx="256" cy="320" rx="79" ry="62" fill="${coat.muzzle}"/><ellipse cx="256" cy="296" rx="25" ry="18" fill="#342c29"/><path d="M256 313V339M256 339Q232 365 210 344M256 339Q280 365 302 344" fill="none" stroke="#5b3933" stroke-width="8" stroke-linecap="round"/><path d="M238 351Q256 341 274 351Q271 379 256 379Q241 379 238 351Z" fill="#e88d8d"/>${coat.marking === 'curls' ? `<g fill="none" stroke="${coat.shade}" stroke-width="5" opacity=".7"><path d="M163 203q-12-16 5-23q18 4 7 19M194 178q-12-16 5-23q18 4 7 19M319 179q-12-16 5-23q18 4 7 19M349 204q-12-16 5-23q18 4 7 19"/></g>` : ''}</svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};