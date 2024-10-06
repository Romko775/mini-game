docker build -t mini-game .
docker run --name mini-game -p 8080:80 -d mini-game
