from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

import models
import schemas
from database import Base, engine, get_db


# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Todo API")

app.add_middleware(
	CORSMiddleware,
	allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)


@app.get("/health")
def health_check():
	return {"status": "ok"}


@app.get("/todos", response_model=List[schemas.TodoOut])
def list_todos(db: Session = Depends(get_db)):
	return db.query(models.Todo).order_by(models.Todo.id.desc()).all()


@app.post("/todos", response_model=schemas.TodoOut, status_code=status.HTTP_201_CREATED)
def create_todo(todo: schemas.TodoCreate, db: Session = Depends(get_db)):
	obj = models.Todo(title=todo.title, description=todo.description, is_completed=todo.is_completed)
	db.add(obj)
	db.commit()
	db.refresh(obj)
	return obj


@app.get("/todos/{todo_id}", response_model=schemas.TodoOut)
def get_todo(todo_id: int, db: Session = Depends(get_db)):
	obj = db.query(models.Todo).filter(models.Todo.id == todo_id).first()
	if not obj:
		raise HTTPException(status_code=404, detail="Todo not found")
	return obj


@app.put("/todos/{todo_id}", response_model=schemas.TodoOut)
def update_todo(todo_id: int, update: schemas.TodoUpdate, db: Session = Depends(get_db)):
	obj = db.query(models.Todo).filter(models.Todo.id == todo_id).first()
	if not obj:
		raise HTTPException(status_code=404, detail="Todo not found")
	for field, value in update.model_dump(exclude_unset=True).items():
		setattr(obj, field, value)
	db.commit()
	db.refresh(obj)
	return obj


@app.delete("/todos/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_todo(todo_id: int, db: Session = Depends(get_db)):
	obj = db.query(models.Todo).filter(models.Todo.id == todo_id).first()
	if not obj:
		raise HTTPException(status_code=404, detail="Todo not found")
	db.delete(obj)
	db.commit()
	return None


