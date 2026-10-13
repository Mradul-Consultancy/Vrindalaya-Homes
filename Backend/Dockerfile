FROM python:3.12-slim

# Set work directory
WORKDIR /app

# Install uv (fast Python package manager)
RUN pip install --no-cache-dir uv

# Copy only dependency files first for caching
COPY pyproject.toml uv.lock ./

# Install dependencies (production only)
RUN uv sync --frozen

# Copy the rest of the backend source code
COPY . .

# Environment variables for Django
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Expose Django development server port (override in production)
EXPOSE 8000

# Default command runs the development server (replace with gunicorn in prod)
CMD ["uv", "run", "python", "backend/manage.py", "runserver", "0.0.0.0:8000"]

