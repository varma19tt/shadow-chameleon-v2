FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies with clear output
RUN echo "Installing dependencies..." && \
    npm install --verbose

# Copy source code
COPY . .

# Expose port
EXPOSE 5173

# Start development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
