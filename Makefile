.PHONY: dev

dev:
	cd frontend && ng serve & \
	cd backend && npm run start
