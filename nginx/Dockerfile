
FROM nginx:alpine

# Copy custom Nginx configuration file into the container
# This assumes you have a custom nginx.conf file in the same directory as this Dockerfile
COPY nginx.conf /etc/nginx/nginx.conf


# Expose ports
EXPOSE 80
EXPOSE 443

# Define the default command to run Nginx
CMD ["nginx", "-g", "daemon off;"]
