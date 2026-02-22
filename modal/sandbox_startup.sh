#!/bin/bash
set -e

echo "Starting sandbox services..."

# Start FastAPI relay server (port 8000)
echo "Starting relay server..."
python3 /root/server.py > /tmp/relay.log 2>&1 &
RELAY_PID=$!
echo "Relay server PID: $RELAY_PID"

# Start Next.js dev server (port 3000)
echo "Starting Next.js dev server..."
cd /root/survey-app
pnpm dev > /tmp/nextjs.log 2>&1 &
NEXTJS_PID=$!
echo "Next.js PID: $NEXTJS_PID"

# Give services a moment to start
sleep 3

# Verify both processes are alive
if ! kill -0 $RELAY_PID 2>/dev/null; then
    echo "Relay server failed to start. Log:"
    cat /tmp/relay.log
    exit 1
fi

if ! kill -0 $NEXTJS_PID 2>/dev/null; then
    echo "Next.js dev server failed to start. Log:"
    cat /tmp/nextjs.log
    exit 1
fi

# Health check loop
echo "Waiting for services to be ready..."
RELAY_READY=false
NEXTJS_READY=false

for i in $(seq 1 30); do
    if [ "$RELAY_READY" != "true" ]; then
        if curl -sf http://localhost:8000/heartbeat > /dev/null 2>&1; then
            echo "Relay server is ready"
            RELAY_READY=true
        fi
    fi

    if [ "$NEXTJS_READY" != "true" ]; then
        if curl -sf http://localhost:3000 > /dev/null 2>&1; then
            echo "Next.js dev server is ready"
            NEXTJS_READY=true
        fi
    fi

    if [ "$RELAY_READY" = "true" ] && [ "$NEXTJS_READY" = "true" ]; then
        echo "All services started successfully"
        break
    fi

    if [ $i -eq 30 ]; then
        echo "Services failed to start after 30 attempts"
        echo "Relay log:"
        cat /tmp/relay.log
        echo "Next.js log:"
        cat /tmp/nextjs.log
        exit 1
    fi

    echo "Attempt $i/30: waiting..."
    sleep 2
done

# Keep container alive
echo "Services running. Keeping container alive..."
wait -n $RELAY_PID $NEXTJS_PID
