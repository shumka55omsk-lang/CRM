# CRM — окончательное исправление SyntaxError

Исправлено:
- ошибка `Uncaught SyntaxError: Invalid or unexpected token`;
- причина была во вложенном template string внутри HTML-шаблона печати листов раскроя;
- вложенный шаблон заменён на безопасную строковую сборку;
- JavaScript проверен через `node --check` без ошибок.
