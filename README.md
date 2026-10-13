# Books Library

A CRUD app for managing a book collection, built with FastAPI, SQLAlchemy and SQLite, with a plain HTML/JavaScript frontend.

## Features

- View, add, edit and delete books
- Search by title or author
- Filter by rating and publication year
- Validation with Pydantic and database CHECK constraints
- Auto-generated API docs at `/docs`

## Tech Stack

| Layer      | Technology            |
|------------|-----------------------|
| Backend    | FastAPI               |
| ORM        | SQLAlchemy            |
| Validation | Pydantic              |
| Database   | SQLite                |
| Frontend   | HTML, CSS, JavaScript |
| Server     | Uvicorn               |

## Project Structure

```
books_project/
├── main.py               # FastAPI app and routes
├── models.py             # SQLAlchemy model
├── schemas.py            # Pydantic schema
├── database.py           # Database connection
├── books_frontend.html   # Frontend
├── seed.sql              # Sample data
├── requirements.txt
└── README.md
```
## Requirements

- Python 3.9 or newer
- pip

Python packages:

| Package             | Purpose                         |
|---------------------|---------------------------------|
| `fastapi`           | Web framework for the REST API  |
| `uvicorn`           | Server that runs the app        |
| `sqlalchemy`        | ORM for database access         |
| `pydantic v2`       | Request data validation         |

## Setup

1. Clone the repo and enter the folder:

```bash
git clone https://github.com/YOUR_USERNAME/books_project.git
cd books_project
```

2. Create a virtual environment and install dependencies:

```bash
python -m venv fastapienv
source fastapienv/bin/activate    # Windows: fastapienv\Scripts\activate
pip install -r requirements.txt
```

3. Start the API (this creates the `booksList` table):

```bash
uvicorn main:app --reload
```

4. Optional: load sample data:

```bash
sqlite3 books.db < seed.sql
```

5. Open `books_frontend.html` with VS Code Live Server (port 5500).

API docs: http://127.0.0.1:8000/docs

## API Endpoints

| Method | Endpoint                     | Description               | Success | Errors   |
|--------|------------------------------|---------------------------|---------|----------|
| GET    | `/`                          | Welcome message           | 200     | -        |
| GET    | `/books`                     | List all books            | 200     | -        |
| POST   | `/books`                     | Create a book             | 201     | 422      |
| GET    | `/books/rated?book_rating=5` | Books with a given rating | 200     | 404      |
| GET    | `/books/published/{year}`    | Books from a given year   | 200     | 404      |
| GET    | `/books/{book_id}`           | Get one book              | 200     | 404      |
| PUT    | `/books/{book_id}`           | Update a book             | 200     | 404, 422 |
| DELETE | `/books/{book_id}`           | Delete a book             | 204     | 404      |

Example `POST /books` body:

```json
{
  "title": "Dune",
  "author": "Frank Herbert",
  "description": "A noble family takes control of a desert planet.",
  "rating": 5,
  "published_year": 1965
}
```

## Validation Rules

| Field            | Type    | Rule                |
|------------------|---------|---------------------|
| `title`          | string  | 1 to 100 characters |
| `author`         | string  | 2 to 50 characters  |
| `description`    | string  | 5 to 500 characters |
| `rating`         | integer | 1 to 5              |
| `published_year` | integer | 1950 to 2026        |

## Database Schema

Table: `booksList`

| Column           | Type    | Constraints                  |
|------------------|---------|------------------------------|
| `id`             | INTEGER | Primary key                  |
| `title`          | TEXT    | NOT NULL                     |
| `author`         | TEXT    | NOT NULL                     |
| `description`    | TEXT    | NOT NULL                     |
| `rating`         | INTEGER | NOT NULL, CHECK 1 to 5       |
| `published_year` | INTEGER | NOT NULL, CHECK 1950 to 2026 |

Note: `create_all()` does not change an existing table. If you edit a constraint, delete `books.db` and restart the server.

