# Dnd Cult of Mimic — Battlefield Runtime Audit v4

База: `Dnd Cult of Mimic(20261002-054415).zip`

## Исправлено

- `BattlefieldCombatPanel.vue`: добавлен `getAttackReasonLabel()` и полный набор причин атаки. Убран runtime-ошибочный вызов несуществующей функции из шаблона.
- `BattlefieldTargetPanel.vue`: расширены подписи причин (`attacker-incapacitated`, `total-cover` и др.).
- `useBattlefieldCanvas.js`: выбор цели по наведению на токен в бою синхронизирован с `selectAttackTarget()`; состояние наведённой цели сбрасывается при выходе с карты и при выходе из боевого режима.
- `useBattlefieldCanvas.js`: сохранён реальный API `battlefield` store для движения (`getTokenMoveInfo`, `moveToken`) и рендеринга.
- `CombatSpellcasting.vue`: возвращён байт-в-байт к рабочей базе; механика заклинаний не изменялась. Ограничение размера/скролл остаётся на контейнере в `Battlefield.vue`.
- `Battlefield.vue`: панель заклинаний ограничена по высоте и прокручивается отдельно; остальные панели не изменены.

## Проверки

- `node --check` для всех `.js` в `app/`: OK.
- Проверка вызовов `store.*` из Battlefield/Canvas/Spellcasting против реально возвращаемых API store: OK.
- Проверка, что `CombatSpellcasting.vue` совпадает с исходной рабочей версией: OK.
- Проверка потенциально несуществующих функций в Battlefield-панелях: исправлен `getAttackReasonLabel` в `BattlefieldCombatPanel`.

## Ограничение среды

Полный `nuxt build` не выполнялся: установка platform-specific зависимостей (`rolldown`) в контейнерной Linux-среде упиралась в сетевой timeout. Поэтому браузерный runtime здесь не заявляется как полностью воспроизведённый.
