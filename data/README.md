# Дані презентацій (`data/`)

У цій папці зберігаються приклади файлів зі слайдами, темами та шаблонами.

## Файли
- `slides_plan.json` — приклад презентації‑плану.
- `slides_ai_education.json` — приклад презентації про AI у освіті.
- `themes.json` — набір тем із CSS‑змінними (колір фону/тексту, акцент, шрифти тощо).
- `templates.json` — каталог шаблонів слайдів: ID, назва, `layout_key`, та `fieldsSchema` з підказками щодо полів.

## Формат слайду
Кожен слайд — це об’єкт з ключами `layout_key` і `fields`.

Приклад:
```
{
  "layout_key": "Text + Image Slide",
  "fields": {
    "title": "Заголовок",
    "body": ["Короткий пункт 1", "Короткий пункт 2"],
    "image": { "src": "example.png", "alt": "Опис", "pos": "right" }
  }
}
```

Типові `layout_key` та поля (див. також `templates.json`):
- Title Slide — `title`, `subtitle?`, `footer?`, `notes?`
- Title and Content — `title`, `body (string|string[])`, `side? {src}`
- Image Only — `title?`, `images: [ {src, alt?, fit?, w?} ]`
- Video Slide — `title?`, `videos: [ {src, controls?, autoplay?, loop?, muted?} ]`
- Agenda / Outline Slide — `title`, `items: string[]`, `footer?`
- Text + Image Slide — `title`, `body: string[]`, `image: {src, alt?, pos? (left|right)}`
- Comparison Slide — `title`, секції `a/b/c: string[]`, мітки `a_title/b_title/c_title?`
- Chart / Graph Slide — `title`, `chartImage: {src, alt?}`, `caption?`
- Process / Flow Slide — `title`, `steps: string[]`
- Problem‑Solution Slide — `title`, `problem: string[]`, `solution: string[]`
- Quote / Key Message Slide — `title?`, `quote`, `author?`, `photo? {src, alt?}`
- Team / Organizational Slide — `title`, `members: [{name, role, photo?}]`
- Summary / Thank You Slide — `title`, `points?`, `contacts?`, `qr? {src}`, `thanks?`

## Теми (`themes.json`)
Тема — це об’єкт:
```
{
  "id": "dark-blue",
  "name": "Dark Blue",
  "vars": {
    "--bg": "#0e0f13",
    "--fg": "#e9edf1",
    "--accent": "#4da3ff",
    "--muted": "#9aa4af",
    "--card": "#141824",
    "--line": "#2a2f3a",
    "fontFamily": "system-ui, Segoe UI, Roboto, Arial, sans-serif"
  }
}
```
Редагуйте теми у JSON або через вікно «Теми» в застосунку (імпорт/експорт підтримуються).

## Шаблони (`templates.json`)
Каталог із заготовками полів для різних `layout_key`. У застосунку відкрийте вікно «Шаблони», щоб створювати, редагувати, імпортувати/експортувати шаблони.

## Поради щодо контенту
- Тримайте пункти короткими (3–6 на слайд).
- Оптимізуйте зображення (щоб сторінка працювала швидко офлайн).
- Зберігайте JSON у кодуванні UTF‑8.

