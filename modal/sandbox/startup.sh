#!/bin/bash
set -e

echo "Starting sandbox services..."

# Start FastAPI server in background
echo "Starting FastAPI server..."
python /root/server.py > /tmp/fastapi.log 2>&1 &
FASTAPI_PID=$!
echo "FastAPI PID: $FASTAPI_PID"

# Start Next.js dev server in background
echo "Starting Next.js dev server..."
cd /root/survey-app
npm run dev > /tmp/nextjs.log 2>&1 &
NEXTJS_PID=$!
echo "Next.js PID: $NEXTJS_PID"

# Wait for processes to start
sleep 3

# Check if processes are still running
if ! kill -0 $FASTAPI_PID 2>/dev/null; then
    echo "FastAPI server failed to start!"
    cat /tmp/fastapi.log
    exit 1
fi

if ! kill -0 $NEXTJS_PID 2>/dev/null; then
    echo "Next.js server failed to start!"
    cat /tmp/nextjs.log
    exit 1
fi

# Wait for FastAPI to be ready
echo "Waiting for FastAPI server..."
for i in $(seq 1 30); do
    if curl -s http://localhost:8000/heartbeat > /dev/null 2>&1; then
        echo "FastAPI server is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "FastAPI server failed to become ready!"
        cat /tmp/fastapi.log
        exit 1
    fi
    sleep 1
done

# Wait for Next.js to be ready
echo "Waiting for Next.js server..."
for i in $(seq 1 60); do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo "Next.js server is ready!"
        break
    fi
    if [ $i -eq 60 ]; then
        echo "Next.js server failed to become ready!"
        cat /tmp/nextjs.log
        exit 1
    fi
    sleep 2
done

echo "All services are running!"
echo "FastAPI: http://localhost:8000"
echo "Next.js: http://localhost:3000"

# Keep the script running
wait $FASTAPI_PID $NEXTJS_PID
