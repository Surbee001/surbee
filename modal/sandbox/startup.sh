#!/bin/bash
set -e

echo "Starting sandbox services..."

# Start FastAPI server in background with logs
echo "Starting FastAPI server..."
python /root/server.py > /tmp/fastapi.log 2>&1 &
FASTAPI_PID=$!
echo "FastAPI started with PID: $FASTAPI_PID"

# Start Next.js dev server in background with logs
echo "Starting Next.js dev server..."
cd /root/survey-app
pnpm dev --turbo -H 0.0.0.0 > /tmp/nextjs.log 2>&1 &
NEXT_PID=$!
echo "Next.js started with PID: $NEXT_PID"

# Give services a moment to start
sleep 3

# Check if processes are still running
echo "Checking if services are running..."
if ps -p $FASTAPI_PID > /dev/null; then
    echo "FastAPI process is running"
else
    echo "FastAPI process died! Log:"
    cat /tmp/fastapi.log
    exit 1
fi

if ps -p $NEXT_PID > /dev/null; then
    echo "Next.js process is running"
else
    echo "Next.js process died! Log:"
    cat /tmp/nextjs.log
    exit 1
fi

# Health check - wait for both services
echo "Waiting for services to be ready..."
FASTAPI_READY=false
NEXT_READY=false

for i in $(seq 1 60); do
    # Check FastAPI
    if [ "$FASTAPI_READY" = "false" ]; then
        if curl -s http://localhost:8000/heartbeat > /dev/null 2>&1; then
            echo "FastAPI is ready!"
            FASTAPI_READY=true
        fi
    fi

    # Check Next.js
    if [ "$NEXT_READY" = "false" ]; then
        if curl -s http://localhost:3000 > /dev/null 2>&1; then
            echo "Next.js is ready!"
            NEXT_READY=true
        fi
    fi

    # Both ready?
    if [ "$FASTAPI_READY" = "true" ] && [ "$NEXT_READY" = "true" ]; then
        echo "All services started successfully!"
        break
    fi

    if [ $i -eq 60 ]; then
        echo "Services failed to start after 60 attempts"
        echo "FastAPI log:"
        cat /tmp/fastapi.log
        echo "Next.js log:"
        cat /tmp/nextjs.log
        exit 1
    fi

    echo "Attempt $i/60: Waiting for services..."
    sleep 2
done

# Keep the script running
echo "Services are running. Keeping container alive..."
wait $FASTAPI_PID $NEXT_PID
