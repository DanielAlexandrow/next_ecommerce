#!/bin/bash

# Kill any existing ChromeDriver processes (Windows compatible)
echo "Cleaning up existing ChromeDriver processes..."
if [ -n "$WINDIR" ]; then
    taskkill //F //IM chromedriver.exe //T 2>/dev/null || true
    taskkill //F //IM chrome.exe //T 2>/dev/null || true
else
    pkill -f chromedriver || true
fi

echo "Installing ChromeDriver..."
# Try to detect Chrome version on Windows
if [ -n "$WINDIR" ]; then
    CHROME_PATH="/c/Program Files/Google/Chrome/Application/chrome.exe"
    if [ -f "$CHROME_PATH" ]; then
        CHROME_VERSION=$("$CHROME_PATH" --version | cut -d ' ' -f 3)
        echo "Detected Chrome version: $CHROME_VERSION"
    else
        echo "Chrome not found. Please install Google Chrome first."
        echo "Download from: https://www.google.com/chrome/"
        exit 1
    fi
fi

if [ ! -z "$CHROME_VERSION" ]; then
    php artisan dusk:chrome-driver $CHROME_VERSION
else
    php artisan dusk:chrome-driver --detect
fi

echo "Making ChromeDriver executable..."
chmod -R 0755 vendor/laravel/dusk/bin/

echo "Setting up environment for Dusk..."
# Windows doesn't need DISPLAY variable
if [ -z "$WINDIR" ]; then
    export DISPLAY=:0
fi

echo "Starting ChromeDriver..."
if [ -n "$WINDIR" ]; then
    START /B vendor\\laravel\\dusk\\bin\\chromedriver-win.exe
    CHROMEDRIVER_PID=$!
else
    ./vendor/laravel/dusk/bin/chromedriver-linux > /dev/null 2>&1 &
    CHROMEDRIVER_PID=$!
fi

# Wait a moment to ensure ChromeDriver starts
sleep 2

# Check if ChromeDriver is running (Windows compatible)
if [ -n "$WINDIR" ]; then
    tasklist | grep -q "chromedriver" && RUNNING=1 || RUNNING=0
else
    ps -p $CHROMEDRIVER_PID > /dev/null && RUNNING=1 || RUNNING=0
fi

if [ "$RUNNING" -eq 1 ]; then
    echo "ChromeDriver started successfully"
else
    echo "ERROR: ChromeDriver failed to start"
    exit 1
fi

echo "Setup complete. You can now run Dusk tests."
echo "Example: php artisan dusk tests/Browser/ProductCreationTest.php"
php artisan dusk