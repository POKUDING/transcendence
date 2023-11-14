COMPOSE 	= ./docker-compose.yml

all: up

up:
	docker compose -f $(COMPOSE) up -d --build

down:
	docker compose -f $(COMPOSE) down

clean: down

fclean: 
	-docker compose -f $(COMPOSE) down -v --rmi all --remove-orphans
	-docker rm $(docker ps -a -q)
	-docker system prune -f -a 

re: fclean all

.PHONY: all up down clean fclean re	

# docker compose 옵션
# -v : 볼륨 삭제
# --rmi all : 모든 이미지 삭제
# --remove-orphans : 사용하지 않는 컨테이너 삭제

# docker 옵션
# $(docker ps -a -q) : 모든 컨테이너 삭제
# system prune : 사용하지 않는 모든 이미지, 컨테이너, 볼륨, 네트워크 삭제