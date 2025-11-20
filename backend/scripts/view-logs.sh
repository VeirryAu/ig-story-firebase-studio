#!/bin/bash

# Script to view and analyze Docker logs for Forecap API

set -e

CONTAINER_NAME="forecap-api"
COMPOSE_FILE="docker-compose.yml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if production flag is set
if [ "$1" = "prod" ] || [ "$1" = "production" ]; then
    COMPOSE_FILE="docker-compose.production.yml"
    echo -e "${YELLOW}Using production compose file${NC}"
fi

# Function to show help
show_help() {
    echo "Forecap API Log Viewer"
    echo ""
    echo "Usage: ./view-logs.sh [command] [options]"
    echo ""
    echo "Commands:"
    echo "  follow, -f          Follow logs in real-time (default)"
    echo "  errors, -e          Show errors only"
    echo "  tail, -t [N]        Show last N lines (default: 100)"
    echo "  since [TIME]        Show logs since time (e.g., '1h', '30m', '2025-11-19T10:00:00')"
    echo "  user [ID]           Show logs for specific user ID"
    echo "  slow                Show slow requests (>1s)"
    echo "  export [FILE]       Export logs to file"
    echo "  stats               Show error statistics"
    echo "  help, -h            Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./view-logs.sh                          # Follow logs"
    echo "  ./view-logs.sh errors                   # Show errors only"
    echo "  ./view-logs.sh tail 200                # Last 200 lines"
    echo "  ./view-logs.sh since 1h                 # Last hour"
    echo "  ./view-logs.sh user 12345               # User-specific logs"
    echo "  ./view-logs.sh export api.log           # Export to file"
    echo "  ./view-logs.sh prod errors              # Production errors"
}

# Check if container is running
if ! docker compose -f $COMPOSE_FILE ps | grep -q "$CONTAINER_NAME"; then
    echo -e "${RED}Error: Container $CONTAINER_NAME is not running${NC}"
    echo "Start it with: docker compose -f $COMPOSE_FILE up -d"
    exit 1
fi

# Parse command
COMMAND=${1:-follow}

case $COMMAND in
    follow|-f)
        echo -e "${GREEN}Following logs for $CONTAINER_NAME...${NC}"
        echo "Press Ctrl+C to stop"
        docker compose -f $COMPOSE_FILE logs -f api
        ;;
    
    errors|-e)
        echo -e "${RED}Showing errors only...${NC}"
        docker compose -f $COMPOSE_FILE logs api | grep -i '"level":"ERROR"'
        ;;
    
    tail|-t)
        LINES=${2:-100}
        echo -e "${GREEN}Showing last $LINES lines...${NC}"
        docker compose -f $COMPOSE_FILE logs --tail=$LINES api
        ;;
    
    since)
        TIME=${2:-1h}
        echo -e "${GREEN}Showing logs since $TIME...${NC}"
        docker compose -f $COMPOSE_FILE logs --since $TIME api
        ;;
    
    user)
        USER_ID=${2}
        if [ -z "$USER_ID" ]; then
            echo -e "${RED}Error: User ID required${NC}"
            echo "Usage: ./view-logs.sh user [USER_ID]"
            exit 1
        fi
        echo -e "${GREEN}Showing logs for user $USER_ID...${NC}"
        docker compose -f $COMPOSE_FILE logs api | grep "\"userId\":$USER_ID"
        ;;
    
    slow)
        echo -e "${YELLOW}Showing slow requests (>1s)...${NC}"
        docker compose -f $COMPOSE_FILE logs api | grep '"level":"WARN"' | grep '"duration"' | \
            grep -E '"duration":[0-9]{4,}' || echo "No slow requests found"
        ;;
    
    export)
        FILE=${2:-api.log}
        echo -e "${GREEN}Exporting logs to $FILE...${NC}"
        docker compose -f $COMPOSE_FILE logs api > $FILE
        echo "Logs exported to $FILE"
        ;;
    
    stats)
        echo -e "${GREEN}Error Statistics:${NC}"
        echo ""
        echo "Total Errors:"
        docker compose -f $COMPOSE_FILE logs api | grep -c '"level":"ERROR"' || echo "0"
        echo ""
        echo "Errors by Operation:"
        docker compose -f $COMPOSE_FILE logs api | grep '"level":"ERROR"' | \
            grep -o '"operation":"[^"]*"' | sort | uniq -c | sort -rn
        echo ""
        echo "Most Common Error Messages:"
        docker compose -f $COMPOSE_FILE logs api | grep '"level":"ERROR"' | \
            grep -o '"message":"[^"]*"' | sort | uniq -c | sort -rn | head -10
        ;;
    
    help|-h|--help)
        show_help
        ;;
    
    *)
        echo -e "${RED}Unknown command: $COMMAND${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac

