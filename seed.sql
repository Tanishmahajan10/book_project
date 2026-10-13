-- Sample data for the Books Library
-- Run AFTER starting the app once (uvicorn creates the booksList table):
--   sqlite3 books.db < seed.sql
 
DELETE FROM booksList;
 
INSERT INTO booksList (id, title, author, description, rating, published_year) VALUES
(1, 'The Catcher in the Rye', 'J. D. Salinger', 'A teenager wanders New York City after being expelled from prep school.', 4, 1951),
(2, 'To Kill a Mockingbird', 'Harper Lee', 'A young girl witnesses her father defend a Black man falsely accused in the American South.', 5, 1960),
(3, 'Dune', 'Frank Herbert', 'A noble family takes control of a desert planet that holds the most valuable resource in the universe.', 5, 1965),
(4, 'The Hitchhiker''s Guide to the Galaxy', 'Douglas Adams', 'A comic science fiction adventure that begins when Earth is destroyed to make way for a hyperspace bypass.', 4, 1979),
(5, 'Life of Pi', 'Yann Martel', 'A boy survives a shipwreck and spends 227 days adrift on a lifeboat with a Bengal tiger.', 4, 2001),
(6, 'The Kite Runner', 'Khaled Hosseini', 'A story of friendship, guilt, and redemption set against the backdrop of Afghanistan.', 5, 2003),
(7, 'Sapiens', 'Yuval Noah Harari', 'A brief history of humankind, from early humans to the modern age.', 4, 2011),
(8, 'Atomic Habits', 'James Clear', 'A practical guide to building good habits and breaking bad ones through small changes.', 5, 2018);
 