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

RUN apk update && apk upgrade && apk add --update openssl && apk add bash \
  && npm cache clean -f \
  && npm install -g n \
  && n latest \
  && npm install \
  && npm install forever -g \
  && rm -rf /tmp/* \
  && rm -rf /root/.npm/ \
  && cp example_config.js config.js \
  && mkdir -p db \
  && mkdir -p uploads

# Expose port
EXPOSE 8080

CMD [ "forever", "start", app.js" ]
