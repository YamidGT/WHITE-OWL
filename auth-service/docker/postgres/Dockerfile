FROM postgres:16

RUN apt-get update \
 && apt-get install -y \
    git \
    build-essential \
    postgresql-server-dev-16 \
    clang \
 && rm -rf /var/lib/apt/lists/*

# Instalación de la extensión necesaria
RUN git clone https://github.com/fboulnois/pg_uuidv7.git \
 && cd pg_uuidv7 \
 && make \
 && make install \
 && cd / \
 && rm -rf pg_uuidv7