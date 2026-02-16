.PHONY: start build build-mac build-linux build-win clean help

# Start the app in development mode
start:
	@echo "Starting GrammarCheck..."
	npm start

# Build for all platforms (requires cross-platform build tools)
build:
	@echo "Building for all platforms..."
	npm run build
	@echo "Build complete! Check the 'dist' folder."

# Build for macOS (creates .dmg and .zip)
build-mac:
	@echo "Building for macOS..."
	npm run build:mac
	@echo "macOS build complete! Check the 'dist' folder."

# Build for Linux (creates AppImage and .deb)
build-linux:
	@echo "Building for Linux..."
	npm run build:linux
	@echo "Linux build complete! Check the 'dist' folder."

# Build for Windows (creates installer and portable .exe)
build-win:
	@echo "Building for Windows..."
	npm run build:win
	@echo "Windows build complete! Check the 'dist' folder."

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	rm -rf dist
	@echo "Clean complete!"

# Show help
help:
	@echo "Available commands:"
	@echo "  make start        - Start the app in development mode"
	@echo "  make build        - Build for all platforms"
	@echo "  make build-mac    - Build for macOS (DMG, ZIP)"
	@echo "  make build-linux  - Build for Linux (AppImage, DEB)"
	@echo "  make build-win    - Build for Windows (Installer, Portable)"
	@echo "  make clean        - Remove build artifacts"
	@echo ""
	@echo "Note: Building for other platforms may require additional setup:"
	@echo "  - macOS builds require macOS"
	@echo "  - Windows builds work best on Windows or with Wine on Linux/Mac"
