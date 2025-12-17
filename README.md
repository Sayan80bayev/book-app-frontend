# Book App Frontend

Современное frontend-приложение для управления книгами и категориями,  
построенное на **Next.js**, **Apollo Client** и **Tailwind CSS**.

---

## Технологии

- **Фреймворк:** [Next.js 16](https://nextjs.org/) (App Router)
- **Язык:** [TypeScript](https://www.typescriptlang.org/)
- **Управление состоянием:** [Zustand](https://github.com/pmndrs/zustand)
- **GraphQL клиент:** [Apollo Client](https://www.apollographql.com/docs/react/)
- **Стилизация:** [Tailwind CSS 4](https://tailwindcss.com/)
- **Среда выполнения:** Node.js

---

## Возможности

- **Аутентификация**
  - Страница логина
  - Страница регистрации пользователей

- **Управление книгами**
  - Создание новых книг
  - Просмотр деталей книги
  - Редактирование существующих книг

- **Управление категориями**
  - Создание новых категорий

- **Адаптивный дизайн**
  - Интерфейс корректно отображается на разных размерах экранов благодаря Tailwind CSS

---

## Структура проекта

```bash
src/
├── app/              # Страницы Next.js (App Router)
│   ├── book/         # Страницы книги (просмотр, редактирование)
│   ├── create-book/  # Страница создания книги
│   ├── login/        # Страница логина
│   ├── register/     # Страница регистрации
│   └── ...
├── components/       # Переиспользуемые UI-компоненты (например, Header)
├── graphql/          # GraphQL queries, mutations и типы
├── lib/              # Конфигурации библиотек (например, Apollo Client)
├── providers/        # React Context / Providers
└── stores/           # Глобальное состояние (Zustand)