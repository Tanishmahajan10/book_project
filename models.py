from database import Base
from sqlalchemy import Column, Integer, String, CheckConstraint

class Books(Base):
    __tablename__ = 'booksList'

    id = Column(Integer, primary_key = True, index = True)
    title = Column(String)
    author = Column(String)
    description = Column(String)
    rating = Column(Integer)
    published_year = Column(
        Integer,
        CheckConstraint(
            "published_year >= 1950 AND published_year <= 2026",
            name="ck_books_published_year_range",
        ),
        nullable=False,
    )