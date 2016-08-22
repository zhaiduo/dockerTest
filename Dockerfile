# Dockerfile.alpine-mini
# FROM index.tenxcloud.com/docker_library/alpine:edge
FROM quay.io/mhart/alpine-node

# Create app directory and bundle app source
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . /usr/src/app

# Install node.js and app dependencies
# echo '@edge http://nl.alpinelinux.org/alpine/edge/main' >> /etc/apk/repositories \
# apk update && apk upgrade \
# apk add --no-cache nodejs-lts@edge \

RUN apk update && apk upgrade && apk add bash \
  && npm cache clean -f \
  && npm install -g n \
  && n latest \
  && npm install \
  && rm -rf /tmp/* \
  && rm -rf /root/.npm/

# Expose port
EXPOSE 8080

CMD [ "node", "app.js" ]
