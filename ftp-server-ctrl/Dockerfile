FROM node:14 

# Create app directory
WORKDIR usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

RUN mkdir temp

# Bundle app source inside Docker image
COPY . .

# Since app binds to port
EXPOSE 2008

# Define the command to run your app
CMD ["node", "index.js"]
