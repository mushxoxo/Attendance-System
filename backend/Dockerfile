# ─── Build stage ────────────────────────────────────────────────────
FROM python:3.11-slim AS base

# System deps for DeepFace / OpenCV
RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 \
    libsm6 \
    libxrender1 \
    libxext6 \
    libgl1 \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies first (layer cached unless requirements changes)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download the VGG-Face model weights during build so the container
# starts instantly without downloading ~600MB at runtime on Cloud Run.
RUN python -c "from deepface.models.facial_recognition import VGGFace; VGGFace.loadModel()" || \
    python -c "from deepface import DeepFace; DeepFace.build_model('VGG-Face')" || true

# Copy app code
COPY . .

# Create required directories
RUN mkdir -p uploads ref_Photos attendance_records temp

# Cloud Run listens on PORT env var (default 8080)
ENV PORT=8080

EXPOSE 8080

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT}"]
