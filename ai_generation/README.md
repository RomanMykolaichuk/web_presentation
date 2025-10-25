# AI Generation — Генерація JSON‑презентацій

Окремий Python‑проєкт для автоматичної генерації структури слайдів (JSON) агентним підходом із урахуванням ваших шаблонів та тем з основного проєкту. Може працювати онлайн (Gemini) або офлайн (stub). Вихід сумісний із веб‑презентацією у корені (`index.html`).

## Можливості

- Генерація масиву слайдів із потрібними `layout_key` та `fields`.
- Керування кількістю слайдів, мовою, виводом у файл.
- Працює онлайн (через Gemini API) або офлайн (stub‑режим без ключа).

## Швидкий старт

1. Створіть віртуальне середовище та встановіть залежності:

- Windows (PowerShell)

```
.\.venv\Scrip
python -m venv .venvts\Activate.ps1
pip install -r requirements.txt
```

- macOS/Linux

```
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

2. Заповніть змінні середовища:

- Скопіюйте `.env.example` у `.env` і пропишіть ключ API Google AI Studio:

```
cp .env.example .env    # (Windows PowerShell: Copy-Item .env.example .env)
```

Вкажіть значення `GOOGLE_API_KEY=...`.

3. Запустіть генерацію (агент читає ваші `data/templates.json` і `data/themes.json`):

```
# Вивантаження у цю ж папку data/: slides_<slug>.json
python cli.py --topic "Стратегія запуску продукту" --data-dir ../data --max-slides 8 --lang uk

# Або з промпту у файлі:
python cli.py --prompt-file examples/prompt_ua.md --data-dir ../data --lang uk

# Явно вказати файли (перевизначає --data-dir):
python cli.py --topic "AI у освіті" --templates ../data/templates.json --themes ../data/themes.json

# Офлайн (без ключа) — stub-генерація з урахуванням шаблонів:
python cli.py --topic "Аналітика маркетингу" --data-dir ../data --offline --verbose
```

4. Де утворюється файл:

- За замовчуванням — у тій самій папці, де лежить `templates.json`/`themes.json` (зазвичай `../data`).
- Можна вказати конкретне місце через `--out`.

## Формат виходу

Вихід — JSON‑об’єкт із ключем `slides`:

```
{
  "slides": [
    { "layout_key": "Title Slide", "fields": { "title": "...", "subtitle": "..." } },
    { "layout_key": "Title and Content", "fields": { "title": "...", "body": ["...", "..."] } }
  ]
}
```

Сумісні `layout_key`:

- Title Slide
- Title and Content
- Image Only
- Video Slide
- Markmap Export
- Agenda / Outline Slide
- Text + Image Slide
- Comparison Slide
- Chart / Graph Slide
- Process / Flow Slide
- Problem‑Solution Slide
- Quote / Key Message Slide
- Team / Organizational Slide
- Summary / Thank You Slide

## Налаштування через `.env`

- `GOOGLE_API_KEY` — ключ Google AI Studio (обовʼязково для онлайн‑генерації).
- `MODEL` — модель Gemini (за замовчуванням `gemini-1.5-pro`).
- `TIMEOUT` — тайм‑аут у секундах (необовʼязково).

## Поради

- Починайте з короткого промпту, додавайте обмеження (кількість слайдів, стиль, tone).
- Уникайте надмірно довгих пунктів — 3–6 bullet‑ів на слайд.
- Зберігайте медіа у `assets/` і посилайтесь на них як `{ "src": "example.png" }`.

## Ліцензія

Додайте свої умови або використовуйте прийнятну для вашого проєкту.

## Обмеження кількості запитів

- Керуйте кількістю звернень до моделі прапорцем `--max-calls` (0..3):
  - 3 (типово): Planner + Drafter + Reviewer — 3 виклики до Gemini.
  - 2: Planner + Drafter — ревʼю локальне (евристичне).
  - 1: Локальний план → Drafter — 1 виклик, ревʼю локальне.
  - 0: Повністю офлайн (stub).

Приклади:
```
python cli.py --topic "AI у освіті" --data-dir ../data --max-calls 1
python cli.py --topic "AI у освіті" --data-dir ../data --max-calls 2
```

## Fallback на Groq
- Якщо під час кроків Planner/Drafter/Reviewer стається збій на Gemini, генератор автоматично пробує Groq (за наявності `GROQ_API_KEY` у `.env`).
- Налаштування за замовчуванням: `GROQ_MODEL=llama3-70b-8192` (можете змінити у `.env`).
- Якщо і Groq недоступний, використовується локальний stub + евристичне ревʼю і валідація Pydantic.
