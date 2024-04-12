# Creating multi-stage build for production
FROM node:18-alpine as build-backend
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories && apk update && apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev vips-dev > /dev/null 2>&1
ENV NODE_ENV=production

WORKDIR /opt/
COPY ./backend/package.json ./backend/yarn.lock ./
RUN yarn config set registry https://registry.npm.taobao.org/
RUN yarn config set network-timeout 600000 -g && yarn install --production
ENV PATH /opt/node_modules/.bin:$PATH
WORKDIR /opt/app
COPY ./backend/ .
RUN yarn build

FROM node:18-alpine as build-frontend
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories && apk update && apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev vips-dev > /dev/null 2>&1
ENV NODE_ENV=production

WORKDIR /opt/
COPY ./frontend/package.json ./frontend/yarn.lock ./
RUN yarn config set ignore-engines true
RUN yarn config set registry https://registry.npm.taobao.org/
RUN yarn config set network-timeout 600000 -g && yarn install --production
ENV PATH /opt/node_modules/.bin:$PATH
WORKDIR /opt/app
COPY ./frontend/ .
RUN yarn build

# Creating final production image
FROM node:18-alpine
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories && apk add --no-cache vips-dev
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /opt/
COPY --from=build-backend /opt/node_modules ./node_modules
WORKDIR /opt/app
COPY --from=build-backend /opt/app ./
COPY --from=build-frontend /opt/app/dist ./public/static
ENV PATH /opt/node_modules/.bin:$PATH

RUN chown -R node:node /opt/app
USER node
EXPOSE 1337
CMD ["yarn", "start"]
