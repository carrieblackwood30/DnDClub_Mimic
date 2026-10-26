
<template>
  <main
    class="mimic-home relative min-h-screen overflow-hidden text-stone-100"
    :class="{
      'cursor-eaten': cursorEaten,
      'mimic-chewing': cursorPhase === 'inside',
      'mimic-spitting': cursorPhase === 'spitting'
    }"
    @pointermove="trackEyes"
    @pointerleave="resetMimic"
  >
    <div class="ambient ambient-one"></div>
    <div class="ambient ambient-two"></div>
    <div class="dungeon-grid"></div>

    <header class="relative z-20 flex items-center justify-between border-b border-white/[0.07] px-6 py-5 sm:px-10 lg:px-16">
      <NuxtLink to="/" class="flex items-center gap-3">
        <div class="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-400/[0.06] text-amber-300">
          <svg viewBox="0 0 24 24" fill="none" class="h-7 w-7" stroke="currentColor" stroke-width="1.4">
            <path d="M12 2.5 20 7v10l-8 4.5L4 17V7l8-4.5Z"/>
            <path d="M8 10c2-2 6-2 8 0-1.5 1-2 2.5-2 4a2 2 0 0 1-4 0c0-1.5-.5-3-2-4Z"/>
            <circle cx="10" cy="10.5" r=".7" fill="currentColor"/>
            <circle cx="14" cy="10.5" r=".7" fill="currentColor"/>
          </svg>
        </div>

        <div>
          <div class="text-sm font-black tracking-[0.19em] sm:text-base">
            CULT <span class="text-amber-400">OF</span> MIMIC
          </div>
          <div class="mt-1 text-[9px] uppercase tracking-[0.25em] text-stone-500">
            Adventures await
          </div>
        </div>
      </NuxtLink>

      <NuxtLink
        to="/characters"
        class="group flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm text-stone-300 transition hover:border-amber-400/40 hover:text-amber-300"
      >
        <svg viewBox="0 0 24 24" fill="none" class="h-4 w-4" stroke="currentColor" stroke-width="1.6">
          <circle cx="12" cy="8" r="3.5"/>
          <path d="M5 20v-2a7 7 0 0 1 14 0v2"/>
        </svg>
        <span class="hidden sm:inline">Персонажи</span>
        <span class="transition-transform group-hover:translate-x-1">↗</span>
      </NuxtLink>
    </header>

    <section class="relative z-10 mx-auto grid min-h-[calc(100vh-145px)] max-w-[1400px] items-center gap-4 px-5 py-10 sm:px-10 lg:grid-cols-[1fr_1fr] lg:px-16 lg:py-8">
      <div class="relative z-10 mx-auto w-full max-w-2xl text-center lg:mx-0 lg:text-left">
        <div class="mb-7 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.05] px-4 py-2">
          <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400"></span>
          <span class="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-300 sm:text-xs">
            Подземелье ждёт тебя
          </span>
        </div>

        <h1 class="text-5xl font-black uppercase leading-[0.98] tracking-[-0.045em] sm:text-7xl xl:text-8xl">
          Cult of
          <span class="title-gold mt-3 block pb-2">Mimic</span>
        </h1>

        <div class="mt-6 flex items-center justify-center gap-3 lg:justify-start">
          <span class="h-px w-10 bg-amber-500/60"></span>
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300/80">
            Твоя легенда начинается здесь
          </p>
          <span class="h-px w-10 bg-amber-500/60 lg:hidden"></span>
        </div>

        <p class="mx-auto mt-7 max-w-lg text-sm leading-7 text-stone-400 sm:text-base sm:leading-8 lg:mx-0">
          Забудь о безопасных сундуках. Собирай отряд, бросай кости и
          отправляйся навстречу приключениям. В этих подземельях даже
          сокровища могут попытаться тебя съесть.
        </p>

        <div class="mt-9 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
          <NuxtLink
            to="/characters"
            class="primary-button group inline-flex items-center justify-center gap-3 rounded-xl px-7 py-4 font-bold text-[#171009] transition duration-300 hover:-translate-y-1"
          >
            <svg viewBox="0 0 24 24" fill="none" class="h-5 w-5" stroke="currentColor" stroke-width="1.8">
              <path d="M12 3 4 7.5v9L12 21l8-4.5v-9L12 3Z"/>
              <path d="m10 8 5 4-5 4V8Z" fill="currentColor" stroke="none"/>
            </svg>
            Начать приключение
            <span class="transition-transform group-hover:translate-x-1">→</span>
          </NuxtLink>

          <NuxtLink
            to="/characters"
            class="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-7 py-4 font-medium text-stone-300 transition hover:border-amber-300/30 hover:bg-white/[0.06] hover:text-white"
          >
            <svg viewBox="0 0 24 24" fill="none" class="h-5 w-5" stroke="currentColor" stroke-width="1.6">
              <path d="M4 5.5 12 2l8 3.5v9L12 22l-8-7.5v-9Z"/>
              <path d="M4 5.5 12 10l8-4.5M12 10v12"/>
            </svg>
            Выбрать героя
          </NuxtLink>
        </div>

        <div class="mt-12 grid grid-cols-3 border-t border-white/[0.08] pt-6">
          <div class="pr-3">
            <div class="text-xl font-black text-amber-300 sm:text-2xl">D20</div>
            <div class="mt-2 text-[9px] uppercase tracking-[0.15em] text-stone-500 sm:text-[10px]">
              Броски костей
            </div>
          </div>
          <div class="border-x border-white/[0.08] px-3">
            <div class="text-xl font-black text-amber-300 sm:text-2xl">5e</div>
            <div class="mt-2 text-[9px] uppercase tracking-[0.15em] text-stone-500 sm:text-[10px]">
              D&D 2014
            </div>
          </div>
          <div class="pl-3">
            <div class="text-xl font-black text-amber-300 sm:text-2xl">∞</div>
            <div class="mt-2 text-[9px] uppercase tracking-[0.15em] text-stone-500 sm:text-[10px]">
              Новые истории
            </div>
          </div>
        </div>
      </div>

      <div
        class="mimic-stage relative mx-auto flex w-full max-w-[600px] items-center justify-center lg:min-h-[620px]"
        @pointermove="tiltMimic"
        @pointerleave="resetMimic"
      >
        <div class="rune-orbit"></div>
        <div class="rune-orbit rune-orbit-inner"></div>

        <div class="mimic-aura"></div>

        <div
          class="mimic-tilt relative z-10 w-full max-w-[540px]"
          :style="{
            transform: `perspective(1100px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`
          }"
        >
          <div class="mimic-float">
            <svg
              viewBox="0 0 520 460"
              xmlns="http://www.w3.org/2000/svg"
              class="mimic-art w-full overflow-visible"
              role="img"
              aria-label="Магический сундук-мимик с глазами, зубами и щупальцами"
            >
              <defs>
                <linearGradient id="woodFront" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#98603a"/>
                  <stop offset="45%" stop-color="#714128"/>
                  <stop offset="100%" stop-color="#392016"/>
                </linearGradient>

                <linearGradient id="woodTop" x1="0" y1="0" x2="0.8" y2="1">
                  <stop offset="0%" stop-color="#b9824c"/>
                  <stop offset="100%" stop-color="#704126"/>
                </linearGradient>

                <linearGradient id="woodSide" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stop-color="#57301e"/>
                  <stop offset="100%" stop-color="#241711"/>
                </linearGradient>

                <linearGradient id="goldMetal" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#ffe6a0"/>
                  <stop offset="45%" stop-color="#c99136"/>
                  <stop offset="100%" stop-color="#704314"/>
                </linearGradient>

                <linearGradient id="slime" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#a7f3d0"/>
                  <stop offset="50%" stop-color="#34d399"/>
                  <stop offset="100%" stop-color="#047857"/>
                </linearGradient>

                <radialGradient id="eyeGlow">
                  <stop offset="0%" stop-color="#d1fae5"/>
                  <stop offset="50%" stop-color="#34d399"/>
                  <stop offset="100%" stop-color="#059669"/>
                </radialGradient>

                <radialGradient id="mouthDark">
                  <stop offset="0%" stop-color="#180e13"/>
                  <stop offset="100%" stop-color="#050609"/>
                </radialGradient>

                <filter id="softGlow" x="-80%" y="-80%" width="260%" height="260%">
                  <feGaussianBlur stdDeviation="9"/>
                </filter>

                <filter id="smallGlow" x="-60%" y="-60%" width="220%" height="220%">
                  <feGaussianBlur stdDeviation="3"/>
                </filter>
              </defs>

              <ellipse cx="275" cy="390" rx="160" ry="25" fill="#000" opacity=".65"/>
              <ellipse cx="275" cy="384" rx="124" ry="12" fill="#10b981" opacity=".24" filter="url(#softGlow)"/>

              <g class="mimic-limbs">
                <path d="M158 283 C119 292 116 325 91 338 C70 349 55 333 66 319"
                  fill="none" stroke="#39241b" stroke-width="25" stroke-linecap="round"/>
                <path d="M158 283 C119 292 116 325 91 338 C70 349 55 333 66 319"
                  fill="none" stroke="#8b5732" stroke-width="12" stroke-linecap="round"/>
                <path d="M72 318 58 305M74 322 60 333M78 322 76 340"
                  fill="none" stroke="#b98348" stroke-width="5" stroke-linecap="round"/>

                <path d="M375 278 C421 260 443 287 432 309 C426 321 413 317 418 305"
                  fill="none" stroke="#39241b" stroke-width="24" stroke-linecap="round"/>
                <path d="M375 278 C421 260 443 287 432 309 C426 321 413 317 418 305"
                  fill="none" stroke="#8b5732" stroke-width="12" stroke-linecap="round"/>
                <path d="M418 305 437 297M420 309 441 312M414 311 427 327"
                  fill="none" stroke="#b98348" stroke-width="5" stroke-linecap="round"/>

                <path d="M185 315 C177 345 151 352 151 371 C151 381 166 383 174 373"
                  fill="none" stroke="#2a1914" stroke-width="28" stroke-linecap="round"/>
                <path d="M185 315 C177 345 151 352 151 371"
                  fill="none" stroke="#885332" stroke-width="14" stroke-linecap="round"/>

                <path d="M342 314 C354 344 384 349 383 371 C382 382 367 382 360 372"
                  fill="none" stroke="#2a1914" stroke-width="28" stroke-linecap="round"/>
                <path d="M342 314 C354 344 384 349 383 371"
                  fill="none" stroke="#885332" stroke-width="14" stroke-linecap="round"/>

                <path d="M168 366 151 377M169 372 162 386M376 368 390 378M372 374 379 388"
                  stroke="#c18a4c" stroke-width="6" stroke-linecap="round"/>
              </g>

              <g class="mimic-float">
                <path d="M353 208 405 177 425 293 376 324Z" fill="url(#woodSide)" stroke="#3b2516" stroke-width="3"/>
                <path d="M364 221 403 198 415 283 380 304Z" fill="#51301d" opacity=".65"/>

                <path d="M126 222 355 207 376 318 146 345Z"
                  fill="url(#woodFront)" stroke="#29170f" stroke-width="4"/>

                <path d="M144 238 355 225 368 307 159 330Z"
                  fill="none" stroke="#c18a4c" stroke-width="5" opacity=".75"/>

                <path d="M160 237 174 331M218 233 230 324M280 230 291 317M338 227 349 311"
                  stroke="#3b2116" stroke-width="6" opacity=".72"/>

                <path d="M162 243 174 324M221 239 232 318M282 235 293 311M340 232 351 305"
                  stroke="#b47a44" stroke-width="2" opacity=".55"/>

                <path d="M126 222 355 207 376 228 145 246Z" fill="#c18a4c" stroke="#e6b568" stroke-width="2"/>

                <path d="M124 161 357 161 403 113 171 113Z"
                  fill="url(#woodTop)" stroke="#3d2417" stroke-width="4"/>

                <path d="M124 161 357 161 357 204 124 204Z"
                  fill="url(#woodFront)" stroke="#3d2417" stroke-width="4"/>

                <path d="M357 161 403 113 403 153 357 204Z"
                  fill="url(#woodSide)" stroke="#3d2417" stroke-width="4"/>

                <path d="M139 159 355 159 389 124"
                  fill="none" stroke="#d7a45d" stroke-width="4" opacity=".8"/>

                <path d="M143 171 143 194M339 171 339 194"
                  stroke="#d5a15b" stroke-width="4"/>

                <path d="M155 122 185 119M193 120 225 118M241 117 270 116"
                  stroke="#d7a45d" stroke-width="3" stroke-linecap="round" opacity=".7"/>

                <g class="mimic-third-eye">
                  <ellipse
                    cx="249"
                    cy="139"
                    rx="17"
                    ry="12"
                    fill="#10b981"
                    opacity=".25"
                    filter="url(#smallGlow)"
                  />

                  <path
                    d="M232 139 C237 127 259 127 266 139 C259 150 239 151 232 139Z"
                    fill="#241812"
                    stroke="#d6a65d"
                    stroke-width="2.5"
                  />

                  <path
                    d="M237 138 Q249 128 261 138"
                    fill="none"
                    stroke="#f4d18a"
                    stroke-width="1.5"
                  />

                  <g :transform="`translate(${eyeX} ${eyeY})`">
                    <ellipse
                      cx="249"
                      cy="139"
                      rx="8"
                      ry="7"
                      fill="url(#eyeGlow)"
                    />
                    <ellipse
                      cx="251"
                      cy="139"
                      rx="2.8"
                      ry="5.5"
                      fill="#081510"
                    />
                    <circle cx="246" cy="136" r="2.2" fill="#ecfdf5" />
                  </g>
                </g>
                
                <g class="mimic-eyes">
                  <path
                    d="M189 176 C184 164 196 153 207 158 C219 163 217 177 208 184Z"
                    fill="#18231f"
                    stroke="#352218"
                    stroke-width="3"
                  />

                  <path
                    d="M271 169 C273 155 288 154 295 164 C301 174 291 184 281 182Z"
                    fill="#18231f"
                    stroke="#352218"
                    stroke-width="3"
                  />

                  <g :transform="`translate(${eyeX} ${eyeY})`">
                    <ellipse cx="202" cy="171" rx="9" ry="11" fill="url(#eyeGlow)" />
                    <ellipse cx="205" cy="170" rx="3.5" ry="8" fill="#081510" />
                    <circle cx="199" cy="166" r="2.5" fill="#ecfdf5" />

                    <ellipse cx="284" cy="169" rx="9" ry="11" fill="url(#eyeGlow)" />
                    <ellipse cx="287" cy="168" rx="3.5" ry="8" fill="#081510" />
                    <circle cx="281" cy="164" r="2.5" fill="#ecfdf5" />
                  </g>
                </g>
                
                <g class="mimic-mouth" :class="{ 'mouth-open': mouthOpen }">
                  <!-- Огромная полость рта -->
                  <path
                    class="mouth-cavity"
                    d="M128 202 L356 202 L377 238 L141 248 Z"
                    fill="url(#mouthDark)"
                    stroke="#25100e"
                    stroke-width="4"
                  />

                  <!-- Магическое свечение в глубине пасти -->
                  <path
                    class="mouth-inner-glow"
                    d="M141 206 L352 206 L366 235 L148 242 Z"
                    fill="#047857"
                    opacity="0"
                  />

                  <!-- Верхний ряд зубов -->
                  <g class="mouth-upper-teeth">
                    <path d="M144 204 L163 205 L154 229Z" fill="#fff0cb" />
                    <path d="M175 204 L194 204 L185 230Z" fill="#fff5dc" />
                    <path d="M207 203 L227 203 L216 231Z" fill="#e8dbc0" />
                    <path d="M241 203 L262 203 L251 230Z" fill="#fff5dc" />
                    <path d="M277 203 L297 203 L288 229Z" fill="#e8dbc0" />
                    <path d="M312 203 L332 202 L322 226Z" fill="#fff5dc" />
                    <path d="M341 202 L357 202 L350 225Z" fill="#fff0cb" />

                    <!-- Длинные клыки появляются при открытой пасти -->
                    <path
                      class="extra-fangs"
                      d="M162 203 L184 204 L171 258Z"
                      fill="#ffffff"
                    />
                    <path
                      class="extra-fangs"
                      d="M294 203 L316 202 L306 257Z"
                      fill="#ffffff"
                    />
                  </g>

                  <!-- Нижняя челюсть и зубы -->
                  <g class="mouth-lower-teeth">
                    <path d="M160 241 L178 218 L188 243Z" fill="#fff0cb" />
                    <path d="M211 243 L226 220 L239 244Z" fill="#fff5dc" />
                    <path d="M270 243 L283 220 L298 241Z" fill="#fff0cb" />
                    <path d="M322 240 L334 218 L348 239Z" fill="#fff5dc" />
                  </g>

                  <!-- Длинный раздвоенный язык -->
                  <g class="mouth-tongue">
                    <path
                      d="M236 243
                        C222 260 231 282 246 292
                        L251 304
                        L257 291
                        C277 278 272 258 259 244Z"
                      fill="#d93662"
                      stroke="#791d37"
                      stroke-width="3"
                    />

                    <path
                      d="M253 267 L251 295"
                      stroke="#fda4af"
                      stroke-width="2"
                      stroke-linecap="round"
                    />

                    <path
                      d="M245 292 L236 300 M257 291 L266 300"
                      stroke="#d93662"
                      stroke-width="5"
                      stroke-linecap="round"
                    />
                  </g>
                </g>

                <g class="mimic-metal">
                  <path d="M125 225 145 228 165 339 145 342Z" fill="url(#goldMetal)"/>
                  <path d="M340 211 359 210 379 319 360 321Z" fill="url(#goldMetal)"/>
                  <path d="M119 217 362 201 366 212 122 230Z" fill="url(#goldMetal)"/>

                  <rect x="221" y="257" width="42" height="47" rx="6"
                    transform="rotate(-4 221 257)" fill="url(#goldMetal)" stroke="#543116" stroke-width="3"/>
                  <rect x="230" y="265" width="24" height="28" rx="3"
                    transform="rotate(-4 230 265)" fill="#533016" stroke="#f4c76c" stroke-width="2"/>
                  <circle cx="242" cy="279" r="4" fill="#f8d889"/>

                  <circle cx="151" cy="251" r="4" fill="#ffe6a0" stroke="#6d4316" stroke-width="2"/>
                  <circle cx="356" cy="244" r="4" fill="#ffe6a0" stroke="#6d4316" stroke-width="2"/>
                  <circle cx="159" cy="316" r="4" fill="#ffe6a0" stroke="#6d4316" stroke-width="2"/>
                  <circle cx="369" cy="302" r="4" fill="#ffe6a0" stroke="#6d4316" stroke-width="2"/>
                </g>

                <g class="mimic-slime">
                  <path d="M137 195 C131 187 143 183 147 193 C153 205 147 211 140 208Z" fill="url(#slime)"/>
                  <path d="M326 196 C319 187 330 182 335 193 C341 204 336 210 329 208Z" fill="url(#slime)"/>
                  <path d="M389 166 C382 156 391 150 397 160 C402 170 395 175 389 166Z" fill="url(#slime)"/>
                  <circle cx="165" cy="198" r="3" fill="#a7f3d0"/>
                  <circle cx="314" cy="197" r="2.5" fill="#a7f3d0"/>
                </g>

                <g class="mimic-sparks" fill="#a7f3d0">
                  <path d="M102 161 106 171 116 175 106 179 102 189 98 179 88 175 98 171Z"/>
                  <path d="M412 230 415 237 422 240 415 243 412 250 409 243 402 240 409 237Z"/>
                  <circle cx="388" cy="90" r="3"/>
                  <circle cx="126" cy="111" r="2.5"/>
                  <circle cx="433" cy="174" r="2"/>
                </g>
              </g>
            </svg>
          </div>
        </div>

        <div class="mimic-shadow"></div>

        <div class="loot-label">
          <span class="loot-dot"></span>
          <div>
            <div class="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-300">
              Обнаружено сокровище
            </div>
            <div class="mt-1 text-xs text-stone-400">
              Не доверяй сундукам...
            </div>
          </div>
          <span class="ml-2 text-xl text-amber-300">?</span>
        </div>
      </div>
    </section>

    <footer class="relative z-10 border-t border-white/[0.07] px-6 py-5 text-center">
      <p class="text-[10px] uppercase tracking-[0.2em] text-stone-600">
        CULT OF MIMIC <span class="mx-2 text-amber-500">✦</span>
        Твоя легенда. Твои правила. Твоя судьба.
      </p>
    </footer>
      

  </main>
</template>


<script setup>
import { ref, onBeforeUnmount } from 'vue'

const tiltX = ref(0)
const tiltY = ref(0)
const eyeX = ref(0)
const eyeY = ref(0)
const mouthOpen = ref(false)

const cursorEaten = ref(false)
const cursorPhase = ref('idle')

let mouthArmed = true
let eatTimer = null
let spitTimer = null

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function tiltMimic(event) {
  if (event.pointerType === 'touch') return

  const rect = event.currentTarget.getBoundingClientRect()
  const x = (event.clientX - rect.left) / rect.width
  const y = (event.clientY - rect.top) / rect.height

  tiltY.value = (x - 0.5) * 16
  tiltX.value = (0.5 - y) * 12
}

function trackEyes(event) {
  if (event.pointerType === 'touch') return

  eyeX.value = clamp(
    (event.clientX / (window.innerWidth || 1) - 0.5) * 12,
    -6,
    6
  )

  eyeY.value = clamp(
    (event.clientY / (window.innerHeight || 1) - 0.5) * 10,
    -5,
    5
  )

  if (cursorEaten.value) return

  const art = event.currentTarget.querySelector('.mimic-art')
  if (!art) return

  const rect = art.getBoundingClientRect()
  const x = ((event.clientX - rect.left) / rect.width) * 520
  const y = ((event.clientY - rect.top) / rect.height) * 460

  const distance = Math.hypot(
    (x - 252) / 145,
    (y - 225) / 48
  )

  const insideArt =
    x >= 0 && x <= 520 &&
    y >= 0 && y <= 460

  if (!mouthArmed && distance > 1.15) {
    mouthArmed = true
  }

  mouthOpen.value = insideArt && distance < 0.83

  if (mouthOpen.value && mouthArmed) {
    swallowCursor()
  }
}

function swallowCursor() {
  if (cursorEaten.value || !mouthArmed) return

  mouthArmed = false
  cursorEaten.value = true
  cursorPhase.value = 'swallowing'
  mouthOpen.value = true

  eatTimer = window.setTimeout(() => {
    eatTimer = null

    if (!cursorEaten.value) return

    cursorPhase.value = 'inside'
    mouthOpen.value = false

    spitTimer = window.setTimeout(() => {
      spitTimer = null
      startSpitting()
    }, 520)
  }, 240)
}

function startSpitting() {
  if (!cursorEaten.value) return

  cursorPhase.value = 'spitting'
  mouthOpen.value = true

  spitTimer = window.setTimeout(() => {
    spitTimer = null
    finishSpitting()
  }, 360)
}

function finishSpitting() {
  cursorPhase.value = 'idle'
  mouthOpen.value = false
  cursorEaten.value = false
}

function resetTilt() {
  tiltX.value = 0
  tiltY.value = 0
}

function resetMimic() {
  if (cursorEaten.value) return

  resetTilt()
  eyeX.value = 0
  eyeY.value = 0
  mouthOpen.value = false
  mouthArmed = true
}

onBeforeUnmount(() => {
  if (eatTimer !== null) clearTimeout(eatTimer)
  if (spitTimer !== null) clearTimeout(spitTimer)
})
</script>

<style scoped>

/* Глаза двигаются плавно, но не отстают от курсора */
.mimic-eyes,
.mimic-third-eye {
  transition: transform 80ms linear;
}

/* Полость рта раскрывается вниз */
.mouth-cavity {
  transform-box: fill-box;
  transform-origin: center top;
  transition:
    transform 260ms cubic-bezier(.2, .8, .2, 1),
    d 260ms ease;
}

.mouth-open .mouth-cavity {
  transform: scaleY(2.1);
}

/* Зеленая магия становится видимой в глубине пасти */
.mouth-inner-glow {
  transform-box: fill-box;
  transform-origin: center top;
  transition: opacity 180ms ease, transform 260ms ease;
}

.mouth-open .mouth-inner-glow {
  opacity: 0.85;
  transform: scaleY(1.8);
}

/* Нижняя челюсть уходит вниз */
.mouth-lower-teeth {
  transform-box: fill-box;
  transform-origin: center top;
  transition: transform 260ms cubic-bezier(.2, .8, .2, 1);
}

.mouth-open .mouth-lower-teeth {
  transform: translateY(25px);
}

/* Язык вырывается наружу */
.mouth-tongue {
  transform-box: fill-box;
  transform-origin: center top;
  transition: transform 280ms cubic-bezier(.2, .8, .2, 1);
}

.mouth-open .mouth-tongue {
  transform: translateY(24px) scale(1.12);
}

/* При открытии появляются дополнительные клыки */
.extra-fangs {
  opacity: 0;
  transform-box: fill-box;
  transform-origin: center top;
  transition: opacity 120ms ease;
}

.mouth-open .extra-fangs {
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .mouth-cavity,
  .mouth-inner-glow,
  .mouth-lower-teeth,
  .mouth-tongue,
  .extra-fangs {
    transition: none;
  }
}

.mimic-home {
  isolation: isolate;
  background:
    radial-gradient(ellipse at 76% 44%, rgba(5, 150, 105, 0.10), transparent 36%),
    radial-gradient(ellipse at 16% 15%, rgba(180, 83, 9, 0.09), transparent 35%),
    #0a090c;
}

.ambient {
  position: absolute;
  z-index: -1;
  width: 420px;
  height: 420px;
  border-radius: 50%;
  filter: blur(100px);
  pointer-events: none;
  opacity: 0.15;
}

.ambient-one {
  top: 16%;
  right: -220px;
  background: #10b981;
}

.ambient-two {
  bottom: -240px;
  left: 18%;
  background: #b45309;
}

.dungeon-grid {
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  opacity: 0.12;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
  background-size: 56px 56px;
  mask-image: linear-gradient(to bottom, black, transparent 90%);
}

.title-gold {
  background: linear-gradient(100deg, #fef3c7 0%, #fbbf24 36%, #d97706 72%, #fcd34d 100%);
  background-size: 200% auto;
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  animation: gold-shimmer 7s linear infinite;
  filter: drop-shadow(0 8px 35px rgba(217, 119, 6, 0.13));
}

.primary-button {
  background: linear-gradient(110deg, #facc15, #f59e0b 55%, #d97706);
  box-shadow: 0 8px 35px rgba(217, 119, 6, 0.15);
}

.primary-button:hover {
  box-shadow: 0 12px 45px rgba(245, 158, 11, 0.3);
}

.mimic-stage {
  @pointermove ="tiltMimic";
  @pointerleave ="resetTilt";
}

.mimic-tilt {
  transform-style: preserve-3d;
  transition: transform 180ms ease-out;
  will-change: transform;
}

.mimic-float {
  transform-style: preserve-3d;
  animation: mimic-float 5s ease-in-out infinite;
}

.mimic-art {
  overflow: visible;
  filter: drop-shadow(0 25px 22px rgba(0, 0, 0, 0.4));
}

.mimic-aura {
  position: absolute;
  z-index: 0;
  width: 62%;
  aspect-ratio: 1;
  top: 46%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: rgba(16, 185, 129, 0.11);
  filter: blur(75px);
  animation: aura-pulse 4s ease-in-out infinite;
  pointer-events: none;
}

.rune-orbit {
  position: absolute;
  z-index: 0;
  top: 49%;
  left: 50%;
  width: 82%;
  aspect-ratio: 1;
  border: 1px solid rgba(52, 211, 153, 0.13);
  border-radius: 50%;
  transform: translate(-50%, -50%) rotateX(65deg);
  box-shadow: 0 0 24px rgba(16, 185, 129, 0.04);
  animation: orbit-spin 32s linear infinite;
  pointer-events: none;
}

.rune-orbit::before,
.rune-orbit::after {
  position: absolute;
  content: "✧";
  color: rgba(110, 231, 183, 0.65);
  font-size: 22px;
}

.rune-orbit::before {
  top: 8%;
  left: 17%;
}

.rune-orbit::after {
  right: 14%;
  bottom: 12%;
}

.rune-orbit-inner {
  width: 67%;
  border-color: rgba(245, 158, 11, 0.13);
  animation-duration: 24s;
  animation-direction: reverse;
}

.mimic-shadow {
  position: absolute;
  bottom: 9%;
  left: 50%;
  width: 45%;
  height: 24px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.65);
  filter: blur(15px);
  transform: translateX(-50%);
  animation: shadow-breathe 5s ease-in-out infinite;
}

.loot-label {
  position: absolute;
  z-index: 12;
  right: 1%;
  bottom: 10%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px 15px;
  border: 1px solid rgba(52, 211, 153, 0.17);
  border-radius: 12px;
  background: rgba(12, 15, 15, 0.86);
  box-shadow: 0 15px 45px rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(12px);
  animation: label-float 5s ease-in-out infinite;
}

.loot-dot {
  width: 8px;
  height: 8px;
  flex: 0 0 auto;
  border-radius: 50%;
  background: #34d399;
  box-shadow: 0 0 12px rgba(52, 211, 153, 0.8);
}

.mimic-tongue {
  transform-box: fill-box;
  transform-origin: center top;
  animation: tongue-wiggle 3s ease-in-out infinite;
}


.mimic-eyes {
  transform-box: fill-box;
  transform-origin: center;
}

.mimic-mouth {
  transform-box: fill-box;
  transform-origin: center;
  transition: transform 180ms ease-out;
}

.mimic-mouth.mouth-open {
  transform: translateY(7px) scaleY(1.32);
}

.mimic-sparks {
  animation: spark-pulse 2.8s ease-in-out infinite;
}

@keyframes mimic-float {
  0%, 100% {
    transform: translateY(0) rotateZ(-1deg);
  }
  50% {
    transform: translateY(-17px) rotateZ(1deg);
  }
}

@keyframes shadow-breathe {
  0%, 100% {
    opacity: 0.65;
    transform: translateX(-50%) scale(1);
  }
  50% {
    opacity: 0.35;
    transform: translateX(-50%) scale(0.8);
  }
}

@keyframes aura-pulse {
  0%, 100% {
    opacity: 0.55;
    transform: translate(-50%, -50%) scale(0.9);
  }
  50% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.12);
  }
}

@keyframes orbit-spin {
  from {
    transform: translate(-50%, -50%) rotateX(65deg) rotateZ(0deg);
  }
  to {
    transform: translate(-50%, -50%) rotateX(65deg) rotateZ(360deg);
  }
}

@keyframes label-float {
  0%, 100% {
    translate: 0 0;
  }
  50% {
    translate: 0 -6px;
  }
}

@keyframes tongue-wiggle {
  0%, 80%, 100% {
    transform: rotate(0deg);
  }
  87% {
    transform: rotate(9deg);
  }
  94% {
    transform: rotate(-7deg);
  }
}

@keyframes eyes-look {
  0%, 40%, 46%, 100% {
    translate: 0 0;
  }
  43% {
    translate: 5px 1px;
  }
}

@keyframes spark-pulse {
  0%, 100% {
    opacity: 0.55;
  }
  50% {
    opacity: 1;
  }
}

@keyframes gold-shimmer {
  from {
    background-position: 0% center;
  }
  to {
    background-position: 200% center;
  }
}

@media (min-width: 1024px) {
  .mimic-stage {
    min-height: 620px;
  }
}

@media (max-width: 640px) {
  .mimic-stage {
    min-height: 300px;
    max-width: 470px;
  }

  .loot-label {
    right: 0;
    bottom: 1%;
    transform: scale(0.88);
    transform-origin: bottom right;
  }

  .rune-orbit {
    width: 90%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .mimic-float,
  .mimic-shadow,
  .mimic-aura,
  .rune-orbit,
  .loot-label,
  .mimic-tongue,
  .mimic-eyes,
  .mimic-sparks,
  .title-gold {
    animation: none;
  }

  .mimic-tilt {
    transition: none;
  }
}


.cursor-eaten,
.cursor-eaten * {
  cursor: none !important;
}


.cursor-eaten,
.cursor-eaten * {
  cursor: none !important;
}

.mimic-chewing .mimic-art {
  animation: mimic-chew 140ms ease-in-out 4;
}

.mimic-spitting .mimic-art {
  animation: mimic-spit 360ms cubic-bezier(.2, .9, .3, 1) both;
}

@keyframes mimic-chew {
  0%, 100% {
    transform: rotate(0) scale(1);
  }

  35% {
    transform: rotate(-1.4deg) scale(1.025, .95);
  }

  70% {
    transform: rotate(1.2deg) scale(.98, 1.035);
  }
}

@keyframes mimic-spit {
  0% {
    transform: translateY(0) scale(1);
  }

  30% {
    transform: translateY(-15px) scale(1.04);
  }

  65% {
    transform: translateY(5px) scale(.98, 1.02);
  }

  100% {
    transform: translateY(0) scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .mimic-chewing .mimic-art,
  .mimic-spitting .mimic-art {
    animation: none;
  }
}

</style>