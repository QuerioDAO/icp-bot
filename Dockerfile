FROM node:24-alpine

WORKDIR '/app'

# Copy package.json (and package-lock.json)
COPY package*.json ./

RUN npm install

COPY . .

CMD ["npm", "run", "start"]