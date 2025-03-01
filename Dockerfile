FROM quay.io/astrox11/xstro:latest
RUN git clone https://github.com/AstroX11/Xstro /root/xstro
WORKDIR /root/xstro/
RUN yarn install
RUN yarn build
RUN ["npm", "start"]