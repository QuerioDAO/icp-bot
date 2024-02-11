FROM node:18.17.0-alpine

WORKDIR '/app'

# Copy package.json (and package-lock.json)
COPY package*.json ./

RUN npm install

COPY . .

CMD ["npm", "run", "start"]