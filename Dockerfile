FROM node:22-alpine AS studio-build
WORKDIR /workspace/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend ./
RUN npm run build

FROM alpine:3.16 AS engine-build
ARG THREADS="4"

WORKDIR /build
RUN apk add --no-cache git g++ build-base linux-headers cmake python3 \
    curl-dev rapidjson-dev pcre2-dev yaml-cpp-dev

RUN git clone --no-checkout https://github.com/ftk/quickjspp.git && \
    cd quickjspp && \
    git fetch origin 0c00c48895919fc02da3f191a2da06addeb07f09 && \
    git checkout 0c00c48895919fc02da3f191a2da06addeb07f09 && \
    git submodule update --init && \
    cmake -DCMAKE_BUILD_TYPE=Release . && \
    make quickjs -j $THREADS && \
    install -d /usr/lib/quickjs/ && \
    install -m644 quickjs/libquickjs.a /usr/lib/quickjs/ && \
    install -d /usr/include/quickjs/ && \
    install -m644 quickjs/quickjs.h quickjs/quickjs-libc.h /usr/include/quickjs/ && \
    install -m644 quickjspp.hpp /usr/include

RUN git clone https://github.com/PerMalmberg/libcron --depth=1 && \
    cd libcron && \
    git submodule update --init && \
    cmake -DCMAKE_BUILD_TYPE=Release . && \
    make libcron -j $THREADS && \
    install -m644 libcron/out/Release/liblibcron.a /usr/lib/ && \
    install -d /usr/include/libcron/ && \
    install -m644 libcron/include/libcron/* /usr/include/libcron/ && \
    install -d /usr/include/date/ && \
    install -m644 libcron/externals/date/include/date/* /usr/include/date/

RUN git clone https://github.com/ToruNiina/toml11 --branch="v4.3.0" --depth=1 && \
    cd toml11 && \
    cmake -DCMAKE_CXX_STANDARD=11 . && \
    make install -j $THREADS

COPY engine /build/engine
WORKDIR /build/engine
RUN python3 -m ensurepip && \
    python3 -m pip install gitpython && \
    python3 scripts/update_rules.py -c scripts/rules_config.conf && \
    cmake -DCMAKE_BUILD_TYPE=Release . && \
    make -j $THREADS

FROM node:22-alpine
WORKDIR /app

RUN apk add --no-cache pcre2 libcurl yaml-cpp tini

COPY package.json ./
COPY backend ./backend
COPY backend/engine-profile ./runtime/engine
COPY --from=engine-build /build/engine/subconverter ./runtime/engine/subconverter
COPY --from=engine-build /build/engine/base ./runtime/engine/base
COPY --from=engine-build /usr/lib/libyaml-cpp.so.0.7 /usr/lib/libyaml-cpp.so.0.7
COPY --from=engine-build /usr/lib/libyaml-cpp.so.0.7.0 /usr/lib/libyaml-cpp.so.0.7.0
COPY --from=studio-build /workspace/frontend/dist ./public

RUN mkdir -p /app/data /app/runtime/engine/myconfig /app/runtime/engine/snippets && \
    cp /app/runtime/engine/a-list.txt /app/runtime/engine/myconfig/a-list.txt && \
    cp /app/runtime/engine/node_filter_script.js /app/runtime/engine/myconfig/node_filter_script.js && \
    chmod +x /app/runtime/engine/subconverter

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "backend/index.mjs"]
