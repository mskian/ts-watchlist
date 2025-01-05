if ! tmux has-session -t watchlist 2>/dev/null; then
    tmux new-session -d -s watchlist 'node $HOME/ts-watchlist/dist/app.js'
fi