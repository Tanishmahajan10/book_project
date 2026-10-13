
from pydantic import BaseModel, Field


class BookRequest(BaseModel):
    title: str = Field(min_length=1, max_length=100)
    author: str = Field(min_length=2, max_length=50)
    description: str = Field(min_length=5, max_length=500)
    rating: int = Field(gt=0, le=5)
    published_year: int = Field(gt=1950, lt=2027)

    model_config = {
        "json_schema_extra": {
            "example": {
                "title": "A new book",
                "author": "Lion",
                "description": "A new description of a book",
                "rating": 5,
                "published_year": 2019
            }
        }
    }