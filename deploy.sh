#!/bin/bash

# Build the application
echo "Building the application..."
npm run build

# Ensure the build was successful
if [ $? -eq 0 ]; then
    echo "Build successful!"
else
    echo "Build failed!"
    exit 1
fi

# Add deployment commands here based on your hosting provider
# For example, if using AWS S3:
# aws s3 sync build/ s3://your-bucket-name

echo "Deployment complete!"
