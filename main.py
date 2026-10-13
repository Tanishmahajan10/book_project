
# Import FastAPI tools for routing, dependency injection, status codes, and errors
from fastapi import FastAPI, Depends, status, HTTPException

# Import SQLAlchemy's Session to interact with the database
from sqlalchemy.orm import Session

# Import our database models and connection setup
import models
from database import engine, SessionLocal

# Import the Pydantic schema used to validate incoming book data
from schemas import BookRequest

from fastapi.middleware.cors import CORSMiddleware

# Create the FastAPI application
app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5500",
        "http://127.0.0.1:5500"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Create database tables if they do not already exist
models.Base.metadata.create_all(bind=engine)


# Dependency: create a database session for each request
def get_db():
    db = SessionLocal()
    try:
        # Provide the session to the endpoint
        yield db
    finally:
        # Always close the session after the request
        db.close()


# -------------------- HOME --------------------

@app.get("/")
def home():
    # Return a welcome message
    return {"message": "Welcome to the Books API"}


# -------------------- GET ALL BOOKS --------------------

@app.get("/books")
def get_books(db: Session = Depends(get_db)):
    # Retrieve all books from the database
    return db.query(models.Books).all()


# -------------------- CREATE A BOOK --------------------

@app.post("/books", status_code=status.HTTP_201_CREATED)
def create_book(
    book_request: BookRequest,
    db: Session = Depends(get_db)
):
    # Convert the validated Pydantic data into a SQLAlchemy model
    new_book = models.Books(**book_request.model_dump())

    # Stage the new book for insertion
    db.add(new_book)

    # Save the new book to the database
    db.commit()

    # Retrieve database-generated values, such as the new ID
    db.refresh(new_book)

    # Return the created book
    return new_book


# -------------------- GET BOOKS BY RATING --------------------

# Keep specific routes above the dynamic /books/{book_id} route
@app.get("/books/rated")
def get_books_by_rating(
    book_rating: int,
    db: Session = Depends(get_db)
):
    # Find all books whose rating matches the query parameter
    books = (
        db.query(models.Books)
        .filter(models.Books.rating == book_rating)
        .all()
    )

    # Return 404 if no matching books exist
    if not books:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No books found with rating {book_rating}"
        )

    return books


# -------------------- GET BOOKS BY PUBLICATION YEAR --------------------

@app.get("/books/published/{published_year}")
def get_books_by_year(
    published_year: int,
    db: Session = Depends(get_db)
):
    # Find all books published in the requested year
    books = (
        db.query(models.Books)
        .filter(models.Books.published_year == published_year)
        .all()
    )

    # Return 404 if no books match that year
    if not books:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No books found for the year {published_year}"
        )

    return books


# -------------------- GET ONE BOOK BY ID --------------------

@app.get("/books/{book_id}")
def get_book_by_id(
    book_id: int,
    db: Session = Depends(get_db)
):
    # Search for a book with the requested ID
    book = (
        db.query(models.Books)
        .filter(models.Books.id == book_id)
        .first()
    )

    # If the book does not exist, return 404
    if book is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Book with ID {book_id} not found"
        )

    return book


# -------------------- UPDATE A BOOK --------------------

@app.put("/books/{book_id}")
def update_book(
    book_id: int,
    book_request: BookRequest,
    db: Session = Depends(get_db)
):
    # Find the existing book in the database
    book = (
        db.query(models.Books)
        .filter(models.Books.id == book_id)
        .first()
    )

    # Stop if the requested book does not exist
    if book is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Book with ID {book_id} not found"
        )

    # Replace the existing values with the validated request values
    book.title = book_request.title
    book.author = book_request.author
    book.description = book_request.description
    book.rating = book_request.rating
    book.published_year = book_request.published_year

    # Persist the updated fields
    db.commit()

    # Reload the current database values
    db.refresh(book)

    # Return the updated book
    return book


# -------------------- DELETE A BOOK --------------------

@app.delete(
    "/books/{book_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_book(
    book_id: int,
    db: Session = Depends(get_db)
):
    # Find the book that needs to be deleted
    book = (
        db.query(models.Books)
        .filter(models.Books.id == book_id)
        .first()
    )

    # Return 404 if the requested book does not exist
    if book is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Book with ID {book_id} not found"
        )

    # Mark the record for deletion
    db.delete(book)

    # Permanently commit the deletion
    db.commit()

    # HTTP 204 responses must not contain a response body
    return None
