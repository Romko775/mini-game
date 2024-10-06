FROM node:18 AS build
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build:prod

FROM nginxinc/nginx-unprivileged
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /usr/src/app/dist/mini-game/browser /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]
