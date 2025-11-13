# AWS Deployment Guide for MobileDev Backend

This guide will help you deploy the backend services to AWS and connect them to your frontend at `appdev.co.in`.

## Architecture Overview

You have 3 backend services to deploy:
1. **generate-app** - Generates Expo apps using AI
2. **build-apk** - Builds Android APKs using Expo EAS
3. **build-status** - Checks build status

## Prerequisites

- [ ] AWS Account with appropriate permissions
- [ ] AWS CLI installed and configured (`aws configure`)
- [ ] Docker installed
- [ ] Node.js 18+ installed
- [ ] Domain `appdev.co.in` with SSL certificate configured
- [ ] Gemini API key from Google AI Studio
- [ ] Expo account with EAS Build access token

## Option 1: Deploy with AWS Elastic Beanstalk (Recommended for Simplicity)

### Step 1: Install EB CLI

```bash
pip install awsebcli
```

### Step 2: Prepare Environment Variables

Create a `.env` file for each service:

```env
# For generate-app service
GEMINI_API_KEY=your_gemini_api_key_here
AWS_BUCKET_NAME=mobiledev-marketplace-apps
AWS_REGION=ap-south-1

# For build-apk service  
EXPO_ACCESS_TOKEN=your_expo_token_here
EXPO_PROJECT_ID=your_expo_project_id
AWS_BUCKET_NAME=mobiledev-marketplace-apps
AWS_REGION=ap-south-1
```

### Step 3: Create S3 Bucket

```bash
# Create S3 bucket for storing generated apps and APKs
aws s3 mb s3://mobiledev-marketplace-apps --region ap-south-1

# Make bucket publicly readable (for download URLs)
aws s3api put-bucket-policy --bucket mobiledev-marketplace-apps --policy '{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "PublicReadGetObject",
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::mobiledev-marketplace-apps/*"
  }]
}'

# Enable CORS
aws s3api put-bucket-cors --bucket mobiledev-marketplace-apps --cors-configuration '{
  "CORSRules": [{
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }]
}'
```

### Step 4: Set Up DynamoDB (Alternative to Firestore)

```bash
# Create tables for app history and builds
aws dynamodb create-table \
  --table-name app_history \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=userId,AttributeType=S \
  --key-schema \
    AttributeName=id,KeyType=HASH \
  --global-secondary-indexes \
    '[{"IndexName":"userId-index","KeySchema":[{"AttributeName":"userId","KeyType":"HASH"}],"Projection":{"ProjectionType":"ALL"},"ProvisionedThroughput":{"ReadCapacityUnits":5,"WriteCapacityUnits":5}}]' \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --region ap-south-1

aws dynamodb create-table \
  --table-name builds \
  --attribute-definitions \
    AttributeName=buildId,AttributeType=S \
    AttributeName=userId,AttributeType=S \
  --key-schema \
    AttributeName=buildId,KeyType=HASH \
  --global-secondary-indexes \
    '[{"IndexName":"userId-index","KeySchema":[{"AttributeName":"userId","KeyType":"HASH"}],"Projection":{"ProjectionType":"ALL"},"ProvisionedThroughput":{"ReadCapacityUnits":5,"WriteCapacityUnits":5}}]' \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --region ap-south-1
```

### Step 5: Deploy Each Service

For each service directory:

```bash
# Example for generate-app
cd gcp-backend/generate-app

# Initialize Elastic Beanstalk
eb init -p node.js-18 mobiledev-generate-app --region ap-south-1

# Create environment
eb create mobiledev-generate-app-prod --single

# Set environment variables
eb setenv GEMINI_API_KEY=your_key AWS_BUCKET_NAME=mobiledev-marketplace-apps AWS_REGION=ap-south-1

# Deploy
eb deploy
```

Repeat for `build-apk` and `build-status` services.

## Option 2: Deploy with AWS ECS + Fargate (Recommended for Production)

### Step 1: Create ECR Repositories

```bash
# Create repositories for each service
aws ecr create-repository --repository-name mobiledev/generate-app --region ap-south-1
aws ecr create-repository --repository-name mobiledev/build-apk --region ap-south-1
aws ecr create-repository --repository-name mobiledev/build-status --region ap-south-1

# Get login token
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.ap-south-1.amazonaws.com
```

### Step 2: Build and Push Docker Images

```bash
# For generate-app
cd gcp-backend/generate-app
docker build -t mobiledev/generate-app .
docker tag mobiledev/generate-app:latest YOUR_ACCOUNT_ID.dkr.ecr.ap-south-1.amazonaws.com/mobiledev/generate-app:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.ap-south-1.amazonaws.com/mobiledev/generate-app:latest

# Repeat for other services...
```

### Step 3: Create ECS Cluster

```bash
aws ecs create-cluster --cluster-name mobiledev-cluster --region ap-south-1
```

### Step 4: Create Task Definitions

Create `task-definition.json` for each service:

```json
{
  "family": "mobiledev-generate-app",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "containerDefinitions": [{
    "name": "generate-app",
    "image": "YOUR_ACCOUNT_ID.dkr.ecr.ap-south-1.amazonaws.com/mobiledev/generate-app:latest",
    "portMappings": [{
      "containerPort": 8080,
      "protocol": "tcp"
    }],
    "environment": [
      {"name": "GEMINI_API_KEY", "value": "your_key"},
      {"name": "AWS_BUCKET_NAME", "value": "mobiledev-marketplace-apps"},
      {"name": "AWS_REGION", "value": "ap-south-1"}
    ],
    "logConfiguration": {
      "logDriver": "awslogs",
      "options": {
        "awslogs-group": "/ecs/mobiledev-generate-app",
        "awslogs-region": "ap-south-1",
        "awslogs-stream-prefix": "ecs"
      }
    }
  }]
}
```

Register task definition:

```bash
aws ecs register-task-definition --cli-input-json file://task-definition.json
```

### Step 5: Create Application Load Balancer

```bash
# Create ALB
aws elbv2 create-load-balancer \
  --name mobiledev-alb \
  --subnets subnet-xxxxx subnet-yyyyy \
  --security-groups sg-xxxxx \
  --region ap-south-1

# Create target groups for each service
aws elbv2 create-target-group \
  --name mobiledev-generate-app-tg \
  --protocol HTTP \
  --port 8080 \
  --vpc-id vpc-xxxxx \
  --target-type ip \
  --health-check-path /health
```

### Step 6: Create ECS Services

```bash
aws ecs create-service \
  --cluster mobiledev-cluster \
  --service-name generate-app-service \
  --task-definition mobiledev-generate-app \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxxxx],securityGroups=[sg-xxxxx],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=generate-app,containerPort=8080"
```

## Option 3: Deploy with API Gateway + Lambda (Serverless)

This requires more code modifications but offers better cost optimization.

### Required Code Changes

You'll need to modify the Express apps to work with Lambda. Install `serverless-http`:

```bash
npm install serverless-http
```

Modify each `index.js`:

```javascript
const serverless = require('serverless-http');
// ... existing code ...
module.exports.handler = serverless(app);
```

Then deploy using Serverless Framework or AWS SAM.

## Configure CORS for appdev.co.in

Add CORS middleware to each service:

```javascript
const cors = require('cors');

app.use(cors({
  origin: 'https://appdev.co.in',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

## Update Frontend Configuration

Once deployed, update `.env` in your frontend:

```env
VITE_BACKEND_URL=https://appdev.co.in/api
```

Configure your API Gateway or ALB to:
1. Route `/api/generate-app` → generate-app service
2. Route `/api/build/start` → build-apk service  
3. Route `/api/build/status` → build-status service

## SSL Certificate Setup

1. Request certificate in AWS Certificate Manager for `appdev.co.in`
2. Attach certificate to your ALB or API Gateway
3. Configure DNS records to point to your ALB/API Gateway

## Required Code Modifications for AWS

You'll need to replace:
1. **Google Cloud Storage** → **AWS S3**
2. **Firestore** → **DynamoDB** or **RDS**
3. **Firebase Auth** → **AWS Cognito** or keep custom auth

Would you like me to:
1. Create AWS-specific versions of the backend code?
2. Help set up specific AWS services?
3. Create deployment scripts for your chosen option?

## Quick Start (If You Just Want It Working)

The fastest way:
```bash
# 1. Install EB CLI
pip install awsebcli

# 2. Deploy first service
cd gcp-backend/generate-app
eb init -p node.js-18 mobiledev-generate-app
eb create mobiledev-generate-app-prod
eb setenv GEMINI_API_KEY=your_key
eb open

# 3. Note the URL and update frontend
```

Then configure appdev.co.in to route traffic to these EB environments.
