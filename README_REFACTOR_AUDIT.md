# Dnd Cult of Mimic — Battlefield refactor repair

База: Dnd Cult of Mimic(20261002-054415)

Проверено и исправлено:

- Pixi host передаётся как HTMLElement через BattlefieldCanvas.
- Battlefield canvas использует только реальные методы battlefield store.
- Убрана зелёная заливка, которая перекрывала forest-clearing.png.
- Террейн grass снова использует базовый лесной фон.
- Остальные terrain используют существующие текстуры.
- Движение токенов работает через getTokenMoveInfo() и moveToken().
- Выбор токена и drag разделены: обычный клик не считается drag.
- Player control mode сохраняет проверку текущего участника и хода.
- Movement preview использует существующую механику пути/стоимости/ограничений store.
- Line of Sight / cover и tactical preview сохранены.
- Opportunity Attack остаётся внутри существующей moveToken() логики store.
- Удалены неиспользуемые drag helper-функции из canvas composable.
- Fullscreen listener сохранён в координаторе Battlefield.vue.

Статические проверки:

- Все app/**/*.js проходят `node --check`.
- Для BattlefieldCanvas.js и Battlefield.vue нет вызовов отсутствующих методов battlefield store.
- Известные ошибочные API getTerrainAt/getMovementPreview/getMovementCost/canMoveTokenTo/moveTokenAlongPath/canPlaceObjectAt/getTokenMovementRange не используются.

Примечание по локальной проверке production build:

В рабочей среде архива отсутствовала platform-specific native binding rolldown для Linux. Это зависимость окружения, не исходного кода проекта. На Windows после распаковки проекта используйте `npm install`, затем `npm run dev`.
