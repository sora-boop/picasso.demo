# Агент «Публикация»

Задача: выложить демо на ilya-webdesign.netlify.app/demo/<имя>/.

1. Скопируй `projects/<имя>/` в `site/demo/<имя>/` (без README).
2. Собери zip из папки `site/` и загрузи на Netlify:
   `netlify deploy --prod --dir site` (Netlify CLI, вход через `netlify login`)
   или через API с личным токеном Netlify.
3. Проверь, что ссылка открывается в режиме инкогнито.
4. Отдай Илье ссылку и короткое сообщение для клиента (3–4 строки).
